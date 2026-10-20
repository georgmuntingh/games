// Deterministic, ±1px-tolerant tile classifier for eggerland2-map.png.
// Terrain is read from an INSET ring (2-3 px in from the edge, avoiding the
// drift-prone outer column/row); entities are read from color composition of
// the whole tile + its centre. No manual per-tile labels — robust to the
// sub-pixel grid drift in the source image.
import { px, colorCat } from './classify-core.mjs';

// Split green by brightness: bright green = emerald/snakey sprite,
// dark green = tree/hedge terrain.
function cat2(r, g, b) {
  const c = colorCat(r, g, b);
  if (c === 'green') return g > 150 ? 'greenB' : 'greenD';
  return c;
}

function counts(img, x0, y0, x1, y1) {
  const t = {};
  let n = 0;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      t[cat2(...px(img, x, y))] = (t[cat2(...px(img, x, y))] || 0) + 1;
      n++;
    }
  const f = {};
  for (const k in t) f[k] = t[k] / n;
  return f;
}

export function terrainInset(img, x0, y0, ts) {
  // Frame at inset 2..3 on all four sides.
  const t = {};
  const add = (x, y) => { const c = cat2(...px(img, x, y)); t[c] = (t[c] || 0) + 1; };
  for (let d = 2; d < ts - 2; d++) {
    add(x0 + d, y0 + 2); add(x0 + d, y0 + ts - 3);
    add(x0 + 2, y0 + d); add(x0 + ts - 3, y0 + d);
  }
  const n = Object.values(t).reduce((a, b) => a + b, 0);
  const f = (c) => (t[c] || 0) / n;
  if (f('water') > 0.33) return 'water';
  if (f('gray') > 0.4) return 'wall';
  if (f('greenD') + f('greenB') > 0.5) return 'tree';
  if (f('red') > 0.5) return 'tree';
  return 'floor';
}

// Returns an entity label or null. Called only on floor/water tiles.
export function overlayOf(img, x0, y0, ts) {
  const all = counts(img, x0, y0, x0 + ts, y0 + ts);
  const c = counts(img, x0 + 5, y0 + 5, x0 + ts - 4, y0 + ts - 4); // centre
  const f = (o, k) => o[k] || 0;
  const green = f(all, 'greenB') + f(all, 'greenD');
  const cGreen = f(c, 'greenB') + f(c, 'greenD');

  // Chest: dense pale-yellow bars, little else.
  if (f(all, 'cream') > 0.3 && f(all, 'red') < 0.12 && green < 0.12) return 'chest';
  // Heart: pale box frame with a red heart in the centre.
  if (f(all, 'cream') > 0.14 && f(c, 'red') > 0.18) return 'heart';
  // Magic arrow: white glyph in a box, no green/red mass.
  if (f(all, 'white') > 0.09 && green < 0.18 && f(all, 'red') < 0.2 && f(all, 'magenta') < 0.05)
    return arrowDir(img, x0, y0, ts);
  // Emerald block: bright-green square filling the tile.
  if (f(all, 'greenB') > 0.22 && f(all, 'cream') < 0.12 && green > 0.4) return 'emerald';
  // Magenta creature (Leeper family).
  if (f(all, 'magenta') > 0.08) return 'leeper';
  // Red + white face = Medusa.
  if (f(c, 'red') > 0.12 && f(c, 'white') > 0.06) return 'medusa';
  // Bright-green centred coil on floor = Snakey.
  if (cGreen > 0.16 && green < 0.5) return 'snakey';
  // Compact red blob on floor = Rocky.
  if (f(c, 'red') > 0.14 && f(all, 'red') < 0.5) return 'rocky';
  return null;
}

// Arrow direction from where the white pixels bunch relative to centre.
function arrowDir(img, x0, y0, ts) {
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < ts; y++)
    for (let x = 0; x < ts; x++)
      if (colorCat(...px(img, x0 + x, y0 + y)) === 'white') { sx += x; sy += y; n++; }
  if (!n) return 'arrow-up';
  sx /= n; sy /= n;
  const dx = sx - ts / 2, dy = sy - ts / 2;
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'arrow-left' : 'arrow-right';
  return dy < 0 ? 'arrow-up' : 'arrow-down';
}
