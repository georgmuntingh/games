import { LEVELS, LEVEL_SET, validateLevels } from './levels.js';
import { audio } from './audio.js';

if (import.meta.env?.DEV) {
  validateLevels(LEVELS);
}

const TILE_MIN = 14;
const TILE_MAX = 52;
const PAD = 8;
const MOVE_MS = 90;
const SOLVED_OVERLAY_MS = 1400;
const SWIPE_MIN_PX = 24;
const STORAGE_KEY = 'sokoban-v1';

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

const PALETTES = {
  light: {
    bg: '#e7e0d4',
    floorA: '#f3eee3',
    floorB: '#ece6d8',
    wall: '#b06a42',
    wallMortar: '#8a4f2e',
    wallTop: 'rgba(255, 255, 255, 0.28)',
    goal: '#b9ad97',
    goalRing: '#7d735f',
    box: '#c98c4b',
    boxEdge: '#8a5a2b',
    boxLine: '#a06c35',
    boxGoal: '#86b05f',
    boxGoalEdge: '#55793a',
    boxGoalLine: '#6c9449',
    nail: 'rgba(0, 0, 0, 0.35)',
    playerBody: '#2563eb',
    playerHead: '#f0c8a0',
    playerCap: '#dc2626',
    deadlock: '#dc2626',
  },
  dark: {
    bg: '#0b0d12',
    floorA: '#1d222c',
    floorB: '#191e27',
    wall: '#7c4a2d',
    wallMortar: '#5a3520',
    wallTop: 'rgba(255, 255, 255, 0.12)',
    goal: '#3f4756',
    goalRing: '#94a3b8',
    box: '#b07a3e',
    boxEdge: '#7a5025',
    boxLine: '#946332',
    boxGoal: '#6a9955',
    boxGoalEdge: '#436236',
    boxGoalLine: '#578047',
    nail: 'rgba(0, 0, 0, 0.45)',
    playerBody: '#60a5fa',
    playerHead: '#e8b88a',
    playerCap: '#ef4444',
    deadlock: '#f87171',
  },
};

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const mainEl = document.querySelector('main');
const levelLabelEl = document.getElementById('level-label');
const movesEl = document.getElementById('moves');
const pushesEl = document.getElementById('pushes');
const bestEl = document.getElementById('best');
const undoBtn = document.getElementById('undo');
const restartBtn = document.getElementById('restart');
const levelsBtn = document.getElementById('levels');
const muteBtn = document.getElementById('mute');
const statusEl = document.getElementById('status');
const solvedOverlay = document.getElementById('solved-overlay');
const solvedTitle = document.getElementById('solved-title');
const solvedDetail = document.getElementById('solved-detail');
const levelOverlay = document.getElementById('level-overlay');
const levelGrid = document.getElementById('level-grid');
const levelClose = document.getElementById('level-close');

const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');

const state = {
  levelIndex: 0,
  level: null,
  boxes: new Set(),
  player: { x: 0, y: 0 },
  facing: [0, 1],
  moves: 0,
  pushes: 0,
  undoStack: [],
  status: 'playing', // 'playing' | 'solving'
  anim: null, // { start, dx, dy, fromPlayer, boxFrom }
  inputQueue: [],
  heldDirs: [],
  deadlockCell: null,
  tile: 32,
  pixelRatio: 1,
  rafId: null,
  advanceTimer: null,
};

let progress = loadProgress();
let touchStart = null;

function key(x, y) {
  return `${x},${y}`;
}

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && typeof stored === 'object') {
      return {
        current: Number.isInteger(stored.current) ? stored.current : 0,
        muted: Boolean(stored.muted),
        solved: stored.solved && typeof stored.solved === 'object' ? stored.solved : {},
      };
    }
  } catch {
    // Corrupt storage — start fresh.
  }
  return { current: 0, muted: false, solved: {} };
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage unavailable (private mode etc.) — play without persistence.
  }
}

function palette() {
  return darkScheme.matches ? PALETTES.dark : PALETTES.light;
}

function loadLevel(index) {
  clearTimeout(state.advanceTimer);
  state.advanceTimer = null;
  state.levelIndex = index;
  state.level = LEVELS[index];
  state.boxes = new Set(state.level.boxes);
  state.player = { ...state.level.player };
  state.facing = [0, 1];
  state.moves = 0;
  state.pushes = 0;
  state.undoStack = [];
  state.status = 'playing';
  state.anim = null;
  state.inputQueue = [];
  state.deadlockCell = null;
  progress.current = index;
  saveProgress();
  solvedOverlay.hidden = true;
  levelOverlay.hidden = true;
  setStatus('');
  updateHeader();
  updateCounters();
  computeLayout();
  draw();
}

function restart() {
  if (state.status !== 'playing') return;
  loadLevel(state.levelIndex);
}

function tryMove(dx, dy) {
  if (state.status !== 'playing') return;
  const { player, level } = state;
  const nx = player.x + dx;
  const ny = player.y + dy;
  const nextKey = key(nx, ny);
  if (level.walls.has(nextKey)) return;
  let pushed = false;
  if (state.boxes.has(nextKey)) {
    const beyondKey = key(nx + dx, ny + dy);
    if (level.walls.has(beyondKey) || state.boxes.has(beyondKey)) return;
    state.boxes.delete(nextKey);
    state.boxes.add(beyondKey);
    pushed = true;
  }
  state.anim = {
    start: performance.now(),
    dx,
    dy,
    fromPlayer: { x: player.x, y: player.y },
    boxFrom: pushed ? { x: nx, y: ny } : null,
  };
  player.x = nx;
  player.y = ny;
  state.facing = [dx, dy];
  state.moves++;
  if (pushed) state.pushes++;
  state.undoStack.push({ dx, dy, pushed });
  audio.play(pushed ? 'push' : 'step');
  updateCounters();
  recomputeDeadlocks();
  if (isSolved()) state.status = 'solving';
  startAnimLoop();
}

function undo() {
  if (state.status !== 'playing') return;
  const record = state.undoStack.pop();
  if (!record) return;
  state.anim = null;
  state.inputQueue = [];
  const { dx, dy, pushed } = record;
  const { player } = state;
  if (pushed) {
    state.boxes.delete(key(player.x + dx, player.y + dy));
    state.boxes.add(key(player.x, player.y));
    state.pushes--;
  }
  player.x -= dx;
  player.y -= dy;
  state.moves--;
  updateCounters();
  recomputeDeadlocks();
  draw();
}

function isSolved() {
  for (const k of state.boxes) {
    if (!state.level.goals.has(k)) return false;
  }
  return true;
}

// A box in a wall corner that is not on a goal can never be moved again.
// Box-against-box freezes are deliberately not detected.
function recomputeDeadlocks() {
  const { walls } = state.level;
  state.deadlockCell = null;
  for (const k of state.boxes) {
    if (state.level.goals.has(k)) continue;
    const [x, y] = k.split(',').map(Number);
    const vertical = walls.has(key(x, y - 1)) || walls.has(key(x, y + 1));
    const horizontal = walls.has(key(x - 1, y)) || walls.has(key(x + 1, y));
    if (vertical && horizontal) {
      state.deadlockCell = k;
      break;
    }
  }
  if (state.deadlockCell) {
    setStatus('A crate is stuck in a corner — press Z to undo.', true);
  } else if (statusEl.classList.contains('warning')) {
    setStatus('');
  }
}

function handleDirInput(dir) {
  if (!levelOverlay.hidden || state.status !== 'playing') return;
  if (state.anim) {
    if (state.inputQueue.length < 2) state.inputQueue.push(dir);
  } else {
    tryMove(dir[0], dir[1]);
  }
}

function startAnimLoop() {
  if (state.rafId === null) {
    state.rafId = requestAnimationFrame(animStep);
  }
}

function animStep(now) {
  state.rafId = null;
  if (!state.anim) {
    draw();
    return;
  }
  const t = (now - state.anim.start) / MOVE_MS;
  if (t < 1) {
    draw();
    state.rafId = requestAnimationFrame(animStep);
    return;
  }
  state.anim = null;
  draw();
  onMoveSettled();
}

function onMoveSettled() {
  if (state.status === 'solving') {
    finishLevel();
    return;
  }
  const next = state.inputQueue.shift() || state.heldDirs[state.heldDirs.length - 1];
  if (next) tryMove(next[0], next[1]);
}

function nextUnsolvedLevel(after) {
  for (let step = 1; step <= LEVELS.length; step++) {
    const i = (after + step) % LEVELS.length;
    if (!progress.solved[i]) return i;
  }
  return (after + 1) % LEVELS.length;
}

function finishLevel() {
  audio.play('solve');
  const i = state.levelIndex;
  const prev = progress.solved[i];
  const improved =
    !prev ||
    state.moves < prev.moves ||
    (state.moves === prev.moves && state.pushes < prev.pushes);
  if (improved) {
    progress.solved[i] = { moves: state.moves, pushes: state.pushes };
  }
  saveProgress();
  updateHeader();
  const allSolved = Object.keys(progress.solved).length >= LEVELS.length;
  solvedTitle.textContent = `Level ${i + 1} solved!`;
  solvedDetail.textContent =
    `${state.moves} moves · ${state.pushes} pushes` +
    (improved && prev ? ' — new best!' : '');
  solvedOverlay.hidden = false;
  state.advanceTimer = setTimeout(() => {
    state.advanceTimer = null;
    if (allSolved) {
      loadLevel((i + 1) % LEVELS.length);
      setStatus(`All ${LEVELS.length} levels solved — replay any for a better score!`);
    } else {
      loadLevel(nextUnsolvedLevel(i));
    }
  }, SOLVED_OVERLAY_MS);
}

function updateHeader() {
  levelLabelEl.textContent = `${state.levelIndex + 1} / ${LEVELS.length}`;
  const best = progress.solved[state.levelIndex];
  bestEl.textContent = best ? `${best.moves}m · ${best.pushes}p` : '—';
}

function updateCounters() {
  movesEl.textContent = String(state.moves);
  pushesEl.textContent = String(state.pushes);
}

function setStatus(text, warning = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle('warning', warning);
}

function updateMuteButton() {
  muteBtn.textContent = audio.muted ? 'Sound: off' : 'Sound: on';
  muteBtn.setAttribute('aria-pressed', String(audio.muted));
}

function toggleMute() {
  audio.setMuted(!audio.muted);
  progress.muted = audio.muted;
  saveProgress();
  updateMuteButton();
}

function buildLevelGrid() {
  for (let i = 0; i < LEVELS.length; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = String(i + 1);
    btn.addEventListener('click', () => loadLevel(i));
    levelGrid.appendChild(btn);
  }
}

function openLevelSelect() {
  const buttons = levelGrid.children;
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('solved', Boolean(progress.solved[i]));
    buttons[i].classList.toggle('current', i === state.levelIndex);
  }
  levelOverlay.hidden = false;
  buttons[state.levelIndex]?.scrollIntoView({ block: 'center' });
}

function computeLayout() {
  const { level } = state;
  const availW = Math.min(620, Math.max(240, mainEl.clientWidth - 32));
  const availH = Math.max(280, window.innerHeight - 280);
  state.tile = Math.max(
    TILE_MIN,
    Math.min(
      TILE_MAX,
      Math.floor(
        Math.min((availW - PAD * 2) / level.width, (availH - PAD * 2) / level.height)
      )
    )
  );
  const width = level.width * state.tile + PAD * 2;
  const height = level.height * state.tile + PAD * 2;
  const ratio = window.devicePixelRatio || 1;
  state.pixelRatio = ratio;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function easeOutQuad(t) {
  return t * (2 - t);
}

function cellOrigin(x, y) {
  return [PAD + x * state.tile, PAD + y * state.tile];
}

function draw() {
  const pal = palette();
  const { level, tile } = state;
  const w = canvas.width / state.pixelRatio;
  const h = canvas.height / state.pixelRatio;
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  // Animation progress.
  let playerX = state.player.x;
  let playerY = state.player.y;
  let animBoxKey = null;
  let animBoxX = 0;
  let animBoxY = 0;
  if (state.anim) {
    const t = easeOutQuad(
      Math.min(1, (performance.now() - state.anim.start) / MOVE_MS)
    );
    const { dx, dy, fromPlayer, boxFrom } = state.anim;
    playerX = fromPlayer.x + dx * t;
    playerY = fromPlayer.y + dy * t;
    if (boxFrom) {
      animBoxKey = key(boxFrom.x + dx, boxFrom.y + dy);
      animBoxX = boxFrom.x + dx * t;
      animBoxY = boxFrom.y + dy * t;
    }
  }

  for (const k of level.floor) {
    const [x, y] = k.split(',').map(Number);
    drawFloor(x, y, pal);
  }
  for (const k of level.goals) {
    const [x, y] = k.split(',').map(Number);
    drawGoal(x, y, pal);
  }
  for (const k of level.walls) {
    const [x, y] = k.split(',').map(Number);
    drawWall(x, y, pal);
  }
  for (const k of state.boxes) {
    if (k === animBoxKey) continue;
    const [x, y] = k.split(',').map(Number);
    drawBox(x, y, level.goals.has(k), k === state.deadlockCell, pal);
  }
  if (animBoxKey) {
    drawBox(animBoxX, animBoxY, level.goals.has(animBoxKey), false, pal);
  }
  drawPlayer(playerX, playerY, pal);
}

function drawFloor(x, y, pal) {
  const [px, py] = cellOrigin(x, y);
  ctx.fillStyle = (x + y) % 2 === 0 ? pal.floorA : pal.floorB;
  ctx.fillRect(px, py, state.tile, state.tile);
}

function drawGoal(x, y, pal) {
  const t = state.tile;
  const [px, py] = cellOrigin(x, y);
  const cx = px + t / 2;
  const cy = py + t / 2;
  ctx.fillStyle = pal.goal;
  ctx.beginPath();
  ctx.arc(cx, cy, t * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pal.goalRing;
  ctx.lineWidth = Math.max(1, t * 0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, t * 0.27, 0, Math.PI * 2);
  ctx.stroke();
}

function drawWall(x, y, pal) {
  const t = state.tile;
  const [px, py] = cellOrigin(x, y);
  ctx.fillStyle = pal.wall;
  ctx.fillRect(px, py, t, t);

  // Brick pattern: two courses per cell, joints offset on alternating courses.
  ctx.strokeStyle = pal.wallMortar;
  ctx.lineWidth = Math.max(1, t * 0.04);
  ctx.beginPath();
  ctx.moveTo(px, py + t / 2);
  ctx.lineTo(px + t, py + t / 2);
  for (let course = 0; course < 2; course++) {
    const jointX = (y * 2 + course) % 2 === 0 ? px + t / 2 : px + t / 4;
    const top = py + (course * t) / 2;
    for (let jx = jointX; jx < px + t; jx += t / 2) {
      ctx.moveTo(jx, top);
      ctx.lineTo(jx, top + t / 2);
    }
  }
  ctx.stroke();

  ctx.fillStyle = pal.wallTop;
  ctx.fillRect(px, py, t, Math.max(1, t * 0.08));
}

function drawBox(x, y, onGoal, deadlocked, pal) {
  const t = state.tile;
  const [px, py] = cellOrigin(x, y);
  const m = t * 0.08;
  const size = t - m * 2;
  const fill = onGoal ? pal.boxGoal : pal.box;
  const edge = deadlocked ? pal.deadlock : onGoal ? pal.boxGoalEdge : pal.boxEdge;
  const line = onGoal ? pal.boxGoalLine : pal.boxLine;

  ctx.fillStyle = fill;
  ctx.fillRect(px + m, py + m, size, size);
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1.5, t * 0.08);
  ctx.strokeRect(px + m, py + m, size, size);

  // Crossed planks.
  ctx.strokeStyle = line;
  ctx.lineWidth = Math.max(1, t * 0.06);
  const inset = m + t * 0.1;
  ctx.beginPath();
  ctx.moveTo(px + inset, py + inset);
  ctx.lineTo(px + t - inset, py + t - inset);
  ctx.moveTo(px + t - inset, py + inset);
  ctx.lineTo(px + inset, py + t - inset);
  ctx.stroke();

  // Corner nails.
  ctx.fillStyle = pal.nail;
  const nailInset = m + t * 0.09;
  const nailR = Math.max(1, t * 0.04);
  for (const [nx, ny] of [
    [px + nailInset, py + nailInset],
    [px + t - nailInset, py + nailInset],
    [px + nailInset, py + t - nailInset],
    [px + t - nailInset, py + t - nailInset],
  ]) {
    ctx.beginPath();
    ctx.arc(nx, ny, nailR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(x, y, pal) {
  const t = state.tile;
  const [px, py] = cellOrigin(x, y);
  const cx = px + t / 2;
  const headR = t * 0.18;
  const headCy = py + t * 0.3;

  // Body.
  ctx.fillStyle = pal.playerBody;
  ctx.beginPath();
  ctx.moveTo(cx - t * 0.22, py + t * 0.82);
  ctx.lineTo(cx - t * 0.14, py + t * 0.42);
  ctx.lineTo(cx + t * 0.14, py + t * 0.42);
  ctx.lineTo(cx + t * 0.22, py + t * 0.82);
  ctx.closePath();
  ctx.fill();

  // Head.
  ctx.fillStyle = pal.playerHead;
  ctx.beginPath();
  ctx.arc(cx, headCy, headR, 0, Math.PI * 2);
  ctx.fill();

  // Cap, with the brim leaning toward the facing direction.
  const [fx] = state.facing;
  ctx.fillStyle = pal.playerCap;
  ctx.beginPath();
  ctx.arc(cx, headCy, headR * 1.08, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  const brimDir = fx !== 0 ? Math.sign(fx) : 0;
  const brimW = headR * 1.1;
  ctx.fillRect(
    brimDir >= 0 ? cx : cx - brimW,
    headCy - Math.max(1, t * 0.04),
    brimW,
    Math.max(1.5, t * 0.07)
  );
}

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const k = event.key.toLowerCase();
  if (k === 'escape') {
    if (!levelOverlay.hidden) {
      event.preventDefault();
      levelOverlay.hidden = true;
    }
    return;
  }
  if (!levelOverlay.hidden) return;
  const dir = KEY_DIRS[k];
  if (dir) {
    event.preventDefault();
    if (!event.repeat && !state.heldDirs.includes(dir)) state.heldDirs.push(dir);
    handleDirInput(dir);
    return;
  }
  if (k === 'z' || k === 'u') {
    event.preventDefault();
    undo();
  } else if (k === 'r') {
    event.preventDefault();
    restart();
  } else if (k === 'm') {
    event.preventDefault();
    toggleMute();
  }
});

window.addEventListener('keyup', (event) => {
  const dir = KEY_DIRS[event.key.toLowerCase()];
  if (dir) state.heldDirs = state.heldDirs.filter((d) => d !== dir);
});

window.addEventListener('blur', () => {
  state.heldDirs = [];
});

canvas.addEventListener(
  'touchstart',
  (event) => {
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
    const dir =
      Math.abs(dx) > Math.abs(dy)
        ? [Math.sign(dx), 0]
        : [0, Math.sign(dy)];
    handleDirInput(dir);
  },
  { passive: false }
);

canvas.addEventListener('touchcancel', () => {
  touchStart = null;
});

undoBtn.addEventListener('click', undo);
restartBtn.addEventListener('click', restart);
levelsBtn.addEventListener('click', openLevelSelect);
levelClose.addEventListener('click', () => {
  levelOverlay.hidden = true;
});
muteBtn.addEventListener('click', toggleMute);

window.addEventListener('resize', () => {
  computeLayout();
  draw();
});

darkScheme.addEventListener('change', draw);

document.title = `Sokoban — ${LEVEL_SET.name}`;
audio.setMuted(progress.muted);
updateMuteButton();
buildLevelGrid();
loadLevel(
  progress.current >= 0 && progress.current < LEVELS.length ? progress.current : 0
);
