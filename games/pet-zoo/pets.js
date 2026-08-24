// The creatures. Two layers: a species identity (silhouette, ears, palette, eyes, brows)
// that makes a Mochi look like a Mochi, and — added in appearanceFor — a per-pet trait
// combination that makes the twenty-five Mochis in a full zoo twenty-five different pets.
//
// The drawable parts all live in pet-parts.js; this file decides which of them a given
// pet gets, and assembles them in the one order that keeps lids, glasses and patches from
// fighting over the same few pixels.

import { pointOnFace, timeId } from './clock.js';
import { ALL_ITEMS, TIERS } from './curriculum.js';
import { DEFAULT_LANGUAGE, NAMES } from './i18n.js';
import {
  ACCESSORIES,
  ANATOMY,
  BODIES,
  BROW_MOOD,
  BROWS,
  EYE_X,
  EYES,
  EYEWEAR,
  FACIAL,
  FEET,
  HAIR,
  HAIR_CROWN,
  INK,
  faceTransform,
  growTransform,
  MARKINGS,
  MOUTHS,
  SIDES,
  SIGNATURES,
  sleepingEyes,
  TEXTURES,
  TOPPER_CROWN,
  TOPPERS,
} from './pet-parts.js';
import { FORM_COUNT, formFor } from './srs.js';

/* --------------------------------------------------------------- species */

// Sixteen identities. Every pair differs in at least two of {body, topper, eyes, brows},
// so no two species can be told apart by colour alone — which was the whole complaint.
export const SPECIES = {
  mochi:    { name: 'Mochi',    body: 'round',  texture: 'smooth', topper: 'roundears', eyes: 'round',   brows: 'none',    palette: ['#ffd9e2', '#fff1f4', '#ff9ec0'], grows: ['mane', 'tail'], signature: 'bigEars' },
  bloop:    { name: 'Bloop',    body: 'bean',   texture: 'smooth', topper: 'antenna',   eyes: 'sparkle', brows: 'none',    palette: ['#a5d8ff', '#e3f2ff', '#5fb3f5'], grows: ['tail', 'wings'], signature: 'antennaArray' },
  pip:      { name: 'Pip',      body: 'tall',   texture: 'fluffy', topper: 'tuft',      eyes: 'oval',    brows: 'arched',  palette: ['#b2f2d7', '#e6fff5', '#4fd6a0'], grows: ['crest', 'plume'], signature: 'tallTuft' },
  waddle:   { name: 'Waddle',   body: 'wide',   texture: 'smooth', topper: 'none',      eyes: 'beady',   brows: 'thick',   palette: ['#ffe9a8', '#fff8dd', '#f7b955'], grows: ['tail', 'mane'], signature: 'crownSpikes' },

  puff:     { name: 'Puff',     body: 'round',  texture: 'fluffy', topper: 'ears',      eyes: 'lashed',  brows: 'arched',  palette: ['#d9c8ff', '#f2ecff', '#a884f5'], grows: ['mane', 'wings'], signature: 'longEars' },
  nibbles:  { name: 'Nibbles',  body: 'tall',   texture: 'smooth', topper: 'rabbit',    eyes: 'round',   brows: 'worried', palette: ['#ffd0b0', '#fff0e5', '#f79a63'], grows: ['wings', 'plume'], signature: 'hugeRabbit' },
  snug:     { name: 'Snug',     body: 'wide',   texture: 'fluffy', topper: 'roundears', eyes: 'sleepy',  brows: 'bushy',   palette: ['#cfe6c0', '#eefae6', '#8cc472'], grows: ['wings', 'crest'], signature: 'ramCurl' },
  glim:     { name: 'Glim',     body: 'pear',   texture: 'smooth', topper: 'horn',      eyes: 'sparkle', brows: 'thick',   palette: ['#ffc2b8', '#fff0ed', '#ff8a75'], grows: ['finback', 'wings'], signature: 'twinHorns' },

  noodle:   { name: 'Noodle',   body: 'tall',   texture: 'smooth', topper: 'antlers',   eyes: 'beady',   brows: 'worried', palette: ['#9fe5e0', '#e4fbfa', '#48c4bc'], grows: ['finback', 'tail'], signature: 'bigAntlers' },
  fizz:     { name: 'Fizz',     body: 'chunky', texture: 'spiky',  topper: 'tuft',      eyes: 'sparkle', brows: 'none',    palette: ['#ffc7ea', '#fff0fa', '#f778c4'], grows: ['crest', 'plume'], signature: 'flameCrest' },
  cloudlet: { name: 'Cloudlet', body: 'wide',   texture: 'fluffy', topper: 'fin',       eyes: 'oval',    brows: 'none',    palette: ['#c9dcff', '#eef4ff', '#7ba2f0'], grows: ['finback', 'crest'], signature: 'stormFin' },
  pebble:   { name: 'Pebble',   body: 'round',  texture: 'smooth', topper: 'none',      eyes: 'sleepy',  brows: 'thick',   palette: ['#dcd6e8', '#f4f1f9', '#a99cc4'], grows: ['plume', 'mane'], signature: 'crystal' },

  sprout:   { name: 'Sprout',   body: 'pear',   texture: 'smooth', topper: 'leaf',      eyes: 'round',   brows: 'arched',  palette: ['#c4e8a0', '#eefada', '#82c44e'], grows: ['mane', 'crest'], signature: 'foliageCrown' },
  bubs:     { name: 'Bubs',     body: 'round',  texture: 'smooth', topper: 'floppy',    eyes: 'lashed',  brows: 'none',    palette: ['#f0c2d8', '#fdeef5', '#d97fae'], grows: ['tail', 'mane'], signature: 'longFlop' },
  zzz:      { name: 'Zzz',      body: 'bean',   texture: 'fluffy', topper: 'hound',     eyes: 'sleepy',  brows: 'worried', palette: ['#bcc4f0', '#e8ebfd', '#7d8be0'], grows: ['plume', 'tail'], signature: 'moonHorns' },
  tumble:   { name: 'Tumble',   body: 'chunky', texture: 'spiky',  topper: 'ram',       eyes: 'oval',    brows: 'bushy',   palette: ['#ffdcb0', '#fff4e4', '#f0a552'], grows: ['crest', 'finback'], signature: 'doubleRam' },
};

export const SPECIES_IDS = Object.keys(SPECIES);

// Four species per tier, so unlocking a tier visibly opens a new corner of the zoo.
const TIER_SPECIES = [
  ['mochi', 'bloop', 'pip', 'waddle'],
  ['puff', 'nibbles', 'snug', 'glim'],
  ['noodle', 'fizz', 'cloudlet', 'pebble'],
  ['sprout', 'bubs', 'zzz', 'tumble'],
];

// djb2 — any stable hash will do; what matters is that 4:15 is always the same creature
// with the same name, so the child ends up remembering "Vaffel eats at quarter past four".
// Exported because a habitat needs stable per-pet choices of its own, and two hashes of
// the same string in two files is one refactor away from being two different hashes.
export function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

export function speciesFor(h, m) {
  const tier = TIERS.find((t) => t.minutes.includes(m))?.id ?? 0;
  const pool = TIER_SPECIES[tier] ?? TIER_SPECIES[0];
  return pool[hash(timeId(h, m)) % pool.length];
}

/**
 * The name a pet is born with. Deterministic per time *and* per language: switching the
 * app's language renames the whole zoo into the child's own words, which is the point —
 * the association being built is "Vaffel eats at quarter past four", one sentence in one
 * language. A pet the child has renamed themselves keeps that name in both.
 */
export const defaultName = (h, m, lang = DEFAULT_LANGUAGE) => {
  const pool = NAMES[lang] ?? NAMES[DEFAULT_LANGUAGE];
  const species = speciesFor(h, m);
  // Walking the pool from a per-species starting point means no two pets of the same
  // species can share a name — the case where a repeat is actually confusing, since they
  // are the ones sitting next to each other looking alike.
  const offset = hash(`n${species}`) % pool.length;
  return pool[(offset + traitIndexFor(h, m)) % pool.length];
};

export const petName = (item, lang = DEFAULT_LANGUAGE) =>
  item.name || defaultName(item.h, item.m, lang);

/* ------------------------------------------------------------ appearance */

const PLAIN = { eyewear: 'none', hair: 'none', facialHair: 'none', markings: 'none', accessory: 'none' };

/** The extra anatomy a species has grown by a given form — cumulative, never lost. */
export const anatomyFor = (speciesId, form) =>
  (SPECIES[speciesId]?.grows ?? []).slice(0, Math.max(0, Math.min(form, FORM_COUNT) - 1));

/**
 * A species drawn plain, with no individual traits. The tier-unlock exemplars use this at
 * form 1, so evolution stays a surprise the child has to earn rather than a preview.
 */
export function speciesAppearance(speciesId, form = 1) {
  const id = speciesId in SPECIES ? speciesId : 'mochi';
  const stage = Math.max(1, Math.min(Math.round(form) || 1, FORM_COUNT));
  return {
    species: id,
    ...SPECIES[id],
    ...PLAIN,
    form: stage,
    anatomy: anatomyFor(id, stage),
    // Its own topper, grown up — so sixteen species do not converge on one silhouette.
    signature: stage >= FORM_COUNT ? SPECIES[id].signature : null,
  };
}

// "Loud" traits are the ones you notice across a room. A pet may carry at most two, which
// is what keeps the generator from ever producing goggles *and* a beard *and* a backpack.
export const LOUD_FAMILIES = [
  ['eyewear', ['roundSpecs', 'squareSpecs', 'goggles', 'monocle', 'starShades']],
  ['hair', ['fringe', 'cowlick', 'topknot', 'cap', 'bow', 'flower']],
  ['facialHair', ['moustache', 'beard', 'whiskers', 'teeth', 'snout']],
  ['accessory', ['scarf', 'bandana', 'bowtie', 'backpack']],
];

export const MARKING_IDS = Object.keys(MARKINGS);

// Coprime with the length of both valid lists (170 unfiltered, 125 for a crowned
// species), so stepping by it visits every entry before repeating any. That is what makes
// the assignment below a bijection rather than a hopeful hash.
export const TRAIT_STRIDE = 71;

function enumerateLoud(crowned) {
  const families = LOUD_FAMILIES.map(([key, options]) => [
    key,
    // A species that already grows something on its crown does not also get a topknot;
    // filtering the list here — rather than substituting after the fact — keeps every
    // remaining combination unique.
    key === 'hair' && crowned ? options.filter((o) => !HAIR_CROWN.has(o)) : options,
  ]);
  const out = [{ ...PLAIN }];
  for (const [key, options] of families) {
    for (const option of options) out.push({ ...PLAIN, [key]: option });
  }
  for (let i = 0; i < families.length; i += 1) {
    for (let j = i + 1; j < families.length; j += 1) {
      for (const a of families[i][1]) {
        for (const b of families[j][1]) {
          out.push({ ...PLAIN, [families[i][0]]: a, [families[j][0]]: b });
        }
      }
    }
  }
  return out;
}

const LOUD_LISTS = { crowned: enumerateLoud(true), free: enumerateLoud(false) };

export const isCrowned = (speciesId) => TOPPER_CROWN.has(SPECIES[speciesId]?.topper);

export const validLoudFor = (speciesId) =>
  LOUD_LISTS[isCrowned(speciesId) ? 'crowned' : 'free'];

// Every time that maps to a species, in a fixed order. A pet's position in this list is
// its trait index: unique within the species by construction, and stable between sessions
// because it comes from the curriculum rather than from the order pets were hatched.
const SPECIES_TIMES = new Map();
for (const item of [...ALL_ITEMS].sort((a, b) => a.h - b.h || a.m - b.m)) {
  const id = speciesFor(item.h, item.m);
  if (!SPECIES_TIMES.has(id)) SPECIES_TIMES.set(id, []);
  SPECIES_TIMES.get(id).push(item.id);
}

export const timesOfSpecies = (speciesId) => SPECIES_TIMES.get(speciesId) ?? [];

/**
 * A pet's position among the others of its own species — its trait index. Unique within
 * the species by construction and stable between sessions, because it comes from the
 * curriculum rather than from the order pets were hatched. Appearance, name and habitat
 * all vary along it, so they vary together.
 */
export const traitIndexFor = (h, m) =>
  Math.max(0, timesOfSpecies(speciesFor(h, m)).indexOf(timeId(h, m)));

/** The look of a pet as its item currently stands, at whichever form it has earned. */
export const appearanceOf = (item) =>
  appearanceFor(item.h, item.m, formFor(item.feeds ?? 0) || 1);

/**
 * The complete look of the pet that keeps a given time: its species, plus the individual
 * traits that tell it apart from the two dozen others of the same species in a full zoo.
 *
 * Stepping through the valid combinations by a coprime stride — rather than counting
 * through them — means consecutive times land far apart in the space, so 1:00 and 2:00
 * differ by a whole accessory rather than by a freckle.
 */
export function appearanceFor(h, m, form = 1) {
  const species = speciesFor(h, m);
  const index = traitIndexFor(h, m);
  const list = validLoudFor(species);
  return {
    ...speciesAppearance(species, form),
    ...list[(index * TRAIT_STRIDE) % list.length],
    markings: MARKING_IDS[index % MARKING_IDS.length],
  };
}

/* ---------------------------------------------------------------- drawing */

const asAppearance = (value) =>
  typeof value === 'string' ? speciesAppearance(value) : value ?? speciesAppearance('mochi');

function eyesMarkup(appearance, mood) {
  const style = EYES[appearance.eyes] ?? EYES.round;
  const open = SIDES.map((side, i) => style(EYE_X[i], side)).join('');
  return mood === 'sleep' ? sleepingEyes(open) : open;
}

/**
 * Brows carry the mood, as a rotation and a lift applied to the pet's own brow shape.
 * Five moods times six eye styles would have been thirty drawings; this is one transform.
 */
function browsMarkup(appearance, mood) {
  const style = BROWS[appearance.brows] ?? BROWS.none;
  const { rot, dy } = BROW_MOOD[mood] ?? BROW_MOOD.content;
  return SIDES.map((side, i) => {
    const cx = EYE_X[i];
    const shape = style(cx, side);
    if (!shape) return '';
    return `<g transform="translate(0 ${dy}) rotate(${side === -1 ? rot : -rot} ${cx} 37)">${shape}</g>`;
  }).join('');
}

/**
 * One pet, as SVG markup. `appearance` is either an appearance object or a bare species
 * id; `mood` is 'happy' | 'content' | 'hungry' | 'droopy' | 'sleep', and anything unknown
 * falls back to content so a new UI state can never render a blank pet.
 */
export function petSvg(appearance, { mood = 'content', className = '', title = '' } = {}) {
  const a = asAppearance(appearance);
  const [body, belly, accent] = a.palette;
  const colors = { body, belly, accent };
  const shape = BODIES[a.body] ?? BODIES.round;
  const texture = (TEXTURES[a.texture] ?? TEXTURES.smooth)(shape.halo);
  const form = Math.max(1, Math.min(a.form ?? 1, 3));
  // At the final form the species' own topper is replaced by its grown-up version.
  const crown = a.signature && SIGNATURES[a.signature]
    ? SIGNATURES[a.signature](colors)
    : (TOPPERS[a.topper] ?? TOPPERS.none)(accent);
  const grown = (a.anatomy ?? [])
    .map((part) => (ANATOMY[part] ? ANATOMY[part](colors) : ''))
    .join('');
  const label = title || a.name || 'pet';

  const pick = (family, id, fallback) => (family[id] ?? family[fallback])(colors);
  const eyewear = pick(EYEWEAR, a.eyewear, 'none');
  const hair = pick(HAIR, a.hair, 'none');
  const facial = pick(FACIAL, a.facialHair, 'none');
  const marks = pick(MARKINGS, a.markings, 'none');
  const worn = pick(ACCESSORIES, a.accessory, 'none');

  // Back to front. Fluff and spikes go furthest back, then ears — a fluffy species drawn
  // the other way round swallows its own ears. Everything from the eyes forward is drawn
  // in the order it must overlap.
  return `
<svg class="pet form-${form} ${className}" viewBox="0 0 100 100" role="img" aria-label="${label}" focusable="false">
  ${title ? `<title>${title}</title>` : ''}
  <g class="pet-grow" transform="${growTransform(form)}">
  <g class="pet-inner">
    <g fill="${a.texture === 'spiky' ? accent : body}">${texture}</g>
    <g fill="${accent}">${grown}</g>
    <g fill="${accent}">${crown}</g>
    ${worn.back}
    <g fill="${accent}">${FEET}</g>
    <g class="pet-body" fill="${body}">${shape.shape}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${belly}" />
    ${marks.back}${facial.back}
    <g class="pet-face" transform="${faceTransform(form)}">
      ${eyesMarkup(a, mood)}
      ${eyewear.front}
      ${hair.front}
      ${browsMarkup(a, mood)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${accent}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${accent}" opacity="0.55" />
      ${marks.front}
      ${MOUTHS[mood] ?? MOUTHS.content}
      ${facial.front}
    </g>
    ${worn.front}
  </g>
  </g>
</svg>`;
}

// The shell gives way in a fixed order, so a child watching a second egg break recognises the
// stages. 1 and 2 are earned by answering; 3 is the fracture that only ever appears during the
// hatch itself, a heartbeat before the shell goes.
const EGG_CRACKS = [
  'M69 27 L62.5 33.5 L68 38.5 L61 44.5 L64.5 50',
  'M31 43 L38 49 L31.5 56 L38.5 63 L33 70',
  'M21 59 L32 55 L43 62.5 L55 54.5 L66.5 62 L79 55.5',
];

export const EGG_CRACK_MAX = EGG_CRACKS.length;

/**
 * The egg a time arrives as. Speckled in its pet's colours, so the reveal is a payoff, and broken
 * in as many places as the child has earned — the shell is the progress bar.
 */
export function eggSvg(speciesId, { cracks = 0, className = '', title = 'A chilly egg' } = {}) {
  const spec = SPECIES[speciesId] ?? SPECIES.mochi;
  const [body, belly, accent] = spec.palette;
  const level = Math.max(0, Math.min(EGG_CRACK_MAX, Math.round(cracks)));
  // `pathLength="1"` normalises every crack to the same nominal length, so a single CSS rule can
  // draw any of them on with a dash offset regardless of how long the path actually is.
  const breaks = Array.from(
    { length: level },
    (_, i) => `<path class="egg-crack egg-crack-${i + 1}" pathLength="1" d="${EGG_CRACKS[i]}" />`
  ).join('');
  return `
<svg class="pet egg egg-cracks-${level} ${className}" viewBox="0 0 100 100" role="img" aria-label="${title}" focusable="false">
  <title>${title}</title>
  <g class="pet-inner">
    <path class="egg-shell" fill="${body}"
      d="M50 12 C68 12 80 40 80 58 C80 78 66 90 50 90 C34 90 20 78 20 58 C20 40 32 12 50 12 Z" />
    <ellipse cx="41" cy="62" rx="15" ry="18" fill="${belly}" opacity="0.75" />
    <circle cx="61" cy="40" r="6" fill="${accent}" opacity="0.65" />
    <circle cx="36" cy="34" r="4.5" fill="${accent}" opacity="0.65" />
    <circle cx="66" cy="68" r="5" fill="${accent}" opacity="0.5" />
    <circle cx="44" cy="78" r="3.5" fill="${accent}" opacity="0.5" />
    ${breaks}
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

export { INK };
