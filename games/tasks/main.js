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
  uniqueSlug,
  formatDate,
  parseDate,
  totalEstimateHours,
} from './model.js';
import { createGraph } from './graph.js';
import { createPanel } from './panel.js';
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
const history = createHistory({ tasks: [], projects: [] });

/** UI state, deliberately outside the undo history. */
const ui = {
  projectId: null,
  people: new Set(),
  hideDone: false,
  bucketUnit: 'auto',
  selectedId: null,
  linkArmed: false,
  linkKind: 'blocks',
};

let graph;
let panel;
let pending = null; // the suggestion batch currently under review

const board = () => history.current;

function status(message, isError = false) {
  const bar = $('status-bar');
  bar.textContent = message;
  bar.classList.toggle('error', Boolean(isError));
}

/* ------------------------------------------------------------ mutations */

/** Commit a new board: record undo, persist, redraw. */
function commit(next, message) {
  history.push(next);
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

function updateTask(id, changes) {
  const task = board().tasks.find((t) => t.id === id);
  if (!task) return;
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
  const next = {
    ...board(),
    tasks: board().tasks
      .filter((t) => t.id !== id)
      .map((t) => ({
        ...t,
        blockedBy: (t.blockedBy ?? []).filter((ref) => ref !== id),
        partOf: (t.partOf ?? []).filter((ref) => ref !== id),
      })),
  };
  if (ui.selectedId === id) ui.selectedId = null;
  commit(next, `Deleted “${task?.title ?? id}”. Ctrl+Z to undo.`);
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

function addProject(title) {
  const taken = new Set(board().projects.map((p) => p.id));
  const id = uniqueSlug(title, taken);
  const start = formatDate(Date.now());
  const project = {
    id,
    title,
    start,
    end: formatDate(Date.now() + 90 * 86400000),
    color: '',
    goal: '',
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
  const { levels, trayLevel, minLevel } = assignLevels(tasks, { bucket, start: window.start });

  const byId = indexById(board().tasks);
  const statuses = new Map(tasks.map((t) => [t.id, deriveStatus(t, byId)]));

  // Rule every level in range, not just the occupied ones, so an empty fortnight reads
  // as elapsed time rather than as a void. Thin the rules out when there are many.
  const hasTray = tasks.some((t) => !t.due);
  const lastDated = Math.max(0, ...[...levels.entries()].filter(([id]) => byIdDue(tasks, id)).map(([, l]) => l));
  const step = Math.ceil((lastDated + 1) / 40) || 1;
  const gutter = [];
  for (let level = 0; level <= lastDated; level += step) {
    gutter.push({
      level,
      label: bucket.format(bucket.dateForLevel(level + minLevel, window.start)),
    });
  }
  if (hasTray) gutter.push({ level: trayLevel, label: 'unscheduled' });

  const nowLevel = tasks.length ? bucket.level(Date.now(), window.start) - minLevel : null;

  return {
    tasks,
    levels,
    trayLevel,
    statuses,
    gutter,
    nowLevel,
    edges: buildEdges(tasks, levels),
    selectedId: ui.selectedId,
    project,
    bucket,
  };
}

/* ------------------------------------------------------------- rendering */

function render() {
  const view = buildView();
  graph.render(view);
  renderToolbar(view);
  panel.render({
    task: board().tasks.find((t) => t.id === ui.selectedId) ?? null,
    tasks: filterTasks(board().tasks, { projectId: ui.projectId }),
    people: allPeople(board().tasks),
    projects: [...new Set([...board().projects.map((p) => p.id), ...allProjectTags(board().tasks)])],
    assistantReady: Boolean(llm.getKey()),
  });
  if ($('settings').open) renderProjectFields();
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
  status(parts.join(' · '));
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

  const people = allPeople(filterTasks(board().tasks, { projectId: ui.projectId }));
  const options = $('people-options');
  options.textContent = '';
  for (const person of people) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = ui.people.has(person);
    input.addEventListener('change', () => {
      if (input.checked) ui.people.add(person);
      else ui.people.delete(person);
      status('');
      render();
    });
    label.append(input, document.createTextNode(person));
    options.append(label);
  }
  $('people-summary').textContent = ui.people.size
    ? [...ui.people].join(', ')
    : people.length
      ? 'Everyone'
      : 'No people';

  const linkButton = $('link-mode');
  linkButton.setAttribute('aria-pressed', String(ui.linkArmed));
  $('link-kind').textContent = ui.linkKind;
  linkButton.title = ui.linkArmed
    ? 'Drag from one task to another. Click to switch link type, Esc to cancel.'
    : 'Draw a link between two tasks (E)';
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
  history.reset(buildBoard(files));
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
  const goal = currentProject()?.goal ?? '';
  const element = $('assist-goal');
  element.hidden = !goal;
  element.innerHTML = goal ? marked.parse(goal.replace(/</g, '&lt;')) : '';
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

function renderSuggestions() {
  const list = $('suggest-list');
  list.textContent = '';
  $('suggest-foot').hidden = !pending?.suggestions.some((s) => !s.resolved);

  pending?.suggestions.forEach((suggestion, index) => {
    const li = document.createElement('li');
    if (suggestion.resolved) li.className = 'resolved';

    const body = document.createElement('div');
    body.className = 'suggest-body';
    body.textContent = suggestion.label;
    if (suggestion.detail) {
      const why = document.createElement('span');
      why.className = 'why';
      why.textContent = suggestion.detail;
      body.append(why);
    }
    if (suggestion.task?.due) {
      const why = document.createElement('span');
      why.className = 'why';
      why.textContent = `due ${suggestion.task.due}${suggestion.task.estimate ? ` · ${suggestion.task.estimate}` : ''}`;
      body.append(why);
    }

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'accept';
    accept.textContent = '✓';
    accept.title = 'Accept';
    accept.disabled = Boolean(suggestion.resolved);
    accept.addEventListener('click', () => acceptSuggestion(index));

    const reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'reject';
    reject.textContent = '✕';
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

function acceptSuggestion(index) {
  const suggestion = pending?.suggestions[index];
  if (!suggestion || suggestion.resolved) return;
  const task = pending.taskId ? board().tasks.find((t) => t.id === pending.taskId) : null;

  if (suggestion.kind === 'subtask' && task) {
    updateTask(task.id, { subtasks: [...task.subtasks, { done: false, text: suggestion.label }] });
  } else if (suggestion.kind === 'estimate' && task) {
    updateTask(task.id, { estimate: suggestion.estimate });
  } else if (suggestion.kind === 'task') {
    addTask({
      title: suggestion.task.title,
      due: suggestion.task.due || defaultDue(),
      estimate: suggestion.task.estimate || '',
      blockedBy: suggestion.task.blockedBy ?? [],
    });
  }
  suggestion.resolved = 'accepted';
  renderSuggestions();
}

/* ------------------------------------------------------------- settings */

function renderProjectFields() {
  const project = currentProject();
  const has = Boolean(project);
  for (const id of ['p-title', 'p-start', 'p-end', 'p-goal']) $(id).disabled = !has;
  $('delete-project').disabled = !has;
  if (!has) {
    $('p-title').value = '';
    $('p-start').value = '';
    $('p-end').value = '';
    $('p-goal').value = '';
    return;
  }
  if (document.activeElement?.id !== 'p-title') $('p-title').value = project.title;
  $('p-start').value = project.start || '';
  $('p-end').value = project.end || '';
  if (document.activeElement?.id !== 'p-goal') $('p-goal').value = project.goal || '';
}

function openSettings() {
  refreshStorageState();
  renderProjectFields();
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
    ui.people.clear();
    ui.selectedId = null;
    status('');
    render();
  });

  $('hide-done').addEventListener('change', (event) => {
    ui.hideDone = event.target.checked;
    status('');
    render();
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

  const projectField = (elementId, key) =>
    $(elementId).addEventListener('change', (event) => {
      const project = currentProject();
      if (project) updateProject(project.id, { [key]: event.target.value.trim() });
    });
  projectField('p-title', 'title');
  projectField('p-start', 'start');
  projectField('p-end', 'end');
  projectField('p-goal', 'goal');

  $('new-project').addEventListener('click', () => {
    const title = prompt('Name the project')?.trim();
    if (title) {
      addProject(title);
      renderProjectFields();
      $('p-goal').focus();
    }
  });
  $('delete-project').addEventListener('click', () => {
    const project = currentProject();
    if (project) {
      deleteProject(project.id);
      renderProjectFields();
    }
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
    renderProjectFields();
    $('new-project').focus();
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
      persist();
      render();
      status(event.shiftKey ? 'Redone.' : 'Undone.');
      return;
    }
    if (typing) return;
    if (event.key === 'Escape') {
      if (ui.linkArmed) setLinkArmed(false);
      else if (ui.selectedId) {
        ui.selectedId = null;
        render();
      }
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
  graph = createGraph($('canvas'), {
    onSelect: (id) => {
      ui.selectedId = id;
      status('');
      render();
    },
    onLink: link,
    onBlankDoubleClick: () => {
      const task = addTask();
      ui.selectedId = task.id;
      render();
      panel.focusTitle();
    },
  });

  panel = createPanel({
    onChange: updateTask,
    onDelete: deleteTask,
    onSelect: (id) => {
      ui.selectedId = id;
      render();
    },
    onPromote: promoteSubtask,
    onSuggest: runAssist,
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
  history.reset(buildBoard(isEmpty ? DEMO_FILES : files));
  ui.projectId = defaultProjectId();
  if (isEmpty) await persist();

  render();
  graph.fit();
  if (isEmpty) status('Demo project loaded. Settings ⚙ to clear it and start empty.');
}

// Project goals are wrapped prose, so single newlines must reflow rather than break.
marked.setOptions({ breaks: false });

boot();
