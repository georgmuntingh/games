#!/usr/bin/env node
// Map-extraction pipeline for Eggerland: converts the fan-made global
// map PNG (see README.md) into the game's rooms.js. Three phases:
//
//   node extract.mjs analyze --map assets/eggerland2-map.png
//       Measures the room grid (border peaks, pitch, tile size) to help
//       write map-layout.json by hand.
//
//   node extract.mjs atlas --map ... --layout map-layout.json
//       Slices every room into tiles, dedupes them by pixel hash and
//       emits out/tile-atlas.json + out/contact-sheet.png so each unique
//       tile can be labeled in tile-labels.json.
//
//   node extract.mjs rooms --map ... --layout ... --labels tile-labels.json \
//       --index room-index.json --out ../rooms.js
//       Emits the final rooms module. Fails loudly on unlabeled tiles.
//
// The core steps are exported as functions so test-extract.mjs can run
// the whole pipeline against the synthetic fixture map.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngjs from 'pngjs';
import { LABEL_DEFS, TILE } from '../tiles.js';

const { PNG } = pngjs;
const HERE = path.dirname(fileURLToPath(import.meta.url));

// --- PNG + hashing helpers ----------------------------------------------

export function loadPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

export function savePng(png, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, PNG.sync.write(png));
}

// FNV-1a 64-bit over the tile's RGB bytes (alpha ignored — some tools
// export odd alpha). With --quant, channels are quantized to 32 levels
// to absorb slight anti-aliasing noise.
export function hashTile(image, x0, y0, size, quant = false) {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let y = y0; y < y0 + size; y++) {
    for (let x = x0; x < x0 + size; x++) {
      const i = (y * image.width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let v = image.data[i + c];
        if (quant) v &= 0xf8;
        h ^= BigInt(v);
        h = (h * prime) & 0xffffffffffffffffn;
      }
    }
  }
  return h.toString(16).padStart(16, '0');
}

function copyTile(src, x0, y0, size, dst, dx, dy, zoom) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const si = ((y0 + y) * src.width + (x0 + x)) * 4;
      for (let zy = 0; zy < zoom; zy++) {
        for (let zx = 0; zx < zoom; zx++) {
          const di = ((dy + y * zoom + zy) * dst.width + (dx + x * zoom + zx)) * 4;
          dst.data[di] = src.data[si];
          dst.data[di + 1] = src.data[si + 1];
          dst.data[di + 2] = src.data[si + 2];
          dst.data[di + 3] = 255;
        }
      }
    }
  }
}

// Tiny 3×5 digit font for numbering contact-sheet cells.
const DIGITS = {
  0: ['111', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'],
  3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'],
  5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'],
  7: ['111', '001', '010', '010', '010'],
  8: ['111', '101', '111', '101', '111'],
  9: ['111', '101', '111', '001', '111'],
};

function drawNumber(png, n, x0, y0) {
  const text = String(n);
  for (let d = 0; d < text.length; d++) {
    const glyph = DIGITS[text[d]];
    for (let gy = 0; gy < 5; gy++) {
      for (let gx = 0; gx < 3; gx++) {
        const on = glyph[gy][gx] === '1';
        const px = x0 + d * 4 + gx;
        const py = y0 + gy;
        if (px >= png.width || py >= png.height) continue;
        const i = (py * png.width + px) * 4;
        const v = on ? 255 : 0;
        png.data[i] = v;
        png.data[i + 1] = v;
        png.data[i + 2] = on ? 0 : 0;
        png.data[i + 3] = 255;
      }
    }
  }
}

// --- Layout ---------------------------------------------------------------

// Expands map-layout.json into a flat list of room rectangles:
// { id, px, py, w, h } with px,py the pixel origin of the interior and
// w,h the interior size in tiles.
export function roomRects(layout) {
  const { tileSize, roomTiles, mainGrid, extraRooms = [], roomOverrides = {} } = layout;
  const rects = [];
  for (let r = 0; r < mainGrid.rows; r++) {
    for (let c = 0; c < mainGrid.cols; c++) {
      const id = `${c + (mainGrid.coordOffset?.x ?? 0)},${r + (mainGrid.coordOffset?.y ?? 0)}`;
      rects.push({
        id,
        px: mainGrid.origin.x + c * mainGrid.pitch.x,
        py: mainGrid.origin.y + r * mainGrid.pitch.y,
        w: roomOverrides[id]?.w ?? roomTiles.w,
        h: roomOverrides[id]?.h ?? roomTiles.h,
      });
    }
  }
  for (const room of extraRooms) {
    rects.push({
      id: room.id,
      px: room.x,
      py: room.y,
      w: roomOverrides[room.id]?.w ?? roomTiles.w,
      h: roomOverrides[room.id]?.h ?? roomTiles.h,
    });
  }
  return rects.map((rect) => ({ ...rect, ts: tileSize }));
}

function* roomTilePositions(rect) {
  const { ts } = rect;
  // Interior tiles.
  for (let ty = 0; ty < rect.h; ty++) {
    for (let tx = 0; tx < rect.w; tx++) {
      yield { kind: 'interior', tx, ty, x: rect.px + tx * ts, y: rect.py + ty * ts };
    }
  }
  // Border strips (shared with neighbors), where the door gaps live.
  for (let tx = 0; tx < rect.w; tx++) {
    yield { kind: 'border', side: 'n', off: tx, x: rect.px + tx * ts, y: rect.py - ts };
    yield { kind: 'border', side: 's', off: tx, x: rect.px + tx * ts, y: rect.py + rect.h * ts };
  }
  for (let ty = 0; ty < rect.h; ty++) {
    yield { kind: 'border', side: 'w', off: ty, x: rect.px - ts, y: rect.py + ty * ts };
    yield { kind: 'border', side: 'e', off: ty, x: rect.px + rect.w * ts, y: rect.py + ty * ts };
  }
}

// --- analyze ---------------------------------------------------------------

function isGrayish(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 28 && max > 70 && max < 225;
}

export function analyze(image) {
  const colScore = new Array(image.width).fill(0);
  const rowScore = new Array(image.height).fill(0);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4;
      if (isGrayish(image.data[i], image.data[i + 1], image.data[i + 2])) {
        colScore[x]++;
        rowScore[y]++;
      }
    }
  }
  const norm = (scores, total) => scores.map((s) => s / total);
  return {
    colScore: norm(colScore, image.height),
    rowScore: norm(rowScore, image.width),
  };
}

function peaks(scores, threshold = 0.35) {
  const out = [];
  let run = null;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] >= threshold) {
      run = run ?? { start: i };
      run.end = i;
    } else if (run) {
      out.push(Math.round((run.start + run.end) / 2));
      run = null;
    }
  }
  if (run) out.push(Math.round((run.start + run.end) / 2));
  return out;
}

function describeSpacing(positions) {
  const gaps = [];
  for (let i = 1; i < positions.length; i++) gaps.push(positions[i] - positions[i - 1]);
  gaps.sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)];
  return { count: positions.length, median, gaps: gaps.slice(0, 30) };
}

// Best self-similarity period of a sample region — candidate tile size.
export function tilePeriod(image, x0, y0, w, h, range = [7, 33]) {
  let best = { p: 0, score: -1 };
  for (let p = range[0]; p < range[1]; p++) {
    let same = 0;
    let total = 0;
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w - p; x += 2) {
        const a = (y * image.width + x) * 4;
        const b = (y * image.width + x + p) * 4;
        total++;
        if (
          image.data[a] === image.data[b] &&
          image.data[a + 1] === image.data[b + 1] &&
          image.data[a + 2] === image.data[b + 2]
        ) {
          same++;
        }
      }
    }
    const score = same / total;
    if (score > best.score) best = { p, score };
  }
  return best;
}

function cmdAnalyze(args) {
  const image = loadPng(args.map);
  console.log(`map: ${args.map} (${image.width}×${image.height})`);
  const { colScore, rowScore } = analyze(image);
  const colPeaks = peaks(colScore);
  const rowPeaks = peaks(rowScore);
  console.log('\nvertical border columns (gray-pixel peaks):');
  console.log(`  positions: ${colPeaks.join(', ')}`);
  console.log(`  spacing: ${JSON.stringify(describeSpacing(colPeaks))}`);
  console.log('\nhorizontal border rows:');
  console.log(`  positions: ${rowPeaks.join(', ')}`);
  console.log(`  spacing: ${JSON.stringify(describeSpacing(rowPeaks))}`);
  if (colPeaks.length >= 2 && rowPeaks.length >= 2) {
    const sx = colPeaks[0];
    const sy = rowPeaks[0];
    const period = tilePeriod(image, sx + 4, sy + 4, Math.min(300, image.width - sx - 8), 60);
    console.log(`\ntile-size candidate (self-similarity): ${period.p}px (score ${period.score.toFixed(3)})`);
  }
  console.log(
    '\nUse these measurements to fill in map-layout.json ' +
      '(origin = first interior pixel, pitch = room-to-room distance).'
  );
}

// --- atlas -------------------------------------------------------------------

export function collectTiles(image, layout, { quant = false } = {}) {
  const tiles = new Map(); // hash -> { count, first }
  const rects = roomRects(layout);
  const excluded = layout.excludeRects ?? [];
  const skip = (x, y, ts) =>
    excluded.some(
      (r) => x + ts > r.x && x < r.x + r.w && y + ts > r.y && y < r.y + r.h
    );
  for (const rect of rects) {
    for (const pos of roomTilePositions(rect)) {
      if (pos.x < 0 || pos.y < 0 || pos.x + rect.ts > image.width || pos.y + rect.ts > image.height) {
        continue;
      }
      if (skip(pos.x, pos.y, rect.ts)) continue;
      const hash = hashTile(image, pos.x, pos.y, rect.ts, quant);
      const entry = tiles.get(hash);
      if (entry) {
        entry.count++;
      } else {
        tiles.set(hash, {
          count: 1,
          first: { room: rect.id, kind: pos.kind, side: pos.side, tx: pos.tx ?? pos.off, ty: pos.ty ?? 0, x: pos.x, y: pos.y },
        });
      }
    }
  }
  return tiles;
}

export function runAtlas(image, layout, { quant = false, outDir } = {}) {
  const tiles = collectTiles(image, layout, { quant });
  const sorted = [...tiles.entries()].sort((a, b) => b[1].count - a[1].count);
  if (sorted.length > 400) {
    console.warn(
      `warning: ${sorted.length} unique tiles — the map may be anti-aliased ` +
        'or the layout misaligned. Try --quant or re-check map-layout.json.'
    );
  }
  const ts = layout.tileSize;
  const zoom = 3;
  const cols = 16;
  const cellW = ts * zoom + 18;
  const cellH = ts * zoom + 10;
  const rows = Math.ceil(sorted.length / cols);
  const sheet = new PNG({ width: cols * cellW, height: Math.max(1, rows * cellH) });
  sheet.data.fill(40);
  for (let a = 3; a < sheet.data.length; a += 4) sheet.data[a] = 255;
  const index = [];
  sorted.forEach(([hash, info], i) => {
    const cx = (i % cols) * cellW;
    const cy = Math.floor(i / cols) * cellH;
    copyTile(image, info.first.x, info.first.y, ts, sheet, cx + 2, cy + 2, zoom);
    drawNumber(sheet, i, cx + ts * zoom + 5, cy + 4);
    index.push({ index: i, hash, count: info.count, first: info.first });
  });
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    savePng(sheet, path.join(outDir, 'contact-sheet.png'));
    fs.writeFileSync(
      path.join(outDir, 'tile-atlas.json'),
      JSON.stringify(index, null, 2)
    );
    fs.writeFileSync(
      path.join(outDir, 'contact-sheet.json'),
      JSON.stringify(
        index.map(({ index: i, hash }) => ({ index: i, hash })),
        null,
        2
      )
    );
  }
  return index;
}

// --- rooms ---------------------------------------------------------------------

export function runRooms(image, layout, labels, roomIndex, { quant = false } = {}) {
  const rects = roomRects(layout);
  const rooms = {};
  const unlabeled = new Map();
  const label = (x, y, ts, where) => {
    const hash = hashTile(image, x, y, ts, quant);
    const name = labels[hash];
    if (!name) {
      if (!unlabeled.has(hash)) unlabeled.set(hash, where);
      return null;
    }
    if (!LABEL_DEFS[name]) {
      throw new Error(`tile-labels.json maps ${hash} to unknown label '${name}'`);
    }
    return name;
  };

  for (const rect of rects) {
    const terrain = Array.from({ length: rect.h }, () => new Array(rect.w).fill(TILE.FLOOR));
    const entities = [];
    const exits = { n: null, s: null, e: null, w: null };
    let skipRoom = false;
    for (const pos of roomTilePositions(rect)) {
      if (pos.x < 0 || pos.y < 0 || pos.x + rect.ts > image.width || pos.y + rect.ts > image.height) {
        skipRoom = skipRoom || pos.kind === 'interior';
        continue;
      }
      const name = label(pos.x, pos.y, rect.ts, `${rect.id} ${pos.kind} ${pos.tx ?? pos.off},${pos.ty ?? ''}`);
      if (name == null) continue;
      const def = LABEL_DEFS[name];
      if (pos.kind === 'interior') {
        if (def.terrain) terrain[pos.ty][pos.tx] = def.terrain;
        if (def.entity) entities.push({ t: def.entity, x: pos.tx, y: pos.ty });
      } else if (def.door) {
        exits[pos.side] = pos.off;
      }
    }
    if (skipRoom) continue;
    // Rooms need a player spawn for standalone entry; if the map shows
    // none, synthesize one on the first walkable floor tile.
    if (!entities.some((e) => e.t === 'player')) {
      outer: for (let y = rect.h - 1; y >= 0; y--) {
        for (let x = 0; x < rect.w; x++) {
          if (
            terrain[y][x] === TILE.FLOOR &&
            !entities.some((e) => e.x === x && e.y === y)
          ) {
            entities.push({ t: 'player', x, y });
            break outer;
          }
        }
      }
    }
    rooms[rect.id] = {
      stage: roomIndex.stageByCoord?.[rect.id] ?? 0,
      terrain: terrain.map((row) => row.join('')),
      entities,
      exits,
    };
  }

  if (unlabeled.size) {
    const lines = [...unlabeled.entries()]
      .slice(0, 40)
      .map(([hash, where]) => `  ${hash}  (first seen: ${where})`);
    throw new Error(
      `${unlabeled.size} unlabeled tile hash(es) — add them to tile-labels.json:\n` +
        lines.join('\n')
    );
  }
  return rooms;
}

export function emitRoomsModule(rooms, { generatedBy = 'tools/extract.mjs' } = {}) {
  const lines = [];
  lines.push(`// GENERATED by ${generatedBy} — do not edit by hand.`);
  lines.push('// Hand-curated gameplay facts live in room-overrides.js instead.');
  lines.push('// Terrain chars are defined in tiles.js.');
  lines.push('');
  lines.push("export { ROOM_W, ROOM_H } from './tiles.js';");
  lines.push('');
  lines.push('export const ROOMS = {');
  for (const [id, room] of Object.entries(rooms)) {
    lines.push(`  '${id}': {`);
    lines.push(`    stage: ${room.stage},`);
    lines.push('    terrain: [');
    for (const row of room.terrain) lines.push(`      '${row}',`);
    lines.push('    ],');
    lines.push('    entities: [');
    for (const e of room.entities) {
      lines.push(`      { t: '${e.t}', x: ${e.x}, y: ${e.y} },`);
    }
    lines.push('    ],');
    const ex = room.exits;
    lines.push(
      `    exits: { n: ${ex.n}, s: ${ex.s}, e: ${ex.e}, w: ${ex.w} },`
    );
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

// --- CLI --------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args[key] = argv[++i];
      } else {
        args[key] = true;
      }
    } else {
      args._.push(argv[i]);
    }
  }
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const defaults = {
    map: path.join(HERE, 'assets', 'eggerland2-map.png'),
    layout: path.join(HERE, 'map-layout.json'),
    labels: path.join(HERE, 'tile-labels.json'),
    index: path.join(HERE, 'room-index.json'),
    out: path.join(HERE, '..', 'rooms.js'),
    outDir: path.join(HERE, 'out'),
  };
  const opt = (k) => args[k] ?? defaults[k];

  if (cmd === 'analyze') {
    cmdAnalyze({ map: opt('map') });
  } else if (cmd === 'atlas') {
    const image = loadPng(opt('map'));
    const index = runAtlas(image, readJson(opt('layout')), {
      quant: Boolean(args.quant),
      outDir: opt('outDir'),
    });
    console.log(`${index.length} unique tiles → ${opt('outDir')}/contact-sheet.png`);
  } else if (cmd === 'rooms') {
    const image = loadPng(opt('map'));
    const rooms = runRooms(
      image,
      readJson(opt('layout')),
      readJson(opt('labels')),
      readJson(opt('index')),
      { quant: Boolean(args.quant) }
    );
    fs.writeFileSync(opt('out'), emitRoomsModule(rooms));
    console.log(`${Object.keys(rooms).length} rooms → ${opt('out')}`);
  } else {
    console.log('usage: extract.mjs <analyze|atlas|rooms> [--map f] [--layout f] [--labels f] [--index f] [--out f] [--quant]');
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
