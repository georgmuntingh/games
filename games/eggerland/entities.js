// Enemy behaviours. Each def gets update(enemy, state, dt, api) where
// api is the helper surface from engine.js (kept parameter-passed so
// this module has no engine import cycle). Enemies are movers like the
// player: float x,y sliding toward integer tx,ty.

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function createEnemy(e) {
  return {
    type: e.t,
    x: e.x,
    y: e.y,
    tx: e.x,
    ty: e.y,
    dir: e.dir ? [...e.dir] : [0, 1],
    axis: e.axis ?? 'h',
    axisSign: 1,
    asleep: false,
    rolling: false,
    alerted: false, // set when the chest opens
    waitT: 0,
    cooldown: 0,
    spawnDef: { ...e },
  };
}

function idle(api, e) {
  return api.moverIdle(e);
}

function tryStep(api, state, e, dx, dy) {
  if (!api.canEnemyWalk(state, e, e.tx + dx, e.ty + dy, dx, dy)) return false;
  api.startMove(e, dx, dy);
  return true;
}

// Step greedily toward the player: preferred axis first, then the other.
function chaseStep(api, state, e) {
  const [px, py] = api.playerTile(state);
  const dx = Math.sign(px - e.tx);
  const dy = Math.sign(py - e.ty);
  const tries = [];
  if (Math.abs(px - e.tx) >= Math.abs(py - e.ty)) {
    if (dx) tries.push([dx, 0]);
    if (dy) tries.push([0, dy]);
  } else {
    if (dy) tries.push([0, dy]);
    if (dx) tries.push([dx, 0]);
  }
  for (const [mx, my] of tries) {
    if (tryStep(api, state, e, mx, my)) return true;
  }
  return false;
}

export const ENEMY_DEFS = {
  // Harmless coiled snake; a living wall until you egg it.
  snakey: {
    speed: 0,
    deadlyContact: false,
    shootable: true,
    update() {},
  },

  // Wanders aimlessly; falls asleep the moment it touches you and
  // becomes a permanent obstacle.
  leeper: {
    speed: 2.2,
    deadlyContact: false,
    shootable: false,
    update(e, state, dt, api) {
      if (e.asleep) return;
      if (!idle(api, e)) {
        api.advanceMover(e, dt, this.speed);
        return;
      }
      e.waitT -= dt;
      if (e.waitT > 0) return;
      const dirs = [...DIRS].sort(() => Math.random() - 0.5);
      for (const [dx, dy] of dirs) {
        if (tryStep(api, state, e, dx, dy)) break;
      }
      e.waitT = 0.25;
    },
  },

  // Static; its gaze (handled by the engine) kills along clear rows
  // and columns. Cannot be shot — only avoided or blocked.
  medusa: {
    speed: 0,
    deadlyContact: true,
    shootable: false,
    gaze: true,
    update() {},
  },

  // A Medusa on the move: patrols its line, reversing at obstacles.
  'don-medusa': {
    speed: 2.4,
    deadlyContact: true,
    shootable: false,
    gaze: true,
    update(e, state, dt, api) {
      if (!idle(api, e)) {
        api.advanceMover(e, dt, this.speed);
        return;
      }
      const dir = e.axis === 'h' ? [e.axisSign, 0] : [0, e.axisSign];
      if (!tryStep(api, state, e, dir[0], dir[1])) {
        e.axisSign = -e.axisSign;
      }
    },
  },

  // Stone idol; wakes when the last heart is taken and spits fireballs
  // along its facing direction.
  gol: {
    speed: 0,
    deadlyContact: false,
    shootable: false,
    fireCooldown: 2.5,
    update(e, state, dt, api) {
      if (state.hearts.size > 0) return;
      e.cooldown -= dt;
      if (e.cooldown > 0) return;
      e.cooldown = this.fireCooldown;
      state.projectiles.push({
        kind: 'fireball',
        x: e.x + e.dir[0] * 0.6,
        y: e.y + e.dir[1] * 0.6,
        dir: [...e.dir],
      });
      api.emit(state, 'fireball');
    },
  },

  // Dormant until the last heart is taken, then it hunts you down.
  skull: {
    speed: 3.0,
    deadlyContact: true,
    shootable: false,
    update(e, state, dt, api) {
      if (state.hearts.size > 0) return;
      if (!idle(api, e)) {
        api.advanceMover(e, dt, this.speed);
        return;
      }
      e.waitT -= dt;
      if (e.waitT > 0) return;
      if (!chaseStep(api, state, e)) e.waitT = 0.3;
    },
  },

  // Lumbering boulder; shoulders toward you whenever you share its row
  // or column. Blocks you but never hurts you.
  rocky: {
    speed: 3.4,
    deadlyContact: false,
    shootable: true,
    update(e, state, dt, api) {
      if (!idle(api, e)) {
        api.advanceMover(e, dt, this.speed);
        return;
      }
      const [px, py] = api.playerTile(state);
      if (px !== e.tx && py !== e.ty) return;
      chaseStep(api, state, e);
    },
  },

  // Curls up and rolls at you the moment it sees you down a clear row
  // or column; deadly only while rolling.
  alma: {
    speed: 8,
    deadlyContact: false,
    shootable: true,
    update(e, state, dt, api) {
      if (!idle(api, e)) {
        api.advanceMover(e, dt, this.speed);
        return;
      }
      if (e.rolling) {
        if (!tryStep(api, state, e, e.dir[0], e.dir[1])) {
          e.rolling = false;
          e.waitT = 1.2;
        }
        return;
      }
      e.waitT -= dt;
      if (e.waitT > 0) return;
      const [px, py] = api.playerTile(state);
      if (px !== e.tx && py !== e.ty) return;
      if (!api.hasLineOfSight(state, e.tx, e.ty, px, py)) return;
      const dx = Math.sign(px - e.tx);
      const dy = Math.sign(py - e.ty);
      if (tryStep(api, state, e, dx, dy)) {
        e.rolling = true;
        e.dir = [dx, dy];
        api.emit(state, 'roll');
      }
    },
  },
};
