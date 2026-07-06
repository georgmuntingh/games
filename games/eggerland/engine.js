// Room simulation for Eggerland: pure logic, no DOM or canvas. main.js
// drives tick() at a fixed timestep and routes the returned events to
// rendering, audio and UI. Positions are in tile units; every mover
// interpolates between integer tiles (x,y float → tx,ty target).

import { TILE_PROPS } from './tiles.js';
import { ROOM_W, ROOM_H } from './rooms.js';
import { ENEMY_DEFS, createEnemy } from './entities.js';

export const PLAYER_SPEED = 5.5; // tiles per second
const SAND_FACTOR = 0.5;
const SHOT_SPEED = 18;
const FIREBALL_SPEED = 7;
const EJECT_SPEED = 14;
const EGG_HATCH_S = 8;
const RAFT_SINK_S = 3.5;
const CONTACT_RADIUS = 0.55;

export const SIDE_DIRS = {
  n: [0, -1],
  s: [0, 1],
  e: [1, 0],
  w: [-1, 0],
};

function key(x, y) {
  return `${x},${y}`;
}

function makeMover(x, y) {
  return { x, y, tx: x, ty: y, dir: [0, 1] };
}

function moverIdle(m) {
  return m.x === m.tx && m.y === m.ty;
}

function startMove(m, dx, dy) {
  m.tx = m.tx + dx;
  m.ty = m.ty + dy;
  m.dir = [dx, dy];
}

// Advance toward the target tile; returns true on arrival (snaps exactly).
function advanceMover(m, dt, speed) {
  if (moverIdle(m)) return false;
  const step = speed * dt;
  const dx = m.tx - m.x;
  const dy = m.ty - m.y;
  const dist = Math.abs(dx) + Math.abs(dy);
  if (dist <= step) {
    m.x = m.tx;
    m.y = m.ty;
    return true;
  }
  m.x += Math.sign(dx) * step;
  m.y += Math.sign(dy) * step;
  return false;
}

function overlap(a, b, radius = CONTACT_RADIUS) {
  return Math.abs(a.x - b.x) < radius && Math.abs(a.y - b.y) < radius;
}

// --- State construction ----------------------------------------------

export function createRoomState(room, { inert = false } = {}) {
  const spawn = room.entities.find((e) => e.t === 'player');
  const chestDef = room.entities.find((e) => e.t === 'chest');
  const state = {
    room,
    inert,
    player: makeMover(spawn.x, spawn.y),
    hearts: new Set(),
    heartsTotal: 0,
    shots: 0,
    chest: { x: chestDef.x, y: chestDef.y, open: inert, taken: inert },
    blocks: [],
    enemies: [],
    projectiles: [],
    dead: false,
    deathReason: '',
    cleared: inert,
    exited: false,
    time: 0,
    events: [],
  };
  for (const e of room.entities) {
    if (e.t === 'heart' && !inert) {
      state.hearts.add(key(e.x, e.y));
      state.heartsTotal++;
    } else if (e.t === 'emerald') {
      state.blocks.push({ kind: 'emerald', mode: 'solid', ...makeMover(e.x, e.y) });
    } else if (ENEMY_DEFS[e.t] && !inert) {
      state.enemies.push(createEnemy(e));
    }
  }
  return state;
}

// Place the player just inside the door they entered through.
export function placeAtDoor(state, side) {
  const off = state.room.exits[side];
  if (off == null) return;
  const p = state.player;
  if (side === 'n') [p.x, p.y] = [off, 0];
  else if (side === 's') [p.x, p.y] = [off, ROOM_H - 1];
  else if (side === 'e') [p.x, p.y] = [ROOM_W - 1, off];
  else [p.x, p.y] = [0, off];
  p.tx = p.x;
  p.ty = p.y;
  p.dir = SIDE_DIRS[side].map((v) => -v);
}

// --- Grid queries ------------------------------------------------------

export function inBounds(x, y) {
  return x >= 0 && x < ROOM_W && y >= 0 && y < ROOM_H;
}

export function terrainProps(state, x, y) {
  if (!inBounds(x, y)) return null;
  return TILE_PROPS[state.room.terrain[y][x]];
}

export function blockAt(state, x, y) {
  return state.blocks.find(
    (b) => (b.tx === x && b.ty === y) || (Math.round(b.x) === x && Math.round(b.y) === y)
  );
}

export function enemyAt(state, x, y, except = null) {
  return state.enemies.find(
    (e) =>
      e !== except &&
      ((e.tx === x && e.ty === y) || (Math.round(e.x) === x && Math.round(e.y) === y))
  );
}

function arrowAllows(props, dx, dy) {
  if (!props.arrow) return true;
  return !(props.arrow[0] === -dx && props.arrow[1] === -dy);
}

// Terrain-only walkability for a step in direction (dx,dy).
function terrainWalkable(state, x, y, dx, dy, { isPlayer }) {
  const props = terrainProps(state, x, y);
  if (!props) return false;
  if (props.water) {
    // Only the player may board a raft floating on this tile.
    return Boolean(isPlayer && blockAt(state, x, y)?.mode === 'raft');
  }
  if (!props.walk) return false;
  return arrowAllows(props, dx, dy);
}

export function canPlayerWalk(state, x, y, dx, dy) {
  if (!terrainWalkable(state, x, y, dx, dy, { isPlayer: true })) return false;
  const b = blockAt(state, x, y);
  if (b && b.mode !== 'raft') return false;
  if (!state.chest.taken && state.chest.x === x && state.chest.y === y && !state.chest.open) {
    return false;
  }
  if (enemyAt(state, x, y)) return false;
  return true;
}

// Enemies never board rafts or leave the room; deadly enemies may enter
// the player's tile (that's how contact kills land), harmless ones bump.
export function canEnemyWalk(state, enemy, x, y, dx, dy) {
  if (!terrainWalkable(state, x, y, dx, dy, { isPlayer: false })) return false;
  if (blockAt(state, x, y)) return false;
  if (!state.chest.taken && state.chest.x === x && state.chest.y === y) return false;
  if (state.hearts.has(key(x, y))) return false;
  if (enemyAt(state, x, y, enemy)) return false;
  const def = ENEMY_DEFS[enemy.type];
  const deadly = def.deadlyContact || enemy.rolling;
  const touchesPlayer = state.player.tx === x && state.player.ty === y;
  if (touchesPlayer && !deadly && enemy.type !== 'leeper') return false;
  return true;
}

// Can a block be pushed onto (x,y)? Water and lava are valid targets —
// the block becomes a raft or is destroyed on arrival.
function blockCanEnter(state, x, y, dx, dy) {
  const props = terrainProps(state, x, y);
  if (!props) return false;
  if (!props.water && !props.lava) {
    if (!props.walk || !arrowAllows(props, dx, dy)) return false;
  }
  if (blockAt(state, x, y)) return false;
  if (enemyAt(state, x, y)) return false;
  if (state.hearts.has(key(x, y))) return false;
  if (!state.chest.taken && state.chest.x === x && state.chest.y === y) return false;
  return true;
}

// Axis-aligned line of sight between two tiles (exclusive), used by
// Medusa gazes, Gol/Alma triggers. Solid blocks and eggs are the
// player's cover; rafts sit low in the water and don't help.
export function hasLineOfSight(state, ax, ay, bx, by) {
  if (ax !== bx && ay !== by) return false;
  const dx = Math.sign(bx - ax);
  const dy = Math.sign(by - ay);
  let x = ax + dx;
  let y = ay + dy;
  while (x !== bx || y !== by) {
    if (terrainProps(state, x, y)?.blocksShot) return false;
    const b = blockAt(state, x, y);
    if (b && b.mode === 'solid') return false;
    x += dx;
    y += dy;
  }
  return true;
}

export function playerTile(state) {
  return [Math.round(state.player.x), Math.round(state.player.y)];
}

// --- Player actions ----------------------------------------------------

function emit(state, type, data = {}) {
  state.events.push({ type, ...data });
}

function die(state, reason) {
  if (state.dead) return;
  state.dead = true;
  state.deathReason = reason;
  emit(state, 'die', { reason });
}

function doorOpen(state) {
  return state.cleared || state.inert;
}

function tryMovePlayer(state, dx, dy) {
  const p = state.player;
  p.dir = [dx, dy]; // aim even when blocked
  const nx = p.tx + dx;
  const ny = p.ty + dy;

  if (!inBounds(nx, ny)) {
    if (!doorOpen(state)) return;
    const side = dy < 0 ? 'n' : dy > 0 ? 's' : dx > 0 ? 'e' : 'w';
    const off = state.room.exits[side];
    const aligned = side === 'n' || side === 's' ? p.tx === off : p.ty === off;
    if (off != null && aligned && !state.exited) {
      state.exited = true;
      emit(state, 'exit', { side });
    }
    return;
  }

  const block = blockAt(state, nx, ny);
  if (block && block.mode === 'solid') {
    const bx = nx + dx;
    const by = ny + dy;
    if (inBounds(bx, by) && blockCanEnter(state, bx, by, dx, dy)) {
      startMove(block, dx, dy);
      block.speed = moveSpeed(state, nx, ny);
      startMove(p, dx, dy);
      emit(state, 'push');
    }
    return;
  }

  if (canPlayerWalk(state, nx, ny, dx, dy)) {
    startMove(p, dx, dy);
    emit(state, 'step');
  }
}

function moveSpeed(state, x, y) {
  return terrainProps(state, x, y)?.sand ? PLAYER_SPEED * SAND_FACTOR : PLAYER_SPEED;
}

function fireShot(state) {
  if (state.dead || state.cleared) return;
  if (state.shots <= 0) {
    emit(state, 'dry-fire');
    return;
  }
  state.shots--;
  const p = state.player;
  state.projectiles.push({
    kind: 'shot',
    x: p.x + p.dir[0] * 0.5,
    y: p.y + p.dir[1] * 0.5,
    dir: [...p.dir],
  });
  emit(state, 'shot');
}

function onPlayerSettled(state) {
  const p = state.player;
  const k = key(p.tx, p.ty);
  if (state.hearts.has(k)) {
    state.hearts.delete(k);
    const bonus = state.room.shotHearts.has(k);
    if (bonus) state.shots += 2;
    emit(state, 'heart', { bonus });
    if (state.hearts.size === 0 && !state.chest.open) {
      state.chest.open = true;
      for (const e of state.enemies) e.alerted = true;
      emit(state, 'open');
    }
  }
  if (
    state.chest.open &&
    !state.chest.taken &&
    p.tx === state.chest.x &&
    p.ty === state.chest.y
  ) {
    state.chest.taken = true;
    state.cleared = true;
    // Taking the jewel banishes every enemy in the room.
    state.enemies = [];
    state.projectiles = [];
    emit(state, 'clear');
  }
}

// --- Blocks ------------------------------------------------------------

function updateBlocks(state, dt) {
  for (const b of [...state.blocks]) {
    if (!moverIdle(b)) {
      const speed = b.sliding ? EJECT_SPEED : (b.speed ?? PLAYER_SPEED);
      if (advanceMover(b, dt, speed)) onBlockSettled(state, b);
      continue;
    }
    if (b.kind === 'egg' && b.mode === 'solid') {
      b.hatchT -= dt;
      if (b.hatchT <= 0) {
        state.blocks.splice(state.blocks.indexOf(b), 1);
        if (!enemyAt(state, b.tx, b.ty) && !(state.player.tx === b.tx && state.player.ty === b.ty)) {
          state.enemies.push(createEnemy({ ...b.spawnDef, x: b.tx, y: b.ty }));
          emit(state, 'hatch');
        }
      }
    }
    if (b.kind === 'egg' && b.mode === 'raft') {
      b.sinkT -= dt;
      if (b.sinkT <= 0) {
        state.blocks.splice(state.blocks.indexOf(b), 1);
        emit(state, 'sink');
        const p = state.player;
        if (p.tx === b.tx && p.ty === b.ty && terrainProps(state, p.tx, p.ty)?.water) {
          die(state, 'drowned');
        }
      }
    }
  }
}

function onBlockSettled(state, b) {
  const props = terrainProps(state, b.tx, b.ty);
  if (props?.lava) {
    state.blocks.splice(state.blocks.indexOf(b), 1);
    emit(state, 'sizzle');
    return;
  }
  if (props?.water && b.mode !== 'raft') {
    b.mode = 'raft';
    b.sliding = false;
    if (b.kind === 'egg') b.sinkT = RAFT_SINK_S;
    emit(state, 'splash');
    return;
  }
  if (b.sliding) {
    const [dx, dy] = b.dir;
    const nx = b.tx + dx;
    const ny = b.ty + dy;
    if (inBounds(nx, ny) && blockCanEnter(state, nx, ny, dx, dy)) {
      startMove(b, dx, dy);
    } else {
      b.sliding = false;
    }
  }
}

// --- Projectiles ---------------------------------------------------------

function updateProjectiles(state, dt) {
  for (const pr of [...state.projectiles]) {
    const speed = pr.kind === 'shot' ? SHOT_SPEED : FIREBALL_SPEED;
    let remaining = speed * dt;
    let dead = false;
    while (remaining > 0 && !dead) {
      const step = Math.min(0.25, remaining);
      remaining -= step;
      pr.x += pr.dir[0] * step;
      pr.y += pr.dir[1] * step;
      dead = projectileCollide(state, pr);
    }
    if (dead) state.projectiles.splice(state.projectiles.indexOf(pr), 1);
  }
}

function projectileCollide(state, pr) {
  const tx = Math.round(pr.x);
  const ty = Math.round(pr.y);
  if (!inBounds(tx, ty)) return true;
  if (terrainProps(state, tx, ty)?.blocksShot) return true;
  const b = blockAt(state, tx, ty);
  if (b && b.mode === 'solid' && overlap(pr, b, 0.5)) {
    if (pr.kind === 'shot' && b.kind === 'egg') {
      b.sliding = true;
      b.dir = [...pr.dir];
      onBlockSettled(state, b); // kick off the slide from its current tile
      if (b.sliding || !moverIdle(b)) emit(state, 'eject');
    }
    return true;
  }
  if (pr.kind === 'shot') {
    for (const e of state.enemies) {
      if (!overlap(pr, e, 0.5)) continue;
      const def = ENEMY_DEFS[e.type];
      if (def.shootable) {
        state.enemies.splice(state.enemies.indexOf(e), 1);
        state.blocks.push({
          kind: 'egg',
          mode: 'solid',
          hatchT: EGG_HATCH_S,
          spawnDef: e.spawnDef,
          ...makeMover(Math.round(e.x), Math.round(e.y)),
        });
        emit(state, 'egg');
      }
      return true; // shots fizzle on unshootable enemies too
    }
  } else if (overlap(pr, state.player, 0.5)) {
    die(state, 'fireball');
    return true;
  }
  return false;
}

// --- Hazards -------------------------------------------------------------

function checkHazards(state) {
  const [px, py] = playerTile(state);
  for (const e of state.enemies) {
    const def = ENEMY_DEFS[e.type];
    if (e.type === 'leeper' && !e.asleep && overlap(state.player, e, 0.8)) {
      e.asleep = true;
      e.tx = Math.round(e.x);
      e.ty = Math.round(e.y);
      e.x = e.tx;
      e.y = e.ty;
      emit(state, 'sleep');
      continue;
    }
    if ((def.deadlyContact || e.rolling) && overlap(state.player, e)) {
      die(state, e.type);
      return;
    }
    if (def.gaze && !e.asleep) {
      const ex = Math.round(e.x);
      const ey = Math.round(e.y);
      if ((ex === px || ey === py) && hasLineOfSight(state, ex, ey, px, py)) {
        die(state, 'gaze');
        return;
      }
    }
  }
}

// --- Main tick -----------------------------------------------------------

// input: { dir: [dx,dy] | null, shoot: boolean }
// Returns the events that happened this tick.
export function tick(state, dt, input) {
  state.events = [];
  if (state.dead) return state.events;
  state.time += dt;

  const p = state.player;
  if (moverIdle(p) && input.dir && !state.exited) {
    tryMovePlayer(state, input.dir[0], input.dir[1]);
  }
  if (input.shoot) fireShot(state);

  if (!moverIdle(p)) {
    if (advanceMover(p, dt, moveSpeed(state, p.tx, p.ty))) {
      onPlayerSettled(state);
      // Chain immediately so held-direction walking has no hitch.
      if (moverIdle(p) && input.dir && !state.dead && !state.exited) {
        tryMovePlayer(state, input.dir[0], input.dir[1]);
      }
    }
  }

  for (const e of state.enemies) {
    ENEMY_DEFS[e.type].update(e, state, dt, api);
  }
  updateBlocks(state, dt);
  updateProjectiles(state, dt);
  if (!state.dead) checkHazards(state);

  return state.events;
}

// Helper surface handed to enemy update functions (entities.js stays
// import-free of the engine to avoid a module cycle).
const api = {
  canEnemyWalk,
  startMove,
  moverIdle,
  advanceMover,
  hasLineOfSight,
  playerTile,
  inBounds,
  emit,
};
