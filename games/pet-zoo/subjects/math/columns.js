// Column arithmetic, done both rightly and — deliberately — wrongly.
//
// The right version is here because the answer strip and the walkthrough both need to know
// what happens in each column, not just what the whole sum comes to. The wrong versions are
// here because they are how a mistake gets a name: rather than trying to characterise
// "715" with a predicate, `grade.js` simply *runs the mistaken procedure* and asks whether it
// produces the number the child wrote. Every verdict is then testable by construction — run
// the wrong algorithm, feed its output back to the grader, and the verdict must come back.
//
// Pure. Digits are held ones-first throughout, because that is the order the work is done in.

/** How many columns a question needs — the longer of its two numbers. */
export const columnCount = (a, b) => Math.max(String(a).length, String(b).length);

/** A number as ones-first digits, padded to `len`. */
export function digitsOf(n, len) {
  const out = [];
  for (let i = 0; i < len; i += 1) out.push(Math.floor(Math.abs(n) / 10 ** i) % 10);
  return out;
}

/** Ones-first digits back into a number. Digits above nine simply carry, which is what the
 *  wrong-algorithm runs below rely on to stay honest about what they produce. */
export const fromDigits = (digits) => digits.reduce((sum, d, i) => sum + d * 10 ** i, 0);

/** The two numbers lined up, ones column first: `[{ top, bottom }, …]`. */
export function columnsOf(a, b) {
  const len = columnCount(a, b);
  const top = digitsOf(a, len);
  const bottom = digitsOf(b, len);
  return top.map((digit, i) => ({ top: digit, bottom: bottom[i] }));
}

/**
 * Working an addition one column at a time: what each column shows, and what it carries. The
 * walkthrough animates exactly this, which is why it is a list of steps rather than a total.
 */
export function addSteps(a, b) {
  const cols = columnsOf(a, b);
  const steps = [];
  let carry = 0;
  for (const { top, bottom } of cols) {
    const sum = top + bottom + carry;
    steps.push({ top, bottom, carryIn: carry, digit: sum % 10, carryOut: sum >= 10 ? 1 : 0 });
    carry = sum >= 10 ? 1 : 0;
  }
  if (carry) steps.push({ top: 0, bottom: 0, carryIn: 1, digit: 1, carryOut: 0 });
  return steps;
}

/**
 * And a subtraction. `borrowed` is the digit the column actually worked with once it had
 * borrowed — the number a child writes above the crossed-out one.
 */
export function subSteps(a, b) {
  const cols = columnsOf(a, b);
  const steps = [];
  let borrow = 0;
  for (const { top, bottom } of cols) {
    const lent = top - borrow;
    const need = lent < bottom;
    const worked = need ? lent + 10 : lent;
    steps.push({ top, bottom, borrowIn: borrow, borrowed: need ? worked : null, digit: worked - bottom });
    borrow = need ? 1 : 0;
  }
  return steps;
}

export const answerOf = ({ op, a, b }) => (op === '-' ? a - b : a + b);

/* ------------------------------------------------------- the wrong ways round */

/**
 * Every column's *whole* sum written into its column, so 47 + 38 comes out as 715. The single
 * commonest column-addition mistake there is, and the one that most clearly means "nobody has
 * explained what the carry is for".
 */
export const wroteFullSumInColumn = (a, b) =>
  Number(
    columnsOf(a, b)
      .map((c) => c.top + c.bottom)
      .reverse()
      .join('')
  );

/** Every column reduced to its last digit and the carry simply dropped: 47 + 38 = 75. */
export const forgotCarry = (a, b) =>
  fromDigits(columnsOf(a, b).map((c) => (c.top + c.bottom) % 10));

/** The carry written down, but one column too far to the left: 47 + 38 = 175. */
export function carriedWrongColumn(a, b) {
  const cols = columnsOf(a, b);
  const out = new Array(cols.length + 2).fill(0);
  cols.forEach((c, i) => {
    const sum = c.top + c.bottom;
    out[i] += sum % 10;
    if (sum >= 10) out[i + 2] += 1;
  });
  return fromDigits(out);
}

/** The carry added straight back into the column it came out of: 47 + 38 = 76. */
export const carriedIntoOwnColumn = (a, b) =>
  fromDigits(
    columnsOf(a, b).map((c) => {
      const sum = c.top + c.bottom;
      return (sum % 10) + (sum >= 10 ? 1 : 0);
    })
  );

/**
 * The classic: the smaller digit taken from the larger in every column, whichever row it is
 * in, so 52 − 38 comes out as 26. It is not carelessness — it is a child avoiding a
 * subtraction they have not been shown how to do, which is worth saying differently from
 * "wrong".
 */
export const smallerFromLarger = (a, b) =>
  fromDigits(columnsOf(a, b).map((c) => Math.abs(c.top - c.bottom)));

/** Borrowed in one column but never paid back in the next: 52 − 38 = 24. */
export const forgotBorrow = (a, b) =>
  fromDigits(
    columnsOf(a, b).map((c) => {
      const d = c.top - c.bottom;
      return d < 0 ? d + 10 : d;
    })
  );

/**
 * The borrow that has to reach past a zero, and does not: 503 − 178 = 435. The zero is turned
 * into a ten and then nothing is taken from the column above it, because there was apparently
 * nothing there to take. The hardest step in the whole ladder, and the one children most
 * reliably get wrong.
 */
export function borrowAcrossZero(a, b) {
  const cols = columnsOf(a, b);
  const top = cols.map((c) => c.top);
  const out = [];
  let borrow = 0;
  for (let i = 0; i < cols.length; i += 1) {
    let lent = top[i] - borrow;
    const bottom = cols[i].bottom;
    if (lent < bottom) {
      lent += 10;
      if (top[i + 1] === 0) {
        top[i + 1] = 10; // made ten out of nothing, and nobody paid for it
        borrow = 0;
      } else {
        borrow = 1;
      }
    } else {
      borrow = 0;
    }
    out.push(lent - bottom);
  }
  return fromDigits(out);
}

/** Whether a question even has a zero for a borrow to reach past. */
export const hasZeroToCross = (a, b) => borrowAcrossZero(a, b) !== a - b;
