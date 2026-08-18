/**
 * Where the markdown lives.
 *
 * Two backends behind one interface:
 *   - `folder`: real `.md` files in a directory chosen with the File System Access API
 *     (Chrome/Edge). Point it at a folder inside an Obsidian vault and it works today.
 *   - `local`:  a `filename -> text` map in localStorage. Every browser.
 *
 * The connected folder is a *parent*: its own `.md` files are the board's unfiled tasks, and
 * each subfolder holding a `_project-*.md` is a project. Keys are therefore paths —
 * `website/wireframes.md` — one level deep and no further.
 *
 * localStorage is kept as a mirror in both modes, but is never written *back* to a
 * folder — when a folder is connected the folder is the single source of truth. This
 * is the only module that knows where bytes live: an Obsidian plugin reimplements just
 * this file against the vault API.
 */

// The one thing this layer needs from the domain: which subfolders are projects, and so
// which are none of its business. Everything else about a file's meaning stays in model.js.
import { PROJECT_PREFIX } from './model.js';

const MIRROR_KEY = 'tasks.files';
const IDB_NAME = 'tasks-storage';
const IDB_STORE = 'handles';
const HANDLE_KEY = 'directory';

export const supportsFolder = typeof globalThis.showDirectoryPicker === 'function';

/* ------------------------------------------ directory handle persistence */

function idb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(IDB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(value) {
  const db = await idb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, HANDLE_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbGet() {
  const db = await idb();
  const value = await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const request = tx.objectStore(IDB_STORE).get(HANDLE_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

/* --------------------------------------------------------------- mirror */

function readMirror() {
  try {
    const raw = localStorage.getItem(MIRROR_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeMirror(files) {
  try {
    localStorage.setItem(MIRROR_KEY, JSON.stringify(files));
  } catch {
    /* quota exceeded or storage disabled — the folder backend still works */
  }
}

/* -------------------------------------------------------------- backend */

const isMarkdown = (name) => name.toLowerCase().endsWith('.md');

/** Every `.md` entry in one directory, as `[name, handle]`, without reading any contents. */
async function markdownEntries(handle) {
  const found = [];
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'file' && isMarkdown(name)) found.push([name, entry]);
  }
  return found;
}

/**
 * The parent folder and its project subfolders, one level deep.
 *
 * A subfolder counts as a project only if it holds a `_project-*.md`, and that is decided
 * from the file *names* — a folder that is not a project is never read, never written to and
 * never deleted from. The parent is often a whole vault, so most of what is in it is none of
 * this app's business.
 */
async function readDirectory(handle) {
  const files = {};
  const subdirectories = [];

  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'directory') subdirectories.push([name, entry]);
    else if (entry.kind === 'file' && isMarkdown(name)) {
      files[name] = await (await entry.getFile()).text();
    }
  }

  for (const [folder, directoryHandle] of subdirectories) {
    const entries = await markdownEntries(directoryHandle);
    if (!entries.some(([name]) => name.startsWith(PROJECT_PREFIX))) continue;
    for (const [name, entry] of entries) {
      files[`${folder}/${name}`] = await (await entry.getFile()).text();
    }
  }

  return files;
}

export function createStorage() {
  let directory = null;

  /**
   * The directory a path lives in. Creating on the way down is for writing only, so a stale
   * delete can never conjure the folder it was about to remove something from.
   */
  async function directoryFor(path, create) {
    let dir = directory;
    for (const part of path.split('/').slice(0, -1)) {
      dir = await dir.getDirectoryHandle(part, { create });
    }
    return dir;
  }

  const basename = (path) => path.slice(path.lastIndexOf('/') + 1);
  /** Files we have read or written in the connected folder — the only ones we may delete. */
  let owned = new Set();
  /** Last content written per file, so unchanged files are not rewritten. */
  let written = new Map();

  const state = {
    get mode() {
      return directory ? 'folder' : 'local';
    },
    get folderName() {
      return directory?.name ?? '';
    },
    supportsFolder,
    /** True when a folder was connected previously but needs a click to re-authorise. */
    reconnectable: false,
  };

  /** Reattach a previously chosen folder, but only if permission is still granted. */
  async function tryRestoreFolder() {
    if (!supportsFolder) return false;
    let handle;
    try {
      handle = await idbGet();
    } catch {
      return false;
    }
    if (!handle) return false;
    try {
      if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') {
        directory = handle;
        return true;
      }
      state.reconnectable = true;
    } catch {
      /* handle is stale or the API is unavailable */
    }
    return false;
  }

  async function load() {
    if (!directory) await tryRestoreFolder();
    if (directory) {
      const files = await readDirectory(directory);
      owned = new Set(Object.keys(files));
      written = new Map(Object.entries(files));
      writeMirror(files);
      return files;
    }
    return readMirror() ?? {};
  }

  async function save(files) {
    writeMirror(files);
    if (!directory) return;
    for (const [name, text] of Object.entries(files)) {
      // Only touch files that actually changed. Rewriting all of them on every edit
      // would churn mtimes and wake Obsidian's file watcher for notes nothing altered.
      if (written.get(name) === text) continue;
      const dir = await directoryFor(name, true);
      const fileHandle = await dir.getFileHandle(basename(name), { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
      written.set(name, text);
    }
    // Remove only files we ourselves put there, so unrelated notes in a vault survive. A
    // task retagged into another project shows up here as a delete of its old path, the new
    // one having just been written above — which is the whole of moving a file between
    // project folders. Emptied directories are left alone: a project folder always keeps its
    // project file, and removing a directory in someone's vault is not this app's business.
    for (const name of owned) {
      if (name in files) continue;
      try {
        const dir = await directoryFor(name, false);
        await dir.removeEntry(basename(name));
      } catch {
        /* already gone, or its folder is */
      }
      written.delete(name);
    }
    owned = new Set(Object.keys(files));
  }

  /** Prompt for a directory. Returns its contents, which replace whatever was loaded. */
  async function connectFolder() {
    if (!supportsFolder) throw new Error('This browser cannot open folders.');
    const handle =
      (state.reconnectable && (await idbGet())) || (await globalThis.showDirectoryPicker({ mode: 'readwrite' }));
    if ((await handle.requestPermission({ mode: 'readwrite' })) !== 'granted') {
      throw new Error('Permission to use that folder was declined.');
    }
    directory = handle;
    state.reconnectable = false;
    await idbSet(handle);
    return load();
  }

  function disconnectFolder() {
    directory = null;
    written = new Map();
    state.reconnectable = false;
    idbSet(null).catch(() => {});
  }

  return { state, load, save, connectFolder, disconnectFolder, tryRestoreFolder };
}
