/**
 * Where the markdown lives.
 *
 * Two backends behind one interface:
 *   - `folder`: real `.md` files in a directory chosen with the File System Access API
 *     (Chrome/Edge). Point it at a folder inside an Obsidian vault and it works today.
 *   - `local`:  a `filename -> text` map in localStorage. Every browser.
 *
 * localStorage is kept as a mirror in both modes, but is never written *back* to a
 * folder — when a folder is connected the folder is the single source of truth. This
 * is the only module that knows where bytes live: an Obsidian plugin reimplements just
 * this file against the vault API.
 */

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

async function readDirectory(handle) {
  const files = {};
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind !== 'file' || !name.toLowerCase().endsWith('.md')) continue;
    files[name] = await (await entry.getFile()).text();
  }
  return files;
}

export function createStorage() {
  let directory = null;
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
      const fileHandle = await directory.getFileHandle(name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
      written.set(name, text);
    }
    // Remove only files we ourselves put there, so unrelated notes in a vault survive.
    for (const name of owned) {
      if (name in files) continue;
      try {
        await directory.removeEntry(name);
      } catch {
        /* already gone */
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
