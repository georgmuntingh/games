// Generates a synthetic 2×2-room map PNG plus the matching layout,
// labels and expected rooms JSON, so the extraction pipeline can be
// verified end-to-end without the real (copyrighted, gitignored) map.
// Every tile type is drawn as a distinct flat color with a per-type
// inset mark, so pixel hashes are unique per label.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngjs from 'pngjs';
import { hashTile } from './extract.mjs';

const { PNG } = pngjs;
const HERE = path.dirname(fileURLToPath(import.meta.url));

export const TS = 16; // fixture tile size
const ROOM_W = 14;
const ROOM_H = 10;
const PITCH_X = ROOM_W * TS + TS; // one shared border tile between rooms
const PITCH_Y = ROOM_H * TS + TS;

// label -> [r, g, b] base color. Colors are arbitrary but distinct.
const COLORS = {
  floor: [150, 100, 60],
  decoration: [160, 110, 70],
  rock: [120, 120, 120],
  tree: [40, 140, 60],
  water: [50, 100, 220],
  lava: [220, 70, 40],
  sand: [220, 180, 110],
  'arrow-up': [240, 240, 200],
  'arrow-down': [230, 230, 190],
  'arrow-left': [220, 220, 180],
  'arrow-right': [210, 210, 170],
  brick: [160, 155, 150],
  door: [230, 180, 60],
  heart: [230, 40, 70],
  chest: [140, 90, 40],
  emerald: [40, 200, 90],
  player: [60, 120, 240],
  snakey: [80, 180, 80],
  leeper: [160, 100, 210],
  medusa: [30, 120, 80],
  'don-medusa': [180, 50, 100],
  gol: [150, 155, 165],
  skull: [235, 230, 215],
  rocky: [175, 120, 60],
  alma: [225, 130, 50],
};

const LABEL_LIST = Object.keys(COLORS);

function paintTile(png, x0, y0, label) {
  const [r, g, b] = COLORS[label];
  const mark = LABEL_LIST.indexOf(label);
  for (let y = 0; y < TS; y++) {
    for (let x = 0; x < TS; x++) {
      const i = ((y0 + y) * png.width + (x0 + x)) * 4;
      // Inset mark: a small dark square whose position encodes the label
      // index, guaranteeing distinct hashes even for similar colors.
      const mx = 2 + (mark % 4) * 3;
      const my = 2 + Math.floor(mark / 4) * 2;
      const marked = x >= mx && x < mx + 2 && y >= my && y < my + 2;
      png.data[i] = marked ? r >> 1 : r;
      png.data[i + 1] = marked ? g >> 1 : g;
      png.data[i + 2] = marked ? b >> 1 : b;
      png.data[i + 3] = 255;
    }
  }
}

// Fixture room contents, written in the same shape the extractor should
// reproduce. '.' floor in terrain; entities placed over floor.
const FIXTURE_ROOMS = {
  '0,0': {
    stage: 1,
    terrain: [
      '..............',
      '.TT.......~~..',
      '..........~~..',
      '..............',
      '....s.........',
      '....s.........',
      '..............',
      '.#............',
      '..............',
      '..............',
    ],
    entities: [
      { t: 'player', x: 2, y: 8 },
      { t: 'heart', x: 5, y: 2 },
      { t: 'emerald', x: 7, y: 5 },
      { t: 'chest', x: 12, y: 8 },
      { t: 'snakey', x: 6, y: 6 },
    ],
    exits: { n: null, s: 7, e: 5, w: null },
  },
  '1,0': {
    stage: 2,
    terrain: [
      '..............',
      '..>>..........',
      '..............',
      '.....TT.......',
      '..............',
      '..............',
      '......LL......',
      '..............',
      '..v...........',
      '..............',
    ],
    entities: [
      { t: 'player', x: 1, y: 8 },
      { t: 'heart', x: 10, y: 2 },
      { t: 'medusa', x: 7, y: 7 },
      { t: 'chest', x: 12, y: 1 },
    ],
    exits: { n: null, s: 7, e: null, w: 5 },
  },
  '0,1': {
    stage: 3,
    terrain: [
      '..............',
      '..~~~.........',
      '..~~~.........',
      '..............',
      '..............',
      '.......<......',
      '..............',
      '..ss..........',
      '..............',
      '..............',
    ],
    entities: [
      { t: 'player', x: 2, y: 5 },
      { t: 'heart', x: 6, y: 3 },
      { t: 'leeper', x: 9, y: 2 },
      { t: 'chest', x: 11, y: 8 },
    ],
    exits: { n: 7, s: null, e: 5, w: null },
  },
  '1,1': {
    stage: 4,
    terrain: [
      '..............',
      '..............',
      '...TTT........',
      '..............',
      '..............',
      '..............',
      '........#.....',
      '..............',
      '..............',
      '..............',
    ],
    entities: [
      { t: 'player', x: 7, y: 8 },
      { t: 'heart', x: 3, y: 5 },
      { t: 'heart', x: 11, y: 6 },
      { t: 'skull', x: 12, y: 2 },
      { t: 'chest', x: 1, y: 1 },
    ],
    exits: { n: 7, s: null, e: null, w: 5 },
  },
};

export function buildFixture(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const width = 2 * PITCH_X + TS;
  const height = 2 * PITCH_Y + TS;
  const png = new PNG({ width, height });

  // Fill everything with brick, then carve out the rooms.
  for (let y = 0; y < height; y += TS) {
    for (let x = 0; x < width; x += TS) {
      paintTile(png, x, y, 'brick');
    }
  }

  const layout = {
    tileSize: TS,
    roomTiles: { w: ROOM_W, h: ROOM_H },
    mainGrid: { origin: { x: TS, y: TS }, pitch: { x: PITCH_X, y: PITCH_Y }, cols: 2, rows: 2 },
    extraRooms: [],
    excludeRects: [],
    roomOverrides: {},
  };

  const CHAR_LABELS = {
    '.': 'floor',
    '#': 'rock',
    T: 'tree',
    '~': 'water',
    L: 'lava',
    s: 'sand',
    '^': 'arrow-up',
    v: 'arrow-down',
    '<': 'arrow-left',
    '>': 'arrow-right',
  };

  for (const [id, room] of Object.entries(FIXTURE_ROOMS)) {
    const [c, r] = id.split(',').map(Number);
    const ox = TS + c * PITCH_X;
    const oy = TS + r * PITCH_Y;
    for (let ty = 0; ty < ROOM_H; ty++) {
      for (let tx = 0; tx < ROOM_W; tx++) {
        paintTile(png, ox + tx * TS, oy + ty * TS, CHAR_LABELS[room.terrain[ty][tx]]);
      }
    }
    for (const e of room.entities) {
      paintTile(png, ox + e.x * TS, oy + e.y * TS, e.t);
    }
    // Door gaps in the border strips.
    if (room.exits.n != null) paintTile(png, ox + room.exits.n * TS, oy - TS, 'door');
    if (room.exits.s != null) paintTile(png, ox + room.exits.s * TS, oy + ROOM_H * TS, 'door');
    if (room.exits.w != null) paintTile(png, ox - TS, oy + room.exits.w * TS, 'door');
    if (room.exits.e != null) paintTile(png, ox + ROOM_W * TS, oy + room.exits.e * TS, 'door');
  }

  // Labels: hash one canonical painted tile of each type.
  const probe = new PNG({ width: TS, height: TS });
  const labels = {};
  for (const label of LABEL_LIST) {
    paintTile(probe, 0, 0, label);
    labels[hashTile(probe, 0, 0, TS)] = label;
  }

  const index = {
    stageByCoord: { '0,0': 1, '1,0': 2, '0,1': 3, '1,1': 4 },
  };

  const mapFile = path.join(outDir, 'fixture-map.png');
  fs.writeFileSync(mapFile, PNG.sync.write(png));
  fs.writeFileSync(path.join(outDir, 'fixture-layout.json'), JSON.stringify(layout, null, 2));
  fs.writeFileSync(path.join(outDir, 'fixture-labels.json'), JSON.stringify(labels, null, 2));
  fs.writeFileSync(path.join(outDir, 'fixture-index.json'), JSON.stringify(index, null, 2));
  fs.writeFileSync(
    path.join(outDir, 'fixture-expected.json'),
    JSON.stringify(FIXTURE_ROOMS, null, 2)
  );
  return { mapFile, layout, labels, index, expected: FIXTURE_ROOMS };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { mapFile } = buildFixture(path.join(HERE, 'out'));
  console.log(`fixture map written to ${mapFile}`);
}
