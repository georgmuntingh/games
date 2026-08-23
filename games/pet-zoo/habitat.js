// Where each pet lives. The sibling of pets.js, and it works the same way: a species-level
// identity (which biome, which plants, what the light is like) plus a per-pet variation
// drawn from the same trait index that makes one Mochi look different from the next — so
// the nine Mochis in a full zoo get nine recognisably-Mochi but individually different homes.
//
// Nothing here is stored. A habitat is derived from (h, m) exactly the way an appearance
// is, which is why 144 of them cost no bytes. `item.habitat`, if a later build ever writes
// one, is merged over the generated base — the hook that makes habitats modifiable without
// making them stored.
//
// Pure: no DOM, no Date, no storage, no randomness that isn't seeded. That is what lets
// tests/ walk all 144 and assert on the markup.

import { timeId } from './clock.js';
import {
  BALL,
  BALL_REST,
  DETAIL,
  FAR,
  groundMarkup,
  HORIZON,
  LARDER,
  LARDER_SPOTS,
  motesMarkup,
  NEST,
  orbPoint,
  PET_FOOT,
  PET_SIZE,
  PHASES,
  phaseOfHour,
  ROAM,
  rndFrom,
  round2 as n,
  SAFE,
  SCENERY,
  skyMarkup,
  TREATS,
  VIEW,
  WALK_Y,
} from './habitat-parts.js';
import { hash, SPECIES, speciesFor, traitIndexFor } from './pets.js';

export { HORIZON, PET_FOOT, PET_SIZE, ROAM, SAFE, VIEW, WALK_Y };

/* ------------------------------------------------------------------ colour */

const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));

const toRgb = (hex) => {
  const h = String(hex).replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
};

const toHex = (rgb) => `#${rgb.map((v) => clamp255(v).toString(16).padStart(2, '0')).join('')}`;

/** Blend two colours. Every tint in this file goes through here, so nothing drifts. */
export function mix(a, b, t) {
  const w = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  return toHex([r1 + (r2 - r1) * w, g1 + (g2 - g1) * w, b1 + (b2 - b1) * w]);
}

/**
 * What the time of day does to everything on the ground. It has to carry the hour on its
 * own: a wide screen crops most of the sky away, so a scene that said "night" only with a
 * moon would say nothing at all in landscape.
 *
 * Night is a *blue* tint rather than a black one. The rule the tests hold to is that a
 * child must be able to see their pet as clearly at midnight as at noon.
 */
const GROUND_TINT = {
  dawn: { color: '#ffb47e', amount: 0.2 },
  morning: { color: '#fffbe8', amount: 0.08 },
  noon: { color: '#ffffff', amount: 0.03 },
  afternoon: { color: '#ffc474', amount: 0.2 },
  dusk: { color: '#7f66c0', amount: 0.3 },
  night: { color: '#33437e', amount: 0.44 },
};

/* ------------------------------------------------------------------ biomes */

// The colours every biome starts from; each one overrides only what actually differs.
const BASE_COLORS = {
  far: '#8fc06a',
  farDark: '#6ea54f',
  ground: ['#a9d581', '#7fbc5e'],
  groundNear: '#97ca70',
  leaf: '#7fc65c',
  leafDark: '#54a03c',
  wood: '#a87b52',
  stone: '#c6c0b2',
  stoneLight: '#e4dfd4',
  bloom: '#ffd7e6',
  accent: '#ff9ec0',
  nest: '#ecdcaa',
  nestDark: '#c9b47f',
  nestLight: '#f8f0cf',
  glow: '#fff0b0',
  glowDeep: '#ffd66b',
  water: '#7fc4e8',
  waterLight: '#c4e8f8',
};

/**
 * Eight open landscapes. Not one of them has a fence, a wall or a gate in it: a habitat
 * is somewhere a pet lives, not somewhere a pet is kept.
 */
export const BIOMES = {
  meadow: {
    far: 'hills',
    detail: 'grass',
    larder: 'bush',
    treat: 'berry',
    scenery: ['tree', 'bush', 'flowers', 'rock'],
    colors: {},
  },
  grove: {
    far: 'treeline',
    detail: 'fern',
    larder: 'tree',
    treat: 'apple',
    scenery: ['pine', 'tree', 'mushroom', 'rock'],
    colors: {
      far: '#5f9d55', farDark: '#3f7a41', ground: ['#8cc474', '#5f9c55'], groundNear: '#7ab266',
      leaf: '#63b061', leafDark: '#3d8845', wood: '#8a6242', bloom: '#ffd08a',
    },
  },
  pond: {
    far: 'hills',
    detail: 'lily',
    larder: 'bush',
    treat: 'apple',
    scenery: ['reeds', 'bush', 'flowers', 'rock'],
    colors: {
      far: '#87c69a', farDark: '#63a97e', ground: ['#9ed3a4', '#6fb894'], groundNear: '#8fcc9e',
      leaf: '#6fc08c', leafDark: '#46976a', bloom: '#ffe4a8',
    },
  },
  shore: {
    far: 'sea',
    detail: 'shells',
    larder: 'coral',
    treat: 'fish',
    scenery: ['palm', 'rock', 'bush', 'flowers'],
    colors: {
      far: '#f0dcb0', farDark: '#dcbe94', ground: ['#f6e6bd', '#e6cf9a'], groundNear: '#f2dfb0',
      leaf: '#78c47e', leafDark: '#519a5c', wood: '#b9885a', stone: '#e0d6c0', stoneLight: '#f4ecdc',
      bloom: '#ffc0a8', water: '#5fbfe4', waterLight: '#bde8f6',
    },
  },
  dune: {
    far: 'dunes',
    detail: 'pebbles',
    larder: 'basket',
    treat: 'melon',
    scenery: ['cactus', 'rock', 'flowers', 'bush'],
    colors: {
      far: '#f2d49a', farDark: '#dcb87c', ground: ['#f8e2ae', '#e8c78c'], groundNear: '#f4dca4',
      leaf: '#8cc078', leafDark: '#5f9455', wood: '#c08c58', stone: '#dccbaa', stoneLight: '#f2e7cd',
      bloom: '#ffb3c8',
    },
  },
  snowfield: {
    far: 'peaks',
    detail: 'snow',
    larder: 'basket',
    treat: 'carrot',
    scenery: ['snowpine', 'snowdrift', 'rock', 'snowpine'],
    colors: {
      far: '#bcd0ea', farDark: '#93aed2', ground: ['#eef5ff', '#cfe0f4'], groundNear: '#e4eeff',
      leaf: '#5f9c78', leafDark: '#417a5c', wood: '#8a6a52', stone: '#c8d4e6', stoneLight: '#eaf1fa',
      bloom: '#c8dcff', glow: '#dbeaff', glowDeep: '#9fc4f0',
    },
  },
  glowvale: {
    far: 'arch',
    detail: 'spores',
    larder: 'bush',
    treat: 'glowberry',
    scenery: ['mushroom', 'crystal', 'rock', 'bush'],
    colors: {
      far: '#6a5a94', farDark: '#4a3f70', ground: ['#8f7fbc', '#6b5c96'], groundNear: '#8474ae',
      leaf: '#7fc4a8', leafDark: '#4f9a80', wood: '#7a5f8e', stone: '#a89cc4', stoneLight: '#cfc6e4',
      bloom: '#c8a0ff', glow: '#a8f0e0', glowDeep: '#5fd8c4',
    },
  },
  cloudtop: {
    far: 'cloudbank',
    detail: 'sparkle',
    larder: 'basket',
    treat: 'starfruit',
    scenery: ['cloudpuff', 'crystal', 'flowers', 'cloudpuff'],
    colors: {
      // Kept a clear step darker than any sky: a white ground under a pale dawn leaves
      // the horizon invisible and the whole scene reads as fog.
      far: '#d2e0fa', farDark: '#b0c6ec', ground: ['#e2ecff', '#c2d4f0'], groundNear: '#d6e4fb',
      leaf: '#8ec8ea', leafDark: '#6aa6d6', wood: '#b0a8cc', stone: '#c8d6ee', stoneLight: '#e6eefc',
      bloom: '#ffd9f0', glow: '#fff0c8', glowDeep: '#ffd98a',
    },
  },
};

export const BIOME_IDS = Object.keys(BIOMES);

/**
 * Each species belongs somewhere. Two species may share a biome; they never share a look,
 * because the palette is blended from the species' own colours.
 *
 * The four tier-3 species hold 96 of the 144 times between them — a full zoo is mostly
 * Sprouts, Bubs, Zzzs and Tumbles — so those four get four *different* biomes. Otherwise
 * three quarters of the zoo would live in the same place, whatever the table said.
 */
export const SPECIES_BIOME = {
  // The four common ones, deliberately spread
  sprout: 'meadow',
  bubs: 'pond',
  zzz: 'snowfield',
  tumble: 'dune',
  // and the twelve rarer ones, sorted by what they look like they'd want
  mochi: 'meadow',
  bloop: 'pond',
  pebble: 'snowfield',
  nibbles: 'dune',
  pip: 'grove',
  snug: 'grove',
  noodle: 'grove',
  cloudlet: 'shore',
  waddle: 'shore',
  glim: 'glowvale',
  fizz: 'glowvale',
  puff: 'cloudtop',
};

export const biomeOfSpecies = (speciesId) => SPECIES_BIOME[speciesId] ?? 'meadow';

/* ------------------------------------------------------------------ layouts */

/**
 * Where things stand. A piece is [x, scale], and its depth follows from its scale — see
 * `sceneryY` — so a big piece is automatically near and in front of the pet, and a small
 * one automatically far and behind it. One rule instead of a back list and a front list
 * that can disagree.
 *
 * The three interactive spots stay inside the safe box, because a child has to be able to
 * reach them on any screen shape; scenery is free to run off the edges and frame the view.
 */
// Each layout is four pieces and three spots. The two small pieces are far (they sit high
// and behind the pet), the medium one sits at the edge of the safe box, and the big one is
// near framing that a portrait crop is meant to slice into. The three spots go in the side
// bands, leaving the middle for the pet.
export const LAYOUTS = [
  { pieces: [[78, 0.56], [124, 0.6], [36, 0.86], [176, 1.3]], larder: 52, ball: 78, nest: 126 },
  { pieces: [[86, 0.55], [118, 0.58], [166, 0.88], [26, 1.26]], nest: 74, ball: 122, larder: 148 },
  { pieces: [[74, 0.52], [128, 0.62], [34, 0.9], [178, 1.22]], larder: 150, ball: 124, nest: 78 },
  { pieces: [[90, 0.6], [112, 0.54], [168, 0.84], [24, 1.28]], nest: 120, ball: 80, larder: 54 },
  { pieces: [[80, 0.58], [130, 0.53], [38, 0.94], [174, 1.24]], larder: 56, ball: 82, nest: 128 },
  { pieces: [[88, 0.54], [120, 0.6], [164, 0.8], [30, 1.3]], nest: 72, ball: 118, larder: 146 },
  { pieces: [[76, 0.57], [126, 0.52], [32, 0.88], [180, 1.22]], larder: 148, ball: 120, nest: 76 },
];

// The nest is the one spot the pet itself stands on — asleep, or as an egg — so it has to
// leave room for a whole pet inside the crop, not just for the cushion.
export const NEST_KEEP = { x0: 66, x1: 134 };

// The middle of the field belongs to the pet. Props keep to the two side bands so there is
// always somewhere central for it to stand that is not on top of something it can pick up.
export const CENTRE_KEEP = { x0: 88, x1: 112 };

// Coprime with the layout count, so consecutive times get visibly different homes rather
// than the same one twice — the trick TRAIT_STRIDE plays on appearance, at a smaller scale.
export const LAYOUT_STRIDE = 3;

/**
 * Where the pet idles, and where it brings the ball back to. Chosen rather than fixed: it
 * has to stand clear of the nest, the larder and the ball's own resting tuft — a pet
 * standing on top of its ball cannot be handed its ball — while staying near enough to the
 * middle to be on screen whichever way the scene gets cropped.
 */
export function homeSpotFor(layout, roam) {
  const busy = [layout.nest, layout.larder, layout.ball];
  let best = 100;
  let bestScore = -Infinity;
  for (let x = roam.x0 + 12; x <= roam.x1 - 12; x += 2) {
    const clearance = Math.min(...busy.map((b) => Math.abs(x - b)));
    const score = clearance - Math.abs(x - 100) * 0.4;
    if (score > bestScore) {
      bestScore = score;
      best = x;
    }
  }
  return best;
}

/** Bigger reads as nearer, and nearer reads as lower. Depth for free, and never wrong. */
export const sceneryY = (scale) => n(HORIZON + 10 + (scale - 0.5) * 40);

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ----------------------------------------------------------------- lighting */

/**
 * A pet knows one time, and the game only ever writes it as 1..12 — so whether that is
 * morning or evening is a choice this makes once, from a hash, and never changes. The
 * habitat's light then says roughly when this pet's day happens: dawn, midday, dusk, night.
 *
 * Deliberately *not* a question. Nothing here has to be read, and nothing can be got wrong.
 */
// Waking hours, roughly. A time whose two readings straddle this range takes the one
// inside it three times in four — a straight coin flip would put better than a third of
// the zoo under stars, and night is worth more as the exception than as the default.
const LIT_FROM = 6;
const LIT_TO = 20;
const DAY_ODDS = 4; // one in this many goes the other way

export function lightingFor(h, m) {
  const twelve = h % 12;
  const roll = hash(`t${timeId(h, m)}`) % DAY_ODDS;
  const lit = (x) => x >= LIT_FROM && x <= LIT_TO;
  // Exactly one of the two readings is outside the lit range for nine hours in twelve;
  // for the other three (6, 7, 8) both are, and the roll simply decides.
  const pm = lit(twelve) === lit(twelve + 12) ? roll % 2 === 1 : lit(twelve + 12) !== (roll === 0);
  const hour24 = twelve + (pm ? 12 : 0);
  const phase = phaseOfHour(hour24);
  return { hour24, pm, phase, night: PHASES[phase].night, orb: orbPoint(hour24) };
}

/** A biome's colours, warmed toward the pet that lives in it and toward the hour it is. */
export function paletteFor(speciesId, biomeId, phase) {
  const spec = SPECIES[speciesId] ?? SPECIES.mochi;
  const [body, belly, accent] = spec.palette;
  const base = { ...BASE_COLORS, ...(BIOMES[biomeId]?.colors ?? {}) };
  const tint = GROUND_TINT[phase] ?? GROUND_TINT.noon;
  const lit = (hex, toward = 0.1) => mix(mix(hex, accent, toward), tint.color, tint.amount);

  return {
    far: lit(base.far),
    farDark: lit(base.farDark),
    ground: [lit(base.ground[0], 0.12), lit(base.ground[1], 0.12)],
    groundNear: lit(base.groundNear, 0.14),
    // Always a step darker than the ground it edges, whatever the biome and hour did to it.
    groundRim: mix(lit(base.ground[0], 0.12), '#2b2440', 0.34),
    leaf: lit(base.leaf),
    leafDark: lit(base.leafDark),
    wood: lit(base.wood, 0.07),
    stone: lit(base.stone, 0.07),
    stoneLight: lit(base.stoneLight, 0.05),
    water: lit(base.water, 0.07),
    waterLight: lit(base.waterLight, 0.05),
    // Blossoms and the bed are the pet's own colours — the two places its palette should
    // still read clearly at dusk, so they take the tint at half strength.
    bloom: mix(mix(base.bloom, body, 0.42), tint.color, tint.amount * 0.5),
    accent: mix(accent, tint.color, tint.amount * 0.4),
    nest: mix(base.nest, belly, 0.45),
    nestDark: mix(base.nestDark, accent, 0.32),
    nestLight: mix(base.nestLight, belly, 0.5),
    // Glow is light, not surface: it does not take the night tint, it fights it.
    glow: base.glow,
    glowDeep: base.glowDeep,
    ballA: accent,
    ballB: belly,
  };
}

/* ---------------------------------------------------------------- generator */

/**
 * The complete habitat for the pet that keeps a given time: its biome, its light, where
 * everything stands, and where the pet may walk.
 */
export function habitatFor(h, m) {
  const species = speciesFor(h, m);
  const biomeId = biomeOfSpecies(species);
  const biome = BIOMES[biomeId];
  const index = traitIndexFor(h, m);
  const light = lightingFor(h, m);
  const layout = LAYOUTS[(index * LAYOUT_STRIDE) % LAYOUTS.length];
  const seed = hash(`hab${timeId(h, m)}`) % 100000;

  const scenery = layout.pieces.map(([x, scale], i) => ({
    id: biome.scenery[(index + i) % biome.scenery.length],
    x,
    scale,
    y: sceneryY(scale),
    flip: (index + i) % 2 === 1,
  }));

  const larderSpots = (LARDER_SPOTS[biome.larder] ?? LARDER_SPOTS.bush).map(([dx, dy]) => ({
    x: n(layout.larder + dx),
    y: n(WALK_Y + dy),
  }));

  return {
    id: timeId(h, m),
    species,
    biome: biomeId,
    light,
    palette: paletteFor(species, biomeId, light.phase),
    scenery,
    props: {
      nest: { x: layout.nest, y: WALK_Y },
      ball: { x: layout.ball, y: WALK_Y },
      larder: { x: layout.larder, y: WALK_Y, kind: biome.larder, treat: biome.treat, spots: larderSpots },
    },
    home: { x: homeSpotFor(layout, ROAM), y: WALK_Y },
    roam: { ...ROAM },
    seed,
  };
}

/**
 * The habitat a saved pet actually has. Generated from its time, then any stored override
 * merged over the top — the hook that lets a later build make habitats editable without
 * this one having to store anything. `cleanItems` in transfer.js passes item fields through
 * whole, so an override travels between devices the moment one exists.
 */
export function habitatOf(item) {
  const base = habitatFor(item.h, item.m);
  const over = item?.habitat;
  if (!over || typeof over !== 'object') return base;
  return {
    ...base,
    ...over,
    palette: { ...base.palette, ...(over.palette ?? {}) },
    props: { ...base.props, ...(over.props ?? {}) },
    light: { ...base.light, ...(over.light ?? {}) },
  };
}

/* ------------------------------------------------------------------ drawing */

const piece = (id, x, y, scale, flip, colors) => {
  const draw = SCENERY[id] ?? SCENERY.bush;
  const s = flip ? `scale(${-scale} ${scale})` : `scale(${scale})`;
  return `<g transform="translate(${x} ${y}) ${s}">${draw(colors)}</g>`;
};

/**
 * The whole backdrop as one SVG string — the house style, and what makes 144 habitats
 * assertable in a test. The pet, the ball and the treats are *not* in here: they are
 * retained nodes the scene puts into `.hab-actors`, because they have to move.
 */
export function habitatSvg(habitat, { uid = 'h', label = '', sleeping = false } = {}) {
  const c = habitat.palette;
  const phase = PHASES[habitat.light.phase] ?? PHASES.noon;
  const rnd = rndFrom(habitat.seed + 3);
  const biome = BIOMES[habitat.biome] ?? BIOMES.meadow;

  const back = habitat.scenery.filter((s) => s.y <= WALK_Y);
  const front = habitat.scenery.filter((s) => s.y > WALK_Y);
  const drawAll = (list) => list.map((s) => piece(s.id, s.x, s.y, s.scale, s.flip, c)).join('');

  const glowy = habitat.light.night || habitat.biome === 'glowvale';

  return `
<svg class="habitat" viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMax slice"
     role="img" aria-label="${label}" focusable="false">
  <defs>
    <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${phase.sky[0]}" />
      <stop offset="1" stop-color="${phase.sky[1]}" />
    </linearGradient>
    <linearGradient id="${uid}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.ground[0]}" />
      <stop offset="1" stop-color="${c.ground[1]}" />
    </linearGradient>
    <radialGradient id="${uid}-glow">
      <stop offset="0" stop-color="${phase.glow}" stop-opacity="0.85" />
      <stop offset="1" stop-color="${phase.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g class="hab-sky">
    <rect x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" fill="url(#${uid}-sky)" />
    ${skyMarkup(habitat.light.phase, habitat.light.hour24, habitat.seed, uid)}
  </g>

  <g class="hab-far">${(FAR[biome.far] ?? FAR.hills)(c)}</g>

  <g class="hab-ground">
    ${groundMarkup(c, uid)}
    ${(DETAIL[biome.detail] ?? DETAIL.grass)(c, rnd)}
  </g>

  <g class="hab-back">
    ${drawAll(back)}
    <g transform="translate(${habitat.props.nest.x} ${habitat.props.nest.y})">${NEST(c)}</g>
    <g transform="translate(${habitat.props.ball.x} ${habitat.props.ball.y})">${BALL_REST(c)}</g>
    <g transform="translate(${habitat.props.larder.x} ${habitat.props.larder.y})">
      ${(LARDER[habitat.props.larder.kind] ?? LARDER.bush)(c)}
    </g>
  </g>

  <g class="hab-actors"></g>

  <g class="hab-front">${drawAll(front)}</g>

  ${glowy ? `<g class="hab-motes">${motesMarkup(c, habitat.seed, sleeping ? 8 : 14)}</g>` : ''}

  <rect class="hab-veil" x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" fill="${phase.veil}" />
  <rect class="hab-dusk" x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" fill="#1b1930" />
</svg>`;
}

/** One treat, ready to be dropped into the actors layer. */
export const treatSvg = (kind, colors) => (TREATS[kind] ?? TREATS.berry)(colors);

/** The ball, likewise. */
export const ballSvg = (colors) => BALL(colors);

/* ------------------------------------------------------------------ physics */

export const BALL_R = 5;
const GRAVITY = 330; // habitat units per second squared
const AIR = 0.22; // horizontal drag, per second
const RESTITUTION = 0.54; // how much of a bounce comes back
const GROUND_FRICTION = 0.82; // horizontal speed kept through a bounce
const WALL = 0.62; // how much of a sideways hit comes back
const REST_SPEED = 26; // below this, at rest, it stays there

/**
 * One step of a thrown ball. Pure, so the tests can throw it a thousand ways and check it
 * always lands, always settles and never leaves the field — none of which is obvious from
 * reading a physics loop, and all of which a child will find within a minute if it is wrong.
 *
 * `dt` is seconds and is clamped: a backgrounded tab must not teleport the ball through
 * the floor when it comes back.
 */
export function stepBall(ball, dt, bounds) {
  if (ball.resting) return { ...ball, bounce: 0 };
  const step = clamp(dt, 0, 0.05);
  const floor = bounds.floor ?? WALK_Y;
  const ceiling = bounds.ceiling ?? 8;
  const x0 = (bounds.x0 ?? ROAM.x0) + BALL_R;
  const x1 = (bounds.x1 ?? ROAM.x1) - BALL_R;

  let vx = ball.vx * (1 - AIR * step);
  let vy = ball.vy + GRAVITY * step;
  let x = ball.x + vx * step;
  let y = ball.y + vy * step;
  let bounce = 0;

  if (y >= floor) {
    y = floor;
    if (vy > REST_SPEED) {
      bounce = vy;
      vy = -vy * RESTITUTION;
      vx *= GROUND_FRICTION;
    } else {
      vy = 0;
      vx *= 0.7;
    }
  } else if (y <= ceiling) {
    // A soft lid, so a ball flung by an enthusiastic four-year-old comes back on screen
    // instead of disappearing for a second and a half.
    y = ceiling;
    vy = Math.abs(vy) * 0.4;
  }

  if (x <= x0) {
    x = x0;
    vx = Math.abs(vx) * WALL;
    bounce = Math.max(bounce, Math.abs(ball.vx) * 0.6);
  } else if (x >= x1) {
    x = x1;
    vx = -Math.abs(vx) * WALL;
    bounce = Math.max(bounce, Math.abs(ball.vx) * 0.6);
  }

  const resting = y >= floor && Math.abs(vy) <= REST_SPEED && Math.abs(vx) < 2;
  return {
    ...ball,
    x,
    y,
    vx: resting ? 0 : vx,
    vy: resting ? 0 : vy,
    spin: (ball.spin ?? 0) + vx * step * 7,
    resting,
    bounce,
  };
}

/**
 * Where the pet ambles to next. `rnd` is injected so the tests are deterministic, and the
 * pet is nudged back toward the middle at the edges — it should look like it is pottering
 * about, not like it is pacing a boundary.
 */
export function nextWanderTarget(fromX, roam = ROAM, rnd = Math.random) {
  const span = roam.x1 - roam.x0;
  const at = (fromX - roam.x0) / span;
  const dir = at < 0.28 ? 1 : at > 0.72 ? -1 : rnd() < 0.5 ? -1 : 1;
  const dist = (0.14 + rnd() * 0.34) * span;
  return n(clamp(fromX + dir * dist, roam.x0, roam.x1));
}
