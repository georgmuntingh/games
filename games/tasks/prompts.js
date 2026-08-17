/**
 * Prompt construction and response parsing for the three assistant actions.
 *
 * Budget models support `response_format: json_schema` unevenly, so instead we ask for
 * JSON in a fenced block and parse defensively. A parse failure is surfaced with the
 * raw response rather than swallowed.
 *
 * Pure: builds request bodies and reads responses. The network lives in `llm.js`.
 */

import { buildBrief, buildTaskBrief } from './exporter.js';

const SYSTEM = `You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`;

/**
 * Pull a JSON value out of a model response: fenced block first, then the first
 * balanced-looking object or array. Throws with the raw text attached on failure.
 */
export function parseJsonResponse(text) {
  const raw = String(text ?? '').trim();
  const candidates = [];

  const fenced = /```(?:json)?\s*\n?([\s\S]*?)```/gi;
  for (let m = fenced.exec(raw); m; m = fenced.exec(raw)) candidates.push(m[1]);

  const firstBrace = raw.search(/[[{]/);
  if (firstBrace !== -1) {
    const lastBrace = Math.max(raw.lastIndexOf(']'), raw.lastIndexOf('}'));
    if (lastBrace > firstBrace) candidates.push(raw.slice(firstBrace, lastBrace + 1));
  }
  candidates.push(raw);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.trim());
    } catch {
      /* try the next candidate */
    }
  }
  const error = new Error('Could not read JSON from the model response.');
  error.raw = raw;
  throw error;
}

/** Coerce whatever shape came back into an array of items. */
function asArray(value, key) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value[key])) return value[key];
  if (value && typeof value === 'object') {
    const firstArray = Object.values(value).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  return [];
}

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/* ------------------------------------------------------- suggest subtasks */

export const suggestSubtasks = {
  id: 'subtasks',
  title: 'Suggest subtasks',
  messages(project, tasks, task) {
    return [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `${buildBrief(project, tasks)}
${buildTaskBrief(task)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`,
      },
    ];
  },
  parse(response) {
    return asArray(parseJsonResponse(response), 'subtasks')
      .map((item) => (typeof item === 'string' ? item : text(item?.text ?? item?.title)))
      .map((s) => s.replace(/^[-*]\s*(\[[ xX]\]\s*)?/, '').trim())
      .filter(Boolean)
      .map((label) => ({ kind: 'subtask', label }));
  },
};

/* --------------------------------------------------- suggest missing tasks */

export const suggestMissingTasks = {
  id: 'missing',
  title: 'Find missing tasks',
  messages(project, tasks) {
    return [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `${buildBrief(project, tasks)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`,
      },
    ];
  },
  parse(response) {
    return asArray(parseJsonResponse(response), 'tasks')
      .map((item) => {
        if (typeof item === 'string') return { kind: 'task', label: item, task: { title: item } };
        const title = text(item?.title ?? item?.name);
        if (!title) return null;
        const due = /^\d{4}-\d{2}-\d{2}$/.test(text(item?.due)) ? text(item.due) : '';
        const blockedBy = (Array.isArray(item?.blocked_by) ? item.blocked_by : [])
          .map(text)
          .filter(Boolean);
        return {
          kind: 'task',
          label: title,
          detail: text(item?.why ?? item?.rationale),
          task: { title, due, estimate: text(item?.estimate), blockedBy },
        };
      })
      .filter(Boolean);
  },
};

/* ------------------------------------------------------ estimate duration */

export const estimateDuration = {
  id: 'estimate',
  title: 'Estimate duration',
  messages(project, tasks, task) {
    return [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `${buildBrief(project, tasks)}
${buildTaskBrief(task)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`,
      },
    ];
  },
  parse(response) {
    const data = parseJsonResponse(response);
    const value = text(typeof data === 'string' ? data : data?.estimate ?? data?.duration);
    const match = /(\d+(?:\.\d+)?)\s*([hdw])/i.exec(value);
    if (!match) {
      const error = new Error(`Model returned an unusable estimate: "${value || '(empty)'}"`);
      error.raw = JSON.stringify(data);
      throw error;
    }
    const estimate = `${Number(match[1])}${match[2].toLowerCase()}`;
    return [
      {
        kind: 'estimate',
        label: estimate,
        detail: text(data?.why ?? data?.rationale),
        estimate,
      },
    ];
  },
};

export const ACTIONS = { subtasks: suggestSubtasks, missing: suggestMissingTasks, estimate: estimateDuration };
