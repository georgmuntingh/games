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
  pushTrash,
  uniqueSlug,
  formatDate,
  parseDate,
  totalEstimateHours,
} from './model.js';
import { createGraph, LEVEL_SEPARATION_DEFAULT } from './graph.js';
import { createPanel } from './panel.js';
import { createMenu } from './menu.js';
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

const storage = createStorage();
const history = createHistory({ tasks: [], projects: [], trash: [] });

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
};

const ROWS_KEY = 'tasks.rowHeight';
const readRowHeight = () => Number(localStorage.getItem(ROWS_KEY)) || LEVEL_SEPARATION_DEFAULT;

let graph;
let panel;
let peopleMenu;
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
 * Commit a new board: reconcile the goal nodes, record undo, persist, redraw.
 *
 * The goal sync lives here rather than at each call site so no mutation can leave a
 * project and its goal node disagreeing. A goal node whose project no longer has a goal
 * is binned like any other deletion.
 */
function commit(next, message) {
  const { tasks, removed } = syncGoalTasks(next);
  const trash = removed.reduce((acc, task) => pushTrash(acc, taskRecord(task)), next.trash ?? []);
  history.push({ ...next, tasks, trash });
  persist();
  render();
  if (message) status(message);
}

async function persist() {
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

function updateTask(id, changes) {
  const task = board().tasks.find((t) => t.id === id);
  if (!task) return;
  changes = withDoneRollup(task, changes);
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
    context: fields.context ?? '',
  };
  ui.projectId = id;
  ui.people.clear();
  ui.selectedId = null;
  commit({ ...board(), projects: [...board().projects, project] }, `Created “${title}”.`);
  return project;
}

/** Remove a project. Its tasks keep existing; they just lose the tag. */
function deleteProject(id) {
  const project = board().projects.find((p) => p.id === id);
  if (!project) return;
  const next = {
    projects: board().projects.filter((p) => p.id !== id),
    tasks: board().tasks.map((t) => ({
      ...t,
      project: (t.project ?? []).filter((tag) => tag !== id),
    })),
  };
  history.push(next);
  ui.projectId = null;
  ui.projectId = defaultProjectId();
  ui.people.clear();
  ui.selectedId = null;
  persist();
  render();
  status(`Deleted “${project.title}”. Its tasks kept, untagged. Ctrl+Z to undo.`);
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
  return (
    [...board().projects]
      .sort(
        (a, b) =>
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
    people: allPeople(board().tasks),
    projects: [...new Set([...board().projects.map((p) => p.id), ...allProjectTags(board().tasks)])],
    eligible: selected
      ? {
          blockedBy: eligibleRefs(selected, 'blockedBy', projectTasks),
          partOf: eligibleRefs(selected, 'partOf', projectTasks),
        }
      : null,
    assistantReady: Boolean(llm.getKey()),
  });
  if ($('project').open) renderProjectDialog();
  if ($('trash').open) renderTrash();
  if (!$('status-bar').textContent) renderSummary(view);
}

function renderSummary(view) {
  const open = view.tasks.filter((t) => !t.done).length;
  const overdue = [...view.statuses.values()].filter((s) => s.overdue).length;
  const hours = totalEstimateHours(view.tasks.filter((t) => !t.done));
  const parts = [`${view.tasks.length} tasks`, `${open} open`];
  if (overdue) parts.push(`${overdue} overdue`);
  if (hours) parts.push(`${Math.round(hours / 8)}d of work left`);
  parts.push(`scale: ${view.bucket.label.toLowerCase()}`);
  const counts = parts.join(' · ');
  status(view.project?.goal ? `${view.project.goal} — ${counts}` : counts);
}

function renderToolbar(view) {
  const picker = $('project-picker');
  const projects = board().projects;
  picker.textContent = '';
  for (const project of projects) {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.title;
    option.selected = project.id === view.project?.id;
    picker.append(option);
  }
  if (!projects.length) {
    const option = document.createElement('option');
    option.textContent = 'No project';
    picker.append(option);
  }

  renderPeopleMenu(view);

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
  ui.projectId = defaultProjectId();
  ui.people.clear();
  ui.selectedId = null;
  await persist();
  status(message ?? '');
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

const TRASH_LABEL = { task: 'task', edge: 'link' };

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
    meta.textContent = `${TRASH_LABEL[record.kind] ?? record.kind} · ${record.at.slice(0, 10)}`;
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
  if (project) updateProject(project.id, { [key]: value });
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

function refreshStorageState() {
  const { mode, folderName, supportsFolder, reconnectable } = storage.state;
  const text =
    mode === 'folder'
      ? `Reading and writing .md files in “${folderName}”.`
      : reconnectable
        ? 'A folder was connected before. Click “Open folder…” to reconnect it.'
        : supportsFolder
          ? 'Saving to this browser only.'
          : 'Saving to this browser only — this browser cannot open folders.';
  $('storage-state').textContent = text;
  $('connect-folder').disabled = !supportsFolder;
  $('disconnect-folder').disabled = mode !== 'folder';
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
  });

  peopleMenu = createMenu($('people-menu'), $('people-options'));

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
        await setBoardFromFiles(files, `Opened “${storage.state.folderName}”.`);
      } else {
        await persist();
        status(`Opened empty folder “${storage.state.folderName}” — wrote the current board into it.`);
      }
    } catch (error) {
      if (error.name !== 'AbortError') status(error.message, true);
    }
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

  const projectField = (elementId, key, transform = (v) => v.trim()) =>
    $(elementId).addEventListener('change', (event) =>
      writeProjectField(key, transform(event.target.value))
    );
  projectField('p-title', 'title');
  projectField('p-goal', 'goal');
  projectField('p-start', 'start');
  projectField('p-end', 'end');
  projectField('p-color', 'color');
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
    deleteProject(project.id);
    if (currentProject()) renderProjectDialog();
    else $('project').close();
  });

  $('export-zip').addEventListener('click', exportZip);
  $('import-md').addEventListener('click', () => $('import-input').click());
  $('import-input').addEventListener('change', (event) => {
    if (event.target.files?.length) importFiles([...event.target.files]);
    event.target.value = '';
  });
  $('copy-brief').addEventListener('click', copyBrief);

  $('load-demo').addEventListener('click', () =>
    setBoardFromFiles({ ...DEMO_FILES }, 'Demo project reloaded.')
  );
  $('clear-board').addEventListener('click', async () => {
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
    } else if (event.key === 'e' || event.key === 'E') {
      setLinkArmed(!ui.linkArmed);
    } else if (event.key === 'f' || event.key === 'F') {
      graph.fit();
    }
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => graph.refreshTheme());
}

async function boot() {
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
    dropLabel: (row) => {
      if (!currentView) return '';
      const due = dueForLevel(currentView, row);
      return due ? currentView.bucket.format(parseDate(due)) : 'unscheduled';
    },
    onReschedule: (taskId, level) => {
      const view = buildView();
      const task = board().tasks.find((t) => t.id === taskId);
      const due = task ? dueForLevel(view, level) : '';
      // Anything that does not move the task still needs a redraw, or it stays floating
      // wherever it was dropped.
      if (!task || task.goal || due === task.due) {
        render();
        if (task?.goal) status('The goal node sits at the project deadline.');
        return;
      }
      updateTask(taskId, { due });
      status(due ? `“${task.title}” moved to ${due}.` : `“${task.title}” is now unscheduled.`);
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
      onBlankDoubleClick: () => {
        const task = addTask();
        ui.selectedId = task.id;
        render();
        panel.focusTitle();
      },
    },
    { levelSeparation: readRowHeight() }
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

  render();
  graph.fit();
  if (isEmpty) status('Demo project loaded. Settings ⚙ to clear it and start empty.');
}

// Project goals are wrapped prose, so single newlines must reflow rather than break.
marked.setOptions({ breaks: false });

boot();
