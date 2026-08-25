// Reading a handwritten digit: the three opinions, and what to do when they disagree.
//
//   the classifier  — a small CNN on the normalised bitmap. The main opinion, and usually
//                     the only one that matters.
//   the structure   — stroke features, consulted only when the classifier is genuinely
//                     torn between two digits it is known to confuse.
//   the memory      — what this child's corrections have taught us, weighted by how much
//                     of that there is.
//
// What comes back is never treated as the answer. The pad shows the reading back and the
// child confirms it, because a misread digit must never be able to arrive as "you got the
// sum wrong" — that is a sentence about arithmetic, and it would not be true.

import { featuresOf, FEATURE_NAMES } from './features.js';
import { logits, softmax } from './model.js';
import { recall } from './memory.js';
import { rasterize, SIZE } from './raster.js';
import { hasInk } from './strokes.js';

/** A mirror-written digit is an upright one seen backwards. */
export function mirror(image, size = SIZE) {
  const out = new Float32Array(image.length);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) out[y * size + x] = image[y * size + (size - 1 - x)];
  }
  return out;
}

const F = Object.fromEntries(FEATURE_NAMES.map((name, i) => [name, i]));

/**
 * The pairs a 28x28 picture genuinely struggles with, and the structural question that
 * separates each one. Consulted *only* when the classifier's top two are exactly this pair
 * and it is close to a coin flip between them — where it is already going to be wrong half
 * the time, so a second opinion can only help on average. Away from that regime the
 * classifier is left alone.
 */
const CONFUSIONS = [
  // A 7's bar means a vertical line down the middle meets ink twice; a 1's does not.
  { pair: [1, 7], prefers: (f) => (f[F.crossCentre] * 3 >= 1.5 || f[F.aspect] > 0.45 ? 7 : 1) },
  // A 9 closes its bowl; a 4's top stays open.
  { pair: [4, 9], prefers: (f) => (f[F.holes] > 0.25 ? 9 : 4) },
  // An 8 has two enclosed loops, a 3 has none.
  { pair: [3, 8], prefers: (f) => (f[F.holes] >= 0.75 ? 8 : 3) },
  // Both have one loop; a 6's sits low and a 9's sits high.
  { pair: [6, 9], prefers: (f) => (f[F.holeHeight] > 0.5 ? 6 : 9) },
  // A 0's loop fills the height; a 6 leaves a tail above its.
  { pair: [0, 6], prefers: (f) => (f[F.cell1] > 0.12 ? 0 : 6) },
  // A 5's bar sits along the top; a 3's ink is more evenly spread.
  { pair: [3, 5], prefers: (f) => (f[F.crossTop] * 3 >= 1.5 && f[F.cell1] > 0.14 ? 5 : 3) },
];

// Inside this ratio the classifier is not really choosing, it is guessing.
export const TORN = 1.6;
// How much better the mirrored reading has to look before we call a digit backwards. The
// two peaks come out one and a half to two times apart in practice, so this is generous.
export const MIRROR_MARGIN = 1.15;
// How hard a structural tiebreak pushes, and how hard a well-fed memory does.
export const STRUCTURE_WEIGHT = 0.5;
export const MEMORY_WEIGHT = 0.9;
// Below this the reading is offered with its runner-up alongside, so fixing a misread is
// one tap rather than a rewrite.
export const UNSURE_BELOW = 0.62;

const rank = (scores) =>
  Array.from(scores, (p, digit) => ({ digit, p })).sort((a, b) => b.p - a.p);

/**
 * Read a drawing.
 *
 * `pad` is the size of the surface it was drawn on, in the same units as the strokes, so
 * that "too small to be a digit" means the same thing on a phone and on a desktop.
 */
export function recognize(strokes, { memory = [], pad = 1 } = {}) {
  if (!hasInk(strokes, 0.06, pad)) {
    return { digit: null, confidence: 0, reason: 'blank', alternative: null, mirrored: false };
  }

  const image = rasterize(strokes);
  const uprightScores = logits(image);
  const flippedScores = logits(mirror(image));
  const peakUpright = Math.max(...uprightScores);
  const peakFlipped = Math.max(...flippedScores);

  // Backwards digits are ordinary at this age. Running the mirror through the same model
  // means one network tells us both which digit it is *and* that it was written the other
  // way round — which is what the optional "which way round" nudge needs to exist at all.
  //
  // Compared on the raw scores, deliberately, not on the probabilities. A network trained
  // only on upright digits is confidently wrong about a backwards one — it will call a
  // reversed 2 a 5 at ninety-nine percent — because softmax normalises away exactly the
  // magnitude that says "I have seen something like this before". The peak score does not:
  // a digit the right way round scores half again as high as the same digit reversed.
  const mirrored = peakFlipped > peakUpright * MIRROR_MARGIN;
  const upright = softmax(uprightScores);
  const scores = Float32Array.from(softmax(mirrored ? flippedScores : uprightScores));
  const bestUpright = rank(upright)[0];

  const features = featuresOf(strokes, image);
  const order = rank(scores);
  const [top, second] = order;

  // Structure, but only where the classifier is torn between a pair it is known to muddle.
  let structural = null;
  if (second && top.p < second.p * TORN) {
    const found = CONFUSIONS.find(
      ({ pair }) => pair.includes(top.digit) && pair.includes(second.digit)
    );
    if (found) {
      structural = found.prefers(features);
      scores[structural] += STRUCTURE_WEIGHT * top.p;
    }
  }

  // And whatever this child's own corrections have to say.
  const memoryVote = recall(memory, features);
  if (memoryVote.strength > 0) {
    for (let d = 0; d < scores.length; d += 1) {
      scores[d] += MEMORY_WEIGHT * memoryVote.strength * memoryVote.votes[d];
    }
  }

  const fused = rank(scores);
  const total = fused.reduce((sum, entry) => sum + entry.p, 0) || 1;
  const confidence = fused[0].p / total;

  return {
    digit: fused[0].digit,
    confidence,
    // Shown beside the reading when we are not sure, so a misread costs one tap.
    alternative: confidence < UNSURE_BELOW ? fused[1].digit : null,
    unsure: confidence < UNSURE_BELOW,
    mirrored,
    reason: 'read',
    features,
    image,
    // What each opinion said, for the accuracy page and for anyone debugging a bad reading.
    detail: {
      classifier: bestUpright.digit,
      classifierConfidence: bestUpright.p,
      structural,
      memoryStrength: memoryVote.strength,
    },
  };
}
