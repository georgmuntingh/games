// Emit games/eggerland/rooms.js from eggerland2-map.png by raw-RGB template
// matching: every 11x11 interior tile is compared (sum of squared pixel
// differences) against the clean reference tiles in tools/templates.json
// (produced by build-atlas.mjs) and assigned the nearest one. Terrain and
// entities follow the matched template; red bushes -> 'R', green trees ->
// 'T'. Doors are auto-opened between adjacent rooms for the spatial overworld.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPng, roomRects, emitRoomsModule } from './extract.mjs';
import { terrainOf, signature } from './classify-core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ARROW = { 'arrow-up': '^', 'arrow-down': 'v', 'arrow-left': '<', 'arrow-right': '>' };
// 'skull' is the map's hidden-access marker, not an enemy -> floor.
const TERRAIN = { floor: '.', water: '~', wall: '#', tree: 'T', bush: 'R', player: '.', skull: '.', ...ARROW };
const ENTITIES = new Set(['heart', 'chest', 'emerald', 'key', 'snakey', 'rocky', 'medusa', 'don-medusa', 'leeper', 'gol']);

// Kept for build-atlas.mjs's label finder (not used by the SSD classifier).
function hamming(a, b) { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; }
export function buildClassifier(sigLabels) {
  const labeled = Object.entries(sigLabels);
  const cache = new Map();
  return function labelFor(sig) {
    if (sigLabels[sig] !== undefined) return sigLabels[sig];
    if (sig === '.'.repeat(64)) return 'none';
    if (cache.has(sig)) return cache.get(sig);
    let best = 'none', bd = 1e9;
    for (const [s, l] of labeled) { const d = hamming(sig, s); if (d < bd) { bd = d; best = l; } }
    const res = bd <= 16 ? best : 'none';
    cache.set(sig, res);
    return res;
  };
}

function readTemplates(img, templates, ts) {
  const out = [];
  for (const [name, [x, y]] of Object.entries(templates)) {
    const buf = new Uint8ClampedArray(ts * ts * 3);
    let k = 0;
    for (let j = 0; j < ts; j++) for (let i = 0; i < ts; i++) {
      const si = ((y + j) * img.width + (x + i)) * 4;
      buf[k++] = img.data[si]; buf[k++] = img.data[si + 1]; buf[k++] = img.data[si + 2];
    }
    out.push({ name, buf });
  }
  return out;
}

// An entity/enemy match beyond this SSD is not a confident match — the
// distance histogram shows real entities well under it and terrain-into-
// enemy false positives far above it, so those fall back to terrain.
const ENTITY_MAX_DIST = 1800000;

function matchTile(img, x0, y0, ts, tmpls) {
  let best = 'floor', bd = Infinity, bestTerr = 'floor', btd = Infinity;
  for (const t of tmpls) {
    let sum = 0, k = 0;
    for (let j = 0; j < ts; j++) for (let i = 0; i < ts; i++) {
      const si = ((y0 + j) * img.width + (x0 + i)) * 4;
      const dr = img.data[si] - t.buf[k++];
      const dg = img.data[si + 1] - t.buf[k++];
      const db = img.data[si + 2] - t.buf[k++];
      sum += dr * dr + dg * dg + db * db;
    }
    if (sum < bd) { bd = sum; best = t.name; }
    if (TERRAIN[t.name] && sum < btd) { btd = sum; bestTerr = t.name; }
  }
  // Only accept an entity when its match is confident; else take the terrain.
  if (!TERRAIN[best] && bd > ENTITY_MAX_DIST) best = bestTerr;
  return best;
}

export function classifyRoom(img, rect, ts, tmpls) {
  const terrain = [];
  const entities = [];
  for (let ty = 0; ty < rect.h; ty++) {
    let row = '';
    for (let tx = 0; tx < rect.w; tx++) {
      const name = matchTile(img, rect.px + tx * ts, rect.py + ty * ts, ts, tmpls);
      if (TERRAIN[name]) { row += TERRAIN[name]; continue; }
      row += '.';
      if (ENTITIES.has(name)) entities.push({ t: name, x: tx, y: ty });
    }
    terrain.push(row);
  }
  return { terrain, entities };
}

function main() {
  const img = loadPng(path.join(HERE, 'eggerland2-map.png'));
  const layout = JSON.parse(fs.readFileSync(path.join(HERE, 'map-layout.json'), 'utf8'));
  const templates = JSON.parse(fs.readFileSync(path.join(HERE, 'templates.json'), 'utf8'));
  const roomIndex = JSON.parse(fs.readFileSync(path.join(HERE, 'room-index.json'), 'utf8'));
  const ts = layout.tileSize;
  const tmpls = readTemplates(img, templates, ts);
  const rects = roomRects(layout);
  const byId = new Map(rects.map((r) => [r.id, r]));
  const rooms = {};
  for (const rect of rects) {
    const { terrain, entities } = classifyRoom(img, rect, ts, tmpls);
    rooms[rect.id] = { stage: roomIndex.stageByCoord?.[rect.id] ?? 0, terrain, entities, exits: { n: null, s: null, e: null, w: null } };
  }

  const W = layout.roomTiles.w, H = layout.roomTiles.h;
  const midX = (W - 1) >> 1, midY = (H - 1) >> 1;
  const carve = (room, x, y) => {
    if (room.terrain[y][x] !== '.') room.terrain[y] = room.terrain[y].slice(0, x) + '.' + room.terrain[y].slice(x + 1);
    room.entities = room.entities.filter((e) => !(e.x === x && e.y === y));
  };
  for (const rect of rects) {
    const [c, r] = rect.id.split(',').map(Number); const room = rooms[rect.id];
    if (byId.has(`${c},${r - 1}`)) { room.exits.n = midX; carve(room, midX, 0); }
    if (byId.has(`${c},${r + 1}`)) { room.exits.s = midX; carve(room, midX, H - 1); }
    if (byId.has(`${c - 1},${r}`)) { room.exits.w = midY; carve(room, 0, midY); }
    if (byId.has(`${c + 1},${r}`)) { room.exits.e = midY; carve(room, W - 1, midY); }
  }
  for (const rect of rects) {
    const room = rooms[rect.id];
    let placed = false;
    for (let y = H - 1; y >= 0 && !placed; y--)
      for (let x = 0; x < W && !placed; x++)
        if (room.terrain[y][x] === '.' && !room.entities.some((e) => e.x === x && e.y === y)) { room.entities.unshift({ t: 'player', x, y }); placed = true; }
    if (!placed) room.entities.unshift({ t: 'player', x: midX, y: midY });
  }
  for (const rect of rects) {
    const room = rooms[rect.id];
    let seen = false;
    room.entities = room.entities.filter((e) => e.t !== 'chest' || (!seen && (seen = true)));
    if (!room.entities.some((e) => e.t === 'chest'))
      outer: for (let y = 0; y < H; y++) for (let x = W - 1; x >= 0; x--)
        if (room.terrain[y][x] === '.' && !room.entities.some((e) => e.x === x && e.y === y)) { room.entities.push({ t: 'chest', x, y }); break outer; }
  }
  const out = path.join(HERE, '..', 'rooms.js');
  fs.writeFileSync(out, emitRoomsModule(rooms, { generatedBy: 'tools/mapemit.mjs' }));
  const counts = {};
  for (const room of Object.values(rooms)) for (const e of room.entities) counts[e.t] = (counts[e.t] || 0) + 1;
  console.log(`${Object.keys(rooms).length} rooms -> ${out}`);
  console.log('entity counts:', JSON.stringify(counts));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
