// The obstacle course, drawn. The same contract as FURNITURE in habitat-parts.js: base at
// (0, 0), growing up into -y, coloured entirely from the habitat's palette, so a hurdle in a
// snowy home is a snowy home's hurdle. The shop card and the running course are drawn from the
// same fragments, so the thing on the shelf is the thing that pops up.
//
// Each piece is centred on its own x and is no wider than its `span` in course.js, so the pet's
// move and the drawing meet: the stones sit where the hops land, the slide's curve is the curve
// the pet comes down, the beam stands as high as the pet's feet are lifted.
//
// A piece may have a `front` as well as a `back`. The back is drawn behind the pet and the front
// in front of it — which is all it takes for the pet to go *through* the hoop and *into* the
// ball pit rather than past them. Moving parts carry a class, and the piece's `rig` says where
// each one is for a pose from course.js: `{ '.crs-plank': 'rotate(…)' }`, or a list for a class
// that several things share. The scene writes those transforms on every frame of a move, in
// both layers; the drawing itself is always the part at rest, which is where a move starts.
//
// Every number a rig turns a pose into lives here, next to the drawing it moves, so the plank
// and the pivot it turns about can never be changed one without the other.

import { BRIDGE, deckDip, LOG, RUNGS, WHEEL } from './course.js';

/** The weave poles, from the left: passed on alternate sides. */
const POLES = [-10.5, -3.5, 3.5, 10.5];

/** The limbo bar: its left peg, which it pivots on when knocked, and how far it falls to lie on the ground. */
const LIMBO = { x: -8.6, y: -14.9, len: 17.2 };
const LIMBO_FALL = (Math.asin(14 / LIMBO.len) * 180) / Math.PI;

/** Where the tyre hangs from. */
const TYRE_PIVOT = -37;

/** The rope bridge's boards, from the middle, and where each rests unladen. */
const BOARDS = Array.from({ length: 12 }, (_, i) => -11 + 2 * i);
const boardY = (u) => -(BRIDGE.y - BRIDGE.sag * (1 - (u / BRIDGE.half) ** 2));

/** The hamster wheel's rungs, round its rim. */
const WHEEL_RUNGS = Array.from({ length: 14 }, (_, i) => (i / 14) * 2 * Math.PI);

/** The start flag, the only part of a course that stands in the habitat between runs. */
export const COURSE_FLAG = (c) => `
  <ellipse cx="0" cy="-0.4" rx="4" ry="1.5" fill="${c.groundRim}" />
  <path d="M-0.8 -0.6 L-0.6 -50 L0.6 -50 L0.8 -0.6 Z" fill="${c.wood}" />
  <circle cx="0" cy="-51" r="1.6" fill="${c.stoneLight}" />
  <path d="M0.4 -49.4 Q7 -50.6 13 -46.6 Q7 -43.6 0.4 -42.6 Z" fill="${c.accent}" />
  <path d="M0.4 -46 Q5 -46.6 9 -45 Q5 -44 0.4 -43.6 Z" fill="${c.bloom}" opacity="0.85" />
  <circle cx="5" cy="-46.4" r="1.2" fill="#fff8e0" opacity="0.9" />
  <rect x="-4" y="-55" width="21" height="16" fill="#000" fill-opacity="0" />`;

export const COURSE_PARTS = {
  hurdle: {
    back: (c) => `
      <ellipse cx="-7" cy="-0.3" rx="2.6" ry="1" fill="${c.groundRim}" />
      <ellipse cx="7" cy="-0.3" rx="2.6" ry="1" fill="${c.groundRim}" />
      <path d="M-7 0 L-7 -13 M7 0 L7 -13" stroke="${c.wood}" stroke-width="1.8" stroke-linecap="round" />
      <g class="crs-bar">
        <path d="M-8.4 -10.6 L8.4 -10.6" stroke="${c.accent}" stroke-width="2.2" stroke-linecap="round" />
        <path d="M-4.2 -10.6 L-1.4 -10.6 M2.8 -10.6 L5.6 -10.6" stroke="#fff8e0" stroke-width="2.2" opacity="0.8" />
      </g>
      <circle cx="-7" cy="-13.4" r="1.3" fill="${c.bloom}" />
      <circle cx="7" cy="-13.4" r="1.3" fill="${c.bloom}" />`,
  },

  limbo: {
    back: (c) => `
      <ellipse cx="-8.6" cy="-0.3" rx="2.4" ry="0.9" fill="${c.groundRim}" />
      <ellipse cx="8.6" cy="-0.3" rx="2.4" ry="0.9" fill="${c.groundRim}" />
      <path d="M-8.6 0 L-8.6 -19 M8.6 0 L8.6 -19" stroke="${c.wood}" stroke-width="1.6" stroke-linecap="round" />
      <path d="M-8.6 -14 L-6.8 -14 M8.6 -14 L6.8 -14" stroke="${c.nestDark}" stroke-width="1" stroke-linecap="round" />
      <circle cx="-8.6" cy="-19.4" r="1.3" fill="${c.bloom}" />
      <circle cx="8.6" cy="-19.4" r="1.3" fill="${c.bloom}" />`,
    // The bar in front, so the pet is seen to go under it rather than behind it.
    front: (c) => `
      <g class="crs-limbo">
        <path d="M-8.6 -14.9 L8.6 -14.9" stroke="${c.accent}" stroke-width="1.8" stroke-linecap="round" />
        <path d="M-5.6 -14.9 L-3 -14.9 M0 -14.9 L2.6 -14.9 M5.4 -14.9 L7.4 -14.9" stroke="#fff8e0" stroke-width="1.8" opacity="0.8" />
      </g>`,
    rig: (p) => ({ '.crs-limbo': `rotate(${(LIMBO_FALL * p.part).toFixed(2)} ${LIMBO.x} ${LIMBO.y})` }),
  },

  stones: {
    back: (c) => `
      <ellipse cx="0" cy="-0.6" rx="13.6" ry="3.6" fill="${c.groundRim}" opacity="0.7" />
      <ellipse cx="0" cy="-0.9" rx="12.4" ry="2.8" fill="${c.water}" />
      <ellipse cx="-4" cy="-1.4" rx="4" ry="0.8" fill="${c.waterLight}" opacity="0.7" />
      <ellipse cx="-7" cy="-1.4" rx="3.2" ry="1.6" fill="${c.stone}" />
      <ellipse cx="-7" cy="-1.9" rx="2.4" ry="1" fill="${c.stoneLight}" />
      <ellipse cx="0" cy="-1.2" rx="3.4" ry="1.7" fill="${c.stone}" />
      <ellipse cx="0" cy="-1.7" rx="2.6" ry="1.1" fill="${c.stoneLight}" />
      <ellipse cx="7" cy="-1.4" rx="3.2" ry="1.6" fill="${c.stone}" />
      <ellipse cx="7" cy="-1.9" rx="2.4" ry="1" fill="${c.stoneLight}" />`,
  },

  tunnel: {
    back: (c) => `
      <g class="crs-tube">
        <ellipse cx="0" cy="-0.4" rx="13.4" ry="2" fill="${c.groundRim}" />
        <path d="M-12 0 L-12 -8 Q-12 -17 0 -17 Q12 -17 12 -8 L12 0 Z" fill="${c.accent}" />
        <path d="M-6 -16.2 L-6 0 M0 -17 L0 0 M6 -16.2 L6 0" stroke="${c.nestDark}" stroke-width="0.9" opacity="0.45" />
        <path d="M-12 -8 Q-12 -17 0 -17 Q12 -17 12 -8" fill="none" stroke="#fff8e0" stroke-width="1" opacity="0.5" />
        <path d="M-12 0 L-12 -8 Q-12 -13.6 -9.6 -13.6 Q-8 -13.6 -8 -8 L-8 0 Z" fill="${c.groundRim}" opacity="0.75" />
        <path d="M12 0 L12 -8 Q12 -13.6 9.6 -13.6 Q8 -13.6 8 -8 L8 0 Z" fill="${c.groundRim}" opacity="0.75" />
      </g>`,
  },

  hoop: {
    back: (c) => `
      <ellipse cx="0" cy="-0.4" rx="5" ry="1.6" fill="${c.groundRim}" />
      <path d="M0 0 L0 -12" stroke="${c.wood}" stroke-width="2" stroke-linecap="round" />
      <path d="M-4 0 L0 -3 L4 0" fill="none" stroke="${c.wood}" stroke-width="1.6" stroke-linecap="round" />
      <path d="M0 -38 A5.4 13 0 0 0 0 -12" fill="none" stroke="${c.nestDark}" stroke-width="2.6" />`,
    front: (c) => `
      <path d="M0 -12 A5.4 13 0 0 0 0 -38" fill="none" stroke="${c.accent}" stroke-width="2.6" />
      <path d="M0 -12 A5.4 13 0 0 0 0 -38" fill="none" stroke="#fff8e0" stroke-width="2.6"
            stroke-dasharray="3 4" opacity="0.7" />`,
  },

  table: {
    back: (c) => `
      <ellipse cx="0" cy="-0.3" rx="10.6" ry="1.4" fill="${c.groundRim}" />
      <path d="M-7 0 L-7 -8 M7 0 L7 -8 M-3.6 0 L-3.6 -7 M3.6 0 L3.6 -7" stroke="${c.wood}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M-9.6 -9 L9.6 -9 L9 -7.2 L-9 -7.2 Z" fill="${c.nest}" />
      <path d="M-9.6 -9 L9.6 -9" stroke="${c.nestLight}" stroke-width="0.9" stroke-linecap="round" />
      <path d="M-9 -7.6 L9 -7.6" stroke="${c.accent}" stroke-width="0.9" stroke-dasharray="2 1.6" />`,
  },

  tyre: {
    back: (c) => `
      <ellipse cx="0" cy="-0.3" rx="11" ry="1.4" fill="${c.groundRim}" />
      <path d="M-9.6 0 L-9.6 -37.6 M9.6 0 L9.6 -37.6" stroke="${c.wood}" stroke-width="1.6" stroke-linecap="round" />
      <path d="M-10.4 -37.4 L10.4 -37.4" stroke="${c.wood}" stroke-width="2" stroke-linecap="round" />
      <g class="crs-tyre">
        <path d="M-1.6 -37 L-2.4 -30.4 M1.6 -37 L2.4 -30.4" stroke="${c.stone}" stroke-width="0.7" />
        <path d="M0 -30.6 A4.6 9.6 0 0 0 0 -11.4" fill="none" stroke="${c.nestDark}" stroke-width="3.4" />
      </g>`,
    front: (c) => `
      <g class="crs-tyre">
        <path d="M0 -11.4 A4.6 9.6 0 0 0 0 -30.6" fill="none" stroke="${c.nestDark}" stroke-width="3.4" />
        <path d="M0 -11.4 A4.6 9.6 0 0 0 0 -30.6" fill="none" stroke="${c.groundRim}" stroke-width="3.4"
              stroke-dasharray="1.2 1.6" opacity="0.8" />
        <path d="M2.2 -14 A3 7 0 0 0 2.2 -28" fill="none" stroke="#fff8e0" stroke-width="0.6" opacity="0.4" />
      </g>`,
    rig: (p) => ({ '.crs-tyre': `rotate(${p.part.toFixed(2)} 0 ${TYRE_PIVOT})` }),
  },

  weave: {
    back: (c) => POLES
      .map(
        (x, i) => `
      <g class="crs-pole" transform="translate(${x} 0)">
        <ellipse cx="0" cy="-0.3" rx="2" ry="0.8" fill="${c.groundRim}" />
        <path d="M0 0 L0 -17" stroke="${i % 2 ? c.bloom : c.accent}" stroke-width="1.7" stroke-linecap="round" />
        <circle cx="0" cy="-17.4" r="1.4" fill="#fff8e0" opacity="0.85" />
      </g>`
      )
      .join(''),
    // Only the pole the pet is brushing past sways, and back the way it was pushed.
    rig: (p, span) => ({
      '.crs-pole': POLES.map((x) => {
        const near = Math.max(0, 1 - Math.abs(p.dx - span / 2 - x) / 5);
        return `translate(${x} 0) rotate(${(p.part * 9 * near).toFixed(1)})`;
      }),
    }),
  },

  ramp: {
    back: (c) => `
      <ellipse cx="-2" cy="-0.3" rx="12.4" ry="1.6" fill="${c.groundRim}" />
      <path d="M-12 0 L6 -13 L8 -13 L8 0 Z" fill="${c.wood}" />
      <path d="M-12 0 L6 -13 L8 -13 L8 -11.6 L6.2 -11.6 L-9.8 0 Z" fill="${c.nest}" />
      <path d="M-7.4 -3.4 L-6.4 -2 M-3.4 -6.2 L-2.4 -4.8 M0.6 -9.2 L1.6 -7.8" stroke="${c.nestLight}" stroke-width="1" stroke-linecap="round" />
      <path d="M6 0 L6 -11.6" stroke="${c.nestDark}" stroke-width="0.8" opacity="0.5" />
      <path d="M7.8 -13 L7.8 -18.6 L12 -17 L7.8 -15.6" fill="${c.accent}" />`,
  },

  aframe: {
    back: (c) => `
      <ellipse cx="0" cy="-0.3" rx="14" ry="1.6" fill="${c.groundRim}" />
      <path d="M-13 0 L0 -14 L13 0 L10.6 0 L0 -11.4 L-10.6 0 Z" fill="${c.wood}" />
      <path d="M-10.6 0 L0 -11.4 L10.6 0 Z" fill="${c.nestDark}" opacity="0.35" />
      <path d="M-13 0 L0 -14 L13 0" fill="none" stroke="${c.nestLight}" stroke-width="0.8" stroke-linejoin="round" />
      <path d="M-13 0 L-9.3 -4 M13 0 L9.3 -4" stroke="${c.accent}" stroke-width="2.2" stroke-linecap="round" />
      <path d="M-6.4 -6.9 L-5.2 -5.6 M-3.2 -10.3 L-2 -9 M6.4 -6.9 L5.2 -5.6 M3.2 -10.3 L2 -9"
            stroke="${c.nestLight}" stroke-width="0.9" stroke-linecap="round" />
      <path d="M-4.4 -4.4 L4.4 -4.4" stroke="${c.stone}" stroke-width="0.9" stroke-linecap="round" />`,
  },

  bridge: {
    back: (c) => `
      <ellipse cx="-13.4" cy="-0.3" rx="2" ry="0.8" fill="${c.groundRim}" />
      <ellipse cx="13.4" cy="-0.3" rx="2" ry="0.8" fill="${c.groundRim}" />
      <path d="M-13.4 0 L-13.4 -15 M13.4 0 L13.4 -15" stroke="${c.wood}" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="-13.4" cy="-15.4" r="1.2" fill="${c.accent}" />
      <circle cx="13.4" cy="-15.4" r="1.2" fill="${c.accent}" />
      <path d="M-13.4 -14 Q0 -9.6 13.4 -14" fill="none" stroke="${c.nestLight}" stroke-width="0.8" />
      <path d="M-13.4 -8 Q0 -5 13.4 -8" fill="none" stroke="${c.nestDark}" stroke-width="0.6" opacity="0.6" />
      ${BOARDS.map(
        (u) => `
      <g class="crs-board">
        <path d="M${u} ${(boardY(u) - 0.6).toFixed(2)} L${u} ${(-14 + 4.4 * (1 - (u / 13.4) ** 2)).toFixed(2)}" stroke="${c.nestLight}" stroke-width="0.4" opacity="0.8" />
        <rect x="${(u - 0.85).toFixed(2)}" y="${(boardY(u) - 0.6).toFixed(2)}" width="1.7" height="1.3" rx="0.3" fill="${c.wood}" />
      </g>`
      ).join('')}`,
    // Every board dips with the deck: most where the pet is, tapering to nothing at the posts.
    rig: (p, span) => ({
      '.crs-board': BOARDS.map((u) => `translate(0 ${deckDip(u, p.at ?? p.dx - span / 2, p.part).toFixed(2)})`),
    }),
  },

  beam: {
    back: (c) => `
      <ellipse cx="-8" cy="-0.3" rx="2.8" ry="1" fill="${c.groundRim}" />
      <ellipse cx="8" cy="-0.3" rx="2.8" ry="1" fill="${c.groundRim}" />
      <path d="M-9.6 0 L-8 -5.6 L-6.4 0 M6.4 0 L8 -5.6 L9.6 0" fill="none" stroke="${c.wood}" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M-12 -7.4 L12 -7.4 L12 -5.2 L-12 -5.2 Z" fill="${c.nest}" />
      <path d="M-12 -7.4 L12 -7.4" stroke="${c.nestLight}" stroke-width="0.8" />
      <circle cx="-12" cy="-6.3" r="1.2" fill="${c.accent}" />
      <circle cx="12" cy="-6.3" r="1.2" fill="${c.accent}" />`,
  },

  seesaw: {
    back: (c) => `
      <path d="M-4 0 L0 -6 L4 0 Z" fill="${c.stone}" />
      <path d="M-4 0 L0 -6 L0 0 Z" fill="${c.stoneLight}" opacity="0.5" />
      <g class="crs-plank" transform="rotate(-23.58 0 -6)">
        <path d="M-15 -7.2 L15 -7.2 L15 -5 L-15 -5 Z" fill="${c.wood}" />
        <path d="M-15 -7.2 L15 -7.2" stroke="${c.nestLight}" stroke-width="0.8" />
        <path d="M-13.6 -7.2 L-13.6 -10.4 M13.6 -7.2 L13.6 -10.4" stroke="${c.accent}" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <circle cx="0" cy="-6" r="1.2" fill="${c.nestDark}" />`,
    rig: (p) => ({ '.crs-plank': `rotate(${p.part.toFixed(2)} 0 -6)` }),
  },

  log: {
    back: (c) => `
      <ellipse cx="0" cy="-0.3" rx="14" ry="1.4" fill="${c.groundRim}" opacity="0.8" />
      <g class="crs-log" transform="translate(${LOG.from} 0)">
        <circle cx="0" cy="${-LOG.r}" r="${LOG.r}" fill="${c.wood}" stroke="${c.nestDark}" stroke-width="1" />
        <circle cx="0" cy="${-LOG.r}" r="${LOG.r - 1.8}" fill="none" stroke="${c.nestLight}" stroke-width="0.6" />
        <circle cx="0" cy="${-LOG.r}" r="${LOG.r - 3.4}" fill="none" stroke="${c.nestLight}" stroke-width="0.5" />
        <path d="M0 ${-LOG.r} L${(LOG.r - 1).toFixed(1)} ${-LOG.r - 1.6}" stroke="${c.nestDark}" stroke-width="0.6" />
        <circle cx="${-LOG.r + 2}" cy="${-LOG.r + 1.6}" r="0.7" fill="${c.accent}" />
      </g>`,
    // Rolling along the ground: as far round as it has come along, a whole turn per circumference.
    rig: (p) => {
      const deg = ((p.part - LOG.from) / LOG.r) * (180 / Math.PI);
      return { '.crs-log': `translate(${p.part.toFixed(2)} 0) rotate(${deg.toFixed(1)} 0 ${-LOG.r})` };
    },
  },

  wheel: {
    back: (c) => `
      <ellipse cx="0" cy="-0.3" rx="11" ry="1.4" fill="${c.groundRim}" />
      <path d="M-8 0 L0 ${-WHEEL.y} L8 0" fill="none" stroke="${c.stone}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
      <circle cx="0" cy="${-WHEEL.y}" r="${WHEEL.r}" fill="${c.glow}" fill-opacity="0.18" stroke="${c.accent}" stroke-width="1.6" />
      <g class="crs-wheel">
        ${[0, 1, 2, 3, 4, 5]
          .map((i) => {
            const a = (i / 6) * 2 * Math.PI;
            return `<path d="M0 ${-WHEEL.y} L${(Math.sin(a) * WHEEL.r).toFixed(2)} ${(-WHEEL.y - Math.cos(a) * WHEEL.r).toFixed(2)}" stroke="${c.stoneLight}" stroke-width="0.7" />`;
          })
          .join('')}
        ${WHEEL_RUNGS.map(
          (a) => `<circle cx="${(Math.sin(a) * (WHEEL.r - 0.4)).toFixed(2)}" cy="${(-WHEEL.y - Math.cos(a) * (WHEEL.r - 0.4)).toFixed(2)}" r="0.6" fill="${c.nestDark}" />`
        ).join('')}
      </g>
      <circle cx="0" cy="${-WHEEL.y}" r="1.4" fill="${c.nestDark}" />`,
    // The near rim, in front of the pet running inside.
    front: (c) => `
      <circle cx="0" cy="${-WHEEL.y}" r="${WHEEL.r}" fill="none" stroke="${c.accent}" stroke-width="1.1" opacity="0.85" />
      <path d="M-10.6 ${-WHEEL.y - 7.5} A${WHEEL.r} ${WHEEL.r} 0 0 1 -3 ${-WHEEL.y - 12.6}" fill="none" stroke="#fff8e0" stroke-width="0.6" opacity="0.6" />`,
    rig: (p) => ({ '.crs-wheel': `rotate(${p.part.toFixed(1)} 0 ${-WHEEL.y})` }),
  },

  trampoline: {
    back: (c) => `
      <path d="M-8.6 0 L-9.6 -6 M8.6 0 L9.6 -6 M-3 0 L-3.4 -5 M3 0 L3.4 -5" stroke="${c.stone}" stroke-width="1.3" stroke-linecap="round" />
      <ellipse cx="0" cy="-6" rx="11" ry="2.6" fill="${c.accent}" />
      <g class="crs-mat">
        <ellipse cx="0" cy="-6.2" rx="8.6" ry="1.7" fill="${c.groundRim}" />
      </g>
      <ellipse cx="0" cy="-6" rx="11" ry="2.6" fill="none" stroke="#fff8e0" stroke-width="0.8"
               stroke-dasharray="2.4 2" opacity="0.7" />`,
    rig: (p) => ({ '.crs-mat': `translate(0 ${(p.part * 2.4).toFixed(2)})` }),
  },

  monkeybars: {
    back: (c) => `
      <ellipse cx="-13.4" cy="-0.3" rx="2.2" ry="0.8" fill="${c.groundRim}" />
      <ellipse cx="13.4" cy="-0.3" rx="2.2" ry="0.8" fill="${c.groundRim}" />
      <path d="M-13.4 0 L-13.4 -37 M13.4 0 L13.4 -37" stroke="${c.wood}" stroke-width="1.8" stroke-linecap="round" />
      <path d="M-13.4 -8 L-10.6 -8 M-13.4 -16 L-10.6 -16 M-13.4 -24 L-10.6 -24" stroke="${c.wood}" stroke-width="1" stroke-linecap="round" />`,
    // The bars in front, so a hanging pet has hold of them rather than hanging behind them.
    front: (c) => `
      <path d="M-14.4 -37.2 L14.4 -37.2" stroke="${c.wood}" stroke-width="2" stroke-linecap="round" />
      ${RUNGS.map((x) => `<circle cx="${x}" cy="-37.2" r="1.25" fill="${c.accent}" stroke="#fff8e0" stroke-width="0.4" />`).join('')}`,
  },

  slide: {
    back: (c) => `
      <ellipse cx="2" cy="-0.3" rx="14.6" ry="1.6" fill="${c.groundRim}" />
      <path d="M-12.4 0 L-12.4 -20.6 M-8.6 0 L-8.6 -20.6" stroke="${c.stone}" stroke-width="1.2" stroke-linecap="round" />
      <path d="M-12.4 -4 L-8.6 -4 M-12.4 -8 L-8.6 -8 M-12.4 -12 L-8.6 -12 M-12.4 -16 L-8.6 -16"
            stroke="${c.stoneLight}" stroke-width="1" stroke-linecap="round" />
      <path d="M-12.6 -20 L-7 -20" stroke="${c.wood}" stroke-width="2" stroke-linecap="round" />
      <path d="M-7 -20 Q3 0 13 0" fill="none" stroke="${c.accent}" stroke-width="3" stroke-linecap="round" />
      <path d="M-7 -21.4 Q3 -1.4 13 -1.4" fill="none" stroke="#fff8e0" stroke-width="0.8" opacity="0.6" />
      <path d="M-4 -12 L-4 0 M2 -3.4 L2 0" stroke="${c.stone}" stroke-width="1" stroke-linecap="round" />`,
  },

  ballpit: {
    back: (c) => `
      <path d="M-12.6 -12 L12.6 -12 L11.4 -13.6 L-11.4 -13.6 Z" fill="${c.nestDark}" />
      ${pitBalls(c, -13.4)}`,
    front: (c) => `
      <path d="M-13 0 L-13 -11.4 L13 -11.4 L13 0 Z" fill="${c.wood}" />
      <path d="M-13 -11.4 L13 -11.4 L13 -10 L-13 -10 Z" fill="${c.nestLight}" />
      <circle cx="-6.6" cy="-5.6" r="1.6" fill="${c.accent}" opacity="0.7" />
      <circle cx="0" cy="-5.6" r="1.6" fill="${c.bloom}" opacity="0.7" />
      <circle cx="6.6" cy="-5.6" r="1.6" fill="${c.glowDeep}" opacity="0.7" />`,
  },
};

/** The colours the ball pit's balls come in — the habitat's own, as everything else is. */
export const ballColors = (c) => [c.accent, c.bloom, c.glowDeep, c.waterLight, c.leaf];

function pitBalls(c, top) {
  const colors = ballColors(c);
  const out = [];
  for (let i = 0; i < 9; i += 1) {
    const x = -10.4 + i * 2.6;
    const y = top + (i % 2 ? 0.6 : -0.6);
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill="${colors[i % colors.length]}" />`);
  }
  return out.join('');
}

/** Both layers together, for anywhere the pet is not in between them — the shop card. */
export const obstacleSvg = (id, c) => {
  const part = COURSE_PARTS[id];
  if (!part) return '';
  return `${part.back(c)}${part.front ? part.front(c) : ''}`;
};
