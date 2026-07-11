import {
  getRoom,
  neighborKey,
  mapKeys,
  loadProgress,
  saveProgress,
  validateRooms,
  SIDES,
  GRID_COLS,
  GRID_ROWS,
} from './overworld.js';
import { createRoomState, tick, placeAtDoor } from './engine.js';
import {
  PALETTES,
  BOARD_COLS,
  BOARD_ROWS,
  renderTerrain,
  drawHeart,
  drawKey,
  drawChest,
  drawBlock,
  drawPlayer,
  drawEnemy,
  drawProjectile,
  setRenderTheme,
  onAtlasReady,
} from './render.js';
import { audio } from './audio.js';
import { music } from './music.js';
import {
  createTouchControls,
  coarsePointer,
  enterPlayMode,
  exitPlayMode,
} from '../../shared/touch.js';

if (import.meta.env?.DEV) {
  validateRooms();
}

const TICK_S = 1 / 60;
const TILE_MIN = 14;
const TILE_MAX = 44;
const SWIPE_MIN_PX = 24;
const TRANSITION_MS = 300;
const CLEAR_OVERLAY_MS = 1300;

const KEY_DIRS = {
  arrowup: [0, -1],
  arrowdown: [0, 1],
  arrowleft: [-1, 0],
  arrowright: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
};

// The stick shares heldDirs with the keyboard; removal filters by array
// reference, so touch directions must always be these exact vectors.
const TOUCH_DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const TOUCH_DIR_VECS = new Set(Object.values(TOUCH_DIRS));

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const mainEl = document.querySelector('main');
const stageLabelEl = document.getElementById('stage-label');
const heartsEl = document.getElementById('hearts');
const shotsEl = document.getElementById('shots');
const clearedCountEl = document.getElementById('cleared-count');
const restartBtn = document.getElementById('restart');
const mapBtn = document.getElementById('map-btn');
const muteBtn = document.getElementById('mute');
const statusEl = document.getElementById('status');
const deathOverlay = document.getElementById('death-overlay');
const deathDetail = document.getElementById('death-detail');
const clearOverlay = document.getElementById('clear-overlay');
const mapOverlay = document.getElementById('map-overlay');
const mapGrid = document.getElementById('map-grid');
const mapClose = document.getElementById('map-close');
const playTouchBtn = document.getElementById('play-touch');
const fsExitBtn = document.getElementById('fs-exit');

const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const terrainCanvas = document.createElement('canvas');
const snapshotCanvas = document.createElement('canvas');

const DEATH_TEXT = {
  gaze: 'Petrified by a Medusa gaze.',
  'don-medusa': 'Caught by Don Medusa.',
  skull: 'The Skull got you.',
  alma: 'Flattened by a rolling Alma.',
  fireball: 'Scorched by a Gol fireball.',
  drowned: 'The egg sank beneath you.',
};

let progress = loadProgress();
let roomKey = progress.current;
let roomState = null;
let tile = 28;
let pixelRatio = 1;
let terrainDirty = true;
let lastDoorsOpen = null;
let heldDirs = [];
let tapDir = null;
let shootQueued = false;
let accumulator = 0;
let lastNow = performance.now();
let transition = null; // { side, start }
let clearTimer = null;
let touchStart = null;

// DEV shortcut: ?room=test-shots (or any room key) loads it directly.
if (import.meta.env?.DEV) {
  const wanted = new URLSearchParams(location.search).get('room');
  if (wanted && getRoom(wanted)) roomKey = wanted;
}

function doorsOpen() {
  return roomState.cleared || roomState.inert;
}

function loadRoom(key, { enteredFrom = null } = {}) {
  const room = getRoom(key);
  roomKey = key;
  const inert = Boolean(progress.cleared[key]);
  roomState = createRoomState(room, { inert });
  if (enteredFrom) placeAtDoor(roomState, enteredFrom);
  if (!key.startsWith('test-')) {
    progress.current = key;
    progress.visited[key] = true;
    saveProgress(progress);
  }
  heldDirs = heldDirs.slice(); // keep held keys across rooms
  tapDir = null;
  shootQueued = false;
  terrainDirty = true;
  deathOverlay.hidden = true;
  clearOverlay.hidden = true;
  updateSidebar();
}

function restartRoom() {
  transition = null;
  loadRoom(roomKey);
}

function updateSidebar() {
  const room = roomState.room;
  stageLabelEl.textContent = room.stage > 0 ? `Stage ${room.stage}` : roomKey;
  const got = roomState.heartsTotal - roomState.hearts.size;
  heartsEl.textContent = roomState.inert
    ? '—'
    : `${got} / ${roomState.heartsTotal}`;
  shotsEl.textContent = String(roomState.shots);
  const total = mapKeys().length;
  clearedCountEl.textContent = `${Object.keys(progress.cleared).length} / ${total}`;
}

function setStatus(text) {
  statusEl.textContent = text;
}

// --- Events from the engine ---------------------------------------------

const EVENT_SOUNDS = {
  step: 'step',
  key: 'bonus',
  push: 'push',
  shot: 'shot',
  'dry-fire': 'dryFire',
  egg: 'egg',
  hatch: 'hatch',
  eject: 'shot',
  splash: 'splash',
  sizzle: 'sizzle',
  sink: 'splash',
  open: 'open',
  roll: 'push',
  sleep: 'push',
};

function handleEvents(events) {
  for (const ev of events) {
    if (ev.type === 'heart') {
      audio.play(ev.bonus ? 'bonus' : 'heart');
      if (ev.bonus) setStatus('Magic shots +2!');
      updateSidebar();
    } else if (ev.type === 'open') {
      audio.play('open');
      setStatus('The treasure chest is open!');
    } else if (ev.type === 'clear') {
      onClear();
    } else if (ev.type === 'die') {
      onDeath(ev.reason);
    } else if (ev.type === 'exit') {
      onExit(ev.side);
    } else if (EVENT_SOUNDS[ev.type]) {
      audio.play(EVENT_SOUNDS[ev.type]);
    }
    if (ev.type === 'shot' || ev.type === 'dry-fire') updateSidebar();
  }
}

function onClear() {
  audio.play('clear');
  if (!roomKey.startsWith('test-')) {
    progress.cleared[roomKey] = true;
    saveProgress(progress);
  }
  terrainDirty = true;
  setStatus('The doors are open.');
  updateSidebar();
  clearOverlay.hidden = false;
  clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    clearOverlay.hidden = true;
  }, CLEAR_OVERLAY_MS);
}

function onDeath(reason) {
  audio.play('die');
  deathDetail.textContent = DEATH_TEXT[reason] ?? 'You were caught.';
  deathOverlay.hidden = false;
}

function onExit(side) {
  const nKey = neighborKey(roomKey, side);
  if (!nKey) {
    roomState.exited = false; // nothing beyond this door yet
    return;
  }
  audio.play('door');
  // Snapshot the outgoing frame so draw() can slide it away.
  snapshotCanvas.width = canvas.width;
  snapshotCanvas.height = canvas.height;
  snapshotCanvas.getContext('2d').drawImage(canvas, 0, 0);
  transition = { side, start: performance.now() };
  loadRoom(nKey, { enteredFrom: SIDES[side].opposite });
  setStatus('');
}

// --- Layout & drawing -----------------------------------------------------

function computeLayout() {
  const touchPlay = document.body.classList.contains('touch-play');
  const availW = touchPlay
    ? window.innerWidth - 16
    : Math.min(680, Math.max(260, mainEl.clientWidth - 32));
  const availH = touchPlay
    ? Math.max(200, Math.round(window.innerHeight * 0.72))
    : Math.max(280, window.innerHeight - 260);
  tile = Math.max(
    TILE_MIN,
    Math.min(TILE_MAX, Math.floor(Math.min(availW / BOARD_COLS, availH / BOARD_ROWS)))
  );
  const width = BOARD_COLS * tile;
  const height = BOARD_ROWS * tile;
  pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  terrainDirty = true;
}

function palette() {
  return darkScheme.matches ? PALETTES.dark : PALETTES.light;
}

function draw(now) {
  const pal = palette();
  ctx.imageSmoothingEnabled = false; // keep pixel-art tiles crisp when scaled
  const open = doorsOpen();
  if (terrainDirty || lastDoorsOpen !== open) {
    renderTerrain(terrainCanvas, roomState.room, Math.round(tile * pixelRatio), pal, open);
    terrainDirty = false;
    lastDoorsOpen = open;
  }

  const w = canvas.width / pixelRatio;
  const h = canvas.height / pixelRatio;

  let offX = 0;
  let offY = 0;
  if (transition) {
    const t = Math.min(1, (now - transition.start) / TRANSITION_MS);
    const ease = t * (2 - t);
    const { dx, dy } = SIDES[transition.side];
    offX = dx * w * (1 - ease);
    offY = dy * h * (1 - ease);
    ctx.drawImage(
      snapshotCanvas,
      0,
      0,
      snapshotCanvas.width,
      snapshotCanvas.height,
      offX - dx * w,
      offY - dy * h,
      w,
      h
    );
    if (t >= 1) transition = null;
  }

  ctx.save();
  ctx.translate(offX, offY);
  ctx.drawImage(terrainCanvas, 0, 0, terrainCanvas.width, terrainCanvas.height, 0, 0, w, h);

  const s = roomState;
  const time = s.time;
  for (const k of s.hearts) {
    const [x, y] = k.split(',').map(Number);
    drawHeart(ctx, x, y, tile, pal, s.room.shotHearts.has(k));
  }
  for (const k of s.keys) {
    const [x, y] = k.split(',').map(Number);
    drawKey(ctx, x, y, tile, pal);
  }
  drawChest(ctx, s.chest, tile, pal, time);
  for (const b of s.blocks) drawBlock(ctx, b, tile, pal);
  for (const e of s.enemies) {
    e.alertedNow = s.hearts.size === 0 && s.heartsTotal > 0;
    drawEnemy(ctx, e, tile, pal, time);
  }
  for (const pr of s.projectiles) drawProjectile(ctx, pr, tile, pal);
  if (!s.dead) drawPlayer(ctx, s.player, tile, pal);
  ctx.restore();
}

// --- Main loop --------------------------------------------------------------

function frame(now) {
  const dt = Math.min(0.25, (now - lastNow) / 1000);
  lastNow = now;
  if (!transition && deathOverlay.hidden && mapOverlay.hidden) {
    accumulator += dt;
    while (accumulator >= TICK_S) {
      accumulator -= TICK_S;
      const input = {
        dir: heldDirs[heldDirs.length - 1] ?? tapDir,
        shoot: shootQueued,
      };
      shootQueued = false;
      const events = tick(roomState, TICK_S, input);
      const p = roomState.player;
      if (tapDir && (p.x !== p.tx || p.y !== p.ty)) tapDir = null;
      handleEvents(events);
      if (roomState.dead || !deathOverlay.hidden) break;
    }
  }
  draw(now);
  requestAnimationFrame(frame);
}

// --- Map overlay --------------------------------------------------------------

function buildMapGrid() {
  mapGrid.innerHTML = '';
  mapGrid.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
  const known = new Set(mapKeys());
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const key = `${c},${r}`;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'map-cell';
      if (!known.has(key)) {
        cell.disabled = true;
        cell.classList.add('void');
      } else {
        const room = getRoom(key);
        cell.textContent = String(room.stage);
        const cleared = Boolean(progress.cleared[key]);
        const visited = Boolean(progress.visited[key]);
        const reachable =
          cleared ||
          visited ||
          Object.keys(SIDES).some((side) => {
            const nk = neighborKey(key, side);
            return nk && progress.cleared[nk];
          });
        cell.classList.toggle('cleared', cleared);
        cell.classList.toggle('visited', !cleared && visited);
        cell.classList.toggle('current', key === roomKey);
        if (!reachable) {
          cell.disabled = true;
        } else {
          cell.addEventListener('click', () => {
            mapOverlay.hidden = true;
            transition = null;
            loadRoom(key);
          });
        }
      }
      mapGrid.appendChild(cell);
    }
  }
}

function toggleMap(show = mapOverlay.hidden) {
  if (show) {
    buildMapGrid();
    mapOverlay.hidden = false;
  } else {
    mapOverlay.hidden = true;
  }
}

// --- Input ---------------------------------------------------------------------

function anyKeyRestart() {
  if (!deathOverlay.hidden) {
    restartRoom();
    return true;
  }
  return false;
}

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  music.start(); // first-gesture kick for autoplay-restricted browsers
  const k = event.key.toLowerCase();
  if (!deathOverlay.hidden) {
    event.preventDefault();
    anyKeyRestart();
    return;
  }
  if (k === 'escape') {
    event.preventDefault();
    toggleMap();
    return;
  }
  if (!mapOverlay.hidden) return;
  const dir = KEY_DIRS[k];
  if (dir) {
    event.preventDefault();
    if (!event.repeat && !heldDirs.includes(dir)) heldDirs.push(dir);
    return;
  }
  if (k === ' ' || k === 'x') {
    event.preventDefault();
    if (!event.repeat) shootQueued = true;
  } else if (k === 'r') {
    event.preventDefault();
    restartRoom();
  } else if (k === 'm') {
    event.preventDefault();
    toggleMute();
  }
});

window.addEventListener('keyup', (event) => {
  const dir = KEY_DIRS[event.key.toLowerCase()];
  if (dir) heldDirs = heldDirs.filter((d) => d !== dir);
});

window.addEventListener('blur', () => {
  heldDirs = [];
});

canvas.addEventListener(
  'touchstart',
  (event) => {
    music.start();
    if (document.body.classList.contains('touch-play')) return;
    if (anyKeyRestart()) return;
    if (event.touches.length !== 1) return;
    event.preventDefault();
    const t = event.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  },
  { passive: false }
);

canvas.addEventListener(
  'touchend',
  (event) => {
    if (!touchStart) return;
    event.preventDefault();
    const t = event.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;
    tapDir =
      Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
  },
  { passive: false }
);

canvas.addEventListener('touchcancel', () => {
  touchStart = null;
});

canvas.addEventListener('pointerdown', () => {
  music.start();
  anyKeyRestart();
});

deathOverlay.addEventListener('pointerdown', anyKeyRestart);

restartBtn.addEventListener('click', restartRoom);
mapBtn.addEventListener('click', () => toggleMap());
mapClose.addEventListener('click', () => toggleMap(false));

function updateMuteButton() {
  muteBtn.textContent = audio.muted ? 'Sound: off' : 'Sound: on';
  muteBtn.setAttribute('aria-pressed', String(audio.muted));
}

function toggleMute() {
  audio.setMuted(!audio.muted);
  music.setMuted(audio.muted);
  progress.muted = audio.muted;
  saveProgress(progress);
  updateMuteButton();
}

muteBtn.addEventListener('click', toggleMute);

const tilesBtn = document.getElementById('tiles');
function updateTilesButton() {
  const classic = progress.theme === 'classic';
  tilesBtn.textContent = classic ? 'Tiles: Classic' : 'Tiles: Modern';
  tilesBtn.setAttribute('aria-pressed', String(classic));
}
function toggleTheme() {
  progress.theme = progress.theme === 'classic' ? 'modern' : 'classic';
  setRenderTheme(progress.theme);
  saveProgress(progress);
  terrainDirty = true;
  updateTilesButton();
}
tilesBtn.addEventListener('click', toggleTheme);
// Classic sprites arrive asynchronously; repaint the terrain once ready.
onAtlasReady(() => {
  terrainDirty = true;
});

// Fullscreen touch play: the joystick feeds the same heldDirs model as
// the keyboard.
const touch = createTouchControls({
  container: document.querySelector('.board-wrap'),
  actions: [
    { id: 'shoot', label: '✷', ariaLabel: 'fire magic shot' },
    { id: 'restart', label: '⟲', ariaLabel: 'restart room' },
    { id: 'map', label: '▦', ariaLabel: 'open map' },
  ],
  onDirection(_playerId, dirName) {
    music.start();
    heldDirs = heldDirs.filter((d) => !TOUCH_DIR_VECS.has(d));
    if (!dirName) return;
    heldDirs.push(TOUCH_DIRS[dirName]);
  },
  onAction(_playerId, actionId) {
    music.start();
    if (anyKeyRestart()) return;
    if (actionId === 'shoot') shootQueued = true;
    else if (actionId === 'restart') restartRoom();
    else toggleMap();
  },
});

function enterTouchMode() {
  enterPlayMode();
  fsExitBtn.hidden = false;
  touch.show('solo');
  computeLayout();
}

function exitTouchMode() {
  touch.hide();
  exitPlayMode();
  fsExitBtn.hidden = true;
  computeLayout();
}

playTouchBtn.addEventListener('click', enterTouchMode);
fsExitBtn.addEventListener('click', exitTouchMode);
playTouchBtn.hidden = !coarsePointer.matches;

window.addEventListener('resize', computeLayout);
window.visualViewport?.addEventListener('resize', computeLayout);
document.addEventListener('fullscreenchange', computeLayout);
darkScheme.addEventListener('change', () => {
  terrainDirty = true;
});

// --- Boot -----------------------------------------------------------------------

audio.setMuted(progress.muted);
music.setMuted(progress.muted);
updateMuteButton();
setRenderTheme(progress.theme);
updateTilesButton();
loadRoom(roomKey);
computeLayout();
requestAnimationFrame(frame);
