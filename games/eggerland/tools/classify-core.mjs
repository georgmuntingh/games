// Core color + terrain + sprite-signature logic for the Eggerland map
// classifier, shared by the analysis and emit steps.

export function px(img, x, y) {
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2]];
}

// --- Color category of a single pixel (fixed MSX palette) ---------------
export function colorCat(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx < 45) return 'black';
  if (r > 200 && g > 200 && b > 200) return 'white';
  if (b >= 130 && b >= r + 20 && b >= g + 10) return 'water'; // saturated blue
  if (r > 150 && b > 110 && g < r * 0.75 && b > g) return 'magenta';
  if (g > 90 && g >= r && g >= b && mx - mn > 40) return 'green';
  if (r > 110 && r > g * 1.5 && r > b * 1.5) return 'red';
  if (r > 175 && g > 160 && b < 200 && b < r) return 'cream'; // pale yellow
  if (mx > 140 && mx - mn < 45) return 'gray'; // wall
  if (r >= g && g >= b) return 'brown'; // floor
  return 'other';
}

// --- Terrain from the tile's border ring (sprites are inset) -------------
export function terrainOf(img, x0, y0, ts) {
  const counts = {};
  const add = (x, y) => {
    const c = colorCat(...px(img, x, y));
    counts[c] = (counts[c] || 0) + 1;
  };
  for (let d = 0; d < ts; d++) {
    add(x0 + d, y0);
    add(x0 + d, y0 + ts - 1);
    add(x0, y0 + d);
    add(x0 + ts - 1, y0 + d);
  }
  // Second ring inward, to be robust to a 1px sprite bleed.
  for (let d = 1; d < ts - 1; d++) {
    add(x0 + d, y0 + 1);
    add(x0 + d, y0 + ts - 2);
    add(x0 + 1, y0 + d);
    add(x0 + ts - 2, y0 + d);
  }
  const rank = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dom = rank[0]?.[0];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const frac = (c) => (counts[c] || 0) / total;
  // Water and gray walls read cleanly on the ring.
  if (frac('water') > 0.35) return 'water';
  if (frac('gray') > 0.4) return 'wall';
  if (frac('green') > 0.5) return 'tree'; // green hedge fills the tile
  if (frac('red') > 0.5) return 'bush'; // red bush fills the tile
  if (dom === 'brown' || dom === 'black') return 'floor';
  // Fallback: whatever dominates.
  return { water: 'water', gray: 'wall', green: 'tree', red: 'bush' }[dom] || 'floor';
}

// --- Sprite signature: terrain masked out, downsampled to 8x8 -----------
// Collapses water/floor dither (which read as terrain -> '.') so only the
// overlaid sprite shape remains, giving a small labelable vocabulary.
const SPRITE_CATS = { green: 'G', red: 'R', cream: 'C', magenta: 'M', white: 'W' };
export function signature(img, x0, y0, ts, terrain) {
  const n = 8, blk = ts / n;
  let sig = '';
  let nonEmpty = 0;
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const tally = {};
      for (let yy = 0; yy < blk; yy++)
        for (let xx = 0; xx < blk; xx++) {
          const c = colorCat(...px(img, x0 + bx * blk + xx, y0 + by * blk + yy));
          const s = SPRITE_CATS[c];
          if (s) tally[s] = (tally[s] || 0) + 1;
        }
      const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] >= blk) {
        sig += best[0];
        nonEmpty++;
      } else sig += '.';
    }
  }
  return { sig, nonEmpty };
}
