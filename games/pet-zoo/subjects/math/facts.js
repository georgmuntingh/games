// Number facts: the things a child should end up simply *knowing*, rather than working out.
//
// An addition fact is an unordered pair. `3 + 5` and `5 + 3` are the same thing to know, so
// they are one item shown either way round — drilling both would double the deck to teach
// nothing, and a child who has to be told twice that order does not matter has been taught
// the wrong lesson. The canonical form is a <= b, and the id is built from that.
//
// A subtraction fact is *not* symmetric, so it is stored as written. But it is not
// independent either: 15 − 8 is the flip side of 7 + 8, and this module says so out loud
// (see `partnerOf`) so a correction can point at the fact the child already knows instead of
// teaching subtraction as a separate skill that happens to use the same numbers.
//
// The tiers are strategies, not sizes. A child does not get better at 8 + 7 by meeting bigger
// numbers; they get better at it by knowing 8 + 2 = 10 first. So the ladder runs counting on,
// then the small sums, then the facts that are simply recalled (doubles, and adding ten), and
// only then the ones that need those facts to lean on — and the subtraction ladder above it
// mirrors that shape rung for rung.
//
// Pure, and — like the clock subject beside it — free of pets.js: which creature a fact
// hatches is a question about the zoo, not about the curriculum.

export const MAX_ADDEND = 10;

// The largest number a subtraction fact may start from. Twenty rather than ten because the
// interesting subtractions are exactly the ones that undo the interesting additions, and
// those reach 10 + 10.
export const MAX_MINUEND = 20;

/* ------------------------------------------------------------------- adding */

// Prefixed, unlike the clock's bare "4:15": these ids were new when adding arrived, so there
// was no existing save whose keys a prefix would invalidate, and it keeps the id spaces
// obviously separate. Every save since uses them, so they are now fixed forever.
export const ADD_PREFIX = 'add:';

const ADD_SHAPE = /^add:(\d{1,2})\+(\d{1,2})$/;

const inAddRange = (n) => Number.isInteger(n) && n >= 0 && n <= MAX_ADDEND;

/** The canonical id for an addition fact, whichever way round it was handed over. */
export const addIdOf = ({ a, b }) => `add:${Math.min(a, b)}+${Math.max(a, b)}`;

export function parseAdd(itemId) {
  const match = ADD_SHAPE.exec(String(itemId ?? ''));
  if (!match) return null;
  return { op: '+', a: Number(match[1]), b: Number(match[2]) };
}

/**
 * True only for the canonical id of an addition fact this build teaches. Non-canonical
 * "add:5+3" is deliberately refused rather than normalised: it would otherwise be possible to
 * hold two pets for one fact, one under each spelling.
 */
export function ownsAdd(itemId) {
  const fact = parseAdd(itemId);
  if (!fact) return false;
  if (!inAddRange(fact.a) || !inAddRange(fact.b)) return false;
  return fact.a <= fact.b && itemId === addIdOf(fact);
}

/**
 * Which rung of the ladder an addition fact belongs to. First match wins, so every fact lands
 * on exactly one tier and the tiers partition the deck — `tierMastery` divides by the size of
 * a tier, and a fact counted twice would make a tier impossible to finish.
 */
export function addTierOf({ a, b }) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const sum = lo + hi;
  if (sum <= 10) return lo <= 1 ? 0 : 1; // counting on, then the rest of the small sums
  if (lo === hi) return 2; // doubles past ten, which are recalled rather than worked out
  if (hi === MAX_ADDEND) return 3; // adding ten, where the answer is written in the question
  return 4; // and everything that has to bridge ten
}

// Every unordered pair up to ten and ten — sixty-six facts, in teaching order: easiest sum
// first, and within a sum the one with the smaller gap between the addends.
const ADD_FACTS = [];
for (let a = 0; a <= MAX_ADDEND; a += 1) {
  for (let b = a; b <= MAX_ADDEND; b += 1) {
    ADD_FACTS.push({ op: '+', a, b, id: addIdOf({ a, b }), tier: addTierOf({ a, b }) });
  }
}
ADD_FACTS.sort((x, y) => x.a + x.b - (y.a + y.b) || x.a - y.a);

/* --------------------------------------------------------------- taking away */

export const SUB_PREFIX = 'sub:';

const SUB_SHAPE = /^sub:(\d{1,2})-(\d{1,2})$/;

/** The id of a subtraction fact. Written as it is read: minuend, then what is taken away. */
export const subIdOf = ({ a, b }) => `sub:${a}-${b}`;

export function parseSub(itemId) {
  const match = SUB_SHAPE.exec(String(itemId ?? ''));
  if (!match) return null;
  return { op: '-', a: Number(match[1]), b: Number(match[2]) };
}

/**
 * The subtractions this game teaches: nothing negative, nothing past twenty, and — the real
 * restriction — nothing whose answer is bigger than ten. `20 − 3` is arithmetic a child can
 * do, but it is not a *fact*: there is no addition partner inside the deck to recall it from,
 * so it belongs to the column work further up the ladder rather than here.
 */
const inSubRange = ({ a, b }) =>
  Number.isInteger(a) &&
  Number.isInteger(b) &&
  a >= 0 &&
  a <= MAX_MINUEND &&
  b >= 0 &&
  b <= a &&
  a - b <= MAX_ADDEND &&
  b <= MAX_ADDEND;

export function ownsSub(itemId) {
  const fact = parseSub(itemId);
  if (!fact) return false;
  if (!inSubRange(fact)) return false;
  // Refused rather than normalised, for the same reason "add:5+3" is: one question, one pet.
  return itemId === subIdOf(fact);
}

/**
 * The addition fact a subtraction is the flip side of. This is the whole of the fact-family
 * idea in one function: the correction for `15 − 8` can say "you know 7 + 8 = 15", which is a
 * sentence about something the child has already mastered rather than a new rule to hold.
 */
export const partnerOf = ({ a, b }) => ({ op: '+', a: Math.min(b, a - b), b: Math.max(b, a - b) });

/**
 * Which rung a subtraction belongs to. Mirrors the addition ladder deliberately — each rung
 * undoes an addition rung below it — and, like it, the first match wins so the tiers
 * partition the deck.
 */
export function subTierOf({ a, b }) {
  const rest = a - b;
  if (b <= 1) return 5; // taking away nothing, and taking away one: counting back
  if (a <= 10) return 6; // differences that never leave the first ten-frame
  if (rest === 10) return 7; // landing exactly on the ten — what bridging back is built on
  if (b === rest) return 8; // halving a double: 16 − 8, the flip side of tier 2
  if (b === MAX_ADDEND) return 9; // taking ten away, where the answer is in the question
  return 10; // and everything that has to bridge back under the ten
}

const SUB_FACTS = [];
for (let a = 0; a <= MAX_MINUEND; a += 1) {
  for (let b = 0; b <= a; b += 1) {
    if (!inSubRange({ a, b })) continue;
    SUB_FACTS.push({ op: '-', a, b, id: subIdOf({ a, b }), tier: subTierOf({ a, b }) });
  }
}
// Easiest first, and within a minuend the one that takes away least.
SUB_FACTS.sort((x, y) => x.a - y.a || x.b - y.b);

/* ------------------------------------------------------------- the whole deck */

export const ALL_FACTS = [...ADD_FACTS, ...SUB_FACTS];

// The last rung of the ladder that is made of facts. Above it the curriculum stops being a
// list of things to know and becomes a method to carry out, which is a different kind of item
// entirely — see skills.js.
export const LAST_FACT_TIER = 10;

export const factTierItems = (tierId) => ALL_FACTS.filter((fact) => fact.tier === tierId);

export const owns = (itemId) => ownsAdd(itemId) || ownsSub(itemId);

export const parse = (itemId) => parseAdd(itemId) ?? parseSub(itemId);

export const idOf = ({ op, a, b }) => (op === '-' ? subIdOf({ a, b }) : addIdOf({ a, b }));

const FACT_BY_ID = new Map(ALL_FACTS.map((fact) => [fact.id, fact]));

export const factById = (itemId) => FACT_BY_ID.get(itemId) ?? null;

export const tierOf = (fact) => FACT_BY_ID.get(idOf(fact))?.tier ?? 0;

/** Whether a stored or imported record really describes a fact this game teaches. */
export function valid(itemId, item) {
  const fact = FACT_BY_ID.get(itemId);
  if (!fact) return false;
  const { a, b, op } = item ?? {};
  // `op` post-dates the addition deck, so a save written before subtraction existed simply
  // has no operator and is taken to mean the plus it could only have been.
  if (op !== undefined && op !== fact.op) return false;
  return a === fact.a && b === fact.b;
}

/** What one fact comes to. */
export const answerOf = ({ op, a, b }) => (op === '-' ? a - b : a + b);

/* ------------------------------------------------------------------ grading */

const digitsOf = (n) => String(n).split('').reverse().join('');

/**
 * What went wrong, so the correction can name it. The verdicts past `offByOne` are the
 * mistakes worth having a sentence for — each one is a different wrong idea, and telling a
 * child who subtracted the same thing as a child who miscounted by one teaches neither.
 */
export function grade(fact, answer) {
  const { op = '+', a, b } = fact;
  const target = answerOf({ op, a, b });
  // Checked before coercing, because Number(null) and Number('') are both 0 — and a child
  // who has not answered yet must never be told they said zero.
  const blank = answer === null || answer === undefined || answer === '';
  const value = blank ? NaN : Number(answer);
  if (!Number.isInteger(value) || value < 0) {
    return { verdict: 'blank', correct: false, nearMiss: false, delta: 0 };
  }
  let verdict;
  if (value === target) verdict = 'correct';
  else if (Math.abs(value - target) === 1) verdict = 'offByOne';
  else if (target >= 10 && String(value) === digitsOf(target)) verdict = 'transposed';
  else if (op === '-') verdict = subVerdict({ a, b }, value);
  else verdict = addVerdict({ a, b }, value);
  return {
    verdict,
    correct: verdict === 'correct',
    // Off by one is a miscount, not a misunderstanding, and a swapped pair of digits means
    // the child had the answer and lost it on the way to the page. Both deserve the softer
    // opening the clock gives a near miss.
    nearMiss: verdict === 'offByOne' || verdict === 'transposed',
    delta: value - target,
  };
}

function addVerdict({ a, b }, value) {
  if (value === a || value === b) return 'gaveAddend';
  if (value === Math.abs(a - b)) return 'gaveDifference';
  return 'wrong';
}

function subVerdict({ a, b }, value) {
  // The commonest wrong idea by a distance: the operator was read as a plus.
  if (value === a + b) return 'gaveSum';
  // The second commonest: the pair was turned round to keep it inside what they know.
  if (value === b - a || value === Math.abs(b - a)) return 'reversed';
  if (value === a || value === b) return 'gaveOperand';
  // Counting back but landing one place out because the start of the count was counted.
  if (value === a - b + 1 || value === a - b - 1) return 'offByOne';
  return 'wrong';
}
