// Persistence: one versioned JSON blob in localStorage, no backend and no IndexedDB.
// Even a completed zoo is only 144 small records, and only times the child has actually
// been shown are ever written.
//
// Everything derivable — a pet's mood, how many are hungry, tier progress — is computed
// at render time from `items`, never stored, so there is exactly one source of truth.

import { DEFAULT_LANGUAGE } from './i18n.js';
import { PLAY_MINUTES_DEFAULT } from './session.js';

export const STORAGE_KEY = 'pet-zoo/v1';
export const VERSION = 1;
const SAVE_DEBOUNCE_MS = 400;

export function freshState(now) {
  return {
    version: VERSION,
    createdAt: now,
    lastPlayedAt: now,
    reviewClock: 0,
    tier: 0,
    settings: {
      sound: true,
      haptics: true,
      language: DEFAULT_LANGUAGE,
      playMinutes: PLAY_MINUTES_DEFAULT,
      // Off by default: a child who can read digits will read the digits and never look
      // at the face, which is the one thing this game exists to teach.
      showDigital: false,
    },
    session: { startedAt: 0, answered: 0, correct: 0, napUntil: 0 },
    stats: { totalAnswered: 0, totalCorrect: 0, streak: 0, bestStreak: 0, daysPlayed: [] },
    items: {},
  };
}

export const dayStamp = (now) => new Date(now).toISOString().slice(0, 10);

/**
 * Never throws. A corrupt blob, a version from a future build, or a browser that refuses
 * storage entirely all degrade to a fresh in-memory zoo rather than a blank screen — the
 * child is not the person to hand a parse error to.
 */
export function load(now, storage = safeStorage()) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return freshState(now);
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== VERSION || typeof parsed.items !== 'object') {
      return freshState(now);
    }
    return {
      ...freshState(now),
      ...parsed,
      settings: { ...freshState(now).settings, ...parsed.settings },
      items: migrateItems(parsed.items),
    };
  } catch {
    return freshState(now);
  }
}

/**
 * Bring saved pets up to the current item shape. Saves written before forms existed have
 * no `feeds`, so it is reconstructed from `reps` — a pet that was already well known
 * simply appears at the form it had earned, rather than starting again from a baby.
 */
export function migrateItems(items) {
  const out = {};
  for (const [id, item] of Object.entries(items ?? {})) {
    out[id] =
      typeof item?.feeds === 'number'
        ? item
        : { ...item, feeds: item?.reps || (item?.hatchedAt ? 1 : 0) };
  }
  return out;
}

export function write(state, storage = safeStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    // Quota exhausted or storage blocked (private mode). Play continues; this session
    // just won't outlive the tab.
    return false;
  }
}

export function clear(storage = safeStorage()) {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do — the caller resets in memory either way */
  }
}

function safeStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Coalesces the many small writes a single answer produces into one. */
export function createSaver(storage = safeStorage()) {
  let timer = null;
  let pending = null;
  const flush = () => {
    clearTimeout(timer);
    timer = null;
    if (pending) write(pending, storage);
    pending = null;
  };
  return {
    save(state) {
      pending = state;
      if (timer === null) timer = setTimeout(flush, SAVE_DEBOUNCE_MS);
    },
    flush,
  };
}

/** Marks today as played and keeps the streak honest across midnight. */
export function touchDay(state, now) {
  const today = dayStamp(now);
  const days = state.stats.daysPlayed;
  if (days[days.length - 1] === today) return state;
  return {
    ...state,
    stats: { ...state.stats, daysPlayed: [...days.slice(-59), today] },
  };
}
