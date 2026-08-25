// What the stall sells. Pure data plus the rules, the way curriculum.js is pure data plus
// the unlock rule — and for the same reason: the catalog stays language-free, because each
// item's name is looked up as `shop.<id>` in i18n.js.
//
// Two scopes. A `home` piece is bought for one named pet and lives in that pet's habitat; a
// `zoo` piece is bought once for the whole collection and stands in the yard above the pet
// grid. Only the *id* is ever stored — on `item.decor` for a home piece, on `state.zooDecor`
// for a zoo one. Where the thing stands is derived from the layout at render time, exactly
// like the nest and the larder. That is what keeps a bought house in the same corner on
// every device without a single coordinate crossing between them.
//
// Home pieces come in two slots, because a habitat has two kinds of room in it. `ground`
// pieces stand on the walk line with the pet and are capped at two — the scene's number, not
// a preference, measured across all 144 layouts as the most that clears everything the pet
// has to reach. `backdrop` pieces sit far off on the hill line, where nothing competes with
// them, so one more fits there without crowding anything.
//
// Prices against wallet.js: a session pays roughly 12 to 35 coins depending on how many pets
// happened to arrive in it, so the cheapest piece is about a session away and the dearest
// about ten. Slow enough that choosing costs something, fast enough that a child can see the
// shop changing — and there is something affordable at every tier, so no one is ever saving
// with nothing in reach.

import { LAST_TIER } from './curriculum.js';

/**
 * `wide` items need a spot with room either side — a house cannot straddle the larder — and
 * are given the roomier of the two side bands. Everything else fits anywhere. `band` applies
 * to ground pieces only; a backdrop piece has the whole hill line to itself, and a zoo piece
 * gets a named slot in the yard.
 */
export const CATALOG = [
  // Ground — the walk line, shared with the pet.
  { id: 'stump', price: 35, tier: 0, scope: 'home', slot: 'ground', band: 'narrow' },
  { id: 'flowerbed', price: 45, tier: 0, scope: 'home', slot: 'ground', band: 'narrow' },
  { id: 'lantern', price: 60, tier: 0, scope: 'home', slot: 'ground', band: 'narrow' },
  { id: 'sandpit', price: 70, tier: 1, scope: 'home', slot: 'ground', band: 'wide' },
  { id: 'swing', price: 80, tier: 1, scope: 'home', slot: 'ground', band: 'wide' },
  { id: 'house', price: 130, tier: 1, scope: 'home', slot: 'ground', band: 'wide' },
  { id: 'beehive', price: 75, tier: 2, scope: 'home', slot: 'ground', band: 'narrow' },
  { id: 'hammock', price: 80, tier: 2, scope: 'home', slot: 'ground', band: 'wide' },
  { id: 'pond', price: 90, tier: 2, scope: 'home', slot: 'ground', band: 'narrow' },
  { id: 'feeder', price: 95, tier: 3, scope: 'home', slot: 'ground', band: 'narrow' },
  { id: 'arch', price: 140, tier: 3, scope: 'home', slot: 'ground', band: 'wide' },
  { id: 'windmill', price: 140, tier: 3, scope: 'home', slot: 'ground', band: 'narrow' },

  // Backdrop — the hill line, far off behind everything.
  { id: 'farGrove', price: 50, tier: 0, scope: 'home', slot: 'backdrop' },
  { id: 'farMill', price: 85, tier: 1, scope: 'home', slot: 'backdrop' },
  { id: 'farArch', price: 120, tier: 2, scope: 'home', slot: 'backdrop' },
  { id: 'farTower', price: 165, tier: 3, scope: 'home', slot: 'backdrop' },

  // The yard — bought once, for the whole zoo.
  { id: 'signpost', price: 55, tier: 0, scope: 'zoo' },
  { id: 'topiary', price: 90, tier: 1, scope: 'zoo' },
  { id: 'bunting', price: 110, tier: 1, scope: 'zoo' },
  { id: 'pathLamps', price: 150, tier: 2, scope: 'zoo' },
  { id: 'fountain', price: 200, tier: 3, scope: 'zoo' },
  { id: 'statue', price: 250, tier: 3, scope: 'zoo' },
];

/**
 * How many pieces of each kind a habitat holds.
 *
 * `ground` is two, and the number is the scene's, not a design preference. A 200x120 habitat
 * already holds a pet, its nest, its ball, its larder and four pieces of scenery; measured
 * across all 144 layouts, two is the most that will stand clear of everything the pet has to
 * reach and still sit inside the safe box whole. A third would have to crowd the walk line.
 *
 * `backdrop` is one. The hill line is empty, so a piece there costs the pet nothing — but the
 * horizon is a single readable band, and two silhouettes in it stop reading as distance and
 * start reading as clutter.
 *
 * It is a good limit to have landed on anyway: a child with 144 pets and three slots each has
 * to keep choosing, and choosing is the part of the shop that is actually a game.
 */
export const SLOT_CAPS = { ground: 2, backdrop: 1 };

/** The ground cap under its old name — habitat.js lays out exactly this many spots. */
export const MAX_DECOR = SLOT_CAPS.ground;

/**
 * Three pieces in the yard. The strip is wide but shallow, and the stall stands in it: three
 * is what fits either side of the stall without anything overlapping it.
 */
export const MAX_ZOO_DECOR = 3;

export const itemById = new Map(CATALOG.map((entry) => [entry.id, entry]));

export const priceOf = (id) => itemById.get(id)?.price ?? 0;

/** Unknown ids answer 'ground', so a bad id is capped somewhere rather than nowhere. */
export const slotOf = (id) => itemById.get(id)?.slot ?? 'ground';

export const scopeOf = (id) => itemById.get(id)?.scope ?? 'home';

export const isHome = (id) => scopeOf(id) === 'home';

export const isZoo = (id) => scopeOf(id) === 'zoo';

/** Everything sold for one pet's habitat, in catalog order — the Home tab's shelf. */
export const HOME_CATALOG = CATALOG.filter((entry) => entry.scope === 'home');

/** Everything sold for the yard — the Zoo tab's shelf. */
export const ZOO_CATALOG = CATALOG.filter((entry) => entry.scope === 'zoo');

/** Locked pieces stay on the shelf, greyed — seeing what is coming is half the motivation. */
export const isUnlocked = (id, tier) => (itemById.get(id)?.tier ?? LAST_TIER + 1) <= tier;

export const decorOf = (item) => (Array.isArray(item?.decor) ? item.decor : []);

export const isOwned = (item, id) => decorOf(item).includes(id);

/** How many of one slot a pet already has. */
export const countIn = (item, slot) =>
  decorOf(item).filter((id) => slotOf(id) === slot).length;

/**
 * Whether the slot a piece would go in is already taken. Defaults to the ground slot so a
 * caller that has not looked the piece up still asks about something real.
 */
export const isFull = (item, slot = 'ground') =>
  countIn(item, slot) >= (SLOT_CAPS[slot] ?? 0);

/**
 * Keep the ids this build can actually draw, once each, up to the cap for their own slot.
 * Runs on every load and every import, so neither a hand-edited save nor a file from a future
 * build with pieces this one has never heard of can put something undrawable into a habitat.
 *
 * A zoo id found on a pet is dropped rather than drawn: the yard's pieces are the wrong scale
 * for a habitat, and a save that has been edited by hand is exactly where one would turn up.
 */
export function sanitizeDecor(decor) {
  if (!Array.isArray(decor)) return [];
  const out = [];
  const used = {};
  for (const id of decor) {
    if (!itemById.has(id) || !isHome(id) || out.includes(id)) continue;
    const slot = slotOf(id);
    if ((used[slot] ?? 0) >= (SLOT_CAPS[slot] ?? 0)) continue;
    used[slot] = (used[slot] ?? 0) + 1;
    out.push(id);
  }
  return out;
}

/** The same filter for the yard: known zoo ids, once each, up to the strip's three slots. */
export function sanitizeZoo(decor) {
  if (!Array.isArray(decor)) return [];
  const out = [];
  for (const id of decor) {
    if (itemById.has(id) && isZoo(id) && !out.includes(id)) out.push(id);
    if (out.length >= MAX_ZOO_DECOR) break;
  }
  return out;
}

/**
 * Pure item → item. Refuses silently on an unknown id, a piece that is not a home piece, a
 * duplicate, or a slot that is already full.
 */
export function buy(item, id) {
  if (!itemById.has(id) || !isHome(id)) return item;
  if (isOwned(item, id) || isFull(item, slotOf(id))) return item;
  return { ...item, decor: [...decorOf(item), id] };
}

export function sell(item, id) {
  if (!isOwned(item, id)) return item;
  return { ...item, decor: decorOf(item).filter((owned) => owned !== id) };
}

/* --------------------------------------------------------------------- yard */

export const zooOf = (zooDecor) => (Array.isArray(zooDecor) ? zooDecor : []);

export const zooOwns = (zooDecor, id) => zooOf(zooDecor).includes(id);

export const zooIsFull = (zooDecor) => zooOf(zooDecor).length >= MAX_ZOO_DECOR;

/** Pure list → list, with the same refusals as `buy`. */
export function buyZoo(zooDecor, id) {
  if (!itemById.has(id) || !isZoo(id)) return zooOf(zooDecor);
  if (zooOwns(zooDecor, id) || zooIsFull(zooDecor)) return zooOf(zooDecor);
  return [...zooOf(zooDecor), id];
}

export function sellZoo(zooDecor, id) {
  if (!zooOwns(zooDecor, id)) return zooOf(zooDecor);
  return zooOf(zooDecor).filter((owned) => owned !== id);
}
