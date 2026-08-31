// Skills: the half of the ladder that is a *method* rather than a list of facts.
//
// A fact is a thing to know, and there are only so many of them — sixty-six sums, a hundred
// and twenty-one differences. A method is not like that. There are eight thousand one hundred
// two-digit column additions, and the child is not supposed to remember any of them; they are
// supposed to remember what to do. So above the facts an item stops being a question and
// becomes a *skill*, and its numbers are made up fresh every time it is asked.
//
// That breaks the game's usual guarantee. "Four right in a row" means something for a fact —
// it is the same question four times — but for a skill it might be four easy draws in a row.
// Hence `shapes`: every skill names the genuinely different cases inside it, and the item
// remembers which ones it has actually got right. While a skill is still being learned the
// generator is *asked for* a case the child has not covered yet, rather than rolling the dice
// and hoping; and the skill cannot graduate until every case is covered. Coverage is the
// thing that makes the practice sufficient, and it completes by design rather than by luck.
//
// Pure, and deterministic: the same seed gives the same numbers, which is the only reason any
// of this is testable.

import { mulSteps } from './columns.js';
import { digitsOf as divDigits, divSteps, quotientOf, remainderOf, rowShape } from './divide.js';

export const SKILL_PREFIX = 'skill:';

const SHAPE = /^skill:([a-z0-9+-]+)$/;

export const idOf = ({ skill }) => `${SKILL_PREFIX}${skill}`;

export function parse(itemId) {
  const match = SHAPE.exec(String(itemId ?? ''));
  if (!match) return null;
  return { skill: match[1] };
}

/* ------------------------------------------------------------------ randomness */

/**
 * mulberry32 — small, fast, and good enough for picking two-digit numbers. What matters is
 * only that it is a pure function of its seed, so a generated question can be reproduced in a
 * test without the test having to know what the generator was thinking.
 */
export function rngFrom(seed) {
  let t = (Number(seed) >>> 0) || 1;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** An integer in [lo, hi], both ends included. */
const between = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const pick = (rnd, list) => list[Math.floor(rnd() * list.length)];

/* --------------------------------------------------------------------- shapes */

// Every skill is declared the same way: which rung it sits on, how it is presented, how many
// boxes its answer is written into, the cases it must cover, and how to build one.
//
// `column: true` means the question is drawn stacked, with a rule under it and one answer box
// per column — the presentation *is* part of what tiers 13 and up are teaching, so it belongs
// in the curriculum rather than in the renderer.
//
// `width` is fixed per skill and never a function of the numbers drawn. This is the same rule
// the addition strip has always followed: sizing the boxes to the answer would hand it over,
// because a missing box would mean "the answer is smaller than you thought".

const SKILLS = [
  {
    skill: 'tens+',
    tier: 11,
    column: false,
    width: 3,
    shapes: ['small', 'toHundred'],
    make(rnd, shape) {
      // Whole tens, and never a zero: "30 + 0" is not a lesson about tens.
      if (shape === 'toHundred') {
        const a = between(rnd, 1, 9);
        return { op: '+', a: a * 10, b: (10 - a) * 10 };
      }
      const a = between(rnd, 1, 8);
      const b = between(rnd, 1, 9 - a);
      return { op: '+', a: a * 10, b: b * 10 };
    },
  },
  {
    skill: 'tens-',
    tier: 11,
    column: false,
    width: 2,
    shapes: ['small', 'fromHundred'],
    make(rnd, shape) {
      if (shape === 'fromHundred') {
        const b = between(rnd, 1, 9);
        return { op: '-', a: 100, b: b * 10 };
      }
      const a = between(rnd, 2, 9);
      const b = between(rnd, 1, a - 1);
      return { op: '-', a: a * 10, b: b * 10 };
    },
  },
  {
    skill: 'pv+',
    tier: 12,
    column: false,
    width: 2,
    shapes: ['plain', 'toRound'],
    make(rnd, shape) {
      // Two-digit plus one-digit that never crosses the ten: the ones simply grow.
      const tens = between(rnd, 1, 8);
      if (shape === 'toRound') {
        const ones = between(rnd, 1, 9);
        return { op: '+', a: tens * 10 + ones, b: 10 - ones };
      }
      const ones = between(rnd, 1, 7);
      return { op: '+', a: tens * 10 + ones, b: between(rnd, 1, 9 - ones) };
    },
  },
  {
    skill: 'pv-',
    tier: 12,
    column: false,
    width: 2,
    shapes: ['plain', 'fromRound'],
    make(rnd, shape) {
      const tens = between(rnd, 1, 9);
      if (shape === 'fromRound') {
        // Landing on the ten below is the shape that makes borrowing thinkable later.
        return { op: '-', a: tens * 10, b: 0 };
      }
      const ones = between(rnd, 2, 9);
      return { op: '-', a: tens * 10 + ones, b: between(rnd, 1, ones) };
    },
  },
  {
    skill: 'pv10',
    tier: 12,
    column: false,
    width: 2,
    shapes: ['plus', 'minus'],
    make(rnd, shape) {
      // Adding and taking a whole ten off a two-digit number: only one digit moves, which is
      // the observation the whole of column work rests on.
      const ones = between(rnd, 0, 9);
      if (shape === 'minus') return { op: '-', a: between(rnd, 2, 9) * 10 + ones, b: 10 };
      return { op: '+', a: between(rnd, 1, 8) * 10 + ones, b: 10 };
    },
  },
  {
    skill: 'tensx',
    tier: 31,
    column: false,
    // 99 x 90 is 8910, so four boxes — and four for every question on the rung, including
    // 12 x 10, which is what stops the strip saying how big the answer is going to be.
    width: 4,
    shapes: ['ten', 'tens'],
    make(rnd, shape) {
      // Multiplying by a whole ten, where the digits stay exactly as they were and a zero
      // arrives on the end. The observation the shift in a two-digit multiplier rests on, met
      // here on its own before it has to be used inside something bigger.
      const a = between(rnd, 11, 99);
      if (shape === 'ten') return { op: '×', a, b: 10 };
      return { op: '×', a, b: between(rnd, 2, 9) * 10 };
    },
  },
  {
    skill: 'div10',
    tier: 43,
    column: false,
    // 990 ÷ 10 is 99, so two boxes — and two for every question on the rung, including
    // 480 ÷ 60, which is what stops the strip saying how big the answer is going to be.
    width: 2,
    shapes: ['ten', 'tens'],
    make(rnd, shape) {
      // Dividing by a whole ten, where the digits stay exactly as they were and a zero comes
      // off the end. The mirror of `tensx`, and the observation the whole of the written method
      // rests on: met here on its own, before it has to be used inside something bigger.
      if (shape === 'ten') {
        const q = between(rnd, 2, 99);
        return { op: '÷', a: q * 10, b: 10 };
      }
      const q = between(rnd, 2, 9);
      const b = between(rnd, 2, 9) * 10;
      return { op: '÷', a: q * b, b };
    },
  },
];

/* -------------------------------------------------------- column addition */

// A column skill is described by the digits of its two operands and whether a carry is wanted,
// so the six column rungs are six lines of declaration rather than six generators.
const columnAdd = ({ skill, tier, digits, other, carry, shapes }) => ({
  skill,
  tier,
  column: true,
  // One box per column of the *larger* operand, plus one for a carry out of the top.
  width: digits + 1,
  shapes,
  make(rnd, shape) {
    return makeColumnAdd(rnd, shape, digits, other, carry);
  },
});

function makeColumnAdd(rnd, shape, digits, other, carry) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const a = randomDigits(rnd, digits);
    const b = randomDigits(rnd, other);
    if (shapeOfAdd(a, b, digits) !== shape) continue;
    return { op: '+', a, b };
  }
  // Unreachable in practice — every declared shape is exercised by a test — but a generator
  // that could return nothing would be a generator that could hang the game.
  return { op: '+', a: 10 ** (digits - 1), b: 10 ** Math.max(0, other - 1) };
}

/** Which case a column addition actually turned out to be. */
export function shapeOfAdd(a, b, digits) {
  const carries = carriesOf(a, b);
  if (!carries.length) return 'noCarry';
  if (String(a + b).length > digits) return 'carryOut';
  if (carries.length > 1) return 'carryBoth';
  return carries[0] === 0 ? 'carryOnes' : 'carryTens';
}

/** Which columns produce a carry, counted from the ones. */
export function carriesOf(a, b) {
  const out = [];
  let carry = 0;
  let x = a;
  let y = b;
  let place = 0;
  while (x > 0 || y > 0) {
    const sum = (x % 10) + (y % 10) + carry;
    carry = sum >= 10 ? 1 : 0;
    if (carry) out.push(place);
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    place += 1;
  }
  return out;
}

/* ------------------------------------------------------ column subtraction */

const columnSub = ({ skill, tier, digits, other, shapes }) => ({
  skill,
  tier,
  column: true,
  // Never more boxes than the number being taken from has digits: a difference cannot be
  // longer than what it was taken out of.
  width: digits,
  shapes,
  make(rnd, shape) {
    return makeColumnSub(rnd, shape, digits, other);
  },
});

function makeColumnSub(rnd, shape, digits, other) {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const a = randomDigits(rnd, digits);
    const b = randomDigits(rnd, other);
    if (b > a) continue;
    if (shapeOfSub(a, b) !== shape) continue;
    return { op: '-', a, b };
  }
  return { op: '-', a: 10 ** (digits - 1), b: 0 };
}

/** Which case a column subtraction turned out to be. */
export function shapeOfSub(a, b) {
  const borrows = borrowsOf(a, b);
  if (!borrows.length) return 'noBorrow';
  if (acrossZero(a, b)) return 'acrossZero';
  if (borrows.length > 1) return 'borrowBoth';
  return borrows[0] === 0 ? 'borrowOnes' : 'borrowTens';
}

/** Which columns have to borrow from the one above. */
export function borrowsOf(a, b) {
  const out = [];
  let borrow = 0;
  let x = a;
  let y = b;
  let place = 0;
  while (x > 0 || y > 0) {
    const top = (x % 10) - borrow;
    const bottom = y % 10;
    borrow = top < bottom ? 1 : 0;
    if (borrow) out.push(place);
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    place += 1;
  }
  return out;
}

/**
 * Whether the borrow has to reach past a zero — 405 − 168, where the tens column has nothing
 * to lend and must borrow itself. It is the hardest thing in the whole ladder and the one
 * children most reliably get wrong, so it is a case in its own right rather than one draw of
 * "three-digit subtraction" among many.
 */
export function acrossZero(a, b) {
  let borrow = 0;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    const top = x % 10;
    const bottom = y % 10;
    if (borrow && top === 0) return true;
    borrow = top - borrow < bottom ? 1 : 0;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

/** A number with exactly this many digits — no leading zero, so the column is always full. */
function randomDigits(rnd, digits) {
  if (digits <= 1) return between(rnd, 1, 9);
  const lo = 10 ** (digits - 1);
  return between(rnd, lo, 10 ** digits - 1);
}

/* -------------------------------------------------------- column multiplication */

// The same idea as column addition carried out twice over: once down the multiplicand for
// each digit of the multiplier, and then once more to add the partial products up. What is
// new is the *shift* — the second partial product is 47 x 30, not 47 x 3 — and this game
// writes it with its zeros on the end rather than indenting it, because a zero a child has
// put there is a zero they have thought about.

/**
 * Which case a multiplication turned out to be. Read across *every* partial product rather
 * than only the first, so `noCarry` means what it says: nothing carried anywhere in the whole
 * question, not merely nothing in its top row.
 */
export function shapeOfMul(a, b) {
  // A zero inside the number being multiplied is its own lesson — the column comes to nothing
  // and then whatever was carried lands on it — so it outranks the carry cases.
  if (String(Math.abs(a)).includes('0')) return 'zeroInside';
  const digits = String(Math.abs(a)).length;
  const { partials } = mulSteps(a, b);
  const carries = partials.flatMap((p) =>
    p.steps.map((step, col) => (step.carryOut ? col : -1)).filter((col) => col >= 0)
  );
  if (!carries.length) return 'noCarry';
  // A partial product longer than the number it came from: the carry ran off the top.
  if (partials.some((p) => String(a * p.digit).length > digits)) return 'carryOut';
  if (carries.length > 1) return 'carryBoth';
  return 'carryOnes';
}

const columnMul = ({ skill, tier, digits, other, shapes }) => ({
  skill,
  tier,
  column: true,
  digits,
  other,
  // A product is never longer than the two numbers' digit counts added together, and the strip
  // is never allowed to be shorter than that — sizing it to the numbers drawn would say how
  // big the answer was going to be before the child had multiplied anything.
  width: digits + other,
  // One row per digit of the multiplier, each a place wider than the last because it carries
  // its own zeros, and then the total. A single-digit multiplier has nothing to add up, so its
  // answer is the one row.
  // Every one of them right-aligned under the ones, because a partial product carries its own
  // zeros rather than being indented — so they all sit at `place` 0, one to a line.
  rows: (other > 1
    ? [...Array.from({ length: other }, (_, place) => digits + 1 + place), digits + other]
    : [digits + other]
  ).map((width, line) => ({ width, place: 0, line })),
  shapes,
  make(rnd, shape) {
    return makeColumnMul(rnd, shape, digits, other);
  },
});

function makeColumnMul(rnd, shape, digits, other) {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const a = randomDigits(rnd, digits);
    // Never one: "23 x 1" is not a question about a method, it is a question about whether the
    // child is paying attention.
    const b = other === 1 ? between(rnd, 2, 9) : randomDigits(rnd, other);
    // And a multiplier ending in zero would ask for a whole row of zeros to be written out.
    // Whole tens are tier 31's own question, met there on their own.
    if (other > 1 && b % 10 === 0) continue;
    if (shapeOfMul(a, b) !== shape) continue;
    return { op: '\u00d7', a, b };
  }
  // Unreachable in practice — every declared shape is exercised by a test — but a generator
  // that could return nothing would be a generator that could hang the game.
  return { op: '\u00d7', a: 10 ** (digits - 1) + 1, b: other > 1 ? 11 : 2 };
}

/* -------------------------------------------------------- long division */

// The other three column methods are worked ones-first and pass what will not fit to the left.
// Division goes the other way: it starts at the biggest place and passes what is left over to
// the right, into the digit that comes down to meet it. Everything below follows from that.

/**
 * Which case a division turned out to be. Read off the worked steps rather than guessed at, in
 * priority order, so every question lands on exactly one case and a rung can be finished.
 */
export function shapeOfDiv(a, b) {
  const steps = divSteps(a, b);
  if (!steps.length) return 'noExchange';
  const digits = steps.map((step) => step.digit);
  // A zero in the quotient outranks everything else: the column comes to nothing, the answer
  // still needs a digit written in it, and leaving it out is the classic mistake of the method.
  const zeroAt = digits.findIndex((digit, i) => i > 0 && digit === 0);
  if (zeroAt >= 0) return zeroAt === digits.length - 1 ? 'zeroEnd' : 'zeroInside';
  // Something left over at the end is a different question from anything left over on the way,
  // so it is named for what the child has to *write down* rather than for what they did.
  const carried = steps.slice(0, -1).filter((step) => step.remainder > 0).length;
  if (steps[steps.length - 1].remainder > 0) {
    return carried ? 'exchangeThenRemainder' : 'remainderOnly';
  }
  // The leading digit had nothing in it to divide, so the first step took two digits and the
  // quotient is shorter than the number it came out of.
  if (divDigits(a)[0] < Math.abs(b)) return 'shortFirst';
  if (carried >= 2) return 'exchangeTwice';
  return carried ? 'exchange' : 'noExchange';
}

/**
 * A division skill, described by the size of the numbers rather than by a generator: how many
 * digits it divides into, how many the answer has, and whether anything is left over.
 *
 * `quotient` is fixed per rung and that is load-bearing. The working is written on three rows
 * per quotient digit, so a rung whose answers varied in length would have a stack that varied
 * in height — and the height would say how long the answer was going to be before the child
 * had divided anything. Every generator below is therefore asked for a quotient of exactly the
 * declared length and the numbers are built up from it, rather than drawn and hoped over.
 */
const columnDiv = ({ skill, tier, digits, quotient, exact, shapes }) => ({
  skill,
  tier,
  column: true,
  divide: true,
  digits,
  quotient,
  // The answer strip is the quotient; the working is laid out by `rowShape`, which is also what
  // the walkthrough draws against — one description of where the rows go, not two that can drift.
  width: quotient,
  rows: rowShape(quotient, digits),
  shapes,
  make(rnd, shape) {
    return makeColumnDiv(rnd, shape, digits, quotient, exact);
  },
});

function makeColumnDiv(rnd, shape, digits, quotient, exact) {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    // Never one: "84 : 1" is not a question about a method, it is a question about whether the
    // child is paying attention. Whole tens are tier 43's own question, met there on their own.
    const b = between(rnd, 2, 9);
    const q = randomDigits(rnd, quotient);
    const rest = exact ? 0 : between(rnd, 1, b - 1);
    const a = q * b + rest;
    if (divDigits(a).length !== digits) continue;
    if (quotientOf(a, b) !== q || remainderOf(a, b) !== rest) continue;
    if (shapeOfDiv(a, b) !== shape) continue;
    return { op: '÷', a, b };
  }
  // Unreachable in practice — every declared shape is exercised by a test — but a generator
  // that could return nothing would be a generator that could hang the game.
  return { op: '÷', a: 2 * 10 ** (digits - 1), b: 2 };
}

SKILLS.push(
  columnAdd({ skill: 'col+2', tier: 13, digits: 2, other: 2, shapes: ['noCarry'] }),
  columnAdd({ skill: 'col+21', tier: 13, digits: 2, other: 1, shapes: ['noCarry'] }),
  columnAdd({ skill: 'col+2c', tier: 14, digits: 2, other: 2, shapes: ['carryOnes', 'carryOut'] }),
  columnAdd({ skill: 'col+21c', tier: 14, digits: 2, other: 1, shapes: ['carryOnes', 'carryOut'] }),
  columnAdd({
    skill: 'col+3',
    tier: 15,
    digits: 3,
    other: 3,
    shapes: ['noCarry', 'carryOnes', 'carryTens', 'carryBoth', 'carryOut'],
  }),
  columnAdd({ skill: 'col+32', tier: 15, digits: 3, other: 2, shapes: ['carryOnes', 'carryBoth'] }),
  columnSub({ skill: 'col-2', tier: 16, digits: 2, other: 2, shapes: ['noBorrow'] }),
  columnSub({ skill: 'col-21', tier: 16, digits: 2, other: 1, shapes: ['noBorrow'] }),
  columnSub({ skill: 'col-2b', tier: 17, digits: 2, other: 2, shapes: ['borrowOnes'] }),
  columnSub({ skill: 'col-21b', tier: 17, digits: 2, other: 1, shapes: ['borrowOnes'] }),
  columnSub({
    skill: 'col-3',
    tier: 18,
    digits: 3,
    other: 3,
    shapes: ['borrowOnes', 'borrowTens', 'borrowBoth', 'acrossZero'],
  }),
  columnSub({ skill: 'col-32', tier: 18, digits: 3, other: 2, shapes: ['borrowOnes', 'acrossZero'] }),
  columnMul({ skill: 'colx21', tier: 32, digits: 2, other: 1, shapes: ['noCarry'] }),
  columnMul({ skill: 'colx21c', tier: 33, digits: 2, other: 1, shapes: ['carryOnes', 'carryOut'] }),
  columnMul({
    skill: 'colx31c',
    tier: 34,
    digits: 3,
    other: 1,
    shapes: ['carryOnes', 'carryBoth', 'carryOut'],
  }),
  columnMul({ skill: 'colx22', tier: 35, digits: 2, other: 2, shapes: ['noCarry', 'carryOnes', 'carryBoth'] }),
  // Not `carryOnes`: six digit-multiplications with exactly one carry between them barely
  // exists at this size, and a shape the generator cannot find is a shape the skill can never
  // finish covering — which would leave the last rung of the ladder unable to graduate.
  columnMul({
    skill: 'colx32',
    tier: 36,
    digits: 3,
    other: 2,
    shapes: ['carryBoth', 'carryOut', 'zeroInside'],
  }),
  columnDiv({ skill: 'div21', tier: 44, digits: 2, quotient: 2, exact: true, shapes: ['noExchange'] }),
  columnDiv({ skill: 'div21x', tier: 45, digits: 2, quotient: 2, exact: true, shapes: ['exchange'] }),
  // The one rung whose answer is shorter than the number it came out of, which is why it gets a
  // rung: 56 : 8 is seven, not oh-seven, and the leading nothing is where children stall.
  columnDiv({ skill: 'div21s', tier: 46, digits: 2, quotient: 1, exact: true, shapes: ['shortFirst'] }),
  columnDiv({
    skill: 'div31',
    tier: 47,
    digits: 3,
    quotient: 3,
    exact: true,
    shapes: ['noExchange', 'exchange', 'exchangeTwice'],
  }),
  columnDiv({
    skill: 'div31z',
    tier: 48,
    digits: 3,
    quotient: 3,
    exact: true,
    shapes: ['zeroInside', 'zeroEnd'],
  }),
  columnDiv({
    skill: 'div21r',
    tier: 49,
    digits: 2,
    quotient: 2,
    exact: false,
    shapes: ['remainderOnly', 'exchangeThenRemainder'],
  }),
  columnDiv({
    skill: 'div31r',
    tier: 50,
    digits: 3,
    quotient: 3,
    exact: false,
    shapes: ['remainderOnly', 'exchangeThenRemainder'],
  })
);

/* ---------------------------------------------------------------- the register */

export const FIRST_SKILL_TIER = 11;

const BY_SKILL = new Map(SKILLS.map((entry) => [entry.skill, entry]));

export const ALL_SKILLS = SKILLS.map((entry) => ({
  skill: entry.skill,
  id: idOf(entry),
  tier: entry.tier,
  shapes: entry.shapes,
}));

export const skillTierItems = (tierId) => ALL_SKILLS.filter((entry) => entry.tier === tierId);

export const definitionOf = (skill) => BY_SKILL.get(skill) ?? null;

export const owns = (itemId) => {
  const payload = parse(itemId);
  return Boolean(payload && BY_SKILL.has(payload.skill));
};

export const tierOf = ({ skill }) => BY_SKILL.get(skill)?.tier ?? FIRST_SKILL_TIER;

export const shapesOf = (skill) => BY_SKILL.get(skill)?.shapes ?? [];

export const widthOf = (skill) => BY_SKILL.get(skill)?.width ?? 2;

export const isColumn = (skill) => Boolean(BY_SKILL.get(skill)?.column);

/**
 * The rows a skill is answered in, **in the order they are written**, each `{ width, place,
 * line }`: how many boxes, which column its rightmost box sits in, and which line of the stack
 * it is drawn on. Ones-first within a row, as everywhere.
 *
 * Almost every skill is answered on one line and gets a single entry. A stacked multiplication
 * has one per partial product and one for the total, all right-aligned under the ones. A
 * division has three per quotient digit and they step across the page, which is what `place`
 * exists for.
 */
export const rowsOf = (skill) =>
  BY_SKILL.get(skill)?.rows ?? [{ width: widthOf(skill), place: 0, line: 0 }];

/** Whether a skill is worked as a stack of rows rather than a single answer. */
export const isMultiRow = (skill) => rowsOf(skill).length > 1;

/** Whether a skill is a long division, which is written and walked differently from the rest. */
export const isDivide = (skill) => Boolean(BY_SKILL.get(skill)?.divide);

/** How many digits the number being multiplied — or divided into — has. */
export const digitsOf = (skill) => BY_SKILL.get(skill)?.digits ?? 0;

/** How many digits the answer to a division has, which fixes the height of its stack. */
export const quotientDigitsOf = (skill) => BY_SKILL.get(skill)?.quotient ?? 0;

/** Whether a stored or imported record really describes a skill this build teaches. */
export const valid = (itemId, item) => owns(itemId) && item?.skill === parse(itemId).skill;

/**
 * Make one question. `shape` says which case is wanted — pass the one the child has not
 * covered yet — and `seed` makes the draw reproducible.
 *
 * Returns the numbers *and* the shape they came out as, because the shape is what gets
 * recorded as covered, and a generator that fell back must not be able to claim it produced
 * something it did not.
 */
export function generate(skill, { shape = null, seed = 1 } = {}) {
  const def = BY_SKILL.get(skill);
  if (!def) return null;
  const rnd = rngFrom(seed);
  const wanted = def.shapes.includes(shape) ? shape : pick(rnd, def.shapes);
  const made = def.make(rnd, wanted);
  return {
    ...made,
    skill,
    shape: actualShape(def, made, wanted),
    column: def.column,
    // Stated on the question rather than looked up later, so the renderer and the grader read
    // the same field and cannot disagree about which of the two stacked layouts this is.
    divide: Boolean(def.divide),
  };
}

/**
 * The case a generated question really is. For the column skills this is recomputed from the
 * numbers rather than trusted, so the fallback draw inside `makeColumnAdd` cannot record
 * coverage of a shape it failed to hit.
 */
function actualShape(def, made, wanted) {
  if (!def.column) return wanted;
  const found = shapeOfColumn(def, made);
  return def.shapes.includes(found) ? found : wanted;
}

function shapeOfColumn(def, made) {
  if (made.op === '\u00f7') return shapeOfDiv(made.a, made.b);
  if (made.op === '\u00d7') return shapeOfMul(made.a, made.b);
  if (made.op === '-') return shapeOfSub(made.a, made.b);
  return shapeOfAdd(made.a, made.b, def.width - 1);
}
