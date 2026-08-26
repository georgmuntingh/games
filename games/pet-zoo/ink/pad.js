// The surface a digit is written on.
//
// The only file in ink/ that touches the DOM, and the only one that uses a <canvas> — for
// *showing* the ink, never for measuring it. What the recogniser sees is the list of points
// collected here, re-drawn by our own rasteriser; the canvas is decoration, and if its
// anti-aliasing differs between browsers it changes nothing that matters.
//
// Built as a factory returning a handle, the same shape as createHabitatScene: the caller
// attaches it once and then opens and clears it per question.

import { bounds, dedupe } from './strokes.js';

const RATIO = () => (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1;

/**
 * @param host      element to fill
 * @param onSettled called with the strokes a beat after the pen lifts — reading on every
 *                  pointermove would flicker a different digit at the child mid-stroke
 * @param onStart   called when the first mark of a new answer goes down
 */
export function createInkPad({
  host,
  onSettled = () => {},
  onStart = () => {},
  settleMs = 300,
  lineWidth = 0.06, // as a fraction of the pad's short side, so it looks the same everywhere
  colour = '#43354f',
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'ink-pad';
  const context = canvas.getContext('2d');

  let strokes = [];
  let live = null;
  let pointer = null;
  let settleTimer = null;
  let width = 0;
  let height = 0;

  function resize() {
    // The *content* box, not the bounding rectangle: the latter includes the host's border,
    // and sizing the canvas to that makes it overflow its parent, which changes the parent's
    // size, which fires the ResizeObserver again. Bailing when nothing actually changed
    // closes the loop for good.
    const next = { w: host.clientWidth, h: host.clientHeight };
    if (!next.w || !next.h) return;
    if (next.w === width && next.h === height && canvas.width) return;
    width = next.w;
    height = next.h;
    const ratio = RATIO();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    redraw();
  }

  function redraw() {
    context.clearRect(0, 0, width, height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = colour;
    context.lineWidth = Math.min(width, height) * lineWidth;
    for (const stroke of [...strokes, live].filter(Boolean)) {
      if (stroke.length === 1) {
        context.beginPath();
        context.arc(stroke[0].x, stroke[0].y, context.lineWidth / 2, 0, Math.PI * 2);
        context.fillStyle = colour;
        context.fill();
        continue;
      }
      context.beginPath();
      context.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i += 1) context.lineTo(stroke[i].x, stroke[i].y);
      context.stroke();
    }
  }

  const at = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  function settle() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => onSettled(snapshot()), settleMs);
  }

  function onDown(event) {
    // First pointer wins for the whole stroke: a palm resting on the screen arrives as a
    // second pointer and is simply not listened to.
    if (pointer !== null) return;
    pointer = event.pointerId;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    clearTimeout(settleTimer);
    if (!strokes.length) onStart();
    live = [at(event)];
    redraw();
  }

  function onMove(event) {
    if (event.pointerId !== pointer || !live) return;
    event.preventDefault();
    // A 120Hz screen delivers several positions per frame; taking them all makes the line
    // the child actually drew rather than a polygon through every third point of it.
    const points = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];
    for (const point of points.length ? points : [event]) live.push(at(point));
    redraw();
  }

  function onUp(event) {
    if (event.pointerId !== pointer) return;
    pointer = null;
    if (live) {
      const stroke = dedupe(live, 0.5);
      if (stroke.length) strokes.push(stroke);
      live = null;
      redraw();
    }
    settle();
  }

  const snapshot = () => ({
    strokes: strokes.map((stroke) => stroke.map((p) => ({ x: p.x, y: p.y }))),
    pad: Math.min(width, height) || 1,
  });

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  let observer = null;

  return {
    attach() {
      host.appendChild(canvas);
      resize();
      if (typeof ResizeObserver === 'function') {
        observer = new ResizeObserver(resize);
        observer.observe(host);
      }
    },
    clear() {
      clearTimeout(settleTimer);
      strokes = [];
      live = null;
      pointer = null;
      redraw();
    },
    /** Take back the last mark. A child who botched the second stroke of a 4 keeps the 4. */
    undo() {
      clearTimeout(settleTimer);
      strokes.pop();
      live = null;
      redraw();
      settle();
    },
    resize,
    get strokes() {
      return snapshot().strokes;
    },
    get pad() {
      return snapshot().pad;
    },
    get isEmpty() {
      return strokes.length === 0 && !live;
    },
    get span() {
      const box = bounds(strokes);
      return Math.max(box.width, box.height);
    },
    destroy() {
      clearTimeout(settleTimer);
      observer?.disconnect();
      canvas.remove();
    },
  };
}
