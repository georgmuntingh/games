/**
 * The toolbar at phone widths.
 *
 * The bar holds seventeen controls, which is a comfortable row on a laptop and about twice
 * a phone's width. Below the breakpoint the ones reached for constantly stay put and the
 * rest move into a `⋯` menu — the real elements, not copies. That is the whole trick: there
 * is still exactly one `#hide-done` in the document, so every listener, every `aria-pressed`
 * and every checkbox `main.js` renders keeps working wherever the control currently hangs,
 * and nothing has to be mirrored between two places.
 *
 * Each movable control leaves an empty `<span class="toolbar-slot">` behind in the bar, so
 * widening the window again is `slot.after(el)` — no record of where anything came from, and
 * no way for the order to drift.
 *
 * Two tiers, because seven glyph buttons and two dropdowns genuinely do not fit 360px: at
 * `TIGHT_QUERY` the timeline scale follows the rest into the menu, which is what buys the
 * project picker a width worth reading.
 */

/** Both mirrored in style.css. The pairs must agree, or the bar and the menu disagree. */
export const COMPACT_QUERY = '(max-width: 820px)';
export const TIGHT_QUERY = '(max-width: 480px)';

/**
 * What moves, when, and under which heading. The three groups are the three questions the
 * controls answer: what is shown, how the board is drawn, and which project is being looked
 * at. Order within a group is the order listed here.
 */
const MOVABLE = [
  ['people-options', 'view', 'compact'],
  ['hide-done-field', 'view', 'compact'],
  ['collapse-empty-field', 'view', 'compact'],
  ['link-mode', 'board', 'compact'],
  ['auto-layout', 'board', 'compact'],
  ['fit', 'board', 'compact'],
  ['rows-stepper', 'board', 'compact'],
  ['project-new', 'projects', 'compact'],
  ['projects-open', 'projects', 'compact'],
  ['trash-open', 'projects', 'compact'],
  ['back-link', 'projects', 'compact'],
  ['bucket-field', 'board', 'tight'],
];

/**
 * Wire the `⋯` panel to the viewport.
 *
 * `onChange` runs before each move, while the popovers are still popovers: it is where the
 * caller closes any menu that is open, since a panel that changes parents mid-show is left
 * pointing at an anchor that has moved.
 */
export function createCompactToolbar({
  panel,
  onChange,
  compactMedia = matchMedia(COMPACT_QUERY),
  tightMedia = matchMedia(TIGHT_QUERY),
} = {}) {
  const groups = new Map(
    [...panel.querySelectorAll('[data-group]')].map((el) => [el.dataset.group, el])
  );
  const items = MOVABLE.map(([id, group, tier]) => ({
    el: document.getElementById(id),
    slot: document.querySelector(`.toolbar-slot[data-for="${id}"]`),
    group: groups.get(group),
    tier,
    moved: false,
  })).filter((item) => item.el && item.slot && item.group);

  const people = document.getElementById('people-options');
  let compact = null;

  function apply() {
    const tiers = { compact: compactMedia.matches, tight: tightMedia.matches };
    const moves = items.filter((item) => tiers[item.tier] !== item.moved);
    if (!moves.length && tiers.compact === compact) return;
    onChange?.(tiers.compact);

    if (tiers.compact !== compact) {
      compact = tiers.compact;
      if (compact) {
        // A popover opened from inside another popover dismisses the one it sits in — they
        // are unrelated as far as the top layer is concerned. The people list is wanted
        // inline here anyway, so while it is in the menu it stops being a popover at all.
        if (people?.matches(':popover-open')) people.hidePopover();
        people?.removeAttribute('popover');
        people?.classList.add('inline');
      } else {
        people?.classList.remove('inline');
        people?.setAttribute('popover', '');
      }
    }

    // Into the menu in listed order, back to the bar by slot — which is position, not order.
    for (const item of moves) {
      item.moved = tiers[item.tier];
      if (item.moved) item.group.append(item.el);
      else item.slot.after(item.el);
    }
  }

  apply();
  compactMedia.addEventListener('change', apply);
  tightMedia.addEventListener('change', apply);

  return {
    get compact() {
      return compact;
    },
  };
}
