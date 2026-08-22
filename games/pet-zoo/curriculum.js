// What gets taught, in what order. Pure data plus the unlock rule.
//
// A tier gates which times may be *introduced*; once a time has graduated it stays in
// review forever regardless of tier, so earlier work never falls out of the schedule.

import { HOURS, timeId } from './clock.js';

export const UNLOCK_RATIO = 0.8;

// Structure only — each tier's name and blurb are looked up as `tier.<id>.name` and
// `tier.<id>.blurb` in i18n.js, so the curriculum stays language-free.
export const TIERS = [
  { id: 0, minutes: [0] },
  { id: 1, minutes: [30] },
  { id: 2, minutes: [15, 45] },
  { id: 3, minutes: [5, 10, 20, 25, 35, 40, 50, 55] },
];

export const LAST_TIER = TIERS.length - 1;

const MINUTE_TIER = new Map();
for (const tier of TIERS) {
  for (const m of tier.minutes) MINUTE_TIER.set(m, tier.id);
}

export const tierOfMinute = (m) => MINUTE_TIER.get(m) ?? null;

/** Every time in a tier, in teaching order: hour by hour, minute by minute. */
export function tierItems(tierId) {
  const tier = TIERS[tierId];
  if (!tier) return [];
  const out = [];
  for (const m of tier.minutes) {
    for (const h of HOURS) out.push({ h, m, id: timeId(h, m), tier: tierId });
  }
  return out;
}

/** All 144 five-minute times, tier 0 first. */
export const ALL_ITEMS = TIERS.flatMap((tier) => tierItems(tier.id));

export const itemsById = new Map(ALL_ITEMS.map((item) => [item.id, item]));

/** How much of a tier the child has actually mastered, 0..1. */
export function tierMastery(items, tierId) {
  const list = tierItems(tierId);
  if (!list.length) return 0;
  const done = list.filter((t) => items[t.id]?.phase === 'graduated').length;
  return done / list.length;
}

/**
 * The highest tier the child may draw new times from. Each tier opens once 80% of the
 * one below it has graduated — high enough that the new material lands on solid ground,
 * low enough that a couple of stubborn times can't stall the whole game.
 */
export function unlockedTier(items) {
  let tier = 0;
  while (tier < LAST_TIER && tierMastery(items, tier) >= UNLOCK_RATIO) tier += 1;
  return tier;
}

/** Times in the unlocked tiers that the child has never been shown, in teaching order. */
export function unseenItems(items, tier) {
  const out = [];
  for (let t = 0; t <= Math.min(tier, LAST_TIER); t += 1) {
    for (const item of tierItems(t)) {
      if (!items[item.id]) out.push(item);
    }
  }
  return out;
}
