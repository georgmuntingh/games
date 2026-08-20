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
 *
 * A connected folder opens *read-only*. The folder may be inside a vault that syncs, and
 * nothing here can tell a folder that has finished syncing from one that is mid-pull — so
 * the answer comes from the person who can tell, and `unlock` re-reads before believing
 * them. Until then `save` touches nothing, which is what makes a tab left open for a week
 * harmless rather than a way to overwrite a week of edits made elsewhere.
 *
 * Unlocking is only the start of the session, though, and a folder in Dropbox keeps moving
 * underneath one. So every write and every delete is checked against the file as it is on
 * disk *now*, not as it was when the folder was read: anything that has moved since is
 * refused and reported rather than overwritten. And the files a sync client writes to keep
 * a version it could not merge are skipped entirely — they are the only copy of somebody's
 * work, and this app parsing them as tasks is how they would get deleted.
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

/**
 * What a sync client names the version it could not merge — Dropbox and Obsidian Sync write
 * `note (Georg's conflicted copy 2026-08-19).md`, Syncthing `note.sync-conflict-….md`.
 *
 * These carry the same frontmatter `id:` as the file they were copied from, so reading them
 * would give the board two tasks with one id, one path to write both to, and a delete of
 * whichever lost — destroying the recovery file the moment it appears. They are left
 * unread, unwritten and undeleted instead. A false positive costs nothing: some note in the
 * vault is simply none of this app's business, which is the normal state of most of them.
 */
const CONFLICT_PATTERNS = [
  /\([^)]*conflicted copy[^)]*\)\.md$/i, // Dropbox, Obsidian Sync
  /\.sync-conflict-[^/]*\.md$/i, // Syncthing
];
const isConflictCopy = (name) => CONFLICT_PATTERNS.some((pattern) => pattern.test(name));

/**
 * Every `.md` entry in one directory, as `[name, handle]`, without reading any contents.
 * Conflict copies are separated out here rather than filtered later, so nothing downstream —
 * including the test for whether this folder is a project at all — can see them.
 */
async function markdownEntries(handle) {
  const found = [];
  const conflicts = [];
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind !== 'file' || !isMarkdown(name)) continue;
    if (isConflictCopy(name)) conflicts.push(name);
    else found.push([name, entry]);
  }
  return { found, conflicts };
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
  /** What each file said it was when we read it, for `save` to check against later. */
  const stats = new Map();
  const conflicts = [];
  const subdirectories = [];

  // `lastModified` and `size` come with the `File` we are reading anyway, so the record of
  // what was on disk at this moment costs nothing beyond keeping it.
  const take = async (path, entry) => {
    const file = await entry.getFile();
    files[path] = await file.text();
    stats.set(path, { mtime: file.lastModified, size: file.size });
  };

  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'directory') subdirectories.push([name, entry]);
    else if (entry.kind === 'file' && isMarkdown(name)) {
      if (isConflictCopy(name)) conflicts.push(name);
      else await take(name, entry);
    }
  }

  for (const [folder, directoryHandle] of subdirectories) {
    const { found, conflicts: theirs } = await markdownEntries(directoryHandle);
    if (!found.some(([name]) => name.startsWith(PROJECT_PREFIX))) continue;
    // Only now that this folder is known to be a project's: a conflict copy in a folder we
    // have no business in is not this app's to count either.
    for (const name of theirs) conflicts.push(`${folder}/${name}`);
    for (const [name, entry] of found) await take(`${folder}/${name}`, entry);
  }

  return { files, stats, conflicts };
}

export function createStorage({ sameFile = (path, a, b) => a === b } = {}) {
  let directory = null;
  /** Whether writes to the connected folder have been authorised. See `unlock`. */
  let unlocked = false;

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

  /**
   * Every file we have read or written in the connected folder: what it said, and what the
   * filesystem said about it, when we last touched it.
   *
   * These are the only files we may write to or delete — and its keys are that claim of
   * ownership, so a file dropped from here is a file left alone from then on. The `mtime`
   * and `size` are what make "unchanged since we read it" a question about the disk rather
   * than about our own memory of it.
   */
  let snapshot = new Map();

  /**
   * One save at a time.
   *
   * `persist` is called without being awaited, so two quick edits start two saves — and each
   * save now checks a file and then writes it, which is only safe if nothing else is doing
   * the same in between. Re-reads queue here too, so a folder cannot be re-read halfway
   * through being written.
   */
  let queue = Promise.resolve();
  function serialise(job) {
    // Both arms: a job that threw must still let the next one run.
    const run = queue.then(job, job);
    queue = run.then(
      () => {},
      () => {}
    );
    return run;
  }

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
    /** Sync conflict copies seen in the folder, left untouched. Named so the app can say so. */
    conflictFiles: [],
    /** False while a connected folder is still read-only. Browser-only storage is always writable. */
    get writable() {
      return !directory || unlocked;
    },
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

  async function loadNow() {
    if (!directory) await tryRestoreFolder();
    if (directory) {
      const { files, stats, conflicts } = await readDirectory(directory);
      snapshot = new Map(
        Object.entries(files).map(([path, text]) => [path, { text, ...stats.get(path) }])
      );
      state.conflictFiles = conflicts;
      writeMirror(files);
      return files;
    }
    return readMirror() ?? {};
  }

  const load = () => serialise(loadNow);

  /**
   * What the filesystem says about a path right now, or null if there is nothing there.
   * Never creates: a stat is a question, and asking it must not answer itself.
   */
  async function statOnDisk(path) {
    try {
      const dir = await directoryFor(path, false);
      const handle = await dir.getFileHandle(basename(path), { create: false });
      const file = await handle.getFile();
      return { mtime: file.lastModified, size: file.size };
    } catch {
      return null;
    }
  }

  /** True when the file on disk is not the one we last read or wrote. */
  const moved = (recorded, current) =>
    current.mtime !== recorded.mtime || current.size !== recorded.size;

  async function saveNow(files) {
    // Before the mirror, not after: a board that was never allowed onto disk must not be
    // left behind in localStorage either, where a later session could write it back out.
    if (directory && !unlocked) return { skipped: 'read-only' };
    writeMirror(files);
    if (!directory) return {};
    /** Paths where the folder had moved on, so we left it alone. The caller has to say so. */
    const blocked = [];

    for (const [name, text] of Object.entries(files)) {
      // Only touch files that actually changed, and judge that by what the file *says*
      // rather than by its bytes. A note hand-written in a vault rarely matches this app's
      // spacing and key order, and rewriting all of those on the first edit of a session
      // would churn mtimes, wake Obsidian's watcher for notes nothing altered, and hand
      // every one of them to the next sync as a change to reconcile.
      const previous = snapshot.get(name);
      if (previous && sameFile(name, previous.text, text)) continue;

      // The check the whole file exists for: is this still the file we read? A folder in
      // Dropbox is written to by other machines while this tab sits open, and the edit in
      // hand was made against what we read, so overwriting a newer file loses whatever it
      // said. A file that has since vanished is not a conflict — it is simply gone, and
      // writing it back is what a save is for.
      const current = await statOnDisk(name);
      if (previous ? current && moved(previous, current) : Boolean(current)) {
        // The second case is a path we have never read with something already at it: another
        // machine got to this task first, or the vault has a note of its own by that name.
        // Either way these are bytes nobody here has seen, which is reason enough.
        blocked.push(name);
        continue;
      }

      const dir = await directoryFor(name, true);
      const fileHandle = await dir.getFileHandle(basename(name), { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
      // Re-stat rather than guess: what we recorded has to be what the *filesystem* now
      // says, or the next save would read its own write as somebody else's change.
      const after = await fileHandle.getFile();
      snapshot.set(name, { text, mtime: after.lastModified, size: after.size });
    }

    // Remove only files we ourselves put there, so unrelated notes in a vault survive. A
    // task retagged into another project shows up here as a delete of its old path, the new
    // one having just been written above — which is the whole of moving a file between
    // project folders. Emptied directories are left alone: a project folder always keeps its
    // project file, and removing a directory in someone's vault is not this app's business.
    for (const [name, previous] of [...snapshot]) {
      if (name in files) continue;
      const current = await statOnDisk(name);
      if (current && moved(previous, current)) {
        // Deleting is the one thing there is no recovering from, so a file that has changed
        // since we read it stays, and stays ours: the next re-read decides what it is now.
        blocked.push(name);
        continue;
      }
      if (current) {
        try {
          const dir = await directoryFor(name, false);
          await dir.removeEntry(basename(name));
        } catch {
          /* already gone, or its folder is */
        }
      }
      snapshot.delete(name);
    }

    return blocked.length ? { blocked } : {};
  }

  const save = (files) => serialise(() => saveNow(files));

  /**
   * Re-read the folder and say whether it now differs from what we last saw.
   *
   * This is what makes an open tab notice a folder that moved under it. The comparison is by
   * meaning, not bytes, so a sync client rewriting a file it did not really change does not
   * count as the folder having changed.
   */
  async function revalidateNow() {
    if (!directory || !unlocked) return { files: null, changed: false };
    const previous = snapshot;
    const files = await loadNow();
    const paths = new Set([...previous.keys(), ...Object.keys(files)]);
    let changed = false;
    for (const path of paths) {
      const before = previous.get(path);
      const after = files[path];
      if (before === undefined || after === undefined || !sameFile(path, before.text, after)) {
        changed = true;
        break;
      }
    }
    return { files, changed };
  }

  const revalidate = () => serialise(revalidateNow);

  /**
   * Stop claiming these files: leave them on disk, unwritten and undeleted.
   *
   * For files the board could not take in — two of them claiming one id, say. They were read,
   * so without this they count as ours, and the next save would delete the one that lost for
   * having no place in the board.
   */
  function disown(paths) {
    for (const path of paths) snapshot.delete(path);
  }

  /**
   * Authorise writes to the connected folder, re-reading it first.
   *
   * The re-read is the point: it is what makes "yes, this has finished syncing" true of the
   * folder as it is now rather than as it was at boot. Nothing has been written while
   * locked, so there is nothing to merge and the fresh contents simply replace the board.
   */
  function unlock() {
    return serialise(async () => {
      if (!directory) return null;
      const files = await loadNow();
      unlocked = true;
      return files;
    });
  }

  /** Withdraw that authorisation — the tab has been away long enough to have gone stale. */
  function lock() {
    unlocked = false;
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
    unlocked = false;
    state.reconnectable = false;
    // Failing to *remember* the folder is no reason to refuse to use it: private windows and
    // blocked storage both land here, and the folder itself works fine for this session.
    await idbSet(handle).catch(() => {});
    return load();
  }

  function disconnectFolder() {
    directory = null;
    unlocked = false;
    snapshot = new Map();
    state.conflictFiles = [];
    state.reconnectable = false;
    idbSet(null).catch(() => {});
  }

  return {
    state,
    load,
    save,
    revalidate,
    disown,
    unlock,
    lock,
    connectFolder,
    disconnectFolder,
    tryRestoreFolder,
  };
}
