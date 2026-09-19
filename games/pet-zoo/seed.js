// Turning a save into numbers, deterministically.
//
// Two small things that several subjects need and that must never disagree: a hash from a
// key string to a 32-bit seed, and a generator from that seed to a stream of numbers. Both
// used to live inside the maths subject — the hash private to `subjects/math/index.js`, the
// generator exported from `subjects/math/skills.js` and imported nowhere — and the clock now
// needs them too, to draw the wrong answers it offers beside a right one.
//
// They live here rather than there because a clock that imported the maths deck to borrow a
// hash would be a dependency nobody could explain. Pure, like everything beside it.

/**
 * FNV-1a over a key string. Small, fast, and — what actually matters — *stable*: the same
 * key gives the same number on every device and every build, so a question drawn from a seed
 * survives a reload, a reinstall and a phone swap.
 */
export function hashSeed(key) {
  let h = 2166136261 >>> 0;
  const text = String(key);
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * mulberry32 — small, fast, and good enough for picking two-digit numbers and shuffling four
 * clock faces. What matters is that it is reproducible from a seed, not that it is strong.
 */
export function rngFrom(seed) {
  let t = (Number(seed) >>> 0) || 1;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
