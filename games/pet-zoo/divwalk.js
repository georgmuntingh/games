// The long-division stack, and the walk through it.
//
// The counterpart of column.js, and separate from it for the reason divide.js is separate from
// columns.js: the direction. A column sum is worked ones-first and everything that leaves a
// column goes left, so its walkthrough runs right to left and the whole answer sits on one
// line. A division is worked from the biggest place down, every step writes two more rows, and
// what is left over goes *right* — into the digit that comes down to meet it. Sharing a module
// would mean sharing the direction, which is the one thing they do not have in common.
//
// Two jobs, one module, because they must agree about where every row sits: the *question* —
// the numbers written out with boxes to answer into — and the *walkthrough*, which is what a
// wrong answer gets instead of a red cross. A child who forgot to bring the next digit down
// watches it come down; a child who wrote something into the zero's box watches the step come
// to nothing and the zero go in anyway. Nothing is red and nothing is crossed out.
//
// Pure: numbers in, HTML string out. Every step is a CSS animation delay, so there is no loop
// to run and nothing to clean up, and reduced motion simply shows the finished thing.

import { DEFAULT_WALK_SPEED, stepFor } from './column.js';
import { digitsOf, divRows, divSteps } from './subjects/math/divide.js';

export { DEFAULT_WALK_SPEED, stepFor };

/** How many columns the stack needs: the dividend's. Everything else is written underneath it,
 *  and nothing is ever wider — a product cannot pass the number it came out of. */
export const walkCols = (a) => digitsOf(a).length;

/** Three beats to a step — the quotient digit, the product, and what is left — which is the
 *  order they are written in and the order they are explained in. */
export const BEATS_PER_STEP = 3;

/**
 * Where a row sits, as grid columns counting from one. A row of `width` boxes whose rightmost
 * box is worth `place` ends in the column `cols - place`, so it starts `width` back from there.
 *
 * The one place the two orders meet — arithmetic counts places from the right, markup counts
 * columns from the left — and getting it wrong is how a product ends up under the wrong digit,
 * so it is done once, here, rather than at each call site.
 */
export const spanOf = (cols, { width, place }) => {
  const end = cols - place + 1; // exclusive, in grid-column terms
  return { start: Math.max(1, end - width), end };
};

const cellsFor = (cols, row, contents) => {
  const { start, end } = spanOf(cols, row);
  const out = [];
  for (let col = 1; col <= cols; col += 1) {
    const at = col - start;
    out.push(at >= 0 && col < end ? contents[at] : '<span class="dw-cell"></span>');
  }
  return out.join('');
};

const cell = (content, classes = '', delay = null) =>
  `<span class="dw-cell${classes ? ` ${classes}` : ''}"` +
  `${delay === null ? '' : ` style="--dw-delay:${delay.toFixed(2)}s"`}>${content}</span>`;

/** A row's digits as cells, left to right, blank where the number does not reach. */
const digitCells = (value, width, classes = '', delay = null) => {
  const text = String(value).padStart(width, ' ');
  return [...text].map((ch) => cell(ch === ' ' ? '' : ch, classes, delay));
};

/** The rule drawn under a subtraction, spanning exactly the columns it was taken across. */
const ruleFor = (cols, row, delay = null) => {
  const { start, end } = spanOf(cols, row);
  const style = `grid-column:${start} / ${end}${delay === null ? '' : `;--dw-delay:${delay.toFixed(2)}s`}`;
  return (
    `<div class="dw-line dw-ruleline" style="--dw-cols:${cols}">` +
    `<i class="dw-rule${delay === null ? '' : ' dw-mark'}" style="${style}"></i></div>`
  );
};

/**
 * The question as it is written out: the dividend, the sign, the divisor, an equals, and the
 * boxes the quotient goes in — then the working underneath, a step at a time.
 *
 * `rows` is one entry per answer row in writing order, each carrying its `{ width, place, line }`
 * and the markup for its boxes, ones-first. The caller owns those boxes — they may be ink pads
 * or spans, and this module has no business knowing which.
 */
export function dividedMarkup({ a, b }, { rows = [], sign = '÷' } = {}) {
  const cols = walkCols(a);
  const top = digitsOf(a).map((d) => `<span class="dw-cell dw-digit">${d}</span>`).join('');
  // Biggest place first, which for the quotient line is also the order they are written in.
  const quotient = rows
    .filter((row) => row.line === 'q')
    .sort((x, y) => y.place - x.place)
    .map((row) => row.slots.join(''))
    .join('');

  const working = rows
    .filter((row) => row.line !== 'q')
    .sort((x, y) => x.line - y.line)
    .map((row) => {
      // Ones-first out of the answer strip, left to right into the markup.
      const cells = cellsFor(cols, row, [...row.slots].reverse());
      const line = `<div class="dw-line" style="--dw-cols:${cols}">${cells}</div>`;
      // A rule under every product, because that is where the subtraction happens. The pairing
      // is by line number: even lines are products, odd ones are what was left.
      return row.line % 2 === 0 ? `${line}${ruleFor(cols, row)}` : line;
    })
    .join('');

  return `
    <div class="divwalk" style="--dw-cols:${cols}">
      <div class="dw-line dw-head" style="--dw-cols:${cols}">
        ${top}<span class="dw-tail"><i class="dw-op">${sign}</i>${b}<i class="dw-eq">=</i></span>
        <span class="dw-quotient">${quotient}</span>
      </div>
      ${working}
    </div>`;
}

/**
 * The walkthrough. `step` is how long each beat waits behind the one before it, in seconds;
 * pass 0 for a still frame that needs no motion at all.
 *
 * `from` is the step to start moving at — the one the grader says went wrong. Everything before
 * it is drawn already finished: a child who got the first two steps right does not need to watch
 * them done again, and a three-digit quotient worked through in full is nine rows and the better
 * part of half a minute on every miss.
 */
export function divideWalkHtml({ a, b }, { step = stepFor(DEFAULT_WALK_SPEED), title = '', from = 0, sign = '÷' } = {}) {
  const cols = walkCols(a);
  const steps = divSteps(a, b);
  const rows = divRows(a, b);
  const start = Math.max(0, Math.min(from, steps.length - 1));
  // Beat zero is the first thing that moves, so everything already finished has no delay and no
  // animation class at all — it is simply there, the way it is on the child's own page.
  const beat = (k, offset) => ((k - start) * BEATS_PER_STEP + offset) * step;
  const live = (k) => k >= start;

  const quotient = steps
    .map((s, k) =>
      live(k)
        ? cell(s.digit, 'dw-mark dw-qdigit', beat(k, 0))
        : cell(s.digit, 'dw-qdigit')
    )
    .join('');

  const working = rows
    .filter((row) => row.line !== 'q')
    .map((row) => {
      const k = row.step;
      const offset = row.kind === 'product' ? 1 : 2;
      const moving = live(k);
      const cells = cellsFor(
        cols,
        row,
        digitCells(row.value, row.width, moving ? 'dw-mark' : '', moving ? beat(k, offset) : null)
      );
      const line = `<div class="dw-line" style="--dw-cols:${cols}">${cells}</div>`;
      return row.kind === 'product'
        ? `${line}${ruleFor(cols, row, moving ? beat(k, offset + 0.5) : null)}`
        : line;
    })
    .join('');

  return `
    <div class="divwalk is-walk" style="--dw-cols:${cols}" role="img" aria-label="${title}">
      <div class="dw-line dw-head" style="--dw-cols:${cols}">
        ${digitsOf(a).map((d) => cell(d, 'dw-digit')).join('')}
        <span class="dw-tail"><i class="dw-op">${sign}</i>${b}<i class="dw-eq">=</i></span>
        <span class="dw-quotient">${quotient}</span>
      </div>
      ${working}
    </div>`;
}

/** How long the whole thing takes, so a caller can wait exactly that long and no longer. */
export function divideWalkDuration({ a, b }, { step = stepFor(DEFAULT_WALK_SPEED), from = 0 } = {}) {
  const steps = divSteps(a, b);
  const start = Math.max(0, Math.min(from, steps.length - 1));
  return ((steps.length - start) * BEATS_PER_STEP * step + 1.2) * 1000;
}

/** Which step of the working a wrong row belongs to — three rows to a step, in writing order. */
export const stepOfRow = (row) => Math.floor(Math.max(0, row) / BEATS_PER_STEP);
