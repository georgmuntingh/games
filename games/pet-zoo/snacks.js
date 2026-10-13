// The snack shelf. Pure data plus the rules, the way shop.js is for furniture, and kept apart
// from it because a snack is a different kind of thing: furniture is bought once and stays,
// a snack is bought by the pack and eaten.
//
// Only counts are ever stored — `state.pantry` is `{ cookie: 3, chili: 1 }` and nothing else.
// What a snack does when it is eaten is habitat-scene.js's business, keyed off the same id.
//
// The free larder never goes away. A child who has spent nothing still has three things to
// feed every pet; the shelf is the silly extras, never the food itself. And nothing here can
// earn a coin: snacks only spend them, so the clock scene stays the one place progress happens.
//
// Prices against wallet.js: a session pays roughly 12 to 35 coins, so a pack of the cheapest
// snack is well under a session and a pack of the dearest is about one.

import { LAST_TIER } from './curriculum.js';
import { hashSeed, rngFrom } from './seed.js';

/** How many of one snack the pantry will hold. Enough to never feel stingy, few enough to show. */
export const PANTRY_CAP = 20;

/**
 * `effect` is the name habitat-scene.js looks the after-effect up by; the id and the art are
 * the same word, so a snack and its drawing in habitat-parts.js cannot drift apart.
 */
export const SNACKS = [
  { id: 'cookie', price: 8, pack: 3, tier: 0, effect: 'crumbs' },
  { id: 'popcorn', price: 10, pack: 3, tier: 0, effect: 'scatter' },
  { id: 'lollipop', price: 10, pack: 3, tier: 0, effect: 'lick' },
  { id: 'watermelon', price: 14, pack: 3, tier: 1, effect: 'seeds' },
  { id: 'icecream', price: 15, pack: 3, tier: 1, effect: 'freeze' },
  { id: 'soda', price: 15, pack: 3, tier: 1, effect: 'hiccup' },
  { id: 'jelly', price: 18, pack: 3, tier: 2, effect: 'wobble' },
  { id: 'chili', price: 18, pack: 3, tier: 2, effect: 'spicy' },
  { id: 'cake', price: 25, pack: 3, tier: 3, effect: 'party' },
  { id: 'goldenapple', price: 30, pack: 3, tier: 3, effect: 'golden' },
];

export const SNACK_IDS = SNACKS.map((entry) => entry.id);

export const snackById = new Map(SNACKS.map((entry) => [entry.id, entry]));

export const isSnack = (id) => snackById.has(id);

export const effectOf = (id) => snackById.get(id)?.effect ?? null;

/** Locked snacks stay on the shelf, greyed, exactly like locked furniture. */
export const isSnackUnlocked = (id, tier) => (snackById.get(id)?.tier ?? LAST_TIER + 1) <= tier;

/** Unknown ids, and anything that is not a whole number above zero, are dropped. */
export function sanitizePantry(pantry) {
  const out = {};
  if (!pantry || typeof pantry !== 'object' || Array.isArray(pantry)) return out;
  for (const id of SNACK_IDS) {
    const n = Math.floor(Number(pantry[id]));
    if (Number.isFinite(n) && n > 0) out[id] = Math.min(PANTRY_CAP, n);
  }
  return out;
}

export const countOf = (pantry, id) => sanitizePantry(pantry)[id] ?? 0;

/** Whether another pack would still fit. A full shelf refuses rather than wasting the coins. */
export const canStock = (pantry, id) => isSnack(id) && countOf(pantry, id) < PANTRY_CAP;

/** Pure pantry → pantry: one pack more, up to the cap. Refuses silently on an unknown id. */
export function buySnack(pantry, id) {
  const clean = sanitizePantry(pantry);
  if (!canStock(clean, id)) return clean;
  return { ...clean, [id]: Math.min(PANTRY_CAP, (clean[id] ?? 0) + snackById.get(id).pack) };
}

/** Pure pantry → pantry: one eaten. The key goes when the last one does. */
export function useSnack(pantry, id) {
  const clean = sanitizePantry(pantry);
  if (!clean[id]) return clean;
  const { [id]: n, ...rest } = clean;
  return n > 1 ? { ...rest, [id]: n - 1 } : rest;
}

/** Snacks the child actually has, in shelf order — what the picnic tray shows. */
export const stocked = (pantry) => {
  const clean = sanitizePantry(pantry);
  return SNACK_IDS.filter((id) => clean[id] > 0).map((id) => [id, clean[id]]);
};

/* ------------------------------------------------------------------- tastes */

// A popcorn kernel is popcorn, as far as a tongue is concerned.
const TASTE_ALIAS = { kernel: 'popcorn' };

/**
 * What one pet makes of one food: 'love', 'like' or 'yuck'. Seeded from the pet's id, so the
 * same pet has the same favourite on every device and every visit — finding it out is the game.
 *
 * The favourite may be anything the pet can be offered: its own larder or the shelf. The food
 * it will not touch only ever comes from its own free larder, and not every pet has one — a
 * bought snack is never turned down, so coins are never wasted on a fussy eater.
 */
export function tasteOf(itemId, kind, menu = []) {
  const food = TASTE_ALIAS[kind] ?? kind;
  const rnd = rngFrom(hashSeed(`taste:${itemId}`));
  // Half the pets love something from their own larder, so a child who never buys a snack
  // still gets to find favourites; the other half are holding out for something from the shelf.
  const pool = menu.length && rnd() < 0.5 ? menu : SNACK_IDS;
  const favourite = pool[Math.floor(rnd() * pool.length)];
  if (food === favourite) return 'love';
  const fussy = rnd() < 0.7;
  const free = menu.filter((entry) => entry !== favourite);
  const yuck = fussy && free.length ? free[Math.floor(rnd() * free.length)] : null;
  return food === yuck ? 'yuck' : 'like';
}
