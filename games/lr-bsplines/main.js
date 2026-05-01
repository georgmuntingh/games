// Phases 3 + 4 + 5: state management, SVG rendering, and interactive
// mesh-line insertion. Phase 6 will add the basis-function inset and
// two-way hover highlighting; Phases 7+ are panel polish and manifest.

import {
  approxEq,
  cloneState,
  computeAnchors,
  createInitialState,
  deserialize,
  distinct,
  insertMeshLine,
  meshlineFromAnchors,
  previewSplitTargets,
  serialize,
} from './lr-math.js';

// --- DOM references --------------------------------------------------------
const board = document.getElementById('board');
const status = document.getElementById('status');
const floatingMult = document.getElementById('floating-mult');
const floatingMultVal = document.getElementById('mult-val');
const canvasWrap = board.parentElement;

const inputP = document.getElementById('p');
const inputQ = document.getElementById('q');
const inputNx = document.getElementById('nx');
const inputNy = document.getElementById('ny');
const inputOpen = document.getElementById('open-knots');
const inputMult = document.getElementById('mult');

const btnReset = document.getElementById('reset-btn');
const btnUndo = document.getElementById('undo-btn');
const btnRedo = document.getElementById('redo-btn');
const btnExport = document.getElementById('export-btn');
const inputImport = document.getElementById('import-input');

const bsplineList = document.getElementById('bspline-list');
const bsplineCount = document.getElementById('bspline-count');
const statMeshlines = document.getElementById('stat-meshlines');
const statBsplines = document.getElementById('stat-bsplines');
const statRefinements = document.getElementById('stat-refinements');

// --- Store -----------------------------------------------------------------
const store = {
  initialConfig: {
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  },
  current: null,
  undoStack: [],
  redoStack: [],
  selectedBSplineIndex: null,
};

// --- Insertion state machine (Phase 5) ------------------------------------
const insertion = {
  mode: 'idle',          // 'idle' | 'firstPicked'
  firstAnchor: null,
  hotAnchor: null,
  multiplicity: 1,
};

// Drag tracking for the press-and-drag insertion mechanism.
const drag = {
  pointerDown: false,
  startClientX: 0,
  startClientY: 0,
  moved: false,
};
const DRAG_THRESHOLD_PX = 5;

function maxMultiplicity() {
  const s = store.current;
  return s ? Math.max(s.p, s.q) + 1 : 6;
}

function setMultiplicity(m) {
  insertion.multiplicity = clampInt(m, 1, maxMultiplicity());
  inputMult.value = insertion.multiplicity;
  floatingMultVal.textContent = insertion.multiplicity;
}

function anchorEquals(a, b) {
  if (!a || !b) return false;
  return (
    a.dir === b.dir &&
    approxEq(a.c, b.c) &&
    approxEq(a.edgeLo, b.edgeLo) &&
    approxEq(a.edgeHi, b.edgeHi)
  );
}

function anchorIsCompatible(a, first) {
  if (a.dir !== first.dir) return false;
  // Same existing mesh-line (raises multiplicity), OR same midpoint on a
  // different mesh-line (defines a new perpendicular mesh-line).
  return approxEq(a.c, first.c) || approxEq(a.mid, first.mid);
}

function startInsertion(anchor) {
  insertion.mode = 'firstPicked';
  insertion.firstAnchor = anchor;
  insertion.hotAnchor = anchor;
  setMultiplicity(insertion.multiplicity);
  floatingMult.hidden = false;
  positionFloatingMult();
  const newPerp = anchor.dir === 'h' ? 'vertical' : 'horizontal';
  setStatus(
    `Picked anchor. Choose a second anchor with the same midpoint to insert a new ${newPerp} mesh-line, or one on the same existing mesh-line to raise its multiplicity. Hold-and-drag also works; Esc cancels.`
  );
  renderBoard();
}

function cancelInsertion(reason) {
  insertion.mode = 'idle';
  insertion.firstAnchor = null;
  insertion.hotAnchor = null;
  floatingMult.hidden = true;
  if (reason) setStatus(reason);
  renderBoard();
}

function tryCommitFromAnchors(secondAnchor) {
  const first = insertion.firstAnchor;
  if (!anchorIsCompatible(secondAnchor, first)) {
    setStatus(
      'Anchors must share a direction and either lie on the same mesh-line or share the same midpoint.',
      true
    );
    return;
  }
  const ml = meshlineFromAnchors(first, secondAnchor, insertion.multiplicity);
  if (!ml) {
    setStatus('Could not build mesh-line from these anchors.', true);
    return;
  }
  const isRaisingMult = approxEq(first.c, secondAnchor.c);
  const targets = previewSplitTargets(store.current, ml);
  commitInsertion(ml);
  const dirWord = ml.dir === 'h' ? 'horizontal' : 'vertical';
  const axis = ml.dir === 'h' ? 'y' : 'x';
  const action = isRaisingMult
    ? `Raised multiplicity of the ${dirWord} mesh-line at ${axis}=${ml.c.toFixed(3)}`
    : `Inserted new ${dirWord} mesh-line at ${axis}=${ml.c.toFixed(3)}`;
  if (targets.length === 0) {
    setStatus(`${action} (m=${ml.m}). Warning: no B-splines were split — not a strict LR refinement.`, true);
  } else {
    setStatus(
      `${action} (m=${ml.m}) — ${targets.length} B-spline${targets.length === 1 ? '' : 's'} split; basis now has ${store.current.bsplines.length}.`
    );
  }
  cancelInsertion(null);
}

function positionFloatingMult(clientX, clientY) {
  // Position relative to the canvas-wrap; default to a fixed corner if we
  // don't yet have cursor coordinates.
  const wrapRect = canvasWrap.getBoundingClientRect();
  if (clientX === undefined) {
    floatingMult.style.left = `8px`;
    floatingMult.style.top = `8px`;
    return;
  }
  const x = Math.max(8, Math.min(wrapRect.width - 160, clientX - wrapRect.left + 14));
  const y = Math.max(8, Math.min(wrapRect.height - 40, clientY - wrapRect.top + 14));
  floatingMult.style.left = `${x}px`;
  floatingMult.style.top = `${y}px`;
}

function svgPointFromEvent(event) {
  const pt = board.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const ctm = board.getScreenCTM();
  if (!ctm) return null;
  const local = pt.matrixTransform(ctm.inverse());
  return [local.x, local.y];
}

// SVG-unit threshold beyond which we no longer snap to the nearest compatible
// anchor. Values are in viewBox units (the viewBox is 600x600). About 13% of
// the side gives a comfortable hit-target on both desktop and mobile.
const SNAP_RADIUS = 80;

function nearestCompatibleAnchor(svgPt) {
  const state = store.current;
  if (!svgPt || insertion.mode !== 'firstPicked') return null;
  const first = insertion.firstAnchor;
  const anchors = computeAnchors(state).filter((a) => anchorIsCompatible(a, first));
  let best = null;
  let bestDist = Infinity;
  for (const a of anchors) {
    let cx, cy;
    if (a.dir === 'h') [cx, cy] = uxToSvg(state, a.mid, a.c);
    else [cx, cy] = uxToSvg(state, a.c, a.mid);
    const d = Math.hypot(svgPt[0] - cx, svgPt[1] - cy);
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return bestDist <= SNAP_RADIUS ? best : null;
}

function clampInt(v, lo, hi) {
  const n = Math.floor(Number(v));
  if (Number.isNaN(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function readConfigFromControls() {
  return {
    p: clampInt(inputP.value, 1, 5),
    q: clampInt(inputQ.value, 1, 5),
    Nx: clampInt(inputNx.value, 0, 20),
    Ny: clampInt(inputNy.value, 0, 20),
    openKnots: inputOpen.checked,
    domain: [0, 1, 0, 1],
  };
}

function writeConfigToControls() {
  inputP.value = store.initialConfig.p;
  inputQ.value = store.initialConfig.q;
  inputNx.value = store.initialConfig.Nx;
  inputNy.value = store.initialConfig.Ny;
  inputOpen.checked = store.initialConfig.openKnots;
}

function rebuildFromConfig() {
  store.current = createInitialState(store.initialConfig);
  store.undoStack = [];
  store.redoStack = [];
  store.selectedBSplineIndex = null;
  notifyChange();
}

function commitInsertion(meshline) {
  store.undoStack.push(cloneState(store.current));
  store.redoStack = [];
  const result = insertMeshLine(store.current, meshline);
  store.selectedBSplineIndex = null;
  notifyChange();
  return result;
}

function undo() {
  if (store.undoStack.length === 0) return;
  store.redoStack.push(cloneState(store.current));
  store.current = store.undoStack.pop();
  store.selectedBSplineIndex = null;
  notifyChange();
  setStatus('Undone.');
}

function redo() {
  if (store.redoStack.length === 0) return;
  store.undoStack.push(cloneState(store.current));
  store.current = store.redoStack.pop();
  store.selectedBSplineIndex = null;
  notifyChange();
  setStatus('Redone.');
}

function reset() {
  if (
    store.undoStack.length > 0 &&
    !window.confirm('Discard all refinements and reset to tensor product?')
  ) {
    return;
  }
  store.initialConfig = readConfigFromControls();
  rebuildFromConfig();
  setStatus('Reset to tensor product.');
}

function exportJSON() {
  const json = serialize(store.current);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lr-bspline-state.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setStatus('Exported state.');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const newState = deserialize(reader.result);
      store.undoStack.push(cloneState(store.current));
      store.redoStack = [];
      store.current = newState;
      const xBoundaryMult = newState.openKnots ? newState.p + 1 : 1;
      const yBoundaryMult = newState.openKnots ? newState.q + 1 : 1;
      const interiorX = newState.knotsX.length - 2 * xBoundaryMult;
      const interiorY = newState.knotsY.length - 2 * yBoundaryMult;
      store.initialConfig = {
        p: newState.p,
        q: newState.q,
        Nx: Math.max(0, interiorX),
        Ny: Math.max(0, interiorY),
        openKnots: newState.openKnots,
        domain: [...newState.domain],
      };
      writeConfigToControls();
      store.selectedBSplineIndex = null;
      notifyChange();
      setStatus('Imported state.');
    } catch (e) {
      setStatus('Import failed: ' + e.message, true);
    }
  };
  reader.readAsText(file);
}

function hasRefinement() {
  return store.undoStack.length > 0;
}

// --- UI sync ---------------------------------------------------------------
function notifyChange() {
  const s = store.current;
  bsplineCount.textContent = String(s.bsplines.length);
  statMeshlines.textContent = String(s.meshlines.length);
  statBsplines.textContent = String(s.bsplines.length);
  statRefinements.textContent = String(store.undoStack.length);
  btnUndo.disabled = store.undoStack.length === 0;
  btnRedo.disabled = store.redoStack.length === 0;
  const lock = hasRefinement();
  inputP.disabled = lock;
  inputQ.disabled = lock;
  inputNx.disabled = lock;
  inputNy.disabled = lock;
  inputOpen.disabled = lock;
  setMultiplicity(insertion.multiplicity);
  renderBSplineList();
  renderBoard();
}

function renderBSplineList() {
  const s = store.current;
  const indices = s.bsplines.map((_, i) => i);
  indices.sort((a, b) => {
    const A = s.bsplines[a];
    const B = s.bsplines[b];
    if (A.kx[0] !== B.kx[0]) return A.kx[0] - B.kx[0];
    if (A.ky[0] !== B.ky[0]) return A.ky[0] - B.ky[0];
    return 0;
  });
  const fmt = (kv) => '[' + kv.map((v) => v.toFixed(2)).join(', ') + ']';
  bsplineList.innerHTML = indices
    .map((i) => {
      const B = s.bsplines[i];
      const sel = i === store.selectedBSplineIndex ? ' selected' : '';
      return (
        `<li class="${sel}" data-index="${i}">` +
        `<span class="coeff">c=${B.coeff.toFixed(3)}</span>` +
        `<span class="kv">x: ${fmt(B.kx)}<br>y: ${fmt(B.ky)}</span>` +
        `</li>`
      );
    })
    .join('');
}

// --- SVG rendering (Phase 4) ----------------------------------------------
const SVG_NS = 'http://www.w3.org/2000/svg';
const VB = { x0: 40, y0: 40, w: 520, h: 520 };
const STROKE_BASE = 1.5;
const STROKE_STEP = 1.6;
const ANCHOR_RADIUS = 4.5;

function uxToSvg(state, u, v) {
  const [xmin, xmax, ymin, ymax] = state.domain;
  const sx = VB.x0 + ((u - xmin) / (xmax - xmin)) * VB.w;
  const sy = VB.y0 + ((ymax - v) / (ymax - ymin)) * VB.h;
  return [sx, sy];
}

function strokeWidthForMult(m) {
  return STROKE_BASE + Math.max(0, m - 1) * STROKE_STEP;
}

function svgEl(name, attrs = {}, content = null) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    el.setAttribute(k, v);
  }
  if (typeof content === 'string') {
    el.textContent = content;
  } else if (Array.isArray(content)) {
    for (const c of content) el.appendChild(c);
  }
  return el;
}

function renderBoard() {
  const state = store.current;
  while (board.firstChild) board.removeChild(board.firstChild);

  const [xmin, xmax, ymin, ymax] = state.domain;
  const [bx0, by0] = uxToSvg(state, xmin, ymax);
  const [bx1, by1] = uxToSvg(state, xmax, ymin);

  // Domain background
  board.appendChild(
    svgEl('rect', {
      class: 'domain-bg',
      x: bx0,
      y: by0,
      width: bx1 - bx0,
      height: by1 - by0,
      rx: 1,
    })
  );

  // Axis tick labels (distinct knot positions; multiplicity is encoded in
  // the mesh-line stroke thickness so we don't repeat it here).
  for (const v of distinct(state.knotsX)) {
    const [sx, sy] = uxToSvg(state, v, ymin);
    board.appendChild(
      svgEl(
        'text',
        {
          class: 'knot-tick',
          x: sx,
          y: sy + 16,
          'text-anchor': 'middle',
        },
        v.toFixed(2)
      )
    );
  }
  for (const v of distinct(state.knotsY)) {
    const [sx, sy] = uxToSvg(state, xmin, v);
    board.appendChild(
      svgEl(
        'text',
        {
          class: 'knot-tick',
          x: sx - 8,
          y: sy + 4,
          'text-anchor': 'end',
        },
        v.toFixed(2)
      )
    );
  }

  // Mesh-line segments
  for (const ml of state.meshlines) {
    let p0, p1;
    if (ml.dir === 'h') {
      p0 = uxToSvg(state, ml.a, ml.c);
      p1 = uxToSvg(state, ml.b, ml.c);
    } else {
      p0 = uxToSvg(state, ml.c, ml.a);
      p1 = uxToSvg(state, ml.c, ml.b);
    }
    const isBoundary =
      (ml.dir === 'h' && (approxEq(ml.c, ymin) || approxEq(ml.c, ymax))) ||
      (ml.dir === 'v' && (approxEq(ml.c, xmin) || approxEq(ml.c, xmax)));
    const line = svgEl('line', {
      class: 'mesh-line' + (isBoundary ? ' boundary' : ''),
      x1: p0[0],
      y1: p0[1],
      x2: p1[0],
      y2: p1[1],
      'stroke-width': strokeWidthForMult(ml.m),
      'stroke-linecap': 'butt',
    });
    const axis = ml.dir === 'h' ? 'y' : 'x';
    line.appendChild(
      svgEl(
        'title',
        {},
        `${axis} = ${ml.c.toFixed(3)}   m = ${ml.m}   extent = [${ml.a.toFixed(3)}, ${ml.b.toFixed(3)}]`
      )
    );
    board.appendChild(line);
  }

  // Insertion overlay (Phase 5): shaded supports + preview line, drawn
  // beneath the anchors so anchors stay clickable on top.
  let previewMl = null;
  let previewTargets = [];
  if (insertion.mode === 'firstPicked' && insertion.hotAnchor) {
    previewMl = meshlineFromAnchors(
      insertion.firstAnchor,
      insertion.hotAnchor,
      insertion.multiplicity
    );
    if (previewMl) {
      previewTargets = previewSplitTargets(state, previewMl);
      // Shade each would-be-split B-spline's support; alpha composes
      // additively so overlapping supports darken automatically.
      for (const B of previewTargets) {
        const [px0, py0] = uxToSvg(state, B.kx[0], B.ky[B.ky.length - 1]);
        const [px1, py1] = uxToSvg(state, B.kx[B.kx.length - 1], B.ky[0]);
        board.appendChild(
          svgEl('rect', {
            class: 'bspline-shade',
            x: Math.min(px0, px1),
            y: Math.min(py0, py1),
            width: Math.abs(px1 - px0),
            height: Math.abs(py1 - py0),
          })
        );
      }
      // Preview line.
      let pp0, pp1;
      if (previewMl.dir === 'h') {
        pp0 = uxToSvg(state, previewMl.a, previewMl.c);
        pp1 = uxToSvg(state, previewMl.b, previewMl.c);
      } else {
        pp0 = uxToSvg(state, previewMl.c, previewMl.a);
        pp1 = uxToSvg(state, previewMl.c, previewMl.b);
      }
      const cls =
        previewTargets.length === 0 ? 'preview-line warning' : 'preview-line valid';
      board.appendChild(
        svgEl('line', {
          class: cls,
          x1: pp0[0],
          y1: pp0[1],
          x2: pp1[0],
          y2: pp1[1],
        })
      );
    }
  }

  // Anchor circles, with state-dependent classes.
  const anchors = computeAnchors(state);
  for (const a of anchors) {
    let cx, cy;
    if (a.dir === 'h') [cx, cy] = uxToSvg(state, a.mid, a.c);
    else [cx, cy] = uxToSvg(state, a.c, a.mid);
    let extra = '';
    if (insertion.mode === 'firstPicked') {
      if (anchorEquals(a, insertion.firstAnchor)) extra = ' first-pick';
      else if (anchorIsCompatible(a, insertion.firstAnchor)) extra = ' compatible';
      if (anchorEquals(a, insertion.hotAnchor) && extra !== ' first-pick') {
        extra = ' hot';
      }
    }
    const c = svgEl('circle', {
      class: 'anchor' + extra,
      cx,
      cy,
      r: ANCHOR_RADIUS,
      'data-dir': a.dir,
      'data-c': a.c,
      'data-edgelo': a.edgeLo,
      'data-edgehi': a.edgeHi,
    });
    c.appendChild(
      svgEl(
        'title',
        {},
        `${a.dir === 'h' ? 'horizontal' : 'vertical'} edge midpoint`
      )
    );
    c.addEventListener('pointerdown', (e) => {
      if (e.button === 2) return; // right-click handled by contextmenu
      e.preventDefault();
      e.stopPropagation();
      onAnchorPointerDown(a, e);
    });
    board.appendChild(c);
  }
}

function onAnchorPointerDown(anchor, e) {
  drag.pointerDown = true;
  drag.startClientX = e.clientX;
  drag.startClientY = e.clientY;
  drag.moved = false;
  if (insertion.mode === 'idle') {
    startInsertion(anchor);
  } else {
    // Click-then-click flow: commit using this anchor as the second pick.
    tryCommitFromAnchors(anchor);
  }
}

function setStatus(msg, isError = false) {
  status.textContent = msg;
  status.style.color = isError ? '#dc2626' : '';
}

// --- Event wiring ----------------------------------------------------------
btnReset.addEventListener('click', reset);
btnUndo.addEventListener('click', undo);
btnRedo.addEventListener('click', redo);
btnExport.addEventListener('click', exportJSON);

inputImport.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importJSON(file);
  e.target.value = '';
});

const cfgInputs = [inputP, inputQ, inputNx, inputNy, inputOpen];
for (const el of cfgInputs) {
  el.addEventListener('change', () => {
    if (hasRefinement()) {
      writeConfigToControls();
      setStatus('Reset first to change p, q, Nx, or Ny.', true);
      return;
    }
    store.initialConfig = readConfigFromControls();
    rebuildFromConfig();
    setStatus('Rebuilt tensor product.');
  });
}

inputMult.addEventListener('change', () => {
  setMultiplicity(Number(inputMult.value));
  if (insertion.mode === 'firstPicked') renderBoard();
});

// Pointer move on the board updates the preview and the floating
// multiplicity badge while in firstPicked mode. Also tracks drag distance
// so a press-and-drag insertion can be committed on pointerup.
board.addEventListener('pointermove', (e) => {
  if (insertion.mode !== 'firstPicked') return;
  positionFloatingMult(e.clientX, e.clientY);
  if (drag.pointerDown) {
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) drag.moved = true;
  }
  const svgPt = svgPointFromEvent(e);
  const candidate = nearestCompatibleAnchor(svgPt);
  if (!anchorEquals(candidate, insertion.hotAnchor)) {
    insertion.hotAnchor = candidate;
    renderBoard();
  }
});

// Click on empty canvas (outside any anchor) cancels.
board.addEventListener('pointerdown', (e) => {
  if (e.button === 2) return;
  if (insertion.mode === 'firstPicked') {
    cancelInsertion('Insertion cancelled.');
  }
});

// Pointerup on the document so we can recover even if the user drags off
// the board. If a real drag happened, commit using the snapped hot anchor.
document.addEventListener('pointerup', () => {
  const wasDrag = drag.pointerDown && drag.moved;
  drag.pointerDown = false;
  drag.moved = false;
  if (!wasDrag || insertion.mode !== 'firstPicked') return;
  if (insertion.hotAnchor && !anchorEquals(insertion.hotAnchor, insertion.firstAnchor)) {
    tryCommitFromAnchors(insertion.hotAnchor);
  }
  // Otherwise the drag dissolved without a snap; stay in firstPicked so the
  // user can try again or press Esc.
});

// Right-click cancels.
board.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (insertion.mode === 'firstPicked') cancelInsertion('Insertion cancelled.');
});

// Wheel adjusts multiplicity while in firstPicked mode.
board.addEventListener(
  'wheel',
  (e) => {
    if (insertion.mode !== 'firstPicked') return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    setMultiplicity(insertion.multiplicity + delta);
    renderBoard();
  },
  { passive: false }
);

window.addEventListener('keydown', (e) => {
  const ctrl = e.ctrlKey || e.metaKey;
  if (e.key === 'Escape' && insertion.mode === 'firstPicked') {
    e.preventDefault();
    cancelInsertion('Insertion cancelled.');
    return;
  }
  if (ctrl && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
  } else if (ctrl && (e.key === 'y' || e.key === 'Y')) {
    e.preventDefault();
    redo();
  }
});

window.addEventListener('resize', () => {
  if (insertion.mode === 'firstPicked') positionFloatingMult();
});

// Expose a small dev API for manual smoke-testing of Phase 3 from the console
// before the real insertion UX lands in Phase 5.
window.lrDev = {
  store,
  commitInsertion,
  reset,
  undo,
  redo,
};

// --- Init ------------------------------------------------------------------
writeConfigToControls();
rebuildFromConfig();
setMultiplicity(1);
setStatus('Ready.');
