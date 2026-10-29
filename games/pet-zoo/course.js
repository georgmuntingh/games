// The obstacle course. Pure data plus the rules, the way shop.js is for furniture and
// snacks.js is for the picnic basket, and kept apart from both because a course is a third
// kind of thing: it is bought once and stays, like furniture, but it is not *standing* in the
// habitat. A small start flag is all that lives there. Tap it and the pieces pop up across the
// walk line, the pet runs them, and they fold away again — which is what lets a crowded
// 200x120 home take three more things without the walk line ever losing room.
//
// Only the ids are ever stored, on `item.course`, in the order they were bought. That order is
// the running order, left to right, so buying a fourth thing can never move the first three.
// Where each piece stands, and how the pet gets over it, is derived from the id at run time.
//
// The moves are here rather than in habitat-scene.js because they are numbers, not DOM: each
// one is a pose as a function of progress, so the tests can walk every obstacle from start to
// finish and check the pet leaves the ground where it started and lands where it should.
//
// Prices against wallet.js, the same reasoning as the furniture: the cheapest piece is about a
// session away and the dearest few a proper thing to save up for, and there is something to buy
// at every tier.
//
// Nothing here earns anything. A course is free play, exactly as the rest of a habitat is.

import { LAST_TIER } from './curriculum.js';
import { SAFE } from './habitat-parts.js';
import { hashSeed, rngFrom } from './seed.js';

/**
 * `span` is how much of the walk line one piece takes, entry to exit — the pet starts its move
 * at the left edge of it and finishes at the right. `move` is the pose the pet runs it with.
 * Listed by tier and then price, which is the order the shelf shows them in.
 */
export const COURSE = [
  { id: 'hurdle', price: 40, tier: 0, move: 'jump', span: 20 },
  { id: 'limbo', price: 40, tier: 0, move: 'duck', span: 22 },
  { id: 'stones', price: 45, tier: 0, move: 'hop', span: 28 },
  { id: 'leaves', price: 45, tier: 0, move: 'pounce', span: 26 },
  { id: 'tunnel', price: 50, tier: 0, move: 'crawl', span: 28 },
  { id: 'sprinkler', price: 50, tier: 0, move: 'dash', span: 26 },
  { id: 'bubbles', price: 55, tier: 0, move: 'bubble', span: 24 },
  { id: 'hoop', price: 60, tier: 1, move: 'leap', span: 22 },
  { id: 'table', price: 60, tier: 1, move: 'pause', span: 24 },
  { id: 'tyre', price: 65, tier: 1, move: 'tyre', span: 22 },
  { id: 'weave', price: 70, tier: 1, move: 'weave', span: 28 },
  { id: 'pool', price: 70, tier: 1, move: 'flop', span: 28 },
  { id: 'ramp', price: 75, tier: 1, move: 'climb', span: 28 },
  { id: 'aframe', price: 75, tier: 1, move: 'scramble', span: 28 },
  { id: 'bridge', price: 80, tier: 1, move: 'wobble', span: 30 },
  { id: 'beam', price: 85, tier: 2, move: 'balance', span: 30 },
  { id: 'seesaw', price: 90, tier: 2, move: 'tip', span: 30 },
  { id: 'bell', price: 90, tier: 2, move: 'ring', span: 20 },
  { id: 'log', price: 95, tier: 2, move: 'logroll', span: 28 },
  { id: 'wheel', price: 100, tier: 2, move: 'spin', span: 26 },
  { id: 'trampoline', price: 110, tier: 2, move: 'bounce', span: 24 },
  { id: 'monkeybars', price: 110, tier: 2, move: 'hang', span: 30 },
  { id: 'slide', price: 125, tier: 3, move: 'slide', span: 30 },
  { id: 'bigball', price: 140, tier: 3, move: 'roll', span: 28 },
  { id: 'ballpit', price: 150, tier: 3, move: 'dive', span: 28 },
  { id: 'zipline', price: 160, tier: 3, move: 'zip', span: 30 },
  { id: 'cannon', price: 200, tier: 3, move: 'blast', span: 30 },
];

/** Three, which is what fits across the walk line side by side with room to run between. */
export const MAX_COURSE = 3;

/**
 * Pieces that are always run last, whenever they were bought: ringing the bell is how a course
 * ends. Only the running order changes — what is stored is still the buying order, so selling
 * the bell and buying it back leaves everything else where it was.
 */
export const FINALE = new Set(['bell']);

export const COURSE_IDS = COURSE.map((entry) => entry.id);

export const obstacleById = new Map(COURSE.map((entry) => [entry.id, entry]));

export const isObstacle = (id) => obstacleById.has(id);

/** Locked pieces stay on the shelf, greyed, exactly like locked furniture. */
export const isCourseUnlocked = (id, tier) => (obstacleById.get(id)?.tier ?? LAST_TIER + 1) <= tier;

/**
 * Keep the ids this build can draw, once each, in the order they came, up to the cap. Runs on
 * every load and every import, like `sanitizeDecor`, so neither a hand-edited save nor a file
 * from a later build can put something unrunnable into a course.
 */
export function sanitizeCourse(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const id of list) {
    if (isObstacle(id) && !out.includes(id)) out.push(id);
    if (out.length >= MAX_COURSE) break;
  }
  return out;
}

export const courseOf = (item) => sanitizeCourse(item?.course);

export const courseOwns = (item, id) => courseOf(item).includes(id);

export const courseIsFull = (item) => courseOf(item).length >= MAX_COURSE;

/** Pure item → item. Refuses silently on an unknown id, a duplicate, or a full course. */
export function buyObstacle(item, id) {
  if (!isObstacle(id) || courseOwns(item, id) || courseIsFull(item)) return item;
  return { ...item, course: [...courseOf(item), id] };
}

export function sellObstacle(item, id) {
  if (!courseOwns(item, id)) return item;
  return { ...item, course: courseOf(item).filter((owned) => owned !== id) };
}

/**
 * The one obstacle this pet likes best. Seeded from the pet's id, like its favourite food, so it
 * is the same on every device — and drawn from the whole catalog rather than from what is owned,
 * so a child may only find it out by buying the right thing.
 */
export function favouriteObstacleOf(itemId) {
  const rnd = rngFrom(hashSeed(`course:${itemId}`));
  return COURSE_IDS[Math.floor(rnd() * COURSE_IDS.length)];
}

/* ------------------------------------------------------------------- layout */

/**
 * Where a run happens: most of the safe box, inset so the pet is all but wholly on screen at
 * the start line and the finish on the narrowest crop. Wider than ROAM on purpose — three
 * pieces and the gaps between them need the room, and nothing has to be *reached* out here,
 * only run past. The three widest pieces together are what sets the inset: they just fit.
 */
export const LANE = { x0: SAFE.x0 + 14, x1: SAFE.x1 - 14 };

/* ------------------------------------------------------------------- frozen */

/**
 * In the snowfield, or on a snowy day anywhere, the wet pieces freeze: the paddling pool is an
 * ice rink to skate across, the sprinkler throws snowflakes, and the leaf pile is a snow pile.
 * Same piece, same price, same place in the course — only how it looks and how it is run.
 */
export const isFrozen = ({ biome, weather } = {}) => biome === 'snowfield' || weather === 'snow';

/** What freezing changes, piece by piece: the move it is run with, and any sound swapped. */
export const FROZEN = {
  pool: { move: 'skate' },
  sprinkler: { sounds: { hiss: 'brr' } },
  leaves: {},
};

/**
 * The course laid out: each piece's centre and its entry and exit, left to right in running
 * order, with whatever the pieces leave of the lane shared out evenly before, between and after
 * them. Derived, never stored — the same three ids give the same course on every device.
 */
export function courseLayout(ids, lane = LANE, { frozen = false } = {}) {
  const owned = sanitizeCourse(ids);
  const order = [...owned.filter((id) => !FINALE.has(id)), ...owned.filter((id) => FINALE.has(id))];
  const pieces = order.map((id) => obstacleById.get(id));
  const used = pieces.reduce((sum, entry) => sum + entry.span, 0);
  const gap = Math.max(0, (lane.x1 - lane.x0 - used) / (pieces.length + 1));
  let x = lane.x0 + gap;
  const placed = pieces.map((entry) => {
    const ice = frozen && Object.hasOwn(FROZEN, entry.id) ? FROZEN[entry.id] : null;
    const at = {
      id: entry.id,
      move: ice?.move ?? entry.move,
      span: entry.span,
      frozen: Boolean(ice),
      sounds: ice?.sounds ?? {},
      x0: x,
      x: x + entry.span / 2,
      x1: x + entry.span,
    };
    x += entry.span + gap;
    return at;
  });
  return { start: lane.x0, finish: lane.x1, pieces: placed };
}

/* -------------------------------------------------------------------- moves */

// A pose is where the pet is partway through an obstacle, measured from the obstacle's entry:
//   dx    how far along it has come, 0 at the entry and `span` at the exit
//   lift  how far above the walk line its feet are
//   rot   lean in degrees, positive tipping forward (the run always goes left to right)
//   sx/sy squash and stretch, about the feet
//   hide  out of sight — inside the tunnel
//   part  how far the obstacle's own moving part has gone: the seesaw's tilt in degrees, the
//         trampoline mat's sag from 0 to 1, the poles' wobble, the tyre's swing. What it means
//         is the piece's own business; course-parts.js turns it into a transform
//   at    (the rope bridge only) where along the deck it is pressed, when that is not simply
//         under the pet — which it is not once the pet has been thrown off
//
// Every move starts and ends standing on the ground, level and the right shape, so a run can go
// straight from one to the next. tests/ holds every one of them to that.

const unit = (k) => Math.max(0, Math.min(1, k));
const arc = (k) => Math.sin(Math.PI * unit(k));
/** How far through the stretch from a to b progress k has got, 0..1. */
const seg = (k, a, b) => unit((k - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);

const pose = (over = {}) => ({ dx: 0, lift: 0, rot: 0, sx: 1, sy: 1, hide: false, part: 0, ...over });

/**
 * A move made of phases played one after another, each with its own length, its own pose over
 * its own 0..1 and its own cues — which is how most of the longer moves and every flub read
 * best: hop up, sit, count, hop down. Comes back in the same shape as any other move.
 */
function timeline(steps) {
  const ms = steps.reduce((sum, step) => sum + step.ms, 0);
  const cues = [];
  let from = 0;
  for (const step of steps) {
    for (const cue of step.cues ?? []) cues.push({ ...cue, at: (from + cue.at * step.ms) / ms });
    from += step.ms;
  }
  return {
    ms,
    cues,
    pose: (k, span) => {
      let left = unit(k) * ms;
      for (const step of steps) {
        if (left <= step.ms || step === steps[steps.length - 1]) return step.pose(unit(left / step.ms), span);
        left -= step.ms;
      }
      return pose();
    },
  };
}

/** Back to the entry from wherever a flub went wrong, head over heels. */
const tumbleBack = (from, t, over = {}) => {
  const e = smooth(t);
  return pose({ dx: from.dx * (1 - e), lift: from.lift * (1 - e) + arc(t) * 6, rot: -40 * Math.sin(Math.PI * t), ...over });
};

/** Picking itself up afterwards: a wobble and a shake, ending level and the right shape. */
const shakeOff = (t, over = {}) => pose({ rot: 8 * Math.sin(t * 6 * Math.PI) * (1 - t), sy: 1 - 0.08 * arc(unit(t * 2)), ...over });

/** The seesaw's tilt either way: its plank, 30 long and pivoted 6 up, reaches the ground at each end. */
export const SEESAW_TILT = (Math.asin(6 / 15) * 180) / Math.PI;

/** How high the trampoline mat and the balance beam stand, so the pet's feet meet them. */
const MAT = 6;
const BEAM = 7;
const SLIDE_TOP = 20;
const RAMP_TOP = 13;
/** The pause table's top, the A-frame's peak, and how far the tyre swings when it is brushed. */
export const TABLE_TOP = 9;
export const PEAK = 14;
const TYRE_SWING = 16;

/**
 * The rope bridge: its deck hangs between posts BRIDGE.half either side of the middle, BRIDGE.y
 * up at the ends and sagging BRIDGE.sag more in the middle under its own weight. A pet on it
 * pulls it down further still, most right under its feet.
 */
export const BRIDGE = { half: 12, y: 8, sag: 1.2 };
/** How far below its resting line the deck is pressed at `u`, with a pet `depth` deep at `at`. */
export function deckDip(u, at, depth) {
  const a = Math.max(-BRIDGE.half + 0.5, Math.min(BRIDGE.half - 0.5, at));
  const tent = u <= a ? (u + BRIDGE.half) / (a + BRIDGE.half) : (BRIDGE.half - u) / (BRIDGE.half - a);
  return depth * unit(tent);
}
/** Where the deck is, unladen, `u` along from the middle. */
const deckRest = (u) => BRIDGE.y - BRIDGE.sag * (1 - (u / BRIDGE.half) ** 2);
/** How deep a pet presses the deck where it stands — nothing at the posts, most in the middle. */
const press = (at, bounce) => bounce * unit(1 - (at / BRIDGE.half) ** 2);

/** The log: how big it is, and where it lies before and after a roll (its centre, from the middle). */
export const LOG = { r: 5.5, from: -8, to: 8 };

/** The hamster wheel: its centre's height, and how far in from its rim a pet's feet are. */
export const WHEEL = { y: 15, r: 13, feet: 11.4 };
/** Turning is in degrees, and only ever matters modulo a whole turn. */
const turn = (deg) => {
  const d = ((deg % 360) + 360) % 360;
  return d > 180 ? d - 360 : d;
};

/** How high the leaf pile is heaped, and the paddling pool's inflatable rim. */
export const PILE = 8;
export const POOL_RIM = 7;
/** How far the oscillating sprinkler sweeps either way. */
const SWEEP = 32;

/**
 * The bell: the pad the pet stomps on and the post the puck flies up, from the middle — far
 * enough apart that the puck is not hidden behind the pet — and how far up it flies.
 */
export const STRIKER = { pad: -5, post: 8, rise: 29 };

/** The giant ball, like the log only bigger and much harder to stay on. */
export const BALL = { r: 7, from: -7, to: 7 };

/**
 * The zipline: its cable, from the top of the tall post down to the short one, and the handle
 * hanging HANDLE below it. A pet hanging on tucks its legs up, which is what TUCK is: how tall it
 * is from the handle to its feet. Where it runs from and to, as a share of the way along.
 */
export const CABLE = { x0: -13, y0: -39, x1: 13, y1: -30 };
export const HANDLE = 3;
const TUCK = 25;
export const TROLLEY = { from: -11, to: 11 };
export const cableY = (u) => CABLE.y0 + ((CABLE.y1 - CABLE.y0) * (u - CABLE.x0)) / (CABLE.x1 - CABLE.x0);
const zipLift = (u) => Math.max(0, -cableY(u) - HANDLE - TUCK);

/** The cannon: where its mouth is, from the middle, and how high; and how high the breech is. */
export const MUZZLE = { u: -5, y: 12 };
const BREECH = 6;
/** Where the landing target is, from the middle. */
export const TARGET = 10;

/** The monkey bars: how high a hanging pet's feet are, and where the rungs are from the middle. */
export const HANG = 9;
export const RUNGS = [-10, -5, 0, 5, 10];

/**
 * Each move: how long it takes, its pose at progress `k` (0..1) across an obstacle `span` wide,
 * and its cues — the moments a sound plays, a word pops up over the pet (`say`), or the scene
 * adds something (`land` for a splash in the rain, `balls` for the ball pit spraying, `rustle`
 * for the tunnel shaking). A move may carry its own `flub`, in exactly the same shape: what
 * going wrong on that piece looks like. One without falls back to the general tumble below.
 */
export const MOVES = {
  jump: {
    ms: 640,
    cues: [{ at: 0, sound: 'hop' }, { at: 1, fx: 'land' }],
    pose: (k, span) => pose({ dx: span * k, lift: arc(k) * 20, rot: -12 * Math.sin(2 * Math.PI * k), sx: 1 - 0.06 * arc(k), sy: 1 + 0.08 * arc(k) }),
  },

  leap: {
    ms: 760,
    cues: [{ at: 0, sound: 'hop' }, { at: 0.5, sound: 'ding' }, { at: 1, fx: 'land' }],
    pose: (k, span) => pose({ dx: span * k, lift: arc(k) * 13, rot: -10 * Math.sin(2 * Math.PI * k), sx: 1 + 0.1 * arc(k), sy: 1 - 0.1 * arc(k) }),
  },

  hop: {
    ms: 1300,
    // Four hops: three stones across the puddle, and off the far side.
    cues: [0, 0.25, 0.5, 0.75]
      .map((at) => ({ at, sound: 'hop', fx: at ? 'land' : undefined }))
      .concat([{ at: 1, fx: 'land' }]),
    pose: (k, span) => {
      const bounce = Math.abs(Math.sin(4 * Math.PI * unit(k)));
      return pose({ dx: span * k, lift: bounce * 9, sy: 1 + 0.05 * bounce, sx: 1 - 0.04 * bounce });
    },
  },

  crawl: {
    ms: 1600,
    cues: [{ at: 0.12, sound: 'rustle' }, { at: 0.5, sound: 'rustle', fx: 'rustle' }, { at: 0.86, sound: 'hop' }, { at: 1, fx: 'land' }],
    pose: (k, span) => {
      if (k < 0.18) return pose({ dx: span * k, sy: 1 - 0.4 * smooth(seg(k, 0, 0.18)), sx: 1 + 0.12 * seg(k, 0, 0.18) });
      if (k < 0.82) return pose({ dx: span * k, sy: 0.6, sx: 1.12, hide: true, part: Math.sin(k * 40) });
      const t = seg(k, 0.82, 1);
      return pose({ dx: span * k, lift: arc(t) * 6, sy: 0.6 + 0.4 * smooth(t), sx: 1.12 - 0.12 * smooth(t) });
    },
  },

  weave: {
    ms: 1500,
    // Four poles, at the eighths, passed on alternate sides — so the lean is greatest at each
    // pole and goes the other way at the next.
    cues: [0.125, 0.375, 0.625, 0.875].map((at) => ({ at, sound: 'tick' })),
    pose: (k, span) => {
      const wave = Math.sin(4 * Math.PI * unit(k));
      return pose({ dx: span * k, lift: 1.5 * Math.abs(wave), rot: 10 * wave, part: wave });
    },
  },

  climb: {
    ms: 1300,
    cues: [{ at: 0.7, sound: 'hop' }, { at: 1, fx: 'land' }],
    pose: (k, span) => {
      // Up the slope from 2 in to 20 in, a breath at the top, and off the high end.
      const up = { from: 2, to: 20 };
      if (k < 0.6) {
        const dx = up.to * seg(k, 0, 0.6);
        const along = unit((dx - up.from) / (up.to - up.from));
        return pose({ dx, lift: RAMP_TOP * along, rot: along > 0 && along < 1 ? -18 : 0 });
      }
      if (k < 0.7) return pose({ dx: up.to, lift: RAMP_TOP, sy: 1 - 0.06 * arc(seg(k, 0.6, 0.7)) });
      const t = seg(k, 0.7, 1);
      return pose({ dx: up.to + (span - up.to) * t, lift: RAMP_TOP * (1 - t) + arc(t) * 8, rot: 14 * Math.sin(Math.PI * t) });
    },
  },

  balance: {
    ms: 1900,
    cues: [{ at: 0, sound: 'hop' }, { at: 0.85, sound: 'hop' }, { at: 1, fx: 'land' }],
    pose: (k, span) => {
      if (k < 0.15) {
        const t = seg(k, 0, 0.15);
        return pose({ dx: 6 * t, lift: BEAM * t + arc(t) * 5 });
      }
      if (k < 0.85) {
        const t = seg(k, 0.15, 0.85);
        return pose({ dx: 6 + (span - 12) * t, lift: BEAM, rot: 7 * Math.sin(t * 4 * Math.PI) });
      }
      const t = seg(k, 0.85, 1);
      return pose({ dx: span - 6 + 6 * t, lift: BEAM * (1 - t) + arc(t) * 5 });
    },
  },

  tip: {
    ms: 1900,
    cues: [{ at: 0.47, sound: 'creak' }],
    pose: (k, span) => {
      // The plank is pivoted at its middle, 6 up, and starts with its left end down.
      const half = span / 2;
      // A negative tilt has the left end down, which is how it is left between runs.
      const heightAt = (dx, tilt) => 6 - (dx - half) * Math.sin((tilt * Math.PI) / 180);
      if (k < 0.45) {
        const dx = half * seg(k, 0, 0.45);
        // Leaning into the climb over the first step, not all at once.
        const rot = -SEESAW_TILT * seg(k, 0, 0.08);
        return pose({ dx, lift: Math.max(0, heightAt(dx, -SEESAW_TILT)), rot, part: -SEESAW_TILT });
      }
      if (k < 0.6) {
        const tilt = -SEESAW_TILT + 2 * SEESAW_TILT * smooth(seg(k, 0.45, 0.6));
        return pose({ dx: half, lift: 6, rot: tilt, part: tilt });
      }
      const dx = half + half * seg(k, 0.6, 1);
      // Level again for the last step off the end.
      const rot = k > 0.95 ? SEESAW_TILT * (1 - seg(k, 0.95, 1)) : SEESAW_TILT;
      return pose({ dx, lift: Math.max(0, heightAt(dx, SEESAW_TILT)), rot, part: SEESAW_TILT });
    },
  },

  bounce: {
    ms: 2400,
    cues: [0.15, 0.15 + 0.7 / 3, 0.15 + 1.4 / 3].map((at) => ({ at, sound: 'boing' })).concat([{ at: 1, fx: 'land' }]),
    pose: (k, span) => {
      const half = span / 2;
      if (k < 0.15) {
        const t = seg(k, 0, 0.15);
        return pose({ dx: half * t, lift: MAT * t + arc(t) * 8 });
      }
      if (k < 0.85) {
        // Three bounces on the middle of the mat, each higher, the last one a somersault.
        const t = seg(k, 0.15, 0.85) * 3;
        const n = Math.min(2, Math.floor(t));
        const u = t - n;
        const height = [12, 20, 30][n];
        const sag = Math.max(0, 1 - arc(u) * 5);
        return pose({
          dx: half,
          lift: MAT + arc(u) * height - sag * 2,
          rot: n === 2 ? 360 * smooth(u) : 0,
          sy: 1 - 0.14 * sag + 0.06 * arc(u),
          sx: 1 + 0.1 * sag,
          part: sag,
        });
      }
      const t = seg(k, 0.85, 1);
      return pose({ dx: half + half * t, lift: MAT * (1 - t) + arc(t) * 10 });
    },
  },

  slide: {
    ms: 2100,
    cues: [{ at: 0.42, sound: 'whoosh' }, { at: 1, fx: 'land' }],
    pose: (k, span) => {
      // Up the ladder at the near end, sit at the top, and down the curve to the ground.
      if (k < 0.3) {
        const t = seg(k, 0, 0.3);
        return pose({ dx: 6 * t, lift: SLIDE_TOP * t - 1.2 * Math.abs(Math.sin(4 * Math.PI * t)) });
      }
      if (k < 0.42) return pose({ dx: 6 + 2 * seg(k, 0.3, 0.42), lift: SLIDE_TOP, sy: 0.94, sx: 1.04 });
      if (k < 0.9) {
        const t = seg(k, 0.42, 0.9);
        return pose({ dx: 8 + 20 * t, lift: SLIDE_TOP * (1 - t) ** 2, rot: 30 * (1 - t), sy: 0.94, sx: 1.04 });
      }
      const t = seg(k, 0.9, 1);
      return pose({ dx: 28 + (span - 28) * t, lift: arc(t) * 3, sy: 0.94 + 0.06 * t, sx: 1.04 - 0.04 * t });
    },
  },

  dive: {
    ms: 2300,
    cues: [{ at: 0, sound: 'hop' }, { at: 0.25, sound: 'plop', fx: 'balls' }, { at: 0.65, sound: 'plop', fx: 'balls' }, { at: 1, fx: 'land' }],
    pose: (k, span) => {
      const half = span / 2;
      if (k < 0.25) {
        const t = seg(k, 0, 0.25);
        return pose({ dx: half * t, lift: arc(t) * 18, rot: 20 * Math.sin(Math.PI * t) });
      }
      if (k < 0.65) {
        // In up to its middle, having a wriggle among the balls.
        const t = seg(k, 0.25, 0.65);
        return pose({ dx: half, lift: 1.2 * Math.abs(Math.sin(t * 6 * Math.PI)), rot: 8 * Math.sin(t * 5 * Math.PI) * (1 - t) });
      }
      const t = seg(k, 0.65, 1);
      return pose({ dx: half + half * t, lift: arc(t) * 18, rot: -10 * Math.sin(Math.PI * t) });
    },
  },

  duck: {
    // Down low, leaning back, shuffle under the bar, and spring up the far side. `part` is the
    // bar itself: 0 up on its pegs, 1 knocked down to the ground.
    ...timeline([
      {
        ms: 380,
        pose: (t, span) => pose({ dx: span * 0.2 * t, sy: 1 - 0.55 * smooth(t), sx: 1 + 0.2 * smooth(t), rot: -16 * smooth(t) }),
      },
      {
        ms: 900,
        cues: [{ at: 0.1, sound: 'rustle' }, { at: 0.6, sound: 'rustle' }],
        pose: (t, span) => {
          const step = Math.abs(Math.sin(6 * Math.PI * t));
          return pose({ dx: span * (0.2 + 0.6 * t), sy: 0.45 + 0.04 * step, sx: 1.2, rot: -16 + 4 * Math.sin(6 * Math.PI * t) });
        },
      },
      {
        ms: 380,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, fx: 'land' }],
        pose: (t, span) => {
          const e = smooth(t);
          return pose({ dx: span * (0.8 + 0.2 * t), lift: arc(t) * 6, sy: 0.45 + 0.55 * e, sx: 1.2 - 0.2 * e, rot: -16 * (1 - e) });
        },
      },
    ]),
    flub: timeline([
      {
        // Not low enough. Its head finds the bar.
        ms: 380,
        cues: [{ at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: span * 0.2 * t, sy: 1 - 0.2 * smooth(t), sx: 1 + 0.06 * smooth(t), rot: -6 * smooth(t) }),
      },
      {
        // The bar clatters off its pegs, and the pet sits down hard where it started.
        ms: 480,
        cues: [{ at: 0.2, sound: 'rustle' }, { at: 1, fx: 'land' }],
        pose: (t, span) => tumbleBack({ dx: span * 0.2, lift: 0 }, t, { part: smooth(unit(t * 2.5)) }),
      },
      {
        // A shake, and the bar springs back up for another go.
        ms: 760,
        cues: [{ at: 0.6, sound: 'boing' }],
        pose: (t) => shakeOff(unit(t / 0.55), { part: 1 - smooth(seg(t, 0.6, 0.9)) }),
      },
    ]),
  },

  pause: {
    // Up onto the table, sit for three, and off. The count is the scene's to say out loud.
    ...timeline([
      {
        ms: 420,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: (span / 2) * t, lift: TABLE_TOP * smooth(t) + arc(t) * 8, sy: 1 + 0.06 * arc(t), sx: 1 - 0.05 * arc(t) }),
      },
      {
        ms: 1650,
        cues: ['3', '2', '1'].map((say, i) => ({ at: 0.04 + i / 3, sound: 'tick', say })),
        pose: (t, span) => {
          // Sat down, a little bounce on each number.
          const beat = (t * 3) % 1;
          const sit = smooth(seg(t, 0, 0.08)) * (1 - smooth(seg(t, 0.94, 1)));
          return pose({ dx: span / 2, lift: TABLE_TOP + 1.6 * arc(unit(beat / 0.3)) * sit, sy: 1 - 0.1 * sit, sx: 1 + 0.06 * sit });
        },
      },
      {
        ms: 460,
        cues: [{ at: 0, sound: 'ding' }, { at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span / 2 + (span / 2) * t, lift: TABLE_TOP * (1 - smooth(t)) + arc(t) * 8 }),
      },
    ]),
    flub: timeline([
      {
        // Short. It meets the table's edge instead of its top.
        ms: 360,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: span * 0.25 * t, lift: 7 * Math.sin(0.75 * Math.PI * t), rot: 8 * t }),
      },
      {
        ms: 460,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => tumbleBack({ dx: span * 0.25, lift: 7 * Math.sin(0.75 * Math.PI) }, t, { rot: 8 * (1 - t) - 40 * Math.sin(Math.PI * t) }),
      },
      { ms: 700, pose: (t) => shakeOff(t) },
    ]),
  },

  tyre: {
    // Through the tyre, like the hoop — but this one hangs, so it swings on after.
    ms: 760,
    cues: [{ at: 0, sound: 'hop' }, { at: 0.5, sound: 'boing' }, { at: 1, fx: 'land' }],
    pose: (k, span) => {
      const after = seg(k, 0.5, 1);
      return pose({
        dx: span * k,
        lift: arc(k) * 13,
        rot: -10 * Math.sin(2 * Math.PI * k),
        sx: 1 + 0.1 * arc(k),
        sy: 1 - 0.1 * arc(k),
        // Pushed the way it went, then back and forth, dying away.
        part: k < 0.5 ? 0 : -TYRE_SWING * Math.sin(3 * Math.PI * after) * (1 - after),
      });
    },
    flub: timeline([
      {
        // Mid-takeoff, the tyre — still swinging from someone — comes back the other way.
        ms: 300,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: span * 0.3 * t, lift: arc(0.3 * t) * 13, part: TYRE_SWING * 1.2 * smooth(t) }),
      },
      {
        ms: 520,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) =>
          tumbleBack({ dx: span * 0.3, lift: arc(0.3) * 13 }, t, { part: TYRE_SWING * 1.2 * Math.cos(2 * Math.PI * t) * (1 - smooth(t)) }),
      },
      { ms: 700, pose: (t) => shakeOff(t) },
    ]),
  },

  scramble: {
    // Up one steep side of the A, a look round at the top, and down the other on its tummy.
    // The slopes run from 1 in from each end up to the peak at the middle.
    ...timeline([
      {
        ms: 1000,
        cues: [{ at: 0, sound: 'hop' }, { at: 0.45, sound: 'rustle' }],
        pose: (t, span) => {
          const dx = (span / 2) * t;
          const lean = smooth(seg(t, 0, 0.12)) * (1 - smooth(seg(t, 0.85, 1)));
          return pose({ dx, lift: PEAK * unit((dx - 1) / (span / 2 - 1)) + 1.2 * Math.abs(Math.sin(5 * Math.PI * t)), rot: -26 * lean });
        },
      },
      {
        ms: 380,
        pose: (t, span) => pose({ dx: span / 2, lift: PEAK, sy: 1 - 0.06 * arc(t), sx: 1 + 0.04 * arc(t) }),
      },
      {
        ms: 520,
        cues: [{ at: 0, sound: 'whoosh' }],
        pose: (t, span) => {
          const along = t * t;
          const e = smooth(seg(t, 0, 0.15));
          return pose({ dx: span / 2 + (span / 2 - 1) * along, lift: PEAK * (1 - along), rot: 30 * e, sy: 1 - 0.08 * e, sx: 1 + 0.06 * e });
        },
      },
      {
        ms: 260,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const e = smooth(t);
          return pose({ dx: span - 1 + t, lift: arc(t) * 4, rot: 30 * (1 - e), sy: 0.92 + 0.08 * e, sx: 1.06 - 0.06 * e });
        },
      },
    ]),
    flub: timeline([
      {
        // Halfway up, its feet go.
        ms: 620,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => {
          const dx = (span / 4) * t;
          return pose({ dx, lift: PEAK * unit((dx - 1) / (span / 2 - 1)) + Math.abs(Math.sin(3 * Math.PI * t)), rot: -26 * smooth(seg(t, 0, 0.2)) });
        },
      },
      {
        // And down it comes again, backwards, on its tummy.
        ms: 560,
        cues: [{ at: 0.1, sound: 'whoosh' }, { at: 1, fx: 'land' }],
        pose: (t, span) => {
          const dx = (span / 4) * (1 - t * t);
          const up = 1 - smooth(seg(t, 0.75, 1));
          return pose({ dx, lift: PEAK * unit((dx - 1) / (span / 2 - 1)), rot: -26 * up, sy: 1 - 0.1 * up, sx: 1 + 0.06 * up });
        },
      },
      { ms: 700, pose: (t) => shakeOff(t) },
    ]),
  },

  wobble: {
    // Up onto the rope bridge, across it as it dips and bounces underfoot, and off. `part` is how
    // far the deck is pressed down right under the pet; the rig works out the rest of it.
    ...timeline([
      {
        ms: 320,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => {
          const at = -BRIDGE.half + 1;
          const depth = press(at, 2) * smooth(t);
          return pose({ dx: (span / 2 + at) * t, lift: (deckRest(at) - depth) * smooth(t) + arc(t) * 5, part: depth });
        },
      },
      {
        ms: 1700,
        cues: [{ at: 0.15, sound: 'creak' }, { at: 0.55, sound: 'creak' }],
        pose: (t, span) => {
          const at = -BRIDGE.half + 1 + (2 * BRIDGE.half - 2) * t;
          const depth = press(at, 2 + 0.9 * Math.sin(8 * Math.PI * t));
          return pose({ dx: span / 2 + at, lift: deckRest(at) - depth, rot: 6 * Math.sin(5 * Math.PI * t), part: depth });
        },
      },
      {
        ms: 320,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const at = BRIDGE.half - 1;
          const depth = press(at, 2) * (1 - smooth(t));
          return pose({ dx: span / 2 + at + (span / 2 - at) * t, lift: (deckRest(at) - depth) * (1 - smooth(t)) + arc(t) * 5, part: depth });
        },
      },
    ]),
    flub: timeline([
      {
        ms: 320,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => {
          const at = -BRIDGE.half + 1;
          const depth = press(at, 2) * smooth(t);
          return pose({ dx: (span / 2 + at) * t, lift: (deckRest(at) - depth) * smooth(t) + arc(t) * 5, part: depth });
        },
      },
      {
        // Too bouncy. Each bounce bigger than the last, until the deck throws it.
        ms: 640,
        cues: [{ at: 0.3, sound: 'creak' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => {
          const at = -BRIDGE.half + 1 + 5 * t;
          const depth = press(at, 2 + 2.6 * t * Math.abs(Math.sin(3.5 * Math.PI * t)));
          return pose({ dx: span / 2 + at, lift: deckRest(at) - depth, rot: -10 * t * Math.sin(5 * Math.PI * t), part: depth });
        },
      },
      {
        ms: 560,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const at = -BRIDGE.half + 6;
          const thrown = press(at, 2 + 2.6 * Math.abs(Math.sin(3.5 * Math.PI)));
          const from = { dx: span / 2 + at, lift: deckRest(at) - thrown };
          // Flung off backwards, and the deck bouncing on without it, where it was, until it settles.
          const depth = thrown * Math.cos(3 * Math.PI * t) * (1 - smooth(t));
          return tumbleBack(from, t, { lift: from.lift * (1 - smooth(t)) + arc(t) * 10, part: depth, at });
        },
      },
      { ms: 700, pose: (t) => shakeOff(t) },
    ]),
  },

  logroll: {
    // Up onto the log, and run along on top of it as it rolls across, then off the far side.
    // `part` is where the log's centre is, from the middle of the piece.
    ...timeline([
      {
        ms: 360,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: (span / 2 + LOG.from) * t, lift: 2 * LOG.r * smooth(t) + arc(t) * 6, part: LOG.from }),
      },
      {
        ms: 1400,
        cues: [{ at: 0.1, sound: 'rustle' }, { at: 0.5, sound: 'rustle' }],
        pose: (t, span) => {
          const u = LOG.from + (LOG.to - LOG.from) * smooth(t);
          const stride = Math.sin(10 * Math.PI * t);
          return pose({ dx: span / 2 + u, lift: 2 * LOG.r + 0.8 * Math.abs(stride), rot: 5 * stride, part: u });
        },
      },
      {
        ms: 360,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span / 2 + LOG.to + (span / 2 - LOG.to) * t, lift: 2 * LOG.r * (1 - smooth(t)) + arc(t) * 6, part: LOG.to }),
      },
    ]),
    flub: timeline([
      {
        ms: 360,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: (span / 2 + LOG.from) * t, lift: 2 * LOG.r * smooth(t) + arc(t) * 6, part: LOG.from }),
      },
      {
        ms: 480,
        cues: [{ at: 0.2, sound: 'rustle' }],
        pose: (t, span) => {
          const u = LOG.from + 5 * smooth(t);
          return pose({ dx: span / 2 + u, lift: 2 * LOG.r + 0.8 * Math.abs(Math.sin(6 * Math.PI * t)), rot: 5 * Math.sin(6 * Math.PI * t), part: u });
        },
      },
      {
        // The log changes its mind and rolls back. Arms going like windmills.
        ms: 380,
        cues: [{ at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => {
          const u = LOG.from + 5 - 2 * smooth(t);
          return pose({ dx: span / 2 + u, lift: 2 * LOG.r, rot: -22 * smooth(t) + 8 * Math.sin(8 * Math.PI * t), part: u });
        },
      },
      {
        ms: 500,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const u = LOG.from + 3;
          return tumbleBack({ dx: span / 2 + u, lift: 2 * LOG.r }, t, { rot: -22 - 30 * Math.sin(Math.PI * t) + 22 * smooth(t), part: u - 3 * smooth(t) });
        },
      },
      { ms: 700, pose: (t) => shakeOff(t, { part: LOG.from }) },
    ]),
  },

  spin: {
    // Into the wheel, run like anything while it spins, and hop out. `part` is the wheel's turn.
    ...timeline([
      {
        ms: 400,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: (span / 2) * t, lift: (WHEEL.y - WHEEL.feet) * smooth(t) + arc(t) * 7 }),
      },
      {
        ms: 1600,
        cues: [0.15, 0.45, 0.75].map((at) => ({ at, sound: 'squeak' })),
        pose: (t, span) => {
          const stride = Math.sin(14 * Math.PI * t);
          const lean = smooth(seg(t, 0, 0.15)) * (1 - smooth(seg(t, 0.85, 1)));
          return pose({ dx: span / 2, lift: WHEEL.y - WHEEL.feet + 0.8 * Math.abs(stride), rot: 12 * lean + 4 * stride * lean, part: turn(-500 * t * t) });
        },
      },
      {
        ms: 420,
        cues: [{ at: 1, fx: 'land' }],
        // Out, and the wheel coasting on to a stop.
        pose: (t, span) =>
          pose({ dx: (span / 2) * (1 + t), lift: (WHEEL.y - WHEEL.feet) * (1 - smooth(t)) + arc(t) * 8, part: turn(-500 - 120 * Math.sin((Math.PI / 2) * t)) }),
      },
    ]),
    flub: timeline([
      {
        ms: 400,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: (span / 2) * t, lift: (WHEEL.y - WHEEL.feet) * smooth(t) + arc(t) * 7 }),
      },
      {
        // Too fast: the wheel carries it up and round the back.
        ms: 720,
        cues: [{ at: 0.2, sound: 'squeak' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => {
          const angle = 110 * t * t;
          const rad = (angle * Math.PI) / 180;
          return pose({
            dx: span / 2 - WHEEL.feet * Math.sin(rad),
            lift: WHEEL.y - WHEEL.feet * Math.cos(rad),
            rot: -angle,
            part: turn(-300 * t * t),
          });
        },
      },
      {
        // And flings it out the way it came in, the wheel spinning down to a stop.
        ms: 560,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const rad = (110 * Math.PI) / 180;
          const from = { dx: span / 2 - WHEEL.feet * Math.sin(rad), lift: WHEEL.y - WHEEL.feet * Math.cos(rad) };
          return tumbleBack(from, t, { rot: -110 * (1 - smooth(t)) - 360 * smooth(t), part: turn(-300 - 60 * smooth(t)) });
        },
      },
      // Dizzy: a long slow wobble rather than a quick shake.
      { ms: 900, pose: (t) => pose({ rot: 12 * Math.sin(t * 4 * Math.PI) * (1 - t), sx: 1 + 0.05 * Math.sin(t * 6 * Math.PI) * (1 - t) }) },
    ]),
  },

  hang: {
    // Jump up to the first rung, swing hand over hand along them, and drop off the end.
    ...timeline([
      {
        ms: 380,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: (span / 2 + RUNGS[0]) * t, lift: HANG * smooth(t) + arc(t) * 5, sy: 1 - 0.12 * smooth(t) }),
      },
      {
        ms: 1600,
        cues: RUNGS.slice(1).map((_, i) => ({ at: (i + 1) / (RUNGS.length - 1), sound: 'tick' })),
        pose: (t, span) => {
          const swings = RUNGS.length - 1;
          const local = (t * swings) % 1;
          const reach = RUNGS[0] + (RUNGS[RUNGS.length - 1] - RUNGS[0]) * t;
          return pose({ dx: span / 2 + reach, lift: HANG - 1.6 * arc(local), rot: 12 * Math.sin(2 * Math.PI * local), sy: 0.88, sx: 1.04 });
        },
      },
      {
        ms: 380,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const from = span / 2 + RUNGS[RUNGS.length - 1];
          return pose({ dx: from + (span - from) * t, lift: HANG * (1 - t * t), sy: 0.88 + 0.12 * smooth(t), sx: 1.04 - 0.04 * smooth(t) });
        },
      },
    ]),
    flub: timeline([
      {
        ms: 380,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: (span / 2 + RUNGS[0]) * t, lift: HANG * smooth(t) + arc(t) * 5, sy: 1 - 0.12 * smooth(t) }),
      },
      {
        // One swing, a dangle by a single paw, and its grip goes.
        ms: 760,
        cues: [{ at: 0.45, sound: 'tick' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => {
          const swing = unit(t / 0.5);
          const dangle = seg(t, 0.5, 1);
          return pose({
            dx: span / 2 + RUNGS[0] + (RUNGS[1] - RUNGS[0]) * swing,
            lift: HANG - 1.6 * arc(swing),
            rot: t < 0.5 ? 12 * Math.sin(2 * Math.PI * swing) : 14 * Math.sin(4 * Math.PI * dangle) * dangle,
            sy: 0.88,
            sx: 1.04,
          });
        },
      },
      {
        // Down it drops, and trudges back to the start.
        ms: 300,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span / 2 + RUNGS[1], lift: HANG * (1 - t * t), sy: 0.88 - 0.1 * t, sx: 1.04 + 0.08 * t }),
      },
      {
        ms: 520,
        pose: (t, span) => {
          const e = smooth(t);
          return pose({ dx: (span / 2 + RUNGS[1]) * (1 - e), lift: 1.2 * Math.abs(Math.sin(4 * Math.PI * t)), sy: 0.78 + 0.22 * e, sx: 1.12 - 0.12 * e });
        },
      },
      { ms: 600, pose: (t) => shakeOff(t) },
    ]),
  },

  dash: {
    // Straight through the sprinkler, scrunched up against the wet, and a shake dry the far side.
    // `part` is the sprinkler's sweep, back and forth all the while.
    ...timeline([
      {
        ms: 1000,
        cues: [{ at: 0, sound: 'hiss' }, { at: 0.38, fx: 'spray' }, { at: 0.62, fx: 'spray' }],
        pose: (t, span) => {
          const wet = smooth(seg(t, 0.25, 0.4)) * (1 - smooth(seg(t, 0.65, 0.8)));
          return pose({
            dx: span * t,
            lift: 2.4 * Math.abs(Math.sin(3 * Math.PI * t)),
            rot: -7 * wet,
            sy: 1 - 0.12 * wet,
            sx: 1 + 0.06 * wet,
            part: SWEEP * Math.sin(3 * Math.PI * t),
          });
        },
      },
      {
        ms: 420,
        cues: [{ at: 0.1, fx: 'drip' }],
        pose: (t, span) => pose({ dx: span, sx: 1 + 0.1 * Math.sin(8 * Math.PI * t) * (1 - t), rot: 5 * Math.sin(8 * Math.PI * t) * (1 - t) }),
      },
    ]),
    flub: timeline([
      {
        // Right in the face.
        ms: 420,
        cues: [{ at: 0, sound: 'hiss' }, { at: 1, sound: 'splash', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: span * 0.25 * t, lift: 2.4 * Math.abs(Math.sin(2 * Math.PI * t)), part: -SWEEP * smooth(t) }),
      },
      {
        // Spluttering, back it goes, and the sprinkler sweeps on round.
        ms: 560,
        cues: [{ at: 0, fx: 'spray' }],
        pose: (t, span) =>
          pose({
            dx: span * 0.25 * (1 - smooth(t)),
            lift: 2 * Math.abs(Math.sin(3 * Math.PI * t)),
            rot: -12 * Math.sin(5 * Math.PI * t) * (1 - t),
            part: -SWEEP * Math.cos(Math.PI * t / 2),
          }),
      },
      { ms: 700, cues: [{ at: 0.1, fx: 'drip' }], pose: (t) => shakeOff(t, { sx: 1 + 0.1 * Math.sin(8 * Math.PI * t) * (1 - t) }) },
    ]),
  },

  pounce: {
    // A great pounce into the middle of the leaf pile, a rummage, and out the far side.
    ...timeline([
      {
        ms: 460,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'plop', fx: 'leaves' }],
        pose: (t, span) => pose({ dx: (span / 2) * t, lift: arc(t) * 16, rot: 22 * Math.sin(Math.PI * t), sy: 1 + 0.06 * arc(t) }),
      },
      {
        ms: 760,
        cues: [{ at: 0.2, sound: 'rustle' }, { at: 0.6, sound: 'rustle', fx: 'leaves' }],
        pose: (t, span) =>
          pose({ dx: span / 2, lift: 0.8 * Math.abs(Math.sin(5 * Math.PI * t)), rot: 9 * Math.sin(5 * Math.PI * t), sy: 1 - 0.08 * arc(t) }),
      },
      {
        ms: 460,
        cues: [{ at: 0, sound: 'hop', fx: 'leaves' }, { at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: (span / 2) * (1 + t), lift: arc(t) * 12, rot: 14 * Math.sin(Math.PI * t) }),
      },
    ]),
    flub: timeline([
      {
        ms: 460,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'plop', fx: 'leaves' }],
        pose: (t, span) => pose({ dx: (span / 2) * t, lift: arc(t) * 16, rot: 22 * Math.sin(Math.PI * t), sy: 1 + 0.06 * arc(t) }),
      },
      {
        // Down, and down, and gone.
        ms: 520,
        cues: [{ at: 0.6, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: span / 2, sy: 1 - 0.75 * smooth(t), sx: 1 + 0.1 * smooth(t), hide: t > 0.95 }),
      },
      {
        ms: 420,
        cues: [{ at: 0.3, sound: 'rustle', fx: 'leaves' }],
        pose: (t, span) => pose({ dx: span / 2, sy: 0.25, sx: 1.1, hide: true }),
      },
      {
        // Out backwards, wearing some of it.
        ms: 520,
        cues: [{ at: 0, sound: 'hop', fx: 'hat' }, { at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: (span / 2) * (1 - smooth(t)), lift: arc(t) * 12, rot: -24 * Math.sin(Math.PI * t), sy: 0.25 + 0.75 * smooth(unit(t * 2)), sx: 1.1 - 0.1 * smooth(unit(t * 2)) }),
      },
      { ms: 760, pose: (t) => shakeOff(t, { sx: 1 + 0.08 * Math.sin(8 * Math.PI * t) * (1 - t) }) },
    ]),
  },

  bubble: {
    // The machine blows, and the pet bounces along under the bubbles popping them on its nose.
    ms: 1500,
    cues: [{ at: 0, sound: 'hop', fx: 'bubbles' }]
      .concat([1 / 6, 1 / 2, 5 / 6].map((at) => ({ at, sound: 'pop', fx: 'popped' })))
      .concat([{ at: 1, fx: 'land' }]),
    pose: (k, span) => {
      const hop = Math.abs(Math.sin(3 * Math.PI * unit(k)));
      return pose({ dx: span * k, lift: hop * 13, rot: -8 * hop, sy: 1 + 0.08 * hop, sx: 1 - 0.05 * hop });
    },
    flub: timeline([
      {
        // Gazing up at them, it walks straight under one.
        ms: 440,
        cues: [{ at: 0, fx: 'bubbles' }, { at: 0.9, sound: 'pop', fx: 'popped' }],
        pose: (t, span) => pose({ dx: span * 0.25 * t, rot: -12 * smooth(t), lift: 1.2 * Math.abs(Math.sin(2 * Math.PI * t)) }),
      },
      {
        // It tickles. A big build-up, and an enormous sneeze.
        ms: 420,
        cues: [{ at: 0.85, sound: 'hiccup', fx: 'bonk' }],
        pose: (t, span) => {
          const build = smooth(seg(t, 0, 0.8));
          const sneeze = smooth(seg(t, 0.8, 1));
          return pose({ dx: span * 0.25, rot: -12 - 10 * build + 30 * sneeze, sy: 1 + 0.08 * build - 0.12 * sneeze });
        },
      },
      {
        ms: 480,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => tumbleBack({ dx: span * 0.25, lift: 0 }, t, { rot: 8 * (1 - t) - 40 * Math.sin(Math.PI * t), sy: 0.96 + 0.04 * t }),
      },
      { ms: 700, pose: (t) => shakeOff(t) },
    ]),
  },

  flop: {
    // A belly flop into the paddling pool, a paddle across, out over the rim and a good shake.
    ...timeline([
      {
        ms: 480,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'splash', fx: 'bigsplash' }],
        pose: (t, span) => pose({ dx: 0.42 * span * t, lift: arc(t) * 14 + 1.5 * smooth(t), rot: 55 * smooth(t), sy: 1 - 0.1 * smooth(t) }),
      },
      {
        ms: 1000,
        cues: [{ at: 0.4, sound: 'splash', fx: 'spray' }],
        pose: (t, span) =>
          pose({
            dx: span * (0.42 + 0.26 * t),
            lift: 1.5 + 0.8 * Math.sin(4 * Math.PI * t),
            rot: 55 * (1 - smooth(t)) + 5 * Math.sin(6 * Math.PI * t),
            sy: 0.9 + 0.1 * smooth(t),
          }),
      },
      {
        ms: 420,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span * (0.68 + 0.32 * t), lift: 1.5 * (1 - t) + arc(t) * (POOL_RIM + 2) }),
      },
      {
        ms: 380,
        cues: [{ at: 0.1, fx: 'drip' }],
        pose: (t, span) => pose({ dx: span, sx: 1 + 0.12 * Math.sin(8 * Math.PI * t) * (1 - t), rot: 6 * Math.sin(8 * Math.PI * t) * (1 - t) }),
      },
    ]),
    flub: timeline([
      {
        // One toe in, to see.
        ms: 520,
        pose: (t, span) => pose({ dx: span * 0.12 * smooth(seg(t, 0, 0.6)), rot: 16 * smooth(seg(t, 0.5, 1)), sy: 1 - 0.05 * smooth(seg(t, 0.5, 1)) }),
      },
      {
        // Brr.
        ms: 420,
        cues: [{ at: 0, sound: 'brr', fx: 'bonk' }],
        pose: (t, span) =>
          pose({ dx: span * 0.12, rot: 16 * (1 - smooth(t)) + 4 * Math.sin(14 * Math.PI * t), sx: 1 - 0.06 * Math.abs(Math.sin(14 * Math.PI * t)), sy: 0.95 + 0.05 * smooth(t) }),
      },
      {
        ms: 420,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span * 0.12 * (1 - smooth(t)), lift: arc(t) * 6, rot: -10 * Math.sin(Math.PI * t) }),
      },
      { ms: 600, pose: (t) => shakeOff(t) },
    ]),
  },

  skate: {
    // The frozen pool: a step onto the ice, a long glide with a twirl in the middle, and off.
    ...timeline([
      {
        ms: 320,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: 0.15 * span * t, lift: arc(t) * 5 }),
      },
      {
        ms: 1300,
        cues: [{ at: 0, sound: 'whoosh' }, { at: 0.45, sound: 'sparkle' }],
        pose: (t, span) => {
          const spin = seg(t, 0.35, 0.75);
          return pose({
            dx: span * (0.15 + 0.7 * (1 - (1 - t) ** 2)),
            rot: 10 * Math.sin(2 * Math.PI * t) * (1 - spin * (1 - spin) * 4),
            // Turning right round: seen side on, a twirl is the pet going thin and wide again.
            sx: Math.cos(2 * Math.PI * smooth(spin)),
          });
        },
      },
      {
        ms: 320,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span * (0.85 + 0.15 * t), lift: arc(t) * 5 }),
      },
    ]),
    flub: timeline([
      {
        ms: 320,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) => pose({ dx: 0.15 * span * t, lift: arc(t) * 5 }),
      },
      {
        // Its feet go one way and the rest of it the other.
        ms: 560,
        cues: [{ at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: span * (0.15 + 0.2 * t), rot: 14 * Math.sin(5 * Math.PI * t) * (1 - t) - 50 * t * t, lift: 3 * arc(seg(t, 0.6, 1)) }),
      },
      {
        // And off it slides, on its bottom, all the way back.
        ms: 640,
        cues: [{ at: 0, sound: 'whoosh' }, { at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span * 0.35 * (1 - smooth(t)), rot: -50 + 20 * smooth(t), sy: 0.88, sx: 1.06 }),
      },
      {
        ms: 640,
        pose: (t) => pose({ rot: -30 * (1 - smooth(t)) + 6 * Math.sin(6 * Math.PI * t) * (1 - t), sy: 0.88 + 0.12 * smooth(t), sx: 1.06 - 0.06 * smooth(t) }),
      },
    ]),
  },

  ring: {
    // A big jump, a stomp on the pad, and up flies the puck to ring the bell. `part` is how far up
    // the post the puck has got, 0 to 1.
    ...timeline([
      {
        ms: 440,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'boing' }],
        pose: (t, span) => pose({ dx: (span / 2 + STRIKER.pad) * t, lift: arc(t) * 18, sy: 1 + 0.08 * arc(t), sx: 1 - 0.05 * arc(t) }),
      },
      {
        ms: 760,
        cues: [{ at: 0.4, sound: 'clang', fx: 'ring' }],
        pose: (t, span) => {
          const up = t < 0.4 ? 1 - (1 - t / 0.4) ** 2 : 1 - seg(t, 0.4, 1) ** 2;
          const look = smooth(seg(t, 0, 0.2)) * (1 - smooth(seg(t, 0.8, 1)));
          return pose({ dx: span / 2 + STRIKER.pad, rot: -14 * look, sy: 1 - 0.12 * (1 - smooth(unit(t * 5))) + 0.06 * look, part: up });
        },
      },
      {
        ms: 400,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const from = span / 2 + STRIKER.pad;
          return pose({ dx: from + (span - from) * t, lift: arc(t) * 10, rot: 12 * Math.sin(Math.PI * t) });
        },
      },
    ]),
    flub: timeline([
      {
        // Far too keen: right over the pad, and down on its back.
        ms: 520,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: (span / 2 + STRIKER.pad + 2) * t, lift: arc(t) * 22, rot: -150 * smooth(t) }),
      },
      {
        // A feeble wobble from the puck, and a roll back over to where it started.
        ms: 680,
        cues: [{ at: 0.2, sound: 'tick' }, { at: 1, fx: 'land' }],
        pose: (t, span) => {
          const lie = unit(t / 0.4);
          const roll = seg(t, 0.4, 1);
          return pose({
            dx: (span / 2 + STRIKER.pad + 2) * (1 - smooth(roll)),
            lift: arc(roll) * 4,
            rot: -150 - 210 * smooth(roll),
            sx: 1 + 0.06 * Math.sin(lie * 6 * Math.PI) * (1 - roll),
            part: 0.25 * arc(lie),
          });
        },
      },
      { ms: 700, pose: (t) => shakeOff(t) },
    ]),
  },

  roll: {
    // Up onto the giant ball and walk it across — wobbling all the way — and a bow off the end.
    ...timeline([
      {
        ms: 420,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'boing' }],
        pose: (t, span) => pose({ dx: (span / 2 + BALL.from) * t, lift: 2 * BALL.r * smooth(t) + arc(t) * 7, part: BALL.from }),
      },
      {
        ms: 1600,
        cues: [{ at: 0.3, sound: 'tick' }, { at: 0.6, sound: 'tick' }],
        pose: (t, span) => {
          const u = BALL.from + (BALL.to - BALL.from) * smooth(t);
          return pose({
            dx: span / 2 + u,
            lift: 2 * BALL.r + 0.6 * Math.abs(Math.sin(8 * Math.PI * t)),
            rot: 14 * Math.sin(3 * Math.PI * t) * arc(t),
            part: u,
          });
        },
      },
      {
        ms: 440,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const from = span / 2 + BALL.to;
          return pose({ dx: from + (span - from) * t, lift: 2 * BALL.r * (1 - smooth(t)) + arc(t) * 7, rot: 360 * smooth(t), part: BALL.to });
        },
      },
    ]),
    flub: timeline([
      {
        ms: 420,
        cues: [{ at: 0, sound: 'hop' }, { at: 1, sound: 'boing' }],
        pose: (t, span) => pose({ dx: (span / 2 + BALL.from) * t, lift: 2 * BALL.r * smooth(t) + arc(t) * 7, part: BALL.from }),
      },
      {
        // Wobble. Wobble. WOBBLE.
        ms: 620,
        cues: [{ at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) => pose({ dx: span / 2 + BALL.from, lift: 2 * BALL.r, rot: 24 * t * Math.sin(5 * Math.PI * t), part: BALL.from }),
      },
      {
        // The ball goes one way and the pet the other.
        ms: 520,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => tumbleBack({ dx: span / 2 + BALL.from, lift: 2 * BALL.r }, t, { part: BALL.from - 3 * arc(t) }),
      },
      { ms: 700, pose: (t) => shakeOff(t, { part: BALL.from }) },
    ]),
  },

  zip: {
    // Up to the handle, and down the line — legs tucked, leaning back — and a drop at the end.
    // `part` is how far along the cable the handle has run, 0 to 1.
    ...timeline([
      {
        ms: 440,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) =>
          pose({ dx: (span / 2 + TROLLEY.from) * t, lift: zipLift(TROLLEY.from) * smooth(t) + arc(t) * 6, sy: 1 - 0.18 * smooth(t), sx: 1 + 0.05 * smooth(t) }),
      },
      {
        ms: 1000,
        cues: [{ at: 0, sound: 'zip' }],
        pose: (t, span) => {
          const along = t * t;
          const u = TROLLEY.from + (TROLLEY.to - TROLLEY.from) * along;
          return pose({ dx: span / 2 + u, lift: zipLift(u), rot: -16 * smooth(unit(t * 3)) + 4 * Math.sin(6 * Math.PI * t), sy: 0.82, sx: 1.05, part: along });
        },
      },
      {
        ms: 380,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const from = span / 2 + TROLLEY.to;
          return pose({
            dx: from + (span - from) * t,
            lift: zipLift(TROLLEY.to) * (1 - t * t) + arc(t) * 3,
            rot: -16 * (1 - smooth(t)),
            sy: 0.82 + 0.18 * smooth(t),
            sx: 1.05 - 0.05 * smooth(t),
            part: 1,
          });
        },
      },
    ]),
    flub: timeline([
      {
        ms: 440,
        cues: [{ at: 0, sound: 'hop' }],
        pose: (t, span) =>
          pose({ dx: (span / 2 + TROLLEY.from) * t, lift: zipLift(TROLLEY.from) * smooth(t) + arc(t) * 6, sy: 1 - 0.18 * smooth(t), sx: 1 + 0.05 * smooth(t) }),
      },
      {
        // Stuck. Kicking does nothing at all.
        ms: 760,
        cues: [{ at: 0.2, sound: 'tick' }, { at: 0.5, sound: 'tick' }, { at: 1, sound: 'knock', fx: 'bonk' }],
        pose: (t, span) =>
          pose({ dx: span / 2 + TROLLEY.from, lift: zipLift(TROLLEY.from), rot: 14 * Math.sin(4 * Math.PI * t), sy: 0.82, sx: 1.05, part: 0.015 * arc(unit(t * 4)) }),
      },
      {
        ms: 300,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => pose({ dx: span / 2 + TROLLEY.from, lift: zipLift(TROLLEY.from) * (1 - t * t), sy: 0.82 - 0.08 * t, sx: 1.05 + 0.05 * t }),
      },
      {
        ms: 440,
        pose: (t, span) => {
          const e = smooth(t);
          return pose({ dx: (span / 2 + TROLLEY.from) * (1 - e), lift: Math.abs(Math.sin(3 * Math.PI * t)), sy: 0.74 + 0.26 * e, sx: 1.1 - 0.1 * e });
        },
      },
      { ms: 600, pose: (t) => shakeOff(t) },
    ]),
  },

  blast: {
    // Into the barrel, a fizzing fuse, BOOM — and a great somersaulting arc to the far side.
    // `part` is the barrel's kick: a shiver while the fuse burns, a jolt back on the bang.
    ...timeline([
      {
        ms: 520,
        cues: [{ at: 0, sound: 'hop' }, { at: 0.85, sound: 'rustle' }],
        pose: (t, span) => pose({ dx: (span / 2 + MUZZLE.u - 4) * t, lift: BREECH * smooth(t) + arc(t) * 10, sy: 1 - 0.5 * smooth(seg(t, 0.5, 1)), hide: t > 0.85 }),
      },
      {
        ms: 640,
        cues: [{ at: 0, sound: 'sizzle' }],
        pose: (t, span) => pose({ dx: span / 2 + MUZZLE.u - 4, lift: BREECH, sy: 0.5, hide: true, part: 0.25 * Math.sin(24 * Math.PI * t) * t }),
      },
      {
        ms: 1150,
        cues: [{ at: 0, sound: 'boom', fx: 'smoke' }, { at: 1, fx: 'land' }],
        pose: (t, span) => {
          // Down on the target, which stands a little short of the far end.
          const from = span / 2 + MUZZLE.u;
          const to = span / 2 + TARGET;
          return pose({
            dx: from + (to - from) * t,
            lift: MUZZLE.y * (1 - t) + arc(t) * 34,
            rot: 360 * smooth(t),
            sy: 1 + 0.12 * arc(t),
            sx: 1 - 0.08 * arc(t),
            part: 1 - smooth(seg(t, 0, 0.4)),
          });
        },
      },
      {
        ms: 300,
        pose: (t, span) => pose({ dx: span / 2 + TARGET + (span / 2 - TARGET) * t, lift: arc(t) * 4 }),
      },
    ]),
    flub: timeline([
      {
        ms: 520,
        cues: [{ at: 0, sound: 'hop' }, { at: 0.85, sound: 'rustle' }],
        pose: (t, span) => pose({ dx: (span / 2 + MUZZLE.u - 4) * t, lift: BREECH * smooth(t) + arc(t) * 10, sy: 1 - 0.5 * smooth(seg(t, 0.5, 1)), hide: t > 0.85 }),
      },
      {
        // The fuse fizzes… and fizzles. Pfft.
        ms: 760,
        cues: [{ at: 0, sound: 'sizzle' }, { at: 0.75, sound: 'pfft', fx: 'bonk' }, { at: 0.76, fx: 'puff' }],
        pose: (t, span) => pose({ dx: span / 2 + MUZZLE.u - 4, lift: BREECH, sy: 0.5, hide: true, part: 0.25 * Math.sin(24 * Math.PI * t) * (1 - t) * t * 4 }),
      },
      {
        // Out the back it crawls, sooty.
        ms: 560,
        cues: [{ at: 1, fx: 'land' }],
        pose: (t, span) => {
          const e = smooth(t);
          return pose({ dx: (span / 2 + MUZZLE.u - 4) * (1 - e), lift: BREECH * (1 - t * t), sy: 0.5 + 0.5 * e, sx: 1.1 - 0.1 * e });
        },
      },
      { ms: 700, cues: [{ at: 0.15, fx: 'soot' }], pose: (t) => shakeOff(t, { sx: 1 + 0.08 * Math.sin(8 * Math.PI * t) * (1 - t) }) },
    ]),
  },
};

/* --------------------------------------------------------------------- flub */

// Now and then a pet gets it wrong, and the getting-it-wrong is the joke: partway in it bonks,
// tumbles back to where it started, shakes itself off — and then does the thing properly. It
// never fails outright and never gives up, so a flub is a moment of slapstick, not a loss.
//
// A move with a `flub` of its own goes wrong its own way: the limbo bar clattering down, the
// tyre swinging back into it. What follows is the general one, for a move without.
const FLUB_INTO = 0.4; // how far into the move it gets before it goes wrong
const FLUB_BACK_MS = 460;
const FLUB_SHAKE_MS = 700;
const FLUB_ODDS = 0.13; // per obstacle that is not the favourite
const FLUB_MAX = 0.4; // and never more often than this per run, however many there are

export const flubMs = (move) => MOVES[move]?.flub?.ms ?? (MOVES[move]?.ms ?? 1000) * FLUB_INTO + FLUB_BACK_MS + FLUB_SHAKE_MS;

/** When the bonk happens and when the pet is back on its feet, as fractions of `flubMs`. */
export function flubCues(move) {
  if (MOVES[move]?.flub) return MOVES[move].flub.cues;
  const total = flubMs(move);
  const bonk = ((MOVES[move]?.ms ?? 1000) * FLUB_INTO) / total;
  return [
    { at: bonk, sound: 'knock', fx: 'bonk' },
    { at: bonk + FLUB_BACK_MS / total, fx: 'land' },
  ];
}

/** The flub's pose, built from the move's own: the first part of it, then the tumble back. */
export function flubPose(move, k, span) {
  if (MOVES[move]?.flub) return MOVES[move].flub.pose(k, span);
  const base = MOVES[move] ?? MOVES.jump;
  const total = flubMs(move);
  const into = (base.ms * FLUB_INTO) / total;
  const back = into + FLUB_BACK_MS / total;
  if (k < into) return base.pose(FLUB_INTO * seg(k, 0, into), span);
  const from = base.pose(FLUB_INTO, span);
  const rest = base.pose(0, span);
  if (k < back) {
    const t = seg(k, into, back);
    const e = smooth(t);
    return pose({
      dx: from.dx * (1 - e),
      lift: from.lift * (1 - e) + arc(t) * 6,
      rot: -40 * Math.sin(Math.PI * t),
      part: from.part + (rest.part - from.part) * e,
    });
  }
  const t = seg(k, back, 1);
  return pose({ rot: 8 * Math.sin(t * 6 * Math.PI) * (1 - t), sy: 1 - 0.08 * arc(t * 2), part: rest.part });
}

/**
 * Whether this run's flub falls on piece `index`, and which. One flub at most per run, never on
 * the pet's favourite (it is good at that one), and only about one obstacle in eight. `rnd` is
 * injected so the tests can pin it.
 */
export function pickFlub(pieces, favourite, rnd = Math.random) {
  const open = pieces.map((piece, i) => (piece.id === favourite ? -1 : i)).filter((i) => i >= 0);
  if (!open.length || rnd() >= Math.min(FLUB_MAX, FLUB_ODDS * open.length)) return -1;
  return open[Math.floor(rnd() * open.length)];
}
