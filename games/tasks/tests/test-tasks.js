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

test('a project file parses its goal out of the body', () => {
  const project = projectFromMarkdown(
    '_project-website.md',
    "---\nid: website\ntitle: Website relaunch\nstart: 2026-08-01\nend: 2026-11-30\ncolor: '#2563eb'\n---\nShip self-serve signup.\n"
  );
  assertEqual(project.id, 'website');
  assertEqual(project.color, '#2563eb');
  assertEqual(project.goal, 'Ship self-serve signup.');
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

test('people and project tags are deduplicated and sorted', () => {
  assertEqual(allPeople(board.tasks), ['ada', 'georg', 'mira', 'sam']);
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
  const tasks = [
    { id: 'a', blockedBy: [], partOf: [] },
    { id: 'b', blockedBy: ['a'], partOf: [] },
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

/* --------------------------------------------------------------- brief */

describe('LLM brief');

test('includes the goal, a task table and the dependency list', () => {
  const project = board.projects.find((p) => p.id === 'website');
  const tasks = filterTasks(board.tasks, { projectId: 'website' });
  const brief = buildBrief(project, tasks, { now: Date.UTC(2026, 7, 16) });
  assert(brief.includes('# Website relaunch'), 'title');
  assert(brief.includes('## Goal'), 'goal section');
  assert(brief.includes('| id | task | due | estimate | people | subtasks |'), 'table header');
  assert(brief.includes('| wireframes | Wireframes |'), 'a task row keyed by its id');
  assert(brief.includes('- wireframes blocked-by information-architecture'), 'dependency');
  assert(brief.includes('- signup-flow part-of self-serve-signup'), 'part-of dependency');
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
