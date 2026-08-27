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
import { grade as gradeFact } from './facts.js';
import { ALL_TIMES_VERDICTS, grade as gradeTimes } from './times.js';

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

// The one list the language test walks, so a new verdict without a sentence fails there rather
// than showing a child a raw key. The times tables declare their own beside their grader.
export const ALL_VERDICTS = [
  ...new Set([...FACT_VERDICTS, ...COLUMN_VERDICTS, ...ALL_TIMES_VERDICTS]),
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
  // Before the column check, and before the fact grader — which reads any operator that is not
  // a minus as a plus, and would happily tell a child that 7 × 8 is fifteen.
  if (question?.op === '×') return gradeTimes(question, answer);
  if (!question?.column) return gradeFact(question ?? {}, answer);
  return gradeColumn(question, answer);
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

/** Column by column, ones first: did the child's answer put the right digit here? */
function columnsRight({ op, a, b }, value) {
  const len = Math.max(columns.columnCount(a, b), String(columns.answerOf({ op, a, b })).length);
  const want = columns.digitsOf(columns.answerOf({ op, a, b }), len);
  const got = columns.digitsOf(value, len);
  return want.map((digit, i) => digit === got[i]);
}
