// The stacked layout, and the walk through it.
//
// Two jobs, one module, because they must agree about where every column sits: the *question*
// — the numbers stacked with a rule under them and a box per column to answer into — and the
// *walkthrough*, which is what a wrong answer gets instead of a red cross.
//
// The walkthrough is the column counterpart of the clock's ghost hands and the ten-frame. It
// does not say the answer, it does the work: the ones column lights up, its digit lands, the
// carry lifts into the little box above the tens, and only then does the tens column move.
// A child who forgot to carry watches the carry happen; a child who took the smaller digit
// from the larger watches the ten being borrowed. Nothing is red and nothing is crossed out.
//
// Pure: numbers in, HTML string out. Every step is a CSS animation delay, so there is no loop
// to run and nothing to clean up, and reduced motion simply shows the finished thing.

import { addSteps, answerOf, columnCount, columnsOf, digitsOf, subSteps } from './subjects/math/columns.js';

export { addSteps, answerOf, columnCount, columnsOf, subSteps };

/* ------------------------------------------------------------------- pacing */

// How long the walkthrough dwells on each column, in seconds.
//
// The first version ran at just over half a second a column, which is about how long it takes
// to *recognise* that something moved and nowhere near long enough to follow what. A child
// working out why their carry went astray has to read the column, see the digit land, and
// watch the one lift into the box above it — three things, in order, each of which they are
// meeting for the first time. So the middle of this table is more than twice that, and the
// slow end is nearly five times it.
//
// Named rather than numbered, because "1.8 seconds a column" is not a thing a grown-up has an
// opinion about, and "calm" is.
export const WALK_SPEEDS = [
  { id: 'verySlow', step: 2.6 },
  { id: 'slow', step: 1.9 },
  { id: 'steady', step: 1.4 },
  { id: 'brisk', step: 1.0 },
  { id: 'quick', step: 0.7 },
];

// Deliberately not the middle of the table. The first version of this ran at half a second a
// column and a child could not follow it, and the two failures are not symmetric: too slow
// costs a few seconds and is one drag of a labelled slider away from being fixed, while too
// fast teaches nothing and nobody notices it happening.
export const DEFAULT_WALK_SPEED = 'slow';

export const isWalkSpeed = (id) => WALK_SPEEDS.some((speed) => speed.id === id);

/** Seconds per column for a named speed. An id this build does not know falls back to the
 *  default rather than to nothing, so a hand-edited save cannot stop the walkthrough. */
export const stepFor = (id) =>
  (WALK_SPEEDS.find((speed) => speed.id === id) ?? WALK_SPEEDS.find((speed) => speed.id === DEFAULT_WALK_SPEED)).step;

/** Where a named speed sits on the slider, counting from the slow end. */
export const walkSpeedIndex = (id) => {
  const at = WALK_SPEEDS.findIndex((speed) => speed.id === id);
  return at === -1 ? WALK_SPEEDS.findIndex((speed) => speed.id === DEFAULT_WALK_SPEED) : at;
};

/** And back again, for a slider that has been dragged somewhere. */
export const walkSpeedAt = (index) => {
  const n = Number(index);
  if (!Number.isFinite(n)) return DEFAULT_WALK_SPEED;
  return WALK_SPEEDS[Math.max(0, Math.min(Math.round(n), WALK_SPEEDS.length - 1))].id;
};

/** How many boxes the walkthrough draws: enough for the answer, and never fewer than the
 *  question's own columns. */
export const walkWidth = ({ op, a, b }) =>
  Math.max(columnCount(a, b), String(Math.abs(answerOf({ op, a, b }))).length);

/**
 * One step per column, ones first, each carrying everything the picture needs to say: what the
 * column held, what it produced, and what it passed on.
 */
export function walkSteps({ op, a, b }) {
  return op === '-' ? subSteps(a, b) : addSteps(a, b);
}

const cell = (content, classes = '', style = '') =>
  `<span class="cw-cell ${classes}"${style ? ` style="${style}"` : ''}>${content}</span>`;

// Ones-first everywhere in the arithmetic, left-to-right everywhere in the markup. This is the
// one place the two orders meet, and getting it wrong is how a carry ends up over the wrong
// column, so it is done once, here, rather than at each call site.
const leftToRight = (onesFirst) => [...onesFirst].reverse();

/**
 * The question as it is written out: an optional carry row, the two numbers, a rule, and a row
 * of answer boxes. `slots` is the markup for those boxes, ones-first, because the caller owns
 * them — they may be ink pads, or spans, and this module has no business knowing which.
 */
export function stackedMarkup({ op, a, b }, { slots = [], carries = [], width = null } = {}) {
  const cols = width ?? walkWidth({ op, a, b });
  const top = digitsOf(a, cols);
  const bottom = digitsOf(b, cols);
  const bLen = String(Math.abs(b)).length;
  const aLen = String(Math.abs(a)).length;
  const blank = (n, len) => n.map((d, i) => (i < len ? String(d) : ''));
  return `
    <div class="colwalk" style="--cw-cols:${cols}">
      ${carries.length ? `<div class="cw-row cw-carries">${leftToRight(padTo(carries, cols)).join('')}</div>` : ''}
      <div class="cw-row cw-top">${leftToRight(blank(top, aLen)).map((d) => cell(d)).join('')}</div>
      <div class="cw-row cw-bottom"><span class="cw-op">${op === '-' ? '−' : '+'}</span>${leftToRight(blank(bottom, bLen))
        .map((d) => cell(d))
        .join('')}</div>
      <div class="cw-rule"></div>
      <div class="cw-row cw-answer">${leftToRight(padTo(slots, cols)).join('')}</div>
    </div>`;
}

const padTo = (list, len) => {
  const out = [...list];
  while (out.length < len) out.push('<span class="cw-cell"></span>');
  return out.slice(0, len);
};

/**
 * The walkthrough. `step` is how long each column waits behind the one before it, in seconds;
 * pass 0 for a still frame that needs no motion at all.
 */
export function columnWalkHtml(question, { step = stepFor(DEFAULT_WALK_SPEED), title = '' } = {}) {
  const { op, a, b } = question;
  const cols = walkWidth(question);
  const steps = walkSteps(question);
  const delay = (i) => (step * i).toFixed(2);

  // The carry (or the borrow) belongs above the column it is *going into*, which is one to the
  // left of the column that produced it — the commonest thing to get wrong when writing this
  // out by hand, and the whole point of the picture.
  const marks = new Array(cols).fill('');
  steps.forEach((s, i) => {
    if (op === '-') {
      if (s.borrowed !== null && s.borrowed !== undefined) {
        marks[i] = `<span class="cw-mark cw-borrowed" style="--cw-delay:${delay(i + 0.4)}s">${s.borrowed}</span>`;
      }
    } else if (s.carryOut && i + 1 < cols) {
      marks[i + 1] = `<span class="cw-mark cw-carry" style="--cw-delay:${delay(i + 0.5)}s">1</span>`;
    }
  });

  const answer = digitsOf(answerOf(question), cols);
  const answerCells = answer.map((digit, i) =>
    cell(String(digit), 'cw-lands', `--cw-delay:${delay(i + 0.7)}s`)
  );
  const topCells = digitsOf(a, cols).map((digit, i) =>
    cell(i < String(Math.abs(a)).length ? String(digit) : '', 'cw-lit', `--cw-delay:${delay(i)}s`)
  );
  const bottomCells = digitsOf(b, cols).map((digit, i) =>
    cell(i < String(Math.abs(b)).length ? String(digit) : '', 'cw-lit', `--cw-delay:${delay(i)}s`)
  );

  return `
    <div class="colwalk is-walking" style="--cw-cols:${cols}" role="img" aria-label="${title}">
      <div class="cw-row cw-carries">${leftToRight(marks)
        .map((mark) => `<span class="cw-cell">${mark}</span>`)
        .join('')}</div>
      <div class="cw-row cw-top">${leftToRight(topCells).join('')}</div>
      <div class="cw-row cw-bottom"><span class="cw-op">${op === '-' ? '−' : '+'}</span>${leftToRight(bottomCells).join('')}</div>
      <div class="cw-rule"></div>
      <div class="cw-row cw-answer">${leftToRight(answerCells).join('')}</div>
    </div>`;
}

/**
 * How long the whole walk takes, so a caller can wait exactly that long and no longer. The
 * 1.2 covers the last column's own sub-steps — its digit lands seven tenths of a step after
 * the column lights up — and the half second on the end is a beat to look at the finished sum
 * before the pet comes back.
 */
export const walkDuration = (question, step = stepFor(DEFAULT_WALK_SPEED)) =>
  ((walkWidth(question) + 1.2) * step + 0.5) * 1000;
