// Long division, done both rightly and — deliberately — wrongly.
//
// The counterpart of columns.js, and it is a separate module because division does not read
// the way the other three do. A column sum is worked ones-first and everything that leaves a
// column moves *left*; a division is worked from the biggest place down and everything that is
// left over moves *right*, into the digit that comes down to meet it. Sharing the file would
// mean sharing the direction, and the direction is the one thing they do not have in common.
//
// The right version is here because the answer strip, the walkthrough and the grader all need
// to know what happens at each step rather than only what the whole thing comes to. The wrong
// versions are here for the reason columns.js gives: rather than trying to characterise "13"
// with a predicate, `grade.js` simply *runs the mistaken procedure* and asks whether it
// produces the number the child wrote, so every verdict is testable by construction.
//
// Pure. Only whole numbers, only positive ones, and only divisors this game actually teaches.

/** The digits of a number, biggest place first — the order a division is worked in. */
export const digitsOf = (n) => String(Math.abs(Math.floor(n))).split('').map(Number);

export const quotientOf = (a, b) => Math.floor(a / b);

export const remainderOf = (a, b) => a % b;

/**
 * Working a division one step at a time: what each step divides into, what it takes away, and
 * what it has left. One step per digit of the quotient.
 *
 * The first step is the only one that is not simply "the next digit": where the leading digit
 * is smaller than the divisor it takes *two* digits, because that is what a child writes.
 * `456 : 8` starts at 45, not at 4, and the quotient is two digits rather than three with a
 * nothing on the front — nobody writes `056`.
 *
 * `working` is the number the step divides into, `product` what is written under it, and
 * `remainder` what is left before the next digit comes down. `place` is the power of ten the
 * step's quotient digit is worth, which is what puts every row in the right column.
 */
export function divSteps(a, b) {
  const dividend = Math.floor(Math.abs(a));
  const divisor = Math.floor(Math.abs(b));
  if (!divisor) return [];
  const digits = digitsOf(dividend);
  const n = digits.length;

  // Where the first step ends. One digit normally; two when the leading digit has nothing in
  // it to divide — which is the whole of what the `shortFirst` case is.
  let i = 0;
  let working = digits[0];
  if (working < divisor && n > 1) {
    working = working * 10 + digits[1];
    i = 1;
  }

  const steps = [];
  for (;;) {
    const digit = Math.floor(working / divisor);
    const product = digit * divisor;
    const remainder = working - product;
    steps.push({ digit, place: n - 1 - i, working, product, remainder });
    i += 1;
    if (i >= n) break;
    working = remainder * 10 + digits[i];
  }
  return steps;
}

/**
 * Which digits of the number being divided a step actually takes, as indices from the left.
 *
 * One, normally: the next digit comes down and joins whatever was left over. Two on the first
 * step of a `shortFirst` question, where the leading digit had nothing in it to divide and the
 * step had to reach for the one beside it — `456 : 8` begins by taking the four *and* the five.
 *
 * Read off the steps' places rather than re-derived, so it cannot disagree with `divSteps`
 * about where the working got to: a step's last digit is the one its quotient digit sits over,
 * and it starts wherever the step before it stopped.
 */
export function stepDigits(a, b, k) {
  const steps = divSteps(a, b);
  const step = steps[k];
  if (!step) return [];
  const n = digitsOf(a).length;
  const end = n - 1 - step.place;
  const start = k === 0 ? 0 : n - steps[k - 1].place;
  const out = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

/**
 * The shape of the working — where every row sits and how wide it is — **in the order the child
 * writes them**: for every step, the quotient digit, then the product taken away, then what is
 * left with the next digit brought down.
 *
 * Writing order rather than reading order, because that is what the answer strip walks. The
 * quotient digits are scattered along one line at the top and the working rows march down the
 * page, so each row carries the `place` its rightmost digit sits in and the `line` it is drawn
 * on; `line: 'q'` is the quotient, shared by every step.
 *
 * A function of the two *lengths* alone — how many digits are being divided into and how many
 * the answer has — so it is the same shape for every question on a rung, which is what stops
 * the stack from saying how the division is going to come out. It is also the single
 * description of that shape: `divRows` fills values into it and `skills.js` hands the same
 * template to the answer strip, so the boxes a child types into and the working the walkthrough
 * draws cannot end up in different columns.
 *
 * The widths are the tightest that always fit. A step divides into at most two digits and takes
 * away at most two, except the very first, which divides into one digit unless the leading digit
 * was too small to divide at all. The last remainder is what is left over and never reaches ten.
 *
 * Every row here is `flow: 'number'`, and that is the other thing division does back to front.
 * A column sum's answer row is a set of *places* — the digit worked out for the ones column goes
 * in the ones box and nowhere else, so it is filled ones-first, right to left. A division's
 * working rows are not places; they are ordinary numbers that happen to be written under
 * particular columns, and a child writes ten as a one and then a nought. So they fill left to
 * right and settle to the right of the row, exactly as the inline answer strip does — which is
 * also what puts a one-digit remainder under the ones and leaves the box beside it empty.
 */
export function rowShape(quotient, digits) {
  // The leading digit had nothing in it to divide, so the first step took two digits and the
  // answer came out shorter than the number it was taken from.
  const shortFirst = digits > quotient;
  const rows = [];
  for (let k = 0; k < quotient; k += 1) {
    const place = quotient - 1 - k;
    const last = k === quotient - 1;
    rows.push({ kind: 'quotient', step: k, width: 1, place, line: 'q', flow: 'number' });
    rows.push({
      kind: 'product',
      step: k,
      width: k === 0 && !shortFirst ? 1 : 2,
      place,
      line: 2 * k,
      flow: 'number',
    });
    rows.push({
      kind: 'remainder',
      step: k,
      width: last ? 1 : 2,
      place: Math.max(place - 1, 0),
      line: 2 * k + 1,
      flow: 'number',
    });
  }
  return rows;
}

/**
 * The working with the right numbers in it. The last remainder row is the remainder itself —
 * there is no next digit to bring down — which is why this game needs no separate box for it. A
 * child divides until nothing more comes down, and whatever is standing at the bottom of the
 * stack is what was left over.
 */
export function divRows(a, b) {
  const steps = divSteps(a, b);
  const shape = rowShape(steps.length, digitsOf(a).length);
  return shape.map((row) => {
    const step = steps[row.step];
    const next = steps[row.step + 1];
    if (row.kind === 'quotient') return { ...row, value: step.digit };
    if (row.kind === 'product') return { ...row, value: step.product };
    // Between steps the row is the remainder with the next digit already down beside it, because
    // that is the number the next step divides into and the number a child writes.
    return { ...row, value: next ? next.working : step.remainder };
  });
}

/* ------------------------------------------------------- the wrong ways round */

// Each of these runs a whole mistaken method over the question and returns the quotient a child
// would end up with. They are compared against what the child actually wrote, so a verdict is
// never a guess about what they might have been thinking.

/**
 * The remainder simply dropped at every step instead of being brought down to meet the next
 * digit: `456 : 8` becomes "45 makes 5, then 6 makes 0" — 50 rather than 57. The commonest
 * long-division mistake there is, and the one that means the bring-down has not landed yet.
 */
export function droppedRemainder(a, b) {
  const dividend = Math.floor(Math.abs(a));
  const divisor = Math.floor(Math.abs(b));
  if (!divisor) return 0;
  const digits = digitsOf(dividend);
  const n = digits.length;
  let i = 0;
  let working = digits[0];
  if (working < divisor && n > 1) {
    working = working * 10 + digits[1];
    i = 1;
  }
  const out = [];
  for (;;) {
    out.push(Math.floor(working / divisor));
    i += 1;
    if (i >= n) break;
    working = digits[i]; // whatever was left over is left behind
  }
  return Number(out.join(''));
}

/**
 * Every column divided whichever way round it would go: where the digit is smaller than the
 * divisor it is divided *into* it instead. `456 : 8` gives 8÷4 = 2, 8÷5 = 1, 8÷6 = 1 — so 211.
 *
 * The division counterpart of taking the smaller digit from the larger in a column subtraction,
 * and it is the same thing underneath: a child avoiding a step they have not been shown, rather
 * than a child being careless.
 */
export const dividedBackwards = (a, b) => {
  const divisor = Math.floor(Math.abs(b));
  if (!divisor) return 0;
  return Number(
    digitsOf(a)
      .map((digit) => (digit >= divisor ? Math.floor(digit / divisor) : Math.floor(divisor / digit || 0)))
      .join('')
  );
};

/** The sign read as a times. Its own verdict rather than a shared one, because "that is them
 *  multiplied" is the sentence to say here and nowhere else. */
export const dividedMultipliedInstead = (a, b) => a * b;

/** And read as a minus, which is what "how many are left" turns into when it goes wrong. */
export const dividedSubtractedInstead = (a, b) => a - b;
