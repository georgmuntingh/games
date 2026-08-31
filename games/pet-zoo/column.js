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

import {
  addSteps,
  answerOf,
  columnCount,
  columnsOf,
  digitsOf,
  mulRows,
  mulSteps,
  subSteps,
} from './subjects/math/columns.js';

export { addSteps, answerOf, columnCount, columnsOf, mulRows, mulSteps, subSteps };

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
  op === '\u00d7'
    ? Math.max(columnCount(a, b), ...mulRows(a, b).map((row) => String(row).length))
    : Math.max(columnCount(a, b), String(Math.abs(answerOf({ op, a, b }))).length);

/**
 * One step per column, ones first, each carrying everything the picture needs to say: what the
 * column held, what it produced, and what it passed on.
 */
export function walkSteps({ op, a, b }) {
  if (op === '-') return subSteps(a, b);
  if (op === '\u00d7') return mulSteps(a, b).partials[0].steps;
  return addSteps(a, b);
}

/** The sign written down the left of the stack. */
const opSign = (op) => (op === '-' ? '\u2212' : op === '\u00d7' ? '\u00d7' : '+');

const cell = (content, classes = '', style = '') =>
  `<span class="cw-cell ${classes}"${style ? ` style="${style}"` : ''}>${content}</span>`;

/**
 * A digit of one of the two numbers being worked on, tagged with the place it stands in — so
 * the caller can light the ones the column being written is made from without counting cells.
 * The same idea as `data-dpos` on a long division's dividend.
 */
const digitCell = (content, place) =>
  `<span class="cw-cell" data-place="${place}">${content}</span>`;

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
      <div class="cw-row cw-top">${leftToRight(blank(top, aLen).map(digitCell)).join('')}</div>
      <div class="cw-row cw-bottom"><span class="cw-op">${opSign(op)}</span>${leftToRight(
        blank(bottom, bLen).map(digitCell)
      ).join('')}</div>
      <div class="cw-rule"></div>
      <div class="cw-row cw-answer">${leftToRight(padTo(slots, cols)).join('')}</div>
    </div>`;
}

/**
 * The same thing for a multiplication, which is answered on more than one line: a row of boxes
 * per partial product, a second rule, and then the total. `rows` is one `{ slots, carries }` per
 * answer row, ones-first, because the caller owns those boxes — they may be spans, ink pads or
 * carry cells, and this module has no business knowing which.
 *
 * Where the carries go is a small, deliberate departure from paper. The first partial product's
 * carries sit above the top number, which is where a child writes them and where the addition
 * walkthrough has always put them. The second's sit directly above its own row instead of being
 * rubbed out and rewritten over the first — there is room on a screen, and a carry the child can
 * still see is a carry they can still check. The final addition gets no carry row: it is column
 * addition, which this ladder taught eighteen rungs ago, and the stack is tall enough already.
 */
export function stackedMulMarkup({ a, b }, { rows = [], width = null } = {}) {
  const cols = width ?? walkWidth({ op: '\u00d7', a, b });
  const top = digitsOf(a, cols);
  const bottom = digitsOf(b, cols);
  const blank = (n, len) => n.map((d, i) => (i < len ? String(d) : ''));
  const carryRow = (carries) =>
    carries?.length
      ? `<div class="cw-row cw-carries">${leftToRight(padTo(carries, cols)).join('')}</div>`
      : '';
  const answerRow = (slots, extra = '') =>
    `<div class="cw-row cw-answer${extra}">${leftToRight(padTo(slots, cols)).join('')}</div>`;

  const partials = rows.length > 1 ? rows.slice(0, -1) : rows;
  const total = rows.length > 1 ? rows[rows.length - 1] : null;

  return `
    <div class="colwalk is-mul" style="--cw-cols:${cols}">
      ${carryRow(partials[0]?.carries)}
      <div class="cw-row cw-top">${leftToRight(
        blank(top, String(Math.abs(a)).length).map(digitCell)
      ).join('')}</div>
      <div class="cw-row cw-bottom"><span class="cw-op">${opSign('\u00d7')}</span>${leftToRight(
        blank(bottom, String(Math.abs(b)).length).map(digitCell)
      ).join('')}</div>
      <div class="cw-rule"></div>
      ${partials
        .map((partial, i) => (i === 0 ? '' : carryRow(partial.carries)) + answerRow(partial.slots, ' cw-partial'))
        .join('')}
      ${total ? `<div class="cw-rule"></div>${answerRow(total.slots)}` : ''}
    </div>`;
}

const padTo = (list, len) => {
  const out = [...list];
  while (out.length < len) out.push('<span class="cw-cell"></span>');
  return out.slice(0, len);
};

/**
 * What the box being written is made from.
 *
 * The counterpart of `ingredientsFor` in divwalk.js, and the difference between them is the
 * difference between the two families of method. A long division works a whole *row* out at
 * once, so its ingredients belong to the row. A column sum works a *column* at a time — each
 * box is its own little sum, made from the two digits stacked above it and whatever came in
 * from next door — so its ingredients belong to the box, and change as the cursor moves along.
 *
 *   +  and  −   the two digits in that column, and its carry or borrow: `addSteps` and
 *               `subSteps` both fold the one that came in into the digit they produce, so it is
 *               an ingredient in the full sense, not a note in the margin
 *   ×  partial  the digit of the multiplier this row belongs to, and the digit of the
 *               multiplicand standing over the box — allowing for the row's own shift, which is
 *               why the box over a partial product's trailing zero cites nothing above it
 *   ×  total    the partial products' own digits in that column, because that is all the last
 *               line is: those rows added up
 *
 * Everything here is worked in *places*, counting from the ones, because that is the only
 * coordinate the whole stack agrees on. The boxes do not: a row's `data-i` counts from the
 * left, so it depends on how wide that row is, and the rows of a multiplication are not all the
 * same width. Hence `widths` — one per answer row — and hence the total line citing a different
 * box index in each partial product while pointing at the same column.
 *
 * `carry.index` comes back as a place, because the scratch row really is indexed from the ones;
 * `slots[].i` comes back as a box index, because that is what `data-i` is.
 */
export function columnIngredients({ op, a, b }, { row = 0, index = 0, widths = [] } = {}) {
  const none = { top: null, bottom: null, carry: null, slots: [] };
  const width = widths[row] ?? 0;
  if (!width) return none;
  const place = width - 1 - index;
  const within = (n, at) => (at >= 0 && at < String(Math.abs(n)).length ? at : null);

  if (op !== '\u00d7') {
    return { ...none, top: within(a, place), bottom: within(b, place), carry: { row: 0, index: place } };
  }
  // The last line of a stacked multiplication is the partial products added up — so what it is
  // made from is those rows, in this column, and nothing from the question at all. A one-row
  // multiplication has no total: the single row *is* the product.
  if (widths.length > 1 && row === widths.length - 1) {
    const slots = [];
    for (let r = 0; r < widths.length - 1; r += 1) {
      const i = widths[r] - 1 - place;
      if (i >= 0 && i < widths[r]) slots.push({ row: r, i });
    }
    return { ...none, slots };
  }
  return {
    ...none,
    // Each partial product carries its own zeros, so the box in this column of row `row` is
    // where the multiplicand's digit `row` places to the right of it lands.
    top: within(a, place - row),
    bottom: within(b, row),
    carry: { row, index: place },
  };
}

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
 * The walkthrough for a stacked multiplication.
 *
 * Only one row is walked — the first one that went wrong. The rest of the stack is drawn
 * finished, because a child who got the ones row right does not need to watch it being done
 * again, and a 247 x 38 walked in full is ten columns of working and the better part of half a
 * minute. `row` is which row to walk, straight from the grade result.
 */
export function mulWalkHtml(question, { step = stepFor(DEFAULT_WALK_SPEED), row = 0, width = null, title = '' } = {}) {
  const { a, b } = question;
  const cols = width ?? walkWidth({ op: '\u00d7', a, b });
  const { partials } = mulSteps(a, b);
  const values = mulRows(a, b);
  const walked = Math.max(0, Math.min(row, values.length - 1));
  const isPartialWalk = values.length > 1 ? walked < partials.length : true;
  const delay = (i) => (step * i).toFixed(2);

  // The digits of one row, either landing one at a time or simply there.
  const digitCells = (value, live) =>
    digitsOf(value, cols).map((digit, i) => {
      const blank = i >= String(value).length;
      const text = blank ? '' : String(digit);
      return live
        ? cell(text, 'cw-lands', `--cw-delay:${delay(i + 0.7)}s`)
        : cell(text, 'cw-done');
    });

  // The carries the walked partial produces, each above the column it is going *into* — one to
  // the left of the column that made it, which is the whole point of the picture.
  const marks = new Array(cols).fill('');
  if (isPartialWalk) {
    partials[walked].steps.forEach((s, i) => {
      if (s.carryOut && i + 1 < cols) {
        marks[i + 1] = `<span class="cw-mark cw-carry" style="--cw-delay:${delay(i + 0.5)}s">${s.carryOut}</span>`;
      }
    });
  }
  const markRow = `<div class="cw-row cw-carries">${leftToRight(marks)
    .map((mark) => `<span class="cw-cell">${mark}</span>`)
    .join('')}</div>`;
  const emptyRow = `<div class="cw-row cw-carries">${new Array(cols)
    .fill('<span class="cw-cell"></span>')
    .join('')}</div>`;

  // While a partial product is being worked, the two numbers it comes from light up column by
  // column. The final addition lights nothing: what it is adding is already on the screen.
  const lit = (n, len) =>
    digitsOf(n, cols).map((digit, i) =>
      cell(
        i < len ? String(digit) : '',
        isPartialWalk ? 'cw-lit' : 'cw-done',
        isPartialWalk ? `--cw-delay:${delay(i)}s` : ''
      )
    );

  const partialRows = (values.length > 1 ? values.slice(0, -1) : values)
    .map((value, i) => {
      const carries = i === 0 ? '' : i === walked && isPartialWalk ? markRow : emptyRow;
      return `${carries}<div class="cw-row cw-answer cw-partial">${leftToRight(
        digitCells(value, i === walked)
      ).join('')}</div>`;
    })
    .join('');

  const total =
    values.length > 1
      ? `<div class="cw-rule"></div><div class="cw-row cw-answer">${leftToRight(
          digitCells(values[values.length - 1], walked === values.length - 1)
        ).join('')}</div>`
      : '';

  return `
    <div class="colwalk is-walking is-mul" style="--cw-cols:${cols}" role="img" aria-label="${title}">
      ${walked === 0 && isPartialWalk ? markRow : emptyRow}
      <div class="cw-row cw-top">${leftToRight(lit(a, String(Math.abs(a)).length)).join('')}</div>
      <div class="cw-row cw-bottom"><span class="cw-op">${opSign('\u00d7')}</span>${leftToRight(
        lit(b, String(Math.abs(b)).length)
      ).join('')}</div>
      <div class="cw-rule"></div>
      ${partialRows}
      ${total}
    </div>`;
}

/** How long a multiplication walk takes — the walked row only, since it is the only one moving. */
export function mulWalkDuration(question, { step = stepFor(DEFAULT_WALK_SPEED), row = 0, width = null } = {}) {
  const cols = width ?? walkWidth({ op: '\u00d7', ...question });
  return ((cols + 1.2) * step + 0.5) * 1000;
}

/**
 * How long the whole walk takes, so a caller can wait exactly that long and no longer. The
 * 1.2 covers the last column's own sub-steps — its digit lands seven tenths of a step after
 * the column lights up — and the half second on the end is a beat to look at the finished sum
 * before the pet comes back.
 */
export const walkDuration = (question, step = stepFor(DEFAULT_WALK_SPEED)) =>
  ((walkWidth(question) + 1.2) * step + 0.5) * 1000;
