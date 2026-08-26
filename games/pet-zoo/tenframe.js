// The ten-frame: what a wrong sum gets shown instead of a red cross.
//
// The clock module answers a mistake by walking ghost hands to the right time — the child
// sees *why*, not just *what*. This is the counterpart for adding, and it is a ten-frame
// rather than a number line or a pile of berries on purpose: counting the answer out one
// berry at a time teaches counting-all, which is the habit the tier ladder exists to grow
// a child out of. A ten-frame shows the structure instead. Seven counters, then eight more
// — and three of those eight visibly finish the first frame, which is the whole of "make
// ten and then five more" in one picture.
//
// Taking away is the same picture run backwards. Fill to the number you started with, then
// let the ones being taken fade out from the end — and, when the answer drops back under ten,
// watch the second frame empty first. That is "back down to the ten and then two more", which
// is the strategy tier 10 is named after, in one picture.
//
// Pure, like habitat.js and yard.js: geometry in, SVG string out. The arrival of each
// counter is a CSS animation delay, so there is no loop to run and nothing to clean up, and
// reduced motion simply lands them all at once.

export const COLS = 5;
export const ROWS = 2;
export const FRAME = COLS * ROWS; // ten, which is the point

const CELL = 20;
const GAP = 3;
const PAD = 5;
const FRAME_W = COLS * CELL + (COLS - 1) * GAP + PAD * 2;
const FRAME_H = ROWS * CELL + (ROWS - 1) * GAP + PAD * 2;
const FRAME_GAP = 14;

/**
 * Where every counter goes and in what order, for `a + b`.
 *
 * `bridge` is the number of the second addend that finishes the first frame — the counters
 * worth drawing attention to, because they are the ones doing the teaching. `rest` is what
 * is left over afterwards, which is the other half of the sentence: "…and five more".
 */
export function fillPlan(a, b) {
  const first = Math.max(0, Math.floor(a));
  const second = Math.max(0, Math.floor(b));
  const total = first + second;
  const bridge = Math.min(second, Math.max(0, FRAME - first));
  const cells = [];
  for (let i = 0; i < total; i += 1) {
    const within = i % FRAME;
    cells.push({
      index: i,
      frame: Math.floor(i / FRAME),
      row: Math.floor(within / COLS),
      col: within % COLS,
      from: i < first ? 'a' : 'b',
      // The counters that complete the first ten, marked so the picture can say so.
      bridges: i >= first && i < first + bridge && first + bridge === FRAME,
    });
  }
  return {
    a: first,
    b: second,
    total,
    bridge,
    rest: second - bridge,
    frames: Math.max(1, Math.ceil(total / FRAME)),
    cells,
  };
}

/**
 * Where every counter goes for `a - b`, and in what order they leave.
 *
 * `order` counts from the last counter backwards, because that is the end they are taken from;
 * it is what the animation delay is built out of. `bridges` marks the ones whose going empties
 * the second frame — the moment the answer comes back down under ten.
 */
export function takeAwayPlan(a, b) {
  const total = Math.max(0, Math.floor(a));
  const gone = Math.min(total, Math.max(0, Math.floor(b)));
  const left = total - gone;
  const cells = [];
  for (let i = 0; i < total; i += 1) {
    const within = i % FRAME;
    const leaving = i >= left;
    cells.push({
      index: i,
      frame: Math.floor(i / FRAME),
      row: Math.floor(within / COLS),
      col: within % COLS,
      gone: leaving,
      // Counters vanish from the end backwards, so the last one drawn is the first to go.
      order: leaving ? total - 1 - i : 0,
      bridges: leaving && i >= FRAME && left <= FRAME,
    });
  }
  return {
    a: total,
    b: gone,
    total,
    gone,
    left,
    toTen: Math.max(0, Math.min(gone, total - FRAME)),
    rest: gone - Math.max(0, Math.min(gone, total - FRAME)),
    frames: Math.max(1, Math.ceil(total / FRAME)),
    cells,
  };
}

const cellX = (col) => PAD + col * (CELL + GAP);
const cellY = (row) => PAD + row * (CELL + GAP);

/** The empty grid one frame is drawn on. */
function frameMarkup(offsetX) {
  const cells = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      cells.push(
        `<rect class="tf-cell" x="${cellX(col)}" y="${cellY(row)}" width="${CELL}" height="${CELL}" rx="4" />`
      );
    }
  }
  return `<g transform="translate(${offsetX} 0)">
      <rect class="tf-frame" x="0.5" y="0.5" width="${FRAME_W - 1}" height="${FRAME_H - 1}" rx="7" />
      ${cells.join('')}
    </g>`;
}

/**
 * The picture. `step` is how long each counter waits behind the one before it, in seconds;
 * pass 0 for a still frame that needs no motion at all.
 */
export function tenFrameSvg(a, b, { step = 0.07, title = '', op = '+' } = {}) {
  if (op === '-') return takeAwaySvg(a, b, { step, title });
  const plan = fillPlan(a, b);
  const width = plan.frames * FRAME_W + (plan.frames - 1) * FRAME_GAP;

  const frames = [];
  for (let i = 0; i < plan.frames; i += 1) frames.push(frameMarkup(i * (FRAME_W + FRAME_GAP)));

  const counters = plan.cells.map((cell) => {
    const x = cell.frame * (FRAME_W + FRAME_GAP) + cellX(cell.col) + CELL / 2;
    const y = cellY(cell.row) + CELL / 2;
    const classes = ['tf-dot', `tf-from-${cell.from}`, cell.bridges ? 'tf-bridge' : '']
      .filter(Boolean)
      .join(' ');
    return `<circle class="${classes}" cx="${x}" cy="${y}" r="${CELL / 2 - 2.5}" style="--tf-delay:${(cell.index * step).toFixed(2)}s" />`;
  });

  return `<svg class="tenframe" viewBox="0 0 ${width} ${FRAME_H}" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">
      ${frames.join('')}
      ${counters.join('')}
    </svg>`;
}

/** The same picture for a difference: everything arrives at once, then the top of the pile
 *  fades away. */
export function takeAwaySvg(a, b, { step = 0.07, title = '' } = {}) {
  const plan = takeAwayPlan(a, b);
  const width = plan.frames * FRAME_W + (plan.frames - 1) * FRAME_GAP;

  const frames = [];
  for (let i = 0; i < plan.frames; i += 1) frames.push(frameMarkup(i * (FRAME_W + FRAME_GAP)));

  // The whole starting number is on the board before anything is taken off it, so the child
  // sees what they are taking from rather than watching an answer assemble itself.
  const settle = plan.total * step;
  const counters = plan.cells.map((cell) => {
    const x = cell.frame * (FRAME_W + FRAME_GAP) + cellX(cell.col) + CELL / 2;
    const y = cellY(cell.row) + CELL / 2;
    const classes = ['tf-dot', 'tf-from-a', cell.gone ? 'tf-gone' : '', cell.bridges ? 'tf-bridge' : '']
      .filter(Boolean)
      .join(' ');
    const delay = cell.gone ? settle + 0.25 + cell.order * step : cell.index * step;
    return `<circle class="${classes}" cx="${x}" cy="${y}" r="${CELL / 2 - 2.5}" style="--tf-delay:${delay.toFixed(2)}s" />`;
  });

  return `<svg class="tenframe" viewBox="0 0 ${width} ${FRAME_H}" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">
      ${frames.join('')}
      ${counters.join('')}
    </svg>`;
}

/** How long the whole thing takes, so a caller can wait exactly that long and no longer. */
export const fillDuration = (a, b, step = 0.07, op = '+') =>
  op === '-'
    ? (takeAwayPlan(a, b).total * step + 0.25 + takeAwayPlan(a, b).gone * step + 0.45) * 1000
    : (fillPlan(a, b).total * step + 0.35) * 1000;
