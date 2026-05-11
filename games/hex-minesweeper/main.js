const SQRT3 = Math.sqrt(3);

const DIFFICULTIES = {
  easy: { radius: 4, mineRatio: 0.12, hexSize: 30 },
  medium: { radius: 6, mineRatio: 0.15, hexSize: 26 },
  hard: { radius: 8, mineRatio: 0.18, hexSize: 22 },
};

const NEIGHBOR_DIRS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

const NUMBER_COLORS = [
  null,
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#a855f7',
  '#f97316',
  '#14b8a6',
];

const STORAGE_PREFIX = 'hex-minesweeper-best-';

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayDetail = document.getElementById('overlay-detail');
const overlayRestart = document.getElementById('overlay-restart');
const restartBtn = document.getElementById('restart');
const statusEl = document.getElementById('status');
const mineCountEl = document.getElementById('mine-count');
const timerEl = document.getElementById('timer');
const bestEl = document.getElementById('best');
const diffButtons = document.querySelectorAll('.diff-btn');

const state = {
  difficulty: 'easy',
  radius: 0,
  hexSize: 0,
  mineCount: 0,
  cells: new Map(),
  status: 'idle',
  flagsPlaced: 0,
  revealedCount: 0,
  safeCount: 0,
  startTime: 0,
  elapsed: 0,
  timerHandle: null,
  hover: null,
  origin: { x: 0, y: 0 },
  pixelRatio: 1,
};

let touch = null;
const LONG_PRESS_MS = 400;
const TOUCH_MOVE_TOLERANCE = 12;

function key(q, r) {
  return `${q},${r}`;
}

function buildBoard(radius) {
  const cells = new Map();
  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);
    for (let r = rMin; r <= rMax; r++) {
      cells.set(key(q, r), {
        q,
        r,
        mine: false,
        revealed: false,
        flagged: false,
        neighbors: 0,
        exploding: false,
      });
    }
  }
  return cells;
}

function neighbors(cells, q, r) {
  const out = [];
  for (const [dq, dr] of NEIGHBOR_DIRS) {
    const cell = cells.get(key(q + dq, r + dr));
    if (cell) out.push(cell);
  }
  return out;
}

function placeMines(cells, mineCount, safeCell) {
  const safeKeys = new Set([key(safeCell.q, safeCell.r)]);
  for (const n of neighbors(cells, safeCell.q, safeCell.r)) {
    safeKeys.add(key(n.q, n.r));
  }
  const candidates = [...cells.values()].filter(
    (c) => !safeKeys.has(key(c.q, c.r))
  );
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const mines = candidates.slice(0, mineCount);
  for (const m of mines) m.mine = true;
  for (const c of cells.values()) {
    if (c.mine) continue;
    c.neighbors = neighbors(cells, c.q, c.r).filter((n) => n.mine).length;
  }
}

function axialToPixel(q, r, size) {
  const x = size * SQRT3 * (q + r / 2);
  const y = size * 1.5 * r;
  return { x, y };
}

function pixelToAxial(x, y, size) {
  const q = ((SQRT3 / 3) * x - (1 / 3) * y) / size;
  const r = ((2 / 3) * y) / size;
  return roundAxial(q, r);
}

function roundAxial(q, r) {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { q: rq, r: rr };
}

function computeLayout() {
  const { radius, hexSize } = state;
  const width = (2 * radius + 1) * SQRT3 * hexSize + 4;
  const height = (3 * radius + 2) * hexSize + 4;
  state.origin = { x: width / 2, y: height / 2 };
  resizeCanvas(width, height);
}

function resizeCanvas(width, height) {
  const ratio = window.devicePixelRatio || 1;
  state.pixelRatio = ratio;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function hexCorners(cx, cy, size) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
  }
  return pts;
}

function drawHex(cx, cy, size, fill, stroke) {
  const pts = hexCorners(cx, cy, size);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function draw() {
  const w = canvas.width / state.pixelRatio;
  const h = canvas.height / state.pixelRatio;
  ctx.clearRect(0, 0, w, h);
  const { hexSize, origin } = state;

  for (const cell of state.cells.values()) {
    const { x, y } = axialToPixel(cell.q, cell.r, hexSize);
    const cx = origin.x + x;
    const cy = origin.y + y;
    drawCell(cell, cx, cy, hexSize);
  }
}

function drawCell(cell, cx, cy, size) {
  const isHover =
    state.hover &&
    state.hover.q === cell.q &&
    state.hover.r === cell.r &&
    !cell.revealed &&
    state.status === 'playing';

  let fill;
  let stroke = '#0b0d12';

  if (cell.revealed) {
    if (cell.mine) {
      fill = cell.exploding ? '#ef4444' : '#7f1d1d';
    } else {
      fill = '#e5e7eb';
    }
  } else {
    fill = isHover ? '#3b4252' : '#2a2e36';
  }

  drawHex(cx, cy, size - 1, fill, stroke);

  if (cell.revealed && cell.mine) {
    drawMine(cx, cy, size);
  } else if (cell.revealed && cell.neighbors > 0) {
    ctx.fillStyle = NUMBER_COLORS[cell.neighbors] || '#111';
    ctx.font = `bold ${Math.round(size * 0.95)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(cell.neighbors), cx, cy + 1);
  } else if (!cell.revealed && cell.flagged) {
    drawFlag(cx, cy, size);
  }
}

function drawMine(cx, cy, size) {
  const r = size * 0.32;
  ctx.fillStyle = '#0b0d12';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0b0d12';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * r * 1.55, cy + Math.sin(a) * r * 1.55);
    ctx.stroke();
  }
  ctx.fillStyle = '#f3f4f6';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlag(cx, cy, size) {
  const h = size * 0.7;
  const baseX = cx - size * 0.05;
  const baseY = cy + h / 2;
  const topY = cy - h / 2;
  ctx.strokeStyle = '#f3f4f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX, topY);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(baseX, topY);
  ctx.lineTo(baseX + size * 0.45, topY + size * 0.2);
  ctx.lineTo(baseX, topY + size * 0.4);
  ctx.closePath();
  ctx.fill();
}

function reveal(cell) {
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  state.revealedCount++;
  if (cell.mine) return;
  if (cell.neighbors === 0) {
    for (const n of neighbors(state.cells, cell.q, cell.r)) {
      if (!n.revealed && !n.mine && !n.flagged) reveal(n);
    }
  }
}

function startGame(difficulty) {
  const config = DIFFICULTIES[difficulty];
  state.difficulty = difficulty;
  state.radius = config.radius;
  state.hexSize = config.hexSize;
  state.cells = buildBoard(config.radius);
  state.mineCount = Math.max(1, Math.round(state.cells.size * config.mineRatio));
  state.safeCount = state.cells.size - state.mineCount;
  state.status = 'idle';
  state.flagsPlaced = 0;
  state.revealedCount = 0;
  state.elapsed = 0;
  state.startTime = 0;
  state.hover = null;
  stopTimer();
  computeLayout();
  updateActiveDifficulty();
  updateStats();
  updateBest();
  hideOverlay();
  setStatus('Click any hex to begin.');
  draw();
}

function firstReveal(cell) {
  placeMines(state.cells, state.mineCount, cell);
  state.status = 'playing';
  state.startTime = performance.now();
  startTimer();
  reveal(cell);
}

function handleReveal(cell) {
  if (cell.flagged) return;
  if (state.status === 'won' || state.status === 'lost') return;
  if (state.status === 'idle') {
    firstReveal(cell);
  } else {
    reveal(cell);
  }
  if (cell.revealed && cell.mine) {
    cell.exploding = true;
    loseGame();
    return;
  }
  if (state.revealedCount >= state.safeCount) {
    winGame();
    return;
  }
  updateStats();
  draw();
}

function handleFlag(cell) {
  if (cell.revealed) return;
  if (state.status === 'won' || state.status === 'lost') return;
  cell.flagged = !cell.flagged;
  state.flagsPlaced += cell.flagged ? 1 : -1;
  updateStats();
  draw();
}

function loseGame() {
  state.status = 'lost';
  stopTimer();
  setStatus('Boom! You hit a mine.');
  revealAllMines(false).then(() => {
    showOverlay('Game over', `You hit a mine after ${formatTime(state.elapsed)}.`);
  });
}

function winGame() {
  state.status = 'won';
  stopTimer();
  for (const cell of state.cells.values()) {
    if (cell.mine && !cell.flagged) {
      cell.flagged = true;
      state.flagsPlaced++;
    }
  }
  const best = recordBest();
  updateStats();
  updateBest();
  draw();
  const detail = best
    ? `New best for ${state.difficulty}: ${formatTime(state.elapsed)}!`
    : `Cleared in ${formatTime(state.elapsed)}.`;
  setStatus(detail);
  showOverlay('You win!', detail);
}

function revealAllMines(includeFlagged) {
  return new Promise((resolve) => {
    const mines = [...state.cells.values()].filter(
      (c) => c.mine && !c.revealed && (includeFlagged || !c.flagged)
    );
    mines.sort(() => Math.random() - 0.5);
    let i = 0;
    const step = () => {
      if (i >= mines.length) {
        draw();
        resolve();
        return;
      }
      mines[i].revealed = true;
      mines[i].flagged = false;
      i++;
      draw();
      setTimeout(step, 70);
    };
    step();
  });
}

function startTimer() {
  if (state.timerHandle) return;
  state.timerHandle = setInterval(() => {
    state.elapsed = Math.floor((performance.now() - state.startTime) / 1000);
    timerEl.textContent = formatTime(state.elapsed);
  }, 250);
}

function stopTimer() {
  if (state.startTime > 0 && state.status !== 'idle') {
    state.elapsed = Math.floor((performance.now() - state.startTime) / 1000);
  }
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
  timerEl.textContent = formatTime(state.elapsed);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateStats() {
  const remaining = Math.max(state.mineCount - state.flagsPlaced, 0);
  mineCountEl.textContent = `${remaining} / ${state.mineCount}`;
  timerEl.textContent = formatTime(state.elapsed);
}

function updateActiveDifficulty() {
  for (const btn of diffButtons) {
    btn.classList.toggle(
      'active',
      btn.dataset.difficulty === state.difficulty
    );
  }
}

function updateBest() {
  const stored = localStorage.getItem(STORAGE_PREFIX + state.difficulty);
  bestEl.textContent = stored ? formatTime(parseInt(stored, 10)) : '—';
}

function recordBest() {
  const k = STORAGE_PREFIX + state.difficulty;
  const prev = localStorage.getItem(k);
  if (prev === null || state.elapsed < parseInt(prev, 10)) {
    localStorage.setItem(k, String(state.elapsed));
    return true;
  }
  return false;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function showOverlay(title, detail) {
  overlayTitle.textContent = title;
  overlayDetail.textContent = detail;
  overlay.hidden = false;
}

function hideOverlay() {
  overlay.hidden = true;
}

function eventToCell(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = (canvas.width / state.pixelRatio) / rect.width;
  const scaleY = (canvas.height / state.pixelRatio) / rect.height;
  const px = (event.clientX - rect.left) * scaleX - state.origin.x;
  const py = (event.clientY - rect.top) * scaleY - state.origin.y;
  const { q, r } = pixelToAxial(px, py, state.hexSize);
  return state.cells.get(key(q, r)) || null;
}

canvas.addEventListener('mousemove', (event) => {
  const cell = eventToCell(event);
  const next = cell ? { q: cell.q, r: cell.r } : null;
  const same =
    (!state.hover && !next) ||
    (state.hover &&
      next &&
      state.hover.q === next.q &&
      state.hover.r === next.r);
  if (!same) {
    state.hover = next;
    draw();
  }
});

canvas.addEventListener('mouseleave', () => {
  if (state.hover) {
    state.hover = null;
    draw();
  }
});

canvas.addEventListener('click', (event) => {
  if (event.detail === 0) return;
  const cell = eventToCell(event);
  if (cell) handleReveal(cell);
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  const cell = eventToCell(event);
  if (cell) handleFlag(cell);
});

function clearTouchTimer() {
  if (touch && touch.timer) {
    clearTimeout(touch.timer);
    touch.timer = null;
  }
}

canvas.addEventListener(
  'touchstart',
  (event) => {
    if (event.touches.length !== 1) return;
    event.preventDefault();
    const t = event.touches[0];
    const cell = eventToCell(t);
    touch = {
      cell,
      startX: t.clientX,
      startY: t.clientY,
      flagged: false,
      timer: null,
    };
    if (cell) {
      touch.timer = setTimeout(() => {
        handleFlag(cell);
        if (touch) {
          touch.flagged = true;
          touch.timer = null;
        }
        if (navigator.vibrate) navigator.vibrate(15);
      }, LONG_PRESS_MS);
    }
  },
  { passive: false }
);

canvas.addEventListener(
  'touchmove',
  (event) => {
    if (!touch) return;
    event.preventDefault();
    const t = event.touches[0];
    if (!t) return;
    const dx = t.clientX - touch.startX;
    const dy = t.clientY - touch.startY;
    if (dx * dx + dy * dy > TOUCH_MOVE_TOLERANCE * TOUCH_MOVE_TOLERANCE) {
      clearTouchTimer();
      touch = null;
    }
  },
  { passive: false }
);

canvas.addEventListener(
  'touchend',
  (event) => {
    if (!touch) return;
    event.preventDefault();
    clearTouchTimer();
    if (!touch.flagged && touch.cell) handleReveal(touch.cell);
    touch = null;
  },
  { passive: false }
);

canvas.addEventListener('touchcancel', () => {
  clearTouchTimer();
  touch = null;
});

restartBtn.addEventListener('click', () => startGame(state.difficulty));
overlayRestart.addEventListener('click', () => startGame(state.difficulty));

for (const btn of diffButtons) {
  btn.addEventListener('click', () => {
    startGame(btn.dataset.difficulty);
  });
}

window.addEventListener('resize', () => {
  computeLayout();
  draw();
});

startGame('easy');
