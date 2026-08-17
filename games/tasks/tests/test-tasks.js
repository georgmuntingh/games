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
  trashFromMarkdown,
  trashToMarkdown,
  pushTrash,
  TRASH_LIMIT,
} from '../model.js';
import { buildBrief, buildTaskBrief } from '../exporter.js';
import { parseJsonResponse, ACTIONS } from '../prompts.js';
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

/* ---------------------------------------------------------------- run */

const out = document.getElementById('out');
let passed = 0;
let failed = 0;

for (const { name, tests } of groups) {
  const heading = document.createElement('h2');
  heading.textContent = name;
  out.append(heading);
  for (const { name: testName, fn } of tests) {
    const row = document.createElement('div');
    try {
      fn();
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
