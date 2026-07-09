// Build a "classic" tile atlas by sampling one clean 16x16 bitmap per
// semantic type straight from eggerland2-map.png, and emit it as a base64
// data-URI module (games/eggerland/tiles-classic.js) so the game can blit
// the original pixel art with no binary asset in the repo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngjs from 'pngjs';
import { loadPng, roomRects } from './extract.mjs';
import { terrainInset } from './classify-tile.mjs';
import { terrainOf, signature, px, colorCat } from './classify-core.mjs';
import { buildClassifier } from './mapemit.mjs';

const { PNG } = pngjs;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const img = loadPng(path.join(HERE, 'eggerland2-map.png'));
const layout = JSON.parse(fs.readFileSync(path.join(HERE, 'map-layout.json'), 'utf8'));
const sigLabels = JSON.parse(fs.readFileSync(path.join(HERE, 'sig-labels.json'), 'utf8'));
const labelFor = buildClassifier(sigLabels);
const ts = layout.tileSize;
const rects = roomRects(layout);

// Colour-fraction profile of a tile (whole + centre), for picking clean
// representative samples independent of the room classifier.
function frac(x0, y0) {
  const all = {}, cen = {};
  let n = 0, cn = 0;
  for (let y = 0; y < ts; y++) for (let x = 0; x < ts; x++) {
    const c = colorCat(...px(img, x0 + x, y0 + y));
    all[c] = (all[c] || 0) + 1; n++;
    if (x >= 4 && x < 12 && y >= 4 && y < 12) { cen[c] = (cen[c] || 0) + 1; cn++; }
  }
  const F = (o, k, d) => (o[k] || 0) / d;
  return {
    green: F(all, 'green', n), red: F(all, 'red', n), cream: F(all, 'cream', n),
    white: F(all, 'white', n), blue: F(all, 'water', n), gray: F(all, 'gray', n),
    brown: F(all, 'brown', n), magenta: F(all, 'magenta', n),
    cRed: F(cen, 'red', cn), cGreen: F(cen, 'green', cn), cBlue: F(cen, 'water', cn), cWhite: F(cen, 'white', cn),
  };
}

// Find the best tile for a scorer: highest score over all interior tiles
// (plus, for terrain, the border strips so walls are available).
function bestTile(score, { borders = false } = {}) {
  let best = null, bs = -1e9;
  const consider = (x, y) => { const s = score(frac(x, y), { x, y }); if (s > bs) { bs = s; best = { x, y }; } };
  for (const rect of rects) {
    for (let ty = 0; ty < rect.h; ty++) for (let tx = 0; tx < rect.w; tx++) consider(rect.px + tx * ts, rect.py + ty * ts);
    if (borders) for (let ty = 0; ty < rect.h; ty++) consider(rect.px - ts, rect.py + ty * ts);
  }
  return bs > 0 ? best : null;
}
function findLabel(want) {
  for (const rect of rects) for (let ty = 0; ty < rect.h; ty++) for (let tx = 0; tx < rect.w; tx++) {
    const x = rect.px + tx * ts, y = rect.py + ty * ts;
    if (terrainInset(img, x, y, ts) !== 'water' &&
        labelFor(signature(img, x, y, ts, terrainOf(img, x, y, ts)).sig) === want) return { x, y };
  }
  return null;
}

// Scorers (return >0 to be eligible; higher = cleaner). Colour-fraction
// based for the terrain/plain types, label based for the distinctive ones.
const targets = [
  ['floor', () => bestTile((f) => f.brown > 0.8 ? f.brown : -1)],
  ['water', () => bestTile((f) => f.blue > 0.7 ? f.blue : -1)],
  ['wall', () => bestTile((f) => f.gray > 0.55 ? f.gray : -1, { borders: true })],
  ['tree', () => bestTile((f) => f.green > 0.5 && f.cream < 0.04 && f.white < 0.04 ? f.green : -1)],
  ['heart', () => findLabel('heart')],
  ['chest', () => findLabel('chest')],
  ['emerald', () => findLabel('emerald')],
  ['rocky', () => findLabel('rocky')],
  ['snakey', () => findLabel('snakey')],
  ['medusa', () => findLabel('medusa')],
  ['leeper', () => bestTile((f) => f.magenta > 0.12 && f.brown > 0.2 ? f.magenta : -1)],
  ['gol', () => findLabel('gol')],
  ['key', () => findLabel('key')],
  ['arrow-up', () => findLabel('arrow-up')],
  ['arrow-down', () => findLabel('arrow-down')],
  ['arrow-left', () => findLabel('arrow-left')],
  ['arrow-right', () => findLabel('arrow-right')],
  // Player: solid sprite-blue ball with white eyes, standing on floor.
  ['player', () => bestTile((f) => f.cBlue > 0.35 && f.cWhite > 0.03 && f.brown > 0.25 && f.gray < 0.05 ? f.cBlue : -1)],
];

const map = {};
const samples = [];
for (const [name, find] of targets) {
  const t = find();
  if (t) { map[name] = samples.length; samples.push({ name, ...t }); }
  else console.warn('no sample for', name);
}

const atlas = new PNG({ width: ts * samples.length, height: ts });
samples.forEach((s, i) => {
  for (let y = 0; y < ts; y++) for (let x = 0; x < ts; x++) {
    const si = ((s.y + y) * img.width + (s.x + x)) * 4, di = (y * atlas.width + (i * ts + x)) * 4;
    atlas.data[di] = img.data[si]; atlas.data[di + 1] = img.data[si + 1]; atlas.data[di + 2] = img.data[si + 2]; atlas.data[di + 3] = 255;
  }
});
const buf = PNG.sync.write(atlas);
const b64 = 'data:image/png;base64,' + buf.toString('base64');
const outDir = path.join(HERE, 'out'); fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tiles-classic-preview.png'), buf);
const js = `// GENERATED by tools/build-atlas.mjs — classic pixel-art tiles sampled from
// eggerland2-map.png (${samples.length} cells, ${ts}px each, in a horizontal strip).
export const CLASSIC_TILE = ${ts};
export const CLASSIC_MAP = ${JSON.stringify(map)};
export const CLASSIC_ATLAS =
  '${b64}';
`;
fs.writeFileSync(path.join(HERE, '..', 'tiles-classic.js'), js);
console.log(`atlas: ${samples.length} cells ->`, samples.map((s) => s.name).join(', '));
console.log('base64 length', b64.length, '| preview out/tiles-classic-preview.png');
