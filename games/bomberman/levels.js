// Campaign levels, map parsing and the battle arena generator.
//
// Map legend:
//   '#' hard block        ' ' empty floor
//   '+' soft block        '?' soft block with 60% probability
//   'P' player start      'D' soft block hiding the exit (optional)
//   'W' wanderer enemy    'C' chaser enemy    'B' smart (BFS) enemy

export const T_EMPTY = 0;
export const T_HARD = 1;
export const T_SOFT = 2;

const ENEMY_TYPES = { W: 'wanderer', C: 'chaser', B: 'smart' };

// Power-up types that random (non-guaranteed) drops choose from. Remote and
// kick stay exclusive to guaranteed drops so their introduction is paced.
const RANDOM_DROP_POOL = ['bombs', 'range', 'speed'];

export const LEVELS = [
  {
    name: 'First Steps',
    time: 180,
    drops: ['range', 'bombs'],
    dropChance: 0.08,
    map: [
      '###########',
      '#P  +++  ?#',
      '# #+# #+# #',
      '#+  + +  +#',
      '#?# # #+#W#',
      '#+ +++ + +#',
      '# #+# #+# #',
      '#?  +++  W#',
      '###########',
    ],
  },
  {
    name: 'Corridors',
    time: 180,
    drops: ['bombs'],
    dropChance: 0.09,
    map: [
      '#############',
      '#P  + + +  ?#',
      '# #+# # #+# #',
      '#+ +++W++ ++#',
      '# # #+#+# # #',
      '#+ ++++++ +W#',
      '# #+# # #+# #',
      '#?  + W +  +#',
      '#############',
    ],
  },
  {
    name: 'Boxed In',
    time: 180,
    drops: ['speed'],
    dropChance: 0.09,
    map: [
      '#############',
      '#P ++++++++?#',
      '# #+#+#+#+# #',
      '#+++ +++ +++#',
      '#+#+# # #+#+#',
      '#++ +W+W+ ++#',
      '#+#+# # #+#+#',
      '#+++ +++ +++#',
      '# #+#+#+#+# #',
      '#?++++++++W #',
      '#############',
    ],
  },
  {
    name: 'Crossfire',
    time: 180,
    drops: ['range'],
    dropChance: 0.1,
    map: [
      '#############',
      '#P +++ +++ W#',
      '# #+# # #+# #',
      '#+++?+++?+++#',
      '#+# #+#+# #+#',
      '# +W+++++W+ #',
      '#+# #+#+# #+#',
      '#+++?+++?+++#',
      '# #+# # #+# #',
      '#W +++ +++ ?#',
      '#############',
    ],
  },
  {
    name: 'The Chase',
    time: 180,
    drops: ['bombs'],
    dropChance: 0.1,
    map: [
      '#############',
      '#P + +++ + C#',
      '# #+# # #+# #',
      '#+ +++W+++ +#',
      '#+#+# # #+#+#',
      '#  +++++++  #',
      '#+#+# # #+#+#',
      '#+ +++W+++ +#',
      '# #+# # #+# #',
      '#C + +++ + ?#',
      '#############',
    ],
  },
  {
    name: 'Remote Control',
    time: 180,
    drops: ['remote', 'range'],
    dropChance: 0.1,
    map: [
      '###############',
      '#P + +++++ + C#',
      '# #+# #+# #+# #',
      '#+ ++ +++ ++ +#',
      '# #+#+# #+#+# #',
      '#? +++ W +++ ?#',
      '# #+#+# #+#+# #',
      '#+ ++ +++ ++ +#',
      '# #+# #+# #+# #',
      '#C + +++++ + C#',
      '###############',
    ],
  },
  {
    name: 'Speed Run',
    time: 150,
    drops: ['speed'],
    dropChance: 0.1,
    map: [
      '###############',
      '#P+ +++W+++ +C#',
      '##+#+#+#+#+#+##',
      '#+ +   +   + +#',
      '# +#+#+#+#+#+ #',
      '#? +++ C +++ ?#',
      '# +#+#+#+#+#+ #',
      '#+ +   +   + +#',
      '##+#+#+#+#+#+##',
      '#C+ +++W+++ +?#',
      '###############',
    ],
  },
  {
    name: 'Kickoff',
    time: 180,
    drops: ['kick', 'bombs'],
    dropChance: 0.1,
    map: [
      '###############',
      '#P +++++++++ ?#',
      '# #+# # # #+# #',
      '#+++ +++++ +++#',
      '#+# #+# #+# #+#',
      '#+ ++ +W+ ++ +#',
      '# # #+# #+# # #',
      '#+ ++ +W+ ++ +#',
      '#+# #+# #+# #+#',
      '#+++ +++++ +++#',
      '# #+# # # #+# #',
      '#C +++++++++ C#',
      '###############',
    ],
  },
  {
    name: 'Think Tank',
    time: 180,
    drops: ['range'],
    dropChance: 0.11,
    map: [
      '###############',
      '#P +++ + +++ B#',
      '# #+# #+# #+# #',
      '#+ + +++++ + +#',
      '# # #+#+#+# # #',
      '#+++ ++?++ +++#',
      '#+#+#+# #+#+#+#',
      '#+++ ++?++ +++#',
      '# # #+#+#+# # #',
      '#+ + +++++ + +#',
      '# #+# #+# #+# #',
      '#B +++ W +++ W#',
      '###############',
    ],
  },
  {
    name: 'Outsmarted',
    time: 180,
    drops: ['bombs', 'speed'],
    dropChance: 0.11,
    map: [
      '###############',
      '#P ++ +++ ++ B#',
      '##+# #+#+# #+##',
      '#+ +++ + +++ +#',
      '# +#+#+#+#+#+ #',
      '#++ + +B+ + ++#',
      '#+#+#+# #+#+#+#',
      '#++ + +++ + ++#',
      '# +#+#+#+#+#+ #',
      '#+ +++ + +++ +#',
      '##+# #+#+# #+##',
      '#B ++ +C+ ++ ?#',
      '###############',
    ],
  },
  {
    name: 'The Gauntlet',
    time: 150,
    drops: ['range', 'bombs'],
    dropChance: 0.12,
    map: [
      '###############',
      '#P+ ++ C ++ +W#',
      '# #+#+#+#+#+# #',
      '#+++ ++?++ +++#',
      '#+#+# #+# #+#+#',
      '# ++?++B++?++ #',
      '#+#+#+#+#+#+#+#',
      '# ++?++B++?++ #',
      '#+#+# #+# #+#+#',
      '#+++ ++?++ +++#',
      '# #+#+#+#+#+# #',
      '#W+ ++ C ++ +?#',
      '###############',
    ],
  },
  {
    name: 'Final Blast',
    time: 200,
    drops: ['remote', 'kick', 'range'],
    dropChance: 0.12,
    map: [
      '###############',
      '#P ++++?++++ B#',
      '# #+#+#+#+#+# #',
      '#++++ +++ ++++#',
      '#+#?#+#+#+#?#+#',
      '#+++++ B +++++#',
      '# #+#+# #+#+# #',
      '#+++++ B +++++#',
      '#+#?#+#+#+#?#+#',
      '#++++ +++ ++++#',
      '# #+#+#+#+#+# #',
      '#C ++++?++++ C#',
      '###############',
    ],
  },
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function cellKey(x, y) {
  return `${x},${y}`;
}

// Parse a campaign level definition into a playable instance. Randomness
// ('?' blocks, drop placement) makes every attempt slightly different.
export function parseLevel(def) {
  const rows = def.map;
  const h = rows.length;
  const w = rows[0].length;
  const grid = [];
  let playerStart = null;
  let exitCell = null;
  const enemySpawns = [];

  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      let tile = T_EMPTY;
      if (ch === '#') tile = T_HARD;
      else if (ch === '+' || ch === 'D') tile = T_SOFT;
      else if (ch === '?') tile = Math.random() < 0.6 ? T_SOFT : T_EMPTY;
      else if (ch === 'P') playerStart = { x, y };
      else if (ENEMY_TYPES[ch]) enemySpawns.push({ x, y, type: ENEMY_TYPES[ch] });
      if (ch === 'D') exitCell = { x, y };
      row.push(tile);
    }
    grid.push(row);
  }

  // Guarantee breathing room: no soft blocks on or next to the player start.
  const { x: px, y: py } = playerStart;
  for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = px + dx;
    const y = py + dy;
    if (grid[y]?.[x] === T_SOFT) grid[y][x] = T_EMPTY;
  }

  const softCells = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] === T_SOFT) softCells.push({ x, y });
    }
  }

  if (!exitCell) {
    let best = -1;
    for (const cell of softCells) {
      const d = Math.abs(cell.x - px) + Math.abs(cell.y - py);
      if (d > best) {
        best = d;
        exitCell = cell;
      }
    }
  }

  const hidden = new Map();
  hidden.set(cellKey(exitCell.x, exitCell.y), 'exit');
  const candidates = shuffle(
    softCells.filter((c) => !(c.x === exitCell.x && c.y === exitCell.y))
  );
  def.drops.forEach((type, i) => {
    if (candidates[i]) hidden.set(cellKey(candidates[i].x, candidates[i].y), type);
  });
  for (let i = def.drops.length; i < candidates.length; i++) {
    if (Math.random() < def.dropChance) {
      const type = RANDOM_DROP_POOL[Math.floor(Math.random() * RANDOM_DROP_POOL.length)];
      hidden.set(cellKey(candidates[i].x, candidates[i].y), type);
    }
  }

  return {
    name: def.name,
    grid,
    cols: w,
    rows: h,
    playerStart,
    enemySpawns,
    hidden,
    timeMs: def.time * 1000,
  };
}

// Symmetric 15x13 battle arena: classic pillar grid, two opposite corner
// spawns with cleared L-shapes, the rest densely packed with soft blocks.
export function makeBattleArena() {
  const w = 15;
  const h = 13;
  const grid = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      const pillar = x % 2 === 0 && y % 2 === 0;
      row.push(border || pillar ? T_HARD : T_EMPTY);
    }
    grid.push(row);
  }

  const spawns = [
    { x: 1, y: 1 },
    { x: w - 2, y: h - 2 },
  ];
  const clear = new Set();
  for (const s of spawns) {
    for (const [dx, dy] of [[0, 0], [1, 0], [2, 0], [-1, 0], [-2, 0], [0, 1], [0, 2], [0, -1], [0, -2]]) {
      clear.add(cellKey(s.x + dx, s.y + dy));
    }
  }

  const hidden = new Map();
  const dropPool = ['bombs', 'bombs', 'range', 'range', 'speed', 'kick', 'remote'];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (grid[y][x] !== T_EMPTY || clear.has(cellKey(x, y))) continue;
      if (Math.random() < 0.75) {
        grid[y][x] = T_SOFT;
        if (Math.random() < 0.3) {
          hidden.set(cellKey(x, y), dropPool[Math.floor(Math.random() * dropPool.length)]);
        }
      }
    }
  }

  return { grid, cols: w, rows: h, spawns, hidden, timeMs: 120000 };
}

// Development-time sanity checks for the authored maps. Throws on the first
// problem it finds so a bad map is caught at import time, not mid-game.
export function validateLevels(levels) {
  const legal = new Set(['#', ' ', '+', '?', 'P', 'D', 'W', 'C', 'B']);
  levels.forEach((def, index) => {
    const label = `Level ${index + 1} (${def.name})`;
    const rows = def.map;
    const h = rows.length;
    const w = rows[0].length;
    if (h < 5 || w < 5) throw new Error(`${label}: map too small`);
    let players = 0;
    let enemies = 0;
    let soft = 0;
    const enemyCells = [];
    let start = null;
    for (let y = 0; y < h; y++) {
      if (rows[y].length !== w) throw new Error(`${label}: row ${y} has length ${rows[y].length}, expected ${w}`);
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x];
        if (!legal.has(ch)) throw new Error(`${label}: illegal character '${ch}' at ${x},${y}`);
        const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
        if (border && ch !== '#') throw new Error(`${label}: unsealed border at ${x},${y}`);
        if (ch === 'P') {
          players++;
          start = { x, y };
        }
        if (ENEMY_TYPES[ch]) {
          enemies++;
          enemyCells.push({ x, y });
        }
        if (ch === '+' || ch === '?' || ch === 'D') soft++;
      }
    }
    if (players !== 1) throw new Error(`${label}: expected exactly 1 player start, found ${players}`);
    if (enemies === 0) throw new Error(`${label}: no enemies`);
    if (soft < def.drops.length + 2) throw new Error(`${label}: not enough soft blocks for drops + exit`);

    // Every enemy must be reachable from the player, treating soft blocks
    // as passable (the player can always bomb through them).
    const seen = new Set([cellKey(start.x, start.y)]);
    const queue = [start];
    while (queue.length) {
      const { x, y } = queue.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (rows[ny][nx] === '#' || seen.has(cellKey(nx, ny))) continue;
        seen.add(cellKey(nx, ny));
        queue.push({ x: nx, y: ny });
      }
    }
    for (const cell of enemyCells) {
      if (!seen.has(cellKey(cell.x, cell.y))) {
        throw new Error(`${label}: enemy at ${cell.x},${cell.y} unreachable from player`);
      }
    }
  });
}
