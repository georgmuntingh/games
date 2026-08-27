// The times tables: the third kind of thing this subject teaches, and the last.
//
// A product is a fact in exactly the sense facts.js means it — something to end up simply
// *knowing* — so it is stated the same way: one unordered pair, one item, one egg, one pet.
// `3 × 7` and `7 × 3` are the same thing to know, so they are one item shown either way
// round. That is not a saving, it is the lesson: a child who has to be told twice that order
// does not matter has been taught the wrong thing.
//
// Above the products sits the same deck asked backwards — `7 × __ = 56`. That one is *not*
// symmetric. Being given the seven and hunting for the eight is a different piece of
// knowing from being given the eight and hunting for the seven, so both exist, and
// `partnerOf` says out loud which product each of them leans on.
//
// The tiers are strategies, not sizes, for the reason facts.js gives: a child does not get
// better at 7 × 8 by meeting bigger numbers, they get better at it by knowing 7 × 5 first.
// So the ladder runs the two rules (×1 and ×10), then the doubles they already have from
// adding, then the fives, then the squares, then the threes and fours — and only then the
// six facts that are left, which are the ones every child actually finds hard.
//
// Pure, like facts.js and skills.js beside it, and free of pets.js: which creature an item
// hatches is a question about the zoo, not about the curriculum.

export const MAX_FACTOR = 10;

// Prefixed and ASCII, like `add:` and `sub:`. The `×` a child sees is a rendering decision;
// an id is a storage key, and these are fixed forever the moment a save contains one.
export const TIMES_PREFIX = 'mul:';
export const GAP_PREFIX = 'mis:';

// Where the times material starts on the maths ladder. Appended above the column work rather
// than inserted anywhere — `pets.js` hands out species and trait indices by *position* in
// `math.ALL_ITEMS`, so an item that moved would come back a different colour with a
// different name.
export const FIRST_TIMES_TIER = 19;
export const FIRST_GAP_TIER = 25;
export const LAST_TIMES_TIER = 30;

/** How far up the ladder the gap deck sits above the product deck it mirrors. */
const GAP_OFFSET = FIRST_GAP_TIER - FIRST_TIMES_TIER;

const inFactorRange = (n) => Number.isInteger(n) && n >= 1 && n <= MAX_FACTOR;

/* ------------------------------------------------------------------ products */

const TIMES_SHAPE = /^mul:(\d{1,2})x(\d{1,2})$/;

/** The canonical id for a product, whichever way round the pair was handed over. */
export const timesIdOf = ({ a, b }) => `mul:${Math.min(a, b)}x${Math.max(a, b)}`;

export function parseTimes(itemId) {
  const match = TIMES_SHAPE.exec(String(itemId ?? ''));
  if (!match) return null;
  return { op: '×', a: Number(match[1]), b: Number(match[2]) };
}

/**
 * True only for the canonical id of a product this build teaches. Non-canonical `mul:7x3` is
 * refused rather than normalised, exactly as `ownsAdd` refuses `add:5+3`: it would otherwise
 * be possible to hold two pets for one fact, one under each spelling.
 */
export function ownsTimes(itemId) {
  const fact = parseTimes(itemId);
  if (!fact) return false;
  if (!inFactorRange(fact.a) || !inFactorRange(fact.b)) return false;
  return fact.a <= fact.b && itemId === timesIdOf(fact);
}

/**
 * Which rung a product belongs to. First match wins, so every pair lands on exactly one tier
 * and the tiers partition the deck — `tierMastery` divides by the size of a tier, and a fact
 * counted twice would make a tier impossible to finish.
 */
export function timesTierOf({ a, b }) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  if (lo === 1 || hi === MAX_FACTOR) return 19; // the two rules: nothing changes, or a zero on the end
  if (lo === 2) return 20; // doubling, which they already have from adding
  if (lo === 5 || hi === 5) return 21; // half of ten
  if (lo === hi) return 22; // the squares, which are recalled rather than worked out
  if (lo === 3 || lo === 4) return 23;
  return 24; // and the six that are left, which are the six every child finds hard
}

// Every unordered pair from one to ten — fifty-five products, in teaching order: smallest
// product first, and within a product the one with the smaller gap between the factors.
const TIMES_FACTS = [];
for (let a = 1; a <= MAX_FACTOR; a += 1) {
  for (let b = a; b <= MAX_FACTOR; b += 1) {
    TIMES_FACTS.push({
      op: '×',
      a,
      b,
      id: timesIdOf({ a, b }),
      tier: timesTierOf({ a, b }),
    });
  }
}
TIMES_FACTS.sort((x, y) => x.a * x.b - y.a * y.b || x.a - y.a);

/* -------------------------------------------------------------- missing factor */

// `mis:7x56` is "7 × __ = 56". The factor that is *shown* and the product, because those are
// the two numbers on screen; what the child has to supply is the third and is derived, which
// is also why an id whose product does not divide by its factor describes nothing and is
// refused.
const GAP_SHAPE = /^mis:(\d{1,2})x(\d{1,3})$/;

/** The id of a missing-factor question. `a` is the factor shown, `b` the one being hunted. */
export const gapIdOf = ({ a, b }) => `mis:${a}x${a * b}`;

export function parseGap(itemId) {
  const match = GAP_SHAPE.exec(String(itemId ?? ''));
  if (!match) return null;
  const a = Number(match[1]);
  const product = Number(match[2]);
  if (!inFactorRange(a) || product % a !== 0) return null;
  return { op: '×', a, b: product / a, gap: true };
}

export function ownsGap(itemId) {
  const fact = parseGap(itemId);
  if (!fact) return false;
  if (!inFactorRange(fact.a) || !inFactorRange(fact.b)) return false;
  // Refused rather than normalised, for the same reason `mul:7x3` is: one question, one pet.
  return itemId === gapIdOf(fact);
}

/**
 * The product a missing-factor question is the flip side of. This is the whole of the
 * fact-family idea again: the correction for `7 × __ = 56` can say "you know 7 × 8 = 56",
 * which is a sentence about something already mastered rather than a new rule to hold.
 */
export const partnerOf = ({ a, b }) => ({ op: '×', a: Math.min(a, b), b: Math.max(a, b) });

/** A missing factor sits six rungs above the product it is the flip side of. */
export const gapTierOf = ({ a, b }) => timesTierOf({ a, b }) + GAP_OFFSET;

// Both directions of every pair — a hundred of them, since a square pair has only one
// direction to be asked in. `7 × __ = 56` and `8 × __ = 56` are genuinely different things
// to know, and each gets its own egg.
const GAP_FACTS = [];
for (const fact of TIMES_FACTS) {
  const shown = fact.a === fact.b ? [fact.a] : [fact.a, fact.b];
  for (const a of shown) {
    const b = (fact.a * fact.b) / a;
    GAP_FACTS.push({ op: '×', a, b, gap: true, id: gapIdOf({ a, b }), tier: gapTierOf({ a, b }) });
  }
}

/* ------------------------------------------------------------- the whole deck */

export const ALL_TIMES = [...TIMES_FACTS, ...GAP_FACTS];

export const timesTierItems = (tierId) => ALL_TIMES.filter((fact) => fact.tier === tierId);

export const isGap = (payload) => Boolean(payload?.gap);

export const owns = (itemId) => ownsTimes(itemId) || ownsGap(itemId);

export const parse = (itemId) => parseTimes(itemId) ?? parseGap(itemId);

export const idOf = (payload) => (isGap(payload) ? gapIdOf(payload) : timesIdOf(payload));

export const tierOf = (payload) => (isGap(payload) ? gapTierOf(payload) : timesTierOf(payload));

const BY_ID = new Map(ALL_TIMES.map((fact) => [fact.id, fact]));

export const factById = (itemId) => BY_ID.get(itemId) ?? null;

/** Whether a stored or imported record really describes something this build teaches. */
export function valid(itemId, item) {
  const fact = BY_ID.get(itemId);
  if (!fact) return false;
  const { a, b, op, gap } = item ?? {};
  if (op !== undefined && op !== '×') return false;
  if (Boolean(gap) !== Boolean(fact.gap)) return false;
  return a === fact.a && b === fact.b;
}

/** What one question comes to: the product, or — asked backwards — the factor being hunted. */
export const answerOf = ({ a, b, gap }) => (gap ? b : a * b);

/* -------------------------------------------------------------------- widths */

// Constant per deck, and never a function of the question on screen — the same rule the
// addition strip has always followed. Sizing the boxes to the answer would hand it over,
// because two boxes instead of three would mean "smaller than a hundred".
export const TIMES_ANSWER_WIDTH = 3; // products reach 10 × 10
export const GAP_ANSWER_WIDTH = 2; // a factor never leaves one and ten

export const widthOf = (payload) => (isGap(payload) ? GAP_ANSWER_WIDTH : TIMES_ANSWER_WIDTH);

/* ------------------------------------------------------------------ grading */

const digitsOf = (n) => String(n).split('').reverse().join('');

/**
 * Every verdict a product can come back with. Named separately from the addition ones even
 * where the mistake rhymes, because the *sentence* differs: "that is them put together" is
 * the right thing to say to a child who added instead of subtracting and the wrong thing to
 * say to one who added instead of multiplying.
 */
export const MUL_VERDICTS = [
  'correct',
  'blank',
  'offByOne',
  'transposed',
  'mulGaveSum',
  'mulGaveFactor',
  'mulOffByOneRow',
  'mulNeighbour',
  'wrong',
];

export const GAP_VERDICTS = [
  'correct',
  'blank',
  'offByOne',
  'gapGaveProduct',
  'gapGaveFactor',
  'gapTookAway',
  'wrong',
];

export const ALL_TIMES_VERDICTS = [...new Set([...MUL_VERDICTS, ...GAP_VERDICTS])];

/**
 * What went wrong, so the correction can name it. `question` is a product or a missing-factor
 * question; `answer` is what the strip says, as a string of digits.
 */
export function grade(question, answer) {
  const { a, b, gap = false } = question ?? {};
  const target = answerOf({ a, b, gap });
  // Checked before coercing, because Number(null) and Number('') are both 0 — and a child who
  // has not answered yet must never be told they said zero.
  const blank = answer === null || answer === undefined || answer === '';
  const value = blank ? NaN : Number(answer);
  if (!Number.isInteger(value) || value < 0) {
    return { verdict: 'blank', correct: false, nearMiss: false, delta: 0 };
  }
  let verdict;
  if (value === target) {
    verdict = 'correct';
  } else if (gap) {
    // Asked before the plain miscount, because the numbers on screen sit *next to* the answer
    // more often than not — in `7 × __ = 56` the seven a child copied down is also one away
    // from the eight — and "that is the number you were given already" is much the more useful
    // of the two things to say to them.
    verdict = gapVerdict({ a, b }, value) ?? (Math.abs(value - target) === 1 ? 'offByOne' : 'wrong');
  } else if (Math.abs(value - target) === 1) {
    verdict = 'offByOne';
  } else if (target >= 10 && String(value) === digitsOf(target)) {
    verdict = 'transposed';
  } else {
    verdict = mulVerdict({ a, b }, value);
  }
  return {
    verdict,
    correct: verdict === 'correct',
    nearMiss: isNearMiss(verdict, value, target),
    delta: value - target,
  };
}

/**
 * Whether the game may open with "so close".
 *
 * A slip of one is a miscount and a swapped pair of digits is an answer lost on the way to the
 * page, so both are softened however big the numbers are. A row too many is *usually* a
 * miscount too — but only where there were enough rows to lose count of. One row out of seven
 * is nearly right; one row out of two is not nearly anything, and saying so about `1 × 3 = 6`
 * would be the game being kind about a fact the child simply does not have yet. Hence the
 * quarter: a row counts as a slip when the answer still got three quarters of the way there.
 */
function isNearMiss(verdict, value, target) {
  if (verdict === 'offByOne' || verdict === 'transposed') return true;
  if (verdict !== 'mulOffByOneRow') return false;
  return Math.abs(value - target) * 4 <= target;
}

function mulVerdict({ a, b }, value) {
  const target = a * b;
  // The commonest wrong idea by a distance: the sign was read as a plus.
  if (value === a + b) return 'mulGaveSum';
  if (value === a || value === b) return 'mulGaveFactor';
  // One row too few or too many — the child skip-counted and lost their place, which is a
  // miscount of a picture they had right.
  if ([target - a, target + a, target - b, target + b].includes(value)) return 'mulOffByOneRow';
  // Somebody else's answer out of one of the two tables: a real seven, just not eight of them.
  if (inTable(value, a) || inTable(value, b)) return 'mulNeighbour';
  return 'wrong';
}

/** The named mistakes only — null for anything this has no diagnosis for, so the caller can
 *  fall through to a plain miscount and then to "wrong". */
function gapVerdict({ a, b }, value) {
  const product = a * b;
  // Writing the product back is not a slip, it is the whole question misread: the number on
  // the right is where you are going, not what you are looking for.
  if (value === product) return 'gapGaveProduct';
  if (value === a) return 'gapGaveFactor';
  // Taking the factor off the product instead of asking how many of it fit inside.
  if (value === product - a) return 'gapTookAway';
  return null;
}

/** Whether a number is somebody's answer in the n times table this game teaches. */
const inTable = (value, n) => n > 0 && value % n === 0 && value / n >= 1 && value / n <= MAX_FACTOR;
