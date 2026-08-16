/**
 * Renders a project as a compact markdown brief for a language model.
 *
 * Stable task ids appear in the first column so a model can reference existing work
 * unambiguously and so responses can be mapped back onto the board. This is also
 * exactly what the "Copy brief" button puts on the clipboard.
 *
 * Pure: no DOM, no network.
 */

import { deriveStatus, indexById, formatDate, parseDate } from './model.js';

/** Table cells must not break the markdown row. */
const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();

const peopleCell = (task) => (task.people ?? []).join(', ');

function progressCell(status) {
  if (status.done) return 'done';
  if (status.total === 0) return '—';
  return `${status.checked}/${status.total}`;
}

/**
 * The full project brief: goal, window, task table, dependency list.
 * `tasks` should already be narrowed to the project.
 */
export function buildBrief(project, tasks, { now = Date.now() } = {}) {
  const byId = indexById(tasks);
  const lines = [];

  lines.push(`# ${project?.title || 'Untitled project'}`);
  if (project?.goal) lines.push('', '## Goal', project.goal.trim());

  const window = [project?.start, project?.end].filter(Boolean);
  lines.push('');
  if (window.length === 2) lines.push(`Window: ${project.start} → ${project.end}`);
  lines.push(`Today: ${formatDate(now)}`);

  lines.push('', '## Tasks', '', '| id | task | due | estimate | people | subtasks |');
  lines.push('|----|------|-----|----------|--------|----------|');
  const ordered = [...tasks].sort(
    (a, b) => (parseDate(a.due) ?? Infinity) - (parseDate(b.due) ?? Infinity)
  );
  for (const task of ordered) {
    const status = deriveStatus(task, byId, now);
    lines.push(
      `| ${cell(task.id)} | ${cell(task.title)} | ${cell(task.due) || '—'} | ` +
        `${cell(task.estimate) || '—'} | ${cell(peopleCell(task)) || '—'} | ${progressCell(status)} |`
    );
  }
  if (ordered.length === 0) lines.push('| — | _no tasks yet_ | — | — | — | — |');

  const deps = [];
  for (const task of ordered) {
    for (const from of task.blockedBy ?? []) {
      if (byId.has(from)) deps.push(`- ${task.id} blocked-by ${from}`);
    }
    for (const parent of task.partOf ?? []) {
      if (byId.has(parent)) deps.push(`- ${task.id} part-of ${parent}`);
    }
  }
  lines.push('', '## Dependencies', '');
  lines.push(deps.length ? deps.join('\n') : '_none recorded_');

  return `${lines.join('\n')}\n`;
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
