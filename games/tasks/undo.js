/**
 * Whole-board undo/redo.
 *
 * A board is a few dozen small objects, so snapshotting the entire state on every
 * mutation is simpler and more reliable than diffing, and cheap enough not to matter.
 * History is in-memory only and resets on reload.
 */

const LIMIT = 50;

export function createHistory(initial) {
  let past = [];
  let future = [];
  let present = structuredClone(initial);

  return {
    get current() {
      return present;
    },
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
    /** Record a new state, discarding any redo branch. */
    push(next) {
      past.push(present);
      if (past.length > LIMIT) past = past.slice(-LIMIT);
      present = structuredClone(next);
      future = [];
      return present;
    },
    /** Replace the present without recording history (e.g. after a reload). */
    reset(next) {
      past = [];
      future = [];
      present = structuredClone(next);
      return present;
    },
    undo() {
      if (!past.length) return present;
      future.unshift(present);
      present = past.pop();
      return present;
    },
    redo() {
      if (!future.length) return present;
      past.push(present);
      present = future.shift();
      return present;
    },
  };
}
