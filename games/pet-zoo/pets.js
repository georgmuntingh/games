// The creatures. Every pet is assembled from one shared body kit — silhouette, topper,
// eyes, blush, mouth, feet — so sixteen species read as one family rather than sixteen
// unrelated drawings, and a mood change is a swapped <path>, not a new picture.
//
// The cuteness rules, applied without exception because breaking any one of them makes a
// creature look like a monster: eyes enormous and set low and wide, head-space at least
// a third of the body, not one sharp corner anywhere, blush always on, mouth small and
// well below the eyes.

import { pointOnFace, timeId } from './clock.js';
import { TIERS } from './curriculum.js';

/* --------------------------------------------------------------- species */

// body: the silhouette. topper: what sits on the head. dy: nudges the topper so it clears
// the silhouette. palette: [body, belly, accent] — the eye and outline colours are shared
// so every pet looks at you the same way.
export const SPECIES = {
  mochi:    { name: 'Mochi',    body: 'round', topper: 'roundears', dy: 0,  palette: ['#ffd9e2', '#fff1f4', '#ff9ec0'] },
  bloop:    { name: 'Bloop',    body: 'round', topper: 'antenna',   dy: 0,  palette: ['#a5d8ff', '#e3f2ff', '#5fb3f5'] },
  pip:      { name: 'Pip',      body: 'tall',  topper: 'tuft',      dy: -4, palette: ['#b2f2d7', '#e6fff5', '#4fd6a0'] },
  waddle:   { name: 'Waddle',   body: 'wide',  topper: 'none',      dy: 8,  palette: ['#ffe9a8', '#fff8dd', '#f7b955'] },

  puff:     { name: 'Puff',     body: 'round', topper: 'ears',      dy: 0,  palette: ['#d9c8ff', '#f2ecff', '#a884f5'] },
  nibbles:  { name: 'Nibbles',  body: 'tall',  topper: 'ears',      dy: -4, palette: ['#ffd0b0', '#fff0e5', '#f79a63'] },
  snug:     { name: 'Snug',     body: 'wide',  topper: 'roundears', dy: 8,  palette: ['#cfe6c0', '#eefae6', '#8cc472'] },
  glim:     { name: 'Glim',     body: 'round', topper: 'horn',      dy: 0,  palette: ['#ffc2b8', '#fff0ed', '#ff8a75'] },

  noodle:   { name: 'Noodle',   body: 'tall',  topper: 'antenna',   dy: -4, palette: ['#9fe5e0', '#e4fbfa', '#48c4bc'] },
  fizz:     { name: 'Fizz',     body: 'round', topper: 'tuft',      dy: 0,  palette: ['#ffc7ea', '#fff0fa', '#f778c4'] },
  cloudlet: { name: 'Cloudlet', body: 'wide',  topper: 'fin',       dy: 8,  palette: ['#c9dcff', '#eef4ff', '#7ba2f0'] },
  pebble:   { name: 'Pebble',   body: 'round', topper: 'none',      dy: 0,  palette: ['#dcd6e8', '#f4f1f9', '#a99cc4'] },

  sprout:   { name: 'Sprout',   body: 'tall',  topper: 'leaf',      dy: -4, palette: ['#c4e8a0', '#eefada', '#82c44e'] },
  bubs:     { name: 'Bubs',     body: 'round', topper: 'floppy',    dy: 0,  palette: ['#ffd2d2', '#fff0f0', '#f58a8a'] },
  zzz:      { name: 'Zzz',      body: 'wide',  topper: 'none',      dy: 8,  palette: ['#bcc4f0', '#e8ebfd', '#7d8be0'] },
  tumble:   { name: 'Tumble',   body: 'round', topper: 'horn',      dy: 0,  palette: ['#ffdcb0', '#fff4e4', '#f0a552'] },
};

export const SPECIES_IDS = Object.keys(SPECIES);

// Four species per tier, so unlocking a tier visibly opens a new corner of the zoo.
const TIER_SPECIES = [
  ['mochi', 'bloop', 'pip', 'waddle'],
  ['puff', 'nibbles', 'snug', 'glim'],
  ['noodle', 'fizz', 'cloudlet', 'pebble'],
  ['sprout', 'bubs', 'zzz', 'tumble'],
];

const NAMES = [
  'Biscuit', 'Marmalade', 'Waffle', 'Pumpkin', 'Sprinkle', 'Doodle', 'Clover', 'Peanut',
  'Nugget', 'Custard', 'Pickle', 'Bumble', 'Dandelion', 'Truffle', 'Cinnamon', 'Gumdrop',
  'Blossom', 'Turnip', 'Jellybean', 'Muffin', 'Toast', 'Pancake', 'Wobble', 'Pudding',
  'Cricket', 'Pip-squeak', 'Sundae', 'Butterbean', 'Hopscotch', 'Marshmallow', 'Tangerine',
  'Snickerdoodle', 'Pinecone', 'Bramble', 'Mittens', 'Popcorn', 'Whisker', 'Fern',
  'Gingersnap', 'Nutmeg', 'Poppy', 'Sesame', 'Twiglet', 'Apricot', 'Cobweb', 'Domino',
  'Fizzle', 'Hazelnut',
];

// djb2 — any stable hash will do; what matters is that 4:15 is always the same creature
// with the same name, so the child ends up remembering "Waffle eats at quarter past four".
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

export function speciesFor(h, m) {
  const tier = TIERS.find((t) => t.minutes.includes(m))?.id ?? 0;
  const pool = TIER_SPECIES[tier] ?? TIER_SPECIES[0];
  return pool[hash(timeId(h, m)) % pool.length];
}

export const defaultName = (h, m) => NAMES[hash(`n${timeId(h, m)}`) % NAMES.length];

export const petName = (item) => item.name || defaultName(item.h, item.m);

/* ------------------------------------------------------------- body parts */

const INK = '#43354f'; // one ink colour for every eye and outline — the family resemblance

const BODIES = {
  round: '<ellipse cx="50" cy="54" rx="34" ry="32" />',
  tall: '<ellipse cx="50" cy="52" rx="28" ry="34" />',
  wide: '<ellipse cx="50" cy="58" rx="38" ry="28" />',
};

const FEET = `
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`;

function topperMarkup(kind, accent) {
  switch (kind) {
    case 'roundears':
      return `<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />`;
    case 'ears':
      return `<path d="M30 36 C24 22 24 12 30 10 C36 8 42 18 44 30 Z" />
              <path d="M70 36 C76 22 76 12 70 10 C64 8 58 18 56 30 Z" />`;
    case 'horn':
      return `<path d="M50 6 C54 14 57 21 58 28 C55 25 45 25 42 28 C43 21 46 14 50 6 Z" fill="${accent}" />`;
    case 'fin':
      return `<path d="M50 6 C60 14 63 22 61 30 L39 30 C37 22 40 14 50 6 Z" fill="${accent}" />`;
    case 'antenna':
      return `<path d="M50 30 C48 20 52 16 50 10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
              <circle cx="50" cy="8" r="6" fill="${accent}" />`;
    case 'tuft':
      return `<circle cx="41" cy="24" r="8" /><circle cx="50" cy="16" r="9" /><circle cx="59" cy="24" r="8" />`;
    case 'leaf':
      return `<path d="M50 28 C50 16 56 8 66 6 C66 18 60 26 50 28 Z" fill="${accent}" />
              <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${accent}" />`;
    case 'floppy':
      return `<ellipse cx="20" cy="50" rx="8" ry="19" transform="rotate(-16 20 50)" />
              <ellipse cx="80" cy="50" rx="8" ry="19" transform="rotate(16 80 50)" />`;
    default:
      return '';
  }
}

const MOUTHS = {
  happy: `<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
  content: `<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
  hungry: `<ellipse cx="50" cy="69" rx="7" ry="8" fill="${INK}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,
  droopy: `<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
  sleep: `<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
};

function eyesMarkup(mood) {
  if (mood === 'sleep') {
    return `<path d="M29 52 C33 58 41 58 45 52" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" />
            <path d="M55 52 C59 58 67 58 71 52" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" />`;
  }
  if (mood === 'happy') {
    return `<path d="M29 55 C33 46 41 46 45 55" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" />
            <path d="M55 55 C59 46 67 46 71 55" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" />`;
  }
  // The default open eye: a big dark oval, a fat highlight up-left and a small one
  // down-right. The two highlights are what stop it reading as a dead button.
  const eye = (cx) => `
    <ellipse class="pet-eye" cx="${cx}" cy="52" rx="9" ry="10" fill="${INK}" />
    <circle cx="${cx - 3}" cy="48" r="3.4" fill="#ffffff" />
    <circle cx="${cx + 3}" cy="56" r="1.7" fill="#ffffff" opacity="0.8" />`;
  return eye(37) + eye(63);
}

/**
 * One pet, as SVG markup. `mood` is 'happy' | 'content' | 'hungry' | 'droopy' | 'sleep';
 * anything unknown falls back to content, so a new UI state can never render a blank pet.
 */
export function petSvg(speciesId, { mood = 'content', className = '', title = '' } = {}) {
  const spec = SPECIES[speciesId] ?? SPECIES.mochi;
  const [body, belly, accent] = spec.palette;
  const mouth = MOUTHS[mood] ?? MOUTHS.content;
  const shade = accent;
  return `
<svg class="pet ${className}" viewBox="0 0 100 100" role="img" aria-label="${title || spec.name}" focusable="false">
  ${title ? `<title>${title}</title>` : ''}
  <g class="pet-inner">
    <g fill="${shade}" transform="translate(0 ${spec.dy})">${topperMarkup(spec.topper, accent)}</g>
    <g fill="${shade}">${FEET}</g>
    <g class="pet-body" fill="${body}">${BODIES[spec.body] ?? BODIES.round}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${belly}" />
    <g class="pet-face">
      ${eyesMarkup(mood)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${accent}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${accent}" opacity="0.55" />
      ${mouth}
    </g>
  </g>
</svg>`;
}

/** The egg a time arrives as. Speckled in its pet's colours, so the reveal is a payoff. */
export function eggSvg(speciesId, { className = '', title = 'A chilly egg' } = {}) {
  const spec = SPECIES[speciesId] ?? SPECIES.mochi;
  const [body, belly, accent] = spec.palette;
  return `
<svg class="pet egg ${className}" viewBox="0 0 100 100" role="img" aria-label="${title}" focusable="false">
  <title>${title}</title>
  <g class="pet-inner">
    <path class="egg-shell" fill="${body}"
      d="M50 12 C68 12 80 40 80 58 C80 78 66 90 50 90 C34 90 20 78 20 58 C20 40 32 12 50 12 Z" />
    <ellipse cx="41" cy="62" rx="15" ry="18" fill="${belly}" opacity="0.75" />
    <circle cx="61" cy="40" r="6" fill="${accent}" opacity="0.65" />
    <circle cx="36" cy="34" r="4.5" fill="${accent}" opacity="0.65" />
    <circle cx="66" cy="68" r="5" fill="${accent}" opacity="0.5" />
    <circle cx="44" cy="78" r="3.5" fill="${accent}" opacity="0.5" />
  </g>
</svg>`;
}

/**
 * The tiny clock every pet wears on its collar, showing the one time it knows. Free
 * repetition: the child reads a hundred of these while just browsing the zoo.
 */
export function collarClock(h, m, { size = 34 } = {}) {
  const R = 50;
  const hourTip = pointOnFace(R, R, 24, (h % 12) * 30 + m * 0.5);
  const minuteTip = pointOnFace(R, R, 36, m * 6);
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = pointOnFace(R, R, 41, i * 30);
    return `<circle cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="2.6" />`;
  }).join('');
  return `
<svg class="collar-clock" width="${size}" height="${size}" viewBox="0 0 100 100" role="img"
     aria-label="${timeId(h, m)}" focusable="false">
  <circle cx="50" cy="50" r="46" class="collar-face" />
  <g class="collar-ticks">${ticks}</g>
  <line x1="50" y1="50" x2="${hourTip.x.toFixed(1)}" y2="${hourTip.y.toFixed(1)}" class="collar-hand hour" />
  <line x1="50" y1="50" x2="${minuteTip.x.toFixed(1)}" y2="${minuteTip.y.toFixed(1)}" class="collar-hand minute" />
  <circle cx="50" cy="50" r="5" class="collar-pin" />
</svg>`;
}

/** What a pet looks like right now, derived from its schedule — never stored. */
export function moodOf(item, now, { napping = false } = {}) {
  if (napping) return 'sleep';
  if (item.hatchedAt === null) return 'content';
  if (item.phase === 'learning') return item.lapses > 0 ? 'droopy' : 'content';
  return item.dueAt <= now ? 'hungry' : 'happy';
}
