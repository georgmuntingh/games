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
// ball pit rather than past them. Moving parts carry a class the scene can find: the seesaw's
// plank, the trampoline's mat, the weave poles.

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

  weave: {
    back: (c) => [-10.5, -3.5, 3.5, 10.5]
      .map(
        (x, i) => `
      <g class="crs-pole" transform="translate(${x} 0)">
        <ellipse cx="0" cy="-0.3" rx="2" ry="0.8" fill="${c.groundRim}" />
        <path d="M0 0 L0 -17" stroke="${i % 2 ? c.bloom : c.accent}" stroke-width="1.7" stroke-linecap="round" />
        <circle cx="0" cy="-17.4" r="1.4" fill="#fff8e0" opacity="0.85" />
      </g>`
      )
      .join(''),
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
