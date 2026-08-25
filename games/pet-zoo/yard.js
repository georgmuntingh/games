// The zoo yard: the strip of ground above the pet grid, and the only thing in the game that
// belongs to the whole collection rather than to one pet. What stands in it is what the child
// has bought from the stall's zoo shelf.
//
// It borrows the habitat's coordinate system whole — the same 200x120 box, the same horizon,
// the same walk line — and is simply cropped harder: `xMidYMax slice` in a wide shallow
// container keeps the full width and throws the top of the sky away, which is the crop a
// habitat already survives in landscape. Nothing here needed a second geometry, and that is
// the point: a fountain in the yard is drawn against the same ground as a pond in a habitat,
// so the zoo and the homes in it look like one place.
//
// Pure — no DOM, no Date, no storage — like habitat.js, so tests can walk it. The hour comes
// in as an argument rather than off the clock.

import {
  DETAIL,
  FAR,
  groundMarkup,
  motesMarkup,
  PHASES,
  phaseOfHour,
  rndFrom,
  skyMarkup,
  VIEW,
  WALK_Y,
  YARD_PIECES,
} from './habitat-parts.js';
import { paletteFor } from './habitat.js';
import { MAX_ZOO_DECOR, sanitizeZoo } from './shop.js';

/**
 * Where the yard's pieces stand. Three, evenly spread across the full width — unlike a
 * habitat, the yard is never cropped sideways, so the whole box is usable and there is no
 * middle to keep clear: nothing lives here, so nothing has to walk through.
 *
 * Wide enough apart for the widest piece there is (bunting, at 23 either side) to stand
 * between two others without touching them.
 */
export const YARD_SLOTS = [34, 100, 166];

/** The seed for the yard's scattered detail. Fixed: the zoo is one place, always the same. */
const YARD_SEED = 4;

/**
 * The zoo's own colours. A meadow, warmed toward the same pink the app's chrome uses, so the
 * strip reads as this game's zoo rather than as a fifteenth biome the child has to learn.
 */
export const yardPalette = (phase) => paletteFor('mochi', 'meadow', phase);

/**
 * The pieces placed into their slots, in the order they were bought — the same rule the
 * habitat's furniture follows, so buying a second thing never moves the first one.
 */
export function yardPiecesFor(zooDecor) {
  return sanitizeZoo(zooDecor)
    .slice(0, MAX_ZOO_DECOR)
    .map((id, i) => ({ id, x: YARD_SLOTS[i], y: WALK_Y }));
}

/**
 * The whole yard as one SVG string, the way `habitatSvg` does it. An empty yard still draws:
 * a child who has bought nothing should see the place their fountain would go, not a gap.
 */
export function yardSvg(zooDecor, { hour24 = 12, uid = 'yard', label = '' } = {}) {
  const phase = phaseOfHour(hour24);
  const c = yardPalette(phase);
  const spec = PHASES[phase] ?? PHASES.noon;
  const rnd = rndFrom(YARD_SEED + 3);
  const pieces = yardPiecesFor(zooDecor);

  return `
<svg class="yard" viewBox="0 0 ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMax slice"
     role="img" aria-label="${label}" focusable="false">
  <defs>
    <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${spec.sky[0]}" />
      <stop offset="1" stop-color="${spec.sky[1]}" />
    </linearGradient>
    <linearGradient id="${uid}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.ground[0]}" />
      <stop offset="1" stop-color="${c.ground[1]}" />
    </linearGradient>
    <radialGradient id="${uid}-glow">
      <stop offset="0" stop-color="${spec.glow}" stop-opacity="0.85" />
      <stop offset="1" stop-color="${spec.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g class="yard-sky">
    <rect x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" fill="url(#${uid}-sky)" />
    ${skyMarkup(phase, hour24, YARD_SEED, uid)}
  </g>

  <g class="yard-far">${FAR.hills(c)}</g>

  <g class="yard-ground">
    ${groundMarkup(c, uid)}
    ${DETAIL.grass(c, rnd)}
  </g>

  <g class="yard-pieces">
    ${pieces
      .map(
        (p) => `<g class="yard-piece" transform="translate(${p.x} ${p.y})">${
          (YARD_PIECES[p.id] ?? YARD_PIECES.signpost)(c)
        }</g>`
      )
      .join('')}
  </g>

  ${spec.night ? `<g class="yard-motes">${motesMarkup(c, YARD_SEED, 10)}</g>` : ''}

  <rect class="yard-veil" x="0" y="0" width="${VIEW.w}" height="${VIEW.h}" fill="${spec.veil}" />
</svg>`;
}
