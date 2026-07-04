// Roblox-style touch controls shared by the games: a dynamic thumbstick (the
// base spawns where the thumb lands inside its zone) plus floating action
// buttons, overlaid on the play area. A game creates an instance with
// createTouchControls, shows/hides it around its play session, and receives
// input through the onDirection/onAction callbacks. The `actions` array order
// is a contract: it is the DOM order inside each cluster, which the flex
// layouts (including row-reverse mirrors) depend on.
import './touch.css';

export const coarsePointer = window.matchMedia('(any-pointer: coarse)');

// Fullscreen play mode: the game's own CSS uses body.touch-play to let the
// board take over the viewport; real fullscreen is best-effort on top.
export function enterPlayMode() {
  document.body.classList.add('touch-play');
  try {
    document.documentElement.requestFullscreen?.()?.catch?.(() => {});
  } catch {
    // Fullscreen API unavailable (iOS Safari) — the CSS takeover suffices.
  }
}

export function exitPlayMode() {
  document.body.classList.remove('touch-play');
  if (document.fullscreenElement) {
    document.exitFullscreen?.()?.catch?.(() => {});
  }
}

export function createTouchControls({
  container,
  onDirection = () => {},
  onAction = () => {},
  actions = [],
  stickRadius = 48, // knob travel from the anchor, in px
  deadFraction = 0.3, // no direction inside this fraction of the radius
  axisSwitch = 1.3, // other axis must beat current by this factor
  idleFadeMs = 2500,
} = {}) {
  let root = null;
  let mode = null;
  let lefty = false;
  let idleTimer = null;
  let sticks = [];

  function show(newMode = 'solo', players = [0]) {
    hide();
    mode = newMode;

    root = document.createElement('div');
    root.className = `touch-root mode-${mode}`;
    root.classList.toggle('lefty', lefty);

    for (const id of players) {
      root.appendChild(buildStickZone(id));
      root.appendChild(buildActionCluster(id));
    }

    root.addEventListener('pointerdown', poke, true);
    root.addEventListener('pointermove', poke, true);
    poke();
    container.appendChild(root);
  }

  function hide() {
    clearTimeout(idleTimer);
    for (const stick of sticks) {
      if (stick.curDir !== null) onDirection(stick.playerId, null);
    }
    sticks = [];
    root?.remove();
    root = null;
    mode = null;
  }

  function setLefty(value) {
    lefty = Boolean(value);
    root?.classList.toggle('lefty', lefty);
  }

  function setActionVisible(playerId, actionId, visible) {
    const btn = root?.querySelector(
      `.action-cluster[data-player="${playerId}"] [data-action="${actionId}"]`
    );
    if (btn) btn.hidden = !visible;
  }

  function poke() {
    if (!root) return;
    root.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => root?.classList.add('idle'), idleFadeMs);
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
      onDirection(playerId, dir);
    };

    zone.addEventListener('pointerdown', (event) => {
      if (stick.pointerId !== null) return;
      event.preventDefault();
      stick.pointerId = event.pointerId;
      zone.setPointerCapture(event.pointerId);
      const rect = zone.getBoundingClientRect();
      const margin = stickRadius * 0.8;
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
      if (r > stickRadius) {
        dx = (dx / r) * stickRadius;
        dy = (dy / r) * stickRadius;
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
    if (r < stickRadius * deadFraction) return null;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    let axis;
    if (curDir === 'left' || curDir === 'right') {
      axis = ay > ax * axisSwitch ? 'y' : 'x';
    } else if (curDir === 'up' || curDir === 'down') {
      axis = ax > ay * axisSwitch ? 'x' : 'y';
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

    for (const action of actions) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'touch-action';
      btn.dataset.action = action.id;
      btn.textContent = action.label;
      btn.setAttribute('aria-label', `Player ${playerId + 1} ${action.ariaLabel ?? action.id}`);
      btn.hidden = Boolean(action.hidden);
      // pointerdown (not click) for zero-latency response mid-game.
      btn.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        onAction(playerId, action.id);
      });
      cluster.appendChild(btn);
    }

    return cluster;
  }

  return {
    show,
    hide,
    setLefty,
    setActionVisible,
    get active() {
      return mode !== null;
    },
  };
}
