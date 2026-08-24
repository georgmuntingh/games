// The habitat kit: pure SVG fragments, no logic and no state. The sibling of
// pet-parts.js, and it works the same way — every fragment draws against the anchors
// below, and moving one of them silently detaches every prop from the ground.
//
//   viewBox   0 0 200 120, drawn back to front
//   sky       y   0 .. 62          horizon    y = 62
//   ground    y  62 .. 120         walk line  y = 96   (pet feet land here)
//   safe box  x  40 .. 160, y 50 .. 120     always visible once the scene is slice-cropped
//   roam band x  62 .. 138                  where the pet and the ball may go
//
// The roam band is the safe box inset by half a pet: a pet standing at either end of it
// still fits inside the crop whole, rather than losing an ear to the edge.
//
// The scene is cropped, never letterboxed, and anchored to the *bottom* (xMidYMax): a wide
// window loses sky, which costs nothing, rather than the ground the pet is standing on.
//
// Scenery parts all draw with their base at (0, 0) and grow upward into -y, so a part
// can be dropped anywhere with translate(x, groundY) scale(s) and stand on the ground
// without knowing where the ground is.
//
// The habitat rules, which matter as much as the pet's cuteness rules: no cages, no bars,
// no fences, nothing that reads as an enclosure. Nothing sharp in the foreground. And a
// night habitat has to be as readable as a noon one — moonlight, glow and a lifted ground
// value, never a silhouette.

export const VIEW = { w: 200, h: 120 };
export const HORIZON = 62;
export const WALK_Y = 96;
export const SAFE = { x0: 40, x1: 160 };
export const ROAM = { x0: 62, x1: 138 };

// The pet is dropped in as a nested <svg> of this size. Its own ground anchor is at
// (50, 86) of a 0..100 box (pet-parts.js GROUND), which is what PET_FOOT converts.
export const PET_SIZE = 46;
export const PET_FOOT = { x: PET_SIZE * 0.5, y: PET_SIZE * 0.86 };

/* ------------------------------------------------------------------ numbers */

const n = (value) => Number(value.toFixed(2));

/**
 * A tiny deterministic generator, so scattered detail (grass, pebbles, stars) is both
 * varied and reproducible: the same seed always draws the same field, which is what lets
 * the tests assert on habitat markup at all.
 */
export function rndFrom(seed) {
  let s = (Math.floor(seed) % 2147483647) + 1;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* -------------------------------------------------------------------- light */

// Six times of day. Every one of them names a sky, a light, and what hangs in it.
// `night` is the flag the rest of the kit reads to decide whether things glow.
export const PHASES = {
  dawn: {
    sky: ['#f6b98a', '#ffe6cd'],
    orb: 'sun',
    orbFill: '#ffd27a',
    glow: '#ffd9a8',
    veil: 'rgba(255, 176, 120, 0.16)',
    night: false,
  },
  morning: {
    sky: ['#a8dcff', '#e8f6ff'],
    orb: 'sun',
    orbFill: '#ffe293',
    glow: '#fff3c4',
    veil: 'rgba(255, 246, 214, 0.10)',
    night: false,
  },
  noon: {
    sky: ['#8ecfff', '#e4f4ff'],
    orb: 'sun',
    orbFill: '#fff2a8',
    glow: '#fffbdd',
    veil: 'rgba(255, 255, 255, 0.06)',
    night: false,
  },
  afternoon: {
    sky: ['#ffcf96', '#fff0d6'],
    orb: 'sun',
    orbFill: '#ffc860',
    glow: '#ffe0a5',
    veil: 'rgba(255, 190, 120, 0.13)',
    night: false,
  },
  dusk: {
    sky: ['#7f6bc4', '#ffb493'],
    orb: 'sun',
    orbFill: '#ff9d6e',
    glow: '#ffc7a0',
    veil: 'rgba(120, 96, 190, 0.18)',
    night: false,
  },
  night: {
    // Deliberately a lit night, not a black one: a child has to be able to see their pet.
    sky: ['#2f3f7a', '#6a7cb8'],
    orb: 'moon',
    orbFill: '#fdf8dc',
    glow: '#cfd8ff',
    veil: 'rgba(40, 52, 110, 0.26)',
    night: true,
  },
};

export const PHASE_IDS = Object.keys(PHASES);

/** Which of the six a 24-hour hour falls in. */
export function phaseOfHour(hour24) {
  const h = ((Math.round(hour24) % 24) + 24) % 24;
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 11) return 'morning';
  if (h >= 11 && h < 14) return 'noon';
  if (h >= 14 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

/**
 * Where the sun or moon hangs for a given hour: a real sky arc, left at first light,
 * overhead in the middle, right as it goes down — so the light itself says roughly when
 * this pet's day happens, with nothing to read and nothing to get wrong.
 *
 * Kept inside the safe box so the orb survives cropping on a narrow screen.
 */
export function orbPoint(hour24) {
  const h = ((Math.round(hour24) % 24) + 24) % 24;
  // Day runs 5:00 -> 19:00; the moon walks the same arc across the other ten hours.
  const t = h >= 5 && h < 19 ? (h - 5) / 14 : ((h < 5 ? h + 24 : h) - 19) / 10;
  const rad = t * Math.PI;
  // The arc stays well inside the safe box and clear of the horizon, because the ends of
  // it are dawn and dusk — exactly the hours whose light is worth seeing, and exactly what
  // a portrait crop would otherwise cut off.
  return { x: n(100 - Math.cos(rad) * 52), y: n(HORIZON - 12 - Math.sin(rad) * 34) };
}

/* ---------------------------------------------------------------------- sky */

export function skyMarkup(phase, hour24, seed, uid) {
  const spec = PHASES[phase] ?? PHASES.noon;
  const orb = orbPoint(hour24);
  const rnd = rndFrom(seed + 17);

  const light = `
    <circle cx="${orb.x}" cy="${orb.y}" r="22" fill="url(#${uid}-glow)" />
    ${
      spec.orb === 'moon'
        ? `<circle cx="${orb.x}" cy="${orb.y}" r="7.5" fill="${spec.orbFill}" />
           <circle cx="${n(orb.x + 2.6)}" cy="${n(orb.y - 2)}" r="1.5" fill="#e8e0bd" opacity="0.7" />
           <circle cx="${n(orb.x - 1.8)}" cy="${n(orb.y + 2.4)}" r="1.1" fill="#e8e0bd" opacity="0.6" />`
        : `<circle cx="${orb.x}" cy="${orb.y}" r="9" fill="${spec.orbFill}" />`
    }`;

  if (spec.night) {
    // Stars thin out toward the horizon, the way they do when you look up from a field.
    const stars = Array.from({ length: 34 }, () => {
      const x = n(rnd() * 200);
      const y = n(rnd() ** 1.6 * (HORIZON - 6));
      const r = n(0.5 + rnd() * 0.9);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fdf8dc" opacity="${n(0.35 + rnd() * 0.5)}" />`;
    }).join('');
    return `${stars}${light}`;
  }

  const clouds = Array.from({ length: 3 }, (_, i) => {
    const x = n(18 + rnd() * 150);
    const y = n(8 + rnd() * 28);
    const s = n(0.7 + rnd() * 0.7);
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffffff" opacity="${n(0.5 + i * 0.08)}">
      <ellipse cx="0" cy="0" rx="13" ry="6" />
      <circle cx="-5" cy="-2.5" r="6" />
      <circle cx="4.5" cy="-3.5" r="7.5" />
    </g>`;
  }).join('');
  return `${clouds}${light}`;
}

/* ---------------------------------------------------------------- far shapes */

// The band that sits on the horizon. Never a wall, never a fence — always something the
// eye can travel past, so the habitat reads as open country rather than an enclosure.
export const FAR = {
  hills: (c) => `
    <ellipse cx="34" cy="${HORIZON + 4}" rx="60" ry="22" fill="${c.farDark}" />
    <ellipse cx="132" cy="${HORIZON + 2}" rx="74" ry="26" fill="${c.far}" />
    <ellipse cx="86" cy="${HORIZON + 8}" rx="52" ry="18" fill="${c.farDark}" opacity="0.7" />`,
  treeline: (c) => {
    const trees = Array.from({ length: 13 }, (_, i) => {
      const x = n(2 + i * 16.2);
      const h = n(13 + ((i * 7) % 5) * 2.6);
      return `<path d="M${x} ${HORIZON + 3} L${n(x + 5.2)} ${n(HORIZON + 3 - h)} L${n(x + 10.4)} ${HORIZON + 3} Z" />`;
    }).join('');
    return `<g fill="${c.farDark}">${trees}</g>
      <rect x="0" y="${HORIZON}" width="200" height="8" fill="${c.far}" opacity="0.55" />`;
  },
  sea: (c) => `
    <rect x="0" y="${HORIZON - 16}" width="200" height="${16 + 10}" fill="${c.water}" />
    <rect x="0" y="${HORIZON - 16}" width="200" height="3" fill="${c.waterLight}" opacity="0.7" />
    <ellipse cx="100" cy="${HORIZON + 6}" rx="120" ry="10" fill="${c.waterLight}" opacity="0.45" />`,
  dunes: (c) => `
    <ellipse cx="40" cy="${HORIZON + 6}" rx="66" ry="20" fill="${c.far}" />
    <ellipse cx="150" cy="${HORIZON + 3}" rx="70" ry="17" fill="${c.farDark}" />`,
  peaks: (c) => `
    <path d="M-6 ${HORIZON + 4} L38 ${HORIZON - 30} L82 ${HORIZON + 4} Z" fill="${c.farDark}" />
    <path d="M52 ${HORIZON + 4} L104 ${HORIZON - 38} L156 ${HORIZON + 4} Z" fill="${c.far}" />
    <path d="M132 ${HORIZON + 4} L172 ${HORIZON - 24} L212 ${HORIZON + 4} Z" fill="${c.farDark}" />
    <path d="M104 ${HORIZON - 38} L92 ${HORIZON - 24} L104 ${HORIZON - 27} L116 ${HORIZON - 22} Z" fill="#ffffff" opacity="0.85" />`,
  // A lit hollow on the skyline, not a tunnel the pet stands in: it has to sit on the
  // horizon like every other far shape, or it swallows the whole field.
  arch: (c) => `
    <ellipse cx="62" cy="${HORIZON + 3}" rx="52" ry="17" fill="${c.farDark}" />
    <ellipse cx="146" cy="${HORIZON + 4}" rx="58" ry="19" fill="${c.far}" />
    <ellipse cx="104" cy="${HORIZON + 1}" rx="21" ry="15" fill="${c.glowDeep}" />
    <ellipse cx="104" cy="${HORIZON + 2}" rx="13" ry="9" fill="${c.glow}" opacity="0.7" />`,
  cloudbank: (c) => `
    <g fill="${c.far}">
      <ellipse cx="42" cy="${HORIZON + 6}" rx="54" ry="17" />
      <ellipse cx="146" cy="${HORIZON + 3}" rx="60" ry="15" />
      <circle cx="70" cy="${HORIZON - 4}" r="13" />
      <circle cx="128" cy="${HORIZON - 6}" r="15" />
    </g>`,
};

/* ------------------------------------------------------------------- ground */

// The crest of the ground, shared by the plate and the rim drawn on top of it.
const CREST = `M0 ${HORIZON + 2}
   C 34 ${HORIZON - 4}, 68 ${HORIZON + 6}, 100 ${HORIZON + 1}
   C 136 ${HORIZON - 5}, 170 ${HORIZON + 5}, 200 ${HORIZON}`;

/**
 * The ground plate: a soft crest just under the horizon, then solid colour to the floor.
 *
 * The crest is also stroked, in a darker line. Sky and ground are tinted independently by
 * biome and by hour, and across forty-eight combinations a few of them land on the same
 * brightness by coincidence — at which point the horizon simply vanishes. The rim means
 * the ground always has an edge, without hand-tuning every pair.
 */
export function groundMarkup(c, uid) {
  return `
    <path d="${CREST} L200 120 L0 120 Z" fill="url(#${uid}-ground)" />
    <path d="${CREST}" fill="none" stroke="${c.groundRim}" stroke-width="1.4" opacity="0.55" />
    <path d="M0 ${WALK_Y + 4}
             C 46 ${WALK_Y - 2}, 120 ${WALK_Y + 7}, 200 ${WALK_Y}
             L200 120 L0 120 Z"
          fill="${c.groundNear}" opacity="0.55" />`;
}

// Scatter across the near ground. Deliberately low-contrast: this is texture the eye
// skates over, not something that competes with the pet.
export const DETAIL = {
  grass: (c, rnd) =>
    Array.from({ length: 26 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON + 6 + rnd() * 50);
      const h = n(2.6 + rnd() * 3.4);
      return `<path d="M${x} ${y} q${n(0.8 + rnd())} ${-h} ${n(1.8 + rnd())} ${n(-h * 0.6)}" stroke="${c.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55" />`;
    }).join(''),
  fern: (c, rnd) =>
    Array.from({ length: 16 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON + 8 + rnd() * 48);
      const s = n(0.6 + rnd() * 0.6);
      return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c.leafDark}" opacity="0.5">
        <ellipse cx="-3" cy="-2" rx="4" ry="1.6" transform="rotate(-25 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="4" ry="1.6" transform="rotate(25 3 -2)" />
        <ellipse cx="0" cy="-4.5" rx="3.4" ry="1.5" />
      </g>`;
    }).join(''),
  shells: (c, rnd) =>
    Array.from({ length: 18 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON + 10 + rnd() * 46);
      const r = n(1.1 + rnd() * 1.5);
      return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.7)}" fill="${c.bloom}" opacity="0.6" />`;
    }).join(''),
  pebbles: (c, rnd) =>
    Array.from({ length: 20 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON + 8 + rnd() * 48);
      const r = n(1 + rnd() * 1.8);
      return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.65)}" fill="${c.stone}" opacity="0.5" />`;
    }).join(''),
  lily: (c, rnd) =>
    Array.from({ length: 9 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON + 10 + rnd() * 42);
      const r = n(3 + rnd() * 2.6);
      return `<g transform="translate(${x} ${y})">
        <circle r="${r}" fill="${c.leaf}" opacity="0.8" />
        <path d="M0 0 L${r} ${n(-r * 0.4)} A${r} ${r} 0 0 0 ${n(r * 0.7)} ${n(r * 0.7)} Z" fill="${c.groundNear}" opacity="0.5" />
      </g>`;
    }).join(''),
  snow: (c, rnd) =>
    Array.from({ length: 16 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON + 8 + rnd() * 48);
      const r = n(2.4 + rnd() * 3.4);
      return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.5)}" fill="#ffffff" opacity="0.75" />`;
    }).join(''),
  spores: (c, rnd) =>
    Array.from({ length: 22 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON - 4 + rnd() * 56);
      const r = n(0.8 + rnd() * 1.4);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.glow}" opacity="${n(0.35 + rnd() * 0.45)}" />`;
    }).join(''),
  sparkle: (c, rnd) =>
    Array.from({ length: 20 }, () => {
      const x = n(rnd() * 200);
      const y = n(HORIZON + 2 + rnd() * 52);
      const r = n(0.8 + rnd() * 1.3);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${n(0.4 + rnd() * 0.4)}" />`;
    }).join(''),
};

/* ------------------------------------------------------------------ scenery */

// Base at (0, 0), growing up into -y. Nothing here has a corner sharper than a leaf tip.
export const SCENERY = {
  tree: (c) => `
    <path d="M-3 0 L-2.2 -13 L2.2 -13 L3 0 Z" fill="${c.wood}" />
    <circle cx="0" cy="-19" r="10.5" fill="${c.leafDark}" />
    <circle cx="-6" cy="-15.5" r="7.4" fill="${c.leaf}" />
    <circle cx="6.5" cy="-16.5" r="8" fill="${c.leaf}" />
    <circle cx="0" cy="-23.5" r="7" fill="${c.leaf}" />`,
  pine: (c) => `
    <path d="M-2.2 0 L-1.6 -7 L1.6 -7 L2.2 0 Z" fill="${c.wood}" />
    <path d="M0 -22 L9.5 -6.5 L-9.5 -6.5 Z" fill="${c.leafDark}" />
    <path d="M0 -30 L7 -16 L-7 -16 Z" fill="${c.leaf}" />`,
  snowpine: (c) => `
    <path d="M-2.2 0 L-1.6 -7 L1.6 -7 L2.2 0 Z" fill="${c.wood}" />
    <path d="M0 -22 L9.5 -6.5 L-9.5 -6.5 Z" fill="${c.leafDark}" />
    <path d="M0 -30 L7 -16 L-7 -16 Z" fill="${c.leaf}" />
    <path d="M0 -30 L4.4 -21.5 Q0 -19 -4.4 -21.5 Z" fill="#ffffff" />
    <path d="M-9.5 -6.5 Q-4 -9 0 -6.5 Q4 -9 9.5 -6.5 Z" fill="#ffffff" opacity="0.9" />`,
  palm: (c) => `
    <path d="M-2 0 Q-1.4 -11 3.6 -20 L6.4 -19 Q1.8 -10 2 0 Z" fill="${c.wood}" />
    <g transform="translate(5 -20)" fill="${c.leaf}">
      <ellipse cx="9" cy="0" rx="9" ry="3.3" transform="rotate(-16)" />
      <ellipse cx="-9" cy="0" rx="9" ry="3.3" transform="rotate(16)" />
      <ellipse cx="7.5" cy="0" rx="8" ry="3" transform="rotate(-54)" />
      <ellipse cx="-7.5" cy="0" rx="8" ry="3" transform="rotate(54)" />
      <circle cx="0" cy="-1" r="2.4" fill="${c.leafDark}" />
    </g>`,
  bush: (c) => `
    <ellipse cx="0" cy="-3" rx="11" ry="7" fill="${c.leafDark}" />
    <circle cx="-4.5" cy="-6.5" r="5.6" fill="${c.leaf}" />
    <circle cx="4" cy="-7.5" r="6.2" fill="${c.leaf}" />
    <circle cx="0" cy="-10" r="4.6" fill="${c.leaf}" />`,
  flowers: (c) => `
    <g stroke="${c.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round">
      <path d="M-4 0 q-1 -5 -1.6 -8" /><path d="M0 0 q1 -6 1.4 -10" /><path d="M4.5 0 q0.6 -4 0.4 -7" />
    </g>
    <circle cx="-5.6" cy="-8.6" r="2.6" fill="${c.bloom}" />
    <circle cx="1.4" cy="-10.6" r="3" fill="${c.accent}" />
    <circle cx="4.9" cy="-7.2" r="2.3" fill="${c.bloom}" />
    <circle cx="-5.6" cy="-8.6" r="0.9" fill="#fff8e0" />
    <circle cx="1.4" cy="-10.6" r="1" fill="#fff8e0" />`,
  reeds: (c) => `
    <g stroke="${c.leafDark}" stroke-width="1.3" fill="none" stroke-linecap="round">
      <path d="M-4 0 q-1.4 -8 -2 -13" /><path d="M0 0 q0.6 -9 0.8 -15" /><path d="M4 0 q1.6 -7 2.4 -11" />
    </g>
    <rect x="-7" y="-17.5" width="2.6" height="5.4" rx="1.3" fill="${c.wood}" />
    <rect x="-0.5" y="-19.5" width="2.8" height="5.8" rx="1.4" fill="${c.wood}" />`,
  rock: (c) => `
    <path d="M-9 0 Q-10 -6 -4.5 -8.4 Q0 -10.6 4.6 -8 Q9.6 -5.4 8.8 0 Z" fill="${c.stone}" />
    <path d="M-4.5 -8.4 Q0 -10.6 4.6 -8 Q1 -6.6 -4.5 -8.4 Z" fill="${c.stoneLight}" opacity="0.8" />`,
  mushroom: (c) => `
    <path d="M-2.4 0 Q-2.8 -5 -2 -7.4 L2 -7.4 Q2.8 -5 2.4 0 Z" fill="#f6efe2" />
    <path d="M-8.4 -7 Q-8.4 -14.6 0 -14.6 Q8.4 -14.6 8.4 -7 Z" fill="${c.bloom}" />
    <circle cx="-3.4" cy="-10" r="1.7" fill="#fff8e0" opacity="0.9" />
    <circle cx="2.6" cy="-11.4" r="1.3" fill="#fff8e0" opacity="0.9" />
    <ellipse cx="0" cy="-7" rx="8.4" ry="1.6" fill="${c.glow}" opacity="0.55" />`,
  crystal: (c) => `
    <path d="M-6 0 L-3.4 -13 L0 -16 L1.6 0 Z" fill="${c.glowDeep}" />
    <path d="M1.6 0 L0 -16 L4.4 -11 L6.6 0 Z" fill="${c.glow}" />
    <path d="M-3.4 -13 L0 -16 L1.6 0 Z" fill="#ffffff" opacity="0.35" />`,
  cactus: (c) => `
    <rect x="-4" y="-19" width="8" height="19" rx="4" fill="${c.leaf}" />
    <path d="M-4 -11 q-5 0 -5 4 l0 3 q0 1.6 1.8 1.6 q1.8 0 1.8 -1.6 l0 -2.4 q0 -1.6 1.4 -1.6 Z" fill="${c.leafDark}" />
    <path d="M4 -14 q5 0 5 4 l0 4 q0 1.6 -1.8 1.6 q-1.8 0 -1.8 -1.6 l0 -3.4 q0 -1.6 -1.4 -1.6 Z" fill="${c.leafDark}" />
    <circle cx="0" cy="-20" r="2.4" fill="${c.bloom}" />`,
  snowdrift: () => `
    <ellipse cx="0" cy="-1" rx="12" ry="5.4" fill="#ffffff" />
    <ellipse cx="-3.5" cy="-4.4" rx="6.4" ry="3.6" fill="#ffffff" />
    <ellipse cx="4" cy="-3.4" rx="5" ry="2.8" fill="#f2f7ff" />`,
  cloudpuff: () => `
    <ellipse cx="0" cy="-3" rx="13" ry="5.4" fill="#ffffff" />
    <circle cx="-5" cy="-6.4" r="6" fill="#ffffff" />
    <circle cx="4.6" cy="-7.4" r="7" fill="#fbfdff" />`,
};

export const SCENERY_IDS = Object.keys(SCENERY);

/* -------------------------------------------------------------------- props */

/** Where the pet sleeps. A cushion of its own biome's stuff — never a cage, never a pen. */
export const NEST = (c) => `
  <ellipse cx="0" cy="-1" rx="14" ry="5.6" fill="${c.nestDark}" />
  <ellipse cx="0" cy="-3" rx="11.6" ry="4.4" fill="${c.nest}" />
  <ellipse cx="0" cy="-3.6" rx="8.4" ry="2.8" fill="${c.nestLight}" />`;

/** The plant the treats grow on, so food is part of the world rather than a menu. */
// Where the fruit hangs on each larder, so a treat sits on its plant rather than beside it.
export const LARDER_SPOTS = {
  bush: [[-5.4, -9.4], [5.2, -10.4], [-0.2, -14.2]],
  tree: [[-6.4, -18], [6.6, -19.2], [0, -23.4]],
  basket: [[-4.6, -7.2], [4.6, -7.8], [0, -10.4]],
  coral: [[-5, -11.4], [4.2, -9], [0.4, -15.2]],
};

export const LARDER = {
  bush: (c) => `
    <ellipse cx="0" cy="-4" rx="12.6" ry="8" fill="${c.leafDark}" />
    <circle cx="-5.2" cy="-8.4" r="6.4" fill="${c.leaf}" />
    <circle cx="5" cy="-9.4" r="7" fill="${c.leaf}" />
    <circle cx="0" cy="-12.6" r="5.4" fill="${c.leaf}" />`,
  tree: (c) => `
    <path d="M-3.2 0 L-2.4 -14 L2.4 -14 L3.2 0 Z" fill="${c.wood}" />
    <circle cx="0" cy="-20" r="11" fill="${c.leafDark}" />
    <circle cx="-6.4" cy="-16.4" r="7.6" fill="${c.leaf}" />
    <circle cx="6.6" cy="-17.4" r="8.2" fill="${c.leaf}" />`,
  basket: (c) => `
    <path d="M-11 -1 Q-11 -11 0 -11 Q11 -11 11 -1 Z" fill="${c.wood}" />
    <path d="M-11 -7 L11 -7" stroke="${c.stoneLight}" stroke-width="1.2" opacity="0.5" />
    <path d="M-8.4 -11 Q0 -20 8.4 -11" stroke="${c.wood}" stroke-width="1.8" fill="none" />`,
  coral: (c) => `
    <path d="M0 0 q-1 -8 -5 -11 q4 0 6 4 q1 -7 5 -10 q1 6 -2 11 q3 -3 6 -3 q-3 4 -6 9 Z" fill="${c.bloom}" />
    <circle cx="-5" cy="-11" r="2.2" fill="${c.accent}" />`,
};

/** The food itself. Drawn centred on (0, 0) at roughly a 9-unit span, so all kinds swap. */
export const TREATS = {
  berry: (c) => `
    <circle cx="-1.6" cy="0.8" r="3" fill="${c.accent}" />
    <circle cx="2" cy="-0.4" r="3.4" fill="${c.bloom}" />
    <circle cx="1.1" cy="-1.4" r="1" fill="#fff8e0" opacity="0.8" />
    <path d="M2 -3.6 q2.6 -2.4 4.4 -1.4 q-1 2.6 -4 2.6 Z" fill="${c.leaf}" />`,
  apple: (c) => `
    <circle cx="0" cy="0.4" r="4" fill="${c.accent}" />
    <circle cx="-1.4" cy="-1.2" r="1.2" fill="#fff8e0" opacity="0.75" />
    <path d="M0 -3.4 l0.4 -2.6" stroke="${c.wood}" stroke-width="1.1" stroke-linecap="round" />
    <path d="M0.6 -5.2 q2.8 -1.8 4.2 -0.4 q-1.4 2.2 -4.2 1.4 Z" fill="${c.leaf}" />`,
  melon: (c) => `
    <circle cx="0" cy="0" r="4.2" fill="${c.leaf}" />
    <path d="M-2.6 -3.3 q0.8 3.4 0 6.6 M0.4 -4.2 q1 4.2 0 8.4" stroke="${c.leafDark}" stroke-width="1" fill="none" />
    <path d="M0 -4.2 l0.6 -2" stroke="${c.wood}" stroke-width="1.1" stroke-linecap="round" />`,
  carrot: (c) => `
    <path d="M-2.6 -2 L2.6 -2 L0.4 5.4 Z" fill="${c.accent}" />
    <path d="M-1.4 -0.4 L1.6 -0.4 M-0.9 1.4 L1.1 1.4" stroke="#ffffff" stroke-width="0.7" opacity="0.45" />
    <g fill="${c.leaf}">
      <ellipse cx="-1.8" cy="-3.6" rx="2.2" ry="1.2" transform="rotate(-34 -1.8 -3.6)" />
      <ellipse cx="1.8" cy="-3.6" rx="2.2" ry="1.2" transform="rotate(34 1.8 -3.6)" />
      <ellipse cx="0" cy="-4.6" rx="1.2" ry="2.2" />
    </g>`,
  fish: (c) => `
    <ellipse cx="0.4" cy="0" rx="4.4" ry="2.8" fill="${c.accent}" />
    <path d="M-3.6 0 L-6.6 -2.6 L-6.6 2.6 Z" fill="${c.bloom}" />
    <circle cx="2.2" cy="-0.7" r="0.8" fill="#43354f" />
    <path d="M0.4 -2.8 q1.6 -1.4 3 -0.4" stroke="${c.bloom}" stroke-width="1" fill="none" />`,
  glowberry: (c) => `
    <circle cx="0" cy="0" r="5" fill="${c.glow}" opacity="0.45" />
    <circle cx="0" cy="0" r="3.2" fill="${c.glowDeep}" />
    <circle cx="-1.1" cy="-1.1" r="1.1" fill="#ffffff" opacity="0.85" />`,
  starfruit: (c) => `
    <path d="M0 -4.6 L1.4 -1.4 L4.6 -1.4 L2.1 0.7 L3.1 3.9 L0 2 L-3.1 3.9 L-2.1 0.7 L-4.6 -1.4 L-1.4 -1.4 Z"
          fill="${c.bloom}" />
    <circle cx="0" cy="-0.2" r="1.1" fill="#fff8e0" opacity="0.8" />`,
};

export const TREAT_IDS = Object.keys(TREATS);

/** The ball. The one prop that is the same in every habitat, so it is always findable. */
export const BALL = (c) => `
  <circle cx="0" cy="0" r="5" fill="${c.ballA}" />
  <path d="M-5 0 a5 5 0 0 1 10 0 Z" fill="${c.ballB}" />
  <circle cx="-1.7" cy="-1.9" r="1.4" fill="#ffffff" opacity="0.7" />`;

/** The tuft the ball comes to rest on, so its home spot reads as deliberate. */
export const BALL_REST = (c) => `
  <ellipse cx="0" cy="0" rx="7.4" ry="2.6" fill="${c.leafDark}" opacity="0.45" />`;

/* ---------------------------------------------------------------- furniture */

/**
 * The pieces the stall sells. Same contract as SCENERY: base at (0, 0), growing upward into
 * -y, coloured entirely from the habitat's palette so a bought house belongs to the biome it
 * lands in rather than looking pasted on.
 *
 * The habitat rules apply here more than anywhere, because these are the only parts of a
 * scene a child chose: nothing that reads as a cage, nothing sharp, and every piece has to
 * survive nightfall. Anything with a lamp in it draws that lamp with `glow`, which is light
 * rather than surface and so does not take the night tint — at midnight the lantern is the
 * brightest thing in the habitat, which is exactly what a lantern is for.
 *
 * `WIDE` lists the pieces that need elbow room; shop.js gives those the roomier side band.
 */
export const FURNITURE = {
  flowerbed: (c) => `
    <path d="M-9 0 L-7.6 -4.4 L7.6 -4.4 L9 0 Z" fill="${c.wood}" />
    <path d="M-7.6 -4.4 L7.6 -4.4 L6.6 -5.6 L-6.6 -5.6 Z" fill="${c.groundRim}" />
    <g stroke="${c.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round">
      <path d="M-4.6 -5.6 q-0.8 -3.4 -1.2 -5.6" />
      <path d="M0 -5.6 q0.8 -4 1 -6.8" />
      <path d="M4.6 -5.6 q0.4 -3 0.2 -5" />
    </g>
    <circle cx="-5.8" cy="-11.8" r="2.5" fill="${c.bloom}" />
    <circle cx="1" cy="-13" r="2.8" fill="${c.accent}" />
    <circle cx="4.8" cy="-11" r="2.3" fill="${c.bloom}" />
    <circle cx="1" cy="-13" r="1" fill="#fff8e0" opacity="0.8" />`,

  lantern: (c) => `
    <ellipse cx="0" cy="-0.6" rx="5" ry="2" fill="${c.stone}" />
    <path d="M-1.5 -1.6 L-1.1 -17 L1.1 -17 L1.5 -1.6 Z" fill="${c.wood}" />
    <path d="M-4.4 -17 L4.4 -17 L3 -19 L-3 -19 Z" fill="${c.stoneLight}" />
    <circle cx="0" cy="-23" r="7" fill="${c.glow}" opacity="0.4" />
    <path d="M-3.4 -17 L-2.6 -25 L2.6 -25 L3.4 -17 Z" fill="${c.glowDeep}" />
    <path d="M-3.4 -17 L-2.6 -25 L2.6 -25 L3.4 -17 Z" fill="none" stroke="${c.wood}" stroke-width="1.2" />
    <path d="M-3 -25.4 L3 -25.4 L1.6 -27.6 L-1.6 -27.6 Z" fill="${c.stoneLight}" />
    <circle cx="0" cy="-21" r="2" fill="#fff8e0" opacity="0.85" />`,

  house: (c) => `
    <path d="M-13 0 L-13 -11 L13 -11 L13 0 Z" fill="${c.wood}" />
    <path d="M-13 -11 L-13 -8.4 L13 -8.4 L13 -11 Z" fill="${c.stone}" opacity="0.3" />
    <path d="M0 -22 L15.6 -10 L-15.6 -10 Z" fill="${c.nestDark}" />
    <path d="M0 -19.4 L11.6 -10.6 L-11.6 -10.6 Z" fill="${c.nest}" />
    <path d="M-6 0 Q-6 -8.6 0 -8.6 Q6 -8.6 6 0 Z" fill="${c.groundRim}" />
    <path d="M-6 0 Q-6 -8.6 0 -8.6 Q6 -8.6 6 0" fill="none" stroke="${c.nestLight}" stroke-width="1.4" />
    <circle cx="0" cy="-14.4" r="2" fill="${c.glow}" opacity="0.55" />`,

  swing: (c) => `
    <path d="M-11 0 L-1.4 -18 M11 0 L1.4 -18" stroke="${c.wood}" stroke-width="2.4" stroke-linecap="round" />
    <path d="M-4.6 -17.4 L4.6 -17.4" stroke="${c.wood}" stroke-width="2" stroke-linecap="round" />
    <path d="M-3.4 -17 L-3.4 -7.6 M3.4 -17 L3.4 -7.6" stroke="${c.stoneLight}" stroke-width="1.1" />
    <path d="M-5 -7.6 L5 -7.6 L5 -6 L-5 -6 Z" fill="${c.nest}" />
    <path d="M-5 -6 L5 -6 L5 -5.4 L-5 -5.4 Z" fill="${c.nestDark}" />`,

  pond: (c) => `
    <ellipse cx="0" cy="-2" rx="11.6" ry="5" fill="${c.groundRim}" />
    <ellipse cx="0" cy="-2.6" rx="10" ry="4" fill="${c.water}" />
    <ellipse cx="-2.4" cy="-3.4" rx="4" ry="1.4" fill="${c.waterLight}" opacity="0.7" />
    <ellipse cx="4.4" cy="-1.6" rx="3" ry="1.2" fill="${c.leaf}" />
    <circle cx="4.4" cy="-2.2" r="1.4" fill="${c.bloom}" />
    <circle cx="-6" cy="-1.2" r="1.8" fill="${c.stoneLight}" />`,

  hammock: (c) => `
    <path d="M-12 0 L-11.4 -16" stroke="${c.wood}" stroke-width="2.4" stroke-linecap="round" />
    <path d="M12 0 L11.4 -16" stroke="${c.wood}" stroke-width="2.4" stroke-linecap="round" />
    <path d="M-11.4 -15 Q0 -3.4 11.4 -15" fill="${c.nest}" stroke="${c.nestDark}" stroke-width="1.2" />
    <path d="M-8 -11.4 Q0 -5.6 8 -11.4" fill="none" stroke="${c.nestLight}" stroke-width="1" opacity="0.8" />
    <circle cx="-11.4" cy="-16" r="1.6" fill="${c.leaf}" />
    <circle cx="11.4" cy="-16" r="1.6" fill="${c.leaf}" />`,

  arch: (c) => `
    <path d="M-12 0 L-12 -12 Q-12 -22 0 -22 Q12 -22 12 -12 L12 0"
          fill="none" stroke="${c.wood}" stroke-width="2.8" stroke-linecap="round" />
    <g fill="${c.leaf}">
      <ellipse cx="-11.4" cy="-15" rx="3.4" ry="2.4" transform="rotate(-24 -11.4 -15)" />
      <ellipse cx="-6.6" cy="-20.6" rx="3.6" ry="2.4" transform="rotate(-12 -6.6 -20.6)" />
      <ellipse cx="6.6" cy="-20.6" rx="3.6" ry="2.4" transform="rotate(12 6.6 -20.6)" />
      <ellipse cx="11.4" cy="-15" rx="3.4" ry="2.4" transform="rotate(24 11.4 -15)" />
    </g>
    <circle cx="-9.4" cy="-18.6" r="2" fill="${c.bloom}" />
    <circle cx="0" cy="-22.6" r="2.2" fill="${c.accent}" />
    <circle cx="9.4" cy="-18.6" r="2" fill="${c.bloom}" />`,

  windmill: (c) => `
    <path d="M-4.4 0 L-1.2 -20 L1.2 -20 L4.4 0 Z" fill="${c.wood}" />
    <path d="M-4.4 0 L-1.2 -20 L0 -20 L0 0 Z" fill="${c.stone}" opacity="0.25" />
    <g class="hab-vane" transform="translate(0 -21)">
      <path d="M0 0 L1.6 -9 L-1.6 -9 Z" fill="${c.accent}" />
      <path d="M0 0 L9 -1.6 L9 1.6 Z" fill="${c.bloom}" />
      <path d="M0 0 L-1.6 9 L1.6 9 Z" fill="${c.accent}" />
      <path d="M0 0 L-9 1.6 L-9 -1.6 Z" fill="${c.bloom}" />
    </g>
    <circle cx="0" cy="-21" r="1.8" fill="${c.stoneLight}" />`,
};

export const FURNITURE_IDS = Object.keys(FURNITURE);

/** How much room each piece needs either side of its spot, for the spacing check. */
export const FURNITURE_HALF_WIDTH = 16;

/* -------------------------------------------------------------------- extra */

/** Fireflies and drifting motes — night and glow biomes only, and motion-optional. */
export function motesMarkup(c, seed, count = 12) {
  const rnd = rndFrom(seed + 91);
  return Array.from({ length: count }, (_, i) => {
    const x = n(20 + rnd() * 160);
    const y = n(HORIZON - 10 + rnd() * 52);
    const r = n(0.9 + rnd() * 1.1);
    const delay = n(rnd() * 6);
    const drift = n(4 + rnd() * 7);
    return `<circle class="hab-mote" cx="${x}" cy="${y}" r="${r}" fill="${c.glow}"
      style="--mote-delay:${delay}s; --mote-drift:${drift}px" />`;
  }).join('');
}

export { n as round2 };
