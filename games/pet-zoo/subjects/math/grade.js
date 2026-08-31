// Naming the mistake.
//
// The clock answers a wrong time by walking the hands to the right one; adding answers a wrong
// sum by filling a ten-frame. Neither says "no". For that to work the game has to know *which*
// wrong idea it is looking at, because a child who added instead of subtracting and a child who
// miscounted by one need different sentences, and telling them the same thing teaches neither.
//
// Facts are graded by predicate — there are only so many ways to get 7 + 8 wrong. Column work
// is graded by **running the mistaken procedure**: `columns.js` holds a small library of wrong
// algorithms, and a verdict is simply the first one whose output matches what the child wrote.
// That is stronger than a predicate and much stronger than a guess, and it means every verdict
// can be tested by construction rather than by hand-computed examples.

import * as columns from './columns.js';
import * as divide from './divide.js';
import { DIV_FACT_VERDICTS, grade as gradeDivFact } from './divfacts.js';
import { grade as gradeFact } from './facts.js';
import { ALL_TIMES_VERDICTS, grade as gradeTimes } from './times.js';

export { DIV_FACT_VERDICTS };

/** Every verdict a fact can come back with. Exported so the language test can insist each one
 *  has a sentence to say, in both languages. */
export const FACT_VERDICTS = [
  'correct',
  'blank',
  'offByOne',
  'transposed',
  'gaveAddend',
  'gaveDifference',
  'gaveSum',
  'reversed',
  'gaveOperand',
  'wrong',
];

export const COLUMN_VERDICTS = [
  'correct',
  'blank',
  'offByOne',
  'wroteFullSumInColumn',
  'forgotCarry',
  'carriedWrongColumn',
  'carriedIntoOwnColumn',
  'smallerFromLarger',
  'forgotBorrow',
  'borrowAcrossZero',
  'addedInstead',
  'subtractedInstead',
  'placeValueOff',
  'wrong',
];

// Column multiplication's own, because the mistakes are its own. "Forgot the carry" happens in
// a column sum too, but the sentence for it there — "the ten from that column has to go next
// door" — is about adding, and saying it over a multiplication would teach the wrong thing.
export const MUL_COLUMN_VERDICTS = [
  'correct',
  'blank',
  'offByOne',
  'placeValueOff',
  'mulForgotShift',
  'mulCarriedFirst',
  'mulFullProductInColumn',
  'mulForgotColCarry',
  'mulOnlyOnes',
  'mulAddedInstead',
  'wrong',
];

// Long division's own, for the same reason. "You forgot the carry" and "you forgot to bring the
// next digit down" are both a child losing something between two columns, but the sentences go
// in opposite directions — one to the left, one to the right — and saying either over the other
// method would teach the wrong thing.
export const DIVIDE_VERDICTS = [
  'correct',
  'blank',
  'offByOne',
  'placeValueOff',
  'divForgotBringDown',
  'divIgnoredRemainder',
  'divZeroStep',
  'divDroppedRemainder',
  'divBackwards',
  'divMulInstead',
  'divSubInstead',
  'wrong',
];

// The one list the language test walks, so a new verdict without a sentence fails there rather
// than showing a child a raw key. The times tables declare their own beside their grader.
export const ALL_VERDICTS = [
  ...new Set([
    ...FACT_VERDICTS,
    ...COLUMN_VERDICTS,
    ...ALL_TIMES_VERDICTS,
    ...MUL_COLUMN_VERDICTS,
    ...DIV_FACT_VERDICTS,
    ...DIVIDE_VERDICTS,
  ]),
];

// Tried in order, first match wins, so the list is also a statement about which explanation is
// the most useful one when two of them happen to produce the same number.
const WRONG_WAYS = {
  '+': [
    ['wroteFullSumInColumn', columns.wroteFullSumInColumn],
    ['forgotCarry', columns.forgotCarry],
    ['carriedWrongColumn', columns.carriedWrongColumn],
    ['carriedIntoOwnColumn', columns.carriedIntoOwnColumn],
    ['subtractedInstead', (a, b) => a - b],
  ],
  '-': [
    ['smallerFromLarger', columns.smallerFromLarger],
    // Before `forgotBorrow`, which produces the same number whenever there is a zero in the
    // way — and when there is, "the tens had nothing to lend" is the thing worth saying. Where
    // there is no zero to cross this run gives the right answer and is skipped by the guard
    // below, so the order costs nothing anywhere else.
    ['borrowAcrossZero', columns.borrowAcrossZero],
    ['forgotBorrow', columns.forgotBorrow],
    ['addedInstead', (a, b) => a + b],
  ],
};

/**
 * Grade one answer. `question` is whatever `instanceOf` handed out — a fact or a generated
 * column sum — and `answer` is what the strip says, as a string of digits.
 */
export function grade(question, answer) {
  // A stacked multiplication is both a `×` and a column, and it is the column that decides how
  // it is marked — so this order matters. Below it, `×` and `÷` go to their own graders before
  // the fact grader, which reads any operator that is not a minus as a plus and would otherwise
  // happily tell a child that 7 × 8 is fifteen.
  if (question?.column) {
    if (question.op === '÷') return gradeDivide(question, answer);
    return question.op === '×' ? gradeMulColumn(question, answer) : gradeColumn(question, answer);
  }
  if (question?.op === '÷') return gradeDivFact(question, answer);
  if (question?.op === '×') return gradeTimes(question, answer);
  return gradeFact(question ?? {}, answer);
}

function gradeColumn({ op = '+', a, b }, answer) {
  const target = columns.answerOf({ op, a, b });
  // Checked before coercing, because Number(null) and Number('') are both 0 — and a child who
  // has not answered yet must never be told they said zero.
  const blank = answer === null || answer === undefined || answer === '';
  const value = blank ? NaN : Number(answer);
  if (!Number.isInteger(value) || value < 0) {
    return { verdict: 'blank', correct: false, nearMiss: false, delta: 0, columns: [] };
  }

  const result = (verdict) => ({
    verdict,
    correct: verdict === 'correct',
    // A slip of one is a miscount, not a misunderstanding. Nothing else in a column is: every
    // other verdict here is a whole procedure carried out wrongly, and softening it would say
    // "nearly" about something that was not nearly.
    nearMiss: verdict === 'offByOne',
    delta: value - target,
    // Which columns actually came out right, so the walkthrough can light the one that went
    // wrong and leave the others alone.
    columns: columnsRight({ op, a, b }, value),
  });

  if (value === target) return result('correct');
  for (const [verdict, run] of WRONG_WAYS[op] ?? []) {
    // A wrong way that happens to give the right answer is not a mistake, it is a coincidence —
    // 21 + 34 has no carry to forget — so it is skipped rather than reported.
    if (run(a, b) !== target && run(a, b) === value) return result(verdict);
  }
  if (Math.abs(value - target) === 1) return result('offByOne');
  // Out by exactly a power of ten: the digits were right and one of them landed in the wrong
  // column, which is a different lesson from getting the arithmetic wrong.
  if ([10, 100, 1000].includes(Math.abs(value - target))) return result('placeValueOff');
  return result('wrong');
}

/* ------------------------------------------------- column multiplication */

// Tried in order, first match wins. Each one runs a whole mistaken method over the question and
// asks whether it produces the number the child ended up with, exactly as the addition and
// subtraction lists above do.
const MUL_WRONG_WAYS = [
  ['mulCarriedFirst', columns.carriedBeforeMultiplying],
  ['mulFullProductInColumn', columns.wroteFullProductInColumn],
  ['mulForgotColCarry', columns.forgotMulCarry],
  ['mulOnlyOnes', columns.multipliedOnlyOnes],
  ['mulAddedInstead', columns.mulAddedInstead],
];

/** One row's answer as a number, or null for a blank or anything that is not a whole number. */
function rowValue(answer) {
  // Checked before coercing, because Number(null) and Number('') are both 0 — and a child who
  // has not answered yet must never be told they said zero.
  if (answer === null || answer === undefined || answer === '') return null;
  const value = Number(answer);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

/**
 * A stacked multiplication, which is answered on more than one line: each partial product and
 * then their total. `answer` is one string of digits per row, ones-first within each.
 *
 * Every row has to be right. A child who multiplied correctly and then added the two rows up
 * wrongly has not finished the method, and telling them otherwise would leave a wrong number
 * standing on the screen with a tick beside it.
 */
export function gradeMulColumn({ a, b }, answer) {
  const want = columns.mulRows(a, b);
  const answers = Array.isArray(answer) ? answer : [answer];
  const values = want.map((_, i) => rowValue(answers[i]));
  const target = a * b;

  if (values.some((value) => value === null)) {
    return { verdict: 'blank', correct: false, nearMiss: false, delta: 0, rows: [], row: 0, columns: [] };
  }

  const rows = want.map((wanted, i) => values[i] === wanted);
  const row = rows.indexOf(false);
  const total = values[values.length - 1];

  const result = (verdict) => ({
    verdict,
    correct: verdict === 'correct',
    // A slip of one is a miscount. Everything else here is a whole method carried out wrongly,
    // and softening it would say "nearly" about something that was not nearly.
    nearMiss: verdict === 'offByOne',
    delta: total - target,
    rows,
    // Which row to walk, and which of its columns already came out right — so the correction
    // can light the one place it actually went wrong and leave the rest of the stack alone.
    row: row === -1 ? want.length - 1 : row,
    columns: row === -1 ? [] : digitsRight(want[row], values[row]),
  });

  if (row === -1) return result('correct');

  // The shift, named from the row it happened in: the partial product itself is right and only
  // its zeros are missing, so it is sitting under the ones instead of where it belongs. Checked
  // before the whole-question runs because a child can make this mistake and still add their own
  // two rows up perfectly, which no run over the original numbers would ever reproduce.
  const { partials } = columns.mulSteps(a, b);
  if (row < partials.length) {
    const partial = partials[row];
    if (partial.place > 0 && values[row] === a * partial.digit) return result('mulForgotShift');
  }
  if (columns.forgotShift(a, b) !== target && total === columns.forgotShift(a, b)) {
    return result('mulForgotShift');
  }

  for (const [verdict, run] of MUL_WRONG_WAYS) {
    // A wrong way that happens to give the right answer is not a mistake, it is a coincidence —
    // 12 x 4 has no carry to forget — so it is skipped rather than reported.
    if (run(a, b) !== target && run(a, b) === total) return result(verdict);
  }

  const slip = values[row] - want[row];
  if (Math.abs(slip) === 1) return result('offByOne');
  // Out by exactly a power of ten: the digits were right and one of them landed in the wrong
  // column, which is a different lesson from getting the arithmetic wrong.
  if ([10, 100, 1000, 10000].includes(Math.abs(slip))) return result('placeValueOff');
  return result('wrong');
}

/* ------------------------------------------------------------ long division */

// Tried in order, first match wins. Each runs a whole mistaken method over the question and asks
// whether it produces the quotient the child ended up with — the same testable-by-construction
// property the addition, subtraction and multiplication lists above have.
// Note which famous mistake is *not* here: leaving a zero out of the quotient, so 618 : 6 comes
// out as 13. It cannot happen in this game. The quotient is written a digit to a box and the
// answer cannot be submitted with a box empty, so a child who skips the zero runs out of digits
// with a box still open and has to go back and look. The template teaches it instead of the
// correction having to. What *is* reachable at that step is writing the wrong digit into the
// zero's box, and that is `divZeroStep` below.
const DIV_WRONG_WAYS = [
  ['divDroppedRemainder', divide.droppedRemainder],
  ['divBackwards', divide.dividedBackwards],
  ['divMulInstead', divide.dividedMultipliedInstead],
  ['divSubInstead', divide.dividedSubtractedInstead],
];

/**
 * A long division, which is answered on a stack of rows: for every step the quotient digit, then
 * the product taken away, then what is left with the next digit brought down. `answer` is one
 * string of digits per row, in that order, ones-first within each.
 *
 * Every row has to be right. A child whose quotient is correct but whose working does not
 * support it has not done the method — and a tick beside a stack that does not add up would
 * teach exactly the wrong lesson about what the working is for.
 */
export function gradeDivide({ a, b }, answer) {
  const want = divide.divRows(a, b);
  const steps = divide.divSteps(a, b);
  const answers = Array.isArray(answer) ? answer : [answer];
  const values = want.map((_, i) => rowValue(answers[i]));
  const target = divide.quotientOf(a, b);

  if (values.some((value) => value === null)) {
    return { verdict: 'blank', correct: false, nearMiss: false, delta: 0, rows: [], row: 0, line: 'q', columns: [] };
  }

  const rows = want.map((row, i) => values[i] === row.value);
  const row = rows.indexOf(false);
  // The answer as the child actually wrote it, read off the quotient line alone: the working is
  // where the method is checked, but the *answer* is what the wrong-way runs are matched against.
  const wrote = Number(
    want.map((entry, i) => (entry.kind === 'quotient' ? values[i] : null)).filter((d) => d !== null).join('')
  );

  const result = (verdict) => ({
    verdict,
    correct: verdict === 'correct',
    // A slip of one is a miscount. Everything else here is a whole method carried out wrongly,
    // and softening it would say "nearly" about something that was not nearly.
    nearMiss: verdict === 'offByOne',
    delta: wrote - target,
    rows,
    // Which row went wrong first, and which line of the stack it is drawn on — so the
    // walkthrough can light the one place it actually went astray and leave the rest alone.
    row: row === -1 ? want.length - 1 : row,
    line: want[row === -1 ? want.length - 1 : row].line,
    columns: row === -1 ? [] : digitsRight(want[row].value, values[row]),
  });

  if (row === -1) return result('correct');

  // The answer itself gone astray: a whole wrong method, named by running it.
  if (wrote !== target) {
    for (const [verdict, run] of DIV_WRONG_WAYS) {
      // A wrong way that happens to give the right answer is not a mistake, it is a coincidence
      // — 242 : 2 has no column that needs turning round — so it is skipped rather than reported.
      if (run(a, b) !== target && wrote === run(a, b)) return result(verdict);
    }
  }

  // And the three that live in one step rather than in the whole method.
  const entry = want[row];
  // The step whose working number is smaller than the divisor, so the answer there is nothing.
  // Writing a digit into it anyway is the whole of what tier 48 is about, and it is much the
  // more useful thing to say than "that number is wrong".
  if (entry.kind === 'quotient' && entry.value === 0) return result('divZeroStep');
  if (entry.kind === 'remainder') {
    const step = steps[entry.step];
    // Subtracted correctly and then stopped: the remainder is written, but the digit that was
    // supposed to come down beside it never did.
    if (entry.step < steps.length - 1 && values[row] === step.remainder) {
      return result('divForgotBringDown');
    }
    // Nothing written where something was left over — the leftover rubbed out rather than kept.
    if (entry.step === steps.length - 1 && step.remainder > 0 && values[row] === 0) {
      return result('divIgnoredRemainder');
    }
  }

  const slip = values[row] - entry.value;
  if (Math.abs(slip) === 1) return result('offByOne');
  // Out by exactly a power of ten: the digits were right and one of them landed in the wrong
  // column, which is a different lesson from getting the arithmetic wrong.
  if ([10, 100, 1000].includes(Math.abs(slip))) return result('placeValueOff');
  return result('wrong');
}

/** Digit by digit, ones first: did the child's row put the right digit here? */
function digitsRight(wanted, got) {
  const len = Math.max(String(wanted).length, String(got).length);
  const want = columns.digitsOf(wanted, len);
  const mine = columns.digitsOf(got, len);
  return want.map((digit, i) => digit === mine[i]);
}

/** Column by column, ones first: did the child's answer put the right digit here? */
function columnsRight({ op, a, b }, value) {
  const len = Math.max(columns.columnCount(a, b), String(columns.answerOf({ op, a, b })).length);
  const want = columns.digitsOf(columns.answerOf({ op, a, b }), len);
  const got = columns.digitsOf(value, len);
  return want.map((digit, i) => digit === got[i]);
}
