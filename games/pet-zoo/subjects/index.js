// The subject registry: the one place that knows how many things this game teaches.
//
// A "subject" is a curriculum with an id space and a grader — the clock, and maths. Items from
// every subject share one `state.items`, one scheduler and one zoo, so
// a hungry pet is a hungry pet whichever subject it belongs to. What has to be per-subject
// is the tier ladder: mastering the clock should not hand out addition facts the child has
// never met. Hence `state.tiers`, a tier per subject, where there used to be one number.
//
// Pure, like everything it registers. Nothing here touches the DOM, storage or the clock.

import { UNLOCK_RATIO } from '../curriculum.js';
import * as clock from './clock.js';
import * as math from './math/index.js';

// Clock first: the order decides which subject a fresh zoo meets first, and it is also
// the order pets are handed out in, which existing saves depend on staying put.
export const SUBJECTS = { [clock.id]: clock, [math.id]: math };

export const SUBJECT_IDS = Object.keys(SUBJECTS);

export const DEFAULT_SUBJECT = clock.id;

export { UNLOCK_RATIO };

/** Every subject wound up to its last tier — the scheduler's "anything at all" fallback. */
export const ALL_TIERS_MAX = Object.fromEntries(
  SUBJECT_IDS.map((id) => [id, SUBJECTS[id].LAST_TIER])
);

/** The subject that recognises an id, or null — an id from a build we do not have. */
export function subjectOf(itemId) {
  for (const subject of Object.values(SUBJECTS)) {
    if (subject.owns(itemId)) return subject;
  }
  return null;
}

export const subjectIdOf = (itemId) => subjectOf(itemId)?.id ?? null;

/**
 * The cases an item is expected to cover, by id. Empty for anything whose question never
 * changes, which is most of the game — only a generated item has cases at all.
 */
export function shapesFor(itemId) {
  const subject = subjectOf(itemId);
  if (!subject?.pacing) return [];
  const payload = subject.parse(itemId);
  return payload ? subject.pacing(payload).requiredShapes ?? [] : [];
}

/** Every item this build can teach, across every subject. */
export const totalItemCount = () =>
  SUBJECT_IDS.reduce((sum, id) => sum + SUBJECTS[id].ALL_ITEMS.length, 0);

/* --------------------------------------------------------------- what to practise */

// What a grown-up has chosen to work on. A subject can be switched off entirely, and each
// one has a floor: the tier to start from, so a child who can already read o'clock is not
// drilled on it. Being asked what you already know is not neutral — it is the quickest way
// to decide a game is boring.
export const DEFAULT_PRACTICE = Object.fromEntries(
  SUBJECT_IDS.map((id) => [id, { on: true, floor: 0 }])
);

/**
 * The choices a state is standing on. Tolerant in the same way `tiersOf` is: a save written
 * before any of this existed simply has everything on, a floor beyond the ladder is clamped
 * to it, and a subject this build does not teach is ignored.
 *
 * Never returns "nothing at all". Switching off the last subject would leave the game with
 * no question to ask, so the default subject is switched back on rather than allowed.
 */
export function practiceOf(state) {
  const raw = state?.practice && typeof state.practice === 'object' ? state.practice : null;
  const out = {};
  for (const id of SUBJECT_IDS) {
    const entry = raw?.[id];
    const floor = Number.isFinite(entry?.floor) ? Math.floor(entry.floor) : 0;
    out[id] = {
      on: entry?.on === undefined ? true : Boolean(entry.on),
      floor: Math.max(0, Math.min(floor, SUBJECTS[id].LAST_TIER)),
    };
  }
  if (!SUBJECT_IDS.some((id) => out[id].on)) out[DEFAULT_SUBJECT].on = true;
  return out;
}

export const isEnabled = (practice, subjectId) => Boolean(practice?.[subjectId]?.on);

export const floorOf = (practice, subjectId) => practice?.[subjectId]?.floor ?? 0;

/** Whether more than one subject is switched on — what the last toggle checks before it lets go. */
export const enabledSubjects = (practice) => SUBJECT_IDS.filter((id) => isEnabled(practice, id));

/**
 * True for an item the game is no longer asking about — its subject is switched off, or its
 * tier sits below the floor. Derived from the choices rather than stored on the item, so the
 * two can never drift apart; the fields an item *does* carry (`restedAt`, `restedStep`) are
 * only there to freeze its schedule while it sleeps.
 */
export function isResting(item, practice) {
  const entry = practice?.[item?.subject ?? DEFAULT_SUBJECT];
  // An item from a subject this build has never heard of is left alone rather than hidden.
  if (!entry) return false;
  if (!entry.on) return true;
  return (item?.tier ?? 0) < entry.floor;
}

/** How many items the child is actually working towards — the zoo's denominator. */
export const enabledItemCount = (practice) =>
  SUBJECT_IDS.reduce((sum, id) => {
    if (!isEnabled(practice, id)) return sum;
    const floor = floorOf(practice, id);
    return sum + SUBJECTS[id].ALL_ITEMS.filter((entry) => entry.tier >= floor).length;
  }, 0);

/**
 * The tiers a state is standing on, tolerating both shapes. Saves written before there was
 * more than one subject carry a single `tier`, and so do the hand-built states in tests;
 * both mean "this is how far the clock has got".
 */
export function tiersOf(state) {
  const out = {};
  for (const id of SUBJECT_IDS) out[id] = 0;
  if (state?.tiers && typeof state.tiers === 'object') {
    for (const id of SUBJECT_IDS) {
      const value = state.tiers[id];
      if (Number.isFinite(value)) out[id] = Math.max(0, Math.floor(value));
    }
    return out;
  }
  if (Number.isFinite(state?.tier)) out[DEFAULT_SUBJECT] = Math.max(0, Math.floor(state.tier));
  return out;
}

/** How much of one subject's tier the child has mastered, 0..1. */
export function tierMastery(items, subjectId, tierId) {
  const subject = SUBJECTS[subjectId];
  if (!subject) return 0;
  const list = subject.tierItems(tierId);
  if (!list.length) return 0;
  const done = list.filter((entry) => items?.[entry.id]?.phase === 'graduated').length;
  return done / list.length;
}

/**
 * The highest tier of one subject the child may draw new material from.
 *
 * The ladder starts at the floor rather than at zero, which is how a skipped tier is walked
 * past: a tier nobody is being asked can never reach the 80% bar, so starting below the
 * floor would stall the whole subject forever.
 *
 * Note what this does *not* do. `tierMastery` is left alone and keeps reporting the real
 * graduated fraction, because `wallet.js` awards the `mastery:<tier>` milestone on it — if a
 * skipped tier reported itself mastered, a child would be paid forty coins for work they
 * never did.
 */
export function unlockedTier(items, subjectId, floor = 0) {
  const subject = SUBJECTS[subjectId];
  if (!subject) return 0;
  let tier = Math.max(0, Math.min(floor, subject.LAST_TIER));
  while (tier < subject.LAST_TIER && tierMastery(items, subjectId, tier) >= UNLOCK_RATIO) {
    tier += 1;
  }
  return tier;
}

/**
 * Everything unlocked that the child has never been shown, **interleaved between subjects**
 * rather than concatenated. This matters more than it looks: `nextItem` introduces new
 * material by taking the head of this list, so a concatenated list would teach every clock
 * face in the game before ever showing an addition fact. Zipping them means the two subjects
 * are introduced in step, and a subject that runs out simply stops appearing.
 */
export function unseenItems(items, tiers, practice = DEFAULT_PRACTICE) {
  const zoo = items ?? {};
  const level = typeof tiers === 'object' && tiers !== null ? tiers : { [DEFAULT_SUBJECT]: tiers };
  const chosen = practice ?? DEFAULT_PRACTICE;
  const queues = SUBJECT_IDS.map((id) => {
    const subject = SUBJECTS[id];
    if (!isEnabled(chosen, id)) return [];
    const top = Math.min(Number.isFinite(level[id]) ? level[id] : 0, subject.LAST_TIER);
    const out = [];
    // Starting at the floor is what stops skipped material ever being introduced — the
    // pets below it are never hatched in the first place, so there is nothing to put to
    // sleep later.
    for (let tier = floorOf(chosen, id); tier <= top; tier += 1) {
      for (const entry of subject.tierItems(tier)) {
        if (!zoo[entry.id]) out.push({ ...entry, subject: id });
      }
    }
    return out;
  });

  return interleave(queues);
}

/**
 * Round-robin a list of queues into one, skipping those that have run dry. Its own function
 * because it is the whole of the claim above — that two subjects are introduced in step — and
 * it is worth being able to test that claim without building two curricula to do it.
 */
export function interleave(queues) {
  const out = [];
  const longest = Math.max(0, ...queues.map((queue) => queue.length));
  for (let i = 0; i < longest; i += 1) {
    for (const queue of queues) {
      if (i < queue.length) out.push(queue[i]);
    }
  }
  return out;
}

/**
 * Recompute every subject's unlocked tier after an answer. Returns the new map and the ids
 * of the subjects that just moved, so the caller can celebrate one unlock per subject rather
 * than one unlock per game.
 */
export function refreshTiers(state) {
  const current = tiersOf(state);
  const chosen = practiceOf(state);
  const tiers = {};
  const unlocked = [];
  for (const id of SUBJECT_IDS) {
    const next = Math.max(current[id], unlockedTier(state?.items ?? {}, id, floorOf(chosen, id)));
    tiers[id] = next;
    if (next > current[id]) unlocked.push(id);
  }
  return { tiers, unlocked };
}
