// One sky over the whole zoo, and a new one every morning.
//
// The sibling of habitat.js's lighting: that gives each pet its own permanent time of day,
// and this gives every pet the same weather on the same date. Together they are why two
// visits to the same home are never quite the same picture — the light is the pet's, the
// weather is today's.
//
// Derived, never stored. A day's weather is a pure function of its `YYYY-MM-DD` stamp, so
// 144 habitats under a year of weather still cost no bytes, two devices agree without
// syncing anything, and the save file gains no field and needs no version bump. The rainbow
// rule wants to know what yesterday was like; it recomputes yesterday rather than
// remembering it, which is the same trick — and the reason `prevStamp` is in here.
//
// Pure: no DOM, no Date, no storage, no randomness that isn't derived from the stamp. The
// calling clock lives in main.js, exactly as it does for the yard.

/* ------------------------------------------------------------------ the six */

/**
 * What each weather does to a habitat.
 *
 * `veil` is a full-bleed wash, kept as a triple and an amount rather than a finished rgba
 * because `veilFor` has to be able to weaken it — see the note there. `fall` is what drops
 * out of the sky, and `soak` is how wet the ground gets underneath it, both read by the art
 * kit in habitat-parts.js.
 *
 * `dark` marks the ones that take light away rather than add it. Nothing in here is allowed
 * to take away much: the game's oldest visual rule is that a child must be able to see their
 * pet as clearly at midnight as at noon, and fog on a night habitat is exactly the case that
 * rule was written for.
 */
export const WEATHERS = {
  clear: {
    sky: 'none',
    veil: { rgb: [255, 246, 214], amount: 0.05 },
    fall: null,
    soak: 0,
    dark: false,
  },
  cloudy: {
    sky: 'clouds',
    veil: { rgb: [150, 158, 176], amount: 0.14 },
    fall: null,
    soak: 0,
    dark: true,
  },
  rain: {
    sky: 'clouds',
    veil: { rgb: [116, 130, 158], amount: 0.2 },
    fall: { kind: 'drop', count: 46, dur: [0.5, 0.9] },
    soak: 1,
    dark: true,
  },
  fog: {
    // The palest veil of the three grey ones on purpose. Fog reads as fog from the bank on
    // the horizon and the softened distance, not from dimming the whole field.
    sky: 'bank',
    veil: { rgb: [226, 230, 238], amount: 0.22 },
    fall: null,
    soak: 0.25,
    dark: false,
  },
  snow: {
    sky: 'clouds',
    veil: { rgb: [222, 232, 248], amount: 0.16 },
    fall: { kind: 'flake', count: 34, dur: [2.4, 4.2] },
    soak: 1,
    dark: false,
  },
  hail: {
    sky: 'clouds',
    veil: { rgb: [140, 154, 180], amount: 0.18 },
    fall: { kind: 'stone', count: 26, dur: [0.34, 0.52] },
    soak: 0.5,
    dark: true,
  },
  rainbow: {
    // The one weather that is a reward rather than a condition: it only ever turns up the
    // day after rain, and it leaves yesterday's puddles on the ground to say why.
    sky: 'arc',
    veil: { rgb: [255, 244, 220], amount: 0.06 },
    fall: null,
    soak: 0.5,
    dark: false,
  },
};

export const WEATHER_IDS = Object.keys(WEATHERS);

export const DEFAULT_WEATHER = 'clear';

export const isWeather = (id) => Object.prototype.hasOwnProperty.call(WEATHERS, id);

/**
 * How often each turns up, out of a hundred days. Fair weather is most of them, and that is
 * the point: the same reasoning that makes only one habitat in four a night one. Rain a
 * child sees every day is scenery; rain a child sees once a week is weather.
 *
 * The rainbow is not in here. It is not rolled for — it is earned by yesterday.
 */
export const WEIGHTS = {
  clear: 40,
  cloudy: 20,
  rain: 20,
  fog: 8,
  snow: 7,
  hail: 5,
};

const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((sum, w) => sum + w, 0);

/** How often a day after rain gets a rainbow instead of its own roll. */
const RAINBOW_ODDS = 4; // one in this many rainy days is followed by one

/* ------------------------------------------------------------------ numbers */

const clamp01 = (v) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0);

/** Smoothstep, so wet ground arrives rather than switches on. */
const ease = (t) => t * t * (3 - 2 * t);

const round3 = (v) => Math.round(v * 1000) / 1000;

/* -------------------------------------------------------------------- rolls */

/** djb2, the same one pets.js uses. Copied rather than imported: this module owes pets.js
 * nothing else, and a weather table that pulls in the whole species file to hash a date is
 * a dependency nobody would expect to find. */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Avalanche. This is load-bearing, not decoration.
 *
 * djb2 folds each character in with a multiply and an add, so the *last* character only ever
 * contributes its own value: `hash('2026-09-03')` and `hash('2026-09-04')` differ by exactly
 * one. Picking a weather with `hash(stamp) % 100` would therefore walk the weight table one
 * step per day and the zoo would get a week of rain followed by a week of snow, in order.
 *
 * Mixing the bits back over each other first is what turns "yesterday plus one" into a
 * genuinely different number, so consecutive days are independent.
 */
function scramble(n) {
  let x = n >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

const roll = (salt, stamp) => scramble(hash(`${salt}|${stamp}`));

/**
 * The weather a date would have on its own, before the rainbow rule gets a say. Exported
 * because it is the one with the honest distribution, and so a test can hold the weights.
 */
export function weatherForDay(stamp) {
  let pick = roll('sky', String(stamp)) % TOTAL_WEIGHT;
  for (const [id, weight] of Object.entries(WEIGHTS)) {
    if (pick < weight) return id;
    pick -= weight;
  }
  return DEFAULT_WEATHER;
}

/**
 * Today's sky. The one the game calls.
 *
 * `yesterday` is optional and defaults to the day before, which is what makes a rainbow
 * possible from a single date with nothing stored. Pass it explicitly to ask what a
 * particular pair of days would do.
 */
export function weatherFor(stamp, yesterday = prevStamp(stamp)) {
  if (weatherForDay(yesterday) === 'rain' && roll('bow', String(stamp)) % RAINBOW_ODDS === 0) {
    return 'rainbow';
  }
  return weatherForDay(stamp);
}

/* ------------------------------------------------------------------ the day */

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const daysIn = (y, m) => (m === 2 && isLeap(y) ? 29 : MONTH_DAYS[m - 1]);

const pad = (n) => String(n).padStart(2, '0');

const stampOf = (y, m, d) => `${String(y).padStart(4, '0')}-${pad(m)}-${pad(d)}`;

/**
 * The day before, as a stamp. Deliberately arithmetic rather than `new Date(t - DAY_MS)`:
 * this module takes no clock, and subtracting a fixed 24 hours from a local midnight lands
 * on the wrong day twice a year anyway, in every country that puts its clocks back.
 *
 * A stamp it cannot read comes back unchanged, which costs the day a rainbow and nothing
 * else.
 */
export function prevStamp(stamp) {
  const parts = String(stamp).split('-');
  const [y, m, d] = parts.map(Number);
  if (parts.length !== 3 || ![y, m, d].every(Number.isFinite)) return String(stamp);
  if (m < 1 || m > 12 || d < 1) return String(stamp);
  if (d > 1) return stampOf(y, m, d - 1);
  if (m > 1) return stampOf(y, m - 1, daysIn(y, m - 1));
  return stampOf(y - 1, 12, 31);
}

/**
 * How far through a day a moment is, 0 at midnight and 1 at the next. The clock comes in as
 * an hour and a minute, so this module still never touches Date.
 */
export const dayFraction = (hour24 = 0, minute = 0) =>
  clamp01((((hour24 % 24) + 24) % 24) / 24 + (((minute % 60) + 60) % 60) / 1440);

/** How far into the day the ground has taken all it is going to take. */
const SOAK_FULL = 0.55;

/**
 * How wet — or how covered — the ground is, 0 to 1.
 *
 * It builds through the morning and then holds, which is the shape rain actually has on a
 * path: the first hour changes everything and the fifth changes very little. Because it is
 * a function of the clock rather than of how long the child has been standing there, a
 * habitat left at breakfast and returned to at teatime has the puddles it should have, with
 * nothing written down in between.
 */
export function groundSoak(kind, fraction) {
  const spec = WEATHERS[kind];
  if (!spec || spec.soak <= 0) return 0;
  return round3(spec.soak * ease(clamp01(clamp01(fraction) / SOAK_FULL)));
}

/**
 * The weather's wash, as a paintable colour.
 *
 * Halved on a night habitat. A night sky already carries a heavy blue veil of its own, and
 * laying a full fog on top of it is the one combination in the game that could leave a pet
 * genuinely hard to see — which is the thing the tests have forbidden since the first
 * habitat was drawn. Half a veil still reads as fog and never reaches that.
 */
export function veilFor(kind, night = false) {
  const spec = WEATHERS[kind];
  if (!spec) return 'transparent';
  const amount = night ? spec.veil.amount * NIGHT_VEIL : spec.veil.amount;
  return `rgba(${spec.veil.rgb.join(', ')}, ${round3(amount)})`;
}

export const NIGHT_VEIL = 0.5;

/* ---------------------------------------------------------------- behaviour */

/** The weathers a pet would rather not stand in — the ones that put an umbrella out. */
export const shelters = (kind) => kind === 'rain' || kind === 'hail';

/** And the ones it merely dawdles through. */
export const slows = (kind) => kind === 'fog' || kind === 'snow';
