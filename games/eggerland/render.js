// Procedural rendering for Eggerland: terrain is pre-rendered once per
// room/size/palette to an offscreen canvas; movers are drawn per frame.
// The visible board is the 14×10 room plus a one-tile brick border with
// door gaps, so canvas space is (ROOM_W+2) × (ROOM_H+2) tiles.

import { ROOM_W, ROOM_H } from './rooms.js';

export const PALETTES = {
  light: {
    bg: '#c9a37e',
    floorA: '#a46b46',
    floorB: '#9d6541',
    brick: '#b8b0a4',
    brickMortar: '#8d8578',
    doorFrame: '#e0b64e',
    doorClosed: '#6e4a30',
    tree: '#2f8f3e',
    treeDark: '#1f6b2c',
    trunk: '#6e4426',
    rock: '#8f8677',
    rockDark: '#6b6355',
    water: '#3d78d8',
    waterLight: '#6ea0ec',
    lava: '#d8452b',
    lavaLight: '#f2913f',
    sand: '#d9b36a',
    sandDark: '#c29a4f',
    arrow: '#f0e6d2',
    heart: '#e33549',
    heartDark: '#a01f30',
    chest: '#8a5a2b',
    chestDark: '#5d3b1a',
    jewel: '#3fd0e0',
    emerald: '#35b055',
    emeraldDark: '#1f7a38',
    emeraldLight: '#7fe09a',
    egg: '#f3ead7',
    eggDark: '#c9bda0',
    playerBody: '#3b82f6',
    playerDark: '#1d4ed8',
    playerFace: '#f5e0c8',
    snakey: '#4cae4c',
    snakeyDark: '#2e7d32',
    leeper: '#a06ad0',
    leeperDark: '#6d3fa0',
    medusa: '#2e8b57',
    medusaDark: '#14532d',
    donMedusa: '#b03060',
    gol: '#9aa2ad',
    golDark: '#5f6771',
    skull: '#efe9df',
    skullDark: '#b7ad9c',
    rocky: '#b0793d',
    rockyDark: '#7c5226',
    alma: '#e08030',
    almaDark: '#a4551b',
    shot: '#fff6c8',
    fireball: '#ff7f2a',
    shadow: 'rgba(0, 0, 0, 0.22)',
  },
  dark: {
    bg: '#3a281c',
    floorA: '#4e3423',
    floorB: '#48301f',
    brick: '#6d675e',
    brickMortar: '#4b463f',
    doorFrame: '#c69a35',
    doorClosed: '#382516',
    tree: '#27793a',
    treeDark: '#175427',
    trunk: '#5a3a22',
    rock: '#6e6759',
    rockDark: '#4d473c',
    water: '#2d5cb0',
    waterLight: '#4d7fd0',
    lava: '#c23a22',
    lavaLight: '#e07f33',
    sand: '#b08e4e',
    sandDark: '#93743a',
    arrow: '#e5d9bd',
    heart: '#d92b40',
    heartDark: '#8c1a29',
    chest: '#7a4e23',
    chestDark: '#4e3115',
    jewel: '#37bcd0',
    emerald: '#2c9a49',
    emeraldDark: '#196630',
    emeraldLight: '#6ecb87',
    egg: '#e8dfc9',
    eggDark: '#b7ab8d',
    playerBody: '#60a5fa',
    playerDark: '#2563eb',
    playerFace: '#ecd2b5',
    snakey: '#43a047',
    snakeyDark: '#27632a',
    leeper: '#9257c8',
    leeperDark: '#613492',
    medusa: '#2a7d4f',
    medusaDark: '#0f4423',
    donMedusa: '#a02a55',
    gol: '#868e99',
    golDark: '#525a64',
    skull: '#e3dccf',
    skullDark: '#a89e8c',
    rocky: '#a06c34',
    rockyDark: '#6d4720',
    alma: '#d0742a',
    almaDark: '#944c17',
    shot: '#fff3ba',
    fireball: '#ff7524',
    shadow: 'rgba(0, 0, 0, 0.35)',
  },
};

export const BOARD_COLS = ROOM_W + 2;
export const BOARD_ROWS = ROOM_H + 2;

// --- Terrain layer -----------------------------------------------------

export function renderTerrain(canvas, room, tile, pal, doorsOpen) {
  canvas.width = BOARD_COLS * tile;
  canvas.height = BOARD_ROWS * tile;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROOM_H; y++) {
    for (let x = 0; x < ROOM_W; x++) {
      drawTerrainTile(ctx, room.terrain[y][x], (x + 1) * tile, (y + 1) * tile, tile, pal, x, y);
    }
  }
  drawBorder(ctx, room, tile, pal, doorsOpen);
  return ctx;
}

function drawFloorBase(ctx, px, py, t, pal, gx, gy) {
  ctx.fillStyle = (gx + gy) % 2 === 0 ? pal.floorA : pal.floorB;
  ctx.fillRect(px, py, t, t);
}

function drawTerrainTile(ctx, ch, px, py, t, pal, gx, gy) {
  switch (ch) {
    case '~': {
      ctx.fillStyle = pal.water;
      ctx.fillRect(px, py, t, t);
      ctx.strokeStyle = pal.waterLight;
      ctx.lineWidth = Math.max(1, t * 0.06);
      ctx.beginPath();
      for (const fy of [0.3, 0.7]) {
        const wy = py + t * fy + ((gx + gy) % 2) * t * 0.08;
        ctx.moveTo(px + t * 0.12, wy);
        ctx.quadraticCurveTo(px + t * 0.35, wy - t * 0.12, px + t * 0.55, wy);
        ctx.quadraticCurveTo(px + t * 0.75, wy + t * 0.12, px + t * 0.9, wy);
      }
      ctx.stroke();
      break;
    }
    case 'L': {
      ctx.fillStyle = pal.lava;
      ctx.fillRect(px, py, t, t);
      ctx.fillStyle = pal.lavaLight;
      const r = t * 0.09;
      for (const [fx, fy] of [
        [0.3, 0.35],
        [0.7, 0.6],
        [0.45, 0.8],
      ]) {
        ctx.beginPath();
        ctx.arc(px + t * fx + ((gx * 7 + gy * 3) % 3) * t * 0.05, py + t * fy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 's': {
      ctx.fillStyle = pal.sand;
      ctx.fillRect(px, py, t, t);
      ctx.strokeStyle = pal.sandDark;
      ctx.lineWidth = Math.max(1, t * 0.05);
      ctx.beginPath();
      for (const fy of [0.35, 0.75]) {
        ctx.moveTo(px + t * 0.15, py + t * fy);
        ctx.quadraticCurveTo(px + t * 0.5, py + t * (fy - 0.14), px + t * 0.85, py + t * fy);
      }
      ctx.stroke();
      break;
    }
    case 'T': {
      drawFloorBase(ctx, px, py, t, pal, gx, gy);
      ctx.fillStyle = pal.trunk;
      ctx.fillRect(px + t * 0.42, py + t * 0.6, t * 0.16, t * 0.3);
      for (const [r, fy, color] of [
        [0.34, 0.52, pal.treeDark],
        [0.3, 0.4, pal.tree],
        [0.22, 0.26, pal.tree],
      ]) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px + t * 0.5, py + t * fy, t * r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case '#': {
      drawFloorBase(ctx, px, py, t, pal, gx, gy);
      ctx.fillStyle = pal.rockDark;
      ctx.beginPath();
      ctx.moveTo(px + t * 0.12, py + t * 0.88);
      ctx.lineTo(px + t * 0.18, py + t * 0.4);
      ctx.lineTo(px + t * 0.45, py + t * 0.14);
      ctx.lineTo(px + t * 0.8, py + t * 0.3);
      ctx.lineTo(px + t * 0.9, py + t * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = pal.rock;
      ctx.beginPath();
      ctx.moveTo(px + t * 0.2, py + t * 0.88);
      ctx.lineTo(px + t * 0.26, py + t * 0.46);
      ctx.lineTo(px + t * 0.48, py + t * 0.24);
      ctx.lineTo(px + t * 0.72, py + t * 0.4);
      ctx.lineTo(px + t * 0.78, py + t * 0.88);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case '^':
    case 'v':
    case '<':
    case '>': {
      drawFloorBase(ctx, px, py, t, pal, gx, gy);
      const cx = px + t / 2;
      const cy = py + t / 2;
      const s = t * 0.26;
      ctx.fillStyle = pal.arrow;
      ctx.save();
      ctx.translate(cx, cy);
      const angle = { '^': -Math.PI / 2, v: Math.PI / 2, '<': Math.PI, '>': 0 }[ch];
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(-s * 0.4, -s * 0.8);
      ctx.lineTo(-s * 0.4, -s * 0.3);
      ctx.lineTo(-s, -s * 0.3);
      ctx.lineTo(-s, s * 0.3);
      ctx.lineTo(-s * 0.4, s * 0.3);
      ctx.lineTo(-s * 0.4, s * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    default:
      drawFloorBase(ctx, px, py, t, pal, gx, gy);
  }
}

function drawBorder(ctx, room, tile, pal, doorsOpen) {
  const t = tile;
  const cells = [];
  for (let x = 0; x < BOARD_COLS; x++) cells.push([x, 0], [x, BOARD_ROWS - 1]);
  for (let y = 1; y < BOARD_ROWS - 1; y++) cells.push([0, y], [BOARD_COLS - 1, y]);

  const doors = {
    n: room.exits.n != null ? [room.exits.n + 1, 0] : null,
    s: room.exits.s != null ? [room.exits.s + 1, BOARD_ROWS - 1] : null,
    w: room.exits.w != null ? [0, room.exits.w + 1] : null,
    e: room.exits.e != null ? [BOARD_COLS - 1, room.exits.e + 1] : null,
  };

  for (const [x, y] of cells) {
    const px = x * t;
    const py = y * t;
    const doorSide = Object.keys(doors).find(
      (s) => doors[s] && doors[s][0] === x && doors[s][1] === y
    );
    if (doorSide) {
      // Door gap: golden frame, and a slab across it while closed.
      ctx.fillStyle = (x + y) % 2 === 0 ? pal.floorA : pal.floorB;
      ctx.fillRect(px, py, t, t);
      ctx.strokeStyle = pal.doorFrame;
      ctx.lineWidth = Math.max(2, t * 0.12);
      ctx.strokeRect(px + t * 0.08, py + t * 0.08, t * 0.84, t * 0.84);
      if (!doorsOpen) {
        ctx.fillStyle = pal.doorClosed;
        ctx.fillRect(px + t * 0.16, py + t * 0.16, t * 0.68, t * 0.68);
      }
      continue;
    }
    // Brick border, matching sokoban's two-course wall look.
    ctx.fillStyle = pal.brick;
    ctx.fillRect(px, py, t, t);
    ctx.strokeStyle = pal.brickMortar;
    ctx.lineWidth = Math.max(1, t * 0.05);
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
  }
}

// --- Movers & items ------------------------------------------------------

// All world→pixel conversion happens here: game coords are room tiles,
// the border shifts everything by one tile.
function org(v, tile) {
  return (v + 1) * tile;
}

export function drawHeart(ctx, x, y, tile, pal) {
  const px = org(x, tile);
  const py = org(y, tile);
  const t = tile;
  const cx = px + t / 2;
  ctx.fillStyle = pal.heart;
  ctx.beginPath();
  ctx.moveTo(cx, py + t * 0.78);
  ctx.bezierCurveTo(px + t * 0.06, py + t * 0.45, px + t * 0.2, py + t * 0.16, cx, py + t * 0.36);
  ctx.bezierCurveTo(px + t * 0.8, py + t * 0.16, px + t * 0.94, py + t * 0.45, cx, py + t * 0.78);
  ctx.fill();
  ctx.strokeStyle = pal.heartDark;
  ctx.lineWidth = Math.max(1, t * 0.05);
  ctx.stroke();
}

export function drawChest(ctx, chest, tile, pal, time) {
  const px = org(chest.x, tile);
  const py = org(chest.y, tile);
  const t = tile;
  if (chest.taken) return;
  if (!chest.open) {
    ctx.fillStyle = pal.chest;
    ctx.fillRect(px + t * 0.12, py + t * 0.22, t * 0.76, t * 0.6);
    ctx.fillStyle = pal.chestDark;
    ctx.fillRect(px + t * 0.12, py + t * 0.22, t * 0.76, t * 0.2);
    ctx.strokeStyle = pal.chestDark;
    ctx.lineWidth = Math.max(1, t * 0.06);
    ctx.strokeRect(px + t * 0.12, py + t * 0.22, t * 0.76, t * 0.6);
    ctx.fillStyle = pal.doorFrame;
    ctx.fillRect(px + t * 0.44, py + t * 0.38, t * 0.12, t * 0.18);
  } else {
    // Open chest with the jewel pulsing above it.
    ctx.fillStyle = pal.chestDark;
    ctx.fillRect(px + t * 0.12, py + t * 0.4, t * 0.76, t * 0.42);
    ctx.fillStyle = pal.chest;
    ctx.fillRect(px + t * 0.16, py + t * 0.46, t * 0.68, t * 0.32);
    const pulse = 0.85 + 0.15 * Math.sin(time * 5);
    const cx = px + t / 2;
    const cy = py + t * 0.3;
    const r = t * 0.2 * pulse;
    ctx.fillStyle = pal.jewel;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.8, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.8, cy);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawBlock(ctx, b, tile, pal) {
  const px = org(b.x, tile);
  const py = org(b.y, tile);
  const t = tile;
  if (b.kind === 'emerald') {
    const raft = b.mode === 'raft';
    const m = t * (raft ? 0.16 : 0.1);
    ctx.fillStyle = pal.emeraldDark;
    ctx.fillRect(px + m, py + m, t - m * 2, t - m * 2);
    const cx = px + t / 2;
    const cy = py + t / 2;
    const r = t * (raft ? 0.24 : 0.3);
    ctx.fillStyle = pal.emerald;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = pal.emeraldLight;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.5, cy - r * 0.5);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - r * 0.5, cy - r * 0.5);
    ctx.closePath();
    ctx.fill();
  } else {
    // Egg — slightly sunken when floating as a raft.
    const squash = b.mode === 'raft' ? 0.85 : 1;
    const cx = px + t / 2;
    const cy = py + t * (b.mode === 'raft' ? 0.58 : 0.52);
    ctx.fillStyle = pal.egg;
    ctx.beginPath();
    ctx.ellipse(cx, cy, t * 0.3, t * 0.38 * squash, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.eggDark;
    ctx.lineWidth = Math.max(1, t * 0.05);
    ctx.stroke();
  }
}

export function drawPlayer(ctx, p, tile, pal) {
  const px = org(p.x, tile);
  const py = org(p.y, tile);
  const t = tile;
  const cx = px + t / 2;
  const cy = py + t * 0.55;
  ctx.fillStyle = pal.shadow;
  ctx.beginPath();
  ctx.ellipse(cx, py + t * 0.85, t * 0.28, t * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Round little hero, Lolo-style.
  ctx.fillStyle = pal.playerBody;
  ctx.beginPath();
  ctx.arc(cx, cy, t * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.playerDark;
  ctx.beginPath();
  ctx.arc(cx, cy - t * 0.22, t * 0.2, Math.PI, Math.PI * 2);
  ctx.fill();
  // Face turned toward the walking direction.
  const fx = cx + p.dir[0] * t * 0.1;
  const fy = cy + p.dir[1] * t * 0.08;
  ctx.fillStyle = pal.playerFace;
  ctx.beginPath();
  ctx.arc(fx, fy, t * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c28';
  const eo = t * 0.07;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(fx + s * eo + p.dir[0] * t * 0.03, fy - t * 0.02 + p.dir[1] * t * 0.03, t * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawEnemy(ctx, e, tile, pal, time) {
  const px = org(e.x, tile);
  const py = org(e.y, tile);
  const t = tile;
  const cx = px + t / 2;
  const cy = py + t / 2;
  ctx.fillStyle = pal.shadow;
  ctx.beginPath();
  ctx.ellipse(cx, py + t * 0.86, t * 0.28, t * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  switch (e.type) {
    case 'snakey': {
      ctx.strokeStyle = pal.snakeyDark;
      ctx.lineWidth = t * 0.16;
      ctx.beginPath();
      ctx.arc(cx, cy + t * 0.1, t * 0.24, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.fillStyle = pal.snakey;
      ctx.beginPath();
      ctx.arc(cx, cy - t * 0.15, t * 0.2, 0, Math.PI * 2);
      ctx.fill();
      eyes(ctx, cx, cy - t * 0.18, t, '#1c1c28');
      break;
    }
    case 'leeper': {
      ctx.fillStyle = e.asleep ? pal.leeperDark : pal.leeper;
      ctx.beginPath();
      ctx.arc(cx, cy + t * 0.05, t * 0.3, Math.PI, 0);
      ctx.lineTo(cx + t * 0.3, py + t * 0.82);
      ctx.lineTo(cx - t * 0.3, py + t * 0.82);
      ctx.closePath();
      ctx.fill();
      if (e.asleep) {
        ctx.strokeStyle = '#1c1c28';
        ctx.lineWidth = Math.max(1, t * 0.04);
        ctx.beginPath();
        for (const s of [-1, 1]) {
          ctx.moveTo(cx + s * t * 0.14 - t * 0.05, cy);
          ctx.lineTo(cx + s * t * 0.14 + t * 0.05, cy);
        }
        ctx.stroke();
      } else {
        eyes(ctx, cx, cy - t * 0.02, t, '#1c1c28');
      }
      break;
    }
    case 'medusa':
    case 'don-medusa': {
      const body = e.type === 'medusa' ? pal.medusa : pal.donMedusa;
      // Wriggling snake-hair.
      ctx.strokeStyle = pal.medusaDark;
      ctx.lineWidth = t * 0.07;
      ctx.beginPath();
      for (let i = -2; i <= 2; i++) {
        const a = -Math.PI / 2 + i * 0.5;
        const sx = cx + Math.cos(a) * t * 0.26;
        const sy = cy - t * 0.05 + Math.sin(a) * t * 0.26;
        const wig = Math.sin(time * 6 + i) * t * 0.08;
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + wig, sy - t * 0.18, sx + wig * 1.5, sy - t * 0.3);
      }
      ctx.stroke();
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy + t * 0.05, t * 0.28, 0, Math.PI * 2);
      ctx.fill();
      // Piercing gaze.
      ctx.fillStyle = '#fff';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + s * t * 0.11, cy + t * 0.02, t * 0.07, t * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#c01030';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + s * t * 0.11, cy + t * 0.02, t * 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'gol': {
      const awake = e.cooldown !== undefined && e.alertedNow;
      ctx.fillStyle = pal.gol;
      ctx.beginPath();
      ctx.moveTo(cx - t * 0.26, py + t * 0.82);
      ctx.lineTo(cx - t * 0.2, py + t * 0.18);
      ctx.lineTo(cx + t * 0.2, py + t * 0.18);
      ctx.lineTo(cx + t * 0.26, py + t * 0.82);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = pal.golDark;
      ctx.lineWidth = Math.max(1, t * 0.05);
      ctx.stroke();
      ctx.fillStyle = awake ? '#ff5030' : pal.golDark;
      for (const s of [-1, 1]) {
        ctx.fillRect(cx + s * t * 0.12 - t * 0.04, cy - t * 0.14, t * 0.08, t * 0.06);
      }
      break;
    }
    case 'skull': {
      ctx.fillStyle = pal.skull;
      ctx.beginPath();
      ctx.arc(cx, cy - t * 0.05, t * 0.26, Math.PI * 0.9, Math.PI * 2.1);
      ctx.lineTo(cx + t * 0.2, cy + t * 0.28);
      ctx.lineTo(cx - t * 0.2, cy + t * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = e.alertedNow ? '#c01030' : pal.skullDark;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + s * t * 0.1, cy - t * 0.05, t * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = pal.skullDark;
      ctx.lineWidth = Math.max(1, t * 0.04);
      ctx.beginPath();
      for (const s of [-0.1, 0, 0.1]) {
        ctx.moveTo(cx + s * t, cy + t * 0.16);
        ctx.lineTo(cx + s * t, cy + t * 0.26);
      }
      ctx.stroke();
      break;
    }
    case 'rocky': {
      ctx.fillStyle = pal.rockyDark;
      ctx.beginPath();
      ctx.arc(cx, cy + t * 0.05, t * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pal.rocky;
      ctx.beginPath();
      ctx.arc(cx - t * 0.05, cy, t * 0.26, 0, Math.PI * 2);
      ctx.fill();
      eyes(ctx, cx, cy - t * 0.05, t, '#1c1c28');
      break;
    }
    case 'alma': {
      ctx.fillStyle = pal.almaDark;
      ctx.beginPath();
      ctx.arc(cx, cy, t * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pal.alma;
      ctx.lineWidth = t * 0.06;
      const spin = e.rolling ? time * 12 : 0;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, t * (0.12 + i * 0.08), spin + i, spin + i + Math.PI * 1.2);
        ctx.stroke();
      }
      if (!e.rolling) eyes(ctx, cx, cy - t * 0.06, t, '#fff');
      break;
    }
  }
}

function eyes(ctx, cx, cy, t, color) {
  ctx.fillStyle = color;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + s * t * 0.09, cy, t * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawProjectile(ctx, pr, tile, pal) {
  const px = org(pr.x, tile);
  const py = org(pr.y, tile);
  const t = tile;
  const cx = px + t / 2;
  const cy = py + t / 2;
  if (pr.kind === 'shot') {
    ctx.fillStyle = pal.shot;
    ctx.beginPath();
    ctx.arc(cx, cy, t * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = pal.fireball;
    ctx.beginPath();
    ctx.arc(cx, cy, t * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.shot;
    ctx.beginPath();
    ctx.arc(cx - pr.dir[0] * t * 0.1, cy - pr.dir[1] * t * 0.1, t * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
}
