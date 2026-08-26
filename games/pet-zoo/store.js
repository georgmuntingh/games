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
import { sanitize as sanitizeInk } from './ink/memory.js';
import { DEFAULT_PRACTICE, practiceOf, SUBJECT_IDS, subjectIdOf, tiersOf } from './subjects/index.js';

export const STORAGE_KEY = 'pet-zoo/v1';
// 2 added `subject` to every item and turned the single `tier` into one per subject. Bumping
// this is safe *because* `load` upgrades rather than discards — see the version check there.
export const VERSION = 2;
const SAVE_DEBOUNCE_MS = 400;

export function freshState(now) {
  return {
    version: VERSION,
    createdAt: now,
    lastPlayedAt: now,
    reviewClock: 0,
    // One unlocked tier per subject: mastering the clock must not hand out addition facts
    // the child has never been shown, nor the other way round.
    tiers: Object.fromEntries(SUBJECT_IDS.map((id) => [id, 0])),
    // What a grown-up has chosen to work on: every subject, from the bottom, until they say
    // otherwise. See subjects/index.js — a switched-off subject or a tier below the floor is
    // simply never asked, and its pets sleep rather than starve.
    practice: structuredClone(DEFAULT_PRACTICE),
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
      // How a sum is answered: 'auto' follows the pointer, 'type' the keyboard, 'tap' the
      // on-screen buttons. Old saves pick this up from freshState on load, like any other
      // setting added after the fact.
      answerMode: 'auto',
      // Off by default. A backwards 3 is developmentally ordinary and always counts as a 3;
      // this only decides whether the game also shows, gently, which way round it usually
      // goes. Some children find that useful and some find it one more thing to get wrong.
      mirrorNudge: false,
    },
    session: { startedAt: 0, answered: 0, correct: 0, napUntil: 0 },
    // What this child's handwriting looks like, learned from the corrections they make.
    // Device- and child-specific, which is why transfer.js leaves it behind.
    ink: [],
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
    if (!parsed || typeof parsed.items !== 'object') return freshState(now);
    // A save from a *later* build is the only one we genuinely cannot read: it may lean on
    // fields this build has never heard of. An older one is ours to bring forward — which is
    // the whole point, because the alternative is silently deleting a child's zoo on the day
    // they update the game.
    if (!Number.isFinite(parsed.version) || parsed.version > VERSION) return freshState(now);
    const save = upgrade(parsed);
    return {
      ...freshState(now),
      ...save,
      // A balance is the one number worth spending on: hand-edited, corrupt or absent, it
      // comes back as a whole number of coins that is not negative.
      coins: normalizeCoins(save.coins),
      // Clamped and restricted to the subjects this build teaches, the same as the decor: a
      // hand-edited save must not be able to unlock material by editing one number.
      tiers: tiersOf(save),
      // Clamped the same way, and for the same reason: a hand-edited floor must not be able
      // to reach past the ladder, and a save that predates any of this simply has everything
      // switched on.
      practice: practiceOf(save),
      // Filtered rather than trusted, the same as a pet's decor: a hand-edited save must not
      // be able to put a piece this build cannot draw into the yard.
      zooDecor: sanitizeZoo(save.zooDecor),
      // Ids only, so an unknown one from a future build is simply worth nothing rather than
      // being a number this build has to make sense of.
      milestones: cleanMilestones(save.milestones),
      settings: { ...freshState(now).settings, ...save.settings },
      items: migrateItems(save.items),
      ink: sanitizeInk(save.ink),
    };
  } catch {
    return freshState(now);
  }
}

/**
 * Bring a whole save forward to the current schema. Field-by-field and additive, like
 * `migrateItems` below: a save can be old in one way and current in another, and nothing here
 * may ever throw away something it merely does not recognise.
 */
export function upgrade(parsed) {
  if (!parsed || parsed.version >= VERSION) return parsed;
  const save = { ...parsed, version: VERSION };
  // v1 → v2: the lone `tier` was always the clock's. `tiersOf` reads either shape.
  save.tiers = tiersOf(parsed);
  delete save.tier;
  return save;
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
    // An id no subject in this build recognises came from a newer one. We cannot draw it,
    // schedule it or grade it, so it is dropped rather than carried as a pet that never
    // appears — the same reasoning as an unknown decor id, one level up.
    const subject = subjectIdOf(id);
    if (!subject) continue;
    const feeds =
      typeof item?.feeds === 'number' ? item.feeds : item?.reps || (item?.hatchedAt ? 1 : 0);
    const cracks =
      typeof item?.cracks === 'number' ? item.cracks : crackFor(item?.correctStreak ?? 0);
    const decor = sanitizeDecor(item?.decor);
    const current =
      item?.subject === subject &&
      typeof item?.feeds === 'number' &&
      typeof item?.cracks === 'number' &&
      Array.isArray(item?.decor) &&
      decor.length === item.decor.length;
    out[id] = current ? item : { ...item, subject, feeds, cracks, decor };
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
