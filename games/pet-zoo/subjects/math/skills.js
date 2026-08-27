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
  rows:
    other > 1
      ? [...Array.from({ length: other }, (_, place) => digits + 1 + place), digits + other]
      : [digits + other],
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
 * The widths of the rows a skill is answered in, ones-first within each. Every skill has at
 * least one; only a stacked multiplication with a two-digit multiplier has more, and there the
 * rows are the two partial products and their total.
 */
export const rowsOf = (skill) => BY_SKILL.get(skill)?.rows ?? [widthOf(skill)];

/** Whether a skill is worked as a stack of partial products rather than a single answer. */
export const isMultiRow = (skill) => rowsOf(skill).length > 1;

/** How many digits the number being multiplied has — what `shapeOfMul` classifies against. */
export const digitsOf = (skill) => BY_SKILL.get(skill)?.digits ?? 0;

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
  return { ...made, skill, shape: actualShape(def, made, wanted), column: def.column };
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
  if (made.op === '\u00d7') return shapeOfMul(made.a, made.b);
  if (made.op === '-') return shapeOfSub(made.a, made.b);
  return shapeOfAdd(made.a, made.b, def.width - 1);
}
