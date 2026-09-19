// The clock subject, stated in the shape every subject states itself in.
//
// Nothing here is new: the tiers still live in curriculum.js and the grading still lives in
// clock.js. This file only re-describes them through one common interface, so that the
// scheduler, the store and the answer loop can hold a subject without knowing which one it
// is. Adding a second subject then costs a sibling of this file rather than a branch in
// every module that touches an item.
//
// Deliberately free of pets.js: which creature a time hatches is a question about the zoo,
// not about the curriculum, and importing it here would close a cycle
// (srs → subjects → pets → srs). main.js keeps deciding species, exactly as it does today.

import { grade, MINUTE_STEP, parseTimeId, readingOptions, timeId } from '../clock.js';
import { ALL_ITEMS, LAST_TIER, TIERS, tierItems, tierOfMinute } from '../curriculum.js';
import { hashSeed } from '../seed.js';

export const id = 'clock';

// Clock ids stay bare — "4:15", never "clock:4:15". Every save ever written uses them, and a
// prefix would mean rewriting the keys of somebody's whole zoo on load to buy nothing.
export const prefix = '';

// A time id and nothing else. Anchored, so "add:3+5" cannot slip through the hour group.
const ID_SHAPE = /^([1-9]|1[0-2]):[0-5][0-9]$/;

export const owns = (itemId) => typeof itemId === 'string' && ID_SHAPE.test(itemId);

export const parse = (itemId) => parseTimeId(itemId);

export const idOf = ({ h, m }) => timeId(h, m);

export const tierOf = ({ m }) => tierOfMinute(m) ?? 0;

// The clock is answered by dragging, not by writing, so it asks for no digits.
export const answerDigits = () => 0;

/**
 * Whether a stored or imported record really describes a time this game teaches. Checking the
 * payload against the id it is filed under is what stops a hand-edited file smuggling a pet
 * onto a time that does not exist.
 */
export function valid(itemId, item) {
  const { h, m } = item ?? {};
  if (!Number.isInteger(h) || h < 1 || h > 12) return false;
  if (!Number.isInteger(m) || m < 0 || m > 59 || m % MINUTE_STEP !== 0) return false;
  return itemId === timeId(h, m);
}

/* ------------------------------------------------------- the two ways of asking */

// Telling the time is two skills, not one, and this game used to teach only the second.
//
//   read — the face is shown, set to the time, and the child picks what it says out of four
//   set  — the time is said, and the child drags the hands to match
//
// One item still, one egg, one pet: 4:15 is 4:15 whichever way it is asked, and splitting it
// in two would have meant new ids, which is the one thing `prefix` above exists to say must
// never happen. They are *cases* of the item instead, which is machinery `srs.js` already has
// and already enforces — a time cannot hatch until the child has got it right both ways.
//
// Order matters: this is the list `shapeFor` walks, and reading comes first because
// recognition is the gentler half. A time the child has never seen is introduced by being
// shown, not by being demanded.
export const SHAPES = ['read', 'set'];

/**
 * How this item should be scheduled. Only the coverage requirement — the run-up and the bar
 * stay exactly what `srs.js` has always given the clock, because two cases is not the five a
 * maths skill has and does not need a longer road.
 *
 * Called two ways: `shapesFor` hands it a parsed `{ h, m }` and the answer loop hands it the
 * stored item. It wants neither, which is why it takes no argument.
 */
export const pacing = () => ({ requiredShapes: SHAPES });

/**
 * The seed this item's wrong answers are drawn from — same recipe as the maths deck's, and
 * for the same reason. Everything in it is state the save already keeps, so a reload
 * mid-question redraws the same four times, and a *wrong* answer (which resets the streak and
 * touches nothing else here) brings back the very question that was just explained.
 */
export const seedOf = (item) =>
  hashSeed(
    `${idOf(item)}|${item?.reps ?? 0}|${item?.feeds ?? 0}|${item?.correctStreak ?? 0}|${item?.lapses ?? 0}`
  );

/**
 * Which way to ask this time. An uncovered case first — so coverage completes by design
 * rather than by luck — and in the order declared above, which is what makes a brand-new
 * time's first meeting a reading question. Once both are covered the time is free practice
 * and the case is simply drawn.
 */
export function shapeFor(item) {
  const covered = Array.isArray(item?.covered) ? item.covered : [];
  const wanted = SHAPES.find((shape) => !covered.includes(shape));
  return wanted ?? SHAPES[seedOf(item) % SHAPES.length];
}

/** The four times to choose between, for an item being asked the reading way. */
export const optionsFor = (item) =>
  readingOptions(parse(idOf(item)), { tier: tierOf(item), seed: seedOf(item) });

// How much slower this subject's answers legitimately are, against the thresholds in
// `qualityOf`. Dragging two hands is the pace those numbers were tuned at, so: 1.
export const paceScale = 1;

// And tapping one of four is quicker than swinging two hands by some way. Without this the
// scheduler would read almost every reading answer as fluent recall, stretch the interval and
// quietly stop asking — which is the opposite of what a question answered in one tap deserves.
export const READ_PACE = 0.6;

export const paceOf = (item, question) => (question?.shape === 'read' ? READ_PACE : paceScale);

export { ALL_ITEMS, grade, LAST_TIER, tierItems, TIERS };
