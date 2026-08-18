/**
 * Panels that open in the top layer, the way a native `<select>` popup does: over
 * everything, never clipped by a scrolling ancestor, dismissed by a click outside or by
 * Escape. `createMenu` anchors one to a button; `createContextMenu` opens one at a point.
 *
 * The toolbar scrolls horizontally, which per the overflow spec makes it a clipping
 * container on *both* axes. An absolutely positioned panel anchored there is trapped in a
 * 3rem-tall box no matter its z-index, so the top layer is the only place such a menu can
 * actually open.
 */

/** Space between the anchor and the panel, and the least gap kept to the viewport edge. */
const GAP = 4;
const EDGE = 8;

/** Popovers are the whole point; where they are missing the panel still has to open. */
const supported = (panel) => typeof panel.showPopover === 'function';

/**
 * Put `panel` just past `anchor` in viewport coordinates, flipping above or inwards rather
 * than hanging off an edge. Measured while open, which is when the size is real.
 */
function place(panel, anchor) {
  const { width, height } = panel.getBoundingClientRect();
  const left = Math.max(EDGE, Math.min(anchor.left, window.innerWidth - width - EDGE));
  const below = anchor.bottom + GAP;
  const fits = below + height + EDGE <= window.innerHeight;
  const top = fits ? below : Math.max(EDGE, anchor.top - GAP - height);
  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(top)}px`;
}

function show(panel) {
  if (!supported(panel)) {
    panel.hidden = false;
    return;
  }
  // Re-showing an open popover throws, and reopening at a new point is a normal thing to
  // ask for, so close first.
  if (panel.matches(':popover-open')) panel.hidePopover();
  panel.showPopover();
}

function hide(panel) {
  if (!supported(panel)) {
    panel.hidden = true;
    return;
  }
  if (panel.matches(':popover-open')) panel.hidePopover();
}

/**
 * Outside-press and Escape, for a `manual` popover or a browser with no popovers at all.
 *
 * Keyed to `pointerdown` rather than `click`: a menu opened from a right-click must not be
 * closed by the pointerup that finishes that very click.
 */
function wireDismiss(panel, isOpen, close) {
  if (!supported(panel)) panel.hidden = true;
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (isOpen() && !panel.contains(event.target)) close();
    },
    true
  );
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) close();
  });
}

/** A button that opens `panel` beneath itself. */
export function createMenu(button, panel) {
  const isOpen = () => button.getAttribute('aria-expanded') === 'true';

  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    // `toggle` fires before the browser paints, so placing here never shows a flash of
    // the panel at the wrong position.
    if (open) place(panel, button.getBoundingClientRect());
  }

  const close = () => {
    hide(panel);
    setOpen(false);
  };

  if (supported(panel)) {
    panel.addEventListener('toggle', (event) => setOpen(event.newState === 'open'));
    button.addEventListener('click', () => panel.togglePopover());
  } else {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (isOpen()) close();
      else {
        show(panel);
        setOpen(true);
      }
    });
    wireDismiss(panel, isOpen, close);
  }

  // The anchor moves with the layout; an open panel would otherwise be left behind.
  window.addEventListener('resize', () => isOpen() && place(panel, button.getBoundingClientRect()));

  return { close };
}

/**
 * A panel opened at a point rather than under a button — a right-click menu. The caller
 * fills it before each open, since what a context menu offers depends on what was clicked.
 */
export function createContextMenu(panel) {
  let open = false;
  const isOpen = () => open;

  const close = () => {
    hide(panel);
    open = false;
  };

  if (supported(panel)) {
    panel.addEventListener('toggle', (event) => {
      open = event.newState === 'open';
    });
  }
  // Always ours to dismiss: the panel is a `manual` popover precisely so that the
  // pointerup ending the right-click cannot close it.
  wireDismiss(panel, isOpen, close);

  return {
    close,
    openAt(clientX, clientY) {
      show(panel);
      open = true;
      // A zero-size anchor at the pointer, so the menu hangs off the cursor and flips
      // near an edge exactly as an anchored one does.
      place(panel, { left: clientX, right: clientX, top: clientY, bottom: clientY });
    },
  };
}
