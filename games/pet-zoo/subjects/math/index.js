// Maths — "Matte" — the second thing this zoo teaches, stated in the shape every subject
// states itself in.
//
// One subject, thirty-one rungs, and three quite different kinds of item behind one interface:
//
//   tiers 0–10   facts.js    things to *know*: sixty-six sums and a hundred and twenty-one
//                            differences, each one its own question, its own egg, its own pet.
//   tiers 11–18  skills.js   things to *do*: seventeen methods whose numbers are made up fresh
//                            every time they are asked, and which are only counted as learned
//                            once every case inside them has been covered.
//   tiers 19–30  times.js    things to know again: fifty-five products and the hundred
//                            questions that are those products asked backwards.
//
// The scheduler, the store and the answer loop never learn which is which. They ask this
// module — `owns`, `parse`, `idOf`, `tierOf`, `tierItems`, `valid`, `grade` — and it dispatches.
//
// Deliberately free of pets.js: which creature an item hatches is a question about the zoo,
// not about the curriculum, and importing it here would close a cycle
// (srs → subjects → pets → srs). main.js keeps deciding species, exactly as it does today.

import * as facts from './facts.js';
import * as skills from './skills.js';
import * as times from './times.js';

export const id = 'math';

// A fossil, and knowingly kept. This subject used to be called `add`, and its item ids still
// begin `add:` because a pet's species, name, colours and habitat are all derived by hashing
// the id it is filed under (see pets.js). Rewriting the keys would rename and recolour every
// addition pet a child already owns — which is exactly the reason clock.js gives for keeping
// its own ids bare. The subject's *name* is free to change; the keys of somebody's zoo are not.
export const prefix = 'add:';

export { facts, skills, times };

/* --------------------------------------------------------------------- the ladder */

// The rungs, and the headings the grown-ups' panel groups them under. One subject, one switch
// and one skip-floor: a group is a way of reading nineteen bars, not a thing that can be
// turned off.
//
// Worth knowing before adding a rung: `unlockedTier` opens a tier at 80% mastery of the one
// below, and a tier of two items has no 80% — one of two is 50%, so both must graduate. For a
// skill that is the right bar anyway (there is no long tail of stragglers to forgive), but it
// does mean a single stuck skill blocks the ladder until a grown-up skips past it.
//
// And worth knowing before adding a *group*: append, never insert. `pets.js` hands out species
// and trait indices by position in `ALL_ITEMS`, which is this list flattened, so a group that
// moved would rename and recolour every pet below it in a zoo somebody already has.
export const GROUPS = [
  { id: 'plus', tiers: [0, 1, 2, 3, 4] },
  { id: 'minus', tiers: [5, 6, 7, 8, 9, 10] },
  { id: 'tens', tiers: [11, 12] },
  { id: 'column', tiers: [13, 14, 15, 16, 17, 18] },
  { id: 'times', tiers: [19, 20, 21, 22, 23, 24] },
  { id: 'gap', tiers: [25, 26, 27, 28, 29, 30] },
];

export const TIERS = GROUPS.flatMap((group) => group.tiers.map((tier) => ({ id: tier, group: group.id })));

export const LAST_TIER = TIERS[TIERS.length - 1].id;

export const groupOfTier = (tierId) => GROUPS.find((group) => group.tiers.includes(tierId))?.id ?? 'plus';

/** Every item on one rung, in teaching order. Facts, then skills, then the times tables. */
export const tierItems = (tierId) => {
  if (tierId <= facts.LAST_FACT_TIER) return facts.factTierItems(tierId);
  if (tierId < times.FIRST_TIMES_TIER) return skills.skillTierItems(tierId);
  return times.timesTierItems(tierId);
};

// Facts first, in exactly the order they have always been in, then the skills. The order
// matters beyond tidiness: pets.js hands out trait indices by position in this list, so a pet
// that moved would change its name and its colours. Appending is safe; inserting is not.
export const ALL_ITEMS = TIERS.flatMap((tier) => tierItems(tier.id));

/* ------------------------------------------------------------------- identifying */

export const isSkill = (payload) => Boolean(payload?.skill);

/** A product or a missing factor — the two halves of the times deck, both written with a `×`. */
export const isTimes = (payload) => payload?.op === '×';

export const owns = (itemId) => facts.owns(itemId) || skills.owns(itemId) || times.owns(itemId);

export const parse = (itemId) => facts.parse(itemId) ?? skills.parse(itemId) ?? times.parse(itemId);

export const idOf = (payload) =>
  isSkill(payload) ? skills.idOf(payload) : isTimes(payload) ? times.idOf(payload) : facts.idOf(payload);

export const tierOf = (payload) =>
  isSkill(payload)
    ? skills.tierOf(payload)
    : isTimes(payload)
      ? times.tierOf(payload)
      : facts.tierOf(payload);

/** Whether a stored or imported record really describes something this game teaches. */
export const valid = (itemId, item) => {
  if (skills.owns(itemId)) return skills.valid(itemId, item);
  if (times.owns(itemId)) return times.valid(itemId, item);
  return facts.valid(itemId, item);
};

/* --------------------------------------------------------------- asking a question */

/**
 * The seed a skill's numbers are drawn from. Everything in it is state the save already keeps,
 * so nothing new is persisted and a reload mid-question redraws the same numbers.
 *
 * Which fields are in here is the whole of the retry behaviour, and it is load-bearing. A
 * *wrong* answer resets `correctStreak` to zero and touches nothing else in this list, so the
 * seed is unchanged and the question comes back — two questions later, via RELEARN_DELAY —
 * with the same numbers the child just watched being explained. A *correct* answer moves the
 * streak (or, once graduated, `reps` and `feeds`), so the numbers change.
 */
export function seedOf(item) {
  const key = `${idOf(item)}|${item?.reps ?? 0}|${item?.feeds ?? 0}|${item?.correctStreak ?? 0}|${item?.lapses ?? 0}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Which case to ask about next. An uncovered one is always preferred, so coverage completes by
 * design rather than by luck; once everything is covered the skill is free practice and the
 * case is simply drawn.
 */
export function shapeFor(item) {
  const declared = skills.shapesOf(item?.skill);
  if (!declared.length) return null;
  const covered = Array.isArray(item?.covered) ? item.covered : [];
  const wanted = declared.filter((shape) => !covered.includes(shape));
  const pool = wanted.length ? wanted : declared;
  return pool[seedOf(item) % pool.length];
}

/**
 * The question to put on screen. A fact *is* its question, so it answers with itself; a skill
 * makes one up. Never stored — the item's identity is the skill, not the numbers.
 */
export function instanceOf(item) {
  if (isSkill(item)) return skills.generate(item.skill, { shape: shapeFor(item), seed: seedOf(item) });
  if (isTimes(item)) {
    const fact = times.factById(idOf(item));
    return fact ? { op: '×', a: fact.a, b: fact.b, gap: Boolean(fact.gap), column: false } : null;
  }
  const fact = facts.factById(idOf(item));
  return fact ? { op: fact.op, a: fact.a, b: fact.b, column: false } : null;
}

/**
 * How the question is drawn: inline like `7 + 8 =`, stacked in columns with a rule, or — for a
 * missing factor — inline with the answer strip standing *inside* the equation rather than
 * after it.
 */
export const layoutOf = (question) =>
  question?.column ? 'column' : question?.gap ? 'gap' : 'inline';

/* --------------------------------------------------------------------- answering */

// Two boxes for every fact, and never a function of the fact on screen — sizing the strip to
// the answer would hand it over, because one box would mean "under ten" and a child would read
// the boxes instead of adding. Two rather than one even in the first tier, because that tier
// already contains 0 + 10: "sums to ten" includes ten itself.
export const FACT_ANSWER_WIDTH = 2;

/**
 * How many boxes the answer is written into. A property of the *item*, never of the question
 * drawn from it: a skill whose band can reach three digits always shows three boxes, so a
 * two-digit answer sits in it with the leading box blank and gives nothing away.
 */
export const answerWidth = (payload) =>
  isSkill(payload)
    ? skills.widthOf(payload.skill)
    : isTimes(payload)
      ? times.widthOf(payload)
      : FACT_ANSWER_WIDTH;

/** Digits in the answer to one question — what `answerWidth` must never be allowed to fall below. */
export const answerDigits = (question) => {
  if (!question) return 0;
  const value = isTimes(question) ? times.answerOf(question) : facts.answerOf(question);
  return String(Math.abs(value)).length;
};

// Writing an answer, or hunting for it on a keypad, is honestly slower than swinging two clock
// hands. Without this the scheduler would read every correct sum as a hesitant one.
export const paceScale = 1.6;

/** And a column sum, worked one column at a time, is slower again. */
export const paceOf = (item) => {
  if (isSkill(item) && skills.isColumn(item.skill)) return 2.6;
  // A missing factor is hunted rather than recalled — a child runs up the table until they
  // find it, and that takes longer than saying a product they know. Without this the
  // scheduler would read every one of those answers as a hesitant one.
  if (isTimes(item) && times.isGap(item)) return 2.0;
  return paceScale;
};

/* ---------------------------------------------------------------------- pacing */

// A skill is not learned in four answers. It has several cases inside it and the child has to
// meet all of them, so it is given a longer run-up and a higher bar — and, above all, the
// coverage requirement, which is the part that actually guarantees the practice happened.
const SKILL_STEPS = [1, 3, 8, 15, 25];
export const SKILL_HATCH_STREAK = 6;

/**
 * How this item should be scheduled. Empty for a fact, which means "the defaults in srs.js" —
 * so the clock and every existing addition pet keep behaving exactly as they always have.
 */
export const pacing = (item) =>
  isSkill(item)
    ? { steps: SKILL_STEPS, hatchStreak: SKILL_HATCH_STREAK, requiredShapes: skills.shapesOf(item.skill) }
    : {};

/* ---------------------------------------------------------------------- grading */

export { grade } from './grade.js';
