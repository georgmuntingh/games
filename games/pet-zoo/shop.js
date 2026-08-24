// What the stall sells. Pure data plus the rules, the way curriculum.js is pure data plus
// the unlock rule — and for the same reason: the catalog stays language-free, because each
// item's name is looked up as `shop.<id>` in i18n.js.
//
// Furniture is bought for one named pet and lives in that pet's habitat. Only the *id* is
// ever stored, on `item.decor`; where the thing stands is derived from the habitat's layout
// at render time, exactly like the nest and the larder. That is what keeps a bought house in
// the same corner on every device without a single coordinate crossing between them.
//
// Prices against wallet.js: a session pays roughly 12 to 35 coins depending on how many pets
// happened to arrive in it, so the cheapest piece is about two sessions away and the dearest
// about five. Slow enough that choosing costs something, fast enough that a child can see the
// shop changing.

import { LAST_TIER } from './curriculum.js';

/**
 * `wide` items need a spot with room either side — a house cannot straddle the larder — and
 * are given the roomier of the two side bands. Everything else fits anywhere.
 */
export const CATALOG = [
  { id: 'flowerbed', price: 45, tier: 0, band: 'narrow' },
  { id: 'lantern', price: 60, tier: 0, band: 'narrow' },
  { id: 'house', price: 130, tier: 1, band: 'wide' },
  { id: 'swing', price: 80, tier: 1, band: 'wide' },
  { id: 'pond', price: 90, tier: 2, band: 'narrow' },
  { id: 'hammock', price: 80, tier: 2, band: 'wide' },
  { id: 'arch', price: 140, tier: 3, band: 'wide' },
  { id: 'windmill', price: 140, tier: 3, band: 'narrow' },
];

/**
 * Two pieces a pet, and the number is the scene's, not a design preference. A 200x120 habitat
 * already holds a pet, its nest, its ball, its larder and four pieces of scenery; measured
 * across all 144 layouts, two is the most that will stand clear of everything the pet has to
 * reach and still sit inside the safe box whole. A third would have to crowd the walk line.
 *
 * It is a good limit to have landed on anyway: a child with 144 pets and two slots each has
 * to keep choosing, and choosing is the part of the shop that is actually a game.
 */
export const MAX_DECOR = 2;

export const itemById = new Map(CATALOG.map((entry) => [entry.id, entry]));

export const priceOf = (id) => itemById.get(id)?.price ?? 0;

/** Locked pieces stay on the shelf, greyed — seeing what is coming is half the motivation. */
export const isUnlocked = (id, tier) => (itemById.get(id)?.tier ?? LAST_TIER + 1) <= tier;

export const decorOf = (item) => (Array.isArray(item?.decor) ? item.decor : []);

export const isOwned = (item, id) => decorOf(item).includes(id);

export const isFull = (item) => decorOf(item).length >= MAX_DECOR;

/**
 * Keep the ids this build can actually draw, once each, up to the cap. Runs on every load and
 * every import, so neither a hand-edited save nor a file from a future build with pieces this
 * one has never heard of can put something undrawable into a habitat.
 */
export function sanitizeDecor(decor) {
  if (!Array.isArray(decor)) return [];
  const out = [];
  for (const id of decor) {
    if (itemById.has(id) && !out.includes(id)) out.push(id);
    if (out.length >= MAX_DECOR) break;
  }
  return out;
}

/** Pure item → item. Refuses silently on an unknown id, a duplicate, or a full habitat. */
export function buy(item, id) {
  if (!itemById.has(id) || isOwned(item, id) || isFull(item)) return item;
  return { ...item, decor: [...decorOf(item), id] };
}

export function sell(item, id) {
  if (!isOwned(item, id)) return item;
  return { ...item, decor: decorOf(item).filter((owned) => owned !== id) };
}
