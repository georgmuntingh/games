// What a drawing looks like, as a short list of numbers.
//
// The bitmap classifier is the main opinion; this is the second one. Its job is the small
// set of pairs a 28x28 picture genuinely struggles with — 1 against 7, 4 against 9, 3
// against 8, 6 against 0 against 9 — where the difference is not really in the pixels but
// in the structure: whether there is a crossbar, whether the top is closed, where the loop
// sits, how many times a line crosses the middle.
//
// The same vector is what the memory in memory.js stores. That is deliberate: the things
// that tell a 1 from a 7 are also the things that make one child's 7 theirs.
//
// Everything is normalised so that neither the size of the pad nor the size of the digit
// reaches the numbers.

import { bounds, resampleAll, totalLength } from './strokes.js';
import { SIZE } from './raster.js';

const GRID = 3;
const DIRECTIONS = 8;

export const FEATURE_NAMES = [
  'strokes', 'aspect', 'length',
  'startX', 'startY', 'endX', 'endY',
  ...Array.from({ length: DIRECTIONS }, (_, i) => `dir${i}`),
  ...Array.from({ length: GRID * GRID }, (_, i) => `cell${i}`),
  'crossTop', 'crossMiddle', 'crossBottom',
  'crossLeft', 'crossCentre', 'crossRight',
  'holes', 'holeHeight',
];

export const FEATURE_COUNT = FEATURE_NAMES.length;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** How many separate runs of ink a straight line across the image passes through. */
function crossings(image, size, along, at) {
  let count = 0;
  let inside = false;
  for (let i = 0; i < size; i += 1) {
    const v = along === 'row' ? image[at * size + i] : image[i * size + at];
    const ink = v > 0.35;
    if (ink && !inside) count += 1;
    inside = ink;
  }
  return count;
}

/**
 * Enclosed background: the holes in a 0, an 8's two, the bowl of a 6. Found by flooding the
 * background inward from the edges — whatever the flood cannot reach is enclosed.
 * Returns how many holes there are and how high up the image they sit, which is most of
 * what separates a 6 from a 9.
 */
export function holesOf(image, size = SIZE) {
  const open = new Uint8Array(size * size);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const at = y * size + x;
    if (open[at] || image[at] > 0.35) return;
    open[at] = 1;
    stack.push(at);
  };
  for (let i = 0; i < size; i += 1) {
    push(i, 0);
    push(i, size - 1);
    push(0, i);
    push(size - 1, i);
  }
  while (stack.length) {
    const at = stack.pop();
    const x = at % size;
    const y = (at / size) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Label what is left: background pixels the flood never reached.
  const seen = new Uint8Array(size * size);
  let count = 0;
  let weighted = 0;
  let area = 0;
  for (let start = 0; start < open.length; start += 1) {
    if (open[start] || seen[start] || image[start] > 0.35) continue;
    let size_ = 0;
    let sumY = 0;
    const queue = [start];
    seen[start] = 1;
    while (queue.length) {
      const at = queue.pop();
      size_ += 1;
      sumY += (at / size) | 0;
      const x = at % size;
      const y = (at / size) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
        const n = ny * size + nx;
        if (seen[n] || open[n] || image[n] > 0.35) continue;
        seen[n] = 1;
        queue.push(n);
      }
    }
    // Two or three stray pixels between strokes are not a hole anybody drew.
    if (size_ >= 4) {
      count += 1;
      weighted += sumY;
      area += size_;
    }
  }
  return { count, height: area > 0 ? weighted / area / (size - 1) : 0 };
}

/**
 * The feature vector. `strokes` carries what only the pen knows — how many separate marks,
 * where the hand started and stopped, which way it moved — and `image` carries the shape
 * those marks left behind.
 */
export function featuresOf(strokes, image, size = SIZE) {
  const out = new Float32Array(FEATURE_COUNT);
  if (!strokes?.length) return out;

  const paths = resampleAll(strokes, 48);
  const box = bounds(paths);
  const span = Math.max(box.width, box.height) || 1;
  const first = paths[0] ?? [];
  const last = paths[paths.length - 1] ?? [];
  const unit = (p) => ({
    x: clamp01((p.x - box.minX) / (box.width || span)),
    y: clamp01((p.y - box.minY) / (box.height || span)),
  });

  let at = 0;
  out[at++] = clamp01((paths.length - 1) / 3); // one stroke is 0, four or more is 1
  out[at++] = clamp01(box.width / span);
  out[at++] = clamp01(totalLength(paths) / (span * 4));

  const start = first.length ? unit(first[0]) : { x: 0, y: 0 };
  const end = last.length ? unit(last[last.length - 1]) : { x: 0, y: 0 };
  out[at++] = start.x;
  out[at++] = start.y;
  out[at++] = end.x;
  out[at++] = end.y;

  // Which way the pen travelled, weighted by how far it went that way.
  const dirs = new Float32Array(DIRECTIONS);
  let travelled = 0;
  for (const stroke of paths) {
    for (let i = 1; i < stroke.length; i += 1) {
      const dx = stroke[i].x - stroke[i - 1].x;
      const dy = stroke[i].y - stroke[i - 1].y;
      const len = Math.hypot(dx, dy);
      if (len === 0) continue;
      const angle = Math.atan2(dy, dx) + Math.PI;
      dirs[Math.min(DIRECTIONS - 1, Math.floor((angle / (2 * Math.PI)) * DIRECTIONS))] += len;
      travelled += len;
    }
  }
  for (let i = 0; i < DIRECTIONS; i += 1) out[at++] = travelled > 0 ? dirs[i] / travelled : 0;

  // Where the ink sits, coarsely. A 7 is top-heavy; a 6 is not.
  const cells = new Float32Array(GRID * GRID);
  let total = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const v = image[y * size + x];
      if (v <= 0) continue;
      const cy = Math.min(GRID - 1, Math.floor((y / size) * GRID));
      const cx = Math.min(GRID - 1, Math.floor((x / size) * GRID));
      cells[cy * GRID + cx] += v;
      total += v;
    }
  }
  for (let i = 0; i < cells.length; i += 1) out[at++] = total > 0 ? cells[i] / total : 0;

  const quarter = Math.round(size * 0.25);
  const half = Math.round(size * 0.5);
  const threeQuarter = Math.round(size * 0.75);
  for (const row of [quarter, half, threeQuarter]) {
    out[at++] = clamp01(crossings(image, size, 'row', row) / 3);
  }
  for (const col of [quarter, half, threeQuarter]) {
    out[at++] = clamp01(crossings(image, size, 'col', col) / 3);
  }

  const holes = holesOf(image, size);
  out[at++] = clamp01(holes.count / 2);
  out[at++] = holes.height;
  return out;
}
