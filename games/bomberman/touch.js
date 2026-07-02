// Roblox-style touch controls: a dynamic thumbstick (the base spawns where
// the thumb lands inside its zone) plus floating action buttons, overlaid on
// the play area. This module owns all touch DOM; main.js talks to it through
// initTouch / setTouchMode / setRemote / setLefty and receives input through
// the callbacks passed to initTouch.

const STICK_RADIUS = 48; // knob travel from the anchor, in px
const DEAD_FRACTION = 0.3; // no direction inside this fraction of the radius
const AXIS_SWITCH = 1.3; // other axis must beat current by this factor
const IDLE_FADE_MS = 2500;

let callbacks = null;
let root = null;
let mode = null;
let lefty = false;
let idleTimer = null;
let sticks = [];

export function initTouch(cb) {
  callbacks = cb;
}

export function setLefty(value) {
  lefty = Boolean(value);
  root?.classList.toggle('lefty', lefty);
}

export function setRemote(playerId, on) {
  const btn = root?.querySelector(`.action-cluster[data-player="${playerId}"] .btn-detonate`);
  if (btn) btn.hidden = !on;
}

export function setTouchMode(newMode) {
  if (newMode === mode) return;
  teardown();
  mode = newMode;
  if (!mode) return;

  root = document.createElement('div');
  root.id = 'touch-root';
  root.className = `mode-${mode}`;
  root.classList.toggle('lefty', lefty);

  const playerIds = mode === 'battle' ? [0, 1] : [0];
  for (const id of playerIds) {
    root.appendChild(buildStickZone(id));
    root.appendChild(buildActionCluster(id));
  }

  root.addEventListener('pointerdown', poke, true);
  root.addEventListener('pointermove', poke, true);
  poke();
  document.querySelector('.board-wrap').appendChild(root);
}

function teardown() {
  clearTimeout(idleTimer);
  for (const stick of sticks) {
    if (stick.curDir !== null) callbacks.setHeld(stick.playerId, null);
  }
  sticks = [];
  root?.remove();
  root = null;
  mode = null;
}

function poke() {
  if (!root) return;
  root.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => root?.classList.add('idle'), IDLE_FADE_MS);
}

function buildStickZone(playerId) {
  const zone = document.createElement('div');
  zone.className = 'stick-zone';
  zone.dataset.player = playerId;
  const base = document.createElement('div');
  base.className = 'stick-base';
  const knob = document.createElement('div');
  knob.className = 'stick-knob';
  base.appendChild(knob);
  zone.appendChild(base);
  attachStick(zone, base, knob, playerId);
  return zone;
}

function attachStick(zone, base, knob, playerId) {
  const stick = { playerId, pointerId: null, anchorX: 0, anchorY: 0, curDir: null };
  sticks.push(stick);

  const emit = (dir) => {
    if (dir === stick.curDir) return;
    stick.curDir = dir;
    callbacks.setHeld(playerId, dir ? `stick-${dir}` : null);
  };

  zone.addEventListener('pointerdown', (event) => {
    if (stick.pointerId !== null) return;
    event.preventDefault();
    stick.pointerId = event.pointerId;
    zone.setPointerCapture(event.pointerId);
    const rect = zone.getBoundingClientRect();
    const margin = STICK_RADIUS * 0.8;
    stick.anchorX = Math.min(Math.max(event.clientX, rect.left + margin), rect.right - margin);
    stick.anchorY = Math.min(Math.max(event.clientY, rect.top + margin), rect.bottom - margin);
    base.style.left = `${stick.anchorX - rect.left}px`;
    base.style.top = `${stick.anchorY - rect.top}px`;
    base.classList.add('active');
    moveKnob(event);
  });

  function moveKnob(event) {
    let dx = event.clientX - stick.anchorX;
    let dy = event.clientY - stick.anchorY;
    const r = Math.hypot(dx, dy);
    if (r > STICK_RADIUS) {
      dx = (dx / r) * STICK_RADIUS;
      dy = (dy / r) * STICK_RADIUS;
    }
    knob.style.transform = `translate(calc(${dx}px - 50%), calc(${dy}px - 50%))`;
    emit(mapDirection(dx, dy, r, stick.curDir));
  }

  zone.addEventListener('pointermove', (event) => {
    if (event.pointerId !== stick.pointerId) return;
    event.preventDefault();
    moveKnob(event);
  });

  const release = (event) => {
    if (event.pointerId !== stick.pointerId) return;
    stick.pointerId = null;
    base.classList.remove('active');
    knob.style.transform = 'translate(-50%, -50%)';
    emit(null);
  };
  zone.addEventListener('pointerup', release);
  zone.addEventListener('pointercancel', release);
}

// Dominant-axis mapping with a dead zone and hysteresis: the current axis is
// kept until the other axis clearly wins, so the direction doesn't flicker
// when the thumb sits near a diagonal.
function mapDirection(dx, dy, r, curDir) {
  if (r < STICK_RADIUS * DEAD_FRACTION) return null;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  let axis;
  if (curDir === 'left' || curDir === 'right') {
    axis = ay > ax * AXIS_SWITCH ? 'y' : 'x';
  } else if (curDir === 'up' || curDir === 'down') {
    axis = ax > ay * AXIS_SWITCH ? 'x' : 'y';
  } else {
    axis = ax >= ay ? 'x' : 'y';
  }
  if (axis === 'x') return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

function buildActionCluster(playerId) {
  const cluster = document.createElement('div');
  cluster.className = 'action-cluster';
  cluster.dataset.player = playerId;

  const detonate = document.createElement('button');
  detonate.type = 'button';
  detonate.className = 'touch-action btn-detonate';
  detonate.textContent = '⚡';
  detonate.setAttribute('aria-label', `Player ${playerId + 1} detonate`);
  detonate.hidden = true;

  const bomb = document.createElement('button');
  bomb.type = 'button';
  bomb.className = 'touch-action btn-bomb';
  bomb.textContent = '💣';
  bomb.setAttribute('aria-label', `Player ${playerId + 1} drop bomb`);

  // pointerdown (not click) for zero-latency response mid-game.
  bomb.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    callbacks.onBomb(playerId);
  });
  detonate.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    callbacks.onDetonate(playerId);
  });

  cluster.appendChild(detonate);
  cluster.appendChild(bomb);
  return cluster;
}
