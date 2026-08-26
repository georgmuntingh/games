// Stroke maths: what a child's finger leaves behind, tidied into something comparable.
//
// A stroke is an array of {x, y} in whatever coordinates the pad happens to use; a drawing
// is an array of strokes. Nothing here knows about pixels, canvases or pointers — the pad
// collects the points, this decides what shape they are.
//
// The one job that matters is resampling. Two children writing the same 7 at different
// speeds, on a 60Hz phone and a 120Hz tablet, produce wildly different numbers of points
// for the same line. Every measurement downstream — how long the stroke is, which way it
// turns, where it starts — is only comparable once the points are evenly spaced.

/** Distance between two points. */
export const dist = (p, q) => Math.hypot(q.x - p.x, q.y - p.y);

/** How far the pen travelled along one stroke. */
export function pathLength(stroke) {
  let total = 0;
  for (let i = 1; i < stroke.length; i += 1) total += dist(stroke[i - 1], stroke[i]);
  return total;
}

export const totalLength = (strokes) => strokes.reduce((sum, s) => sum + pathLength(s), 0);

/** The box the whole drawing sits in. Empty input gives a zero-sized box at the origin. */
export function bounds(strokes) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of strokes) {
    for (const p of stroke) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Drop points that land on top of the one before — a finger held still is not a line. */
export function dedupe(stroke, epsilon = 0.01) {
  const out = [];
  for (const p of stroke) {
    if (!out.length || dist(out[out.length - 1], p) > epsilon) out.push({ x: p.x, y: p.y });
  }
  return out;
}

/**
 * Evenly spaced points along a stroke, `spacing` apart. A stroke too short to hold two
 * points comes back as its own single point, so a deliberate dot survives as a dot rather
 * than disappearing.
 */
export function resample(stroke, spacing) {
  const points = dedupe(stroke);
  if (points.length < 2) return points;
  const out = [points[0]];
  let carried = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    let segment = dist(a, b);
    if (segment === 0) continue;
    let offset = spacing - carried;
    while (offset <= segment) {
      const ratio = offset / segment;
      out.push({ x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio });
      offset += spacing;
    }
    carried = segment - (offset - spacing);
  }
  const last = points[points.length - 1];
  if (dist(out[out.length - 1], last) > spacing * 0.5) out.push({ x: last.x, y: last.y });
  return out;
}

/**
 * The whole drawing resampled at a spacing set by its own size, so the point count depends
 * on the shape drawn and not on the device that captured it.
 */
export function resampleAll(strokes, steps = 64) {
  const span = Math.max(bounds(strokes).width, bounds(strokes).height);
  const spacing = Math.max(span / steps, 1e-4);
  return strokes.map((stroke) => resample(stroke, spacing)).filter((stroke) => stroke.length > 0);
}

/**
 * Whether there is enough here to be a digit at all. A stray tap or a speck of a stroke is
 * refused rather than guessed at: "I did not catch that" is a far better answer for a child
 * than a confident 1.
 */
export function hasInk(strokes, minSpan = 0.06, reference = 1) {
  if (!strokes?.length) return false;
  const box = bounds(strokes);
  const span = Math.max(box.width, box.height);
  return span >= minSpan * reference && totalLength(strokes) > 0;
}
