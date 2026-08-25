// Turning strokes into the 28x28 the model expects.
//
// This is the file that decides whether any of this works. The well-documented way to fail
// at reading handwritten digits is to train on MNIST and then feed the model something
// preprocessed differently — the model is fine, the picture is wrong, and the accuracy you
// measured has nothing to do with the accuracy you get. So two rules:
//
//   1. We never rasterise the *visible* ink. A twelve-pixel finger stroke on a three-hundred
//      pixel pad becomes a blob at 28x28. We draw the captured polyline again at a fixed
//      normalised width, so how thick the child's finger is, how big their screen is and how
//      dense its pixels are all stop mattering.
//
//   2. We never use <canvas>. Its anti-aliasing differs between Skia, WebKit and Gecko, so
//      the same strokes would rasterise differently per browser — a silent, per-device
//      accuracy drop that would be miserable to track down. The renderer below is about
//      sixty lines, is identical everywhere, and can be tested.
//
// The pipeline is MNIST's own construction, followed exactly: scale the longest side to 20
// pixels preserving aspect, then place it in the 28x28 field by *centre of mass* rather
// than by bounding box.

import { bounds } from './strokes.js';

export const SIZE = 28;
export const BOX = 20; // MNIST fits its digits in 20x20 inside the 28x28 field
// Tuned to sit inside MNIST's own stroke weight at this scale. It is a constant on purpose:
// the whole point is that the child's stroke thickness does not reach the model.
export const STROKE = 2.2;

/** Distance from a point to a segment — round caps and joins fall out of this for free. */
function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Draw the strokes into `image` at the given placement. Coverage is taken as the largest
 * any segment contributes rather than the sum, so a stroke crossing itself does not come
 * out darker than the rest of the digit.
 */
function draw(image, strokes, size, scale, offsetX, offsetY, halfWidth) {
  const reach = halfWidth + 1;
  for (const stroke of strokes) {
    const count = Math.max(stroke.length - 1, 0) || 1;
    for (let i = 0; i < count; i += 1) {
      const p = stroke[i];
      const q = stroke[i + 1] ?? p; // a lone point draws a disc, which is what a dot is
      const ax = p.x * scale + offsetX;
      const ay = p.y * scale + offsetY;
      const bx = q.x * scale + offsetX;
      const by = q.y * scale + offsetY;

      const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - reach));
      const x1 = Math.min(size - 1, Math.ceil(Math.max(ax, bx) + reach));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by) - reach));
      const y1 = Math.min(size - 1, Math.ceil(Math.max(ay, by) + reach));

      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
          const d = segmentDistance(x, y, ax, ay, bx, by);
          let v = halfWidth + 0.5 - d;
          if (v <= 0) continue;
          if (v > 1) v = 1;
          const at = y * size + x;
          if (v > image[at]) image[at] = v;
        }
      }
    }
  }
}

/** Where the ink balances. Returns null for a blank image. */
export function centreOfMass(image, size = SIZE) {
  let total = 0;
  let sx = 0;
  let sy = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const v = image[y * size + x];
      if (v > 0) {
        total += v;
        sx += v * x;
        sy += v * y;
      }
    }
  }
  return total > 0 ? { x: sx / total, y: sy / total, mass: total } : null;
}

/**
 * Strokes in, 28x28 in. Values run 0..1 with the ink light on a dark field, exactly as
 * MNIST stores them.
 *
 * Rendered twice on purpose. The first pass only exists to find the centre of mass; the
 * second draws the digit where MNIST would have put it. Re-drawing at a fractional offset
 * is exact, where shifting the pixels of the first pass would blur them.
 */
export function rasterize(strokes, { size = SIZE, box = BOX, width = STROKE } = {}) {
  const image = new Float32Array(size * size);
  if (!strokes?.length) return image;

  const area = bounds(strokes);
  const span = Math.max(area.width, area.height);
  // The box is the size of the *ink*, and round caps put half a stroke width past each end,
  // so the path itself has to be drawn that much smaller. Without this every digit comes out
  // a stroke wider than MNIST's, which is the sort of quiet mismatch that costs a few points
  // of accuracy and looks like nothing at all in the code.
  const scale = span > 0 ? Math.max(box - width, 1) / span : 1;
  const halfWidth = width / 2;
  const centre = (size - 1) / 2;

  // Start from the bounding box centred, then walk the centre of mass onto the middle.
  //
  // Walked rather than computed in one step, because rasterising is not linear in the
  // offset: moving the digit changes which pixels catch which fraction of a stroke, so the
  // centre of mass does not move by quite the amount it was pushed. Two or three passes
  // settle it to well under a hundredth of a pixel, and each one costs almost nothing.
  let offsetX = centre - (area.minX + area.width / 2) * scale;
  let offsetY = centre - (area.minY + area.height / 2) * scale;

  for (let pass = 0; pass < 4; pass += 1) {
    image.fill(0);
    draw(image, strokes, size, scale, offsetX, offsetY, halfWidth);
    const com = centreOfMass(image, size);
    if (!com) return image;
    const dx = centre - com.x;
    const dy = centre - com.y;
    if (Math.abs(dx) < 1e-3 && Math.abs(dy) < 1e-3) break;
    offsetX += dx;
    offsetY += dy;
  }
  return image;
}

/** A 28x28 as text. For tests and for the accuracy page, where a picture beats a number. */
export function toAscii(image, size = SIZE, ramp = ' .:-=+*#%@') {
  const rows = [];
  for (let y = 0; y < size; y += 1) {
    let row = '';
    for (let x = 0; x < size; x += 1) {
      const v = Math.max(0, Math.min(1, image[y * size + x]));
      row += ramp[Math.min(ramp.length - 1, Math.round(v * (ramp.length - 1)))];
    }
    rows.push(row);
  }
  return rows.join('\n');
}
