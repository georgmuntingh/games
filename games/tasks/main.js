/**
 * Tasks — wiring.
 *
 * Owns application state and connects the model, the graph, the panel, storage and the
 * assistant. Everything domain-shaped lives in the pure modules; this file is glue.
 */

import 'vis-network/styles/vis-network.css';
import { marked } from 'marked';

import {
  buildBoard,
  boardToFiles,
  duplicateProjectIds,
  sortProjects,
  visibleProjects,
  deleteProjectPlan,
  buildEdges,
  assignLevels,
  chooseBucket,
  getBucket,
  projectWindow,
  filterTasks,
  deriveStatus,
  indexById,
  allPeople,
  allProjectTags,
  projectPeople,
  syncGoalTasks,
  goalTaskId,
  mergeTaskInto,
  cyclicRefs,
  markWorking,
  pushTrash,
  uniqueSlug,
  formatDate,
  parseDate,
  totalEstimateHours,
  sameFile,
} from './model.js';
import { createGraph, LEVEL_SEPARATION_DEFAULT } from './graph.js';
import { createPanel } from './panel.js';
import { createMenu, createContextMenu } from './menu.js';
import { createStorage } from './storage.js';
import { createHistory } from './undo.js';
import { createZip } from './zip.js';
import { buildBrief } from './exporter.js';
import { ACTIONS } from './prompts.js';
import * as llm from './llm.js';

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------ demo data */

const DEMO_FILES = Object.fromEntries(
  Object.entries(
    import.meta.glob('./demo/*.md', { query: '?raw', import: 'default', eager: true })
  ).map(([path, text]) => [path.split('/').pop(), text])
);

/* ---------------------------------------------------------------- state */

// `sameFile` is the domain's opinion on when two files say the same thing; storage.js
// stays free of any notion of what a task is.
const storage = createStorage({ sameFile });
const history = createHistory({ tasks: [], projects: [], trash: [] });

/**
 * How long a tab may sit in the background before its picture of the folder is treated as
 * out of date and editing is withdrawn again.
 */
const STALE_AFTER_MS = 15 * 60 * 1000;
/** When this tab was last hidden, so returning to it can tell a blink from a night away. */
let hiddenAt = 0;

/** UI state, deliberately outside the undo history. */
const ui = {
  projectId: null,
  people: new Set(),
  hideDone: false,
  bucketUnit: 'auto',
  collapseEmpty: false,
  selectedId: null,
  selectedEdgeId: null,
  linkArmed: false,
  linkKind: 'blocks',
  autoLayout: true,
  showArchived: false,
};

const ROWS_KEY = 'tasks.rowHeight';
const readRowHeight = () => Number(localStorage.getItem(ROWS_KEY)) || LEVEL_SEPARATION_DEFAULT;

// Which mode the board is in is a preference of this browser, like the row height. Where
// each card sits is not: that belongs to the tasks themselves.
const LAYOUT_KEY = 'tasks.autoLayout';
const readAutoLayout = () => localStorage.getItem(LAYOUT_KEY) !== 'false';

// What is shelved lives in the vault; whether you are currently looking at it does not.
const ARCHIVED_KEY = 'tasks.showArchived';
const readShowArchived = () => localStorage.getItem(ARCHIVED_KEY) === 'true';

const PANEL_KEY = 'tasks.panelWidth';
/** Matches the CSS fallback in `.panel`: the width the sidebar had before it could move. */
const PANEL_WIDTH_DEFAULT = 350;
/**
 * 18rem. Below this the two-column DUE/ESTIMATE row starts costing the date field its year:
 * at 256px it renders as `08/07/202` with the picker icon over the rest.
 */
const PANEL_WIDTH_MIN = 288;
const readPanelWidth = () => Number(localStorage.getItem(PANEL_KEY)) || PANEL_WIDTH_DEFAULT;

let graph;
let panel;
let peopleMenu;
let contextMenu;
/** The view behind what is currently on the canvas, read by the drop preview. */
let currentView = null;
let pending = null; // the suggestion batch currently under review

const board = () => history.current;

function status(message, isError = false) {
  const bar = $('status-bar');
  bar.textContent = message;
  bar.classList.toggle('error', Boolean(isError));
}

/* ------------------------------------------------------------ mutations */

const now = () => new Date().toISOString();

/**
 * Load a board without recording history, reconciling the goal nodes on the way in so
 * they exist from the first paint rather than appearing after the first edit.
 */
function resetBoard(files) {
  const board = buildBoard(files);
  const { tasks } = syncGoalTasks(board);
  return history.reset({ ...board, tasks });
}

const taskRecord = (task) => ({ kind: 'task', at: now(), label: task.title, data: task });

/**
 * Whether the board may be changed at all.
 *
 * A connected folder starts read-only, so refuse the edit outright rather than letting the
 * board drift away from the files: an edit that cannot reach the disk is an edit waiting to
 * be lost, and one the user believes they have made.
 */
function requireWritable() {
  if (storage.state.writable) return true;
  status('Editing is off while this folder is read-only — use “Enable editing” above.', true);
  return false;
}

/**
 * Commit a new board: reconcile the goal nodes, record undo, persist, redraw.
 *
 * The goal sync lives here rather than at each call site so no mutation can leave a
 * project and its goal node disagreeing. A goal node whose project no longer has a goal
 * is binned like any other deletion.
 */
function commit(next, message) {
  if (!requireWritable()) return;
  const { tasks, removed } = syncGoalTasks(next);
  const trash = removed.reduce((acc, task) => pushTrash(acc, taskRecord(task)), next.trash ?? []);
  history.push({ ...next, tasks, trash });
  persist();
  render();
  if (message) status(message);
}

async function persist() {
  // Boot reconciles goal nodes and may adopt the demo board, both of which want saving —
  // but not into a folder nobody has vouched for yet. Enabling editing re-reads and
  // re-persists, so nothing owed is forgotten.
  if (!storage.state.writable) return;
  try {
    await storage.save(boardToFiles(board()));
  } catch (error) {
    status(`Could not save: ${error.message}`, true);
  }
}

const PLACEHOLDER_TITLE = 'New task';

/**
 * Ids are stable across renames — except for the very first rename of a freshly added
 * task, which is still carrying the placeholder title. Nothing can reference it yet, so
 * adopting the real slug there costs nothing and avoids a vault full of `new-task-4.md`.
 */
function shouldReslug(task, changes) {
  return (
    task.title === PLACEHOLDER_TITLE &&
    typeof changes.title === 'string' &&
    changes.title &&
    changes.title !== PLACEHOLDER_TITLE &&
    !board().tasks.some(
      (other) =>
        other.id !== task.id &&
        ((other.blockedBy ?? []).includes(task.id) || (other.partOf ?? []).includes(task.id))
    )
  );
}

/**
 * A task carrying subtasks is done exactly when all of them are.
 *
 * Applied only when the subtasks themselves change, so ticking a task directly still
 * works while it has open subtasks — the rollup never overrules a deliberate act.
 */
function withDoneRollup(task, changes) {
  if (!Array.isArray(changes.subtasks) || changes.subtasks.length === 0) return changes;
  return { ...changes, done: changes.subtasks.every((s) => s.done) };
}

/** Finishing the task you are on means you are no longer on it. */
function withWorkingRelease(task, changes) {
  if (changes.done === true && task.working) return { ...changes, working: false };
  return changes;
}

function updateTask(id, changes) {
  const task = board().tasks.find((t) => t.id === id);
  if (!task) return;
  changes = withWorkingRelease(task, withDoneRollup(task, changes));
  const newId = shouldReslug(task, changes)
    ? uniqueSlug(changes.title, new Set(board().tasks.filter((t) => t.id !== id).map((t) => t.id)))
    : id;
  const next = {
    ...board(),
    tasks: board().tasks.map((t) => (t.id === id ? { ...t, ...changes, id: newId } : t)),
  };
  if (newId !== id && ui.selectedId === id) ui.selectedId = newId;
  commit(next);
}

function addTask(fields = {}) {
  const taken = new Set(board().tasks.map((t) => t.id));
  const title = fields.title?.trim() || 'New task';
  const id = uniqueSlug(title, taken);
  const task = {
    id,
    title,
    working: false,
    // Only meaningful once the layout is manual, and harmless before then.
    x: fields.x ?? null,
    project: fields.project ?? (ui.projectId ? [ui.projectId] : []),
    people: fields.people ?? [],
    due: fields.due ?? defaultDue(),
    estimate: fields.estimate ?? '',
    created: formatDate(Date.now()),
    done: false,
    blockedBy: (fields.blockedBy ?? []).filter((ref) => taken.has(ref)),
    partOf: (fields.partOf ?? []).filter((ref) => taken.has(ref)),
    notes: fields.notes ?? '',
    subtasks: fields.subtasks ?? [],
    extra: {},
  };
  commit({ ...board(), tasks: [...board().tasks, task] }, `Added “${task.title}”.`);
  return task;
}

/** A new task lands a week out, or at the project end if that is sooner. */
function defaultDue() {
  const project = currentProject();
  const weekOut = Date.now() + 7 * 86400000;
  const end = parseDate(project?.end);
  return formatDate(end && end < weekOut ? end : weekOut);
}

function deleteTask(id) {
  const task = board().tasks.find((t) => t.id === id);
  if (!task) return;
  const next = {
    ...board(),
    // A goal node exists because its project has a goal; clearing that is what deleting
    // it means, otherwise the sync in `commit` would simply put it back.
    projects: task.goal
      ? board().projects.map((p) => (goalTaskId(p.id) === id ? { ...p, goal: '' } : p))
      : board().projects,
    tasks: board().tasks
      .filter((t) => t.id !== id)
      .map((t) => ({
        ...t,
        blockedBy: (t.blockedBy ?? []).filter((ref) => ref !== id),
        partOf: (t.partOf ?? []).filter((ref) => ref !== id),
      })),
    trash: pushTrash(board().trash, taskRecord(task)),
  };
  if (ui.selectedId === id) ui.selectedId = null;
  commit(next, `Deleted “${task.title}”. Ctrl+Z to undo, or restore from the trash.`);
}

/* ------------------------------------------------------------- edges */

/** Edge ids are built by `buildEdges`: `blocks:<from>-><to>` / `part-of:<from>-><to>`. */
function parseEdgeId(edgeId) {
  const match = /^(blocks|part-of):(.+)->(.+)$/.exec(String(edgeId ?? ''));
  if (!match) return null;
  const [, kind, from, to] = match;
  // A `blocks` edge is recorded on the dependent; a `part-of` edge on the child.
  return kind === 'blocks'
    ? { kind, from, to, ownerId: to, field: 'blockedBy', value: from }
    : { kind, from, to, ownerId: from, field: 'partOf', value: to };
}

function deleteEdge(edgeId) {
  const edge = parseEdgeId(edgeId);
  if (!edge) {
    status('That link is drawn from the goal and is not stored, so it cannot be deleted.');
    return;
  }
  const owner = board().tasks.find((t) => t.id === edge.ownerId);
  if (!owner) return;
  const label =
    edge.kind === 'blocks'
      ? `${byIdAll().get(edge.to)?.title} blocked by ${byIdAll().get(edge.from)?.title}`
      : `${byIdAll().get(edge.from)?.title} part of ${byIdAll().get(edge.to)?.title}`;
  const next = {
    ...board(),
    tasks: board().tasks.map((t) =>
      t.id === edge.ownerId
        ? { ...t, [edge.field]: (t[edge.field] ?? []).filter((ref) => ref !== edge.value) }
        : t
    ),
    trash: pushTrash(board().trash, {
      kind: 'edge',
      at: now(),
      label,
      data: { kind: edge.kind, from: edge.from, to: edge.to },
    }),
  };
  ui.selectedEdgeId = null;
  commit(next, `Unlinked. Ctrl+Z to undo, or restore from the trash.`);
}

/* ------------------------------------------------------------- trash */

function restoreTrash(index) {
  const record = board().trash?.[index];
  if (!record) return;
  const rest = board().trash.filter((_, i) => i !== index);

  if (record.kind === 'task') {
    const taken = new Set(board().tasks.map((t) => t.id));
    const task = taken.has(record.data.id)
      ? { ...record.data, id: uniqueSlug(record.data.title, taken) }
      : record.data;
    commit(
      { ...board(), tasks: [...board().tasks, task], trash: rest },
      `Restored “${task.title}”.`
    );
    return;
  }

  if (record.kind === 'project') {
    const original = record.data.project;
    const takenProjects = new Set(board().projects.map((p) => p.id));
    const project = takenProjects.has(original.id)
      ? { ...original, id: uniqueSlug(original.title, takenProjects) }
      : original;

    const taken = new Set(board().tasks.map((t) => t.id));
    const tasks = (record.data.tasks ?? []).map((task) => {
      const id = taken.has(task.id) ? uniqueSlug(task.title, taken) : task.id;
      taken.add(id);
      return {
        ...task,
        id,
        // If the project had to come back under a new id, its tasks must point at that one
        // or they would file themselves under a project nothing owns.
        project: (task.project ?? []).map((tag) => (tag === original.id ? project.id : tag)),
      };
    });

    // Tasks that merely lost the tag get it back, appended: a task that has since been
    // filed under another project stays where it is now rather than jumping folders.
    const regained = new Set(record.data.untagged ?? []);
    const rejoined = board().tasks.map((task) =>
      regained.has(task.id) && !(task.project ?? []).includes(project.id)
        ? { ...task, project: [...(task.project ?? []), project.id] }
        : task
    );

    commit(
      {
        ...board(),
        projects: [...board().projects, project],
        tasks: [...rejoined, ...tasks],
        trash: rest,
      },
      tasks.length
        ? `Restored “${project.title}” and ${tasks.length} task${tasks.length === 1 ? '' : 's'}.`
        : `Restored “${project.title}”.`
    );
    ui.projectId = project.id;
    render();
    graph.fit();
    return;
  }

  const edge = parseEdgeId(`${record.data.kind}:${record.data.from}->${record.data.to}`);
  const byId = byIdAll();
  if (!edge || !byId.has(edge.from) || !byId.has(edge.to)) {
    status('Both ends of that link would need to exist first.', true);
    return;
  }
  commit(
    {
      ...board(),
      tasks: board().tasks.map((t) =>
        t.id === edge.ownerId
          ? { ...t, [edge.field]: [...new Set([...(t[edge.field] ?? []), edge.value])] }
          : t
      ),
      trash: rest,
    },
    'Link restored.'
  );
}

/** `from` blocks `to`, or `from` is part of `to`, depending on the armed link kind. */
function link(from, to) {
  const field = ui.linkKind === 'blocks' ? 'blockedBy' : 'partOf';
  const target = ui.linkKind === 'blocks' ? to : from;
  const value = ui.linkKind === 'blocks' ? from : to;
  const task = board().tasks.find((t) => t.id === target);
  if (!task || (task[field] ?? []).includes(value)) {
    setLinkArmed(false);
    return;
  }
  if (cyclicRefs(board().tasks, target, field).has(value)) {
    setLinkArmed(false);
    status(
      `That would put “${byIdAll().get(target)?.title}” in a loop with “${byIdAll().get(value)?.title}”.`,
      true
    );
    return;
  }
  updateTask(target, { [field]: [...(task[field] ?? []), value] });
  setLinkArmed(false);
  status(
    ui.linkKind === 'blocks'
      ? `“${byIdAll().get(to)?.title}” is now blocked by “${byIdAll().get(from)?.title}”.`
      : `“${byIdAll().get(from)?.title}” is now part of “${byIdAll().get(to)?.title}”.`
  );
}

function promoteSubtask(taskId, index) {
  const parent = board().tasks.find((t) => t.id === taskId);
  const subtask = parent?.subtasks?.[index];
  if (!subtask) return;
  const taken = new Set(board().tasks.map((t) => t.id));
  const id = uniqueSlug(subtask.text, taken);
  const promoted = {
    id,
    title: subtask.text,
    project: [...(parent.project ?? [])],
    people: [...(parent.people ?? [])],
    due: parent.due,
    estimate: '',
    created: formatDate(Date.now()),
    done: subtask.done,
    blockedBy: [],
    partOf: [parent.id],
    notes: '',
    subtasks: [],
    extra: {},
  };
  const next = {
    ...board(),
    tasks: [
      ...board().tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.filter((_, i) => i !== index) } : t
      ),
      promoted,
    ],
  };
  ui.selectedId = id;
  commit(next, `“${subtask.text}” is now a task of its own.`);
}

/**
 * Set or release the task in hand. `markWorking` enforces the "one at a time" rule, and
 * doing it in a single commit means one Ctrl+Z takes back both the release and the set.
 */
function setWorking(taskId) {
  const task = taskId ? board().tasks.find((t) => t.id === taskId) : null;
  // Ticking the one already set is how you release it.
  const next = task && !task.working ? task.id : null;
  commit(
    { ...board(), tasks: markWorking(board().tasks, next) },
    next ? `Working on “${task.title}”.` : 'Not working on anything in particular.'
  );
}

const byIdAll = () => indexById(board().tasks);

/* -------------------------------------------------------------- projects */

function updateProject(id, changes) {
  commit({
    ...board(),
    projects: board().projects.map((p) => (p.id === id ? { ...p, ...changes } : p)),
  });
}

/** Cycled on creation so a new project has a visible stripe without anyone picking one. */
const PROJECT_COLORS = ['#2563eb', '#c2410c', '#15803d', '#7c3aed', '#0891b2', '#be123c'];

/** Who a new project starts with, until its roster is edited. */
const DEFAULT_PEOPLE = ['Georg', 'Oliver', 'Sverre'];

function addProject(fields = {}) {
  const taken = new Set(board().projects.map((p) => p.id));
  const title = fields.title?.trim() || 'New project';
  const id = uniqueSlug(title, taken);
  const project = {
    id,
    title,
    goal: fields.goal ?? '',
    people: fields.people ?? [...DEFAULT_PEOPLE],
    start: fields.start || formatDate(Date.now()),
    end: fields.end || formatDate(Date.now() + 90 * 86400000),
    color: fields.color || PROJECT_COLORS[board().projects.length % PROJECT_COLORS.length],
    // A project made from here gets a folder of its own, even on a board whose existing
    // projects are still flat. Nothing that already exists moves without being asked.
    folder: fields.folder ?? id,
    context: fields.context ?? '',
  };
  ui.projectId = id;
  ui.people.clear();
  ui.selectedId = null;
  commit({ ...board(), projects: [...board().projects, project] }, `Created “${title}”.`);
  // A new project holds one card at most, which is precisely when a stale viewport looks
  // like nothing was created.
  graph.fit();
  return project;
}

/**
 * Remove a project, keeping or binning its tasks. Whichever way, the whole thing is one
 * trash entry, so it comes back as it went: the project and the tasks that went with it.
 */
function deleteProject(id, { deleteTasks = false } = {}) {
  const plan = deleteProjectPlan(board(), id, { deleteTasks });
  if (!plan) return;

  ui.projectId = null;
  ui.people.clear();
  ui.selectedId = null;
  const record = {
    kind: 'project',
    at: now(),
    label: plan.project.title,
    data: { project: plan.project, tasks: plan.removed, untagged: plan.untagged },
  };
  // Through `commit` like every other mutation, rather than pushing history directly: that
  // bypassed the goal sync, so a deleted project's goal card stayed on the board with
  // nothing behind it, and it dropped the trash off the board state entirely.
  commit(
    {
      ...board(),
      projects: plan.projects,
      tasks: plan.tasks,
      trash: pushTrash(board().trash, record),
    },
    plan.removed.length
      ? `Deleted “${plan.project.title}” and ${plan.removed.length} task${plan.removed.length === 1 ? '' : 's'}. Ctrl+Z, or restore it from the trash.`
      : `Deleted “${plan.project.title}”. Its tasks kept, untagged. Ctrl+Z, or restore it from the trash.`
  );
  // Chosen from the board as it is now, with this project gone.
  ui.projectId = defaultProjectId();
  render();
  graph.fit();
}

/**
 * Tasks worth suggesting elsewhere: a task whose every project is shelved is shelved too.
 * An untagged task belongs to nothing and so is always in play.
 */
function unshelvedTasks() {
  const shelved = new Set(board().projects.filter((p) => p.archived).map((p) => p.id));
  if (!shelved.size) return board().tasks;
  return board().tasks.filter(
    (task) => !task.project?.length || task.project.some((tag) => !shelved.has(tag))
  );
}

/* ------------------------------------------------------------- view model */

/**
 * The project to show when none has been picked: the busiest one, since that is
 * almost always the one being worked on. Ties go to whichever starts first.
 */
function defaultProjectId() {
  const counts = new Map(board().projects.map((p) => [p.id, 0]));
  for (const task of board().tasks) {
    for (const id of task.project ?? []) {
      if (counts.has(id)) counts.set(id, counts.get(id) + 1);
    }
  }
  // A starred project is the one you said you work in; the busiest is only a guess. Shelved
  // projects are skipped entirely unless there is nothing else left to open.
  const live = board().projects.filter((p) => !p.archived);
  return (
    [...(live.length ? live : board().projects)]
      .sort(
        (a, b) =>
          Number(Boolean(b.starred)) - Number(Boolean(a.starred)) ||
          counts.get(b.id) - counts.get(a.id) ||
          (parseDate(a.start) ?? Infinity) - (parseDate(b.start) ?? Infinity)
      )
      .at(0)?.id ?? null
  );
}

function currentProject() {
  return (
    board().projects.find((p) => p.id === ui.projectId) ??
    board().projects.find((p) => p.id === defaultProjectId()) ??
    null
  );
}

function visibleTasks() {
  return filterTasks(board().tasks, {
    projectId: ui.projectId,
    people: [...ui.people],
    hideDone: ui.hideDone,
  });
}

const byIdDue = (tasks, id) => Boolean(tasks.find((t) => t.id === id)?.due);

function buildView() {
  const project = currentProject();
  const projectTasks = filterTasks(board().tasks, { projectId: ui.projectId });
  const tasks = visibleTasks();
  const window = projectWindow(project, projectTasks);
  const bucket =
    ui.bucketUnit === 'auto' ? chooseBucket(window.start, window.end) : getBucket(ui.bucketUnit);
  const { levels, trayLevel, minLevel, lastLevel, levelOrigin, gaps } = assignLevels(tasks, {
    bucket,
    start: window.start,
    collapse: ui.collapseEmpty,
  });

  const byId = indexById(board().tasks);
  const statuses = new Map(tasks.map((t) => [t.id, deriveStatus(t, byId)]));

  // Rule every level in range, not just the occupied ones, so an empty fortnight reads
  // as elapsed time rather than as a void. Thin the rules out when there are many.
  const hasTray = tasks.some((t) => !t.due);
  // Every row gets a rule when collapsing (there are few, and each is a real period);
  // otherwise thin them out so a long project does not turn into a hatch pattern.
  const step = ui.collapseEmpty ? 1 : Math.ceil((lastLevel + 1) / 40) || 1;
  const gutter = [];
  for (let level = 0; level <= lastLevel; level += step) {
    const origin = levelOrigin.get(level);
    if (ui.collapseEmpty && origin == null) continue;
    gutter.push({
      level,
      label: bucket.format(bucket.dateForLevel((origin ?? level) + minLevel, window.start)),
    });
  }
  if (hasTray) gutter.push({ level: trayLevel, label: 'unscheduled' });

  // Collapsing rewrites the level scale, so the now-line has to be placed on the row
  // scale rather than the raw period scale or it drifts off the board entirely.
  const rawNow = bucket.level(Date.now(), window.start) - minLevel;
  const nowLevel = !tasks.length ? null : ui.collapseEmpty ? collapsedNow(rawNow, levelOrigin) : rawNow;

  // One band per coloured project a task belongs to, in the board's project order.
  const colorOf = new Map(board().projects.filter((p) => p.color).map((p) => [p.id, p.color]));
  const projectColors = new Map(
    tasks.map((task) => [
      task.id,
      (task.project ?? []).map((id) => colorOf.get(id)).filter(Boolean),
    ])
  );

  return {
    tasks,
    levels,
    trayLevel,
    statuses,
    gutter,
    nowLevel,
    edges: buildEdges(tasks, levels),
    gaps,
    projectColors,
    selectedId: ui.selectedId,
    selectedEdgeId: ui.selectedEdgeId,
    project,
    bucket,
    minLevel,
    levelOrigin,
    windowStart: window.start,
  };
}

/**
 * Place `raw` on the collapsed row scale: inside an occupied period it sits on that
 * row, and in a skipped stretch it rests on the break between the rows either side.
 */
function collapsedNow(raw, levelOrigin) {
  const rows = [...levelOrigin.entries()].sort((a, b) => a[0] - b[0]);
  if (!rows.length) return null;
  const floor = Math.floor(raw);
  for (const [row, origin] of rows) if (origin === floor) return row + (raw - floor);
  const before = rows.filter(([, origin]) => origin < raw).pop();
  if (!before) return rows[0][0] - 0.5;
  const after = rows.find(([, origin]) => origin > raw);
  return after ? before[0] + 0.5 : before[0] + 0.5;
}

/** The due date a dropped row stands for — the period's start, the date the gutter labels. */
function dueForLevel(view, level) {
  // Above the top of the timeline still means the earliest period, not nothing.
  const row = Math.max(0, Math.round(level));
  if (row >= view.trayLevel) return '';
  const origin = view.levelOrigin.get(row);
  if (origin == null) return '';
  return formatDate(view.bucket.dateForLevel(origin + view.minLevel, view.windowStart));
}

/**
 * What can still be added to `task`'s `field`: the project's tasks, less whatever is
 * already referenced and anything that would close a loop.
 */
function eligibleRefs(task, field, projectTasks) {
  const forbidden = cyclicRefs(board().tasks, task.id, field);
  const already = new Set(task[field] ?? []);
  return projectTasks.filter((t) => !forbidden.has(t.id) && !already.has(t.id));
}

/**
 * Assign someone and put them on the project in one act, because typing a name into a
 * task is how a teammate joins in practice. One commit, so one Ctrl+Z takes back both.
 */
function addPersonToTask(taskId, name) {
  const task = board().tasks.find((t) => t.id === taskId);
  if (!task || !name) return;
  const project = currentProject();
  const add = (list) => [...new Set([...(list ?? []), name])];
  commit(
    {
      ...board(),
      projects: project
        ? board().projects.map((p) => (p.id === project.id ? { ...p, people: add(p.people) } : p))
        : board().projects,
      tasks: board().tasks.map((t) => (t.id === taskId ? { ...t, people: add(t.people) } : t)),
    },
    project
      ? `${name} joined “${project.title}” and holds “${task.title}”.`
      : `${name} holds “${task.title}”. No project to add them to.`
  );
}

/**
 * Switch between the board arranging itself and you arranging it.
 *
 * Freezing records where every card currently is, so the board holds still exactly as you
 * see it rather than collapsing into a column — and because those positions are the tasks'
 * own data, one commit makes the whole freeze a single undo step.
 */
function setAutoLayout(enabled) {
  ui.autoLayout = enabled;
  localStorage.setItem(LAYOUT_KEY, String(enabled));

  if (enabled) {
    graph.setAutoLayout(true);
    render();
    status('Auto-layout on — the board arranges the cards again.');
    return;
  }

  const positions = graph.positions();
  const tasks = board().tasks.map((task) => {
    const position = positions[task.id];
    return position ? { ...task, x: Math.round(position.x) } : task;
  });
  graph.setAutoLayout(false);
  commit({ ...board(), tasks }, 'Layout frozen — cards stay where you drop them.');
}

/* ------------------------------------------------------- folder layout */

/** How many files would land at a path they are not at now. */
function pendingMoves(from, to) {
  const before = new Set(Object.keys(boardToFiles(from)));
  return Object.keys(boardToFiles(to)).filter((path) => !before.has(path)).length;
}

/** The board as it would be with every project in a folder named after it. */
const organisedBoard = () => ({
  ...board(),
  projects: board().projects.map((project) => ({ ...project, folder: project.folder || project.id })),
});

/**
 * Give every project a folder of its own. The files themselves move on the next save, which
 * `commit` triggers — so the whole reorganisation is a single undo step, and Ctrl+Z moves
 * them back.
 */
function organiseIntoFolders() {
  const moves = pendingMoves(board(), organisedBoard());
  if (!moves) {
    status('Every project already has a folder of its own.');
    return;
  }
  commit(organisedBoard(), `Moved ${moves} file${moves === 1 ? '' : 's'} into project folders.`);
  refreshStorageState();
}

/* ------------------------------------------------------------- rendering */

function render() {
  const view = buildView();
  currentView = view;
  graph.render(view);
  renderToolbar(view);
  const selected = board().tasks.find((t) => t.id === ui.selectedId) ?? null;
  const projectTasks = filterTasks(board().tasks, { projectId: ui.projectId });
  panel.render({
    task: selected,
    tasks: projectTasks,
    allTasks: board().tasks,
    roster: projectPeople(view.project, board().tasks),
    people: allPeople(unshelvedTasks()),
    projects: [
      ...new Set([
        ...board().projects.filter((p) => !p.archived).map((p) => p.id),
        ...allProjectTags(unshelvedTasks()),
      ]),
    ],
    eligible: selected
      ? {
          blockedBy: eligibleRefs(selected, 'blockedBy', projectTasks),
          partOf: eligibleRefs(selected, 'partOf', projectTasks),
        }
      : null,
    assistantReady: Boolean(llm.getKey()),
  });
  if ($('project').open) renderProjectDialog();
  if ($('projects').open) renderManageProjects();
  if ($('trash').open) renderTrash();
  if (!$('status-bar').textContent) renderSummary(view);
}

function renderSummary(view) {
  const working = board().tasks.find((t) => t.working);
  const open = view.tasks.filter((t) => !t.done).length;
  const overdue = [...view.statuses.values()].filter((s) => s.overdue).length;
  const hours = totalEstimateHours(view.tasks.filter((t) => !t.done));
  const parts = [`${view.tasks.length} tasks`, `${open} open`];
  if (overdue) parts.push(`${overdue} overdue`);
  if (hours) parts.push(`${Math.round(hours / 8)}d of work left`);
  parts.push(`scale: ${view.bucket.label.toLowerCase()}`);
  const counts = parts.join(' · ');
  // What you are on leads, since that is the one thing you want to see without looking.
  const goal = view.project?.goal ? `${view.project.goal} — ${counts}` : counts;
  status(working ? `▶ ${working.title} · ${goal}` : goal);
}

function renderToolbar(view) {
  const picker = $('project-picker');
  // Starred to the top, shelved out of sight — but never hide the one being looked at.
  const projects = sortProjects(
    visibleProjects(board().projects, ui.showArchived).concat(
      view.project && view.project.archived && !ui.showArchived ? [view.project] : []
    )
  );
  picker.textContent = '';
  for (const project of projects) {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.starred ? `★ ${project.title}` : project.title;
    option.selected = project.id === view.project?.id;
    picker.append(option);
  }
  if (!projects.length) {
    const option = document.createElement('option');
    option.textContent = 'No project';
    picker.append(option);
  }

  renderPeopleMenu(view);

  const layoutButton = $('auto-layout');
  layoutButton.setAttribute('aria-pressed', String(ui.autoLayout));
  layoutButton.textContent = ui.autoLayout ? 'Auto-layout' : 'Manual layout';

  const linkButton = $('link-mode');
  linkButton.setAttribute('aria-pressed', String(ui.linkArmed));
  $('link-kind').textContent = ui.linkKind;
  linkButton.title = ui.linkArmed
    ? 'Drag from one task to another. Click to switch link type, Esc to cancel.'
    : 'Draw a link between two tasks (E)';
}

/**
 * The people filter: one checkbox per name, and a button that says what the filter is
 * doing. No selection means no filter at all, which is every task including the ones
 * nobody holds — so the button reads "People" rather than claiming to name anyone.
 */
function renderPeopleMenu(view) {
  // The roster as well as anyone assigned work, so a new teammate is selectable at once.
  const people = projectPeople(view.project, board().tasks)
    .map((p) => p.name)
    .sort((a, b) => a.localeCompare(b));

  // Every checkbox is rebuilt, so the one just clicked is a different element: without
  // this, keyboard focus falls back to the body after each change.
  const focused = document.activeElement?.dataset?.person;
  const checks = $('people-checks');
  checks.textContent = '';
  for (const person of people) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = ui.people.has(person);
    input.dataset.person = person;
    input.addEventListener('change', () => {
      if (input.checked) ui.people.add(person);
      else ui.people.delete(person);
      status('');
      render();
    });
    label.append(input, document.createTextNode(person));
    checks.append(label);
    if (person === focused) input.focus();
  }

  if (!people.length) {
    const empty = document.createElement('p');
    empty.className = 'muted small';
    empty.textContent = 'Nobody on this project yet.';
    checks.append(empty);
  }

  const chosen = [...ui.people];
  const button = $('people-menu');
  button.textContent = !chosen.length
    ? 'People'
    : chosen.length <= 2
      ? chosen.join(', ')
      : `${chosen.length} people`;
  button.title = chosen.length
    ? `Showing work held by ${chosen.join(', ')}`
    : 'Filter the board by person';
  // Nothing to open, and nothing the filter could usefully do.
  button.disabled = !people.length && !chosen.length;
}

/* --------------------------------------------------------- context menu */

/** The date a point on the canvas stands for, worded as the gutter words it. */
function labelForLevel(level) {
  if (!currentView || level == null) return '';
  const due = dueForLevel(currentView, level);
  return due ? currentView.bucket.format(parseDate(due)) : 'unscheduled';
}

/**
 * Flip a link between its two meanings while leaving the arrow pointing the same way: a
 * `blocks` edge from A to B becomes "A is part of B", which is the same claim about
 * direction and a different one about kind.
 */
function flipEdge(edgeId) {
  const edge = parseEdgeId(edgeId);
  if (!edge) return;
  const kind = edge.kind === 'blocks' ? 'part-of' : 'blocks';
  const owner = kind === 'blocks' ? edge.to : edge.from;
  const field = kind === 'blocks' ? 'blockedBy' : 'partOf';
  const value = kind === 'blocks' ? edge.from : edge.to;
  if (cyclicRefs(board().tasks, owner, field).has(value)) {
    status('Flipping that link would put the two tasks in a loop.', true);
    return;
  }
  const stripped = board().tasks.map((t) =>
    t.id === edge.ownerId
      ? { ...t, [edge.field]: (t[edge.field] ?? []).filter((ref) => ref !== edge.value) }
      : t
  );
  ui.selectedEdgeId = null;
  commit(
    {
      ...board(),
      tasks: stripped.map((t) =>
        t.id === owner ? { ...t, [field]: [...new Set([...(t[field] ?? []), value])] } : t
      ),
    },
    `Now a ${kind} link. Ctrl+Z to undo.`
  );
}

/** What right-clicking each kind of thing offers. */
function contextItems(target) {
  if (target.kind === 'node') {
    const task = board().tasks.find((t) => t.id === target.id);
    if (!task) return [];
    return [
      {
        label: task.working ? 'Stop working on this' : '▶ Working on this',
        run: () => setWorking(task.id),
      },
      {
        label: task.done ? 'Reopen' : 'Mark complete',
        run: () => updateTask(task.id, { done: !task.done }),
      },
      ...(task.due ? [{ label: 'Unschedule', run: () => updateTask(task.id, { due: '' }) }] : []),
      { label: 'Delete task', run: () => deleteTask(task.id), danger: true },
    ];
  }

  if (target.kind === 'edge') {
    const edge = parseEdgeId(target.id);
    if (!edge) return [{ label: 'This link is drawn from the goal and is not stored', run: null }];
    return [
      {
        label: edge.kind === 'blocks' ? 'Make it a part-of link' : 'Make it a blocks link',
        run: () => flipEdge(target.id),
      },
      { label: 'Delete link', run: () => deleteEdge(target.id), danger: true },
    ];
  }

  const label = labelForLevel(target.level);
  return [
    {
      label: label === 'unscheduled' ? 'New unscheduled task here' : `New task here — ${label}`,
      run: () => addTaskAt(target),
    },
    { label: 'New unscheduled task', run: () => addTaskAt({ ...target, level: null }) },
  ];
}

/** A task on the row that was clicked, and at the x that was clicked when that is ours. */
function addTaskAt(target) {
  const due = target.level == null || !currentView ? '' : dueForLevel(currentView, target.level);
  const task = addTask({ due, x: ui.autoLayout ? null : target.x });
  ui.selectedId = task.id;
  render();
  panel.focusTitle();
}

function openContextMenu(target) {
  const items = contextItems(target);
  const panelEl = $('context-menu');
  panelEl.textContent = '';
  if (!items.length) return;

  for (const item of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = item.danger ? 'menu-item danger' : 'menu-item';
    button.textContent = item.label;
    button.disabled = !item.run;
    button.addEventListener('click', () => {
      contextMenu.close();
      item.run?.();
    });
    panelEl.append(button);
  }
  contextMenu.openAt(target.client.x, target.client.y);
}

/* --------------------------------------------------------- sidebar width */

/** Never past half the workspace, so the board always keeps the other half. */
function panelWidthRange() {
  const workspace = document.querySelector('.workspace').getBoundingClientRect().width;
  return { min: PANEL_WIDTH_MIN, max: Math.max(PANEL_WIDTH_MIN, Math.round(workspace / 2)) };
}

/**
 * Apply a sidebar width, clamped, and tell assistive tech what it became. Returns the width
 * actually used so callers can report it.
 */
function setPanelWidth(px, { persist = true } = {}) {
  const { min, max } = panelWidthRange();
  const width = Math.round(Math.min(Math.max(px, min), max));

  $('panel').style.setProperty('--panel-w', `${width}px`);
  const handle = $('panel-resize');
  handle.setAttribute('aria-valuenow', String(width));
  handle.setAttribute('aria-valuemin', String(min));
  handle.setAttribute('aria-valuemax', String(max));
  if (persist) localStorage.setItem(PANEL_KEY, String(width));
  return width;
}

function wirePanelResize() {
  const handle = $('panel-resize');
  const panel = $('panel');
  // Read back from the box rather than from what was last asked for: `max-width: 50vw` can
  // have clamped it, and a drag should carry on from where the sidebar actually is.
  const currentWidth = () => panel.getBoundingClientRect().width;
  const report = (width) => status(`Sidebar ${width}px.`);
  let startX = 0;
  let startWidth = 0;

  handle.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    startWidth = currentWidth();
    // Capturing the pointer keeps the drag alive over the canvas, with no document-level
    // listeners to add and remove around it.
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add('resizing');
    event.preventDefault();
  });

  handle.addEventListener('pointermove', (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    // Leftwards widens. Not persisted per frame — the drop is what settles it.
    setPanelWidth(startWidth + (startX - event.clientX), { persist: false });
  });

  const finish = (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    handle.releasePointerCapture(event.pointerId);
    document.body.classList.remove('resizing');
    report(setPanelWidth(currentWidth()));
  };
  handle.addEventListener('pointerup', finish);
  handle.addEventListener('pointercancel', finish);

  // A separator only a mouse can move is no separator at all.
  handle.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 64 : 16;
    const delta = event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0;
    if (!delta) return;
    event.preventDefault();
    report(setPanelWidth(currentWidth() + delta));
  });

  handle.addEventListener('dblclick', () => report(setPanelWidth(PANEL_WIDTH_DEFAULT)));
}

/* ------------------------------------------------------- managing projects */

/** Tasks a project actually holds, goal nodes aside — they are the project's own doing. */
const projectTaskCount = (id) =>
  board().tasks.filter((t) => !t.goal && (t.project ?? []).includes(id)).length;

function renderManageProjects() {
  const list = $('manage-list');
  list.textContent = '';
  $('show-archived').checked = ui.showArchived;

  const projects = sortProjects(board().projects);
  if (!projects.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'No projects yet.';
    list.append(empty);
    return;
  }

  for (const project of projects) {
    const li = document.createElement('li');
    if (project.archived) li.className = 'archived';

    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'star';
    star.textContent = project.starred ? '★' : '☆';
    star.title = project.starred ? 'Starred — shown first' : 'Star to keep it at the top';
    star.setAttribute('aria-pressed', String(Boolean(project.starred)));
    star.addEventListener('click', () => {
      updateProject(project.id, { starred: !project.starred });
      renderManageProjects();
    });

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = project.title;

    const count = document.createElement('span');
    count.className = 'why';
    const tasks = projectTaskCount(project.id);
    count.textContent = `${tasks} task${tasks === 1 ? '' : 's'}${project.archived ? ' · archived' : ''}`;

    const archive = document.createElement('button');
    archive.type = 'button';
    archive.textContent = project.archived ? 'Unarchive' : 'Archive';
    archive.addEventListener('click', () => {
      updateProject(project.id, { archived: !project.archived });
      // Never leave the board on a project that was just put away.
      if (!project.archived && ui.projectId === project.id) {
        ui.projectId = defaultProjectId();
        render();
        graph.fit();
      }
      renderManageProjects();
      status(project.archived ? `“${project.title}” is back.` : `Archived “${project.title}”.`);
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'danger';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => askDeleteProject(project.id));

    li.append(star, name, count, archive, remove);
    list.append(li);
  }
}

/** Which projects would keep a task alive if this one were deleted, and how many. */
function rescuedByOthers(id) {
  const rescued = board().tasks.filter(
    (t) => !t.goal && (t.project ?? []).includes(id) && (t.project ?? []).some((tag) => tag !== id)
  );
  const others = new Set(rescued.flatMap((t) => (t.project ?? []).filter((tag) => tag !== id)));
  const titles = [...others]
    .map((tag) => board().projects.find((p) => p.id === tag)?.title ?? tag)
    .sort((a, b) => a.localeCompare(b));
  return { count: rescued.length, titles };
}

/** The project awaiting an answer in the delete dialog. */
let pendingDelete = null;

function askDeleteProject(id) {
  const project = board().projects.find((p) => p.id === id);
  if (!project) return;
  pendingDelete = id;

  const tasks = projectTaskCount(id);
  const { count, titles } = rescuedByOthers(id);
  $('pd-heading').textContent = `Delete “${project.title}”?`;
  $('pd-detail').textContent = !tasks
    ? 'It holds no tasks.'
    : count
      ? // The part of the rule nobody could guess: shared tasks are not this project's to bin.
        `${tasks} task${tasks === 1 ? '' : 's'} here, ${count} of them also in ${titles.join(', ')} — those stay, and move there.`
      : `${tasks} task${tasks === 1 ? '' : 's'} here, in this project only.`;
  // With no tasks, or none this project alone holds, there is no choice left to offer.
  const nothingToBin = tasks === count;
  $('pd-delete').hidden = nothingToBin;
  $('pd-keep').textContent = nothingToBin ? 'Delete project' : 'Keep the tasks';
  if (!$('delete-confirm').open) $('delete-confirm').showModal();
}

function finishDeleteProject(deleteTasks) {
  const id = pendingDelete;
  pendingDelete = null;
  $('delete-confirm').close();
  if (!id) return;
  deleteProject(id, { deleteTasks });
  if ($('projects').open) renderManageProjects();
  if ($('project').open) $('project').close();
}

/* ---------------------------------------------------------- link arming */

function setLinkArmed(armed, kind) {
  if (kind) ui.linkKind = kind;
  ui.linkArmed = armed;
  if (armed) {
    graph.startLinkMode();
    status(`Linking (${ui.linkKind}): drag from one task to another. Esc to cancel.`);
  } else {
    graph.stopLinkMode();
    status('');
  }
  renderToolbar(buildView());
}

/* --------------------------------------------------------------- boards */

async function setBoardFromFiles(files, message) {
  resetBoard(files);
  const clashes = duplicateProjectIds(files);
  ui.projectId = defaultProjectId();
  ui.people.clear();
  ui.selectedId = null;
  await persist();
  status(
    clashes.length
      ? `${message ?? ''} Two folders claim ${clashes.join(', ')} — using the first of each.`.trim()
      : (message ?? '')
  );
  render();
}

/* ------------------------------------------------------------ assistant */

/**
 * Render the project goal as markdown. Raw HTML in the source is neutralised first:
 * these files can come from an imported vault, so they are not trusted markup.
 */
function renderGoal() {
  const project = currentProject();
  const goal = project?.goal ?? '';
  const context = project?.context ?? '';
  const element = $('assist-goal');
  element.hidden = !goal && !context;
  element.innerHTML = goal ? marked.parse(goal.replace(/</g, '&lt;')) : '';
  if (context) {
    // Say what else is going with the request, so the cost is never a surprise.
    const words = context.trim().split(/\s+/).length;
    const note = document.createElement('p');
    note.className = 'muted small';
    note.textContent = `plus ${words} word${words === 1 ? '' : 's'} of context`;
    element.append(note);
  }
}

function openSuggestions(title) {
  renderGoal();
  $('suggest-title').textContent = title;
  $('suggest-list').textContent = '';
  $('suggest-raw').hidden = true;
  $('suggest-foot').hidden = true;
  $('suggest-status').textContent = '';
  if (!$('suggestions').open) $('suggestions').showModal();
}

function showRaw(text) {
  $('suggest-raw-body').textContent = text ?? '';
  $('suggest-raw').hidden = !text;
}

async function runAssist(actionId, taskId = null) {
  const action = ACTIONS[actionId];
  if (!action) return;
  if (!llm.getKey()) {
    openSettings();
    status('Add an OpenRouter key to use the assistant.', true);
    return;
  }
  const task = taskId ? board().tasks.find((t) => t.id === taskId) : null;
  openSuggestions(action.title);
  $('suggest-status').textContent = `Asking ${llm.getModel()}…`;

  try {
    const { suggestions, raw } = await llm.runAction(action, {
      project: currentProject(),
      tasks: filterTasks(board().tasks, { projectId: ui.projectId }),
      task,
    });
    showRaw(raw);
    if (!suggestions.length) {
      $('suggest-status').textContent = 'The model had nothing to add.';
      return;
    }
    pending = { actionId, taskId, suggestions };
    $('suggest-status').textContent = `${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'} — nothing changes until you accept.`;
    renderSuggestions();
  } catch (error) {
    $('suggest-status').textContent = error.message;
    showRaw(error.raw);
  }
}

/**
 * Every suggestion is a form, expanded and editable before it is accepted. The model's
 * proposal is a starting point rather than a verdict, and `draft` — not the original
 * suggestion — is what `acceptSuggestion` reads.
 */
function draftFor(suggestion) {
  if (suggestion.kind === 'subtask') return { text: suggestion.label };
  if (suggestion.kind === 'estimate') return { estimate: suggestion.estimate };
  return {
    title: suggestion.task?.title ?? suggestion.label,
    notes: suggestion.task?.notes ?? '',
    due: suggestion.task?.due ?? '',
    estimate: suggestion.task?.estimate ?? '',
    people: (suggestion.task?.people ?? []).join(', '),
    blockedBy: suggestion.task?.blockedBy ?? [],
  };
}

/** A labelled control bound straight to the draft it edits. */
function draftField(draft, key, label, { type = 'text', list = '', rows = 0 } = {}) {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  const name = document.createElement('span');
  name.textContent = label;
  const input = document.createElement(rows ? 'textarea' : 'input');
  if (rows) input.rows = rows;
  else input.type = type;
  if (list) input.setAttribute('list', list);
  input.value = draft[key] ?? '';
  input.addEventListener('input', () => {
    draft[key] = input.value;
  });
  wrap.append(name, input);
  return wrap;
}

function renderSuggestions() {
  const list = $('suggest-list');
  list.textContent = '';
  $('suggest-foot').hidden = !pending?.suggestions.some((s) => !s.resolved);

  pending?.suggestions.forEach((suggestion, index) => {
    suggestion.draft ??= draftFor(suggestion);
    const draft = suggestion.draft;
    const li = document.createElement('li');
    if (suggestion.resolved) li.className = 'resolved';

    const body = document.createElement('div');
    body.className = 'suggest-body';

    if (suggestion.kind === 'subtask') {
      body.append(draftField(draft, 'text', 'Subtask'));
    } else if (suggestion.kind === 'estimate') {
      body.append(draftField(draft, 'estimate', 'Estimate'));
    } else {
      body.append(draftField(draft, 'title', 'Task'));
      const grid = document.createElement('div');
      grid.className = 'suggest-grid';
      grid.append(
        draftField(draft, 'due', 'Due', { type: 'date' }),
        draftField(draft, 'estimate', 'Estimate'),
        draftField(draft, 'people', 'People', { list: 'people-list' })
      );
      body.append(grid, draftField(draft, 'notes', 'Notes', { rows: 2 }));
      if (draft.blockedBy.length) {
        const blocked = document.createElement('span');
        blocked.className = 'why';
        blocked.textContent = `blocked by ${draft.blockedBy.join(', ')}`;
        body.append(blocked);
      }
    }

    if (suggestion.detail) {
      const why = document.createElement('span');
      why.className = 'why';
      why.textContent = suggestion.detail;
      body.append(why);
    }

    for (const input of body.querySelectorAll('input, textarea')) {
      input.disabled = Boolean(suggestion.resolved);
    }

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'accept';
    accept.textContent = '\u2713';
    accept.title = 'Accept';
    accept.disabled = Boolean(suggestion.resolved);
    accept.addEventListener('click', () => acceptSuggestion(index));

    const reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'reject';
    reject.textContent = '\u2715';
    reject.title = 'Dismiss';
    reject.disabled = Boolean(suggestion.resolved);
    reject.addEventListener('click', () => {
      pending.suggestions[index].resolved = 'rejected';
      renderSuggestions();
    });

    li.append(body, accept, reject);
    list.append(li);
  });
}

const splitPeople = (text) =>
  String(text ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

function acceptSuggestion(index) {
  const suggestion = pending?.suggestions[index];
  if (!suggestion || suggestion.resolved) return;
  const draft = suggestion.draft ?? draftFor(suggestion);
  const task = pending.taskId ? board().tasks.find((t) => t.id === pending.taskId) : null;

  if (suggestion.kind === 'subtask' && task) {
    const text = draft.text.trim();
    if (!text) return;
    updateTask(task.id, { subtasks: [...task.subtasks, { done: false, text }] });
  } else if (suggestion.kind === 'estimate' && task) {
    updateTask(task.id, { estimate: draft.estimate.trim() });
  } else if (suggestion.kind === 'task') {
    const title = draft.title.trim();
    if (!title) return;
    addTask({
      title,
      due: draft.due || defaultDue(),
      estimate: draft.estimate.trim(),
      people: splitPeople(draft.people),
      notes: draft.notes.trim(),
      blockedBy: draft.blockedBy,
    });
  }
  suggestion.resolved = 'accepted';
  renderSuggestions();
}

/* ------------------------------------------------------------- settings */

/* ---------------------------------------------------------- trash dialog */

const TRASH_LABEL = { task: 'task', edge: 'link', project: 'project' };

/** What a trash row says it holds — a project entry carries its tasks with it. */
function trashDetail(record) {
  const count = record.kind === 'project' ? (record.data.tasks?.length ?? 0) : 0;
  if (!count) return TRASH_LABEL[record.kind] ?? record.kind;
  return `project · with ${count} task${count === 1 ? '' : 's'}`;
}

function renderTrash() {
  const list = $('trash-list');
  list.textContent = '';
  const trash = board().trash ?? [];
  $('trash-count').textContent = trash.length
    ? `${trash.length} item${trash.length === 1 ? '' : 's'}`
    : '';
  $('trash-empty').disabled = !trash.length;

  if (!trash.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'Nothing deleted yet.';
    list.append(empty);
    return;
  }

  trash.forEach((record, index) => {
    const li = document.createElement('li');

    const body = document.createElement('div');
    const label = document.createElement('span');
    label.textContent = record.label || '(untitled)';
    const meta = document.createElement('span');
    meta.className = 'why';
    meta.textContent = `${trashDetail(record)} · ${record.at.slice(0, 10)}`;
    body.append(label, meta);

    const restore = document.createElement('button');
    restore.type = 'button';
    restore.textContent = 'Restore';
    restore.addEventListener('click', () => {
      restoreTrash(index);
      renderTrash();
    });

    li.append(body, restore);
    list.append(li);
  });
}

/* -------------------------------------------------------- project dialog */

/** 'edit' fills the dialog from the current project; 'create' opens it blank. */
let projectMode = 'edit';
/** Fields held while creating, since there is no project to write through to yet. */
let draftProject = null;

const projectFieldIds = ['p-title', 'p-goal', 'p-start', 'p-end', 'p-context', 'p-color'];

function editedProject() {
  return projectMode === 'create' ? draftProject : currentProject();
}

function renderProjectDialog() {
  const project = editedProject();
  const creating = projectMode === 'create';
  $('project-heading').textContent = creating ? 'New project' : 'Project';
  $('project-create').hidden = !creating;
  $('project-delete').hidden = creating;

  const enabled = Boolean(project);
  for (const id of projectFieldIds) $(id).disabled = !enabled;
  $('p-people-new').disabled = !enabled;
  $('project-delete').disabled = !enabled;
  if (!project) {
    for (const id of projectFieldIds) $(id).value = '';
    $('p-people').textContent = '';
    $('p-people-hint').textContent = '';
    return;
  }

  // Leave whichever field is being typed in alone, so a re-render never steals a keystroke.
  const untouched = (id) => document.activeElement?.id !== id;
  if (untouched('p-title')) $('p-title').value = project.title ?? '';
  if (untouched('p-goal')) $('p-goal').value = project.goal ?? '';
  if (untouched('p-context')) $('p-context').value = project.context ?? '';
  $('p-start').value = project.start || '';
  $('p-end').value = project.end || '';
  $('p-color').value = project.color || '#2563eb';
  renderRoster(project);
}

function renderRoster(project) {
  const list = $('p-people');
  list.textContent = '';
  const people = creatingOrSaved(project);

  for (const person of people) {
    const li = document.createElement('li');
    if (!person.inRoster) li.className = 'absent';
    li.title = person.inRoster
      ? `${person.name} is on the roster`
      : `${person.name} holds tasks here but is not on the roster`;

    const name = document.createElement('span');
    name.textContent = person.name;
    li.append(name);

    if (person.openTasks) {
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = String(person.openTasks);
      count.title = `${person.openTasks} open task${person.openTasks === 1 ? '' : 's'}`;
      li.append(count);
    }

    const action = document.createElement('button');
    action.type = 'button';
    action.textContent = person.inRoster ? '✕' : '+';
    action.title = person.inRoster ? 'Remove from roster' : 'Add to roster';
    action.addEventListener('click', () =>
      setRoster(
        person.inRoster
          ? roster().filter((n) => n !== person.name)
          : [...roster(), person.name]
      )
    );
    li.append(action);
    list.append(li);
  }

  const absent = people.filter((p) => !p.inRoster).length;
  $('p-people-hint').textContent = absent
    ? `${absent} holding tasks but not on the roster`
    : '';
}

/** In create mode there are no tasks yet, so the roster is all there is. */
function creatingOrSaved(project) {
  if (projectMode === 'create') {
    return (project.people ?? []).map((name) => ({ name, inRoster: true, openTasks: 0 }));
  }
  return projectPeople(project, board().tasks);
}

const roster = () => editedProject()?.people ?? [];

function setRoster(names) {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  writeProjectField('people', unique);
}

/** Route an edit to the live project, or to the draft when creating. */
function writeProjectField(key, value) {
  if (projectMode === 'create') {
    draftProject = { ...draftProject, [key]: value };
    renderProjectDialog();
    return;
  }
  const project = currentProject();
  // Committing a value the project already holds would spend an undo step on nothing, which
  // is exactly what a debounced keystroke and the blur that follows it would otherwise do.
  const unchanged = Array.isArray(value)
    ? JSON.stringify(project?.[key] ?? []) === JSON.stringify(value)
    : (project?.[key] ?? '') === value;
  if (project && !unchanged) updateProject(project.id, { [key]: value });
  renderProjectDialog();
}

function openProject(mode = 'edit') {
  projectMode = mode;
  draftProject =
    mode === 'create'
      ? {
          title: '',
          goal: '',
          people: [...DEFAULT_PEOPLE],
          start: formatDate(Date.now()),
          end: formatDate(Date.now() + 90 * 86400000),
          color: PROJECT_COLORS[board().projects.length % PROJECT_COLORS.length],
          context: '',
        }
      : null;
  renderProjectDialog();
  if (!$('project').open) $('project').showModal();
  $('p-title').focus();
}

function openSettings() {
  refreshStorageState();
  $('api-key').value = llm.getKey();
  if (!$('settings').open) $('settings').showModal();
  if (!$('model-picker').options.length) loadModels();
}

/** Show or hide the read-only strip above the board. */
function refreshReadOnly() {
  const { writable, folderName } = storage.state;
  $('readonly-bar').hidden = writable;
  if (writable) return;
  $('readonly-text').textContent =
    `Reading “${folderName}” — editing is off. Make sure Obsidian has finished syncing ` +
    'this vault, then enable editing.';
}

function refreshStorageState() {
  const { mode, folderName, supportsFolder, reconnectable, writable } = storage.state;
  refreshReadOnly();
  const text =
    mode === 'folder'
      ? writable
        ? `Reading and writing .md files in “${folderName}”.`
        : `Reading .md files in “${folderName}”. Editing is off until you enable it.`
      : reconnectable
        ? 'A folder was connected before. Click “Open folder…” to reconnect it.'
        : supportsFolder
          ? 'Saving to this browser only.'
          : 'Saving to this browser only — this browser cannot open folders.';
  const foldered = board().projects.filter((p) => p.folder).length;
  const layout =
    mode === 'folder' && board().projects.length
      ? foldered === board().projects.length
        ? ' Every project has its own subfolder.'
        : ` ${foldered} of ${board().projects.length} projects have their own subfolder.`
      : '';
  $('storage-state').textContent = text + layout;
  $('connect-folder').disabled = !supportsFolder;
  $('disconnect-folder').disabled = mode !== 'folder';

  const moves = pendingMoves(board(), organisedBoard());
  $('organise-folders').disabled = !moves || !writable;
  $('organise-state').textContent = moves
    ? `Would move ${moves} file${moves === 1 ? '' : 's'} into project folders. Nothing is deleted.`
    : 'Nothing to move.';
}

async function loadModels() {
  const picker = $('model-picker');
  picker.textContent = '';
  const placeholder = document.createElement('option');
  placeholder.textContent = 'Loading models…';
  picker.append(placeholder);
  try {
    const models = await llm.fetchModels();
    const chosen = llm.getModel();
    picker.textContent = '';
    for (const model of models.slice(0, 120)) {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = `${model.name} — ${llm.formatPrice(model.price)}`;
      option.selected = model.id === chosen;
      picker.append(option);
    }
    if (!models.some((m) => m.id === chosen)) {
      const option = document.createElement('option');
      option.value = chosen;
      option.textContent = `${chosen} (current)`;
      option.selected = true;
      picker.prepend(option);
    }
  } catch (error) {
    picker.textContent = '';
    const option = document.createElement('option');
    option.value = llm.getModel();
    option.textContent = `${llm.getModel()} — model list unavailable`;
    picker.append(option);
    status(`Could not load models: ${error.message}`, true);
  }
}

/* -------------------------------------------------------- import/export */

function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportZip() {
  const files = boardToFiles(board());
  const bytes = createZip(files);
  download('tasks.zip', new Blob([bytes], { type: 'application/zip' }));
  status(`Exported ${Object.keys(files).length} markdown files.`);
}

async function importFiles(fileList) {
  if (!requireWritable()) return;
  const files = { ...boardToFiles(board()) };
  for (const file of fileList) {
    if (!/\.md$/i.test(file.name)) continue;
    files[file.name] = await file.text();
  }
  await setBoardFromFiles(files, `Imported ${fileList.length} files.`);
}

async function copyBrief() {
  const text = buildBrief(currentProject(), filterTasks(board().tasks, { projectId: ui.projectId }));
  try {
    await navigator.clipboard.writeText(text);
    status('Project brief copied to the clipboard.');
  } catch {
    download('brief.md', new Blob([text], { type: 'text/markdown' }));
    status('Clipboard unavailable — downloaded the brief instead.');
  }
}

/* ------------------------------------------------------------------ boot */

function wireEvents() {
  $('project-picker').addEventListener('change', (event) => {
    ui.projectId = event.target.value;
    peopleMenu?.close();
    ui.people.clear();
    ui.selectedId = null;
    status('');
    render();
    // Land looking at the project you picked, rather than at wherever the last one was.
    graph.fit();
  });

  peopleMenu = createMenu($('people-menu'), $('people-options'));
  contextMenu = createContextMenu($('context-menu'));

  const setPeopleFilter = (names) => {
    ui.people.clear();
    for (const name of names) ui.people.add(name);
    status('');
    render();
  };
  $('people-all').addEventListener('click', () =>
    setPeopleFilter(projectPeople(currentProject(), board().tasks).map((p) => p.name))
  );
  $('people-none').addEventListener('click', () => setPeopleFilter([]));

  $('hide-done').addEventListener('change', (event) => {
    ui.hideDone = event.target.checked;
    status('');
    render();
  });

  $('collapse-empty').addEventListener('change', (event) => {
    ui.collapseEmpty = event.target.checked;
    status('');
    render();
    graph.fit();
  });

  const stepRows = (delta) => {
    const applied = graph.setLevelSeparation(readRowHeight() + delta);
    localStorage.setItem(ROWS_KEY, String(applied));
    // vis re-spaces the rows itself while it owns the layout; off auto-layout the y of
    // every card is ours to restate, which a render does from the board's own data.
    if (!ui.autoLayout) render();
    status(`Row height ${applied}px.`);
  };
  $('rows-tighter').addEventListener('click', () => stepRows(-16));
  $('rows-looser').addEventListener('click', () => stepRows(16));

  $('trash-open').addEventListener('click', () => {
    renderTrash();
    if (!$('trash').open) $('trash').showModal();
  });
  $('trash-empty').addEventListener('click', () => {
    if (!board().trash?.length) return;
    commit({ ...board(), trash: [] }, 'Trash emptied.');
    renderTrash();
  });

  $('bucket').addEventListener('change', (event) => {
    ui.bucketUnit = event.target.value;
    status('');
    render();
  });

  $('add-task').addEventListener('click', () => {
    const task = addTask();
    ui.selectedId = task.id;
    render();
    panel.focusTitle();
  });

  $('link-mode').addEventListener('click', () => {
    if (ui.linkArmed) setLinkArmed(true, ui.linkKind === 'blocks' ? 'part-of' : 'blocks');
    else setLinkArmed(true);
  });

  wirePanelResize();
  $('projects-open').addEventListener('click', () => {
    renderManageProjects();
    if (!$('projects').open) $('projects').showModal();
  });
  $('show-archived').addEventListener('change', (event) => {
    ui.showArchived = event.target.checked;
    localStorage.setItem(ARCHIVED_KEY, String(ui.showArchived));
    render();
  });
  $('pd-keep').addEventListener('click', () => finishDeleteProject(false));
  $('pd-delete').addEventListener('click', () => finishDeleteProject(true));
  $('pd-cancel').addEventListener('click', () => {
    pendingDelete = null;
    $('delete-confirm').close();
  });

  $('organise-folders').addEventListener('click', organiseIntoFolders);
  $('auto-layout').addEventListener('click', () => setAutoLayout(!ui.autoLayout));
  $('fit').addEventListener('click', () => graph.fit());
  $('assist').addEventListener('click', () => {
    openSuggestions('Assistant');
    $('suggest-status').textContent = 'Pick an action. Nothing changes until you accept.';
  });
  $('settings-open').addEventListener('click', openSettings);

  document.querySelectorAll('#assist-actions button').forEach((button) => {
    button.addEventListener('click', () => runAssist(button.dataset.action));
  });

  $('accept-all').addEventListener('click', () => {
    pending?.suggestions.forEach((_, index) => acceptSuggestion(index));
  });
  $('reject-all').addEventListener('click', () => {
    pending = null;
    $('suggestions').close();
  });

  $('api-key').addEventListener('change', (event) => {
    llm.setKey(event.target.value.trim());
    render();
    status(event.target.value.trim() ? 'API key saved in this browser.' : 'API key cleared.');
  });
  $('clear-key').addEventListener('click', () => {
    llm.setKey('');
    $('api-key').value = '';
    render();
    status('API key cleared.');
  });
  $('model-picker').addEventListener('change', (event) => llm.setModel(event.target.value));
  $('refresh-models').addEventListener('click', loadModels);

  $('connect-folder').addEventListener('click', async () => {
    try {
      const files = await storage.connectFolder();
      refreshStorageState();
      if (Object.keys(files).length) {
        await setBoardFromFiles(files, `Opened “${storage.state.folderName}” read-only.`);
      } else {
        // Nothing is written here. A folder can read as empty precisely because sync has
        // not caught up yet, and writing the current board into it is how a vault gets
        // replaced by a demo board.
        status(
          `Opened “${storage.state.folderName}”, which has no .md files in it. ` +
            'If that looks wrong, let Obsidian finish syncing before enabling editing.'
        );
      }
    } catch (error) {
      if (error.name !== 'AbortError') status(error.message, true);
    }
  });
  $('enable-editing').addEventListener('click', async () => {
    try {
      // The re-read happens inside `unlock`, so what gets enabled is editing of the folder
      // as it stands now — not as it stood when this tab opened.
      const files = await storage.unlock();
      if (!files) return;
      await setBoardFromFiles(files, `Editing “${storage.state.folderName}”.`);
      refreshStorageState();
    } catch (error) {
      status(`Could not re-read the folder: ${error.message}`, true);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    const away = hiddenAt && Date.now() - hiddenAt;
    hiddenAt = 0;
    if (!away || away < STALE_AFTER_MS) return;
    if (storage.state.mode !== 'folder' || !storage.state.writable) return;
    storage.lock();
    refreshStorageState();
    status('This tab has been away a while — editing is off until you confirm the folder is up to date.');
  });

  $('disconnect-folder').addEventListener('click', () => {
    storage.disconnectFolder();
    refreshStorageState();
    status('Disconnected. Saving to this browser only.');
  });

  $('project-open').addEventListener('click', () =>
    openProject(currentProject() ? 'edit' : 'create')
  );
  $('project-new').addEventListener('click', () => openProject('create'));

  /**
   * Project fields, committed as you type rather than only when you leave them.
   *
   * The dialog is a sheet with the board still visible around it, so typing an end goal and
   * watching no card appear reads as the goal being ignored — which is exactly how this was
   * reported. Waiting for a blur is too late when the result is on screen behind you.
   *
   * Debounced, so a typed sentence costs an undo step or two rather than one per keystroke,
   * and only for the text fields: a colour picker fires `input` continuously while dragging,
   * and a date is committed by the picker itself.
   */
  const projectField = (elementId, key, transform = (v) => v.trim(), live = true) => {
    const element = $(elementId);
    const write = () => writeProjectField(key, transform(element.value));
    element.addEventListener('change', write);
    if (!live) return;
    let pending = null;
    element.addEventListener('input', () => {
      clearTimeout(pending);
      pending = setTimeout(write, 400);
    });
  };
  projectField('p-title', 'title');
  projectField('p-goal', 'goal');
  projectField('p-start', 'start', (v) => v.trim(), false);
  projectField('p-end', 'end', (v) => v.trim(), false);
  projectField('p-color', 'color', (v) => v.trim(), false);
  projectField('p-context', 'context', (v) => v.replace(/\s+$/, ''));

  $('p-people-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('p-people-new').value.trim();
    if (!name) return;
    $('p-people-new').value = '';
    setRoster([...roster(), name]);
  });

  $('project-create').addEventListener('click', () => {
    addProject(draftProject);
    projectMode = 'edit';
    draftProject = null;
    renderProjectDialog();
  });

  $('project-delete').addEventListener('click', () => {
    const project = currentProject();
    if (!project) return;
    // Only asks; `finishDeleteProject` closes this dialog if the answer is yes.
    askDeleteProject(project.id);
  });

  $('export-zip').addEventListener('click', exportZip);
  $('import-md').addEventListener('click', () => $('import-input').click());
  $('import-input').addEventListener('change', (event) => {
    if (event.target.files?.length) importFiles([...event.target.files]);
    event.target.value = '';
  });
  $('copy-brief').addEventListener('click', copyBrief);

  $('load-demo').addEventListener('click', () => {
    if (!requireWritable()) return;
    setBoardFromFiles({ ...DEMO_FILES }, 'Demo project reloaded.');
  });
  $('clear-board').addEventListener('click', async () => {
    if (!requireWritable()) return;
    await setBoardFromFiles({}, 'Board cleared. Name a project to begin.');
    $('settings').close();
    openProject('create');
  });

  document.addEventListener('keydown', (event) => {
    const typing =
      /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) ||
      event.target.isContentEditable ||
      document.querySelector('dialog[open]') !== null;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (!requireWritable()) return;
      const next = event.shiftKey ? history.redo() : history.undo();
      if (!next.tasks.some((t) => t.id === ui.selectedId)) ui.selectedId = null;
      ui.selectedEdgeId = null;
      persist();
      render();
      status(event.shiftKey ? 'Redone.' : 'Undone.');
      return;
    }
    if (typing) return;
    if (event.key === 'Escape') {
      if (ui.linkArmed) setLinkArmed(false);
      else if (ui.selectedId || ui.selectedEdgeId) {
        ui.selectedId = null;
        ui.selectedEdgeId = null;
        render();
      }
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (!ui.selectedId && !ui.selectedEdgeId) return;
      event.preventDefault();
      if (ui.selectedEdgeId) deleteEdge(ui.selectedEdgeId);
      else deleteTask(ui.selectedId);
      return;
    }
    if (event.key === 'n' || event.key === 'N') {
      event.preventDefault();
      const task = addTask();
      ui.selectedId = task.id;
      render();
      panel.focusTitle();
    } else if (event.key === 'w' || event.key === 'W') {
      if (ui.selectedId) setWorking(ui.selectedId);
      else status('Select a task first, then W to mark it the one you are on.');
    } else if (event.key === 'e' || event.key === 'E') {
      setLinkArmed(!ui.linkArmed);
    } else if (event.key === 'f' || event.key === 'F') {
      graph.fit();
    }
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => graph.refreshTheme());
}

async function boot() {
  ui.autoLayout = readAutoLayout();
  ui.showArchived = readShowArchived();
  setPanelWidth(readPanelWidth(), { persist: false });
  graph = createGraph(
    $('canvas'),
    {
    onSelect: (id) => {
      ui.selectedId = id;
      ui.selectedEdgeId = null;
      status('');
      render();
    },
    onSelectEdge: (edgeId) => {
      ui.selectedEdgeId = String(edgeId).startsWith('goal:') ? null : edgeId;
      ui.selectedId = null;
      status(ui.selectedEdgeId ? 'Link selected. Delete to remove it.' : '');
      render();
    },
    onLink: link,
    // The row the gutter would label, so the preview and the gutter never disagree.
    dropLabel: labelForLevel,
    onContext: openContextMenu,
    onReschedule: (taskId, level, x) => {
      const view = buildView();
      const task = board().tasks.find((t) => t.id === taskId);
      // Anything that does not move the task still needs a redraw, or it stays floating
      // wherever it was dropped.
      if (!task || task.goal) {
        render();
        if (task?.goal) status('The goal node sits at the project deadline.');
        return;
      }
      // Rows, not dates: a row stands for a whole period, and `dueForLevel` names its
      // first day. Comparing the dates would read "due 07 Aug, row starts 01 Aug" as a
      // move and quietly re-date a task that never left its row.
      const fromRow = view.levels.get(taskId);
      const toRow = Math.max(0, Math.round(level));
      const rescheduled = fromRow != null && toRow !== fromRow;
      const moved = x != null && x !== task.x;
      if (!rescheduled && !moved) {
        render();
        return;
      }

      const due = rescheduled ? dueForLevel(view, toRow) : task.due;
      // Off auto-layout a drop says both when the task is due and where its card lives.
      updateTask(taskId, { ...(rescheduled ? { due } : {}), ...(moved ? { x } : {}) });
      if (!rescheduled) status(`“${task.title}” moved.`);
      else status(due ? `“${task.title}” moved to ${due}.` : `“${task.title}” is now unscheduled.`);
    },
    onMerge: (sourceId, targetId) => {
      const result = mergeTaskInto(board().tasks, sourceId, targetId);
      if (!result) return;
      const target = board().tasks.find((t) => t.id === targetId);
      ui.selectedId = targetId;
      commit(
        {
          ...board(),
          tasks: result.tasks,
          trash: pushTrash(board().trash, taskRecord(result.merged)),
        },
        `“${result.merged.title}” is now a subtask of “${target.title}”. Ctrl+Z to undo.`
      );
    },
      // Double-click and right-click both create a task on the row you aimed at.
      onBlankDoubleClick: addTaskAt,
    },
    { levelSeparation: readRowHeight(), autoLayout: ui.autoLayout }
  );

  panel = createPanel({
    onChange: updateTask,
    onDelete: deleteTask,
    onSelect: (id) => {
      ui.selectedId = id;
      render();
    },
    onPromote: promoteSubtask,
    onSuggest: runAssist,
    onAddPerson: addPersonToTask,
    onWorking: setWorking,
    onMessage: (message) => status(message, true),
  });

  wireEvents();

  let files;
  try {
    files = await storage.load();
  } catch (error) {
    files = {};
    status(`Could not read saved data: ${error.message}`, true);
  }
  const isEmpty = Object.keys(files).length === 0;
  const before = JSON.stringify(Object.keys(files).sort());
  resetBoard(isEmpty ? DEMO_FILES : files);
  ui.projectId = defaultProjectId();
  // Writes the demo out, and any goal node the sync had to create for an existing vault.
  if (isEmpty || JSON.stringify(Object.keys(boardToFiles(board())).sort()) !== before) {
    await persist();
  }

  refreshStorageState();
  render();
  graph.fit();
  if (isEmpty) status('Demo project loaded. Settings ⚙ to clear it and start empty.');
}

// Project goals are wrapped prose, so single newlines must reflow rather than break.
marked.setOptions({ breaks: false });

boot();
