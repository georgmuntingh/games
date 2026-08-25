// The subject registry: the one place that knows how many things this game teaches.
//
// A "subject" is a curriculum with an id space and a grader — the clock, and (next) adding
// numbers. Items from every subject share one `state.items`, one scheduler and one zoo, so
// a hungry pet is a hungry pet whichever subject it belongs to. What has to be per-subject
// is the tier ladder: mastering the clock should not hand out addition facts the child has
// never met. Hence `state.tiers`, a tier per subject, where there used to be one number.
//
// Pure, like everything it registers. Nothing here touches the DOM, storage or the clock.

import { UNLOCK_RATIO } from '../curriculum.js';
import * as clock from './clock.js';

export const SUBJECTS = { [clock.id]: clock };

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

/** Every item this build can teach, across every subject. */
export const totalItemCount = () =>
  SUBJECT_IDS.reduce((sum, id) => sum + SUBJECTS[id].ALL_ITEMS.length, 0);

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

/** The highest tier of one subject the child may draw new material from. */
export function unlockedTier(items, subjectId) {
  const subject = SUBJECTS[subjectId];
  if (!subject) return 0;
  let tier = 0;
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
export function unseenItems(items, tiers) {
  const zoo = items ?? {};
  const level = typeof tiers === 'object' && tiers !== null ? tiers : { [DEFAULT_SUBJECT]: tiers };
  const queues = SUBJECT_IDS.map((id) => {
    const subject = SUBJECTS[id];
    const top = Math.min(Number.isFinite(level[id]) ? level[id] : 0, subject.LAST_TIER);
    const out = [];
    for (let tier = 0; tier <= top; tier += 1) {
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
  const tiers = {};
  const unlocked = [];
  for (const id of SUBJECT_IDS) {
    const next = Math.max(current[id], unlockedTier(state?.items ?? {}, id));
    tiers[id] = next;
    if (next > current[id]) unlocked.push(id);
  }
  return { tiers, unlocked };
}
