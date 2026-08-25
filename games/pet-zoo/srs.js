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

import { tierOfMinute } from './curriculum.js';
import {
  ALL_TIERS_MAX,
  DEFAULT_SUBJECT,
  SUBJECTS,
  refreshTiers,
  tiersOf,
  unseenItems,
} from './subjects/index.js';

export const LEARNING_STEPS = [1, 3, 8]; // in questions answered, not minutes
export const RELEARN_DELAY = 2; // a missed time returns as the question after next
export const GRADUATION_STREAK = 3; // three in a row re-graduates a pet that lapsed
export const MAX_LEARNING = 7; // never juggle more than a handful at once

// Hatching is deliberately slower than graduating. A pet arriving on the third answer arrives
// before the child has had time to want it, so the first hatch costs one extra answer — and the
// wait is spent watching the shell break rather than staring at a smooth egg. Re-learning a time
// that lapsed still costs GRADUATION_STREAK: the extra answer buys anticipation, not punishment.
export const HATCH_STREAK = 4;
export const CRACK_STAGES = 2; // crack levels visible before the shell finally goes

/**
 * The crack level a streak has earned, 0..CRACK_STAGES. The first answer leaves the shell smooth
 * — a crack has to mean something — and the last crack lands on the answer before hatching.
 */
export const crackFor = (streak) => Math.min(Math.max(streak - 1, 0), CRACK_STAGES);

// Forms. A pet's shape is earned by feeding it successfully over the long haul, so a form
// is the visible proof that a time is genuinely known — the reward the SRS's long tail has
// never had. Against the real interval ladder these land at roughly hatching day, day 4
// and day 32.
export const FORM_THRESHOLDS = [1, 3, 5]; // feeds needed to reach forms 1, 2, 3
export const FORM_COUNT = FORM_THRESHOLDS.length;

/** 0 for an egg, otherwise 1..FORM_COUNT. Monotonic in feeds, which never decreases. */
export function formFor(feeds) {
  let form = 0;
  for (let i = 0; i < FORM_THRESHOLDS.length; i += 1) {
    if (feeds >= FORM_THRESHOLDS[i]) form = i + 1;
  }
  return form;
}

export const EASE_START = 2.5;
export const EASE_MIN = 1.3;
export const EASE_MAX = 2.8;
export const EASE_LAPSE_PENALTY = 0.2;
export const MAX_INTERVAL_DAYS = 60;
export const DAY_MS = 86400000;

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

export function createItem({
  subject = DEFAULT_SUBJECT,
  tier,
  species,
  reviewClock = 0,
  // Whatever identifies the item within its subject — {h, m} for a time, {a, b} for a sum.
  // Spread onto the record rather than nested, so `item.h` still reads the way every call
  // site and every saved zoo already expects.
  id: _ignoredId,
  ...payload
}) {
  return {
    subject,
    ...payload,
    // A subject supplies its own tier; the fallback is for saves and tests written when the
    // clock was the only thing this game taught.
    tier: tier ?? tierOfMinute(payload.m) ?? 0,
    species,
    name: null,
    phase: 'learning',
    step: 0,
    dueStep: reviewClock + 1,
    ease: EASE_START,
    intervalDays: 0,
    dueAt: 0,
    reps: 0,
    // `reps` is reset by a lapse; `feeds` never is. A pet's form is derived from feeds so
    // that "a form once earned is kept" is structural rather than something every future
    // change to the scheduler has to remember not to break.
    feeds: 0,
    lapses: 0,
    correctStreak: 0,
    // The high-water mark of `crackFor(correctStreak)`, never lowered: a wrong answer restarts the
    // run to hatching but must not un-break a shell the child has already watched break.
    cracks: 0,
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
export function qualityOf({ correct, ms = 0, reversals = 0, pace = 1 }) {
  if (!correct) return 0;
  const slow = Math.max(1, pace);
  if (ms > 20000 * slow || reversals >= 2) return 3;
  if (ms > 8000 * slow || reversals >= 1) return 4;
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
export function review(item, { correct, ms = 0, reversals = 0, pace = 1, reviewClock, now }) {
  const quality = qualityOf({ correct, ms, reversals, pace });
  const next = { ...item, seen: item.seen + 1, lastMs: ms };
  const events = {
    quality,
    graduated: false,
    hatched: false,
    lapsed: false,
    evolved: 0,
    cracked: 0,
  };

  if (correct) {
    next.correctStreak = item.correctStreak + 1;
    if (item.hatchedAt === null) {
      const cracks = Math.max(item.cracks ?? 0, crackFor(next.correctStreak));
      if (cracks > (item.cracks ?? 0)) events.cracked = cracks;
      next.cracks = cracks;
    }
    if (item.phase === 'learning') {
      // Only the first hatch costs the extra answer; a lapsed pet re-graduates at the usual bar.
      const needed = item.hatchedAt === null ? HATCH_STREAK : GRADUATION_STREAK;
      if (next.correctStreak >= needed) {
        next.phase = 'graduated';
        next.reps = 1;
        next.feeds = item.feeds + 1;
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
      next.feeds = item.feeds + 1;
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
  // Hatching is its own event, so it does not also count as an evolution.
  const wasForm = formFor(item.feeds);
  const nowForm = formFor(next.feeds);
  if (wasForm >= 1 && nowForm > wasForm) events.evolved = nowForm;

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
 * Within one priority band, prefer the subject the child was *not* just asked about. Bands
 * only ever contain items that are already due, so this cannot postpone anything that is
 * owed — it just stops a session turning into ten clock faces in a row once a second subject
 * exists. With one subject registered it is inert.
 */
const alternating = (lastSubject) => {
  const same = ([, item]) => ((item.subject ?? DEFAULT_SUBJECT) === lastSubject ? 1 : 0);
  return (urgency) => (a, b) => same(a) - same(b) || urgency(a[1]) - urgency(b[1]);
};

/**
 * Choose the next item to ask about, across every subject at once. First match wins:
 *   1. a learning item that is due — longest overdue first
 *   2. a hungry pet — longest hungry first
 *   3. brand-new material, but only while fewer than MAX_LEARNING are in flight
 *   4. the pet closest to hungry, so a session never runs dry
 * The item just answered is never returned twice in a row unless it is the only one there is.
 */
export function nextItem(state, { now, exclude = null, lastSubject = null } = {}) {
  const step = state.reviewClock + 1;
  const tiers = tiersOf(state);
  const entries = Object.entries(state.items).filter(([id]) => id !== exclude);
  const order = alternating(lastSubject);

  const dueLearning = entries
    .filter(([, item]) => isLearning(item) && item.dueStep !== null && item.dueStep <= step)
    .sort(order((item) => item.dueStep));
  if (dueLearning.length) return dueLearning[0][0];

  const hungry = entries
    .filter(([, item]) => isHungry(item, now))
    .sort(order((item) => item.dueAt));
  if (hungry.length) return hungry[0][0];

  if (learningCount(state.items) < MAX_LEARNING) {
    const fresh = unseenItems(state.items, tiers)[0];
    if (fresh) return fresh.id;
  }

  const graduated = entries
    .filter(([, item]) => item.phase === 'graduated')
    .sort(order((item) => item.dueAt));
  if (graduated.length) return graduated[0][0];

  const anyLearning = entries.filter(([, item]) => isLearning(item)).sort(order((item) => item.seen));
  if (anyLearning.length) return anyLearning[0][0];

  // Everything is excluded or nothing exists: fall back to the excluded item, then to the
  // very first thing any subject teaches.
  if (exclude && state.items[exclude]) return exclude;
  return (
    unseenItems(state.items, ALL_TIERS_MAX)[0]?.id ?? SUBJECTS[DEFAULT_SUBJECT].ALL_ITEMS[0].id
  );
}

export { refreshTiers };

/**
 * The single-subject view of `refreshTiers`, kept because the shop's unlocks and the
 * grown-ups panel's tier list are both about the clock specifically.
 */
export function refreshTier(state, subject = DEFAULT_SUBJECT) {
  const { tiers } = refreshTiers(state);
  const before = tiersOf(state)[subject] ?? 0;
  const tier = tiers[subject] ?? 0;
  return { tier, unlocked: tier > before };
}
