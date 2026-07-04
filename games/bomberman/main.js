import {
  LEVELS,
  T_EMPTY,
  T_HARD,
  T_SOFT,
  cellKey,
  parseLevel,
  makeBattleArena,
  validateLevels,
} from './levels.js';
import { chooseEnemyDir, computeDangerTiles } from './ai.js';
import { audio } from './audio.js';
import {
  createTouchControls,
  coarsePointer,
  enterPlayMode as enterTouchPlay,
  exitPlayMode as exitTouchPlay,
} from '../../shared/touch.js';

if (import.meta.env?.DEV) validateLevels(LEVELS);

const STORAGE_KEY = 'bomberman-v1';

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const PAD = 8;
const TILE_MIN = 24;
const TILE_MAX = 46;

const FUSE_MS = 2200;
const FLAME_MS = 520;
const FLAME_FADE_MS = 150;
const SLIDE_MS = 90;
const TWEEN_BASE = 220;
const TWEEN_STEP = 25;
const TWEEN_MIN = 120;
const CAMPAIGN_LIVES = 3;
const INVULN_MS = 2000;
const DYING_MS = 1000;
const CLEAR_MS = 1600;
const INTRO_MS = 1300;
const ROUND_OVER_MS = 1900;
const SUDDEN_STEP_MS = 350;
const ENEMY_SPEED = { wanderer: 340, chaser: 300, smart: 280 };

const PICKUP_LABELS = {
  bombs: 'B',
  range: 'R',
  speed: 'S',
  remote: 'RC',
  kick: 'K',
};

const PALETTES = {
  light: {
    floorA: '#9ecb74',
    floorB: '#95c26c',
    hard: '#7c8694',
    hardTop: 'rgba(255, 255, 255, 0.35)',
    hardShadow: 'rgba(0, 0, 0, 0.25)',
    soft: '#c98c4b',
    softLine: '#a06c35',
    softTop: 'rgba(255, 255, 255, 0.25)',
    exit: '#324a7a',
    exitDoor: '#101a30',
    exitGlow: '#7cd4ff',
    bomb: '#22262e',
    bombShine: 'rgba(255, 255, 255, 0.3)',
    fuse: '#ff9f2e',
    flameCore: '#fff3c4',
    flameEdge: '#ff7a1a',
    pickupBg: '#f7f1de',
    pickupBorder: '#8a5a2b',
    pickupText: '#453016',
    p1Body: '#2563eb',
    p1Trim: '#f3f6ff',
    p2Body: '#dc2626',
    p2Trim: '#1c1c22',
    skin: '#f0c8a0',
    wanderer: '#e06fa4',
    chaser: '#f08c1e',
    smart: '#2aa7a0',
    enemyEye: '#ffffff',
    enemyPupil: '#22262e',
    banner: 'rgba(15, 20, 30, 0.72)',
    bannerText: '#ffffff',
    particleBlock: '#a06c35',
    particleBoom: '#ff9f2e',
  },
  dark: {
    floorA: '#27392a',
    floorB: '#223324',
    hard: '#4c5563',
    hardTop: 'rgba(255, 255, 255, 0.18)',
    hardShadow: 'rgba(0, 0, 0, 0.4)',
    soft: '#a5713a',
    softLine: '#7a5025',
    softTop: 'rgba(255, 255, 255, 0.15)',
    exit: '#2c3f68',
    exitDoor: '#0a1220',
    exitGlow: '#6ec8f5',
    bomb: '#14161c',
    bombShine: 'rgba(255, 255, 255, 0.2)',
    fuse: '#ffa63e',
    flameCore: '#fff3c4',
    flameEdge: '#ff7a1a',
    pickupBg: '#2b2f3a',
    pickupBorder: '#c99a5b',
    pickupText: '#f3e7cf',
    p1Body: '#60a5fa',
    p1Trim: '#eef4ff',
    p2Body: '#ef4444',
    p2Trim: '#15151a',
    skin: '#e8b88a',
    wanderer: '#d367a0',
    chaser: '#e08a2e',
    smart: '#37a89f',
    enemyEye: '#f5f5f5',
    enemyPupil: '#101218',
    banner: 'rgba(5, 8, 14, 0.78)',
    bannerText: '#f5f5f5',
    particleBlock: '#8a5a2b',
    particleBoom: '#ffa63e',
  },
};

const P1_MOVES = { KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] };
const P2_MOVES = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};
// Synthetic key codes emitted by the touch thumbstick (touch.js). They live
// in every control map because heldDirs is per-player.
const STICK_MOVES = {
  'stick-up': [0, -1],
  'stick-down': [0, 1],
  'stick-left': [-1, 0],
  'stick-right': [1, 0],
};

const CAMPAIGN_CONTROLS = {
  moves: { ...P1_MOVES, ...P2_MOVES, ...STICK_MOVES },
  bomb: new Set(['Space', 'KeyE', 'Enter']),
  detonate: new Set(['KeyQ', 'ShiftLeft', 'ShiftRight']),
};
const BATTLE_P1_CONTROLS = {
  moves: { ...P1_MOVES, ...STICK_MOVES },
  bomb: new Set(['KeyE']),
  detonate: new Set(['KeyQ']),
};
const BATTLE_P2_CONTROLS = {
  moves: { ...P2_MOVES, ...STICK_MOVES },
  bomb: new Set(['Enter']),
  detonate: new Set(['ShiftRight']),
};

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const mainEl = document.querySelector('main');
const menuOverlay = document.getElementById('menu-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const endOverlay = document.getElementById('end-overlay');
const endTitle = document.getElementById('end-title');
const endDetail = document.getElementById('end-detail');
const btnContinue = document.getElementById('btn-continue');
const btnNew = document.getElementById('btn-new');
const btnBattle3 = document.getElementById('btn-battle3');
const btnBattle5 = document.getElementById('btn-battle5');
const btnResume = document.getElementById('btn-resume');
const btnQuit = document.getElementById('btn-quit');
const btnAgain = document.getElementById('btn-again');
const btnMenu = document.getElementById('btn-menu');
const battleScoreEl = document.getElementById('battle-score');
const hudCampaign = document.getElementById('hud-campaign');
const hudBattle = document.getElementById('hud-battle');
const hudLevel = document.getElementById('hud-level');
const hudLives = document.getElementById('hud-lives');
const hudTime = document.getElementById('hud-time');
const hudPower = document.getElementById('hud-power');
const hudRound = document.getElementById('hud-round');
const hudP1 = document.getElementById('hud-p1');
const hudP2 = document.getElementById('hud-p2');
const hudBTime = document.getElementById('hud-btime');
const menuBtn = document.getElementById('menu-btn');
const muteBtn = document.getElementById('mute');
const statusEl = document.getElementById('status');
const btnLefty = document.getElementById('btn-lefty');
const fsLeft = document.getElementById('fs-left');
const fsMid = document.getElementById('fs-mid');
const fsRight = document.getElementById('fs-right');
const fsPause = document.getElementById('fs-pause');
const fsMute = document.getElementById('fs-mute');

const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');

const state = {
  screen: 'menu', // 'menu' | 'campaign' | 'battle'
  phase: 'idle', // 'idle' | 'intro' | 'playing' | 'dying' | 'levelClear' | 'roundOver' | 'over'
  phaseMs: 0,
  paused: false,
  banner: null, // { text, sub }
  levelIndex: 0,
  levelName: '',
  levelTimeMs: 0,
  grid: [],
  cols: 0,
  rows: 0,
  hidden: new Map(),
  exitCell: null,
  exitRevealed: false,
  playerStart: null,
  players: [],
  enemies: [],
  bombs: [],
  flames: [],
  pickups: [],
  particles: [],
  timeLeft: 0,
  suddenDeath: null, // { cells, index, timer }
  round: 1,
  bestOf: 3,
  wins: [0, 0],
  shake: 0,
  endAction: null,
  tile: 32,
  pixelRatio: 1,
  lastTime: 0,
};

let progress = loadProgress();
let statusTimer = null;

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && typeof stored === 'object') {
      return {
        unlocked: Number.isInteger(stored.unlocked)
          ? Math.max(0, Math.min(LEVELS.length, stored.unlocked))
          : 0,
        muted: Boolean(stored.muted),
        lefty: Boolean(stored.lefty),
        battle:
          stored.battle && typeof stored.battle === 'object'
            ? { p1: stored.battle.p1 | 0, p2: stored.battle.p2 | 0 }
            : { p1: 0, p2: 0 },
      };
    }
  } catch {
    // Corrupt storage — start fresh.
  }
  return { unlocked: 0, muted: false, lefty: false, battle: { p1: 0, p2: 0 } };
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

// Small vibration pulses on game events (Android/Chrome; iOS ignores it).
// The mute toggle doubles as the haptics kill switch.
function buzz(ms) {
  if (!progress.muted) navigator.vibrate?.(ms);
}

// Fullscreen play mode: on touch devices the board takes over the viewport
// and the thumbstick/action controls float on top of it.
function enterPlayMode(mode) {
  if (!coarsePointer.matches) {
    touch.hide();
    return;
  }
  enterTouchPlay();
  touch.show(mode, mode === 'battle' ? [0, 1] : [0]);
  touch.setLefty(progress.lefty);
  computeLayout();
}

function exitPlayMode() {
  touch.hide();
  exitTouchPlay();
  computeLayout();
}

function flashStatus(text) {
  statusEl.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusEl.textContent = '';
  }, 2600);
}

// --- Entities -------------------------------------------------------------

function makePlayer(id, controls) {
  return {
    id,
    controls,
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
    tween: null,
    dir: [0, 1],
    alive: true,
    lives: CAMPAIGN_LIVES,
    invulnMs: 0,
    bombCap: 1,
    bombsActive: 0,
    range: 1,
    speedLevel: 0,
    remote: false,
    kick: false,
    heldDirs: [],
    wantsBomb: false,
    wantsDetonate: false,
  };
}

function makeEnemy(spawn) {
  return {
    type: spawn.type,
    x: spawn.x,
    y: spawn.y,
    rx: spawn.x,
    ry: spawn.y,
    tween: null,
    dir: null,
    alive: true,
    speedMs: ENEMY_SPEED[spawn.type],
    seesPlayer: false,
    thinkCooldown: 0,
  };
}

function placeEntity(entity, x, y) {
  entity.x = x;
  entity.y = y;
  entity.rx = x;
  entity.ry = y;
  entity.tween = null;
}

function occupiedTile(entity) {
  return [Math.round(entity.rx), Math.round(entity.ry)];
}

function tweenDur(player) {
  return Math.max(TWEEN_MIN, TWEEN_BASE - TWEEN_STEP * player.speedLevel);
}

function tileAt(x, y) {
  if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) return T_HARD;
  return state.grid[y][x];
}

function bombAt(x, y) {
  return state.bombs.find((b) => b.x === x && b.y === y) || null;
}

function pickupAt(x, y) {
  return state.pickups.find((p) => p.x === x && p.y === y) || null;
}

function entityAt(x, y) {
  for (const p of state.players) {
    if (!p.alive) continue;
    const [px, py] = occupiedTile(p);
    if (px === x && py === y) return p;
  }
  for (const e of state.enemies) {
    const [ex, ey] = occupiedTile(e);
    if (ex === x && ey === y) return e;
  }
  return null;
}

// --- Game flow ------------------------------------------------------------

function setPhase(phase, ms = 0, banner = null) {
  state.phase = phase;
  state.phaseMs = ms;
  state.banner = banner;
}

function showOnly(overlay) {
  for (const el of [menuOverlay, pauseOverlay, endOverlay]) {
    el.hidden = el !== overlay;
  }
}

function showMenu() {
  state.screen = 'menu';
  state.paused = false;
  setPhase('idle');
  const unlocked = progress.unlocked;
  if (unlocked > 0 && unlocked < LEVELS.length) {
    btnContinue.hidden = false;
    btnContinue.textContent = `Continue — Level ${unlocked + 1}`;
  } else {
    btnContinue.hidden = true;
  }
  const { p1, p2 } = progress.battle;
  if (p1 || p2) {
    battleScoreEl.hidden = false;
    battleScoreEl.textContent = `Lifetime matches: P1 ${p1} — ${p2} P2`;
  } else {
    battleScoreEl.hidden = true;
  }
  hudCampaign.hidden = true;
  hudBattle.hidden = true;
  exitPlayMode();
  showOnly(menuOverlay);
  // Load a level as a dimmed backdrop behind the menu.
  loadGridOnly(Math.min(unlocked, LEVELS.length - 1));
}

function loadGridOnly(index) {
  const level = parseLevel(LEVELS[index]);
  state.grid = level.grid;
  state.cols = level.cols;
  state.rows = level.rows;
  state.hidden = new Map();
  state.exitRevealed = false;
  state.players = [];
  state.enemies = [];
  state.bombs = [];
  state.flames = [];
  state.pickups = [];
  state.particles = [];
  computeLayout();
}

// Power-ups a player would have collected finishing every level before
// `index` — used so "Continue" and "Try again" don't restart underpowered.
function applyCatchUp(player, index) {
  for (let i = 0; i < index; i++) {
    for (const type of LEVELS[i].drops) grantPickup(player, type);
  }
}

function startCampaign(index) {
  state.screen = 'campaign';
  state.paused = false;
  const player = makePlayer(0, CAMPAIGN_CONTROLS);
  applyCatchUp(player, index);
  state.players = [player];
  hudCampaign.hidden = false;
  hudBattle.hidden = true;
  showOnly(null);
  enterPlayMode('campaign');
  touch.setActionVisible(0, 'detonate', player.remote);
  loadCampaignLevel(index);
}

function loadCampaignLevel(index) {
  const level = parseLevel(LEVELS[index]);
  state.levelIndex = index;
  state.levelName = level.name;
  state.levelTimeMs = level.timeMs;
  state.grid = level.grid;
  state.cols = level.cols;
  state.rows = level.rows;
  state.hidden = level.hidden;
  state.exitRevealed = false;
  state.exitCell = null;
  for (const [key, value] of level.hidden) {
    if (value === 'exit') {
      const [x, y] = key.split(',').map(Number);
      state.exitCell = { x, y };
    }
  }
  state.playerStart = level.playerStart;
  state.enemies = level.enemySpawns.map(makeEnemy);
  state.bombs = [];
  state.flames = [];
  state.pickups = [];
  state.particles = [];
  state.suddenDeath = null;
  state.timeLeft = level.timeMs;
  const player = state.players[0];
  player.alive = true;
  player.heldDirs.length = 0;
  player.wantsBomb = false;
  player.wantsDetonate = false;
  player.bombsActive = 0;
  player.invulnMs = 0;
  placeEntity(player, level.playerStart.x, level.playerStart.y);
  computeLayout();
  setPhase('intro', INTRO_MS, {
    text: `Level ${index + 1} — ${level.name}`,
    sub: 'Defeat every enemy, then find the exit',
  });
}

function startBattle(bestOf) {
  state.screen = 'battle';
  state.paused = false;
  state.bestOf = bestOf;
  state.wins = [0, 0];
  state.round = 1;
  hudCampaign.hidden = true;
  hudBattle.hidden = false;
  showOnly(null);
  enterPlayMode('battle');
  startBattleRound();
}

function startBattleRound() {
  const arena = makeBattleArena();
  state.grid = arena.grid;
  state.cols = arena.cols;
  state.rows = arena.rows;
  state.hidden = arena.hidden;
  state.exitCell = null;
  state.exitRevealed = false;
  state.enemies = [];
  state.bombs = [];
  state.flames = [];
  state.pickups = [];
  state.particles = [];
  state.timeLeft = arena.timeMs;
  state.suddenDeath = null;
  const p1 = makePlayer(0, BATTLE_P1_CONTROLS);
  const p2 = makePlayer(1, BATTLE_P2_CONTROLS);
  // Battle starts a little hotter than the campaign so rounds move quickly.
  p1.range = 2;
  p2.range = 2;
  placeEntity(p1, arena.spawns[0].x, arena.spawns[0].y);
  placeEntity(p2, arena.spawns[1].x, arena.spawns[1].y);
  state.players = [p1, p2];
  touch.setActionVisible(0, 'detonate', false);
  touch.setActionVisible(1, 'detonate', false);
  computeLayout();
  setPhase('intro', INTRO_MS, {
    text: `Round ${state.round}`,
    sub: `P1 ${state.wins[0]} : ${state.wins[1]} P2 — first to ${winsNeeded()}`,
  });
}

function winsNeeded() {
  return Math.floor(state.bestOf / 2) + 1;
}

function showEnd(title, detail, againLabel, againAction) {
  endTitle.textContent = title;
  endDetail.textContent = detail;
  btnAgain.textContent = againLabel;
  state.endAction = againAction;
  setPhase('over');
  showOnly(endOverlay);
}

function quitToMenu() {
  showMenu();
}

function phaseEnded() {
  if (state.phase === 'intro') {
    setPhase('playing');
    return;
  }
  if (state.phase === 'dying') {
    const player = state.players[0];
    player.lives--;
    if (player.lives > 0) {
      player.alive = true;
      player.invulnMs = INVULN_MS;
      player.bombsActive = state.bombs.filter((b) => b.owner === player).length;
      placeEntity(player, state.playerStart.x, state.playerStart.y);
      state.timeLeft = state.levelTimeMs;
      flashStatus(`${player.lives} ${player.lives === 1 ? 'life' : 'lives'} left`);
      setPhase('playing');
    } else {
      showEnd(
        'Game over',
        `You reached level ${state.levelIndex + 1} — ${state.levelName}.`,
        'Try again',
        () => startCampaign(state.levelIndex)
      );
    }
    return;
  }
  if (state.phase === 'levelClear') {
    const next = state.levelIndex + 1;
    if (next >= LEVELS.length) {
      showEnd(
        'You win!',
        `All ${LEVELS.length} levels cleared. The arena is quiet at last.`,
        'Play again',
        () => startCampaign(0)
      );
    } else {
      loadCampaignLevel(next);
    }
    return;
  }
  if (state.phase === 'roundOver') {
    const needed = winsNeeded();
    if (state.wins[0] >= needed || state.wins[1] >= needed) {
      const winner = state.wins[0] >= needed ? 0 : 1;
      if (winner === 0) progress.battle.p1++;
      else progress.battle.p2++;
      saveProgress();
      showEnd(
        `Player ${winner + 1} wins the match!`,
        `Final score: P1 ${state.wins[0]} — ${state.wins[1]} P2.`,
        'Rematch',
        () => startBattle(state.bestOf)
      );
    } else {
      state.round++;
      startBattleRound();
    }
  }
}

// --- Update ---------------------------------------------------------------

function update(dt, now) {
  const playing = state.phase === 'playing';

  if (playing) {
    updateTimer(dt);
    for (const player of state.players) updatePlayer(player, dt);
  }
  if (playing || state.phase === 'dying') {
    updateEnemies(dt);
    updateBombs(dt);
  }
  updateFlames(dt);
  updateParticles(dt);
  if (playing || state.phase === 'dying') checkEnemyKills();
  if (playing) {
    checkPlayerKills();
    checkExit();
    if (state.screen === 'battle') checkRoundEnd();
  }
}

function updateTimer(dt) {
  if (state.timeLeft > 0) {
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    if (state.timeLeft === 0) {
      if (state.screen === 'battle') {
        state.suddenDeath = { cells: spiralCells(), index: 0, timer: 0 };
        flashStatus('Sudden death — the arena is closing in!');
      } else {
        flashStatus('Time up!');
        killPlayer(state.players[0]);
      }
    }
  }
  const sd = state.suddenDeath;
  if (sd) {
    sd.timer += dt;
    while (sd.timer >= SUDDEN_STEP_MS && sd.index < sd.cells.length) {
      sd.timer -= SUDDEN_STEP_MS;
      closeCell(sd.cells[sd.index++]);
    }
  }
}

function spiralCells() {
  const cells = [];
  let left = 1;
  let right = state.cols - 2;
  let top = 1;
  let bottom = state.rows - 2;
  while (left <= right && top <= bottom) {
    for (let x = left; x <= right; x++) cells.push([x, top]);
    for (let y = top + 1; y <= bottom; y++) cells.push([right, y]);
    if (top < bottom) for (let x = right - 1; x >= left; x--) cells.push([x, bottom]);
    if (left < right) for (let y = bottom - 1; y > top; y--) cells.push([left, y]);
    left++;
    right--;
    top++;
    bottom--;
  }
  return cells;
}

function closeCell([x, y]) {
  state.grid[y][x] = T_HARD;
  state.hidden.delete(cellKey(x, y));
  const bomb = bombAt(x, y);
  if (bomb) removeBomb(bomb);
  const pickup = pickupAt(x, y);
  if (pickup) state.pickups.splice(state.pickups.indexOf(pickup), 1);
  state.flames = state.flames.filter((f) => f.x !== x || f.y !== y);
  for (const player of state.players) {
    if (!player.alive) continue;
    const [px, py] = occupiedTile(player);
    if (px === x && py === y) killPlayer(player);
  }
  state.shake = Math.min(10, state.shake + 2);
  audio.play('tick');
}

function updatePlayer(player, dt) {
  if (!player.alive) return;
  if (player.invulnMs > 0) player.invulnMs -= dt;

  if (player.tween) {
    const tween = player.tween;
    tween.t += dt;
    const k = Math.min(1, tween.t / tween.dur);
    player.rx = tween.fx + (tween.tx - tween.fx) * k;
    player.ry = tween.fy + (tween.ty - tween.fy) * k;
    if (k >= 1) {
      player.tween = null;
      player.rx = player.x;
      player.ry = player.y;
    }
  }
  if (!player.tween) {
    const code = player.heldDirs[player.heldDirs.length - 1];
    const dir = code ? player.controls.moves[code] : null;
    if (dir) tryMovePlayer(player, dir);
  }
  if (player.wantsBomb) {
    player.wantsBomb = false;
    tryPlaceBomb(player);
  }
  if (player.wantsDetonate) {
    player.wantsDetonate = false;
    detonateRemote(player);
  }

  const [px, py] = occupiedTile(player);
  const pickup = pickupAt(px, py);
  if (pickup) {
    state.pickups.splice(state.pickups.indexOf(pickup), 1);
    grantPickup(player, pickup.type);
    audio.play('pickup');
    buzz(10);
    spawnParticles(px, py, 6, palette().pickupBorder);
    touch.setActionVisible(player.id, 'detonate', player.remote);
    updateHud();
  }
}

function tryMovePlayer(player, dir) {
  player.dir = dir;
  const nx = player.x + dir[0];
  const ny = player.y + dir[1];
  if (tileAt(nx, ny) !== T_EMPTY) return;
  const bomb = bombAt(nx, ny);
  if (bomb) {
    if (player.kick && !bomb.slide) kickBomb(bomb, dir);
    return;
  }
  player.x = nx;
  player.y = ny;
  player.tween = {
    fx: player.rx,
    fy: player.ry,
    tx: nx,
    ty: ny,
    t: 0,
    dur: tweenDur(player),
  };
}

function grantPickup(player, type) {
  if (type === 'bombs') player.bombCap = Math.min(8, player.bombCap + 1);
  else if (type === 'range') player.range = Math.min(8, player.range + 1);
  else if (type === 'speed') player.speedLevel = Math.min(4, player.speedLevel + 1);
  else if (type === 'remote') player.remote = true;
  else if (type === 'kick') player.kick = true;
}

function tryPlaceBomb(player) {
  if (player.bombsActive >= player.bombCap) return;
  const [x, y] = occupiedTile(player);
  if (tileAt(x, y) !== T_EMPTY || bombAt(x, y)) return;
  state.bombs.push({
    x,
    y,
    rx: x,
    ry: y,
    fuse: player.remote ? null : FUSE_MS,
    range: player.range,
    owner: player,
    slide: null,
  });
  player.bombsActive++;
  audio.play('place');
  buzz(15);
}

function detonateRemote(player) {
  if (!player.remote) return;
  const bomb = state.bombs.find((b) => b.owner === player && b.fuse === null);
  if (bomb) explodeBomb(bomb);
}

function kickBomb(bomb, dir) {
  const nx = bomb.x + dir[0];
  const ny = bomb.y + dir[1];
  if (tileAt(nx, ny) !== T_EMPTY || bombAt(nx, ny) || entityAt(nx, ny)) return;
  bomb.slide = { dx: dir[0], dy: dir[1], t: 0 };
  audio.play('kick');
}

function updateEnemies(dt) {
  const world = {
    grid: state.grid,
    cols: state.cols,
    rows: state.rows,
    bombs: state.bombs,
    flames: state.flames,
    players: state.players,
    dangerSet: null,
  };
  world.dangerSet = computeDangerTiles(world);

  for (const enemy of state.enemies) {
    if (enemy.tween) {
      const tween = enemy.tween;
      tween.t += dt;
      const k = Math.min(1, tween.t / tween.dur);
      enemy.rx = tween.fx + (tween.tx - tween.fx) * k;
      enemy.ry = tween.fy + (tween.ty - tween.fy) * k;
      if (k >= 1) {
        enemy.tween = null;
        enemy.rx = enemy.x;
        enemy.ry = enemy.y;
      }
    }
    if (!enemy.tween) {
      enemy.thinkCooldown -= dt;
      if (enemy.thinkCooldown <= 0) {
        const dir = chooseEnemyDir(enemy, world);
        if (dir && tileAt(enemy.x + dir[0], enemy.y + dir[1]) === T_EMPTY && !bombAt(enemy.x + dir[0], enemy.y + dir[1])) {
          enemy.dir = dir;
          enemy.x += dir[0];
          enemy.y += dir[1];
          enemy.tween = {
            fx: enemy.rx,
            fy: enemy.ry,
            tx: enemy.x,
            ty: enemy.y,
            t: 0,
            dur: enemy.speedMs,
          };
        } else {
          enemy.thinkCooldown = 250;
        }
      }
    }
  }
}

function updateBombs(dt) {
  for (const bomb of [...state.bombs]) {
    if (!state.bombs.includes(bomb)) continue;
    if (bomb.slide) {
      const slide = bomb.slide;
      slide.t += dt;
      const k = Math.min(1, slide.t / SLIDE_MS);
      bomb.rx = bomb.x + slide.dx * k;
      bomb.ry = bomb.y + slide.dy * k;
      if (k >= 1) {
        bomb.x += slide.dx;
        bomb.y += slide.dy;
        bomb.rx = bomb.x;
        bomb.ry = bomb.y;
        const nx = bomb.x + slide.dx;
        const ny = bomb.y + slide.dy;
        if (tileAt(nx, ny) === T_EMPTY && !bombAt(nx, ny) && !entityAt(nx, ny)) {
          slide.t = 0;
        } else {
          bomb.slide = null;
        }
      }
    }
    if (state.flames.some((f) => f.x === bomb.x && f.y === bomb.y)) {
      explodeBomb(bomb);
      continue;
    }
    if (bomb.fuse !== null) {
      bomb.fuse -= dt;
      if (bomb.fuse <= 0) explodeBomb(bomb);
    }
  }
}

function removeBomb(bomb) {
  const index = state.bombs.indexOf(bomb);
  if (index >= 0) state.bombs.splice(index, 1);
  bomb.owner.bombsActive = Math.max(0, bomb.owner.bombsActive - 1);
}

function explodeBomb(first) {
  const queue = [first];
  const seen = new Set([first]);
  const pal = palette();
  while (queue.length) {
    const bomb = queue.shift();
    removeBomb(bomb);
    addFlame(bomb.x, bomb.y);
    spawnParticles(bomb.x, bomb.y, 8, pal.particleBoom);
    for (const [dx, dy] of DIRS) {
      for (let i = 1; i <= bomb.range; i++) {
        const x = bomb.x + dx * i;
        const y = bomb.y + dy * i;
        const tile = tileAt(x, y);
        if (tile === T_HARD) break;
        if (tile === T_SOFT) {
          destroySoft(x, y);
          break;
        }
        const other = bombAt(x, y);
        if (other) {
          if (!seen.has(other)) {
            seen.add(other);
            queue.push(other);
          }
          break;
        }
        addFlame(x, y);
        const pickup = pickupAt(x, y);
        if (pickup) {
          state.pickups.splice(state.pickups.indexOf(pickup), 1);
          spawnParticles(x, y, 5, pal.particleBoom);
          break;
        }
      }
    }
  }
  state.shake = Math.min(11, state.shake + 6);
  audio.play('boom');
  buzz(35);
}

function addFlame(x, y) {
  state.flames.push({ x, y, life: FLAME_MS });
}

function destroySoft(x, y) {
  state.grid[y][x] = T_EMPTY;
  addFlame(x, y);
  spawnParticles(x, y, 9, palette().particleBlock);
  const key = cellKey(x, y);
  const hiddenItem = state.hidden.get(key);
  if (hiddenItem) {
    state.hidden.delete(key);
    if (hiddenItem === 'exit') {
      state.exitRevealed = true;
      flashStatus('The exit has been revealed!');
    } else {
      state.pickups.push({ x, y, type: hiddenItem });
    }
  }
}

function updateFlames(dt) {
  for (const flame of state.flames) flame.life -= dt;
  state.flames = state.flames.filter((f) => f.life > 0);
}

function spawnParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    state.particles.push({
      x: x + 0.5 + (Math.random() - 0.5) * 0.4,
      y: y + 0.5 + (Math.random() - 0.5) * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 350 + Math.random() * 300,
      maxLife: 650,
      size: 0.08 + Math.random() * 0.12,
      color,
    });
  }
}

function updateParticles(dt) {
  const seconds = dt / 1000;
  for (const p of state.particles) {
    p.x += p.vx * seconds;
    p.y += p.vy * seconds;
    p.vy += 7 * seconds;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}

function checkEnemyKills() {
  if (!state.enemies.length) return;
  const flameSet = new Set(state.flames.map((f) => cellKey(f.x, f.y)));
  const survivors = [];
  for (const enemy of state.enemies) {
    const [ex, ey] = occupiedTile(enemy);
    if (flameSet.has(cellKey(ex, ey))) {
      spawnParticles(enemy.rx, enemy.ry, 10, palette()[enemy.type]);
      audio.play('enemyDie');
    } else {
      survivors.push(enemy);
    }
  }
  if (survivors.length !== state.enemies.length) {
    state.enemies = survivors;
    if (!survivors.length && state.exitRevealed) {
      flashStatus('The exit is open!');
    } else if (!survivors.length) {
      flashStatus('All enemies down — find the exit!');
    }
  }
}

function checkPlayerKills() {
  const flameSet = new Set(state.flames.map((f) => cellKey(f.x, f.y)));
  for (const player of state.players) {
    if (!player.alive || player.invulnMs > 0) continue;
    const [px, py] = occupiedTile(player);
    let dead = flameSet.has(cellKey(px, py));
    if (!dead) {
      for (const enemy of state.enemies) {
        if (Math.abs(enemy.rx - player.rx) < 0.65 && Math.abs(enemy.ry - player.ry) < 0.65) {
          dead = true;
          break;
        }
      }
    }
    if (dead) killPlayer(player);
  }
}

function killPlayer(player) {
  if (!player.alive) return;
  player.alive = false;
  player.heldDirs.length = 0;
  spawnParticles(player.rx, player.ry, 14, player.id === 0 ? palette().p1Body : palette().p2Body);
  audio.play('die');
  buzz(80);
  state.shake = Math.min(11, state.shake + 4);
  if (state.screen === 'campaign') {
    setPhase('dying', DYING_MS);
  }
}

function checkRoundEnd() {
  const alive = state.players.filter((p) => p.alive);
  if (alive.length > 1) return;
  let text;
  if (alive.length === 1) {
    state.wins[alive[0].id]++;
    text = `Player ${alive[0].id + 1} takes the round!`;
    audio.play('roundWin');
  } else {
    text = 'Draw — no one survives!';
  }
  updateHud(true);
  setPhase('roundOver', ROUND_OVER_MS, {
    text,
    sub: `P1 ${state.wins[0]} : ${state.wins[1]} P2`,
  });
}

function checkExit() {
  if (state.screen !== 'campaign' || !state.exitRevealed || state.enemies.length) return;
  const player = state.players[0];
  if (!player.alive) return;
  const [px, py] = occupiedTile(player);
  if (px === state.exitCell.x && py === state.exitCell.y && !player.tween) {
    progress.unlocked = Math.max(progress.unlocked, state.levelIndex + 1);
    saveProgress();
    audio.play('exit');
    setPhase('levelClear', CLEAR_MS, {
      text: `Level ${state.levelIndex + 1} clear!`,
      sub: state.levelIndex + 1 < LEVELS.length ? 'Get ready…' : 'That was the last one!',
    });
  }
}

// --- Rendering ------------------------------------------------------------

function computeLayout() {
  if (!state.cols) return;
  let availW;
  let availH;
  let tileMin = TILE_MIN;
  let tileMax = TILE_MAX;
  if (document.body.classList.contains('touch-play')) {
    // Fullscreen play mode: the board must always fit the viewport whole,
    // under the 44px HUD strip. Controls float on top and reserve no space.
    availW = window.innerWidth - 8;
    availH = window.innerHeight - 52;
    tileMin = 8;
    tileMax = 56;
  } else {
    availW = Math.min(760, Math.max(280, mainEl.clientWidth - 32));
    availH = Math.max(320, window.innerHeight - 300);
  }
  state.tile = Math.max(
    tileMin,
    Math.min(
      tileMax,
      Math.floor(
        Math.min((availW - PAD * 2) / state.cols, (availH - PAD * 2) / state.rows)
      )
    )
  );
  const width = state.cols * state.tile + PAD * 2;
  const height = state.rows * state.tile + PAD * 2;
  const ratio = window.devicePixelRatio || 1;
  state.pixelRatio = ratio;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function cellOrigin(x, y) {
  return [PAD + x * state.tile, PAD + y * state.tile];
}

function draw(now) {
  if (!state.cols) return;
  const pal = palette();
  const t = state.tile;
  const w = canvas.width / state.pixelRatio;
  const h = canvas.height / state.pixelRatio;

  ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = pal.floorB;
  ctx.fillRect(0, 0, w, h);

  if (state.shake > 0.3) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
    state.shake *= 0.88;
  } else {
    state.shake = 0;
  }

  // Floor checker.
  for (let y = 0; y < state.rows; y++) {
    for (let x = 0; x < state.cols; x++) {
      const [ox, oy] = cellOrigin(x, y);
      ctx.fillStyle = (x + y) % 2 ? pal.floorA : pal.floorB;
      ctx.fillRect(ox, oy, t, t);
    }
  }

  if (state.exitRevealed && state.exitCell) drawExit(pal, t, now);
  for (const pickup of state.pickups) drawPickup(pickup, pal, t);

  for (let y = 0; y < state.rows; y++) {
    for (let x = 0; x < state.cols; x++) {
      const tile = state.grid[y][x];
      if (tile === T_HARD) drawHard(x, y, pal, t);
      else if (tile === T_SOFT) drawSoft(x, y, pal, t);
    }
  }

  for (const bomb of state.bombs) drawBomb(bomb, pal, t, now);
  for (const flame of state.flames) drawFlame(flame, pal, t);
  for (const enemy of state.enemies) drawEnemy(enemy, pal, t, now);
  for (const player of state.players) drawPlayer(player, pal, t, now);
  drawParticles(pal, t);

  ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
  if (state.banner && state.phase !== 'playing') drawBanner(pal, w, h);
}

function drawHard(x, y, pal, t) {
  const [ox, oy] = cellOrigin(x, y);
  ctx.fillStyle = pal.hard;
  ctx.fillRect(ox, oy, t, t);
  ctx.fillStyle = pal.hardTop;
  ctx.fillRect(ox, oy, t, t * 0.18);
  ctx.fillRect(ox, oy, t * 0.12, t);
  ctx.fillStyle = pal.hardShadow;
  ctx.fillRect(ox, oy + t * 0.85, t, t * 0.15);
  ctx.fillRect(ox + t * 0.88, oy, t * 0.12, t);
}

function drawSoft(x, y, pal, t) {
  const [ox, oy] = cellOrigin(x, y);
  ctx.fillStyle = pal.soft;
  ctx.fillRect(ox + 1, oy + 1, t - 2, t - 2);
  ctx.fillStyle = pal.softTop;
  ctx.fillRect(ox + 1, oy + 1, t - 2, t * 0.15);
  ctx.strokeStyle = pal.softLine;
  ctx.lineWidth = Math.max(1, t * 0.04);
  ctx.beginPath();
  const third = (t - 2) / 3;
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(ox + 1, oy + 1 + third * i);
    ctx.lineTo(ox + t - 1, oy + 1 + third * i);
  }
  ctx.moveTo(ox + t * 0.5, oy + 1);
  ctx.lineTo(ox + t * 0.5, oy + 1 + third);
  ctx.moveTo(ox + t * 0.28, oy + 1 + third);
  ctx.lineTo(ox + t * 0.28, oy + 1 + third * 2);
  ctx.moveTo(ox + t * 0.72, oy + 1 + third);
  ctx.lineTo(ox + t * 0.72, oy + 1 + third * 2);
  ctx.moveTo(ox + t * 0.5, oy + 1 + third * 2);
  ctx.lineTo(ox + t * 0.5, oy + t - 1);
  ctx.stroke();
}

function drawExit(pal, t, now) {
  const { x, y } = state.exitCell;
  const [ox, oy] = cellOrigin(x, y);
  const open = !state.enemies.length;
  ctx.fillStyle = pal.exit;
  ctx.fillRect(ox + t * 0.08, oy + t * 0.08, t * 0.84, t * 0.84);
  ctx.fillStyle = pal.exitDoor;
  ctx.beginPath();
  ctx.moveTo(ox + t * 0.25, oy + t * 0.9);
  ctx.lineTo(ox + t * 0.25, oy + t * 0.45);
  ctx.arc(ox + t * 0.5, oy + t * 0.45, t * 0.25, Math.PI, 0);
  ctx.lineTo(ox + t * 0.75, oy + t * 0.9);
  ctx.closePath();
  ctx.fill();
  if (open) {
    const glow = 0.5 + 0.5 * Math.sin(now / 220);
    ctx.strokeStyle = pal.exitGlow;
    ctx.globalAlpha = 0.35 + glow * 0.55;
    ctx.lineWidth = Math.max(2, t * 0.08);
    ctx.strokeRect(ox + t * 0.06, oy + t * 0.06, t * 0.88, t * 0.88);
    ctx.globalAlpha = 1;
  }
}

function drawPickup(pickup, pal, t) {
  const [ox, oy] = cellOrigin(pickup.x, pickup.y);
  ctx.fillStyle = pal.pickupBg;
  ctx.strokeStyle = pal.pickupBorder;
  ctx.lineWidth = Math.max(1.5, t * 0.05);
  const inset = t * 0.14;
  roundRect(ox + inset, oy + inset, t - inset * 2, t - inset * 2, t * 0.14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = pal.pickupText;
  ctx.font = `bold ${Math.round(t * (pickup.type === 'remote' ? 0.32 : 0.44))}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(PICKUP_LABELS[pickup.type], ox + t * 0.5, oy + t * 0.54);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBomb(bomb, pal, t, now) {
  const [ox, oy] = cellOrigin(bomb.rx, bomb.ry);
  const cx = ox + t * 0.5;
  const cy = oy + t * 0.55;
  const urgency = bomb.fuse === null ? 0.4 : Math.max(0.4, 1.6 - bomb.fuse / FUSE_MS);
  const pulse = 1 + 0.05 * Math.sin((now / 90) * urgency * 2);
  const r = t * 0.3 * pulse;
  ctx.fillStyle = pal.bomb;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.bombShine;
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Fuse (or antenna for remote bombs).
  ctx.strokeStyle = pal.bomb;
  ctx.lineWidth = Math.max(1.5, t * 0.06);
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + t * 0.1, cy - r - t * 0.12, cx + t * 0.18, cy - r - t * 0.08);
  ctx.stroke();
  if (bomb.fuse === null) {
    ctx.fillStyle = pal.exitGlow;
    ctx.beginPath();
    ctx.arc(cx + t * 0.18, cy - r - t * 0.08, t * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const spark = 0.6 + 0.4 * Math.sin(now / 50);
    ctx.fillStyle = pal.fuse;
    ctx.globalAlpha = spark;
    ctx.beginPath();
    ctx.arc(cx + t * 0.18, cy - r - t * 0.08, t * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawFlame(flame, pal, t) {
  const [ox, oy] = cellOrigin(flame.x, flame.y);
  const alpha = Math.min(1, flame.life / FLAME_FADE_MS);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = pal.flameEdge;
  roundRect(ox + t * 0.06, oy + t * 0.06, t * 0.88, t * 0.88, t * 0.3);
  ctx.fill();
  ctx.fillStyle = pal.flameCore;
  roundRect(ox + t * 0.24, oy + t * 0.24, t * 0.52, t * 0.52, t * 0.22);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawEnemy(enemy, pal, t, now) {
  const [ox, oy] = cellOrigin(enemy.rx, enemy.ry);
  const cx = ox + t * 0.5;
  const bob = enemy.tween ? Math.sin(now / 90) * t * 0.03 : 0;
  const cy = oy + t * 0.52 + bob;
  const r = t * 0.32;
  const color = pal[enemy.type];

  if (enemy.type === 'chaser') {
    // Spiky ball.
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = i % 2 ? r : r * 1.25;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else if (enemy.type === 'smart') {
    // Boxy robot with an antenna.
    ctx.fillStyle = color;
    roundRect(cx - r, cy - r * 0.9, r * 2, r * 1.8, t * 0.1);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, t * 0.05);
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.9);
    ctx.lineTo(cx, cy - r * 1.3);
    ctx.stroke();
    ctx.fillStyle = pal.fuse;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 1.35, t * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Round balloon with a wavy bottom.
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.15, r, Math.PI, 0);
    const waves = 4;
    for (let i = 0; i <= waves; i++) {
      const wx = cx + r - (i * 2 * r) / waves;
      const wy = cy - r * 0.15 + r * (i % 2 ? 0.75 : 0.95);
      ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Eyes, glancing in the walking direction (flash for a spotting chaser).
  const lookX = (enemy.dir?.[0] || 0) * t * 0.05;
  const lookY = (enemy.dir?.[1] || 0) * t * 0.05;
  const eyeY = cy - r * 0.2;
  ctx.fillStyle = enemy.seesPlayer && Math.floor(now / 160) % 2 ? pal.fuse : pal.enemyEye;
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, eyeY, r * 0.24, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.35, eyeY, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.enemyPupil;
  ctx.beginPath();
  ctx.arc(cx - r * 0.35 + lookX, eyeY + lookY, r * 0.1, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.35 + lookX, eyeY + lookY, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(player, pal, t, now) {
  if (!player.alive) return;
  if (player.invulnMs > 0 && Math.floor(now / 120) % 2) return;
  const [ox, oy] = cellOrigin(player.rx, player.ry);
  const cx = ox + t * 0.5;
  const bob = player.tween ? Math.sin(now / 55) * t * 0.03 : 0;
  const cy = oy + t * 0.5 + bob;
  const body = player.id === 0 ? pal.p1Body : pal.p2Body;
  const trim = player.id === 0 ? pal.p1Trim : pal.p2Trim;

  // Feet.
  ctx.fillStyle = trim;
  const step = player.tween ? Math.sin(now / 70) * t * 0.08 : 0;
  ctx.beginPath();
  ctx.ellipse(cx - t * 0.14 + step * player.dir[0] * 0.3, cy + t * 0.36, t * 0.11, t * 0.07, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + t * 0.14 - step * player.dir[0] * 0.3, cy + t * 0.36, t * 0.11, t * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body.
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + t * 0.14, t * 0.24, t * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helmet-head.
  ctx.fillStyle = trim;
  ctx.beginPath();
  ctx.arc(cx, cy - t * 0.12, t * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Visor with eyes, shifted toward the facing direction.
  const vx = cx + player.dir[0] * t * 0.06;
  const vy = cy - t * 0.1 + Math.max(0, player.dir[1]) * t * 0.04;
  ctx.fillStyle = pal.skin;
  roundRect(vx - t * 0.16, vy - t * 0.07, t * 0.32, t * 0.15, t * 0.07);
  ctx.fill();
  ctx.fillStyle = pal.enemyPupil;
  ctx.beginPath();
  ctx.arc(vx - t * 0.07, vy, t * 0.03, 0, Math.PI * 2);
  ctx.arc(vx + t * 0.07, vy, t * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Helmet stripe.
  ctx.strokeStyle = body;
  ctx.lineWidth = Math.max(1.5, t * 0.06);
  ctx.beginPath();
  ctx.arc(cx, cy - t * 0.12, t * 0.26, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function drawParticles(pal, t) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 300));
    ctx.fillStyle = p.color;
    const size = p.size * t;
    ctx.fillRect(PAD + p.x * t - size / 2, PAD + p.y * t - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

function drawBanner(pal, w, h) {
  const bannerH = 84;
  const y = h / 2 - bannerH / 2;
  ctx.fillStyle = pal.banner;
  ctx.fillRect(0, y, w, bannerH);
  ctx.fillStyle = pal.bannerText;
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.banner.text, w / 2, y + (state.banner.sub ? 32 : 42));
  if (state.banner.sub) {
    ctx.font = '15px system-ui, sans-serif';
    ctx.globalAlpha = 0.85;
    ctx.fillText(state.banner.sub, w / 2, y + 60);
    ctx.globalAlpha = 1;
  }
}

// --- HUD ------------------------------------------------------------------

const hudCache = {};

function setHud(el, text) {
  if (hudCache[el.id] !== text) {
    hudCache[el.id] = text;
    el.textContent = text;
  }
}

function formatTime(ms) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function powerBadges(player) {
  let badges = `B${player.bombCap} R${player.range} S${player.speedLevel}`;
  if (player.remote) badges += ' RC';
  if (player.kick) badges += ' K';
  return badges;
}

function updateHud() {
  if (state.screen === 'campaign') {
    const player = state.players[0];
    setHud(hudLevel, `${state.levelIndex + 1} / ${LEVELS.length}`);
    setHud(hudLives, '♥'.repeat(Math.max(0, player.lives)) || '—');
    setHud(hudTime, formatTime(state.timeLeft));
    hudTime.classList.toggle('warning', state.timeLeft < 30000);
    setHud(hudPower, powerBadges(player));
    setHud(fsLeft, `L${state.levelIndex + 1} ${'♥'.repeat(Math.max(0, player.lives))}`);
    setHud(fsMid, formatTime(state.timeLeft));
    setHud(fsRight, powerBadges(player));
  } else if (state.screen === 'battle') {
    setHud(hudRound, `${state.round} (best of ${state.bestOf})`);
    setHud(hudP1, String(state.wins[0]));
    setHud(hudP2, String(state.wins[1]));
    setHud(hudBTime, state.suddenDeath ? 'Sudden death!' : formatTime(state.timeLeft));
    hudBTime.classList.toggle('warning', state.timeLeft < 30000);
    setHud(fsLeft, `P1 ${state.wins[0]}`);
    setHud(
      fsMid,
      state.suddenDeath ? 'Sudden death!' : `R${state.round} · ${formatTime(state.timeLeft)}`
    );
    setHud(fsRight, `${state.wins[1]} P2`);
  }
}

// --- Main loop ------------------------------------------------------------

function frame(now) {
  const dt = Math.min(50, now - state.lastTime || 16);
  state.lastTime = now;
  if (!state.paused && state.screen !== 'menu' && state.phase !== 'over') {
    update(dt, now);
    if (state.phaseMs > 0) {
      state.phaseMs -= dt;
      if (state.phaseMs <= 0) phaseEnded();
    }
  }
  draw(now);
  if (state.screen !== 'menu') updateHud();
  requestAnimationFrame(frame);
}

// --- Input ----------------------------------------------------------------

function togglePause() {
  if (state.screen === 'menu' || state.phase === 'over') return;
  state.paused = !state.paused;
  showOnly(state.paused ? pauseOverlay : null);
  if (state.paused) {
    for (const player of state.players) player.heldDirs.length = 0;
  }
}

function toggleMute() {
  progress.muted = !progress.muted;
  audio.setMuted(progress.muted);
  syncMuteButtons();
  saveProgress();
}

function syncMuteButtons() {
  muteBtn.textContent = progress.muted ? 'Sound: off' : 'Sound: on';
  muteBtn.setAttribute('aria-pressed', String(progress.muted));
  fsMute.textContent = progress.muted ? '🔇' : '🔊';
}

function toggleLefty() {
  progress.lefty = !progress.lefty;
  touch.setLefty(progress.lefty);
  syncLeftyButton();
  saveProgress();
}

function syncLeftyButton() {
  btnLefty.hidden = !coarsePointer.matches;
  btnLefty.textContent = progress.lefty ? 'Controls: left-handed' : 'Controls: right-handed';
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyM') {
    toggleMute();
    return;
  }
  if (event.code === 'Escape') {
    togglePause();
    return;
  }
  if (state.screen === 'menu' || state.paused || state.phase === 'over') return;
  let handled = false;
  for (const player of state.players) {
    const controls = player.controls;
    if (controls.moves[event.code]) {
      if (!event.repeat && !player.heldDirs.includes(event.code)) {
        player.heldDirs.push(event.code);
      }
      handled = true;
    } else if (controls.bomb.has(event.code)) {
      if (!event.repeat) player.wantsBomb = true;
      handled = true;
    } else if (controls.detonate.has(event.code)) {
      if (!event.repeat) player.wantsDetonate = true;
      handled = true;
    }
  }
  if (handled) event.preventDefault();
});

window.addEventListener('keyup', (event) => {
  for (const player of state.players) {
    const index = player.heldDirs.indexOf(event.code);
    if (index >= 0) player.heldDirs.splice(index, 1);
  }
});

window.addEventListener('blur', () => {
  for (const player of state.players) player.heldDirs.length = 0;
  if (!state.paused && state.screen !== 'menu' && state.phase === 'playing') {
    togglePause();
  }
});

// Touch controls (shared/touch.js) feed the same per-player input model as
// the keyboard: the stick swaps a single synthetic stick-* code in heldDirs,
// buttons set the wants* flags.
const touch = createTouchControls({
  container: document.querySelector('.board-wrap'),
  actions: [
    { id: 'detonate', label: '⚡', ariaLabel: 'detonate', hidden: true },
    { id: 'bomb', label: '💣', ariaLabel: 'drop bomb' },
  ],
  onDirection(playerId, dir) {
    const player = state.players[playerId];
    if (!player) return;
    player.heldDirs = player.heldDirs.filter((c) => !c.startsWith('stick-'));
    if (dir && !state.paused) player.heldDirs.push(`stick-${dir}`);
  },
  onAction(playerId, actionId) {
    const player = state.players[playerId];
    if (!player || state.paused || state.phase === 'over') return;
    if (actionId === 'bomb') player.wantsBomb = true;
    else if (actionId === 'detonate') player.wantsDetonate = true;
  },
});

// Buttons blur themselves after clicks so Space/Enter don't re-trigger them.
function onClick(btn, handler) {
  btn.addEventListener('click', () => {
    handler();
    btn.blur();
  });
}

onClick(btnContinue, () => startCampaign(progress.unlocked));
onClick(btnNew, () => startCampaign(0));
onClick(btnBattle3, () => startBattle(3));
onClick(btnBattle5, () => startBattle(5));
onClick(btnResume, togglePause);
onClick(btnQuit, quitToMenu);
onClick(btnMenu, quitToMenu);
onClick(btnAgain, () => {
  if (state.endAction) state.endAction();
});
onClick(menuBtn, quitToMenu);
onClick(muteBtn, toggleMute);
onClick(btnLefty, toggleLefty);
onClick(fsPause, togglePause);
onClick(fsMute, toggleMute);

window.addEventListener('resize', computeLayout);
window.visualViewport?.addEventListener('resize', computeLayout);
document.addEventListener('fullscreenchange', computeLayout);
darkScheme.addEventListener?.('change', () => {
  // Palette is re-read every frame; nothing to do beyond letting rAF redraw.
});

// --- Init -----------------------------------------------------------------

if (import.meta.env?.DEV) window.__bmState = state;

audio.setMuted(progress.muted);
syncMuteButtons();
syncLeftyButton();
touch.setLefty(progress.lefty);
showMenu();
requestAnimationFrame((now) => {
  state.lastTime = now;
  requestAnimationFrame(frame);
});
