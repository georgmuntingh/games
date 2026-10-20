// Build the classic tile atlas AND the classification templates from
// eggerland2-map.png. One clean 16x16 bitmap per semantic type is sampled;
// the same samples drive both the in-game "Classic" theme (tiles-classic.js,
// a base64 atlas) and the template-matching classifier in mapemit.mjs
// (tools/templates.json = name -> [x,y]).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngjs from 'pngjs';
import { loadPng, roomRects, hashTile } from './extract.mjs';
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

// colorCat buckets pale yellow (#d8d890, the heart-box/chest colour) as
// 'green' because g>=r; treat it as 'cream' first for clean sampling.
function cat(r, g, b) {
  if (r > 175 && g > 160 && b < 200 && b < r && Math.abs(r - g) < 40) return 'cream';
  return colorCat(r, g, b);
}
function frac(x0, y0) {
  const all = {}, cen = {};
  let n = 0, cn = 0;
  for (let y = 0; y < ts; y++) for (let x = 0; x < ts; x++) {
    const c = cat(...px(img, x0 + x, y0 + y));
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
function bestTile(score, { borders = false } = {}) {
  let best = null, bs = 0;
  const consider = (x, y) => { const s = score(frac(x, y)); if (s > bs) { bs = s; best = { x, y }; } };
  for (const rect of rects) {
    for (let ty = 0; ty < rect.h; ty++) for (let tx = 0; tx < rect.w; tx++) consider(rect.px + tx * ts, rect.py + ty * ts);
    if (borders) for (let ty = 0; ty < rect.h; ty++) consider(rect.px - ts, rect.py + ty * ts);
  }
  return best;
}
// Most-repeated exact tile matching `pred` — the canonical terrain tile
// (bushes/trees recur many times; rare solid-colour outliers do not).
function mostCommon(pred) {
  const counts = new Map();
  for (const rect of rects) for (let ty = 0; ty < rect.h; ty++) for (let tx = 0; tx < rect.w; tx++) {
    const x = rect.px + tx * ts, y = rect.py + ty * ts;
    if (!pred(frac(x, y))) continue;
    const h = hashTile(img, x, y, ts);
    const e = counts.get(h);
    if (e) e.n++; else counts.set(h, { x, y, n: 1 });
  }
  let best = null, bn = 0;
  for (const e of counts.values()) if (e.n > bn) { bn = e.n; best = e; }
  return best;
}
function findLabel(want) {
  for (const rect of rects) for (let ty = 0; ty < rect.h; ty++) for (let tx = 0; tx < rect.w; tx++) {
    const x = rect.px + tx * ts, y = rect.py + ty * ts;
    if (terrainInset(img, x, y, ts) !== 'water' &&
        labelFor(signature(img, x, y, ts, terrainOf(img, x, y, ts)).sig) === want) return { x, y };
  }
  return null;
}

const targets = [
  ['floor', () => bestTile((f) => f.brown > 0.8 ? f.brown : 0)],
  ['water', () => bestTile((f) => f.blue > 0.7 ? f.blue : 0)],
  ['wall', () => bestTile((f) => f.gray > 0.55 ? f.gray : 0, { borders: true })],
  // Canonical green tree/hedge and red bush — the most-repeated structured
  // green/red tiles (a solid-colour outlier wouldn't SSD-match real bushes).
  ['tree', () => mostCommon((f) => f.green > 0.3 && f.cream < 0.04 && f.white < 0.06 && f.red < 0.25)],
  ['bush', () => mostCommon((f) => f.red > 0.25 && f.cream < 0.04 && f.white < 0.06 && f.green < 0.12)],
  // These distinctive framed/sprite tiles are found reliably by the room
  // classifier's label (colour fractions can't tell e.g. an emerald block
  // from a green enemy face).
  ['emerald', () => findLabel('emerald')],
  ['heart', () => findLabel('heart')],
  ['chest', () => findLabel('chest')],
  ['key', () => findLabel('key')],
  ['snakey', () => findLabel('snakey')],
  ['rocky', () => findLabel('rocky')],
  ['medusa', () => findLabel('medusa')],
  ['leeper', () => bestTile((f) => f.magenta > 0.12 && f.brown > 0.2 ? f.magenta : 0)],
  // Don Medusa: red/white horned ram face (distinct from Rocky's round red).
  ['don-medusa', () => bestTile((f) => f.red > 0.18 && f.white > 0.1 && f.white < 0.5 && f.green < 0.12 && f.cream < 0.06 && f.blue < 0.05 ? f.red + f.white : 0)],
  // Skull: the map's white hidden-access marker (rendered as floor, not an enemy).
  ['skull', () => bestTile((f) => f.white > 0.2 && f.blue < 0.05 && f.green < 0.08 && f.cream < 0.05 && f.brown < 0.5 ? f.white : 0)],
  ['gol', () => findLabel('gol')],
  ['arrow-up', () => findLabel('arrow-up')],
  ['arrow-down', () => findLabel('arrow-down')],
  ['arrow-left', () => findLabel('arrow-left')],
  ['arrow-right', () => findLabel('arrow-right')],
  // Player: solid sprite-blue ball with white eyes standing on floor.
  ['player', () => bestTile((f) => f.cBlue > 0.3 && f.cWhite > 0.02 && f.blue < 0.65 && f.brown > 0.12 && f.gray < 0.06 ? f.cBlue + f.cWhite : 0)],
];

const map = {};
const templates = {};
const samples = [];
for (const [name, find] of targets) {
  const t = find();
  if (t) { map[name] = samples.length; templates[name] = [t.x, t.y]; samples.push({ name, ...t }); }
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
fs.writeFileSync(path.join(HERE, 'templates.json'), JSON.stringify(templates, null, 1));
const js = `// GENERATED by tools/build-atlas.mjs — classic pixel-art tiles sampled from
// eggerland2-map.png (${samples.length} cells, ${ts}px each, in a horizontal strip).
export const CLASSIC_TILE = ${ts};
export const CLASSIC_MAP = ${JSON.stringify(map)};
export const CLASSIC_ATLAS =
  '${b64}';
`;
fs.writeFileSync(path.join(HERE, '..', 'tiles-classic.js'), js);
console.log(`atlas/templates: ${samples.length} ->`, samples.map((s) => s.name).join(', '));
