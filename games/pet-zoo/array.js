// The array: what a wrong product gets shown instead of a red cross.
//
// The clock answers a mistake by walking ghost hands to the right time; adding fills a
// ten-frame. This is the counterpart for multiplying, and it is an array of dots rather than
// a number line or a long sum on purpose. `7 × 8` drawn as seven rows of eight is the one
// picture that says everything at once: that it is eight, seven times over; that turning it a
// quarter turn makes it seven, eight times over, which is why there is only one pet for the
// pair; and — because the rows arrive one at a time with their running total beside them —
// that you can get there by counting in eights without counting all fifty-six.
//
// The rows are counted out rather than appearing together, and at the pace a grown-up has
// set for the column walkthrough, because that pace is a fact about one child rather than
// about the game. `walkInstant` and reduced motion both land the whole array at once, which
// is the same still frame from two different directions.
//
// Pure, like tenframe.js beside it: geometry in, SVG string out. The arrival of each row is a
// CSS animation delay, so there is no loop to run and nothing to clean up.

/**
 * A row of the array against a column of a column sum, as beats.
 *
 * The pace comes from the grown-ups' walkthrough setting so there is one control rather than
 * two, but a row is a much smaller thing to watch than a column of working — "and another
 * eight" against "seven and eight is fifteen, write the five, carry the one". At the full
 * column step a ten-row array would run for twenty seconds, which is not calm, it is a wait.
 */
export const ROW_STEP_SCALE = 0.3;

const CELL = 16;
const GAP = 4;
const PAD = 6;
const TOTALS_W = 30; // the running total's column, to the right of the dots

const dotX = (col) => PAD + col * (CELL + GAP) + CELL / 2;
const dotY = (row) => PAD + row * (CELL + GAP) + CELL / 2;

/**
 * Where every dot goes, in what order the rows arrive, and what the count stands at once each
 * row is down.
 *
 * `rows` is `a` and `cols` is `b`, which is to say the picture is read exactly as the question
 * is written: `7 × 8` is seven rows of eight, not eight rows of seven. Which way round a
 * commutative pair is *shown* is decided before this is called, so the picture always matches
 * the words the child just read.
 */
export function arrayPlan(a, b) {
  const rows = Math.max(0, Math.floor(a));
  const cols = Math.max(0, Math.floor(b));
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({ row, col, index: row * cols + col });
    }
  }
  return {
    a: rows,
    b: cols,
    rows,
    cols,
    total: rows * cols,
    // 8, 16, 24 … — the running total after each row, which is the skip-counting written down.
    totals: Array.from({ length: rows }, (_, row) => (row + 1) * cols),
    cells,
  };
}

/**
 * The picture. `step` is how long each row waits behind the one before it, in seconds; pass 0
 * for a still frame that needs no motion at all.
 */
export function arraySvg(a, b, { step = 0.35, title = '' } = {}) {
  const plan = arrayPlan(a, b);
  if (!plan.total) return '';
  const gridW = PAD * 2 + plan.cols * CELL + (plan.cols - 1) * GAP;
  const height = PAD * 2 + plan.rows * CELL + (plan.rows - 1) * GAP;
  const width = gridW + TOTALS_W;

  const dots = plan.cells.map((cell) => {
    // Per row, not per dot: the lesson is "another eight", and dots trickling in one by one
    // would teach counting-all, which is the habit the whole ladder exists to grow out of.
    const delay = (cell.row * step).toFixed(2);
    return `<circle class="ar-dot" cx="${dotX(cell.col)}" cy="${dotY(cell.row)}" r="${CELL / 2 - 1.5}" style="--ar-delay:${delay}s" />`;
  });

  const totals = plan.totals.map((sum, row) => {
    // A beat after its row has landed, so the number reads as the count of what is now there
    // rather than as a label that arrived with it.
    const delay = (row * step + step * 0.55).toFixed(2);
    const last = row === plan.rows - 1 ? ' ar-last' : '';
    return `<text class="ar-total${last}" x="${gridW + 4}" y="${dotY(row)}" dominant-baseline="central" style="--ar-delay:${delay}s">${sum}</text>`;
  });

  return `<svg class="dotarray" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">
      ${dots.join('')}
      ${totals.join('')}
    </svg>`;
}

/** How long the whole thing takes, so a caller can wait exactly that long and no longer. */
export const arrayDuration = (a, b, step = 0.35) =>
  (Math.max(0, Math.floor(a)) * step + 0.6) * 1000;
