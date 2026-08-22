// The pet body kit: pure SVG fragments, no logic and no state. Every part draws into the
// same 0..100 square, and the anchor points below are a contract between them — move an
// eye centre here and the glasses in the individual layer stop lining up.
//
//   eye centres  (37, 52) and (63, 52)      brows      y ≈ 37
//   mouth        y ≈ 68                     blush      y ≈ 62
//   body bottom  y = 86                     feet       y = 85
//
// The cuteness rules every part obeys, because breaking any one of them turns a creature
// into a monster: eyes low, wide and enormous; head-space at least a third of the body;
// no sharp corners; blush always on; mouth small and well below the eyes.

export const INK = '#43354f'; // one ink for every eye and outline — the family resemblance

export const EYE_X = [37, 63];
export const EYE_Y = 52;

// side is -1 for the left eye and +1 for the right, so a part can tell which way is
// "outward" and mirror itself without a second copy of its geometry.
export const SIDES = [-1, 1];

/* --------------------------------------------------------------------- bodies */

// Each body carries a `halo`: the ellipse the fluff and spikes of a texture follow. Body
// silhouettes differ enough that a single shared halo would float off the pear and sink
// into the wide one.
export const BODIES = {
  round: {
    shape: '<ellipse cx="50" cy="54" rx="34" ry="32" />',
    halo: { cx: 50, cy: 54, rx: 34, ry: 32 },
  },
  tall: {
    shape: '<ellipse cx="50" cy="52" rx="28" ry="34" />',
    halo: { cx: 50, cy: 52, rx: 28, ry: 34 },
  },
  wide: {
    shape: '<ellipse cx="50" cy="58" rx="38" ry="28" />',
    halo: { cx: 50, cy: 58, rx: 38, ry: 28 },
  },
  pear: {
    shape:
      '<path d="M50 22 C66 22 72 38 74 54 C76 72 66 86 50 86 C34 86 24 72 26 54 C28 38 34 22 50 22 Z" />',
    halo: { cx: 50, cy: 55, rx: 25, ry: 32 },
  },
  bean: {
    shape:
      '<path d="M53 20 C71 20 81 37 79 56 C77 76 63 86 47 86 C30 86 21 71 21 54 C21 34 35 20 53 20 Z" />',
    halo: { cx: 50, cy: 53, rx: 29, ry: 33 },
  },
  chunky: {
    shape:
      '<path d="M50 20 C74 20 86 34 86 55 C86 76 71 86 50 86 C29 86 14 76 14 55 C14 34 26 20 50 20 Z" />',
    halo: { cx: 50, cy: 53, rx: 36, ry: 33 },
  },
};

export const FEET = `
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`;

/* -------------------------------------------------------------------- textures */

const onHalo = (halo, deg, out = 1) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: halo.cx + Math.sin(rad) * halo.rx * out,
    y: halo.cy - Math.cos(rad) * halo.ry * out,
  };
};

// Textures draw *behind* the body, so they read as an edge rather than a pattern on top.
export const TEXTURES = {
  smooth: () => '',
  fluffy: (halo) =>
    Array.from({ length: 18 }, (_, i) => {
      const p = onHalo(halo, i * 20, 1);
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7" />`;
    }).join(''),
  spiky: (halo) =>
    // Only along the top-back arc: a full ring of spikes reads as a virus, not a creature.
    Array.from({ length: 5 }, (_, i) => {
      const deg = -70 + i * 22;
      const base1 = onHalo(halo, deg - 9, 0.97);
      const base2 = onHalo(halo, deg + 9, 0.97);
      const tip = onHalo(halo, deg, 1.22);
      return `<path d="M${base1.x.toFixed(1)} ${base1.y.toFixed(1)} L${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L${base2.x.toFixed(1)} ${base2.y.toFixed(1)} Z" />`;
    }).join(''),
};

/* ------------------------------------------------------------------- ears/horns */

// `crown` toppers occupy the top of the head, so the individual layer must not also put
// a topknot there. `side` ones leave the crown free.
export const TOPPER_CROWN = new Set(['horn', 'fin', 'antenna', 'tuft', 'leaf', 'antlers', 'rabbit']);

export const TOPPERS = {
  none: () => '',
  roundears: () => '<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />',
  ears: () => `
    <path d="M30 36 C24 22 24 12 30 10 C36 8 42 18 44 30 Z" />
    <path d="M70 36 C76 22 76 12 70 10 C64 8 58 18 56 30 Z" />`,
  rabbit: (accent) => `
    <ellipse cx="37" cy="16" rx="7.5" ry="21" transform="rotate(-8 37 16)" />
    <ellipse cx="63" cy="16" rx="7.5" ry="21" transform="rotate(8 63 16)" />
    <ellipse cx="37" cy="17" rx="3.6" ry="14" fill="${accent}" transform="rotate(-8 37 17)" />
    <ellipse cx="63" cy="17" rx="3.6" ry="14" fill="${accent}" transform="rotate(8 63 17)" />`,
  hound: () => `
    <ellipse cx="17" cy="58" rx="10" ry="25" transform="rotate(-12 17 58)" />
    <ellipse cx="83" cy="58" rx="10" ry="25" transform="rotate(12 83 58)" />`,
  floppy: () => `
    <ellipse cx="20" cy="50" rx="8" ry="19" transform="rotate(-16 20 50)" />
    <ellipse cx="80" cy="50" rx="8" ry="19" transform="rotate(16 80 50)" />`,
  horn: (accent) =>
    `<path d="M50 6 C54 14 57 21 58 28 C55 25 45 25 42 28 C43 21 46 14 50 6 Z" fill="${accent}" />`,
  ram: (accent) => `
    <path d="M28 30 C14 30 10 20 18 14 C24 10 32 14 30 22" fill="none" stroke="${accent}"
          stroke-width="7" stroke-linecap="round" />
    <path d="M72 30 C86 30 90 20 82 14 C76 10 68 14 70 22" fill="none" stroke="${accent}"
          stroke-width="7" stroke-linecap="round" />`,
  antlers: (accent) => `
    <path d="M40 30 L34 14 M34 14 L28 10 M34 14 L38 6" fill="none" stroke="${accent}"
          stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M60 30 L66 14 M66 14 L72 10 M66 14 L62 6" fill="none" stroke="${accent}"
          stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />`,
  fin: (accent) => `<path d="M50 6 C60 14 63 22 61 30 L39 30 C37 22 40 14 50 6 Z" fill="${accent}" />`,
  antenna: (accent) => `
    <path d="M50 30 C48 20 52 16 50 10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
    <circle cx="50" cy="8" r="6" fill="${accent}" />`,
  tuft: () => '<circle cx="41" cy="24" r="8" /><circle cx="50" cy="16" r="9" /><circle cx="59" cy="24" r="8" />',
  leaf: (accent) => `
    <path d="M50 28 C50 16 56 8 66 6 C66 18 60 26 50 28 Z" fill="${accent}" />
    <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${accent}" />`,
};

/* ----------------------------------------------------------------------- eyes */

const WHITE = '#ffffff';

// Every style keeps the same two centres so that eyewear, lids and patches in the
// individual layer line up without knowing which eyes a species has.
export const EYES = {
  round: (cx) => `
    <ellipse class="pet-eye" cx="${cx}" cy="52" rx="9.5" ry="10.5" fill="${INK}" />
    <circle cx="${cx - 3.2}" cy="47.5" r="3.6" fill="${WHITE}" />
    <circle cx="${cx + 3}" cy="56" r="1.8" fill="${WHITE}" opacity="0.85" />`,

  oval: (cx) => `
    <ellipse class="pet-eye" cx="${cx}" cy="52" rx="6.8" ry="11.5" fill="${INK}" />
    <circle cx="${cx - 2.4}" cy="47" r="2.9" fill="${WHITE}" />
    <circle cx="${cx + 2}" cy="56.5" r="1.4" fill="${WHITE}" opacity="0.85" />`,

  // A lens flatter on top than underneath — half-lidded without needing to mask anything.
  sleepy: (cx) => `
    <path class="pet-eye" d="M${cx - 9} 50 Q${cx} 45.5 ${cx + 9} 50 Q${cx} 63.5 ${cx - 9} 50 Z" fill="${INK}" />
    <circle cx="${cx - 3}" cy="53.5" r="3.2" fill="${WHITE}" />
    <circle cx="${cx + 3.4}" cy="57" r="1.5" fill="${WHITE}" opacity="0.85" />`,

  sparkle: (cx) => `
    <ellipse class="pet-eye" cx="${cx}" cy="52" rx="9" ry="11" fill="${INK}" />
    <path d="M${cx - 3} 43 Q${cx - 2} 47 ${cx + 1.5} 48 Q${cx - 2} 49 ${cx - 3} 53
             Q${cx - 4} 49 ${cx - 7.5} 48 Q${cx - 4} 47 ${cx - 3} 43 Z" fill="${WHITE}" />
    <circle cx="${cx + 3.5}" cy="56.5" r="1.9" fill="${WHITE}" opacity="0.85" />`,

  lashed: (cx, side) => `
    <ellipse class="pet-eye" cx="${cx}" cy="52" rx="8" ry="10.5" fill="${INK}" />
    <circle cx="${cx - 2.6}" cy="47.5" r="3" fill="${WHITE}" />
    <path d="M${cx + side * 7} 46 l${side * 5.5} -4" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${cx + side * 8.2} 50 l${side * 6} -1.6" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${cx + side * 7.6} 54 l${side * 5.6} 1.8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" fill="none" />`,

  beady: (cx) => `
    <circle class="pet-eye" cx="${cx}" cy="52" r="5.6" fill="${INK}" />
    <circle cx="${cx - 1.8}" cy="50" r="2.1" fill="${WHITE}" />`,
};

/**
 * Closed eyes for the sleep mood. The pet's own eyes are collapsed vertically about their
 * centre line rather than swapped out, so a species keeps its identity — and its lashes,
 * glasses and brows — while it naps.
 */
export const sleepingEyes = (open) =>
  `<g transform="translate(0 ${EYE_Y}) scale(1 0.08) translate(0 ${-EYE_Y})">${open}</g>` +
  SIDES.map((side, i) => {
    const cx = EYE_X[i];
    return `<path d="M${cx - 9} 52 Q${cx} 58.5 ${cx + 9} 52" fill="none" stroke="${INK}"
                  stroke-width="3.2" stroke-linecap="round" />`;
  }).join('');

/* ---------------------------------------------------------------------- brows */

// Drawn from the outer end inward, so `side` alone mirrors them.
// A brow whose inner end points *down* is the universal cross face, and a low heavy brow
// reads as grumpy however round the creature under it is. Every shape here either lifts
// the inner end or sits well clear of the eye.
export const BROWS = {
  none: () => '',
  thick: (cx, side) =>
    `<path d="M${cx + side * 8.5} 35.5 L${cx - side * 8} 35" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none" />`,
  arched: (cx) =>
    `<path d="M${cx - 8.5} 37.5 Q${cx} 30.5 ${cx + 8.5} 37.5" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none" />`,
  // Inner end lifted: concerned and sweet, the opposite of cross.
  worried: (cx, side) =>
    `<path d="M${cx + side * 8.5} 38.5 L${cx - side * 8.5} 33.5" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" fill="none" />`,
  // Same arch as `arched` but far thicker — distinct at a glance, still cheerful.
  bushy: (cx) =>
    `<path d="M${cx - 9} 36.5 Q${cx} 29.5 ${cx + 9} 36.5" stroke="${INK}" stroke-width="5.6" stroke-linecap="round" fill="none" />`,
};

// Mood rides on top of a pet's own brow shape as a rotation and a lift, not as a second
// set of drawings. Values are for the left brow; the right one mirrors them.
//
// The sign matters more than the size. SVG's y axis points down, so a *positive* rotation
// of the left brow lifts its outer end and drops the inner one — which is the universal
// angry face, not a sad one. Sadness is the negative direction: inner ends up. Getting
// this backwards turns every downcast pet into a furious one.
export const BROW_MOOD = {
  happy: { rot: 0, dy: -2.5 }, // simply raised; an arch here reads as surprise
  content: { rot: 0, dy: 0 },
  hungry: { rot: -2, dy: -3.5 }, // up and eager
  droopy: { rot: -9, dy: 1.5 }, // inner ends up: crestfallen, never cross
  sleep: { rot: -4, dy: 1 },
};

/* --------------------------------------------------------------------- mouths */

export const MOUTHS = {
  happy: `<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
  content: `<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
  hungry: `<ellipse cx="50" cy="69" rx="7" ry="8" fill="${INK}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,
  droopy: `<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
  sleep: `<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" />`,
};

/* ==========================================================================
   Individual layer — the traits that vary between two pets of the same species.

   Each part returns { back, front }: `back` draws behind the face (a snout, body
   spots, a backpack), `front` over it (glasses, freckles, a moustache). Uniform
   shape so the assembler never has to special-case a part it does not know about.
   ========================================================================== */

const front = (markup) => ({ back: '', front: markup });
const both = (back, frontMarkup) => ({ back, front: frontMarkup });

const star = (cx, cy, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const rad = ((i * 36 - 90) * Math.PI) / 180;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + Math.cos(rad) * rr).toFixed(1)} ${(cy + Math.sin(rad) * rr).toFixed(1)}`;
  }).join(' L');

/* ------------------------------------------------------------------ eyewear */

// Lenses are translucent on purpose: opaque ones hide the eyes, and the eyes are where
// every scrap of this game's expression lives.
export const EYEWEAR = {
  none: () => front(''),
  roundSpecs: (c) =>
    front(`
      <g fill="${WHITE}" fill-opacity="0.35" stroke="${INK}" stroke-width="2.6">
        <circle cx="37" cy="52" r="12.5" /><circle cx="63" cy="52" r="12.5" />
      </g>
      <path d="M49.5 52 H50.5 M24.5 50 L16 47 M75.5 50 L84 47" stroke="${INK}"
            stroke-width="2.6" stroke-linecap="round" fill="none" />`),
  squareSpecs: (c) =>
    front(`
      <g fill="${WHITE}" fill-opacity="0.35" stroke="${INK}" stroke-width="3.2">
        <rect x="24.5" y="41" width="25" height="22" rx="6" />
        <rect x="50.5" y="41" width="25" height="22" rx="6" />
      </g>
      <path d="M49.5 51 H50.5 M24 46 L16 44 M76 46 L84 44" stroke="${INK}"
            stroke-width="3" stroke-linecap="round" fill="none" />`),
  goggles: (c) =>
    front(`
      <path d="M18 48 H82" stroke="${c.accent}" stroke-width="7" stroke-linecap="round" />
      <g fill="${WHITE}" fill-opacity="0.4" stroke="${INK}" stroke-width="3">
        <circle cx="37" cy="52" r="13.5" /><circle cx="63" cy="52" r="13.5" />
      </g>`),
  monocle: (c) =>
    front(`
      <circle cx="63" cy="52" r="13" fill="${WHITE}" fill-opacity="0.35" stroke="${INK}" stroke-width="2.8" />
      <path d="M63 65 C63 72 58 75 54 76" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round" />`),
  starShades: (c) =>
    front(`
      <path d="M${star(37, 52, 14)} Z" fill="${c.accent}" fill-opacity="0.62" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M${star(63, 52, 14)} Z" fill="${c.accent}" fill-opacity="0.62" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" />`),
};

/* --------------------------------------------------------------------- hair */

// `crown` hair sits on top of the head and must not land on a species that already
// grows something there. A fringe covers the forehead instead, so it is free to pair
// with any horn or antenna.
export const HAIR_CROWN = new Set(['cowlick', 'topknot', 'cap']);

export const HAIR = {
  none: () => front(''),
  fringe: (c) =>
    front(`<path d="M23 40 C26 24 40 18 50 18 C62 18 74 25 76 40
                    C70 32 62 34 57 39 C54 31 44 30 39 36 C34 32 27 34 23 40 Z"
                 fill="${c.accent}" />`),
  cowlick: (c) =>
    front(`<path d="M46 22 C44 12 52 6 60 4 C54 10 55 15 60 17 C54 19 49 20 46 26 Z" fill="${c.accent}" />`),
  topknot: (c) =>
    front(`<circle cx="50" cy="14" r="10" fill="${c.accent}" stroke="${INK}" stroke-width="2.2" />
           <path d="M42 22 Q50 26 58 22" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round" />`),
  cap: (c) =>
    front(`<g fill="${c.accent}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M22 32 C22 16 78 16 78 32 Z" />
             <path d="M78 30 C88 30 90 36 88 38 L74 34 Z" />
           </g>
           <circle cx="50" cy="13" r="4" fill="${INK}" />`),
  bow: (c) =>
    front(`<g transform="translate(26 24) rotate(-18)" fill="${c.accent}" stroke="${INK}"
              stroke-width="2.2" stroke-linejoin="round">
             <path d="M0 0 C-9 -8 -14 -2 -12 4 C-10 9 -3 7 0 0 Z" />
             <path d="M0 0 C9 -8 14 -2 12 4 C10 9 3 7 0 0 Z" />
             <circle cx="0" cy="0" r="3.6" fill="${INK}" stroke="none" />
           </g>`),
  flower: (c) =>
    front(`<g transform="translate(75 28)">
             ${[0, 72, 144, 216, 288]
               .map((a) => {
                 const rad = (a * Math.PI) / 180;
                 return `<ellipse cx="${(Math.cos(rad) * 6).toFixed(1)}" cy="${(Math.sin(rad) * 6).toFixed(1)}" rx="5" ry="4" transform="rotate(${a})" fill="${WHITE}" />`;
               })
               .join('')}
             <circle cx="0" cy="0" r="4" fill="#ffd166" />
           </g>`),
};

/* -------------------------------------------------------- facial hair / muzzle */

export const FACIAL = {
  none: () => front(''),
  moustache: () =>
    front(`<path d="M50 64 C46 59 38 59 35 64 C38 68 46 68 50 64 Z
                    M50 64 C54 59 62 59 65 64 C62 68 54 68 50 64 Z" fill="${INK}" />`),
  // A chin tuft below the mouth, not a shape across it. The first version spanned the
  // mouth and, drawing after it, turned six pets into dark masks with no face at all.
  beard: () =>
    front(`<g fill="${INK}">
             <circle cx="44" cy="78.5" r="6" /><circle cx="50" cy="81" r="7" /><circle cx="56" cy="78.5" r="6" />
           </g>`),
  whiskers: () =>
    front(`<g stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none">
             <path d="M32 64 L18 61 M32 68 L17 68 M32 72 L19 76" />
             <path d="M68 64 L82 61 M68 68 L83 68 M68 72 L81 76" />
           </g>`),
  teeth: () =>
    front(`<rect x="45" y="70" width="4.6" height="7" rx="1.6" fill="${WHITE}" stroke="${INK}" stroke-width="1.4" />
           <rect x="50.4" y="70" width="4.6" height="7" rx="1.6" fill="${WHITE}" stroke="${INK}" stroke-width="1.4" />`),
  // The only part that needs to sit *under* the mouth rather than over it.
  snout: (c) =>
    both(
      `<ellipse cx="50" cy="69" rx="15" ry="11.5" fill="${c.belly}" />
       <ellipse cx="50" cy="61" rx="5.5" ry="4" fill="${INK}" />`,
      ''
    ),
};

/* ----------------------------------------------------------------- markings */

export const MARKINGS = {
  none: () => front(''),
  freckles: (c) =>
    front(`<g fill="${INK}" opacity="0.4">
             <circle cx="26" cy="57" r="1.6" /><circle cx="30" cy="60" r="1.6" /><circle cx="25" cy="63" r="1.6" />
             <circle cx="74" cy="57" r="1.6" /><circle cx="70" cy="60" r="1.6" /><circle cx="75" cy="63" r="1.6" />
           </g>`),
  spots: (c) =>
    both(
      `<g fill="${c.accent}" opacity="0.5">
         <ellipse cx="24" cy="44" rx="7" ry="5.5" /><ellipse cx="76" cy="70" rx="6" ry="5" />
         <ellipse cx="70" cy="34" rx="5" ry="4" />
       </g>`,
      ''
    ),
  stripes: (c) =>
    both(
      `<g stroke="${c.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55">
         <path d="M20 46 Q26 50 26 58" /><path d="M22 62 Q28 65 29 72" />
         <path d="M80 46 Q74 50 74 58" /><path d="M78 62 Q72 65 71 72" />
       </g>`,
      ''
    ),
  // Under the eye rather than over it — a patch drawn on top would hide the one feature
  // every scrap of this game's expression depends on.
  patch: (c) =>
    both(`<ellipse cx="37" cy="52" rx="15" ry="14" fill="${c.accent}" opacity="0.45" />`, ''),
  heart: (c) =>
    both(
      `<path d="M50 76 C44 70 38 68 38 63 C38 59 43 58 46 61 C47 62 49 63 50 65
                C51 63 53 62 54 61 C57 58 62 59 62 63 C62 68 56 70 50 76 Z"
             fill="${c.accent}" opacity="0.6" />`,
      ''
    ),
};

/* --------------------------------------------------------------- accessories */

// Worn at the base of a creature that has no neck, so these read as a collar line just
// under the belly rather than floating in mid-air.
export const ACCESSORIES = {
  none: () => front(''),
  scarf: (c) =>
    front(`<g fill="${c.accent}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M28 78 C38 85 62 85 72 78 C70 85 62 89 50 89 C38 89 30 85 28 78 Z" />
             <path d="M66 82 C72 84 74 90 71 94 C67 92 65 87 66 82 Z" />
           </g>`),
  bandana: (c) =>
    front(`<path d="M30 79 C40 85 60 85 70 79 L50 95 Z" fill="${c.accent}" stroke="${INK}"
                 stroke-width="2.2" stroke-linejoin="round" />`),
  bowtie: (c) =>
    front(`<g transform="translate(50 82)" fill="${c.accent}" stroke="${INK}" stroke-width="2.2"
              stroke-linejoin="round">
             <path d="M0 0 L-12 -6 L-12 6 Z" />
             <path d="M0 0 L12 -6 L12 6 Z" />
             <circle cx="0" cy="0" r="3.4" fill="${INK}" stroke="none" />
           </g>`),
  // Worn on the front, overlapping the body, because a pack drawn behind is either
  // invisible on a wide silhouette or reads as a suitcase standing next to the pet.
  backpack: (c) =>
    front(`<g stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M38 44 C33 56 33 68 37 78" fill="none" stroke="${c.accent}" stroke-width="4.5" />
             <path d="M62 44 C67 56 67 68 63 78" fill="none" stroke="${c.accent}" stroke-width="4.5" />
             <rect x="12" y="64" width="17" height="19" rx="6" fill="${c.accent}" />
             <path d="M12 71 H29" fill="none" />
           </g>`),
};
