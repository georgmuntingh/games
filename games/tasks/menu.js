/**
 * A button that opens a panel in the top layer, the way a native `<select>` popup does:
 * over everything, never clipped by a scrolling ancestor, dismissed by a click outside or
 * by Escape.
 *
 * The toolbar scrolls horizontally, which per the overflow spec makes it a clipping
 * container on *both* axes. An absolutely positioned panel anchored there is trapped in a
 * 3rem-tall box no matter its z-index, so the top layer is the only place such a menu can
 * actually open.
 */

/** Space between the button and the panel, and the least gap kept to the viewport edge. */
const GAP = 4;
const EDGE = 8;

export function createMenu(button, panel) {
  // Popovers are the whole point; where they are missing the panel still has to open, so
  // it falls back to a fixed box with hand-rolled dismissal.
  const native = typeof panel.showPopover === 'function';
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';

  /**
   * Anchor the panel under the button in viewport coordinates, flipping above or inwards
   * rather than hanging off an edge. Measured while open, which is when the size is real.
   */
  function place() {
    const anchor = button.getBoundingClientRect();
    const { width, height } = panel.getBoundingClientRect();
    const left = Math.max(EDGE, Math.min(anchor.left, window.innerWidth - width - EDGE));
    const below = anchor.bottom + GAP;
    const fits = below + height + EDGE <= window.innerHeight;
    const top = fits ? below : Math.max(EDGE, anchor.top - GAP - height);
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
  }

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    // `toggle` fires before the browser paints, so placing here never shows a flash of
    // the panel at the wrong position.
    if (open) place();
  }

  if (native) {
    panel.addEventListener('toggle', (event) => setOpen(event.newState === 'open'));
    button.addEventListener('click', () => panel.togglePopover());
  } else {
    panel.hidden = true;
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      panel.hidden = !panel.hidden;
      setOpen(!panel.hidden);
    });
    document.addEventListener('click', (event) => {
      if (isOpen() && !panel.contains(event.target)) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) close();
    });
  }

  function close() {
    if (native) {
      if (panel.matches(':popover-open')) panel.hidePopover();
    } else {
      panel.hidden = true;
    }
    setOpen(false);
  }

  // The anchor moves with the layout; an open panel would otherwise be left behind.
  window.addEventListener('resize', () => isOpen() && place());

  return { close };
}
