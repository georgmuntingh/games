import {
  parseFrontmatter,
  serialiseFrontmatter,
  parseBody,
  serialiseBody,
} from '../frontmatter.js';
import {
  slugify,
  uniqueSlug,
  parseDate,
  formatDate,
  parseEstimateHours,
  totalEstimateHours,
  taskFromMarkdown,
  taskToMarkdown,
  projectFromMarkdown,
  projectToMarkdown,
  buildBoard,
  boardToFiles,
  duplicateIds,
  sortProjects,
  visibleProjects,
  deleteProjectPlan,
  chooseBucket,
  getBucket,
  projectWindow,
  assignLevels,
  deriveStatus,
  indexById,
  allPeople,
  allProjectTags,
  filterTasks,
  buildEdges,
  projectPeople,
  syncGoalTasks,
  goalTaskId,
  goalLinks,
  mergeTaskInto,
  cyclicRefs,
  initialsOf,
  markWorking,
  trashFromMarkdown,
  trashToMarkdown,
  pushTrash,
  TRASH_LIMIT,
  canonicalise,
  sameFile,
} from '../model.js';
import { createStorage } from '../storage.js';
import {
  buildBrief,
  buildTaskBrief,
  buildContext,
  contextSections,
  countWords,
  CONTEXT_BLOCKS,
} from '../exporter.js';
import { parseJsonResponse, ACTIONS, askMessages, ASK_SYSTEM } from '../prompts.js';
import { createSseReader } from '../llm.js';
import { crc32, createZip } from '../zip.js';

/* ------------------------------------------------------------- harness */

const groups = [];
let group = null;

function describe(name) {
  group = { name, tests: [] };
  groups.push(group);
}

function test(name, fn) {
  group.tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'assertion failed');
}

function assertEqual(actual, expected, message) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${message ? `${message}: ` : ''}expected ${b}, got ${a}`);
}

function assertThrows(fn, message) {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(message || 'expected a throw');
}

/* --------------------------------------------------------- the corpus */

const DEMO = Object.fromEntries(
  Object.entries(
    import.meta.glob('../demo/*.md', { query: '?raw', import: 'default', eager: true })
  ).map(([path, text]) => [path.split('/').pop(), text])
);

/* ------------------------------------------------------- frontmatter */

describe('frontmatter');

test('parses scalars, booleans and flow lists', () => {
  const { data } = parseFrontmatter('---\na: hello\nb: true\nc: [x, y]\nd: 2026-09-14\n---\nbody\n');
  assertEqual(data, { a: 'hello', b: true, c: ['x', 'y'], d: '2026-09-14' });
});

test('parses block lists', () => {
  const { data } = parseFrontmatter('---\npeople:\n  - georg\n  - ada\n---\n');
  assertEqual(data.people, ['georg', 'ada']);
});

test('keeps the body verbatim', () => {
  const { body } = parseFrontmatter('---\na: 1\n---\nline one\n\nline two\n');
  assertEqual(body, 'line one\n\nline two\n');
});

test('a file without frontmatter is all body', () => {
  const { data, body } = parseFrontmatter('just text\n');
  assertEqual(data, {});
  assertEqual(body, 'just text\n');
});

test('quotes values that would otherwise change meaning', () => {
  const out = serialiseFrontmatter({ color: '#2563eb', title: 'a: b', flag: 'true' });
  assert(out.includes("color: '#2563eb'"), 'hash must be quoted');
  assert(out.includes("title: 'a: b'"), 'colon must be quoted');
  assert(out.includes("flag: 'true'"), 'a string "true" must not become a boolean');
});

test('unknown keys survive a round trip', () => {
  const src = '---\nid: x\ntitle: X\ndone: false\ncssclass: kanban\n---\n';
  const task = taskFromMarkdown('x.md', src);
  assertEqual(task.extra, { cssclass: 'kanban' });
  assert(taskToMarkdown(task).includes('cssclass: kanban'), 'extra key must be written back');
});

test('a project file separates its one-line goal from its free-form context', () => {
  const project = projectFromMarkdown(
    '_project-website.md',
    "---\nid: website\ntitle: Website relaunch\ngoal: Ship self-serve signup\npeople: [georg, ada]\nstart: 2026-08-01\nend: 2026-11-30\ncolor: '#2563eb'\n---\nStripe is set up.\n\n## Open questions\n- SOC2?\n"
  );
  assertEqual(project.id, 'website');
  assertEqual(project.color, '#2563eb');
  assertEqual(project.goal, 'Ship self-serve signup');
  assertEqual(project.people, ['georg', 'ada']);
  assertEqual(project.context, 'Stripe is set up.\n\n## Open questions\n- SOC2?');
});

test('context keeps its own headings and lists intact', () => {
  const src =
    '---\nid: x\ntitle: X\ngoal: G\n---\n## Constraints\n\n- one\n- two\n\n## Open questions\n\n- three\n';
  assertEqual(projectToMarkdown(projectFromMarkdown('_project-x.md', src)), src);
});

test('a project file written before the split keeps its body as context, not as a goal', () => {
  const legacy = projectFromMarkdown('_project-x.md', '---\nid: x\ntitle: X\n---\nOld body prose.\n');
  assertEqual(legacy.goal, '', 'nothing is guessed into the goal');
  assertEqual(legacy.context, 'Old body prose.');
});

test('a goal containing a colon survives serialisation', () => {
  const project = { id: 'x', title: 'X', goal: 'Ship it: end to end, no humans', people: [], context: '' };
  const back = projectFromMarkdown('_project-x.md', projectToMarkdown(project));
  assertEqual(back.goal, 'Ship it: end to end, no humans');
});

test('empty project fields are omitted rather than written blank', () => {
  const markdown = projectToMarkdown({ id: 'x', title: 'X', goal: '', people: [], context: '' });
  assert(!markdown.includes('goal:'), 'an empty goal must not be written');
  assert(!markdown.includes('people:'), 'an empty roster must not be written');
  assertEqual(markdown, '---\nid: x\ntitle: X\n---\n');
});

test('a project id falls back to the filename', () => {
  assertEqual(projectFromMarkdown('_project-q4-hiring.md', '---\ntitle: Q4\n---\n').id, 'q4-hiring');
});

test('splits and rebuilds a checklist', () => {
  const { notes, subtasks } = parseBody('Notes.\n\n- [x] one\n- [ ] two\n');
  assertEqual(notes, 'Notes.');
  assertEqual(subtasks, [
    { done: true, text: 'one' },
    { done: false, text: 'two' },
  ]);
  assertEqual(serialiseBody(notes, subtasks), 'Notes.\n\n- [x] one\n- [ ] two');
});

test('accepts * bullets and upper-case X', () => {
  const { subtasks } = parseBody('* [X] done thing\n');
  assertEqual(subtasks, [{ done: true, text: 'done thing' }]);
});

test('every demo file is a fixed point of parse -> serialise', () => {
  const files = boardToFiles(buildBoard(DEMO));
  const names = Object.keys(DEMO);
  assert(names.length >= 18, `expected the full corpus, got ${names.length}`);
  for (const name of names) {
    assertEqual(files[name], DEMO[name], `${name} did not round-trip`);
  }
});

test('empty optional keys are omitted rather than written blank', () => {
  const markdown = taskToMarkdown(taskFromMarkdown('x.md', '---\nid: x\ntitle: X\ndone: false\n---\n'));
  assert(!markdown.includes('due:'), 'an absent due date must not be written');
  assert(!markdown.includes('people:'), 'an empty people list must not be written');
  assert(markdown.includes('done: false'), 'done is always written');
});

/* --------------------------------------------------------------- ids */

describe('ids');

test('slugifies titles', () => {
  assertEqual(slugify('Design Review!'), 'design-review');
  assertEqual(slugify('  Ship  it  '), 'ship-it');
});

test('transliterates letters with no NFKD decomposition', () => {
  assertEqual(slugify('Réunion Ærø søk'), 'reunion-aero-sok');
});

test('never produces an empty slug', () => {
  assertEqual(slugify('!!!'), 'task');
});

test('suffixes on collision', () => {
  assertEqual(uniqueSlug('Design review', ['design-review']), 'design-review-2');
  assertEqual(uniqueSlug('Design review', ['design-review', 'design-review-2']), 'design-review-3');
  assertEqual(uniqueSlug('Design review', []), 'design-review');
});

/* ------------------------------------------------------ dates/estimates */

describe('dates and estimates');

test('parses and formats ISO dates in UTC', () => {
  assertEqual(formatDate(parseDate('2026-09-14')), '2026-09-14');
  assertEqual(parseDate(''), null);
  assertEqual(parseDate('not a date'), null);
});

test('parses durations into hours', () => {
  assertEqual(parseEstimateHours('2h'), 2);
  assertEqual(parseEstimateHours('3d'), 24);
  assertEqual(parseEstimateHours('1w'), 40);
  assertEqual(parseEstimateHours('1.5d'), 12);
});

test('free-form estimates are kept but not counted', () => {
  assertEqual(parseEstimateHours('a while'), null);
  assertEqual(totalEstimateHours([{ estimate: '1d' }, { estimate: 'ages' }, { estimate: '2h' }]), 10);
});

/* ------------------------------------------------------------ timeline */

describe('timeline');

const START = parseDate('2026-08-01');

test('bucket size follows the project span', () => {
  assertEqual(chooseBucket(START, parseDate('2026-08-20')).unit, 'day');
  assertEqual(chooseBucket(START, parseDate('2026-11-30')).unit, 'week');
  assertEqual(chooseBucket(START, parseDate('2028-08-01')).unit, 'month');
  assertEqual(chooseBucket(null, null).unit, 'week', 'falls back to weeks');
});

test('levels are fractional so the now-line can sit between them', () => {
  const week = getBucket('week');
  assertEqual(week.level(parseDate('2026-08-08'), START), 1);
  assert(Math.abs(week.level(parseDate('2026-08-05'), START) - 4 / 7) < 1e-9);
});

test('month levels follow the calendar, not a fixed width', () => {
  const month = getBucket('month');
  assertEqual(Math.floor(month.level(parseDate('2026-09-01'), START)), 1);
  assertEqual(Math.floor(month.level(parseDate('2027-01-31'), START)), 5);
});

test('undated tasks land in a tray below the last dated level', () => {
  const bucket = getBucket('week');
  const tasks = [
    { id: 'a', due: '2026-08-01' },
    { id: 'b', due: '2026-09-05' },
    { id: 'c', due: '' },
  ];
  const { levels, trayLevel } = assignLevels(tasks, { bucket, start: START });
  assertEqual(levels.get('a'), 0);
  assertEqual(levels.get('b'), 5);
  assertEqual(levels.get('c'), trayLevel);
  assert(trayLevel > 5, 'the tray sits below every dated task');
});

test('levels are shifted so the earliest task is level 0', () => {
  const bucket = getBucket('week');
  const { levels } = assignLevels([{ id: 'a', due: '2026-07-01' }], { bucket, start: START });
  assertEqual(levels.get('a'), 0, 'a task before the project start still lands at 0');
});

test('the window widens to cover tasks outside the declared dates', () => {
  const window = projectWindow(
    { start: '2026-08-01', end: '2026-08-31' },
    [{ due: '2026-12-25' }]
  );
  assertEqual(formatDate(window.end), '2026-12-25');
});

/* -------------------------------------------------------------- status */

describe('derived status');

const statusTasks = [
  { id: 'a', done: true, subtasks: [], blockedBy: [], due: '2026-01-01' },
  { id: 'b', done: false, subtasks: [{ done: true, text: '1' }, { done: false, text: '2' }], blockedBy: ['a'], due: '2030-01-01' },
  { id: 'c', done: false, subtasks: [], blockedBy: ['b'], due: '2020-01-01' },
];
const statusIndex = indexById(statusTasks);
const NOW = Date.UTC(2026, 0, 15);

test('progress comes from the checklist', () => {
  assertEqual(deriveStatus(statusTasks[1], statusIndex, NOW).ratio, 0.5);
  assertEqual(deriveStatus(statusTasks[1], statusIndex, NOW).checked, 1);
});

test('a completed task reads as fully done regardless of its checklist', () => {
  const status = deriveStatus({ ...statusTasks[1], done: true }, statusIndex, NOW);
  assertEqual(status.ratio, 1);
  assert(status.done);
});

test('blocked means an incomplete prerequisite', () => {
  assert(!deriveStatus(statusTasks[1], statusIndex, NOW).blocked, 'a is done, so b is free');
  assert(deriveStatus(statusTasks[2], statusIndex, NOW).blocked, 'b is open, so c is blocked');
});

test('overdue means past its deadline and not done', () => {
  assert(deriveStatus(statusTasks[2], statusIndex, NOW).overdue);
  assert(!deriveStatus(statusTasks[0], statusIndex, NOW).overdue, 'done work is never overdue');
  assert(!deriveStatus(statusTasks[1], statusIndex, NOW).overdue);
});

test('a task with no deadline is never overdue', () => {
  assert(!deriveStatus({ id: 'x', due: '', subtasks: [], blockedBy: [] }, statusIndex, NOW).overdue);
});

test('a reference to a task that does not exist does not block', () => {
  const task = { id: 'x', done: false, subtasks: [], blockedBy: ['ghost'], due: '' };
  assert(!deriveStatus(task, statusIndex, NOW).blocked);
});

/* ------------------------------------------------------------- filters */

describe('filters');

const board = buildBoard(DEMO);

test('the demo board loads two projects and every task', () => {
  assertEqual(board.projects.length, 2);
  assertEqual(board.tasks.length, Object.keys(DEMO).length - 2);
});

test('filtering by project keeps tasks tagged with it', () => {
  const website = filterTasks(board.tasks, { projectId: 'website' });
  assert(website.length > 10, 'the website project is the busy one');
  assert(website.every((t) => t.project.includes('website')));
  assert(website.some((t) => t.id === 'job-descriptions'), 'a task in two projects shows in both');
  assert(
    filterTasks(board.tasks, { projectId: 'q4-hiring' }).some((t) => t.id === 'job-descriptions')
  );
});

test('filtering by person is a union, not an intersection', () => {
  const both = filterTasks(board.tasks, { people: ['ada', 'sam'] });
  const ada = filterTasks(board.tasks, { people: ['ada'] });
  assert(both.length >= ada.length, 'adding a person can only widen the set');
  assert(both.every((t) => t.people.includes('ada') || t.people.includes('sam')));
});

test('hideDone drops completed work', () => {
  assert(filterTasks(board.tasks, { hideDone: true }).every((t) => !t.done));
});

test('an empty filter is the identity', () => {
  assertEqual(filterTasks(board.tasks, {}).length, board.tasks.length);
});

test('projectPeople marks roster members, task-only names and their open counts', () => {
  const project = { id: 'p', people: ['georg', 'kim'] };
  const tasks = [
    { id: 'a', project: ['p'], people: ['georg'], done: false },
    { id: 'b', project: ['p'], people: ['georg'], done: true },
    { id: 'c', project: ['p'], people: ['ada'], done: false },
    { id: 'd', project: ['other'], people: ['zoe'], done: false },
  ];
  const people = projectPeople(project, tasks);
  assertEqual(people.map((p) => p.name), ['georg', 'kim', 'ada'], 'roster first, then adopted');
  assertEqual(people.find((p) => p.name === 'georg'), { name: 'georg', inRoster: true, openTasks: 1 });
  assertEqual(people.find((p) => p.name === 'kim'), { name: 'kim', inRoster: true, openTasks: 0 });
  assertEqual(people.find((p) => p.name === 'ada'), { name: 'ada', inRoster: false, openTasks: 1 });
  assert(!people.some((p) => p.name === 'zoe'), 'people on other projects are not listed');
});

test('people and project tags are deduplicated and sorted', () => {
  assertEqual(allPeople(board.tasks), ['Georg', 'Oliver', 'Sverre']);
  assertEqual(allProjectTags(board.tasks), ['q4-hiring', 'website']);
});

/* --------------------------------------------------------------- edges */

describe('edges');

test('blocks runs prerequisite -> dependent, part-of runs child -> parent', () => {
  const tasks = [
    { id: 'a', blockedBy: [], partOf: [] },
    { id: 'b', blockedBy: ['a'], partOf: [] },
    { id: 'c', blockedBy: [], partOf: ['a'] },
  ];
  const edges = buildEdges(tasks, new Map([['a', 0], ['b', 1], ['c', 1]]));
  const blocks = edges.find((e) => e.kind === 'blocks');
  const partOf = edges.find((e) => e.kind === 'part-of');
  assertEqual([blocks.from, blocks.to], ['a', 'b']);
  assertEqual([partOf.from, partOf.to], ['c', 'a']);
});

test('edges to tasks outside the filtered set are dropped', () => {
  const edges = buildEdges([{ id: 'b', blockedBy: ['a'], partOf: [] }], new Map([['b', 1]]));
  assertEqual(edges, []);
});

test('a prerequisite due after its dependent is flagged as a conflict', () => {
  // Both ends carry real deadlines: the levels below stand in for what those dates
  // would produce, and a conflict is a claim about dates, not about row order.
  const tasks = [
    { id: 'a', due: '2026-09-05', blockedBy: [], partOf: [] },
    { id: 'b', due: '2026-08-15', blockedBy: ['a'], partOf: [] },
  ];
  assert(buildEdges(tasks, new Map([['a', 5], ['b', 2]]))[0].conflict, 'blocker below dependent');
  assert(!buildEdges(tasks, new Map([['a', 2], ['b', 5]]))[0].conflict, 'normal order');
});

test('the demo project has no scheduling conflicts', () => {
  const tasks = filterTasks(board.tasks, { projectId: 'website' });
  const window = projectWindow(board.projects.find((p) => p.id === 'website'), tasks);
  const { levels } = assignLevels(tasks, { bucket: chooseBucket(window.start, window.end), start: window.start });
  assertEqual(buildEdges(tasks, levels).filter((e) => e.conflict), []);
});

/* ----------------------------------------------------------- relations */

describe('relations');

/** a <- b <- c: c waits on b, which waits on a. */
const chain = () => [
  { id: 'a', blockedBy: [], partOf: [] },
  { id: 'b', blockedBy: ['a'], partOf: [] },
  { id: 'c', blockedBy: ['b'], partOf: [] },
  { id: 'loner', blockedBy: [], partOf: [] },
];

test('a task can never wait on itself', () => {
  assert(cyclicRefs(chain(), 'a', 'blockedBy').has('a'), 'a is forbidden to itself');
});

test('anything downstream would close a loop', () => {
  const forbidden = cyclicRefs(chain(), 'a', 'blockedBy');
  // b waits on a, and c waits on b, so neither can be something a waits on.
  assert(forbidden.has('b'), 'direct dependent');
  assert(forbidden.has('c'), 'dependent two steps out');
});

test('an unrelated task is always available', () => {
  assert(!cyclicRefs(chain(), 'a', 'blockedBy').has('loner'), 'loner is fine');
  assert(!cyclicRefs(chain(), 'c', 'blockedBy').has('a'), 'c already waits on a upstream');
});

test('upstream tasks stay available, so the chain can be tightened', () => {
  // c waits on b which waits on a: adding a to c's blockers is redundant, not a loop.
  assert(!cyclicRefs(chain(), 'c', 'blockedBy').has('b'), 'b is already a blocker of c');
});

test('part-of loops are refused the same way', () => {
  const tasks = [
    { id: 'parent', blockedBy: [], partOf: [] },
    { id: 'child', blockedBy: [], partOf: ['parent'] },
    { id: 'grandchild', blockedBy: [], partOf: ['child'] },
  ];
  const forbidden = cyclicRefs(tasks, 'parent', 'partOf');
  assertEqual([...forbidden].sort(), ['child', 'grandchild', 'parent']);
});

test('the two relations are judged independently', () => {
  const tasks = [
    { id: 'a', blockedBy: [], partOf: [] },
    { id: 'b', blockedBy: ['a'], partOf: [] },
  ];
  // b waits on a, but nothing is part of anything, so part-of is still wide open.
  assert(!cyclicRefs(tasks, 'a', 'partOf').has('b'), 'blocking does not constrain part-of');
});

test('a missing reference cannot make a loop', () => {
  const tasks = [{ id: 'a', blockedBy: ['ghost'], partOf: [] }];
  assertEqual([...cyclicRefs(tasks, 'a', 'blockedBy')], ['a']);
});

test('the demo board has no task that could be added to its own blockers', () => {
  for (const task of board.tasks) {
    assert(cyclicRefs(board.tasks, task.id, 'blockedBy').has(task.id), `${task.id} excludes itself`);
  }
});

/* ------------------------------------------------------ managing projects */

describe('star and archive');

const projectMd = (id, extra = '') => `---\nid: ${id}\ntitle: ${id}\n${extra}---\n`;

test('starred and archived round trip, and are written only when set', () => {
  const project = projectFromMarkdown(
    '_project-kitchen.md',
    projectMd('kitchen', 'starred: true\narchived: true\n')
  );
  assertEqual(project.starred, true);
  assertEqual(project.archived, true);

  const written = projectToMarkdown(project);
  assert(/^starred: true$/m.test(written), 'starred is written when set');
  assert(/^archived: true$/m.test(written), 'archived is written when set');

  const plain = projectToMarkdown({ ...project, starred: false, archived: false });
  assert(!/starred/.test(plain) && !/archived/.test(plain), 'neither is written when unset');
});

test('a project file with neither flag reads as neither', () => {
  const project = projectFromMarkdown('_project-kitchen.md', projectMd('kitchen'));
  assertEqual(project.starred, false);
  assertEqual(project.archived, false);
});

test('starred projects sort first, the rest keep their order', () => {
  const sorted = sortProjects([
    { id: 'b' },
    { id: 'a' },
    { id: 'z', starred: true },
    { id: 'c' },
  ]);
  assertEqual(sorted.map((p) => p.id), ['z', 'a', 'b', 'c']);
});

test('archived projects are hidden unless asked for', () => {
  const projects = [{ id: 'a' }, { id: 'b', archived: true }];
  assertEqual(visibleProjects(projects).map((p) => p.id), ['a']);
  assertEqual(visibleProjects(projects, true).map((p) => p.id), ['a', 'b']);
});

/* ------------------------------------------------------- deleting a project */

describe('deleting a project');

const deletable = () => ({
  projects: [
    { id: 'kitchen', title: 'Kitchen', folder: 'kitchen' },
    { id: 'website', title: 'Website', folder: 'website' },
  ],
  tasks: [
    { id: 'worktop', title: 'Worktop', project: ['kitchen'] },
    { id: 'shared', title: 'Shared', project: ['kitchen', 'website'] },
    { id: 'kitchen-goal', title: 'A finished kitchen', project: ['kitchen'], goal: true },
    { id: 'other', title: 'Other', project: ['website'] },
  ],
  trash: [],
});

test('keeping the tasks only strips the tag', () => {
  const plan = deleteProjectPlan(deletable(), 'kitchen', { deleteTasks: false });
  assertEqual(plan.removed, []);
  assertEqual(plan.projects.map((p) => p.id), ['website']);
  assertEqual(plan.tasks.find((t) => t.id === 'worktop').project, []);
});

test('deleting the tasks takes only the ones this project alone holds', () => {
  const plan = deleteProjectPlan(deletable(), 'kitchen', { deleteTasks: true });
  assertEqual(plan.removed.map((t) => t.id), ['worktop']);
  assert(!plan.tasks.some((t) => t.id === 'worktop'), 'the task this project alone held is gone');
});

test('a task belonging elsewhere survives, and moves to that project', () => {
  const plan = deleteProjectPlan(deletable(), 'kitchen', { deleteTasks: true });
  const shared = plan.tasks.find((t) => t.id === 'shared');
  assertEqual(shared.project, ['website']);
  // The point of keeping it: first-tag-wins now files it under the project it still has.
  const files = Object.keys(boardToFiles({ ...deletable(), ...plan, tasks: plan.tasks }));
  assert(files.includes('website/shared.md'), `shared.md moved to website/ (${files.join(', ')})`);
});

test('the goal node goes quietly either way, never into the trash', () => {
  for (const deleteTasks of [false, true]) {
    const plan = deleteProjectPlan(deletable(), 'kitchen', { deleteTasks });
    assert(!plan.tasks.some((t) => t.id === 'kitchen-goal'), 'the goal node is gone');
    assert(!plan.removed.some((t) => t.goal), 'and is not in the trash record');
  }
});

test('tasks that merely lose the tag are remembered, so a restore can undo that', () => {
  const keep = deleteProjectPlan(deletable(), 'kitchen', { deleteTasks: false });
  // Both real tasks survive untagged, so both need putting back if the project returns.
  assertEqual(keep.untagged.sort(), ['shared', 'worktop']);
  // Deleted ones are in `removed` instead; they are not untagged, they are gone.
  const binned = deleteProjectPlan(deletable(), 'kitchen', { deleteTasks: true });
  assertEqual(binned.untagged, ['shared']);
  assertEqual(binned.removed.map((t) => t.id), ['worktop']);
});

test('deleting a project that does not exist plans nothing', () => {
  assertEqual(deleteProjectPlan(deletable(), 'nope', { deleteTasks: true }), null);
});

test('tasks in other projects are left completely alone', () => {
  const plan = deleteProjectPlan(deletable(), 'kitchen', { deleteTasks: true });
  assertEqual(plan.tasks.find((t) => t.id === 'other').project, ['website']);
});

/* ------------------------------------------------------- project folders */

describe('project folders');

const NESTED = {
  // The folder is named nothing like the project: the id inside the file identifies it, so
  // this is the case that proves a folder name is only a container.
  'relaunch-2026/_project-website.md': '---\nid: website\ntitle: Website\n---\n',
  'relaunch-2026/wireframes.md': '---\nid: wireframes\ntitle: Wireframes\nproject: website\n---\n',
  'kitchen/_project-kitchen.md': '---\nid: kitchen\ntitle: Kitchen\n---\n',
  'kitchen/worktop.md': '---\nid: worktop\ntitle: Worktop\nproject: kitchen\n---\n',
  'odd-job.md': '---\nid: odd-job\ntitle: Odd job\n---\n',
};

const pathOf = (files, id) =>
  Object.keys(files).find((path) => path === `${id}.md` || path.endsWith(`/${id}.md`));

test('a project remembers the folder it was found in', () => {
  const { projects } = buildBoard(NESTED);
  assertEqual(projects.find((p) => p.id === 'website').folder, 'relaunch-2026');
  assertEqual(projects.find((p) => p.id === 'kitchen').folder, 'kitchen');
});

test('a task follows its project, not a folder named after it', () => {
  const files = boardToFiles(buildBoard(NESTED));
  assertEqual(pathOf(files, 'wireframes'), 'relaunch-2026/wireframes.md');
  assertEqual(pathOf(files, 'worktop'), 'kitchen/worktop.md');
});

test('a project file lives in its own folder', () => {
  assert(
    'relaunch-2026/_project-website.md' in boardToFiles(buildBoard(NESTED)),
    'the project file stays beside its tasks'
  );
});

test('an untagged task sits at the parent root', () => {
  assertEqual(pathOf(boardToFiles(buildBoard(NESTED)), 'odd-job'), 'odd-job.md');
});

test('the first tag decides where a task lives', () => {
  const board = buildBoard({
    ...NESTED,
    'both.md': '---\nid: both\ntitle: Both\nproject: [kitchen, website]\n---\n',
  });
  assertEqual(pathOf(boardToFiles(board), 'both'), 'kitchen/both.md');
  // Placement does not change what a task belongs to: the other tag is untouched.
  assertEqual(board.tasks.find((t) => t.id === 'both').project, ['kitchen', 'website']);
});

test('a tag naming no project we have lands at the root', () => {
  const board = buildBoard({
    ...NESTED,
    'stray.md': '---\nid: stray\ntitle: Stray\nproject: gardening\n---\n',
  });
  assertEqual(pathOf(boardToFiles(board), 'stray'), 'stray.md');
});

test('the trash belongs to the parent, not to any one project', () => {
  const board = { ...buildBoard(NESTED), trash: [{ kind: 'task', data: { id: 'gone' } }] };
  assert('_trash.md' in boardToFiles(board), 'the trash is at the root');
});

test('a nested board round trips to a fixed point', () => {
  const once = boardToFiles(buildBoard(NESTED));
  assertEqual(boardToFiles(buildBoard(once)), once);
});

const FLAT = {
  '_project-website.md': '---\nid: website\ntitle: Website\n---\n',
  'wireframes.md': '---\nid: wireframes\ntitle: Wireframes\nproject: website\n---\n',
};

test('a flat board stays flat', () => {
  assertEqual(Object.keys(boardToFiles(buildBoard(FLAT))).sort(), [
    '_project-website.md',
    'wireframes.md',
  ]);
});

test('giving a flat project a folder moves its files into it', () => {
  const flat = buildBoard(FLAT);
  const organised = { ...flat, projects: flat.projects.map((p) => ({ ...p, folder: p.id })) };
  assertEqual(Object.keys(boardToFiles(organised)).sort(), [
    'website/_project-website.md',
    'website/wireframes.md',
  ]);
});

test('two folders claiming one id: the first is used', () => {
  const { projects } = buildBoard({
    'a/_project-website.md': '---\nid: website\ntitle: First\n---\n',
    'b/_project-website.md': '---\nid: website\ntitle: Second\n---\n',
  });
  assertEqual(projects.length, 1);
  assertEqual(projects[0].folder, 'a');
});

test('a clash is reported so the app can say so', () => {
  assertEqual(
    duplicateIds({
      'a/_project-website.md': '',
      'b/_project-website.md': '',
      'kitchen/_project-kitchen.md': '',
    }),
    { ids: ['website'], paths: ['b/_project-website.md'] }
  );
  assertEqual(duplicateIds(NESTED), { ids: [], paths: [] });
});

test('two files claiming one task id clash on what is inside them', () => {
  const files = {
    'wireframes.md': TASK_MD,
    'wireframes 1.md': TASK_MD,
  };
  assertEqual(duplicateIds(files), { ids: ['wireframes'], paths: ['wireframes 1.md'] });
  // The board keeps the first and drops the second rather than holding two of one id.
  assertEqual(
    buildBoard(files).tasks.map((task) => task.id),
    ['wireframes']
  );
});

test('a project and a task may share an id', () => {
  assertEqual(
    duplicateIds({
      '_project-website.md': '---\nid: website\ntitle: Website\n---\n',
      'website.md': '---\nid: website\ntitle: Website launch\n---\n',
    }),
    { ids: [], paths: [] }
  );
});

/* ------------------------------------------------------------- initials */

describe('initials');

test('one word gives one letter, two give two', () => {
  assertEqual(initialsOf('Georg'), 'G');
  assertEqual(initialsOf('Georg Muntingh'), 'GM');
});

test('only the first two words count', () => {
  assertEqual(initialsOf('Ada Byron King Lovelace'), 'AB');
});

test('separators other than spaces still split', () => {
  assertEqual(initialsOf('ada-lovelace'), 'AL');
  assertEqual(initialsOf('ada.lovelace'), 'AL');
  assertEqual(initialsOf('ada_lovelace'), 'AL');
});

test('punctuation and stray whitespace are ignored', () => {
  assertEqual(initialsOf('  georg   '), 'G');
  assertEqual(initialsOf("O'Brien"), 'O');
});

test('a name with no letters still yields something drawable', () => {
  assertEqual(initialsOf(''), '?');
  assertEqual(initialsOf('   '), '?');
  assertEqual(initialsOf(null), '?');
});

test('initials come back upper case whatever the name looks like', () => {
  assertEqual(initialsOf('georg muntingh'), 'GM');
});

/* ------------------------------------------------------- the task in hand */

describe('working');

const three = () => [
  { id: 'a', working: false },
  { id: 'b', working: true },
  { id: 'c', working: false },
];

const workingIds = (tasks) => tasks.filter((t) => t.working).map((t) => t.id);

test('setting one releases whatever held it', () => {
  assertEqual(workingIds(markWorking(three(), 'c')), ['c']);
});

test('null releases without setting another', () => {
  assertEqual(workingIds(markWorking(three(), null)), []);
});

test('an id that is not on the board leaves nothing marked', () => {
  assertEqual(workingIds(markWorking(three(), 'ghost')), []);
});

test('there is never more than one, whatever the input claimed', () => {
  const confused = [
    { id: 'a', working: true },
    { id: 'b', working: true },
  ];
  assertEqual(workingIds(markWorking(confused, 'b')), ['b']);
});

test('tasks that do not change are returned by identity', () => {
  const tasks = three();
  const next = markWorking(tasks, 'b');
  assert(next[0] === tasks[0], 'untouched task is the same object');
  assert(next[1] === tasks[1], 'the one already set is untouched too');
});

test('nothing else about a task is disturbed', () => {
  const tasks = [{ id: 'a', title: 'Wireframes', people: ['Georg'], working: false }];
  assertEqual(markWorking(tasks, 'a'), [
    { id: 'a', title: 'Wireframes', people: ['Georg'], working: true },
  ]);
});

/* ------------------------------------------------- layout and flags on disk */

describe('placement and flags');

test('a stored x comes back as a number, not the string yaml gives', () => {
  const task = taskFromMarkdown('w.md', ['---', 'id: w', 'title: W', 'x: 412', '---', ''].join('\n'));
  assertEqual(task.x, 412);
  assert(typeof task.x === 'number', 'x is a number');
});

test('an unparseable or missing x is null rather than NaN', () => {
  const bad = taskFromMarkdown('w.md', ['---', 'id: w', 'x: over there', '---', ''].join('\n'));
  assertEqual(bad.x, null);
  assertEqual(taskFromMarkdown('w.md', ['---', 'id: w', '---', ''].join('\n')).x, null);
});

test('x survives a round trip, including x: 0', () => {
  const task = taskFromMarkdown('w.md', ['---', 'id: w', 'title: W', 'x: 0', '---', ''].join('\n'));
  assertEqual(task.x, 0);
  assert(/^x: 0$/m.test(taskToMarkdown(task)), 'x: 0 is written, not dropped as empty');
});

test('no x means no x line', () => {
  const written = taskToMarkdown(taskFromMarkdown('w.md', ['---', 'id: w', '---', ''].join('\n')));
  assert(!/^x:/m.test(written), 'nothing to say about placement, so nothing written');
});

test('working is written only when it is set', () => {
  const on = taskFromMarkdown('w.md', ['---', 'id: w', 'working: true', '---', ''].join('\n'));
  assertEqual(on.working, true);
  assert(/^working: true$/m.test(taskToMarkdown(on)), 'set, so written');
  assert(!/working/.test(taskToMarkdown({ ...on, working: false })), 'released, so absent');
});

test('the two new keys round trip to a fixed point', () => {
  const text = taskToMarkdown(
    taskFromMarkdown(
      'w.md',
      ['---', 'id: w', 'title: W', 'due: 2026-08-15', 'working: true', 'x: 412', '---', '', 'Body', ''].join('\n')
    )
  );
  assertEqual(taskToMarkdown(taskFromMarkdown('w.md', text)), text);
});

test('placement and flags do not leak into extra', () => {
  const task = taskFromMarkdown('w.md', ['---', 'id: w', 'x: 5', 'working: true', '---', ''].join('\n'));
  assertEqual(task.extra, {});
});

/* --------------------------------------------------------------- brief */

describe('LLM brief');

test('includes the goal, a task table and the dependency list', () => {
  const project = board.projects.find((p) => p.id === 'website');
  const tasks = filterTasks(board.tasks, { projectId: 'website' });
  const brief = buildBrief(project, tasks, { now: Date.UTC(2026, 7, 16) });
  assert(brief.includes('# Website relaunch'), 'title');
  assert(brief.includes('## Goal'), 'goal section');
  assert(brief.includes('## Context'), 'context section');
  assert(brief.includes('| id | task | due | estimate | people | subtasks |'), 'table header');
  assert(brief.includes('| wireframes | Wireframes |'), 'a task row keyed by its id');
  assert(brief.includes('- wireframes blocked-by information-architecture'), 'dependency');
  assert(brief.includes('- signup-flow part-of self-serve-signup'), 'part-of dependency');
});

test('a task brief carries its existing subtasks and their state', () => {
  const brief = buildTaskBrief({
    title: 'Design review',
    subtasks: [{ done: true, text: 'book the room' }, { done: false, text: 'collect feedback' }],
  });
  assert(brief.includes('Existing subtasks:'), 'the section is present');
  assert(brief.includes('- [x] book the room'), 'ticked state survives');
  assert(brief.includes('- [ ] collect feedback'), 'unticked state survives');
  assert(
    ACTIONS.subtasks.messages({ title: 'P' }, [], { title: 'Design review', subtasks: [{ done: false, text: 'collect feedback' }] })
      .some((m) => m.content.includes('collect feedback')),
    'and it reaches the prompt the model actually sees'
  );
});

test('goal and context are separate labelled sections', () => {
  const brief = buildBrief(
    { title: 'P', goal: 'Ship it', context: 'Stripe is set up.\n\n## Open questions\n- SOC2?' },
    []
  );
  assert(brief.includes('## Goal\nShip it'), 'goal section');
  assert(brief.includes('## Context\nStripe is set up.'), 'context section');
  assert(brief.indexOf('## Goal') < brief.indexOf('## Context'), 'goal comes first');
  assert(brief.includes('- SOC2?'), 'context goes verbatim, headings and all');
});

test('each section is dropped cleanly when empty', () => {
  const goalOnly = buildBrief({ title: 'P', goal: 'Ship it', context: '' }, []);
  assert(goalOnly.includes('## Goal'), 'goal kept');
  assert(!goalOnly.includes('## Context'), 'no empty context heading');
  const contextOnly = buildBrief({ title: 'P', goal: '', context: 'Background.' }, []);
  assert(!contextOnly.includes('## Goal'), 'no empty goal heading');
  assert(contextOnly.includes('## Context'), 'context kept');
});

/* ---------------------------------------------------------------- goal node */

const projectWithGoal = (over = {}) => ({ id: 'w', title: 'W', goal: 'Ship it', end: '2026-11-30', ...over });

test('a goal node is created for every project that has a goal', () => {
  const { tasks } = syncGoalTasks({ tasks: [], projects: [projectWithGoal()] });
  assertEqual(tasks.length, 1);
  assertEqual(tasks[0].id, goalTaskId('w'));
  assertEqual(tasks[0].title, 'Ship it');
  assertEqual(tasks[0].due, '2026-11-30', 'the goal sits at the project deadline');
  assert(tasks[0].goal, 'and is marked as the goal node');
});

test('a goal node follows its project title and deadline', () => {
  const first = syncGoalTasks({ tasks: [], projects: [projectWithGoal()] }).tasks;
  const { tasks } = syncGoalTasks({
    tasks: first,
    projects: [projectWithGoal({ goal: 'Ship it sooner', end: '2026-10-01' })],
  });
  assertEqual(tasks.length, 1, 'no second node is created');
  assertEqual(tasks[0].title, 'Ship it sooner');
  assertEqual(tasks[0].due, '2026-10-01');
});

test('clearing the goal hands its node back for deletion', () => {
  const first = syncGoalTasks({ tasks: [], projects: [projectWithGoal()] }).tasks;
  const { tasks, removed } = syncGoalTasks({ tasks: first, projects: [projectWithGoal({ goal: '' })] });
  assertEqual(tasks.length, 0);
  assertEqual(removed.map((t) => t.id), [goalTaskId('w')]);
});

test('deleting a project hands its goal node back too', () => {
  // What `deleteProject` relies on: with the project gone from the board, its goal node is
  // no longer wanted and comes back for binning rather than lingering as an orphan card.
  const before = syncGoalTasks({
    tasks: [],
    projects: [{ id: 'website', title: 'Website', goal: 'Ship it', end: '2026-09-01' }],
  });
  assertEqual(before.tasks.map((t) => t.id), ['website-goal']);

  const after = syncGoalTasks({ tasks: before.tasks, projects: [] });
  assertEqual(after.tasks, []);
  assertEqual(after.removed.map((t) => t.id), ['website-goal']);
});

test('a goal node survives a round-trip through markdown', () => {
  const { tasks } = syncGoalTasks({ tasks: [], projects: [projectWithGoal()] });
  const markdown = taskToMarkdown(tasks[0]);
  assert(markdown.includes('goal: true'), 'the marker is written');
  assert(taskFromMarkdown('w-goal.md', markdown).goal, 'and read back');
});

test('only tasks nothing depends on feed the goal', () => {
  const tasks = [
    { id: 'w-goal', goal: true, project: ['w'] },
    { id: 'a', project: ['w'], blockedBy: [] },
    { id: 'b', project: ['w'], blockedBy: ['a'] },
    { id: 'c', project: ['w'], partOf: ['b'] },
  ];
  const links = goalLinks(tasks);
  assertEqual(links, [{ from: 'b', to: 'w-goal' }], 'a is depended on, c is part of b');
});

test('the goal node never links to itself', () => {
  assertEqual(goalLinks([{ id: 'w-goal', goal: true, project: ['w'] }]), []);
});

test('an undated task is not a scheduling conflict', () => {
  const bucket = getBucket('week');
  const tasks = [
    { id: 'g', goal: true, project: ['w'], due: '2026-09-01' },
    { id: 'undated', project: ['w'], due: '' },
    { id: 'late', project: ['w'], due: '2026-10-01' },
  ];
  const { levels } = assignLevels(tasks, { bucket, start: START });
  const edges = buildEdges(tasks, levels);
  const by = (from) => edges.find((e) => e.from === from);
  assert(!by('undated').conflict, 'the tray is a position, not a date after the goal');
  assert(by('late').conflict, 'but a real deadline past the goal still is');
});

test('buildEdges emits goal links alongside stored ones', () => {
  const tasks = [
    { id: 'w-goal', goal: true, project: ['w'] },
    { id: 'a', project: ['w'] },
  ];
  const kinds = buildEdges(tasks, new Map()).map((e) => e.kind);
  assert(kinds.includes('goal'), 'a goal edge is present');
});

/* ------------------------------------------------------------------ merging */

test('merging folds a task into another as checklist items', () => {
  const tasks = [
    { id: 'src', title: 'Wireframes', done: false, subtasks: [{ done: true, text: 'lo-fi' }] },
    { id: 'tgt', title: 'Design', subtasks: [{ done: false, text: 'existing' }] },
  ];
  const { tasks: next, merged } = mergeTaskInto(tasks, 'src', 'tgt');
  assertEqual(next.map((t) => t.id), ['tgt'], 'the source is gone');
  assertEqual(
    next[0].subtasks,
    [
      { done: false, text: 'existing' },
      { done: false, text: 'Wireframes' },
      { done: true, text: 'lo-fi' },
    ],
    'title first, then its own subtasks, after what was already there'
  );
  assertEqual(merged.id, 'src', 'the merged task is handed back for the trash');
});

test('merging rewires dependents to the target and drops self-links', () => {
  const tasks = [
    { id: 'src', title: 'S', subtasks: [] },
    { id: 'tgt', title: 'T', subtasks: [], blockedBy: ['src'] },
    { id: 'dep', title: 'D', blockedBy: ['src'] },
  ];
  const { tasks: next } = mergeTaskInto(tasks, 'src', 'tgt');
  assertEqual(next.find((t) => t.id === 'dep').blockedBy, ['tgt']);
  assertEqual(next.find((t) => t.id === 'tgt').blockedBy, [], 'a task cannot block itself');
});

test('merging refuses a goal node or a task with itself', () => {
  const tasks = [{ id: 'a', title: 'A', subtasks: [] }, { id: 'g', title: 'G', goal: true, subtasks: [] }];
  assertEqual(mergeTaskInto(tasks, 'a', 'a'), null);
  assertEqual(mergeTaskInto(tasks, 'g', 'a'), null);
  assertEqual(mergeTaskInto(tasks, 'a', 'g'), null);
});

/* ---------------------------------------------------------------- collapsing */

test('collapsing empty periods leaves consecutive rows and records the gaps', () => {
  const bucket = getBucket('week');
  const tasks = [{ id: 'a', due: '2026-08-01' }, { id: 'b', due: '2026-08-08' }, { id: 'c', due: '2026-09-26' }];
  const plain = assignLevels(tasks, { bucket, start: START });
  assertEqual([...plain.levels.values()], [0, 1, 8], 'ordinarily a level is elapsed time');

  const collapsed = assignLevels(tasks, { bucket, start: START, collapse: true });
  assertEqual([...collapsed.levels.values()], [0, 1, 2], 'occupied periods become adjacent');
  assertEqual(collapsed.gaps, [{ afterLevel: 1, periods: 6 }], 'six empty weeks are recorded');
});

test('a row still labels its real date, collapsed or not', () => {
  const bucket = getBucket('week');
  // Deliberately starts three weeks into the window, so a level is not its own offset
  // and a double-counted `minLevel` would show up.
  const tasks = [{ id: 'a', due: '2026-08-22' }, { id: 'c', due: '2026-09-26' }];
  const dateOf = (opts, row) => {
    const { levelOrigin, minLevel } = assignLevels(tasks, { bucket, start: START, ...opts });
    return formatDate(bucket.dateForLevel(levelOrigin.get(row) + minLevel, START));
  };
  assertEqual(dateOf({ collapse: true }, 0), '2026-08-22');
  assertEqual(dateOf({ collapse: true }, 1), '2026-09-26', 'row 1 points at the week it came from');
  assertEqual(dateOf({}, 0), '2026-08-22', 'and the uncollapsed scale agrees');
  assertEqual(dateOf({}, 5), '2026-09-26');
});

test('uncollapsed, every row in range is a real period', () => {
  const bucket = getBucket('week');
  // Nothing is due in weeks 1 and 2; dropping a task there must still mean that week,
  // not "unscheduled".
  const tasks = [{ id: 'a', due: '2026-08-01' }, { id: 'b', due: '2026-08-22' }];
  const { levelOrigin } = assignLevels(tasks, { bucket, start: START });
  assertEqual([...levelOrigin.keys()], [0, 1, 2, 3], 'the empty weeks between are still rows');
  assertEqual(
    formatDate(bucket.dateForLevel(levelOrigin.get(2), START)),
    '2026-08-15',
    'and each maps to its own date'
  );
});

test('collapsed, only occupied rows exist', () => {
  const bucket = getBucket('week');
  const tasks = [{ id: 'a', due: '2026-08-01' }, { id: 'b', due: '2026-08-22' }];
  const { levelOrigin } = assignLevels(tasks, { bucket, start: START, collapse: true });
  assertEqual([...levelOrigin.keys()], [0, 1], 'the empty weeks are gone entirely');
});

test('collapsing keeps undated work in its own tray below the last row', () => {
  const bucket = getBucket('week');
  const tasks = [{ id: 'a', due: '2026-08-01' }, { id: 'u', due: '' }];
  const { levels, trayLevel } = assignLevels(tasks, { bucket, start: START, collapse: true });
  assertEqual(levels.get('u'), trayLevel);
  assert(trayLevel > levels.get('a'), 'the tray sits below the dated rows');
});

/* -------------------------------------------------------------------- trash */

test('the trash round-trips through its own file', () => {
  const records = [{ kind: 'task', at: '2026-08-16T00:00:00.000Z', label: 'A', data: { id: 'a', subtasks: [] } }];
  assertEqual(trashFromMarkdown(trashToMarkdown(records)), records);
});

test('an empty or unreadable trash file yields no records', () => {
  assertEqual(trashFromMarkdown('---\nid: _trash\n---\n'), []);
  assertEqual(trashFromMarkdown('---\nid: _trash\n---\n```json\nnot json\n```\n'), []);
});

test('the trash file is not mistaken for a task', () => {
  const built = buildBoard({ '_trash.md': trashToMarkdown([{ kind: 'task', at: '', label: 'A', data: {} }]) });
  assertEqual(built.tasks, [], 'it is board state, not work');
  assertEqual(built.trash.length, 1);
});

test('the trash keeps the newest and drops past the cap', () => {
  let trash = [];
  for (let n = 0; n < TRASH_LIMIT + 5; n += 1) {
    trash = pushTrash(trash, { kind: 'task', at: '', label: `t${n}`, data: {} });
  }
  assertEqual(trash.length, TRASH_LIMIT);
  assertEqual(trash[0].label, `t${TRASH_LIMIT + 4}`, 'newest first');
  assert(!trash.some((r) => r.label === 't0'), 'the oldest fell off');
});

test('a board with no deletions writes no trash file', () => {
  assert(!('_trash.md' in boardToFiles({ tasks: [], projects: [], trash: [] })));
});

test('escapes pipes so a title cannot break the table', () => {
  const brief = buildBrief({ title: 'P' }, [
    { id: 'x', title: 'a | b', project: [], people: [], subtasks: [], blockedBy: [], partOf: [] },
  ]);
  assert(brief.includes('a \\| b'), 'pipe must be escaped');
});

test('an empty project still produces a well-formed brief', () => {
  const brief = buildBrief({ title: 'Empty', goal: '' }, []);
  assert(brief.includes('_no tasks yet_'));
  assert(brief.includes('_none recorded_'));
});

test('the task brief lists existing subtasks', () => {
  const task = board.tasks.find((t) => t.id === 'wireframes');
  const brief = buildTaskBrief(task);
  assert(brief.includes('id: wireframes'));
  assert(brief.includes('- [x] Landing page'));
});

/* ------------------------------------------------------- ask context */

describe('ask context');

const askProject = { id: 'website', title: 'Website relaunch', goal: 'Ship it', context: 'Stripe is set up.' };
const askTasks = () => filterTasks(board.tasks, { projectId: 'website' });

test('nothing ticked sends nothing at all', () => {
  assertEqual(buildContext([], { project: askProject, tasks: askTasks() }), '');
});

test('a block only brings its own section', () => {
  const goalOnly = buildContext(['goal'], { project: askProject, tasks: askTasks() });
  assert(goalOnly.includes('## Goal'), 'the goal is there');
  assert(!goalOnly.includes('## Tasks'), 'the table is not');
  const tasksOnly = buildContext(['tasks'], { project: askProject, tasks: askTasks() });
  assert(tasksOnly.includes('## Tasks'), 'the table is there');
  assert(!tasksOnly.includes('## Goal'), 'the goal is not');
});

test('sections are assembled in catalogue order, whatever order they are asked for', () => {
  const brief = buildContext(['people', 'tasks', 'goal'], { project: askProject, tasks: askTasks() });
  assert(brief.indexOf('## Goal') < brief.indexOf('## Tasks'), 'goal before tasks');
  assert(brief.indexOf('## Tasks') < brief.indexOf('## People'), 'tasks before people');
});

test('the task table carries completed work too, since the model is judging the whole plan', () => {
  const tasks = [
    { id: 'a', title: 'Done thing', done: true, project: ['website'], people: [], subtasks: [], blockedBy: [], partOf: [] },
    { id: 'b', title: 'Open thing', project: ['website'], people: [], subtasks: [], blockedBy: [], partOf: [] },
  ];
  const brief = buildContext(['tasks'], { project: askProject, tasks });
  assert(brief.includes('| a | Done thing |'), 'the finished task is still listed');
  assert(brief.includes('| b | Open thing |'), 'and so is the open one');
});

test('detail carries the notes and subtask text the table only counts', () => {
  const tasks = [
    { id: 'a', title: 'Wireframes', notes: 'Figma file is shared.', project: ['website'], people: [],
      subtasks: [{ done: true, text: 'Landing page' }, { done: false, text: 'Pricing page' }], blockedBy: [], partOf: [] },
  ];
  const detail = buildContext(['detail'], { project: askProject, tasks });
  assert(detail.includes('Figma file is shared.'), 'notes survive');
  assert(detail.includes('- [x] Landing page'), 'ticked subtask survives');
  assert(detail.includes('- [ ] Pricing page'), 'unticked subtask survives');
  assert(!buildContext(['tasks'], { project: askProject, tasks }).includes('Figma file is shared.'),
    'and the table alone never carried it');
});

test('the selected-task block is absent when nothing is selected', () => {
  const tasks = askTasks();
  assertEqual(buildContext(['task'], { project: askProject, tasks, task: null }), '');
  const chosen = tasks.find((t) => t.id === 'wireframes');
  assert(buildContext(['task'], { project: askProject, tasks, task: chosen }).includes('id: wireframes'));
});

test('other projects are summarised, and the current one is not repeated', () => {
  const projects = [
    { id: 'website', title: 'Website relaunch' },
    { id: 'app', title: 'Mobile app', goal: 'Ship v1' },
    { id: 'old', title: 'Archived thing', archived: true },
  ];
  const brief = buildContext(['projects'], { project: askProject, projects, allTasks: board.tasks });
  assert(brief.includes('Mobile app'), 'the other project is listed');
  assert(brief.includes('Ship v1'), 'with its goal');
  assert(!brief.includes('Website relaunch'), 'the current project is not repeated');
  assert(!brief.includes('Archived thing'), 'archived projects stay out');
});

test('a block with nothing to say costs no words and no heading', () => {
  const sections = contextSections({ project: askProject, tasks: [], projects: [], allTasks: [] });
  assertEqual(sections.detail, '', 'no notes anywhere means no detail section');
  assertEqual(sections.projects, '', 'no other projects means no heading');
  assertEqual(sections.task, '', 'no selection means no task section');
});

test('every catalogued block is one the assembler can actually build', () => {
  const sections = contextSections({ project: askProject, tasks: askTasks(), projects: board.projects, allTasks: board.tasks });
  for (const block of CONTEXT_BLOCKS) {
    assert(typeof sections[block.id] === 'string', `${block.id} has a section`);
  }
});

test('word counting matches what the dialog promises', () => {
  assertEqual(countWords(''), 0);
  assertEqual(countWords('   \n  '), 0);
  assertEqual(countWords('one two  three\nfour'), 4);
});

/* ----------------------------------------------------------- ask prompt */

describe('ask prompt');

test('the brief rides on the first question and is not repeated', () => {
  const messages = askMessages('BRIEF', [
    { role: 'user', content: 'Q1' },
    { role: 'assistant', content: 'A1' },
    { role: 'user', content: 'Q2' },
  ]);
  assertEqual(messages[0], { role: 'system', content: ASK_SYSTEM });
  assert(messages[1].content.includes('BRIEF'), 'the brief travels with the first turn');
  assert(messages[1].content.includes('Q1'), 'and so does the question');
  assertEqual(messages[3].content, 'Q2', 'the follow-up is the question alone');
  assertEqual(messages.length, 4);
});

test('the freeform prompt never asks for JSON', () => {
  assert(!/json/i.test(ASK_SYSTEM), 'this path wants prose, not a fenced block');
});

/* -------------------------------------------------------------- streaming */

describe('response streaming');

const collect = (chunks) => {
  let text = '';
  const reader = createSseReader((delta) => {
    text += delta;
  });
  for (const chunk of chunks) reader.push(chunk);
  reader.end();
  return { text, finished: reader.finished };
};

const frame = (content) => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`;

test('fragments are concatenated in order', () => {
  assertEqual(collect([frame('Hello'), frame(' world')]).text, 'Hello world');
});

test('a frame split across chunks is held until the rest arrives', () => {
  const whole = frame('Hello world');
  const cut = Math.floor(whole.length / 2);
  assertEqual(collect([whole.slice(0, cut), whole.slice(cut)]).text, 'Hello world');
});

test('keep-alive comments and blank lines are ignored', () => {
  assertEqual(collect([': OPENROUTER PROCESSING\n', '\n', frame('hi')]).text, 'hi');
});

test('[DONE] ends the stream', () => {
  const { text, finished } = collect([frame('hi'), 'data: [DONE]\n']);
  assertEqual(text, 'hi');
  assert(finished, 'the reader knows it is over');
});

test('a frame the last chunk left unterminated is still read', () => {
  assertEqual(collect([frame('hi').trimEnd()]).text, 'hi');
});

test('an error arriving mid-stream is raised, not swallowed', () => {
  assertThrows(() => collect(['data: {"error":{"message":"rate limited"}}\n']));
});

test('an unreadable frame does not sink the answer', () => {
  assertEqual(collect([frame('a'), 'data: {not json\n', frame('b')]).text, 'ab');
});

/* ------------------------------------------------------- LLM responses */

describe('LLM response parsing');

test('reads a fenced JSON block', () => {
  assertEqual(parseJsonResponse('Sure!\n```json\n{"a": 1}\n```\n'), { a: 1 });
});

test('reads bare JSON with chatter around it', () => {
  assertEqual(parseJsonResponse('Here: {"a": 1} hope that helps'), { a: 1 });
});

test('reads an unfenced array', () => {
  assertEqual(parseJsonResponse('[1, 2]'), [1, 2]);
});

test('throws with the raw text attached when there is no JSON', () => {
  try {
    parseJsonResponse('no json here');
    throw new Error('should have thrown');
  } catch (error) {
    assertEqual(error.raw, 'no json here');
  }
});

test('subtask suggestions are cleaned of list markers', () => {
  const out = ACTIONS.subtasks.parse('```json\n{"subtasks":["- [ ] Draft copy","* Review"]}\n```');
  assertEqual(out.map((s) => s.label), ['Draft copy', 'Review']);
  assert(out.every((s) => s.kind === 'subtask'));
});

test('subtask suggestions tolerate objects instead of strings', () => {
  const out = ACTIONS.subtasks.parse('{"subtasks":[{"text":"One"},{"title":"Two"}]}');
  assertEqual(out.map((s) => s.label), ['One', 'Two']);
});

test('missing-task suggestions keep ids, dates and estimates', () => {
  const out = ACTIONS.missing.parse(
    '{"tasks":[{"title":"QA","due":"2026-11-01","estimate":"2d","blocked_by":["copy"],"why":"untested"}]}'
  );
  assertEqual(out[0].task, { title: 'QA', due: '2026-11-01', estimate: '2d', blockedBy: ['copy'] });
  assertEqual(out[0].detail, 'untested');
});

test('a malformed due date is dropped rather than trusted', () => {
  const out = ACTIONS.missing.parse('{"tasks":[{"title":"QA","due":"next tuesday"}]}');
  assertEqual(out[0].task.due, '');
});

test('a suggestion with no title is discarded', () => {
  assertEqual(ACTIONS.missing.parse('{"tasks":[{"why":"no title"},{"title":"Real"}]}').length, 1);
});

test('estimates are normalised to a unit the model layer understands', () => {
  assertEqual(ACTIONS.estimate.parse('{"estimate":"3 D","why":"x"}')[0].estimate, '3d');
  assertEqual(parseEstimateHours(ACTIONS.estimate.parse('{"estimate":"about 2w"}')[0].estimate), 80);
});

test('an unusable estimate throws instead of writing nonsense', () => {
  assertThrows(() => ACTIONS.estimate.parse('{"estimate":"quite a while"}'));
});

/* ----------------------------------------------------------------- zip */

describe('zip');

test('crc32 matches the reference value', () => {
  const bytes = new TextEncoder().encode('The quick brown fox jumps over the lazy dog');
  assertEqual(crc32(bytes), 0x414fa339);
});

test('crc32 of the empty input is zero', () => {
  assertEqual(crc32(new Uint8Array(0)), 0);
});

test('writes the PKZIP signatures and one central record per file', () => {
  const zip = createZip({ 'a.md': 'alpha', 'b.md': 'beta' });
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  assertEqual(view.getUint32(0, true), 0x04034b50, 'local file header');

  let locals = 0;
  let centrals = 0;
  for (let i = 0; i + 4 <= zip.length; i += 1) {
    const signature = view.getUint32(i, true);
    if (signature === 0x04034b50) locals += 1;
    if (signature === 0x02014b50) centrals += 1;
  }
  assertEqual(locals, 2);
  assertEqual(centrals, 2);
  assertEqual(view.getUint32(zip.length - 22, true), 0x06054b50, 'end of central directory');
  assertEqual(view.getUint16(zip.length - 22 + 10, true), 2, 'entry count');
});

test('stores UTF-8 content at its byte length, not its character length', () => {
  const zip = createZip({ 'a.md': 'café' });
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  assertEqual(view.getUint32(18, true), 5, 'four characters, five bytes');
  assertEqual(view.getUint16(6, true), 0x0800, 'the UTF-8 flag is set');
});

test('an empty archive is still well formed', () => {
  const zip = createZip({});
  assertEqual(zip.length, 22);
});

/* --------------------------------------------------------- same file */

describe('same file');

const TASK_MD = `---
id: wireframes
title: Wireframes
project: [website]
done: false
---
Some notes.

- [ ] first
- [x] second
`;

test('a file is the same as itself', () => {
  assert(sameFile('wireframes.md', TASK_MD, TASK_MD));
});

test('key order, quoting, CRLF and checklist position do not change meaning', () => {
  const rearranged =
    '---\r\n' +
    'title: "Wireframes"\r\n' +
    'project:\r\n  - website\r\n' +
    'id: wireframes\r\n' +
    'done: false\r\n' +
    '---\r\n' +
    '- [ ] first\r\n' +
    'Some notes.\r\n' +
    '- [x] second\r\n';
  assert(rearranged !== TASK_MD, 'the two should differ as bytes');
  assert(sameFile('wireframes.md', TASK_MD, rearranged));
});

test('a real change is still a change', () => {
  assert(!sameFile('wireframes.md', TASK_MD, TASK_MD.replace('done: false', 'done: true')));
  assert(!sameFile('wireframes.md', TASK_MD, TASK_MD.replace('Some notes.', 'Other notes.')));
  assert(!sameFile('wireframes.md', TASK_MD, TASK_MD.replace('- [ ] first', '- [x] first')));
});

test('projects and the trash canonicalise too', () => {
  const a = '---\nid: website\ntitle: Website\nstarred: true\n---\nContext.\n';
  const b = '---\ntitle: Website\nstarred: true\nid: website\n---\n\nContext.\n\n';
  assert(sameFile('website/_project-website.md', a, b));
  assert(!sameFile('website/_project-website.md', a, a.replace('Context.', 'Different.')));
  const trash = trashToMarkdown([{ kind: 'task', at: 'now', label: 'x', data: {} }]);
  assert(sameFile('_trash.md', trash, trash));
});

test('a note with no frontmatter is compared by what it says', () => {
  assert(sameFile('stray.md', 'Just prose.\n', 'Just prose.'));
  assert(!sameFile('stray.md', 'Just prose.', 'Other prose.'));
});

test('canonicalising the demo corpus is a fixed point', () => {
  for (const [name, text] of Object.entries(DEMO)) {
    const once = canonicalise(name, text);
    assertEqual(canonicalise(name, once), once, name);
  }
});

/* ------------------------------------------------------ storage gate */

/**
 * Enough of `FileSystemDirectoryHandle` for storage.js: nested directories, writable
 * files, and a log of every write and removal — so a test can assert that a read-only
 * board touched nothing at all, which is the whole point of the gate.
 */
/**
 * A clock for the fake filesystem, so every write lands at a later `lastModified` than the
 * read before it — which is the whole of what `save` now checks before touching anything.
 */
let fakeClock = Date.UTC(2026, 0, 1);

function fakeDirectory(name, seed = {}, log = [], prefix = '') {
  /** `name -> { text, mtime, size }`, the shape `save` now checks a file against. */
  const files = new Map();
  const dirs = new Map();

  const record = (text) => ({ text, mtime: (fakeClock += 1000), size: text.length });
  const asFile = (rec) => ({
    lastModified: rec.mtime,
    size: rec.size,
    async text() {
      return rec.text;
    },
  });

  const handle = {
    name,
    kind: 'directory',
    log,
    async queryPermission() {
      return 'granted';
    },
    async requestPermission() {
      return 'granted';
    },
    async *entries() {
      for (const [key, rec] of [...files]) {
        yield [
          key,
          {
            kind: 'file',
            name: key,
            async getFile() {
              return asFile(rec);
            },
          },
        ];
      }
      for (const [key, dir] of [...dirs]) yield [key, dir];
    },
    async getDirectoryHandle(key, { create } = {}) {
      if (!dirs.has(key)) {
        if (!create) throw new Error(`no such directory: ${key}`);
        dirs.set(key, fakeDirectory(key, {}, log, `${prefix}${key}/`));
      }
      return dirs.get(key);
    },
    async getFileHandle(key, { create } = {}) {
      if (!files.has(key) && !create) throw new Error(`no such file: ${key}`);
      return {
        kind: 'file',
        name: key,
        async getFile() {
          return asFile(files.get(key) ?? { text: '', mtime: 0, size: 0 });
        },
        async createWritable() {
          let buffer = '';
          return {
            async write(text) {
              buffer += text;
            },
            async close() {
              // A write moves the clock on, as a real one moves the mtime.
              files.set(key, record(buffer));
              log.push(`write ${prefix}${key}`);
            },
          };
        },
      };
    },
    async removeEntry(key) {
      if (!files.delete(key)) throw new Error(`no such file: ${key}`);
      log.push(`remove ${prefix}${key}`);
    },
    /** Write straight to the fake disk, as another device or Obsidian would. */
    put(path, text) {
      const cut = path.indexOf('/');
      if (cut === -1) {
        files.set(path, record(text));
        return;
      }
      const folder = path.slice(0, cut);
      if (!dirs.has(folder)) dirs.set(folder, fakeDirectory(folder, {}, log, `${prefix}${folder}/`));
      dirs.get(folder).put(path.slice(cut + 1), text);
    },
    /** Current contents as a `path -> text` map, for assertions. */
    dump() {
      const out = {};
      for (const [key, rec] of files) out[`${prefix}${key}`] = rec.text;
      for (const dir of dirs.values()) Object.assign(out, dir.dump());
      return out;
    },
  };

  for (const [path, text] of Object.entries(seed)) handle.put(path, text);
  return handle;
}

/** A storage connected to a fake folder, still locked, with its write log cleared. */
async function connectedTo(seed) {
  const directory = fakeDirectory('vault', seed);
  const previous = globalThis.showDirectoryPicker;
  globalThis.showDirectoryPicker = async () => directory;
  try {
    const storage = createStorage({ sameFile });
    const files = await storage.connectFolder();
    directory.log.length = 0;
    return { storage, directory, files };
  } finally {
    globalThis.showDirectoryPicker = previous;
  }
}

const DOOMED_MD = '---\nid: doomed\ntitle: Doomed\ndone: false\n---\n';

/**
 * Like `test`, but puts this browser's own board back afterwards.
 *
 * `save` mirrors every write into localStorage under the same key the app itself uses, so
 * without this, running the tests would quietly replace the board of anyone using the
 * browser-only backend.
 */
function storageTest(name, fn) {
  test(name, async () => {
    const mirror = localStorage.getItem('tasks.files');
    try {
      await fn();
    } finally {
      if (mirror === null) localStorage.removeItem('tasks.files');
      else localStorage.setItem('tasks.files', mirror);
    }
  });
}

describe('storage gate');

storageTest('browser-only storage is always writable', () => {
  assert(createStorage({ sameFile }).state.writable);
});

storageTest('a connected folder opens read-only', async () => {
  const { storage } = await connectedTo({ 'wireframes.md': TASK_MD });
  assertEqual(storage.state.mode, 'folder');
  assert(!storage.state.writable, 'a fresh folder must not be writable');
});

storageTest('a read-only folder is not written to, and nothing is deleted', async () => {
  const { storage, directory } = await connectedTo({
    'wireframes.md': TASK_MD,
    'doomed.md': DOOMED_MD,
  });
  const before = directory.dump();
  const mirror = localStorage.getItem('tasks.files');

  // An edit to one file and the disappearance of another: both must be refused.
  const result = await storage.save({ 'wireframes.md': TASK_MD.replace('Wireframes', 'Changed') });

  assertEqual(result, { skipped: 'read-only' });
  assertEqual(directory.log, [], 'a locked folder must see no writes and no removals');
  assertEqual(directory.dump(), before);
  assertEqual(localStorage.getItem('tasks.files'), mirror, 'the mirror must not move either');
});

storageTest('unlocking re-reads the folder', async () => {
  const { storage, directory } = await connectedTo({ 'wireframes.md': TASK_MD });
  // Another device gets there first, after this tab has already read the folder.
  directory.put('wireframes.md', TASK_MD.replace('Some notes.', 'Notes from my phone.'));
  directory.put('later.md', '---\nid: later\ntitle: Later\ndone: false\n---\n');

  const files = await storage.unlock();

  assert(storage.state.writable, 'unlock must open the gate');
  assert(files['wireframes.md'].includes('Notes from my phone.'), 'the external edit must be seen');
  assert('later.md' in files, 'the external addition must be seen');
  assertEqual(directory.log, [], 'unlocking must not write anything');
});

storageTest('writes resume once unlocked', async () => {
  const { storage, directory } = await connectedTo({ 'wireframes.md': TASK_MD });
  await storage.unlock();
  const changed = TASK_MD.replace('Some notes.', 'Edited here.');

  await storage.save({ 'wireframes.md': changed });

  assertEqual(directory.log, ['write wireframes.md']);
  assertEqual(directory.dump()['wireframes.md'], changed);
});

storageTest('a file that differs only in formatting is left alone', async () => {
  // As a hand-written vault note would be: same meaning, different shape.
  const handWritten =
    '---\ntitle: Wireframes\nid: wireframes\nproject: [website]\ndone: false\n---\n' +
    'Some notes.\n\n- [ ] first\n- [x] second\n';
  const { storage, directory } = await connectedTo({ 'wireframes.md': handWritten });
  await storage.unlock();

  await storage.save({ 'wireframes.md': canonicalise('wireframes.md', handWritten) });

  assertEqual(directory.log, [], 'reformatting alone is not a change worth writing');
  assertEqual(directory.dump()['wireframes.md'], handWritten, 'the file keeps its own shape');
});

storageTest('a genuinely new file is still created', async () => {
  const { storage, directory } = await connectedTo({ 'wireframes.md': TASK_MD });
  await storage.unlock();
  const added = '---\nid: new-task\ntitle: New task\ndone: false\n---\n';

  await storage.save({ 'wireframes.md': TASK_MD, 'new-task.md': added });

  assertEqual(directory.log, ['write new-task.md']);
  assertEqual(directory.dump()['new-task.md'], added);
});

storageTest('deletions happen once unlocked, and not before', async () => {
  const { storage, directory } = await connectedTo({
    'wireframes.md': TASK_MD,
    'doomed.md': DOOMED_MD,
  });

  await storage.save({ 'wireframes.md': TASK_MD });
  assert('doomed.md' in directory.dump(), 'a locked folder keeps its files');

  await storage.unlock();
  await storage.save({ 'wireframes.md': TASK_MD });

  assertEqual(directory.log, ['remove doomed.md']);
  assert(!('doomed.md' in directory.dump()));
});

storageTest('locking again withdraws the right to write', async () => {
  const { storage, directory } = await connectedTo({ 'wireframes.md': TASK_MD });
  await storage.unlock();
  storage.lock();

  assert(!storage.state.writable);
  await storage.save({ 'wireframes.md': TASK_MD.replace('Wireframes', 'Changed') });
  assertEqual(directory.log, []);
});

storageTest('project subfolders round-trip through the gate', async () => {
  const { storage, directory } = await connectedTo({
    'website/_project-website.md': '---\nid: website\ntitle: Website\n---\n',
    'website/wireframes.md': TASK_MD,
  });
  assert(!storage.state.writable);

  const files = await storage.unlock();
  assert('website/_project-website.md' in files);
  assert('website/wireframes.md' in files);

  await storage.save({
    ...files,
    'website/wireframes.md': TASK_MD.replace('Some notes.', 'Edited.'),
  });
  assertEqual(directory.log, ['write website/wireframes.md']);
});

/* --------------------------------------------- a folder that keeps moving */

describe('a folder that keeps moving');

const CONFLICT_NAME = "wireframes (Georg's conflicted copy 2026-08-19).md";

storageTest('a conflict copy is never read, written or deleted', async () => {
  const { storage, directory, files } = await connectedTo({
    'wireframes.md': TASK_MD,
    [CONFLICT_NAME]: TASK_MD.replace('Some notes.', 'The other machine’s notes.'),
  });
  assert(!(CONFLICT_NAME in files), 'a conflict copy must not reach the board');
  assertEqual(storage.state.conflictFiles, [CONFLICT_NAME]);

  const board = await storage.unlock();
  // Twice: the delete loop is what used to take it, and it runs on every save.
  await storage.save(board);
  await storage.save({ ...board, 'wireframes.md': TASK_MD.replace('Some notes.', 'Edited.') });

  assert(!directory.log.some((line) => line.includes('conflicted copy')), directory.log.join());
  assertEqual(directory.dump()[CONFLICT_NAME], TASK_MD.replace('Some notes.', 'The other machine’s notes.'));
});

storageTest('a conflict copy of a project file does not make a folder a project', async () => {
  const { files } = await connectedTo({
    "notes/_project-website (Georg's conflicted copy 2026-08-19).md":
      '---\nid: website\ntitle: Website\n---\n',
    'notes/reading.md': TASK_MD,
  });
  // Nothing in that folder is a project file, so the folder is none of this app's business.
  assertEqual(Object.keys(files), []);
});

storageTest('a file that changed since we read it is not written over', async () => {
  const { storage, directory } = await connectedTo({
    'wireframes.md': TASK_MD,
    'doomed.md': DOOMED_MD,
  });
  const board = await storage.unlock();
  directory.put('wireframes.md', TASK_MD.replace('Some notes.', 'Written on the other machine.'));

  const result = await storage.save({
    ...board,
    'wireframes.md': TASK_MD.replace('Some notes.', 'Written here.'),
    'doomed.md': DOOMED_MD.replace('Doomed', 'Spared'),
  });

  assertEqual(result, { blocked: ['wireframes.md'] });
  // The untouched sibling in the same save still goes through: this refuses a file, not a save.
  assertEqual(directory.log, ['write doomed.md']);
  assert(
    directory.dump()['wireframes.md'].includes('Written on the other machine.'),
    'the folder’s version must survive'
  );
});

storageTest('a file that changed since we read it is not deleted', async () => {
  const { storage, directory } = await connectedTo({
    'wireframes.md': TASK_MD,
    'doomed.md': DOOMED_MD,
  });
  const board = await storage.unlock();
  directory.put('doomed.md', DOOMED_MD.replace('Doomed', 'Not any more'));

  const { 'doomed.md': _gone, ...without } = board;
  const result = await storage.save(without);

  assertEqual(result, { blocked: ['doomed.md'] });
  assertEqual(directory.log, []);
  assert('doomed.md' in directory.dump(), 'the file must still be there');
});

storageTest('a file that vanished elsewhere is written back, not blocked', async () => {
  const { storage, directory } = await connectedTo({ 'wireframes.md': TASK_MD });
  const board = await storage.unlock();
  await directory.removeEntry('wireframes.md');
  directory.log.length = 0;

  const result = await storage.save({
    'wireframes.md': TASK_MD.replace('Some notes.', 'Edited.'),
  });
  assertEqual(result, {});
  assertEqual(directory.log, ['write wireframes.md']);
});

storageTest('a path we have never read is not created over something', async () => {
  const { storage, directory } = await connectedTo({ 'wireframes.md': TASK_MD });
  const board = await storage.unlock();
  // Another machine got to this task first, between our read and our write.
  directory.put('worktop.md', '---\nid: worktop\ntitle: Worktop\n---\nTheirs.\n');

  const result = await storage.save({
    ...board,
    'worktop.md': '---\nid: worktop\ntitle: Worktop\n---\nOurs.\n',
  });
  assertEqual(result, { blocked: ['worktop.md'] });
  assertEqual(directory.log, []);
  assert(directory.dump()['worktop.md'].includes('Theirs.'));
});

storageTest('two saves at once do not interleave', async () => {
  const { storage, directory } = await connectedTo({
    'wireframes.md': TASK_MD,
    'doomed.md': DOOMED_MD,
  });
  await storage.unlock();

  // Exactly how `commit` calls it: started, not awaited.
  const first = storage.save({
    'wireframes.md': TASK_MD.replace('Some notes.', 'First.'),
    'doomed.md': DOOMED_MD.replace('Doomed', 'First'),
  });
  const second = storage.save({
    'wireframes.md': TASK_MD.replace('Some notes.', 'Second.'),
    'doomed.md': DOOMED_MD.replace('Doomed', 'Second'),
  });
  await Promise.all([first, second]);

  // Interleaved, the second save would read the first's file mid-write and refuse it.
  assertEqual(directory.log, [
    'write wireframes.md',
    'write doomed.md',
    'write wireframes.md',
    'write doomed.md',
  ]);
  assert(directory.dump()['wireframes.md'].includes('Second.'));
});

storageTest('a re-read notices the folder moving, and settles it', async () => {
  const { storage, directory } = await connectedTo({ 'wireframes.md': TASK_MD });
  await storage.unlock();

  assertEqual((await storage.revalidate()).changed, false);

  directory.put('wireframes.md', TASK_MD.replace('Some notes.', 'Theirs.'));
  const { files, changed } = await storage.revalidate();
  assert(changed, 'an edit elsewhere is a change');
  assert(files['wireframes.md'].includes('Theirs.'));

  // Having taken the folder's version, saving it back writes nothing at all.
  await storage.save(files);
  assertEqual(directory.log, []);
});

storageTest('a file whose id another file claimed is left where it is', async () => {
  const { storage, directory, files } = await connectedTo({
    'wireframes.md': TASK_MD,
    'wireframes 1.md': TASK_MD.replace('Some notes.', 'A copy.'),
  });
  const board = await storage.unlock();
  storage.disown(duplicateIds(board).paths);

  // The board holds one task, so `boardToFiles` names one path — the copy is simply missing
  // from the save, which is exactly what the delete loop used to act on.
  await storage.save(boardToFiles(buildBoard(board)));

  assertEqual(directory.log, []);
  assert('wireframes 1.md' in directory.dump(), 'the copy must survive');
  assert(directory.dump()['wireframes 1.md'].includes('A copy.'));
  assert('wireframes.md' in files);
});

/* ---------------------------------------------------------------- run */

const out = document.getElementById('out');
let passed = 0;
let failed = 0;

/**
 * Tests may be async — the storage ones drive a fake filesystem — so each is awaited in
 * turn. Wrapped in a function rather than run at the top level: top-level await is beyond
 * the browsers this project builds for.
 */
async function run() {
  for (const { name, tests } of groups) {
    const heading = document.createElement('h2');
    heading.textContent = name;
    out.append(heading);
    for (const { name: testName, fn } of tests) {
      const row = document.createElement('div');
      try {
        await fn();
        row.className = 'pass';
        row.textContent = `✓ ${testName}`;
        passed += 1;
      } catch (error) {
        row.className = 'fail';
        row.textContent = `✗ ${testName} — ${error.message}`;
        failed += 1;
      }
      out.append(row);
    }
  }

  const summary = document.getElementById('summary');
  summary.textContent = `${passed} passed, ${failed} failed`;
  summary.className = failed ? 'fail' : 'pass';
}

run();
