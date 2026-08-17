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

/**
 * Frontmatter scalars are read as strings, so a stored coordinate has to be coerced back.
 * Anything unparseable becomes null rather than NaN, which would poison the layout.
 */
function asNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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
    // Marks the auto-managed node that carries a project's end goal.
    goal: data.goal === true,
    // The one task in hand. At most one file carries it; `markWorking` is what enforces that.
    working: data.working === true,
    // Where the card sits horizontally once auto-layout is off. Null means "wherever the
    // layout puts it", which is every task until the board is frozen.
    x: asNumber(data.x),
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
            'goal',
            'working',
            'x',
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
      ...(task.goal ? { goal: true } : {}),
      // Written only when set, like `goal`, so no file gains a `working: false` line.
      ...(task.working ? { working: true } : {}),
      'blocked-by': task.blockedBy ?? [],
      'part-of': task.partOf ?? [],
      x: task.x ?? '',
      ...(task.extra ?? {}),
    },
    ['id', 'title', 'done']
  );
  return serialiseFrontmatter(data, serialiseBody(task.notes, task.subtasks));
}

/**
 * Parse a `_project-<id>.md` file, whose path may name the folder it lives in.
 *
 * The end goal is a one-line `goal:` scalar; the body is free-form context. A file
 * written before the two were separated has no `goal:` key, and its body is read as
 * context rather than guessed at — nothing is silently reinterpreted as a goal.
 */
export function projectFromMarkdown(filename, text) {
  const { data, body } = parseFrontmatter(text);
  const path = String(filename);
  const cut = path.lastIndexOf('/');
  const fallbackId = path
    .slice(cut + 1)
    .replace(/\.md$/i, '')
    .replace(new RegExp(`^${PROJECT_PREFIX}`), '');
  return {
    id: String(data.id || fallbackId),
    title: String(data.title || fallbackId),
    goal: data.goal ? String(data.goal) : '',
    people: asList(data.people),
    start: data.start ? String(data.start) : '',
    end: data.end ? String(data.end) : '',
    color: data.color ? String(data.color) : '',
    /**
     * The folder this project's files live in; empty means the parent folder itself. Read
     * off the path rather than out of the frontmatter — the file's own location already
     * says it, so there is nothing to keep in step and nothing to write.
     */
    folder: cut === -1 ? '' : path.slice(0, cut),
    context: String(body).trim(),
  };
}

export function projectToMarkdown(project) {
  return serialiseFrontmatter(
    omitEmpty(
      {
        id: project.id,
        title: project.title,
        goal: project.goal ?? '',
        people: project.people ?? [],
        start: project.start ?? '',
        end: project.end ?? '',
        color: project.color ?? '',
      },
      ['id', 'title']
    ),
    project.context ?? ''
  );
}

/* ---------------------------------------------------------------- trash */

export const TRASH_FILENAME = '_trash.md';
/** Deletions kept before the oldest falls off. */
export const TRASH_LIMIT = 50;

/**
 * The trash holds whole deleted tasks and severed links. Those shapes nest, which the
 * flat-YAML subset in `frontmatter.js` cannot express, so the body is one fenced JSON
 * block — honest about the format rather than inventing a markdown encoding for it.
 */
export function trashFromMarkdown(text) {
  const { body } = parseFrontmatter(text);
  const match = /```json\s*\n([\s\S]*?)```/.exec(String(body));
  if (!match) return [];
  try {
    const items = JSON.parse(match[1]);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function trashToMarkdown(trash) {
  const body = ['```json', JSON.stringify(trash ?? [], null, 2), '```'].join('\n');
  return serialiseFrontmatter({ id: '_trash' }, body);
}

/** Newest first, oldest dropped past the cap. */
export function pushTrash(trash, record) {
  return [record, ...(trash ?? [])].slice(0, TRASH_LIMIT);
}

export const taskFilename = (task) => `${task.id}.md`;
export const projectFilename = (project) => `${PROJECT_PREFIX}${project.id}.md`;

/** Join a folder to a filename. An empty folder means the parent folder itself. */
const inFolder = (folder, name) => (folder ? `${folder}/${name}` : name);

/**
 * The folder a task's file belongs in: the one owned by the first project it is tagged
 * with. Its other tags go on working — they simply do not get to decide where the file
 * lives, because a file cannot be in two directories at once. A task with no tags, or one
 * tagged with a project this board does not have, sits at the parent root.
 */
function homeFolder(task, folderOf) {
  return folderOf.get(task.project?.[0]) ?? '';
}

/**
 * Project ids claimed by more than one folder. The first read wins; this is what lets the
 * app say so rather than quietly dropping the others.
 */
export function duplicateProjectIds(files) {
  const seen = new Set();
  const clashes = new Set();
  for (const filename of Object.keys(files)) {
    const base = filename.slice(filename.lastIndexOf('/') + 1);
    if (!/\.md$/i.test(base) || !base.startsWith(PROJECT_PREFIX)) continue;
    const id = base.replace(/\.md$/i, '').replace(new RegExp(`^${PROJECT_PREFIX}`), '');
    if (seen.has(id)) clashes.add(id);
    seen.add(id);
  }
  return [...clashes];
}

/**
 * Build a board from a `filename -> markdown text` map.
 * Files starting with `_project-` are projects; every other `.md` file is a task.
 */
export function buildBoard(files) {
  const tasks = [];
  const projects = [];
  let trash = [];
  const claimed = new Set();
  for (const [filename, text] of Object.entries(files)) {
    if (!/\.md$/i.test(filename)) continue;
    const base = filename.slice(filename.lastIndexOf('/') + 1);
    // The trash is board state, not a task — without this it parses as one.
    if (base === TRASH_FILENAME) trash = trashFromMarkdown(text);
    else if (base.startsWith(PROJECT_PREFIX)) {
      // The whole path here: a project file carries the folder it was found in.
      const project = projectFromMarkdown(filename, text);
      // Two folders claiming one id would otherwise fight over the same files forever.
      if (claimed.has(project.id)) continue;
      claimed.add(project.id);
      projects.push(project);
    } else tasks.push(taskFromMarkdown(base, text));
  }
  tasks.sort((a, b) => a.id.localeCompare(b.id));
  projects.sort((a, b) => a.id.localeCompare(b.id));
  return { tasks, projects, trash };
}

/** Inverse of `buildBoard`. */
export function boardToFiles({ tasks, projects, trash }) {
  const files = {};
  const folderOf = new Map((projects ?? []).map((p) => [p.id, p.folder ?? '']));
  for (const project of projects) {
    files[inFolder(project.folder, projectFilename(project))] = projectToMarkdown(project);
  }
  for (const task of tasks) {
    files[inFolder(homeFolder(task, folderOf), taskFilename(task))] = taskToMarkdown(task);
  }
  // The trash spans every project, so it belongs to the parent rather than to any one of them.
  if (trash?.length) files[TRASH_FILENAME] = trashToMarkdown(trash);
  return files;
}

/* ----------------------------------------------------------- goal tasks */

/** The auto-managed node carrying a project's end goal. */
export const goalTaskId = (projectId) => `${projectId}-goal`;

/**
 * Reconcile the goal nodes with the projects that own them: create one for every
 * project that has a goal, keep its title and deadline in step, and hand back any whose
 * goal was cleared so the caller can bin them like any other deletion.
 *
 * Returns the new task list plus the removed goal tasks, rather than mutating, so the
 * caller stays in charge of history and the trash.
 */
export function syncGoalTasks({ tasks, projects }, now = Date.now()) {
  const wanted = new Map(
    projects.filter((p) => p.goal?.trim()).map((p) => [goalTaskId(p.id), p])
  );
  const removed = [];
  let next = [];

  for (const task of tasks) {
    if (!task.goal) {
      next.push(task);
      continue;
    }
    const project = wanted.get(task.id);
    if (!project) {
      removed.push(task);
      continue;
    }
    wanted.delete(task.id);
    const title = project.goal.trim();
    const due = project.end ?? '';
    next.push(task.title === title && task.due === due ? task : { ...task, title, due });
  }

  for (const [id, project] of wanted) {
    next.push({
      id,
      title: project.goal.trim(),
      project: [project.id],
      people: [],
      due: project.end ?? '',
      estimate: '',
      created: formatDate(now),
      done: false,
      goal: true,
      working: false,
      x: null,
      blockedBy: [],
      partOf: [],
      notes: '',
      subtasks: [],
      extra: {},
    });
  }

  next.sort((a, b) => a.id.localeCompare(b.id));
  return { tasks: next, removed };
}

/* ------------------------------------------------------------- merging */

/**
 * Fold `sourceId` into `targetId` as checklist items: its title becomes the first line,
 * its own subtasks follow, and anything that depended on it now depends on the target.
 * The source task ceases to exist — it is returned so the caller can bin it.
 *
 * The exact inverse of promoting a checklist item to a task of its own.
 */
export function mergeTaskInto(tasks, sourceId, targetId) {
  const source = tasks.find((t) => t.id === sourceId);
  const target = tasks.find((t) => t.id === targetId);
  if (!source || !target || sourceId === targetId || source.goal || target.goal) return null;

  const folded = [
    { done: Boolean(source.done), text: source.title },
    ...(source.subtasks ?? []),
  ];

  /** Point a reference list at the target instead, without duplicating or self-linking. */
  const rewire = (list, ownerId) =>
    [...new Set((list ?? []).map((ref) => (ref === sourceId ? targetId : ref)))].filter(
      (ref) => ref !== ownerId
    );

  const next = tasks
    .filter((t) => t.id !== sourceId)
    .map((t) => {
      const merged =
        t.id === targetId ? { ...t, subtasks: [...(t.subtasks ?? []), ...folded] } : t;
      return {
        ...merged,
        blockedBy: rewire(merged.blockedBy, merged.id),
        partOf: rewire(merged.partOf, merged.id),
      };
    });

  return { tasks: next, merged: source };
}

/* ----------------------------------------------------------- relations */

/**
 * Every task that transitively depends on `id` through `field`, `id` itself included:
 * exactly the references that cannot be added to `id`'s own `field` without closing a
 * loop.
 *
 * Both relations are acyclic by nature — work cannot wait on itself, and nothing is part
 * of its own part — and the timeline layout assumes as much, so the loop has to be
 * refused rather than drawn.
 */
/**
 * A person's initials for the card: one letter per word, at most two. `Georg` -> `G`,
 * `Georg Muntingh` -> `GM`, so a roster of first names and one of full names both read.
 */
export function initialsOf(name) {
  const words = String(name ?? '')
    .split(/[\s._-]+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
  if (!words.length) return '?';
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Set the one task in hand, releasing whatever held it before; `null` releases without
 * setting another. Unchanged tasks are returned by identity, so this is cheap to apply.
 *
 * "Currently working on" is singular, and this is the only place that is enforced.
 */
export function markWorking(tasks, id) {
  return tasks.map((task) => {
    const working = id != null && task.id === id;
    return Boolean(task.working) === working ? task : { ...task, working };
  });
}

export function cyclicRefs(tasks, id, field) {
  const forbidden = new Set([id]);
  // A fixed point rather than a walk: the relation is stored on the dependent, so the
  // only way to find what depends on `id` is to keep sweeping until nothing new turns up.
  for (let grew = true; grew; ) {
    grew = false;
    for (const task of tasks) {
      if (forbidden.has(task.id)) continue;
      if ((task[field] ?? []).some((ref) => forbidden.has(ref))) {
        forbidden.add(task.id);
        grew = true;
      }
    }
  }
  return forbidden;
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
export function assignLevels(tasks, { bucket, start, collapse = false }) {
  const dated = new Map();
  for (const task of tasks) {
    const due = parseDate(task.due);
    if (due != null) dated.set(task.id, Math.floor(bucket.level(due, start)));
  }
  const values = [...dated.values()];
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  // Without collapsing, a level *is* its offset from the earliest deadline. With it,
  // only occupied periods get a row, and `levelOrigin` remembers which period each row
  // came from so the gutter can still label real dates.
  const occupied = [...new Set(values)].sort((a, b) => a - b);
  const rowOf = collapse
    ? new Map(occupied.map((raw, index) => [raw, index]))
    : new Map(occupied.map((raw) => [raw, raw - min]));
  const lastRow = collapse ? Math.max(0, occupied.length - 1) : max - min;
  const trayLevel = lastRow + 2;

  const levels = new Map();
  for (const task of tasks) {
    levels.set(task.id, dated.has(task.id) ? rowOf.get(dated.get(task.id)) : trayLevel);
  }

  // Offsets from the earliest deadline, not absolute periods, so callers can map a row
  // back to a date with `origin + minLevel` whether or not the scale was collapsed.
  // Uncollapsed, every row in range is a real period even with nothing due in it — only
  // a collapsed scale can have rows that stand for no period at all.
  const levelOrigin = collapse
    ? new Map([...rowOf].map(([raw, row]) => [row, raw - min]))
    : new Map(Array.from({ length: lastRow + 1 }, (_, row) => [row, row]));
  const gaps = [];
  if (collapse) {
    occupied.forEach((raw, index) => {
      const previous = occupied[index - 1];
      if (index > 0 && raw - previous > 1) {
        gaps.push({ afterLevel: index - 1, periods: raw - previous - 1 });
      }
    });
  }

  return { levels, trayLevel, minLevel: min, lastLevel: lastRow, levelOrigin, gaps };
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
    working: Boolean(task.working),
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
 * Everyone connected to a project: the roster it declares, plus anyone holding one of
 * its tasks but missing from that roster. `inRoster` lets the UI show the difference
 * so a name can be adopted, and `openTasks` counts the incomplete work each holds.
 */
export function projectPeople(project, tasks) {
  const projectTasks = filterTasks(tasks, { projectId: project?.id ?? null });
  const roster = project?.people ?? [];
  const names = [...new Set([...roster, ...allPeople(projectTasks)])];
  const inRoster = new Set(roster);
  return names
    .map((name) => ({
      name,
      inRoster: inRoster.has(name),
      openTasks: projectTasks.filter((t) => !t.done && (t.people ?? []).includes(name)).length,
    }))
    .sort((a, b) => Number(b.inRoster) - Number(a.inRoster) || a.name.localeCompare(b.name));
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
 * Every task that nothing else depends on, linked to its project's goal node.
 *
 * Computed on each render rather than stored: the graph always converges on the goal
 * with no dangling ends, and no bookkeeping leaks into the vault. A task already
 * attached to something — depended on by another task, or part of one — is left alone,
 * since its own parent will reach the goal for it.
 */
export function goalLinks(tasks) {
  const present = new Set(tasks.map((t) => t.id));
  const goalFor = new Map();
  for (const task of tasks) {
    if (task.goal) for (const id of task.project ?? []) goalFor.set(id, task.id);
  }
  if (!goalFor.size) return [];

  const attached = new Set();
  for (const task of tasks) {
    for (const ref of task.blockedBy ?? []) if (present.has(ref)) attached.add(ref);
    for (const ref of task.partOf ?? []) if (present.has(ref)) attached.add(task.id);
  }

  const links = [];
  for (const task of tasks) {
    if (task.goal || attached.has(task.id)) continue;
    const goalId = (task.project ?? []).map((id) => goalFor.get(id)).find(Boolean);
    if (goalId && goalId !== task.id) links.push({ from: task.id, to: goalId });
  }
  return links;
}

/**
 * Graph edges for a set of tasks. `blocks` edges run from the prerequisite to the
 * dependent; `part-of` edges run from the child to its parent. Edges pointing to a
 * task outside the set are dropped, and a `blocks` edge whose prerequisite is due
 * *after* its dependent is flagged as a scheduling conflict.
 */
export function buildEdges(tasks, levels) {
  const present = new Set(tasks.map((t) => t.id));
  // Undated work sits in a tray below every scheduled row, which is a position, not a
  // date. Calling that "due after" would be a claim the task cannot support, so a
  // conflict needs a real deadline at both ends.
  const dated = new Set(tasks.filter((t) => t.due).map((t) => t.id));
  const conflicts = (from, to) =>
    dated.has(from) && dated.has(to) && (levels?.get(from) ?? 0) > (levels?.get(to) ?? 0);

  const edges = [];
  for (const { from, to } of goalLinks(tasks)) {
    edges.push({ id: `goal:${from}->${to}`, from, to, kind: 'goal', conflict: conflicts(from, to) });
  }
  for (const task of tasks) {
    for (const from of task.blockedBy ?? []) {
      if (!present.has(from)) continue;
      const conflict = conflicts(from, task.id);
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
