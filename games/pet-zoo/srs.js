// The spaced-repetition scheduler. Pure: state in, new state out, `now` injected.
//
// An "item" is a time, not a card — "4:15" — and every item is bound to a pet, so the
// schedule never surfaces as a due date. The child sees a hungry creature.
//
// Two phases, because plain SM-2 is wrong for a three-minute session: a time the child
// has just got wrong would not come back for a whole day.
//
//   Phase 1, learning — Leitner steps counted in *questions*, so a shaky time reappears
//   inside the same sitting.
//   Phase 2, graduated — SM-2 with day intervals, for the long-term retention that
//   actually makes the skill stick.

import { timeId } from './clock.js';
import { LAST_TIER, tierOfMinute, unlockedTier, unseenItems } from './curriculum.js';

export const LEARNING_STEPS = [1, 3, 8]; // in questions answered, not minutes
export const RELEARN_DELAY = 2; // a missed time returns as the question after next
export const GRADUATION_STREAK = 3; // three in a row hatches the egg
export const MAX_LEARNING = 7; // never juggle more than a handful at once

export const EASE_START = 2.5;
export const EASE_MIN = 1.3;
export const EASE_MAX = 2.8;
export const EASE_LAPSE_PENALTY = 0.2;
export const MAX_INTERVAL_DAYS = 60;
export const DAY_MS = 86400000;

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

export function createItem({ h, m, species, reviewClock = 0 }) {
  return {
    h,
    m,
    tier: tierOfMinute(m) ?? 0,
    species,
    name: null,
    phase: 'learning',
    step: 0,
    dueStep: reviewClock + 1,
    ease: EASE_START,
    intervalDays: 0,
    dueAt: 0,
    reps: 0,
    lapses: 0,
    correctStreak: 0,
    hatchedAt: null,
    seen: 0,
    lastMs: 0,
  };
}

/**
 * SM-2 answer quality, derived rather than asked — a 10-year-old should never be made to
 * self-grade. Speed and hand-waggling (direction reversals during the drag) stand in for
 * confidence: a confident answer goes straight to the right spot and stops.
 */
export function qualityOf({ correct, ms = 0, reversals = 0 }) {
  if (!correct) return 0;
  if (ms > 20000 || reversals >= 2) return 3;
  if (ms > 8000 || reversals >= 1) return 4;
  return 5;
}

export const applyEase = (ease, q) =>
  clamp(ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), EASE_MIN, EASE_MAX);

export const nextInterval = (reps, intervalDays, ease) => {
  if (reps <= 1) return 1;
  if (reps === 2) return 3;
  return Math.min(Math.round(intervalDays * ease), MAX_INTERVAL_DAYS);
};

/**
 * Record one answer. Returns the replacement item plus the events the UI should
 * celebrate — hatching in particular is just graduation wearing a costume.
 */
export function review(item, { correct, ms = 0, reversals = 0, reviewClock, now }) {
  const quality = qualityOf({ correct, ms, reversals });
  const next = { ...item, seen: item.seen + 1, lastMs: ms };
  const events = { quality, graduated: false, hatched: false, lapsed: false };

  if (correct) {
    next.correctStreak = item.correctStreak + 1;
    if (item.phase === 'learning') {
      if (next.correctStreak >= GRADUATION_STREAK) {
        next.phase = 'graduated';
        next.reps = 1;
        next.intervalDays = 1;
        next.dueAt = now + DAY_MS;
        next.dueStep = null;
        events.graduated = true;
        if (next.hatchedAt === null) {
          next.hatchedAt = now;
          events.hatched = true;
        }
      } else {
        next.step = Math.min(item.step + 1, LEARNING_STEPS.length - 1);
        next.dueStep = reviewClock + LEARNING_STEPS[next.step];
      }
    } else {
      next.ease = applyEase(item.ease, quality);
      next.reps = item.reps + 1;
      next.intervalDays = nextInterval(next.reps, item.intervalDays, next.ease);
      next.dueAt = now + next.intervalDays * DAY_MS;
    }
  } else {
    next.correctStreak = 0;
    next.step = 0;
    next.dueStep = reviewClock + RELEARN_DELAY;
    if (item.phase === 'graduated') {
      next.phase = 'learning';
      next.ease = clamp(item.ease - EASE_LAPSE_PENALTY, EASE_MIN, EASE_MAX);
      next.lapses = item.lapses + 1;
      next.dueAt = 0;
      next.intervalDays = 0;
      next.reps = 0;
      events.lapsed = true;
    }
  }
  return { item: next, events };
}

export const isLearning = (item) => item.phase === 'learning';
export const isHungry = (item, now) => item.phase === 'graduated' && item.dueAt <= now;

export const learningCount = (items) => Object.values(items).filter(isLearning).length;

/** Pets asking to be fed right now — the zoo badge and the "anything to do?" check. */
export const hungryCount = (items, now) =>
  Object.values(items).filter((item) => isHungry(item, now)).length;

const byKey = (fn) => (a, b) => fn(a[1]) - fn(b[1]);

/**
 * Choose the next time to ask about. First match wins:
 *   1. a learning time that is due — longest overdue first
 *   2. a hungry pet — longest hungry first
 *   3. a brand-new time, but only while fewer than MAX_LEARNING are in flight
 *   4. the pet closest to hungry, so a session never runs dry
 * The time just answered is never returned twice in a row unless it is the only one
 * there is.
 */
export function nextItem(state, { now, exclude = null } = {}) {
  const step = state.reviewClock + 1;
  const entries = Object.entries(state.items).filter(([id]) => id !== exclude);

  const dueLearning = entries
    .filter(([, item]) => isLearning(item) && item.dueStep !== null && item.dueStep <= step)
    .sort(byKey((item) => item.dueStep));
  if (dueLearning.length) return dueLearning[0][0];

  const hungry = entries
    .filter(([, item]) => isHungry(item, now))
    .sort(byKey((item) => item.dueAt));
  if (hungry.length) return hungry[0][0];

  if (learningCount(state.items) < MAX_LEARNING) {
    const fresh = unseenItems(state.items, state.tier)[0];
    if (fresh) return fresh.id;
  }

  const graduated = entries
    .filter(([, item]) => item.phase === 'graduated')
    .sort(byKey((item) => item.dueAt));
  if (graduated.length) return graduated[0][0];

  const anyLearning = entries.filter(([, item]) => isLearning(item)).sort(byKey((item) => item.seen));
  if (anyLearning.length) return anyLearning[0][0];

  // Everything is excluded or nothing exists: fall back to the excluded item, then to
  // the very first unseen time in the curriculum.
  if (exclude && state.items[exclude]) return exclude;
  return unseenItems(state.items, LAST_TIER)[0]?.id ?? timeId(1, 0);
}

/** Recompute the unlocked tier after an answer; returns the new tier and whether it moved. */
export function refreshTier(state) {
  const tier = Math.max(state.tier, unlockedTier(state.items));
  return { tier, unlocked: tier > state.tier };
}
