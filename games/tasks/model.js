/**
 * The task/project domain model: ids, dates, timeline buckets, derived status, filters.
 *
 * Pure: no DOM, no storage, no network. Reused as-is by a future Obsidian plugin.
 */

import {
  parseFrontmatter,
  serialiseFrontmatter,
  parseBody,
  serialiseBody,
} from './frontmatter.js';

export const PROJECT_PREFIX = '_project-';
const DAY_MS = 86400000;

/* ------------------------------------------------------------------ ids */

/** Letters that have no NFKD decomposition but do have an obvious ASCII spelling. */
const TRANSLITERATE = {
  'æ': 'ae', 'ø': 'o', 'å': 'a', 'ß': 'ss', 'ð': 'd', 'þ': 'th', 'ł': 'l', 'đ': 'd',
};

/** `Design review!` -> `design-review`. Always yields a non-empty slug. */
export function slugify(title) {
  const slug = String(title)
    .toLowerCase()
    .replace(/[æøåßðþłđ]/g, (c) => TRANSLITERATE[c])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'task';
}

/** A slug not already present in `taken`, suffixed `-2`, `-3`, ... on collision. */
export function uniqueSlug(title, taken) {
  const base = slugify(title);
  const used = taken instanceof Set ? taken : new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}

/* ---------------------------------------------------------------- dates */

/** `2026-09-14` -> UTC ms. Returns null for anything unparseable. */
export function parseDate(value) {
  if (value == null || value === '') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());
  if (!match) return null;
  const ms = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(ms) ? null : ms;
}

/** UTC ms -> `2026-09-14`. */
export function formatDate(ms) {
  if (ms == null) return '';
  return new Date(ms).toISOString().slice(0, 10);
}

/* ------------------------------------------------------------ estimates */

const ESTIMATE_UNITS = { h: 1, d: 8, w: 40 };

/**
 * `3d` -> 24 (hours, on an 8h day / 5d week). Returns null when the text is not a
 * recognised duration, so free-form estimates survive without polluting totals.
 */
export function parseEstimateHours(value) {
  if (value == null || value === '') return null;
  const text = String(value).trim().toLowerCase();
  const match = /^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(text);
  if (!match) return null;
  return Number(match[1]) * ESTIMATE_UNITS[match[2]];
}

/** Sum of the parseable estimates in `tasks`, in hours. */
export function totalEstimateHours(tasks) {
  return tasks.reduce((sum, t) => sum + (parseEstimateHours(t.estimate) ?? 0), 0);
}

/* --------------------------------------------------------- file <-> obj */

function asList(value) {
  if (value == null || value === '') return [];
  return (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean);
}

/** Parse one task `.md` file. `filename` is the fallback id when frontmatter lacks one. */
export function taskFromMarkdown(filename, text) {
  const { data, body } = parseFrontmatter(text);
  const { notes, subtasks } = parseBody(body);
  const fallbackId = String(filename).replace(/\.md$/i, '');
  return {
    id: String(data.id || fallbackId),
    title: String(data.title || fallbackId),
    project: asList(data.project),
    people: asList(data.people),
    due: data.due ? String(data.due) : '',
    estimate: data.estimate ? String(data.estimate) : '',
    created: data.created ? String(data.created) : '',
    done: data.done === true,
    blockedBy: asList(data['blocked-by']),
    partOf: asList(data['part-of']),
    notes,
    subtasks,
    // Frontmatter keys we do not model, kept so an Obsidian vault round-trips intact.
    extra: Object.fromEntries(
      Object.entries(data).filter(
        ([k]) =>
          ![
            'id',
            'title',
            'project',
            'people',
            'due',
            'estimate',
            'created',
            'done',
            'blocked-by',
            'part-of',
          ].includes(k)
      )
    ),
  };
}

/**
 * Drop keys whose value carries no information, so a task with no deadline simply has
 * no `due:` line rather than an empty one. Keeps vault files tidy and makes
 * parse -> serialise -> parse a fixed point.
 */
function omitEmpty(data, always = []) {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      if (always.includes(key)) return true;
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value != null;
    })
  );
}

/** Serialise a task back to markdown. Inverse of `taskFromMarkdown`. */
export function taskToMarkdown(task) {
  const data = omitEmpty(
    {
      id: task.id,
      title: task.title,
      project: task.project ?? [],
      people: task.people ?? [],
      due: task.due ?? '',
      estimate: task.estimate ?? '',
      created: task.created ?? '',
      done: Boolean(task.done),
      'blocked-by': task.blockedBy ?? [],
      'part-of': task.partOf ?? [],
      ...(task.extra ?? {}),
    },
    ['id', 'title', 'done']
  );
  return serialiseFrontmatter(data, serialiseBody(task.notes, task.subtasks));
}

/** Parse a `_project-<id>.md` file. The body prose is the project's end goal. */
export function projectFromMarkdown(filename, text) {
  const { data, body } = parseFrontmatter(text);
  const fallbackId = String(filename)
    .replace(/\.md$/i, '')
    .replace(new RegExp(`^${PROJECT_PREFIX}`), '');
  return {
    id: String(data.id || fallbackId),
    title: String(data.title || fallbackId),
    start: data.start ? String(data.start) : '',
    end: data.end ? String(data.end) : '',
    color: data.color ? String(data.color) : '',
    goal: String(body).trim(),
  };
}

export function projectToMarkdown(project) {
  return serialiseFrontmatter(
    omitEmpty(
      {
        id: project.id,
        title: project.title,
        start: project.start ?? '',
        end: project.end ?? '',
        color: project.color ?? '',
      },
      ['id', 'title']
    ),
    project.goal ?? ''
  );
}

export const taskFilename = (task) => `${task.id}.md`;
export const projectFilename = (project) => `${PROJECT_PREFIX}${project.id}.md`;

/**
 * Build a board from a `filename -> markdown text` map.
 * Files starting with `_project-` are projects; every other `.md` file is a task.
 */
export function buildBoard(files) {
  const tasks = [];
  const projects = [];
  for (const [filename, text] of Object.entries(files)) {
    if (!/\.md$/i.test(filename)) continue;
    const base = filename.split('/').pop();
    if (base.startsWith(PROJECT_PREFIX)) projects.push(projectFromMarkdown(base, text));
    else tasks.push(taskFromMarkdown(base, text));
  }
  tasks.sort((a, b) => a.id.localeCompare(b.id));
  projects.sort((a, b) => a.id.localeCompare(b.id));
  return { tasks, projects };
}

/** Inverse of `buildBoard`. */
export function boardToFiles({ tasks, projects }) {
  const files = {};
  for (const project of projects) files[projectFilename(project)] = projectToMarkdown(project);
  for (const task of tasks) files[taskFilename(task)] = taskToMarkdown(task);
  return files;
}

/* ------------------------------------------------------------- timeline */

/**
 * Bucket descriptors. Each maps a date to a *fractional* level relative to a project
 * start, so the now-line can sit between levels, and back to a label for the gutter.
 * Months are calendar months rather than a fixed ms width, so labels stay honest.
 */
const BUCKETS = {
  day: {
    unit: 'day',
    label: 'Days',
    level(ms, startMs) {
      return (ms - startMs) / DAY_MS;
    },
    dateForLevel(level, startMs) {
      return startMs + level * DAY_MS;
    },
    format(ms) {
      return new Date(ms).toISOString().slice(5, 10).replace('-', '/');
    },
  },
  week: {
    unit: 'week',
    label: 'Weeks',
    level(ms, startMs) {
      return (ms - startMs) / (7 * DAY_MS);
    },
    dateForLevel(level, startMs) {
      return startMs + level * 7 * DAY_MS;
    },
    format(ms) {
      const d = new Date(ms);
      return `${d.toISOString().slice(5, 10).replace('-', '/')}`;
    },
  },
  month: {
    unit: 'month',
    label: 'Months',
    level(ms, startMs) {
      const start = new Date(startMs);
      const date = new Date(ms);
      const whole =
        (date.getUTCFullYear() - start.getUTCFullYear()) * 12 +
        (date.getUTCMonth() - start.getUTCMonth());
      const monthStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
      const monthEnd = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
      return whole + (ms - monthStart) / (monthEnd - monthStart);
    },
    dateForLevel(level, startMs) {
      const start = new Date(startMs);
      return Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + Math.round(level), 1);
    },
    format(ms) {
      const d = new Date(ms);
      return `${d.toLocaleString('en', { month: 'short', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
    },
  },
};

export const BUCKET_UNITS = Object.keys(BUCKETS);

/** Pick a bucket size that keeps a project to a readable number of levels. */
export function chooseBucket(startMs, endMs) {
  if (startMs == null || endMs == null || endMs <= startMs) return BUCKETS.week;
  const days = (endMs - startMs) / DAY_MS;
  if (days <= 31) return BUCKETS.day;
  if (days <= 240) return BUCKETS.week;
  return BUCKETS.month;
}

export function getBucket(unit) {
  return BUCKETS[unit] ?? BUCKETS.week;
}

/**
 * The date window a project's timeline spans: its declared start/end, widened to
 * cover any task whose deadline falls outside them.
 */
export function projectWindow(project, tasks) {
  const dates = tasks.map((t) => parseDate(t.due)).filter((d) => d != null);
  const declaredStart = parseDate(project?.start);
  const declaredEnd = parseDate(project?.end);
  const candidatesStart = [declaredStart, ...dates].filter((d) => d != null);
  const candidatesEnd = [declaredEnd, ...dates].filter((d) => d != null);
  const start = candidatesStart.length ? Math.min(...candidatesStart) : Date.now();
  const end = candidatesEnd.length ? Math.max(...candidatesEnd) : start + 30 * DAY_MS;
  return { start, end: Math.max(end, start) };
}

/**
 * Assign every task an integer level from its deadline. Undated tasks are pinned to a
 * single tray two levels below the last dated one. Levels are shifted so the minimum
 * is 0, which keeps vis-network's hierarchical layout well behaved.
 */
export function assignLevels(tasks, { bucket, start }) {
  const dated = new Map();
  for (const task of tasks) {
    const due = parseDate(task.due);
    if (due != null) dated.set(task.id, Math.floor(bucket.level(due, start)));
  }
  const values = [...dated.values()];
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const trayLevel = max - min + 2;

  const levels = new Map();
  for (const task of tasks) {
    levels.set(task.id, dated.has(task.id) ? dated.get(task.id) - min : trayLevel);
  }
  return { levels, trayLevel, minLevel: min };
}

/* --------------------------------------------------------------- status */

/**
 * Everything a node needs to render, computed rather than stored: a task file only
 * ever records `done`.
 */
export function deriveStatus(task, byId, now = Date.now()) {
  const total = task.subtasks?.length ?? 0;
  const checked = task.subtasks?.filter((s) => s.done).length ?? 0;
  const due = parseDate(task.due);
  const blockers = (task.blockedBy ?? []).filter((id) => byId.has(id) && !byId.get(id).done);
  return {
    done: Boolean(task.done),
    total,
    checked,
    ratio: task.done ? 1 : total === 0 ? 0 : checked / total,
    started: !task.done && checked > 0,
    blocked: !task.done && blockers.length > 0,
    blockers,
    overdue: !task.done && due != null && due < now,
  };
}

/** Index tasks by id for the lookups `deriveStatus` and the graph need. */
export const indexById = (tasks) => new Map(tasks.map((t) => [t.id, t]));

/* -------------------------------------------------------------- filters */

/** Every distinct person named across `tasks`, sorted. */
export function allPeople(tasks) {
  return [...new Set(tasks.flatMap((t) => t.people ?? []))].sort((a, b) => a.localeCompare(b));
}

/** Every distinct project tag across `tasks`, sorted. */
export function allProjectTags(tasks) {
  return [...new Set(tasks.flatMap((t) => t.project ?? []))].sort((a, b) => a.localeCompare(b));
}

/**
 * Narrow `tasks` to one project, optionally to a set of people, optionally dropping
 * completed work. Non-matching tasks are removed outright — the layout re-runs on
 * whatever is left.
 */
export function filterTasks(tasks, { projectId = null, people = [], hideDone = false } = {}) {
  const wanted = new Set(people);
  return tasks.filter((task) => {
    if (projectId && !(task.project ?? []).includes(projectId)) return false;
    if (wanted.size > 0 && !(task.people ?? []).some((p) => wanted.has(p))) return false;
    if (hideDone && task.done) return false;
    return true;
  });
}

/**
 * Graph edges for a set of tasks. `blocks` edges run from the prerequisite to the
 * dependent; `part-of` edges run from the child to its parent. Edges pointing to a
 * task outside the set are dropped, and a `blocks` edge whose prerequisite is due
 * *after* its dependent is flagged as a scheduling conflict.
 */
export function buildEdges(tasks, levels) {
  const present = new Set(tasks.map((t) => t.id));
  const edges = [];
  for (const task of tasks) {
    for (const from of task.blockedBy ?? []) {
      if (!present.has(from)) continue;
      const conflict = (levels?.get(from) ?? 0) > (levels?.get(task.id) ?? 0);
      edges.push({ id: `blocks:${from}->${task.id}`, from, to: task.id, kind: 'blocks', conflict });
    }
    for (const parent of task.partOf ?? []) {
      if (!present.has(parent)) continue;
      edges.push({
        id: `part-of:${task.id}->${parent}`,
        from: task.id,
        to: parent,
        kind: 'part-of',
        conflict: false,
      });
    }
  }
  return edges;
}
