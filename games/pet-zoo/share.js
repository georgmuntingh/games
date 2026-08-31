// Sharing out: what a wrong division fact gets shown instead of a red cross.
//
// The clock answers a mistake by walking ghost hands to the right time; adding fills a
// ten-frame; multiplying builds an array. This is the counterpart for dividing, and it is dots
// dealt into groups rather than an array turned on its side on purpose. `56 : 8` is not a
// picture of eight rows of seven — that is the *product*, and the child already has it. It is
// the question "how many does each of eight get", and the only picture that answers that is one
// where the dots are handed out.
//
// So they are dealt a round at a time: one into each group, then one into each group again, and
// the count beside the groups goes up by eight rather than by one. Six rounds in and there are
// forty-eight down with eight still in hand; seven rounds in there are none left, and seven is
// the answer. A child who guessed six watches the round that they stopped short of.
//
// Pure, like tenframe.js and array.js beside it: geometry in, SVG string out. The arrival of
// each round is a CSS animation delay, so there is no loop to run and nothing to clean up.

/**
 * A round of dealing against a column of a column sum, as beats.
 *
 * The pace comes from the grown-ups' walkthrough setting so there is one control rather than
 * several, but a round is a much smaller thing to watch than a column of working — "and one
 * more each" against "seven and eight is fifteen, write the five, carry the one".
 */
export const ROUND_STEP_SCALE = 0.3;

// Above this the picture stops being a picture. Ten groups of ten is the whole of the deck this
// is drawn for; the one rung that divides bigger numbers is about the zeros coming off the end
// and has a sentence rather than a drawing.
export const MAX_DOTS = 100;

const CELL = 14;
const GAP = 4;
const PAD = 6;
const GROUP_GAP = 12;
const TOTALS_H = 18; // the running count, under the groups

/**
 * Where every dot goes and which round it arrives in. `a` dots shared between `b` groups, dealt
 * one to each group per round, with whatever will not go round again left over at the side.
 */
export function sharePlan(a, b) {
  const total = Math.max(0, Math.floor(a));
  const groups = Math.max(1, Math.floor(b));
  const rounds = Math.floor(total / groups);
  const left = total - rounds * groups;
  const dots = [];
  for (let round = 0; round < rounds; round += 1) {
    for (let group = 0; group < groups; group += 1) dots.push({ round, group, spare: false });
  }
  // The leftovers are drawn apart rather than as a short last round, because that is what they
  // are: not enough to go round, so nobody gets one.
  for (let i = 0; i < left; i += 1) dots.push({ round: rounds, group: i, spare: true });
  return {
    total,
    groups,
    rounds,
    left,
    // 8, 16, 24 … — how many have been handed out after each round, which is the skip-counting
    // written down and the reason this picture teaches rather than merely shows.
    counts: Array.from({ length: rounds }, (_, round) => (round + 1) * groups),
    dots,
  };
}

// Across is groups, down is rounds — and the gap across is the wider of the two on purpose. At
// equal spacing this is an array, and an array is the picture for `6 × 7`; what makes it the
// picture for `42 : 6` is that the six columns read as six *piles*, one per share.
const dotX = (group) => PAD + group * (CELL + GROUP_GAP) + CELL / 2;
const dotY = (round) => PAD + round * (CELL + GAP) + CELL / 2;

/**
 * The picture. `step` is how long each round waits behind the one before it, in seconds; pass 0
 * for a still frame that needs no motion at all.
 *
 * Empty for anything too big to draw — the caller shows the sentence alone rather than a wall of
 * dots nobody can count.
 */
export function shareSvg(a, b, { step = 0.35, title = '' } = {}) {
  const plan = sharePlan(a, b);
  if (!plan.total || plan.total > MAX_DOTS) return '';

  const width = PAD * 2 + plan.groups * CELL + (plan.groups - 1) * GROUP_GAP;
  const rows = plan.rounds + (plan.left ? 1 : 0);
  const height =
    PAD * 2 + rows * CELL + Math.max(0, rows - 1) * GAP + (plan.left ? GROUP_GAP : 0) + TOTALS_H;
  // The leftovers stand clear of the rounds that did go round.
  const spareY = dotY(plan.rounds) + GROUP_GAP;

  const dots = plan.dots.map((dot) => {
    // Per round, not per dot: the lesson is "one more each", and dots trickling in one by one
    // would teach counting-all, which is the habit the whole ladder exists to grow out of.
    const delay = (dot.round * step).toFixed(2);
    const y = dot.spare ? spareY : dotY(dot.round);
    const klass = dot.spare ? 'sh-dot sh-spare' : 'sh-dot';
    return `<circle class="${klass}" cx="${dotX(dot.group)}" cy="${y}" r="${CELL / 2 - 1.5}" style="--sh-delay:${delay}s" />`;
  });

  // Only the last count is named, under the groups: the running totals belong beside an array,
  // where the rows are the thing being counted. Here what is being counted is the *rounds*, and
  // the number that matters is how many each group ended up with.
  const label = `<text class="sh-count" x="${width / 2}" y="${height - 4}" text-anchor="middle"
      style="--sh-delay:${(plan.rounds * step + step * 0.55).toFixed(2)}s">${plan.rounds}</text>`;

  return `<svg class="sharedots" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">
      ${dots.join('')}
      ${label}
    </svg>`;
}

/** How long the whole thing takes, so a caller can wait exactly that long and no longer. */
export const shareDuration = (a, b, step = 0.35) =>
  (Math.floor(Math.max(0, a) / Math.max(1, b)) * step + 0.6) * 1000;
