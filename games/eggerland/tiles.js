// Terrain vocabulary for Eggerland rooms, shared by the game and by
// tools/extract.mjs (both plain ES modules). A room's `terrain` is
// ROOM_H strings of ROOM_W chars; everything that moves or can be
// picked up lives in the room's `entities` list instead.

export const ROOM_W = 11;
export const ROOM_H = 11;

export const TILE = {
  FLOOR: '.',
  ROCK: '#',
  TREE: 'T',
  WATER: '~',
  LAVA: 'L',
  SAND: 's',
  ARROW_UP: '^',
  ARROW_DOWN: 'v',
  ARROW_LEFT: '<',
  ARROW_RIGHT: '>',
};

// walk: player/enemies may enter. blocksShot: stops magic shots, Medusa
// gazes and Gol fireballs. arrow: [dx,dy] — the tile may not be entered
// moving against this direction.
export const TILE_PROPS = {
  '.': { walk: true, blocksShot: false },
  '#': { walk: false, blocksShot: true },
  T: { walk: false, blocksShot: true },
  '~': { walk: false, blocksShot: false, water: true },
  L: { walk: false, blocksShot: false, lava: true },
  s: { walk: true, blocksShot: false, sand: true },
  '^': { walk: true, blocksShot: false, arrow: [0, -1] },
  v: { walk: true, blocksShot: false, arrow: [0, 1] },
  '<': { walk: true, blocksShot: false, arrow: [-1, 0] },
  '>': { walk: true, blocksShot: false, arrow: [1, 0] },
};

// Entity types that may appear in a room's `entities` list.
export const ENTITY_TYPES = [
  'player',
  'heart',
  'key',
  'chest',
  'emerald',
  'snakey',
  'leeper',
  'medusa',
  'don-medusa',
  'gol',
  'skull',
  'rocky',
  'alma',
];

export const ENEMY_TYPES = new Set([
  'snakey',
  'leeper',
  'medusa',
  'don-medusa',
  'gol',
  'skull',
  'rocky',
  'alma',
]);

// Label vocabulary for the map-extraction tool: every unique map tile gets
// one of these labels; each maps to either a terrain char or an entity
// spawn (or both nothing, for labels handled specially like borders).
export const LABEL_DEFS = {
  floor: { terrain: TILE.FLOOR },
  decoration: { terrain: TILE.FLOOR }, // cosmetic variants (flowers, skulls…)
  rock: { terrain: TILE.ROCK },
  tree: { terrain: TILE.TREE },
  water: { terrain: TILE.WATER },
  lava: { terrain: TILE.LAVA },
  sand: { terrain: TILE.SAND },
  'arrow-up': { terrain: TILE.ARROW_UP },
  'arrow-down': { terrain: TILE.ARROW_DOWN },
  'arrow-left': { terrain: TILE.ARROW_LEFT },
  'arrow-right': { terrain: TILE.ARROW_RIGHT },
  brick: { border: true }, // room border wall
  door: { border: true, door: true }, // gap in a room border
  heart: { entity: 'heart' },
  chest: { entity: 'chest' },
  emerald: { entity: 'emerald' },
  player: { entity: 'player' },
  snakey: { entity: 'snakey' },
  leeper: { entity: 'leeper' },
  medusa: { entity: 'medusa' },
  'don-medusa': { entity: 'don-medusa' },
  gol: { entity: 'gol' },
  skull: { entity: 'skull' },
  rocky: { entity: 'rocky' },
  alma: { entity: 'alma' },
};
