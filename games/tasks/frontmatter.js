/**
 * Markdown + YAML-frontmatter parsing and serialisation.
 *
 * Deliberately covers only the subset of YAML this app writes: scalars, booleans,
 * flow arrays (`[a, b]`) and block arrays (`- a`). Anything it does not understand is
 * kept verbatim as a string so that round-tripping a file from a real Obsidian vault
 * never silently drops data.
 *
 * Pure: no DOM, no storage. Reused as-is by a future Obsidian plugin.
 */

/** Keys we write in a fixed order; any other key is preserved after these. */
const KEY_ORDER = [
  'id',
  'title',
  'goal',
  'starred',
  'archived',
  'project',
  'people',
  'due',
  'estimate',
  'created',
  'done',
  'working',
  'blocked-by',
  'part-of',
  // A canvas coordinate, last because it is the least interesting line in the file.
  'x',
];

/** Keys that are always serialised as a list, even when they hold a single value. */
const LIST_KEYS = new Set(['project', 'people', 'blocked-by', 'part-of']);

const CHECKLIST_RE = /^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;

function unquote(raw) {
  const s = raw.trim();
  if (s.length >= 2 && (s[0] === '"' || s[0] === "'") && s[s.length - 1] === s[0]) {
    return s.slice(1, -1);
  }
  return s;
}

function parseScalar(raw) {
  const s = raw.trim();
  if (s === '') return '';
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  return unquote(s);
}

function parseFlowList(raw) {
  const inner = raw.trim().slice(1, -1).trim();
  if (inner === '') return [];
  // Split on commas that are not inside quotes.
  const parts = [];
  let buf = '';
  let quote = null;
  for (const ch of inner) {
    if (quote) {
      if (ch === quote) quote = null;
      buf += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
    } else if (ch === ',') {
      parts.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  parts.push(buf);
  return parts.map((p) => unquote(p)).filter((p) => p !== '');
}

/**
 * Split `text` into its frontmatter object and the remaining body.
 * A file with no frontmatter yields `{ data: {}, body: text }`.
 */
export function parseFrontmatter(text) {
  const normalised = String(text).replace(/\r\n/g, '\n');
  if (!normalised.startsWith('---\n')) {
    return { data: {}, body: normalised.replace(/^\n+/, '') };
  }
  const end = normalised.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: normalised };

  const raw = normalised.slice(4, end + 1);
  const afterFence = normalised.indexOf('\n', end + 1);
  const body = afterFence === -1 ? '' : normalised.slice(afterFence + 1);

  const data = {};
  const lines = raw.split('\n');
  let currentListKey = null;

  for (const line of lines) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;

    const blockItem = /^\s*-\s+(.*)$/.exec(line);
    if (blockItem && currentListKey) {
      data[currentListKey].push(parseScalar(blockItem[1]));
      continue;
    }

    const kv = /^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;

    const [, key, rest] = kv;
    currentListKey = null;

    if (rest.trim() === '') {
      // Either an empty value or the header of a block list; assume block list and
      // downgrade to '' at the end if nothing followed.
      data[key] = [];
      currentListKey = key;
    } else if (rest.trim().startsWith('[') && rest.trim().endsWith(']')) {
      data[key] = parseFlowList(rest);
    } else {
      data[key] = parseScalar(rest);
    }
  }

  // A `key:` with nothing under it is an empty value, not an empty list — unless the
  // key is one we always treat as a list.
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length === 0 && !LIST_KEYS.has(key)) {
      data[key] = '';
    }
  }

  return { data, body };
}

function needsQuoting(value) {
  const s = String(value);
  return (
    s === '' ||
    /^[#&*!|>%@`?-]/.test(s) ||
    /[:,[\]{}]/.test(s) ||
    s !== s.trim() ||
    ['true', 'false', 'null', '~'].includes(s)
  );
}

function formatScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (value === null || value === undefined) return '';
  return needsQuoting(value) ? `'${String(value).replace(/'/g, "''")}'` : String(value);
}

function formatValue(key, value) {
  if (Array.isArray(value) || LIST_KEYS.has(key)) {
    const list = Array.isArray(value) ? value : [value].filter((v) => v !== '' && v != null);
    return `[${list.map(formatScalar).join(', ')}]`;
  }
  return formatScalar(value);
}

/** Serialise `{ data, body }` back to a markdown file. Inverse of `parseFrontmatter`. */
export function serialiseFrontmatter(data, body = '') {
  const keys = [
    ...KEY_ORDER.filter((k) => k in data),
    ...Object.keys(data).filter((k) => !KEY_ORDER.includes(k)),
  ];
  const lines = keys.map((key) => `${key}: ${formatValue(key, data[key])}`);
  const trimmedBody = String(body).replace(/\s+$/, '');
  return `---\n${lines.join('\n')}\n---\n${trimmedBody ? `${trimmedBody}\n` : ''}`;
}

/**
 * Split a markdown body into prose notes and a checklist.
 * Checklist items may appear anywhere; the remaining lines are the notes.
 */
export function parseBody(body) {
  const subtasks = [];
  const noteLines = [];
  for (const line of String(body).split('\n')) {
    const match = CHECKLIST_RE.exec(line);
    if (match) {
      subtasks.push({ done: match[1].toLowerCase() === 'x', text: match[2].trim() });
    } else {
      noteLines.push(line);
    }
  }
  return { notes: noteLines.join('\n').trim(), subtasks };
}

/** Inverse of `parseBody`: notes first, then the checklist. */
export function serialiseBody(notes, subtasks = []) {
  const checklist = subtasks
    .map((s) => `- [${s.done ? 'x' : ' '}] ${s.text}`)
    .join('\n');
  const trimmedNotes = String(notes || '').trim();
  if (!trimmedNotes) return checklist;
  if (!checklist) return trimmedNotes;
  return `${trimmedNotes}\n\n${checklist}`;
}
