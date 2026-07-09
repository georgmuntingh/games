// Overworld: merges room data with hand-curated overrides, answers
// adjacency queries on the 10×10 map grid, and persists progress.

import { ROOMS, ROOM_W, ROOM_H } from './rooms.js';
import { OVERRIDES } from './room-overrides.js';
import { TILE_PROPS, ENTITY_TYPES } from './tiles.js';

const STORAGE_KEY = 'eggerland-v2';

export const GRID_COLS = 10;
export const GRID_ROWS = 10;

export const SIDES = {
  n: { dx: 0, dy: -1, opposite: 's' },
  s: { dx: 0, dy: 1, opposite: 'n' },
  e: { dx: 1, dy: 0, opposite: 'w' },
  w: { dx: -1, dy: 0, opposite: 'e' },
};

const merged = new Map();

export function getRoom(key) {
  if (merged.has(key)) return merged.get(key);
  const base = ROOMS[key];
  if (!base) return null;
  const over = OVERRIDES[key] ?? {};
  const room = {
    key,
    stage: base.stage,
    terrain: base.terrain,
    exits: base.exits,
    entities: base.entities.map((e) => {
      const patch = over.entityProps?.find((p) => p.x === e.x && p.y === e.y);
      return patch ? { ...e, ...patch.props } : { ...e };
    }),
    shotHearts: new Set((over.shotHearts ?? []).map(([x, y]) => `${x},${y}`)),
  };
  merged.set(key, room);
  return room;
}

// The neighbor behind `side`, or null if there is no room there or the
// two rooms' doors don't line up.
export function neighborKey(key, side) {
  const parts = key.split(',');
  if (parts.length !== 2) return null; // test rooms have no neighbors
  const room = getRoom(key);
  if (room.exits[side] == null) return null;
  const { dx, dy, opposite } = SIDES[side];
  const nKey = `${Number(parts[0]) + dx},${Number(parts[1]) + dy}`;
  const neighbor = getRoom(nKey);
  if (!neighbor || neighbor.exits[opposite] == null) return null;
  return nKey;
}

export function mapKeys() {
  return Object.keys(ROOMS).filter((k) => !k.startsWith('test-'));
}

// --- Progress persistence -------------------------------------------

export function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && typeof stored === 'object') {
      return {
        current: typeof stored.current === 'string' && ROOMS[stored.current]
          ? stored.current
          : '0,9',
        muted: Boolean(stored.muted),
        theme: stored.theme === 'classic' ? 'classic' : 'modern',
        cleared: stored.cleared && typeof stored.cleared === 'object' ? stored.cleared : {},
        visited: stored.visited && typeof stored.visited === 'object' ? stored.visited : {},
      };
    }
  } catch {
    // Corrupt storage — start fresh.
  }
  return { current: '0,9', muted: false, theme: 'modern', cleared: {}, visited: {} };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable (private mode etc.) — play without persistence.
  }
}

// --- DEV validation ---------------------------------------------------

export function validateRooms() {
  const problems = [];
  for (const [key, base] of Object.entries(ROOMS)) {
    const where = `room ${key}`;
    if (base.terrain.length !== ROOM_H) {
      problems.push(`${where}: ${base.terrain.length} rows, expected ${ROOM_H}`);
    }
    base.terrain.forEach((row, y) => {
      if (row.length !== ROOM_W) {
        problems.push(`${where} row ${y}: ${row.length} cols, expected ${ROOM_W}`);
      }
      for (const ch of row) {
        if (!TILE_PROPS[ch]) problems.push(`${where} row ${y}: unknown tile '${ch}'`);
      }
    });
    let players = 0;
    let chests = 0;
    for (const e of base.entities) {
      if (!ENTITY_TYPES.includes(e.t)) problems.push(`${where}: unknown entity '${e.t}'`);
      if (e.x < 0 || e.x >= ROOM_W || e.y < 0 || e.y >= ROOM_H) {
        problems.push(`${where}: ${e.t} at ${e.x},${e.y} out of bounds`);
      } else if (!TILE_PROPS[base.terrain[e.y][e.x]]?.walk) {
        problems.push(`${where}: ${e.t} at ${e.x},${e.y} on unwalkable terrain`);
      }
      if (e.t === 'player') players++;
      if (e.t === 'chest') chests++;
    }
    if (players !== 1) problems.push(`${where}: ${players} player spawns`);
    if (chests !== 1) problems.push(`${where}: ${chests} chests`);
    for (const side of Object.keys(SIDES)) {
      const off = base.exits[side];
      if (off == null) continue;
      const horizontal = side === 'n' || side === 's';
      const max = horizontal ? ROOM_W : ROOM_H;
      if (off < 0 || off >= max) {
        problems.push(`${where}: ${side} exit offset ${off} out of range`);
        continue;
      }
      const nKey = neighborKey(key, side);
      if (nKey) {
        const other = getRoom(nKey).exits[SIDES[side].opposite];
        if (other !== off) {
          problems.push(`${where}: ${side} door at ${off} but ${nKey} has ${other}`);
        }
      }
    }
  }
  if (problems.length) {
    console.error(`validateRooms: ${problems.length} problem(s)\n` + problems.join('\n'));
  }
  return problems;
}
