// Persistence: one versioned JSON blob in localStorage, no backend and no IndexedDB.
// Even a completed zoo is only 144 small records, and only times the child has actually
// been shown are ever written.
//
// Everything derivable — a pet's mood, how many are hungry, tier progress — is computed
// at render time from `items`, never stored, so there is exactly one source of truth.

import { DEFAULT_LANGUAGE } from './i18n.js';
import { PLAY_MINUTES_DEFAULT } from './session.js';
import { sanitizeDecor, sanitizeZoo } from './shop.js';
import { normalize as normalizeCoins } from './wallet.js';
import { crackFor } from './srs.js';

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
    coins: 0,
    // What the stall has sold for the yard, and which of the long-game milestones have
    // already been paid for. Both are lists of ids and nothing else: where a fountain stands
    // is derived from the yard's slots, exactly as a pet's furniture is from its habitat's.
    zooDecor: [],
    milestones: [],
    // When the shop's back pay was handed out. Set once, so a zoo that predates coins is
    // paid for the pets it already had exactly once however often it is reloaded.
    coinsGrantedAt: 0,
    // And when the milestones were first read. Its own latch rather than a share of
    // `coinsGrantedAt`, because a zoo that has already been paid its back pay has that flag
    // down and would otherwise have its milestone history read as brand new — and paid for.
    milestonesGrantedAt: 0,
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

/**
 * Milestone ids are the only thing this build stores that it does not itself enumerate — a
 * save from a later build may name one this one has never heard of, and that is fine: an id
 * it cannot price is worth nothing. What it must not do is carry something that is not an id
 * at all, so the shape is checked and the length is bounded. Shared with `transfer.js`, so a
 * file and a save are held to exactly one rule.
 */
export const isMilestoneId = (value) =>
  typeof value === 'string' && value.length > 0 && value.length <= 40;

/** Whatever is safe to keep from a stored or imported list of them. */
export const cleanMilestones = (list) =>
  Array.isArray(list) ? list.filter(isMilestoneId) : [];

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
      // A balance is the one number worth spending on: hand-edited, corrupt or absent, it
      // comes back as a whole number of coins that is not negative.
      coins: normalizeCoins(parsed.coins),
      // Filtered rather than trusted, the same as a pet's decor: a hand-edited save must not
      // be able to put a piece this build cannot draw into the yard.
      zooDecor: sanitizeZoo(parsed.zooDecor),
      // Ids only, so an unknown one from a future build is simply worth nothing rather than
      // being a number this build has to make sense of.
      milestones: cleanMilestones(parsed.milestones),
      settings: { ...freshState(now).settings, ...parsed.settings },
      items: migrateItems(parsed.items),
    };
  } catch {
    return freshState(now);
  }
}

/**
 * Bring saved pets up to the current item shape. Each field is backfilled independently, because
 * a save can be old in one way and current in another.
 *
 * `feeds` predates forms and is reconstructed from `reps` — a pet that was already well known
 * simply appears at the form it had earned, rather than starting again from a baby. `cracks`
 * predates the cracking egg and is reconstructed from the streak the egg had already built, so an
 * egg mid-way through a save from an older build comes back visibly part-broken. `decor` predates
 * the shop and starts empty, and is filtered on every load rather than trusted: an id this build
 * cannot draw must never reach a habitat.
 */
export function migrateItems(items) {
  const out = {};
  for (const [id, item] of Object.entries(items ?? {})) {
    const feeds =
      typeof item?.feeds === 'number' ? item.feeds : item?.reps || (item?.hatchedAt ? 1 : 0);
    const cracks =
      typeof item?.cracks === 'number' ? item.cracks : crackFor(item?.correctStreak ?? 0);
    const decor = sanitizeDecor(item?.decor);
    const current =
      typeof item?.feeds === 'number' &&
      typeof item?.cracks === 'number' &&
      Array.isArray(item?.decor) &&
      decor.length === item.decor.length;
    out[id] = current ? item : { ...item, feeds, cracks, decor };
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
