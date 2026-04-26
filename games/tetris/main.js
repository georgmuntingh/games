const COLS = 10;
const ROWS = 20;
const CELL = 30;

const COLORS = {
  I: '#22d3ee',
  O: '#facc15',
  T: '#a855f7',
  S: '#22c55e',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316',
};

const SHAPES = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
};

const TYPES = Object.keys(SHAPES);
const LINE_SCORES = [0, 100, 300, 500, 800];

const boardCanvas = document.getElementById('board');
const nextCanvas = document.getElementById('next');
const ctx = boardCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const playBtn = document.getElementById('play');
const statusEl = document.getElementById('status');

let board;
let piece;
let nextType;
let bag = [];
let score, lines, level;
let dropInterval;
let lastDropAt;
let running = false;
let paused = false;
let gameOver = false;
let rafId = null;

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function refillBag() {
  const order = [...TYPES];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  bag.push(...order);
}

function drawType() {
  if (bag.length === 0) refillBag();
  return bag.shift();
}

function spawn(type) {
  return {
    type,
    rotation: 0,
    x: 3,
    y: type === 'I' ? -1 : 0,
  };
}

function cellsOf(p) {
  const rotations = SHAPES[p.type];
  const shape = rotations[p.rotation % rotations.length];
  return shape.map(([dx, dy]) => [p.x + dx, p.y + dy]);
}

function collides(p) {
  for (const [x, y] of cellsOf(p)) {
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y >= 0 && board[y][x]) return true;
  }
  return false;
}

function lock(p) {
  for (const [x, y] of cellsOf(p)) {
    if (y < 0) {
      gameOver = true;
      continue;
    }
    board[y][x] = p.type;
  }
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every((cell) => cell)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }
  return cleared;
}

function intervalForLevel(lvl) {
  return Math.max(80, 800 - (lvl - 1) * 70);
}

function updateStats(cleared) {
  if (cleared > 0) {
    score += LINE_SCORES[cleared] * level;
    lines += cleared;
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      level = newLevel;
      dropInterval = intervalForLevel(level);
    }
  }
  scoreEl.textContent = String(score);
  linesEl.textContent = String(lines);
  levelEl.textContent = String(level);
}

function rotate(dir) {
  if (!piece) return;
  const rotations = SHAPES[piece.type].length;
  const next = {
    ...piece,
    rotation: (piece.rotation + dir + rotations) % rotations,
  };
  for (const dx of [0, -1, 1, -2, 2]) {
    const candidate = { ...next, x: next.x + dx };
    if (!collides(candidate)) {
      piece = candidate;
      return;
    }
  }
}

function shift(dx) {
  if (!piece) return;
  const next = { ...piece, x: piece.x + dx };
  if (!collides(next)) piece = next;
}

function softDrop() {
  if (!piece) return;
  const next = { ...piece, y: piece.y + 1 };
  if (!collides(next)) {
    piece = next;
    score += 1;
    scoreEl.textContent = String(score);
    return true;
  }
  settle();
  return false;
}

function hardDrop() {
  if (!piece) return;
  let dropped = 0;
  while (true) {
    const next = { ...piece, y: piece.y + 1 };
    if (collides(next)) break;
    piece = next;
    dropped += 1;
  }
  score += dropped * 2;
  scoreEl.textContent = String(score);
  settle();
}

function settle() {
  lock(piece);
  const cleared = clearLines();
  updateStats(cleared);
  piece = spawn(nextType);
  nextType = drawType();
  drawNext();
  if (collides(piece)) {
    gameOver = true;
  }
}

function step(now) {
  rafId = requestAnimationFrame(step);
  if (gameOver) {
    if (running) finish();
    draw();
    return;
  }
  if (!running || paused) {
    draw();
    return;
  }
  if (now - lastDropAt >= dropInterval) {
    const next = { ...piece, y: piece.y + 1 };
    if (collides(next)) {
      settle();
    } else {
      piece = next;
    }
    lastDropAt = now;
  }
  draw();
}

function drawCell(c, x, y, color) {
  c.fillStyle = color;
  c.fillRect(x * CELL, y * CELL, CELL, CELL);
  c.fillStyle = 'rgba(0, 0, 0, 0.25)';
  c.fillRect(x * CELL, y * CELL, CELL, 2);
  c.fillRect(x * CELL, y * CELL, 2, CELL);
  c.fillStyle = 'rgba(255, 255, 255, 0.15)';
  c.fillRect(x * CELL + CELL - 2, y * CELL + 2, 2, CELL - 2);
  c.fillRect(x * CELL + 2, y * CELL + CELL - 2, CELL - 2, 2);
}

function draw() {
  ctx.fillStyle = '#0b0d12';
  ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  for (let x = 1; x < COLS; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, boardCanvas.height);
    ctx.stroke();
  }
  for (let y = 1; y < ROWS; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(boardCanvas.width, y * CELL);
    ctx.stroke();
  }

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const cell = board[y][x];
      if (cell) drawCell(ctx, x, y, COLORS[cell]);
    }
  }

  if (piece) {
    const ghost = { ...piece };
    while (!collides({ ...ghost, y: ghost.y + 1 })) ghost.y += 1;
    ctx.globalAlpha = 0.2;
    for (const [x, y] of cellsOf(ghost)) {
      if (y >= 0) drawCell(ctx, x, y, COLORS[piece.type]);
    }
    ctx.globalAlpha = 1;
    for (const [x, y] of cellsOf(piece)) {
      if (y >= 0) drawCell(ctx, x, y, COLORS[piece.type]);
    }
  }

  if (gameOver) {
    overlay('Game Over', `Score: ${score}`);
  } else if (paused) {
    overlay('Paused');
  } else if (!running) {
    overlay('Press Start');
  }
}

function overlay(text, subtext) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  ctx.fillStyle = '#f3f4f6';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (subtext) {
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(text, boardCanvas.width / 2, boardCanvas.height / 2 - 16);
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText(subtext, boardCanvas.width / 2, boardCanvas.height / 2 + 18);
  } else {
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(text, boardCanvas.width / 2, boardCanvas.height / 2);
  }
}

function drawNext() {
  nextCtx.fillStyle = '#0b0d12';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!nextType) return;
  const cells = SHAPES[nextType][0];
  const xs = cells.map(([x]) => x);
  const ys = cells.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX + 1;
  const h = Math.max(...ys) - minY + 1;
  const size = 24;
  const ox = (nextCanvas.width - w * size) / 2;
  const oy = (nextCanvas.height - h * size) / 2;
  for (const [x, y] of cells) {
    const px = ox + (x - minX) * size;
    const py = oy + (y - minY) * size;
    nextCtx.fillStyle = COLORS[nextType];
    nextCtx.fillRect(px, py, size, size);
    nextCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    nextCtx.fillRect(px, py, size, 2);
    nextCtx.fillRect(px, py, 2, size);
  }
}

function reset() {
  board = emptyBoard();
  bag = [];
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = intervalForLevel(level);
  lastDropAt = performance.now();
  gameOver = false;
  paused = false;
  piece = spawn(drawType());
  nextType = drawType();
  scoreEl.textContent = '0';
  linesEl.textContent = '0';
  levelEl.textContent = '1';
  statusEl.textContent = '';
  drawNext();
}

function start() {
  reset();
  running = true;
  playBtn.textContent = 'Pause';
}

function togglePause() {
  if (!running || gameOver) return;
  paused = !paused;
  playBtn.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) lastDropAt = performance.now();
}

function finish() {
  running = false;
  statusEl.textContent = `Game over — score ${score}.`;
  playBtn.textContent = 'Play again';
}

playBtn.addEventListener('click', () => {
  if (!running || gameOver) {
    start();
  } else {
    togglePause();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'p' || event.key === 'P') {
    event.preventDefault();
    togglePause();
    return;
  }
  if (!running || paused || gameOver) return;
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      shift(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      shift(1);
      break;
    case 'ArrowDown':
      event.preventDefault();
      softDrop();
      lastDropAt = performance.now();
      break;
    case 'ArrowUp':
    case 'x':
    case 'X':
      event.preventDefault();
      rotate(1);
      break;
    case 'z':
    case 'Z':
      event.preventDefault();
      rotate(-1);
      break;
    case ' ':
      event.preventDefault();
      hardDrop();
      lastDropAt = performance.now();
      break;
    default:
  }
});

reset();
running = false;
draw();
rafId = requestAnimationFrame(step);
