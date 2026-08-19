/**
 * Renders a project as a compact markdown brief for a language model.
 *
 * Stable task ids appear in the first column so a model can reference existing work
 * unambiguously and so responses can be mapped back onto the board. This is also
 * exactly what the "Copy brief" button puts on the clipboard.
 *
 * The brief is assembled from named sections. The fixed assistant actions take the whole
 * thing; the ask dialog lets the user tick sections one at a time, which is why each is a
 * function of its own rather than a branch inside one big builder.
 *
 * Pure: no DOM, no network.
 */

import {
  deriveStatus,
  indexById,
  formatDate,
  parseDate,
  totalEstimateHours,
  projectPeople,
  visibleProjects,
  filterTasks,
} from './model.js';

/** Table cells must not break the markdown row. */
const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();

const peopleCell = (task) => (task.people ?? []).join(', ');

function progressCell(status) {
  if (status.done) return 'done';
  if (status.total === 0) return '—';
  return `${status.checked}/${status.total}`;
}

/** Due date ascending, undated last — the order every section lists tasks in. */
const byDue = (a, b) => (parseDate(a.due) ?? Infinity) - (parseDate(b.due) ?? Infinity);

/* ------------------------------------------------------------- sections */

/** Title, goal, context and the dates the model should reason against. */
export function briefHeader(project, { now = Date.now() } = {}) {
  const lines = [];
  lines.push(`# ${project?.title || 'Untitled project'}`);
  // Goal and context are labelled separately so the model can tell the objective from
  // the background it should reason within. Context goes verbatim, however long.
  if (project?.goal) lines.push('', '## Goal', project.goal.trim());
  if (project?.context) lines.push('', '## Context', project.context.trim());

  const window = [project?.start, project?.end].filter(Boolean);
  lines.push('');
  if (window.length === 2) lines.push(`Window: ${project.start} → ${project.end}`);
  lines.push(`Today: ${formatDate(now)}`);
  return lines.join('\n');
}

/** One row per task: what it is, when it is due, who holds it, how far along it is. */
export function taskTable(tasks, { now = Date.now() } = {}) {
  const byId = indexById(tasks);
  const lines = ['## Tasks', '', '| id | task | due | estimate | people | subtasks |'];
  lines.push('|----|------|-----|----------|--------|----------|');
  const ordered = [...tasks].sort(byDue);
  for (const task of ordered) {
    const status = deriveStatus(task, byId, now);
    lines.push(
      `| ${cell(task.id)} | ${cell(task.title)} | ${cell(task.due) || '—'} | ` +
        `${cell(task.estimate) || '—'} | ${cell(peopleCell(task)) || '—'} | ${progressCell(status)} |`
    );
  }
  if (ordered.length === 0) lines.push('| — | _no tasks yet_ | — | — | — | — |');
  return lines.join('\n');
}

/** Blocked-by and part-of edges, skipping references to tasks outside `tasks`. */
export function dependencyList(tasks) {
  const byId = indexById(tasks);
  const deps = [];
  for (const task of [...tasks].sort(byDue)) {
    for (const from of task.blockedBy ?? []) {
      if (byId.has(from)) deps.push(`- ${task.id} blocked-by ${from}`);
    }
    for (const parent of task.partOf ?? []) {
      if (byId.has(parent)) deps.push(`- ${task.id} part-of ${parent}`);
    }
  }
  return ['## Dependencies', '', deps.length ? deps.join('\n') : '_none recorded_'].join('\n');
}

/**
 * The full project brief: goal, window, task table, dependency list.
 * `tasks` should already be narrowed to the project.
 */
export function buildBrief(project, tasks, { now = Date.now() } = {}) {
  return `${[
    briefHeader(project, { now }),
    taskTable(tasks, { now }),
    dependencyList(tasks),
  ].join('\n\n')}\n`;
}

/** A single task in detail, for the per-task prompts. */
export function buildTaskBrief(task) {
  const lines = [`## Task: ${task.title}`, `id: ${task.id}`];
  if (task.due) lines.push(`due: ${task.due}`);
  if (task.estimate) lines.push(`current estimate: ${task.estimate}`);
  if (task.people?.length) lines.push(`people: ${task.people.join(', ')}`);
  if (task.notes) lines.push('', task.notes.trim());
  if (task.subtasks?.length) {
    lines.push('', 'Existing subtasks:');
    for (const s of task.subtasks) lines.push(`- [${s.done ? 'x' : ' '}] ${s.text}`);
  } else {
    lines.push('', 'Existing subtasks: none');
  }
  return `${lines.join('\n')}\n`;
}

/* -------------------------------------------------------- context blocks */

/**
 * The pickable pieces of context for a freeform question, in the order they are offered
 * and assembled. `needs` names what a block cannot be built without, so the dialog can
 * grey out a row and say why rather than offering something that would come back empty.
 */
export const CONTEXT_BLOCKS = [
  { id: 'goal', label: 'Goal & context', hint: 'The project title, its goal and your notes' },
  { id: 'tasks', label: 'Tasks in this project', hint: 'Every task, done ones included, with dependencies' },
  { id: 'detail', label: 'Task notes & subtasks', hint: 'The full text behind each task' },
  { id: 'task', label: 'Selected task in full', hint: 'The task open in the sidebar', needs: 'task' },
  { id: 'projects', label: 'Other projects', hint: 'Titles and goals of everything else on the board' },
  { id: 'people', label: 'People', hint: 'Who is on the project and what they are holding' },
];

/** Words, the unit the assistant sheet already quotes when it warns about context size. */
export function countWords(text) {
  const trimmed = String(text ?? '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Notes and subtask text for every task that has any — the detail the table leaves out. */
function taskDetail(tasks) {
  const lines = ['## Task detail'];
  let found = 0;
  for (const task of [...tasks].sort(byDue)) {
    if (!task.notes?.trim() && !task.subtasks?.length) continue;
    found += 1;
    lines.push('', `### ${task.title}`, `id: ${task.id}`);
    if (task.notes?.trim()) lines.push('', task.notes.trim());
    if (task.subtasks?.length) {
      lines.push('', 'Subtasks:');
      for (const s of task.subtasks) lines.push(`- [${s.done ? 'x' : ' '}] ${s.text}`);
    }
  }
  return found ? lines.join('\n') : '';
}

/** Everything else on the board, one line each: enough to spot a clash, not enough to drown. */
function otherProjects(project, projects, allTasks) {
  const others = visibleProjects(projects ?? [], false).filter((p) => p.id !== project?.id);
  if (!others.length) return '';
  const lines = ['## Other projects', ''];
  for (const other of others) {
    const count = filterTasks(allTasks ?? [], { projectId: other.id }).length;
    const window = [other.start, other.end].filter(Boolean).join(' → ');
    const parts = [`**${other.title}**`, other.goal?.trim(), window, `${count} tasks`];
    lines.push(`- ${parts.filter(Boolean).join(' — ')}`);
  }
  return lines.join('\n');
}

/** The roster, each with what they are actually carrying. */
function peopleSection(project, tasks) {
  const roster = projectPeople(project, tasks ?? []);
  if (!roster.length) return '';
  const lines = ['## People', ''];
  for (const person of roster) {
    const held = (tasks ?? []).filter((t) => !t.done && (t.people ?? []).includes(person.name));
    const hours = totalEstimateHours(held);
    const load = hours ? `, ${hours}h estimated` : '';
    lines.push(`- ${person.name} — ${held.length} open task${held.length === 1 ? '' : 's'}${load}`);
  }
  return lines.join('\n');
}

/**
 * Every block rendered, keyed by id. A block with nothing to say comes back as an empty
 * string rather than a lonely heading, so ticking it costs the user no words.
 */
export function contextSections({ project, tasks = [], task = null, projects = [], allTasks = [], now = Date.now() } = {}) {
  return {
    goal: briefHeader(project, { now }),
    tasks: `${taskTable(tasks, { now })}\n\n${dependencyList(tasks)}`,
    detail: taskDetail(tasks),
    task: task ? buildTaskBrief(task).trimEnd() : '',
    projects: otherProjects(project, projects, allTasks),
    people: peopleSection(project, tasks),
  };
}

/** The ticked sections, in catalogue order, joined into one brief. */
export function buildContext(blocks, sources = {}) {
  const wanted = new Set(blocks ?? []);
  const sections = contextSections(sources);
  const chosen = CONTEXT_BLOCKS.filter((b) => wanted.has(b.id))
    .map((b) => sections[b.id])
    .filter((s) => s && s.trim());
  return chosen.length ? `${chosen.join('\n\n')}\n` : '';
}
