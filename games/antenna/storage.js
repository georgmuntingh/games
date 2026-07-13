// Persistent state. Two localStorage keys:
//  - STORAGE_KEY: the user's library — this is what export/import round-trips
//  - CACHE_KEY: disposable per-channel feed caches, kept out of backups
const STORAGE_KEY = 'antenna-v1';
const CACHE_KEY = 'antenna-feedcache-v1';

const HISTORY_CAP = 500;
const POSITIONS_CAP = 300;

export function defaults() {
  return {
    version: 1,
    channels: [], // { id, title, categoryId, addedAt }
    categories: [], // { id, name }
    savedVideos: [], // { videoId, title, author, channelId, thumbnail, durationSec, addedAt }
    playlists: [], // { playlistId, title, author, addedAt } — links to YouTube playlists
    localPlaylists: [], // { id, name, items: [{ videoId, title, author, thumbnail }], createdAt }
    queue: [], // { videoId, title, author, thumbnail }
    watched: {}, // videoId -> watchedAt (ms)
    positions: {}, // videoId -> { t, updatedAt }
    history: [], // { videoId, title, author, watchedAt }, newest first
    settings: {
      apiKey: '',
      proxyTemplate: '',
      showShorts: false,
      feedTTLMinutes: 30,
    },
  };
}

/** Returns an error message for an unusable state object, or null if OK. */
export function validate(raw) {
  if (!raw || typeof raw !== 'object') return 'Not a JSON object';
  if (raw.version !== 1) return `Unsupported version: ${raw.version}`;
  for (const key of ['channels', 'categories', 'savedVideos', 'playlists', 'localPlaylists', 'queue', 'history']) {
    if (key in raw && !Array.isArray(raw[key])) return `Field "${key}" must be an array`;
  }
  for (const key of ['watched', 'positions', 'settings']) {
    if (key in raw && (typeof raw[key] !== 'object' || raw[key] === null || Array.isArray(raw[key]))) {
      return `Field "${key}" must be an object`;
    }
  }
  return null;
}

/** Fill in anything missing so old/partial states keep working. */
export function migrate(raw) {
  const base = defaults();
  return {
    ...base,
    ...raw,
    version: 1,
    settings: { ...base.settings, ...(raw.settings || {}) },
  };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw && typeof raw === 'object' && !validate(raw)) return migrate(raw);
  } catch {
    // corrupt or unavailable storage: start fresh
  }
  return defaults();
}

let state = load();
let saveTimer = null;

export function getState() {
  return state;
}

function emitChange() {
  document.dispatchEvent(new CustomEvent('antenna:change'));
}

/** Mutate state via fn, persist (debounced) and notify views. */
export function update(fn) {
  fn(state);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 300);
  emitChange();
}

/** Synchronous write — used on pagehide and before export. */
export function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // private mode / quota: keep running from memory
  }
}

// --- domain helpers ----------------------------------------------------

export function recordPosition(videoId, t) {
  update((s) => {
    s.positions[videoId] = { t: Math.floor(t), updatedAt: Date.now() };
    const ids = Object.keys(s.positions);
    if (ids.length > POSITIONS_CAP) {
      ids
        .sort((a, b) => s.positions[a].updatedAt - s.positions[b].updatedAt)
        .slice(0, ids.length - POSITIONS_CAP)
        .forEach((id) => delete s.positions[id]);
    }
  });
}

export function clearPosition(videoId) {
  update((s) => {
    delete s.positions[videoId];
  });
}

export function markWatched({ videoId, title, author }) {
  update((s) => {
    s.watched[videoId] = Date.now();
    s.history.unshift({ videoId, title: title || videoId, author: author || '', watchedAt: Date.now() });
    if (s.history.length > HISTORY_CAP) s.history.length = HISTORY_CAP;
  });
}

// --- feed cache ---------------------------------------------------------

export function loadCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (raw && raw.version === 1 && typeof raw.channels === 'object') return raw;
  } catch {
    // fall through
  }
  return { version: 1, channels: {} };
}

export function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // cache is disposable; ignore quota errors
  }
}

export function clearCacheStorage() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

// --- export / import ------------------------------------------------------

export function exportJSON() {
  flush();
  return JSON.stringify(state, null, 2);
}

/** Replaces the whole library. Throws on malformed input. */
export function importJSON(text) {
  const raw = JSON.parse(text);
  const err = validate(raw);
  if (err) throw new Error(err);
  state = migrate(raw);
  flush();
  emitChange();
  return state;
}
