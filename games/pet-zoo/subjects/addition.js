// Adding numbers: the second thing this zoo teaches.
//
// A fact is an unordered pair. `3 + 5` and `5 + 3` are the same thing to know, so they are
// one item shown either way round — drilling both would double the deck to teach nothing,
// and a child who has to be told twice that order does not matter has been taught the
// wrong lesson. The canonical form is a <= b, and the id is built from that.
//
// The tiers are strategies, not sizes. A child does not get better at 8 + 7 by meeting
// bigger numbers; they get better at it by knowing 8 + 2 = 10 first. So the ladder runs
// counting on, then the small sums, then the facts that are simply recalled (doubles, and
// adding ten), and only then the ones that need those facts to lean on.
//
// Pure, and — like the clock subject beside it — free of pets.js: which creature a fact
// hatches is a question about the zoo, not about the curriculum.

export const id = 'add';

// Prefixed, unlike the clock's bare "4:15": these ids are new, so there is no existing save
// whose keys a prefix would invalidate, and it keeps the two id spaces obviously separate.
export const prefix = 'add:';

export const MAX_ADDEND = 10;

const ID_SHAPE = /^add:(\d{1,2})\+(\d{1,2})$/;

const inRange = (n) => Number.isInteger(n) && n >= 0 && n <= MAX_ADDEND;

/** The canonical id for a fact, whichever way round it was handed over. */
export const idOf = ({ a, b }) => `add:${Math.min(a, b)}+${Math.max(a, b)}`;

export function parse(itemId) {
  const match = ID_SHAPE.exec(String(itemId ?? ''));
  if (!match) return null;
  return { a: Number(match[1]), b: Number(match[2]) };
}

/**
 * True only for the canonical id of a fact this build teaches. Non-canonical "add:5+3" is
 * deliberately refused rather than normalised: it would otherwise be possible to hold two
 * pets for one fact, one under each spelling.
 */
export function owns(itemId) {
  const fact = parse(itemId);
  if (!fact) return false;
  if (!inRange(fact.a) || !inRange(fact.b)) return false;
  return fact.a <= fact.b && itemId === idOf(fact);
}

/**
 * Which rung of the ladder a fact belongs to. First match wins, so every fact lands on
 * exactly one tier and the tiers partition the deck — `tierMastery` divides by the size of
 * a tier, and a fact counted twice would make a tier impossible to finish.
 */
export function tierOf({ a, b }) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const sum = lo + hi;
  if (sum <= 10) return lo <= 1 ? 0 : 1; // counting on, then the rest of the small sums
  if (lo === hi) return 2; // doubles past ten, which are recalled rather than worked out
  if (hi === MAX_ADDEND) return 3; // adding ten, where the answer is written in the question
  return 4; // and everything that has to bridge ten
}

export const TIERS = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

export const LAST_TIER = TIERS.length - 1;

// Every unordered pair up to ten and ten — sixty-six facts, in teaching order: easiest sum
// first, and within a sum the one with the smaller gap between the addends.
const FACTS = [];
for (let a = 0; a <= MAX_ADDEND; a += 1) {
  for (let b = a; b <= MAX_ADDEND; b += 1) {
    FACTS.push({ a, b, id: idOf({ a, b }), tier: tierOf({ a, b }) });
  }
}
FACTS.sort((x, y) => x.a + x.b - (y.a + y.b) || x.a - y.a);

export const tierItems = (tierId) => FACTS.filter((fact) => fact.tier === tierId);

export const ALL_ITEMS = TIERS.flatMap((tier) => tierItems(tier.id));

/** Whether a stored or imported record really describes a fact this game teaches. */
export function valid(itemId, item) {
  const fact = parse(itemId);
  if (!fact || !owns(itemId)) return false;
  const { a, b } = item ?? {};
  if (!inRange(a) || !inRange(b)) return false;
  return a === fact.a && b === fact.b;
}

/** Digits in the answer to one fact — 1 up to nine, 2 from ten. */
export const answerDigits = ({ a, b }) => (a + b >= 10 ? 2 : 1);

export const MAX_ANSWER_DIGITS = 2;

/**
 * How many boxes the answer is written into. Always two, and never a function of the fact on
 * screen — sizing the strip to the answer would hand it over, because one box would mean
 * "under ten" and a child would read the boxes instead of adding.
 *
 * Two rather than one even in the first tier, because the first tier already contains
 * 0 + 10: "sums to ten" includes ten itself. A one-box strip there would not merely leak,
 * it would make a fact impossible to answer. Writing in only the right-hand box is how a
 * single-digit answer is given.
 */
export const answerWidth = () => MAX_ANSWER_DIGITS;

// Writing an answer, or hunting for it on a keypad, is honestly slower than swinging two
// clock hands. Without this the scheduler would read every correct sum as a hesitant one.
export const paceScale = 1.6;

const digitsOf = (n) => String(n).split('').reverse().join('');

/**
 * What went wrong, so the correction can name it. The verdicts past `offByOne` are the
 * mistakes worth having a sentence for — each one is a different wrong idea, and telling a
 * child who subtracted the same thing as a child who miscounted by one teaches neither.
 */
export function grade({ a, b }, answer) {
  const sum = a + b;
  // Checked before coercing, because Number(null) and Number('') are both 0 — and a child
  // who has not answered yet must never be told they said zero.
  const blank = answer === null || answer === undefined || answer === '';
  const value = blank ? NaN : Number(answer);
  if (!Number.isInteger(value) || value < 0) {
    return { verdict: 'blank', correct: false, nearMiss: false, delta: 0 };
  }
  let verdict;
  if (value === sum) verdict = 'correct';
  else if (Math.abs(value - sum) === 1) verdict = 'offByOne';
  else if (sum >= 10 && String(value) === digitsOf(sum)) verdict = 'transposed';
  else if (value === a || value === b) verdict = 'gaveAddend';
  else if (value === Math.abs(a - b)) verdict = 'gaveDifference';
  else verdict = 'wrong';
  return {
    verdict,
    correct: verdict === 'correct',
    // Off by one is a miscount, not a misunderstanding, and a swapped pair of digits means
    // the child had the answer and lost it on the way to the page. Both deserve the softer
    // opening the clock gives a near miss.
    nearMiss: verdict === 'offByOne' || verdict === 'transposed',
    delta: value - sum,
  };
}
