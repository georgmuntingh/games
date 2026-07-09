// Emit games/eggerland/rooms.js from eggerland2-map.png. Hybrid classifier:
// terrain from each tile's inset ring (classify-tile.terrainInset, ±1px
// tolerant), and — on floor tiles — the entity/arrow/decor type from the
// sprite-signature (classify-core.signature) looked up in sig-labels.json
// with nearest-signature fallback. Rooms keyed 'col,row' on the 10x10 grid;
// doors auto-opened between neighbours for the spatial overworld.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPng, roomRects, emitRoomsModule } from './extract.mjs';
import { terrainInset } from './classify-tile.mjs';
import { terrainOf, signature } from './classify-core.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ARROW = { 'arrow-up': '^', 'arrow-down': 'v', 'arrow-left': '<', 'arrow-right': '>' };
const ENTITIES = new Set(['heart', 'chest', 'emerald', 'key', 'snakey', 'rocky', 'medusa', 'leeper', 'gol', 'skull']);

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

export function classifyRoom(img, rect, ts, labelFor) {
  const terrain = [];
  const entities = [];
  for (let ty = 0; ty < rect.h; ty++) {
    let row = '';
    for (let tx = 0; tx < rect.w; tx++) {
      const x = rect.px + tx * ts, y = rect.py + ty * ts;
      const terr = terrainInset(img, x, y, ts);
      if (terr === 'water') { row += '~'; continue; }
      if (terr === 'wall') { row += '#'; continue; }
      // Floor or tree ring -> ask the signature what overlay/decor sits here.
      const { sig } = signature(img, x, y, ts, terrainOf(img, x, y, ts));
      const label = labelFor(sig);
      if (label === 'tree' || (terr === 'tree' && !ENTITIES.has(label) && !ARROW[label])) { row += 'T'; continue; }
      if (ARROW[label]) { row += ARROW[label]; continue; }
      row += '.';
      if (ENTITIES.has(label)) entities.push({ t: label, x: tx, y: ty });
      else if (label === 'key') entities.push({ t: 'key', x: tx, y: ty });
    }
    terrain.push(row);
  }
  return { terrain, entities };
}

function main() {
  const img = loadPng(path.join(HERE, 'eggerland2-map.png'));
  const layout = JSON.parse(fs.readFileSync(path.join(HERE, 'map-layout.json'), 'utf8'));
  const sigLabels = JSON.parse(fs.readFileSync(path.join(HERE, 'sig-labels.json'), 'utf8'));
  const roomIndex = JSON.parse(fs.readFileSync(path.join(HERE, 'room-index.json'), 'utf8'));
  const ts = layout.tileSize;
  const labelFor = buildClassifier(sigLabels);
  const rects = roomRects(layout);
  const byId = new Map(rects.map((r) => [r.id, r]));
  const rooms = {};
  for (const rect of rects) {
    const { terrain, entities } = classifyRoom(img, rect, ts, labelFor);
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
