// Gold coins: what looking after the zoo pays. Every rate and every piece of arithmetic a
// balance goes through lives here, so the economy can be read — and retuned — in one file.
//
// Pure — state in, numbers out, `now` never read from the clock — so tests/ can play a
// month of sessions in a millisecond.
//
// Coins are minted by *answering*, and by nothing else. habitat-scene.js says it plainly:
// the clock scene is the only place progress happens, so a habitat can never become the
// cheaper route to a reward. Throwing a ball is free play and pays nothing, forever.
//
// Nor does an individual correct answer pay. A coin per answer would put a number on the
// screen next to the clock and give a child something to watch that is not the hands.
// What pays is the things a child already celebrates — a pet arriving, a pet growing, a
// tier opening — plus two bonuses for the shape of play the scheduler actually needs:
// finishing a session rather than bailing, and coming back tomorrow.
//
// On top of those, three *milestones*: a tier finished outright, a week of days in a row,
// and every pet of one species collected. They are the long game, and they are handled
// differently from the events above — an event pays as it happens and is gone, whereas a
// milestone is a fact about the save that stays true once it is true. So the state records
// which ones have been awarded, and `milestonesReached` simply reports what is true now; the
// difference between those two lists is what is owed. That is what makes paying twice
// impossible without the scheduler having to remember anything.

import { factsOfSpecies, SPECIES_IDS, timesOfSpecies } from './pets.js';
import * as addition from './subjects/addition.js';
import { tierMastery } from './subjects/index.js';
import { TIERS } from './curriculum.js';
import { formFor } from './srs.js';

/**
 * A pet arriving is the biggest moment in the game and already carries confetti; the coins
 * ride along rather than competing with it. Deliberately the smallest of the three event
 * payouts: hatches are frequent early on, and a zoo should not be richest on day one.
 */
export const HATCH_COINS = 6;

/**
 * Indexed by the form reached, so `EVOLVE_COINS[form]`. Forms 2 and 3 land at 3 and 5 feeds
 * — days and then weeks after hatching — and are the only reward the SRS's long tail has.
 * They pay the most per event because they are the rarest and the hardest won.
 */
export const EVOLVE_COINS = [0, 0, 10, 16];

/**
 * A whole tier opening. Only three of these ever happen — a child starts inside tier 0 — so
 * each one is rare enough to be worth the price of a good piece of furniture on its own.
 */
export const TIER_COINS = 30;

/** Finishing a session — reaching the soft stop, the hard cap or the question cap. */
export const SESSION_COINS = 6;

/** The first session of a new day, and the same again for a day that follows yesterday. */
export const DAY_COINS = 6;
export const DAY_STREAK_COINS = 12;

/**
 * Coins owed by one answer, from the events `review()` already reports. Nothing here reads
 * the item, so a change to the scheduler cannot silently change the economy.
 */
export function payoutFor(events) {
  if (!events) return 0;
  let coins = 0;
  if (events.hatched) coins += HATCH_COINS;
  if (events.evolved) coins += EVOLVE_COINS[events.evolved] ?? 0;
  return coins;
}

/**
 * The bonus for today's first session. `days` is `stats.daysPlayed` *after* today has been
 * recorded, so the entry before the last one is the previous visit: if that was yesterday
 * the child kept a streak, which is the behaviour the whole spaced-repetition schedule
 * depends on and therefore the one worth paying double for.
 */
export function dayBonusFor(days, today) {
  const list = Array.isArray(days) ? days : [];
  if (list[list.length - 1] !== today) return 0;
  const previous = list[list.length - 2];
  if (!previous) return DAY_COINS;
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return previous === yesterday.toISOString().slice(0, 10) ? DAY_STREAK_COINS : DAY_COINS;
}

/* -------------------------------------------------------------- milestones */

/**
 * A tier finished outright. A tier *opens* the next one at 80% and pays TIER_COINS for it;
 * this is the other 20% — the handful of times a child has been quietly avoiding, which the
 * unlock rule deliberately lets them skip. Paying more for the stragglers than for the
 * opening is the whole point of having it.
 */
export const MASTERY_COINS = 40;

/** Seven days in a row. Paid again for each further week, because a streak is not a trophy. */
export const WEEK_STREAK_COINS = 30;

/** Every pet of one species. The longest horizon in the game, and the rarest payout. */
export const SPECIES_COINS = 50;

export const STREAK_WEEK_DAYS = 7;

/**
 * How many days at the end of `daysPlayed` are consecutive. The list is kept in order and
 * trimmed to the last sixty by `touchDay`, so the run at the end is the streak running now.
 */
export function streakDays(days) {
  const list = Array.isArray(days) ? days : [];
  let run = 0;
  let expected = null;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const day = list[i];
    if (typeof day !== 'string') break;
    if (expected !== null && day !== expected) break;
    run += 1;
    const previous = new Date(`${day}T00:00:00Z`);
    if (Number.isNaN(previous.getTime())) return run;
    previous.setUTCDate(previous.getUTCDate() - 1);
    expected = previous.toISOString().slice(0, 10);
  }
  return run;
}

/**
 * Every milestone the save currently satisfies, as ids. Pure, and derived entirely from state
 * that was already being stored — no counter anywhere had to be added to support this.
 *
 * Ids are `mastery:<tier>`, `week:<n>` (the nth full week of a streak) and `species:<id>` for
 * the clock, and `mastery:add:<tier>` / `species:add:<id>` for adding.
 *
 * The clock's ids are left exactly as they were rather than being renamed to match. They have
 * already been earned and paid out in saves in the wild, and `settleMilestones` pays for any
 * id it has not seen before — so renaming `mastery:0` to `mastery:clock:0` would hand every
 * existing player their whole history over again.
 */
export function milestonesReached(items, stats) {
  const out = [];
  const zoo = items ?? {};

  for (const tier of TIERS) {
    if (tierMastery(zoo, 'clock', tier.id) >= 1) out.push(`mastery:${tier.id}`);
  }
  for (const tier of addition.TIERS) {
    if (tierMastery(zoo, addition.id, tier.id) >= 1) out.push(`mastery:add:${tier.id}`);
  }

  const weeks = Math.floor(streakDays(stats?.daysPlayed) / STREAK_WEEK_DAYS);
  for (let week = 1; week <= weeks; week += 1) out.push(`week:${week}`);

  const collected = (ids) => ids.length > 0 && ids.every((id) => zoo[id]?.hatchedAt);
  for (const species of SPECIES_IDS) {
    if (collected(timesOfSpecies(species))) out.push(`species:${species}`);
    if (collected(factsOfSpecies(species))) out.push(`species:add:${species}`);
  }

  return out;
}

/** What one milestone is worth. An id this build does not recognise is worth nothing. */
export function coinsForMilestone(id) {
  const kind = String(id ?? '').split(':')[0];
  if (kind === 'mastery') return MASTERY_COINS;
  if (kind === 'week') return WEEK_STREAK_COINS;
  if (kind === 'species') return SPECIES_COINS;
  return 0;
}

/**
 * The milestones reached but not yet paid for, and what they come to. The caller records the
 * ids it was handed; anything already in `awarded` is skipped, so a reload, a second answer
 * in the same second, or a save that arrives from another device cannot pay for one twice.
 */
export function settleMilestones(items, stats, awarded) {
  const paid = new Set(Array.isArray(awarded) ? awarded : []);
  const fresh = milestonesReached(items, stats).filter((id) => !paid.has(id));
  return { ids: fresh, coins: fresh.reduce((sum, id) => sum + coinsForMilestone(id), 0) };
}

/* ------------------------------------------------------------------- purse */

const purse = (n) => Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));

/** Never negative, never fractional, however odd the number handed in. */
export const normalize = purse;

export const earn = (coins, amount) => purse(coins) + purse(amount);

export const canAfford = (coins, price) => purse(coins) >= purse(price);

/** Refuses rather than overdraws: a caller that forgot to check cannot go below zero. */
export const spend = (coins, price) =>
  canAfford(coins, price) ? purse(coins) - purse(price) : purse(coins);

/**
 * What a zoo that predates coins has already earned. Every hatch, every form and every tier
 * opened is paid retrospectively, so a child with forty pets opens the shop with something
 * to spend rather than a locked cupboard and a week of saving ahead of them.
 *
 * The same reconstruction `migrateItems` does for `feeds`: derived from what was saved, not
 * from anything the old build had to have written down.
 */
export function retroGrant(items, tier = 0) {
  let coins = 0;
  for (const item of Object.values(items ?? {})) {
    if (item?.hatchedAt) coins += HATCH_COINS;
    // Forms are monotonic in feeds, so paying every form up to the one a pet has reached is
    // exactly what the child would have been paid had the coins existed all along.
    const form = formFor(typeof item?.feeds === 'number' ? item.feeds : 0);
    for (let reached = 2; reached <= form; reached += 1) coins += EVOLVE_COINS[reached] ?? 0;
  }
  return coins + purse(tier) * TIER_COINS;
}
