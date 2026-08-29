// Division facts: the fourth kind of thing this subject teaches, and the first half of division.
//
// `56 : 8` is a fact in exactly the sense facts.js means it — something to end up simply
// *knowing* — so it is stated the same way: one question, one item, one egg, one pet.
//
// Unlike a product, it is not symmetric. `56 : 8` and `56 : 7` are two different things to
// know: one asks how many eights fit inside fifty-six and the other how many sevens, and a
// child who has one does not thereby have the other. So both exist, and each carries its own
// egg — the same decision times.js makes about its missing-factor deck, for the same reason.
//
// The tiers are strategies rather than sizes, and they are not restated here: a division leans
// on the product it is the flip side of, so `divTierOf` simply asks `times.timesTierOf` where
// the pair sits and shifts the answer up the ladder. Both directions of a pair therefore land
// on the same rung, which is the point — they are the same picture read two ways.
//
// Pure, like facts.js and times.js beside it, and free of pets.js: which creature an item
// hatches is a question about the zoo, not about the curriculum.

import { MAX_FACTOR, timesTierOf } from './times.js';

// Prefixed and ASCII, like `add:`, `sub:` and `mul:`. The `÷` (or `:`) a child sees is a
// rendering decision made per language in main.js; an id is a storage key, and these are fixed
// forever the moment a save contains one.
export const DIV_PREFIX = 'div:';

// Where the division material starts. Appended above the column multiplication rather than
// inserted anywhere — `pets.js` hands out species and trait indices by *position* in
// `math.ALL_ITEMS`, so an item that moved would come back a different colour with a
// different name.
export const FIRST_DIV_TIER = 37;
export const LAST_DIV_TIER = 42;

/** How far above the product deck the division deck sits. */
const DIV_OFFSET = FIRST_DIV_TIER - 19;

const DIV_SHAPE = /^div:(\d{1,3})\/(\d{1,2})$/;

const inRange = (n) => Number.isInteger(n) && n >= 1 && n <= MAX_FACTOR;

/** `div:56/8` — the dividend and the divisor, because those are the two numbers on screen.
 *  What the child supplies is the third and is derived. */
export const idOf = ({ a, b }) => `div:${a}/${b}`;

export function parse(itemId) {
  const match = DIV_SHAPE.exec(String(itemId ?? ''));
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  // An id whose divisor does not go into its dividend describes nothing, so it is refused
  // rather than rounded off into the nearest question that does exist.
  if (!inRange(b) || a % b !== 0) return null;
  return { op: '÷', a, b };
}

/**
 * True only for a division this build teaches: both the divisor and the quotient inside the
 * tables, and the id spelled the one canonical way. Refused rather than normalised, exactly as
 * `ownsTimes` refuses `mul:7x3` — it would otherwise be possible to hold two pets for one fact.
 */
export function owns(itemId) {
  const fact = parse(itemId);
  if (!fact) return false;
  if (!inRange(fact.b) || !inRange(fact.a / fact.b)) return false;
  return itemId === idOf(fact);
}

/**
 * The product a division is the flip side of. The whole of the fact-family idea again: the
 * correction for `56 : 8` can say "you know 7 × 8 = 56", which is a sentence about something
 * already mastered rather than a new rule to hold.
 */
export const partnerOf = ({ a, b }) => ({ op: '×', a: Math.min(b, a / b), b: Math.max(b, a / b) });

/** Which rung a division belongs to — wherever its product sits, six-and-a-bit groups higher. */
export const tierOf = ({ a, b }) => timesTierOf({ a: b, b: a / b }) + DIV_OFFSET;

// Both directions of every pair — a hundred of them, since a square pair has only one direction
// to be asked in. Ordered by dividend, and within a dividend by divisor, so the deck is
// introduced smallest-first exactly as the times tables are.
const DIV_FACTS = [];
for (let x = 1; x <= MAX_FACTOR; x += 1) {
  for (let y = x; y <= MAX_FACTOR; y += 1) {
    const product = x * y;
    const divisors = x === y ? [x] : [x, y];
    for (const b of divisors) {
      DIV_FACTS.push({ op: '÷', a: product, b, id: idOf({ a: product, b }), tier: tierOf({ a: product, b }) });
    }
  }
}
DIV_FACTS.sort((p, q) => p.a - q.a || p.b - q.b);

export const ALL_DIV_FACTS = DIV_FACTS;

export const divTierItems = (tierId) => DIV_FACTS.filter((fact) => fact.tier === tierId);

const BY_ID = new Map(DIV_FACTS.map((fact) => [fact.id, fact]));

export const factById = (itemId) => BY_ID.get(itemId) ?? null;

/** Whether a stored or imported record really describes something this build teaches. */
export function valid(itemId, item) {
  const fact = BY_ID.get(itemId);
  if (!fact) return false;
  const { a, b, op } = item ?? {};
  if (op !== undefined && op !== '÷') return false;
  return a === fact.a && b === fact.b;
}

/** What one question comes to. */
export const answerOf = ({ a, b }) => a / b;

// Constant per deck, and never a function of the question on screen — the same rule the
// addition strip has always followed. A quotient never leaves one and ten, so two boxes, and
// two rather than one because the deck contains ten itself.
export const DIV_ANSWER_WIDTH = 2;

export const widthOf = () => DIV_ANSWER_WIDTH;

/* ------------------------------------------------------------------ grading */

/**
 * Every verdict a division fact can come back with. Named separately from the multiplication
 * ones even where the mistake rhymes, because the *sentence* differs: "that is them
 * multiplied" is the right thing to say to a child who has read a division sign as a times and
 * the wrong thing to say to anybody else.
 */
export const DIV_FACT_VERDICTS = [
  'correct',
  'blank',
  'offByOne',
  'divGaveDividend',
  'divGaveDivisor',
  'divTookAway',
  'divMultiplied',
  'divNeighbour',
  'wrong',
];

/**
 * What went wrong, so the correction can name it. `question` is a division fact and `answer` is
 * what the strip says, as a string of digits.
 */
export function grade(question, answer) {
  const { a, b } = question ?? {};
  const target = answerOf({ a, b });
  // Checked before coercing, because Number(null) and Number('') are both 0 — and a child who
  // has not answered yet must never be told they said zero.
  const blank = answer === null || answer === undefined || answer === '';
  const value = blank ? NaN : Number(answer);
  if (!Number.isInteger(value) || value < 0) {
    return { verdict: 'blank', correct: false, nearMiss: false, delta: 0 };
  }
  const verdict = value === target ? 'correct' : wrongWay({ a, b }, value, target);
  return {
    verdict,
    correct: verdict === 'correct',
    // A quotient one out is one group too many or too few, which is a miscount of a picture the
    // child had right. Every other verdict here is the question itself misread.
    nearMiss: verdict === 'offByOne',
    delta: value - target,
  };
}

function wrongWay({ a, b }, value, target) {
  // Asked before the plain miscount, because both numbers on screen sit near the answer often
  // enough — in `9 : 9` the nine a child copied down is also one away from the one — and "that
  // is a number you were given already" is much the more useful of the two things to say.
  if (value === a) return 'divGaveDividend';
  if (value === b) return 'divGaveDivisor';
  // Taking the divisor off the dividend instead of asking how many of it fit inside. The
  // commonest wrong idea in the deck by a distance.
  if (value === a - b) return 'divTookAway';
  if (value === a * b) return 'divMultiplied';
  if (Math.abs(value - target) === 1) return 'offByOne';
  // Somebody else's answer out of the same table: a real quotient, just not this one.
  if (value >= 1 && value <= MAX_FACTOR) return 'divNeighbour';
  return 'wrong';
}
