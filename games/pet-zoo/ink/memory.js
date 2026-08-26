// What this child's digits look like.
//
// The classifier is an average of ten thousand adults writing on paper. A six-year-old
// writing with a finger on glass is not that average, and the ways they differ are
// consistent — their 4 is always open, their 1 always has a foot. So every time the child
// says "no, that was a seven", the pair (what it looked like, what it was) is kept, and
// the nearest of those memories get a vote on the next reading.
//
// This is the largest real-world accuracy lever available and it costs the child nothing:
// there is no calibration screen and nothing to set up. It simply gets better.
//
// Pure. The list lives in the save, and store.js sanitises it on the way in like everything
// else — a hand-edited or corrupted memory must never be able to throw.

import { FEATURE_COUNT } from './features.js';

// Enough to cover the ways one child writes ten digits, small enough to keep the save
// tidy and to stay honest when their handwriting changes over a school year: the oldest
// memories fall off the end.
export const CAPACITY = 48;

// How many neighbours vote. Small, because with a handful of examples per digit a larger
// k would just reach for the wrong ones.
export const NEIGHBOURS = 5;

// The memory is only allowed a real say once it has actually seen a few corrections;
// below this it contributes proportionally less.
export const TRUSTED_AT = 8;

const round = (v) => Math.round(v * 1000) / 1000;

/** One remembered correction, ready to be stored. */
export const entryOf = (features, digit) => ({
  f: Array.from(features, round),
  d: digit,
});

/**
 * Add a correction, newest last, oldest dropped. A digit the child has already corrected
 * many times does not crowd out the others: at most a third of the memory is one digit.
 */
export function remember(memory, features, digit) {
  const list = sanitize(memory);
  const cap = Math.ceil(CAPACITY / 3);
  const sameDigit = list.filter((e) => e.d === digit);
  const trimmed =
    sameDigit.length >= cap
      ? list.filter((e) => e !== sameDigit[0])
      : list;
  return [...trimmed, entryOf(features, digit)].slice(-CAPACITY);
}

/** Whatever is safe to keep from a stored or imported memory. */
export function sanitize(memory) {
  if (!Array.isArray(memory)) return [];
  return memory
    .filter(
      (entry) =>
        entry &&
        Number.isInteger(entry.d) &&
        entry.d >= 0 &&
        entry.d <= 9 &&
        Array.isArray(entry.f) &&
        entry.f.length === FEATURE_COUNT &&
        entry.f.every((v) => Number.isFinite(v))
    )
    .slice(-CAPACITY);
}

const distance2 = (a, b) => {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return sum;
};

/**
 * What the remembered corrections think this drawing is: a distribution over the ten
 * digits, plus how much weight it has earned. `strength` is what keeps a memory of three
 * examples from overruling the classifier — it grows with how much has been seen and
 * with how close the nearest example actually is.
 */
export function recall(memory, features, neighbours = NEIGHBOURS) {
  const list = sanitize(memory);
  const votes = new Float32Array(10);
  if (!list.length) return { votes, strength: 0, nearest: Infinity };

  const scored = list
    .map((entry) => ({ d: entry.d, dist2: distance2(entry.f, features) }))
    .sort((a, b) => a.dist2 - b.dist2)
    .slice(0, neighbours);

  let total = 0;
  for (const { d, dist2 } of scored) {
    const weight = 1 / (dist2 + 0.02);
    votes[d] += weight;
    total += weight;
  }
  if (total > 0) for (let i = 0; i < votes.length; i += 1) votes[i] /= total;

  const nearest = Math.sqrt(scored[0].dist2);
  const seen = Math.min(1, list.length / TRUSTED_AT);
  // A neighbour half a feature-space away is not really a neighbour.
  const close = Math.max(0, 1 - nearest / 0.6);
  return { votes, strength: seen * close, nearest };
}
