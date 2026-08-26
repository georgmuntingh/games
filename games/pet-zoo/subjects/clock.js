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

import { grade, MINUTE_STEP, parseTimeId, timeId } from '../clock.js';
import { ALL_ITEMS, LAST_TIER, TIERS, tierItems, tierOfMinute } from '../curriculum.js';

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

// How much slower this subject's answers legitimately are, against the thresholds in
// `qualityOf`. Dragging two hands is the pace those numbers were tuned at, so: 1.
export const paceScale = 1;

export { ALL_ITEMS, grade, LAST_TIER, tierItems, TIERS };
