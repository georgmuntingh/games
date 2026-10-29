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
// session away and the dearest about five, and there is something to buy at every tier.
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
  { id: 'tunnel', price: 50, tier: 0, move: 'crawl', span: 28 },
  { id: 'hoop', price: 60, tier: 1, move: 'leap', span: 22 },
  { id: 'table', price: 60, tier: 1, move: 'pause', span: 24 },
  { id: 'tyre', price: 65, tier: 1, move: 'tyre', span: 22 },
  { id: 'weave', price: 70, tier: 1, move: 'weave', span: 28 },
  { id: 'ramp', price: 75, tier: 1, move: 'climb', span: 28 },
  { id: 'aframe', price: 75, tier: 1, move: 'scramble', span: 28 },
  { id: 'beam', price: 85, tier: 2, move: 'balance', span: 30 },
  { id: 'seesaw', price: 90, tier: 2, move: 'tip', span: 30 },
  { id: 'trampoline', price: 110, tier: 2, move: 'bounce', span: 24 },
  { id: 'slide', price: 125, tier: 3, move: 'slide', span: 30 },
  { id: 'ballpit', price: 150, tier: 3, move: 'dive', span: 28 },
];

/** Three, which is what fits across the walk line side by side with room to run between. */
export const MAX_COURSE = 3;

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

/**
 * The course laid out: each piece's centre and its entry and exit, left to right in running
 * order, with whatever the pieces leave of the lane shared out evenly before, between and after
 * them. Derived, never stored — the same three ids give the same course on every device.
 */
export function courseLayout(ids, lane = LANE) {
  const pieces = sanitizeCourse(ids).map((id) => obstacleById.get(id));
  const used = pieces.reduce((sum, entry) => sum + entry.span, 0);
  const gap = Math.max(0, (lane.x1 - lane.x0 - used) / (pieces.length + 1));
  let x = lane.x0 + gap;
  const placed = pieces.map((entry) => {
    const at = { id: entry.id, move: entry.move, span: entry.span, x0: x, x: x + entry.span / 2, x1: x + entry.span };
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
