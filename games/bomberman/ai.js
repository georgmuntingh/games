// Enemy brains. Decisions are made only at tile boundaries: main.js calls
// chooseEnemyDir(enemy, world) when an enemy finishes its movement tween,
// and the returned direction (or null to idle) becomes the next step.
//
// world: { grid, cols, rows, bombs, flames, players, dangerSet }
//   dangerSet — Set of "x,y" cells covered by predicted bomb blasts and
//   live flames, from computeDangerTiles().

import { T_EMPTY, cellKey } from './levels.js';

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function passable(world, x, y) {
  if (x < 0 || y < 0 || x >= world.cols || y >= world.rows) return false;
  if (world.grid[y][x] !== T_EMPTY) return false;
  return !world.bombs.some((b) => b.x === x && b.y === y);
}

function occupiedTile(entity) {
  return [Math.round(entity.rx), Math.round(entity.ry)];
}

function randomDir(world, enemy, avoidReverse) {
  const [x, y] = [enemy.x, enemy.y];
  const options = DIRS.filter(([dx, dy]) => passable(world, x + dx, y + dy));
  if (!options.length) return null;
  if (avoidReverse && options.length > 1 && enemy.dir) {
    const filtered = options.filter(
      ([dx, dy]) => !(dx === -enemy.dir[0] && dy === -enemy.dir[1])
    );
    if (filtered.length) return pick(filtered);
  }
  return pick(options);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Straight-line sight down a row or column: returns the direction toward a
// living player if nothing solid is in the way, else null.
function lineOfSight(world, enemy) {
  for (const player of world.players) {
    if (!player.alive) continue;
    const [px, py] = occupiedTile(player);
    if (px !== enemy.x && py !== enemy.y) continue;
    const dx = Math.sign(px - enemy.x);
    const dy = Math.sign(py - enemy.y);
    if (dx === 0 && dy === 0) continue;
    let clear = true;
    let x = enemy.x + dx;
    let y = enemy.y + dy;
    while (x !== px || y !== py) {
      if (!passable(world, x, y)) {
        clear = false;
        break;
      }
      x += dx;
      y += dy;
    }
    if (clear) return [dx, dy];
  }
  return null;
}

// BFS over passable tiles; returns the first step direction of the shortest
// path from (sx,sy) to any goal cell, or null. `avoid` cells are walls.
function bfsStep(world, sx, sy, isGoal, avoid) {
  const startKey = cellKey(sx, sy);
  const prev = new Map([[startKey, null]]);
  const queue = [[sx, sy]];
  let found = null;
  while (queue.length && !found) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      const k = cellKey(nx, ny);
      if (prev.has(k) || !passable(world, nx, ny)) continue;
      if (avoid && avoid.has(k) && !isGoal(nx, ny)) continue;
      prev.set(k, cellKey(x, y));
      if (isGoal(nx, ny)) {
        found = k;
        break;
      }
      queue.push([nx, ny]);
    }
  }
  if (!found) return null;
  let k = found;
  while (prev.get(k) !== startKey) k = prev.get(k);
  const [tx, ty] = k.split(',').map(Number);
  return [tx - sx, ty - sy];
}

function thinkWanderer(enemy, world) {
  const { dir } = enemy;
  if (dir && Math.random() < 0.8 && passable(world, enemy.x + dir[0], enemy.y + dir[1])) {
    return dir;
  }
  return randomDir(world, enemy, true);
}

function thinkChaser(enemy, world) {
  const sight = lineOfSight(world, enemy);
  enemy.seesPlayer = Boolean(sight);
  if (sight && passable(world, enemy.x + sight[0], enemy.y + sight[1])) return sight;
  return thinkWanderer(enemy, world);
}

function thinkSmart(enemy, world) {
  const { dangerSet } = world;
  const here = cellKey(enemy.x, enemy.y);

  // Standing in a blast zone: flee to the nearest safe tile, ignoring players.
  if (dangerSet.has(here)) {
    const step = bfsStep(
      world,
      enemy.x,
      enemy.y,
      (x, y) => !dangerSet.has(cellKey(x, y)),
      null
    );
    if (step) return step;
  }

  const targets = new Set();
  for (const player of world.players) {
    if (!player.alive) continue;
    const [px, py] = occupiedTile(player);
    targets.add(cellKey(px, py));
  }
  if (targets.size) {
    const isGoal = (x, y) => targets.has(cellKey(x, y));
    const step = bfsStep(world, enemy.x, enemy.y, isGoal, dangerSet);
    if (step && !dangerSet.has(cellKey(enemy.x + step[0], enemy.y + step[1]))) {
      return step;
    }
  }

  // No safe path to a player: wander, but never step into danger voluntarily.
  const options = DIRS.filter(
    ([dx, dy]) =>
      passable(world, enemy.x + dx, enemy.y + dy) &&
      !dangerSet.has(cellKey(enemy.x + dx, enemy.y + dy))
  );
  if (options.length) return pick(options);
  return null;
}

const BRAINS = {
  wanderer: thinkWanderer,
  chaser: thinkChaser,
  smart: thinkSmart,
};

export function chooseEnemyDir(enemy, world) {
  return BRAINS[enemy.type](enemy, world) || null;
}

// Cells threatened right now: every live flame cell plus the predicted blast
// footprint of every placed bomb (rays stop at the first non-empty tile).
export function computeDangerTiles(world) {
  const danger = new Set();
  for (const flame of world.flames) danger.add(cellKey(flame.x, flame.y));
  for (const bomb of world.bombs) {
    danger.add(cellKey(bomb.x, bomb.y));
    for (const [dx, dy] of DIRS) {
      for (let i = 1; i <= bomb.range; i++) {
        const x = bomb.x + dx * i;
        const y = bomb.y + dy * i;
        if (x < 0 || y < 0 || x >= world.cols || y >= world.rows) break;
        if (world.grid[y][x] !== T_EMPTY) break;
        danger.add(cellKey(x, y));
      }
    }
  }
  return danger;
}
