// LR B-spline Refinement — interactive game.
//
// Implements the LR-mesh + LR B-spline data model from
// Dokken, Lyche & Pettersen, "Polynomial splines over locally refined
// box-partitions", CAGD 2013, on top of the math module in lr-math.js.
//
// Layout:
//   * a store with current state + undo / redo stacks,
//   * an SVG renderer that paints the mesh-lines, anchors, B-spline
//     support overlays, and the in-flight insertion preview,
//   * an insertion state machine driving two interaction styles:
//       click-then-click, and press-and-drag (with snap-to-anchor),
//   * a basis-function list with two-way hover sync to the canvas
//     and a 2D-contour / 3D-wireframe inset preview,
//   * keyboard, mouse-wheel and touch handlers.

import {
  approxEq,
  cloneState,
  computeAnchors,
  createInitialState,
  deserialize,
  distinct,
  evalBSpline2D,
  insertMeshLine,
  meshlineFromAnchors,
  previewSplitTargets,
  serialize,
} from './lr-math.js';
import {
  expandPolynomialInBasis,
  grevillePoint,
  renderDualPolyHTML,
} from './marsden.js';

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
const btnMarsdenTest = document.getElementById('marsden-test-btn');
const marsdenTestResult = document.getElementById('marsden-test-result');

const bsplineList = document.getElementById('bspline-list');
const bsplineCount = document.getElementById('bspline-count');
const statMeshlines = document.getElementById('stat-meshlines');
const statBsplines = document.getElementById('stat-bsplines');
const statRefinements = document.getElementById('stat-refinements');

const inset = document.getElementById('inset');
const insetCtx = inset.getContext('2d');
const insetToggle = document.getElementById('inset-toggle');
const insetLabelEl = document.getElementById('inset-label');

// --- Store -----------------------------------------------------------------
const store = {
  initialConfig: {
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  },
  current: null,
  undoStack: [],
  redoStack: [],
  selectedBSplineIndex: null,
  hoveredBSplineIndex: null,
  insetMode: 'contour', // 'contour' | 'wireframe'
};

// --- Insertion state machine ----------------------------------------------
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

// Long-press detection for mobile/touch — promotes the B-spline under the
// finger to selected and reveals the basis-functions preview, mirroring the
// desktop double-click gesture.
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_PX = 10;
const longPress = {
  timerId: null,
  startClientX: 0,
  startClientY: 0,
};

function cancelLongPress() {
  if (longPress.timerId !== null) {
    clearTimeout(longPress.timerId);
    longPress.timerId = null;
  }
}

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
    a.kind === b.kind &&
    a.dir === b.dir &&
    approxEq(a.c, b.c) &&
    approxEq(a.edgeLo, b.edgeLo) &&
    approxEq(a.edgeHi, b.edgeHi)
  );
}

function anchorIsCompatible(a, first) {
  // Same direction: either on the same host line (same c) or aligned at the
  // same perpendicular-axis coord (same mid) for a new perpendicular line.
  if (a.dir === first.dir) {
    return approxEq(a.c, first.c) || approxEq(a.mid, first.mid);
  }
  // Cross direction: a sits on the perpendicular line a1 would induce; this
  // lets the drag snap to endpoints of perpendicular mesh-lines (T-junctions)
  // as well as edge midpoints of perpendicular lines.
  return approxEq(a.c, first.mid);
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
    `Picked anchor. Choose a second anchor on the same mesh-line to raise its multiplicity, ` +
      `or one aligned at this position (including a T-junction endpoint) ` +
      `to insert a new ${newPerp} mesh-line. Hold-and-drag also works; Esc cancels.`
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

function clearSelectionAndHover() {
  store.selectedBSplineIndex = null;
  store.hoveredBSplineIndex = null;
}

function commitInsertion(meshline) {
  store.undoStack.push(cloneState(store.current));
  store.redoStack = [];
  const result = insertMeshLine(store.current, meshline);
  clearSelectionAndHover();
  notifyChange();
  return result;
}

function undo() {
  if (store.undoStack.length === 0) return;
  store.redoStack.push(cloneState(store.current));
  store.current = store.undoStack.pop();
  clearSelectionAndHover();
  notifyChange();
  setStatus('Undone.');
}

function redo() {
  if (store.redoStack.length === 0) return;
  store.undoStack.push(cloneState(store.current));
  store.current = store.redoStack.pop();
  clearSelectionAndHover();
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
  renderInset();
  // Any state change invalidates a previous Marsden reproduction result.
  if (marsdenTestResult) {
    marsdenTestResult.textContent = '';
    marsdenTestResult.className = 'note';
  }
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
      const cls = [];
      if (i === store.selectedBSplineIndex) cls.push('selected');
      if (i === store.hoveredBSplineIndex) cls.push('hover');
      const dualHTML = B.dualPoly ? renderDualPolyHTML(B.dualPoly) : '';
      const factored =
        B.dualPoly && B.dualPoly.terms && B.dualPoly.terms.length <= 1;
      return (
        `<li class="${cls.join(' ')}" data-index="${i}">` +
        `<span class="coeff">c=${B.coeff.toFixed(3)}</span>` +
        `<span class="kv">x: ${fmt(B.kx)}<br>y: ${fmt(B.ky)}</span>` +
        (dualHTML
          ? `<span class="dual${factored ? '' : ' nonfactored'}">p(y) = ${dualHTML}</span>`
          : '') +
        `</li>`
      );
    })
    .join('');
  // Wire click + hover handlers on each entry.
  for (const li of bsplineList.querySelectorAll('li')) {
    const idx = Number(li.dataset.index);
    li.addEventListener('click', () => {
      store.selectedBSplineIndex =
        store.selectedBSplineIndex === idx ? null : idx;
      renderBSplineList();
      renderBoard();
      renderInset();
    });
    li.addEventListener('mouseenter', () => {
      store.hoveredBSplineIndex = idx;
      renderBoard();
    });
    li.addEventListener('mouseleave', () => {
      if (store.hoveredBSplineIndex === idx) {
        store.hoveredBSplineIndex = null;
        renderBoard();
      }
    });
  }
}

// --- SVG rendering --------------------------------------------------------
const SVG_NS = 'http://www.w3.org/2000/svg';
const VB = { x0: 40, y0: 40, w: 520, h: 520 };
const STROKE_BASE = 1.5;
const STROKE_STEP = 1.6;
const ANCHOR_RADIUS = 4.5;
// Larger transparent hit-target — keeps anchors clickable even when the
// underlying mesh-line stroke is wider than the marker itself, which happens
// on boundary lines under open knot vectors (multiplicity p+1, q+1). Sized
// to stay below the minimum anchor spacing at the maximum supported
// Nx/Ny=20 (≈25 SVG units between adjacent edge midpoints).
const ANCHOR_HIT_RADIUS = 10;

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

  // Highlight overlays for the selected (solid blue outline) and hovered
  // (lighter shade) B-splines from the basis list.
  const drawSupport = (idx, cls) => {
    if (idx === null || idx === undefined) return;
    const B = state.bsplines[idx];
    if (!B) return;
    const [px0, py0] = uxToSvg(state, B.kx[0], B.ky[B.ky.length - 1]);
    const [px1, py1] = uxToSvg(state, B.kx[B.kx.length - 1], B.ky[0]);
    board.appendChild(
      svgEl('rect', {
        class: cls,
        x: Math.min(px0, px1),
        y: Math.min(py0, py1),
        width: Math.abs(px1 - px0),
        height: Math.abs(py1 - py0),
      })
    );
  };
  if (
    store.hoveredBSplineIndex !== null &&
    store.hoveredBSplineIndex !== store.selectedBSplineIndex
  ) {
    drawSupport(store.hoveredBSplineIndex, 'bspline-shade');
  }
  drawSupport(store.selectedBSplineIndex, 'bspline-highlight');

  // Anchor markers, with state-dependent classes. Midpoint anchors are
  // circles; T-junction anchors are squares so the user can tell them apart.
  // Hit-targets are rendered in a first pass and markers in a second pass so
  // visible markers are always on top of every transparent hit-target.
  const anchors = computeAnchors(state);
  const anchorViews = anchors.map((a) => {
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
    return { a, cx, cy, extra };
  });
  const onPointerDownFor = (a) => (e) => {
    if (e.button === 2) return; // right-click handled by contextmenu
    e.preventDefault();
    e.stopPropagation();
    onAnchorPointerDown(a, e);
  };
  // Pass 1: oversized transparent hit-targets so anchors stay clickable on
  // top of high-multiplicity boundary lines whose stroke can crowd the
  // visible marker.
  for (const v of anchorViews) {
    const hit = svgEl('circle', {
      class: 'anchor-hit',
      cx: v.cx,
      cy: v.cy,
      r: ANCHOR_HIT_RADIUS,
    });
    hit.addEventListener('pointerdown', onPointerDownFor(v.a));
    board.appendChild(hit);
  }
  // Pass 2: visible markers on top.
  for (const v of anchorViews) {
    const a = v.a;
    const isTJ = a.kind === 'tjunction';
    const titleText = isTJ
      ? `${a.dir === 'h' ? 'horizontal' : 'vertical'} mesh-line endpoint (T-junction)`
      : `${a.dir === 'h' ? 'horizontal' : 'vertical'} edge midpoint`;
    let marker;
    if (isTJ) {
      const s = ANCHOR_RADIUS * 1.7;
      marker = svgEl('rect', {
        class: 'anchor tjunction' + v.extra,
        x: v.cx - s / 2,
        y: v.cy - s / 2,
        width: s,
        height: s,
        'data-dir': a.dir,
        'data-c': a.c,
        'data-edgelo': a.edgeLo,
        'data-edgehi': a.edgeHi,
      });
    } else {
      marker = svgEl('circle', {
        class: 'anchor' + v.extra,
        cx: v.cx,
        cy: v.cy,
        r: ANCHOR_RADIUS,
        'data-dir': a.dir,
        'data-c': a.c,
        'data-edgelo': a.edgeLo,
        'data-edgehi': a.edgeHi,
      });
    }
    marker.appendChild(svgEl('title', {}, titleText));
    marker.addEventListener('pointerdown', onPointerDownFor(a));
    board.appendChild(marker);
  }

  // Dual points of the hovered / selected B-spline. Drawn last so they sit on
  // top of every other layer. Only meaningful when the dual polynomial is a
  // single product term: those roots are the "dual points" of that B-spline,
  // x-direction roots projected onto the x-axis and y-direction roots onto
  // the y-axis. Non-factored polynomials (sums of products) have no clean
  // dual points and are skipped — the basis-functions panel shows the full
  // sum in that case.
  const drawDualPoints = (idx, extra) => {
    if (idx === null || idx === undefined) return;
    const B = state.bsplines[idx];
    if (!B || !B.dualPoly || B.dualPoly.terms.length !== 1) return;
    const term = B.dualPoly.terms[0];
    const cls = 'dual-point' + (extra ? ' ' + extra : '');
    for (const r of term.xRoots) {
      const [sx] = uxToSvg(state, r, ymin);
      const dot = svgEl('circle', {
        class: cls,
        cx: sx,
        cy: by1,
        r: 4.5,
      });
      dot.appendChild(svgEl('title', {}, `dual point  y₁ = ${r.toFixed(3)}`));
      board.appendChild(dot);
    }
    for (const r of term.yRoots) {
      const [, sy] = uxToSvg(state, xmin, r);
      const dot = svgEl('circle', {
        class: cls,
        cx: bx0,
        cy: sy,
        r: 4.5,
      });
      dot.appendChild(svgEl('title', {}, `dual point  y₂ = ${r.toFixed(3)}`));
      board.appendChild(dot);
    }
  };
  if (
    store.hoveredBSplineIndex !== null &&
    store.hoveredBSplineIndex !== store.selectedBSplineIndex
  ) {
    drawDualPoints(store.hoveredBSplineIndex, 'hover');
  }
  drawDualPoints(store.selectedBSplineIndex, 'selected');

  // Greville point of the highlighted / hovered B-spline. Drawn as an "×"
  // cross over a thicker bg-coloured halo so it stays visible even when it
  // coincides with one of the dual points (filled circles, drawn just below).
  const drawGreville = (idx, extra) => {
    if (idx === null || idx === undefined) return;
    const B = state.bsplines[idx];
    if (!B) return;
    const g = grevillePoint(B, state.p, state.q);
    if (!g) return;
    const [cx, cy] = uxToSvg(state, g[0], g[1]);
    const r = 6.5;
    const d = `M ${cx - r} ${cy - r} L ${cx + r} ${cy + r} M ${cx + r} ${cy - r} L ${cx - r} ${cy + r}`;
    const halo = svgEl('path', { class: 'greville-halo' + (extra ? ' ' + extra : ''), d });
    const cross = svgEl('path', { class: 'greville-cross' + (extra ? ' ' + extra : ''), d });
    cross.appendChild(
      svgEl('title', {}, `Greville point  (${g[0].toFixed(3)}, ${g[1].toFixed(3)})`)
    );
    board.appendChild(halo);
    board.appendChild(cross);
  };
  if (
    store.hoveredBSplineIndex !== null &&
    store.hoveredBSplineIndex !== store.selectedBSplineIndex
  ) {
    drawGreville(store.hoveredBSplineIndex, 'hover');
  }
  drawGreville(store.selectedBSplineIndex, 'selected');
}

// --- Hover detection on the main canvas -----------------------------------
function svgPointToUserCoords(svgPt) {
  const state = store.current;
  if (!svgPt || !state) return null;
  const [xmin, xmax, ymin, ymax] = state.domain;
  const u = xmin + ((svgPt[0] - VB.x0) / VB.w) * (xmax - xmin);
  const v = ymax - ((svgPt[1] - VB.y0) / VB.h) * (ymax - ymin);
  return [u, v];
}

// Returns the index of the active B-spline whose Greville point — the mean
// of its dual points — is closest to (u, v). Greville is a natural "centre"
// for the B-spline (and in the factored case literally the mean of dual
// points), so this picks the B-spline whose centre the cursor is nearest to,
// regardless of overlapping supports.
function bsplineUnderPoint(state, u, v) {
  let bestIdx = null;
  let bestDist = Infinity;
  for (let i = 0; i < state.bsplines.length; i++) {
    const g = grevillePoint(state.bsplines[i], state.p, state.q);
    if (!g) continue;
    const d = Math.hypot(u - g[0], v - g[1]);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function setHoveredBSpline(idx) {
  if (idx === store.hoveredBSplineIndex) return;
  store.hoveredBSplineIndex = idx;
  renderBSplineList();
  renderBoard();
  // Scroll only the inner basis-list to the hovered entry. Avoids pulling
  // the whole page (and the canvas) out from under the user — particularly
  // problematic on mobile where the sidebar sits below the canvas.
  if (idx !== null) scrollListItemIntoView(idx);
}

// Scroll only the bspline-list element to bring `idx` into view. Unlike
// Element.scrollIntoView(), this never bubbles up to scroll outer ancestors,
// so it does not move the page on mobile/single-column layouts.
function scrollListItemIntoView(idx) {
  const target = bsplineList.querySelector(`li[data-index="${idx}"]`);
  if (!target) return;
  const listRect = bsplineList.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (targetRect.top < listRect.top) {
    bsplineList.scrollTop -= listRect.top - targetRect.top;
  } else if (targetRect.bottom > listRect.bottom) {
    bsplineList.scrollTop += targetRect.bottom - listRect.bottom;
  }
}

// Scroll the page so the basis-functions inset preview is comfortably in view.
// Triggered on desktop double-click and mobile long-press inside a B-spline's
// support — both explicit "show me this B-spline" gestures, distinct from
// the passive hover/tap that just highlights it on the canvas.
function scrollToInsetPreview() {
  inset.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// --- Inset rendering ------------------------------------------------------
function viridisRGB(t) {
  const stops = [
    [0.0, 68, 1, 84],
    [0.25, 59, 82, 139],
    [0.5, 33, 144, 141],
    [0.75, 93, 201, 99],
    [1.0, 253, 231, 37],
  ];
  const tt = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    const [t1, r1, g1, b1] = stops[i];
    const [t0, r0, g0, b0] = stops[i - 1];
    if (tt <= t1) {
      const f = (tt - t0) / (t1 - t0);
      return [
        Math.round(r0 + (r1 - r0) * f),
        Math.round(g0 + (g1 - g0) * f),
        Math.round(b0 + (b1 - b0) * f),
      ];
    }
  }
  return [253, 231, 37];
}

function sampleBSplineGrid(B, N) {
  const x0 = B.kx[0];
  const x1 = B.kx[B.kx.length - 1];
  const y0 = B.ky[0];
  const y1 = B.ky[B.ky.length - 1];
  const grid = new Float32Array(N * N);
  let maxV = 0;
  for (let j = 0; j < N; j++) {
    const v = y0 + ((y1 - y0) * j) / (N - 1);
    for (let i = 0; i < N; i++) {
      const u = x0 + ((x1 - x0) * i) / (N - 1);
      const val = evalBSpline2D(B, u, v);
      grid[j * N + i] = val;
      if (val > maxV) maxV = val;
    }
  }
  return { grid, maxV: maxV || 1 };
}

function renderContour(B) {
  const W = inset.width;
  const H = inset.height;
  const N = 80;
  const { grid, maxV } = sampleBSplineGrid(B, N);
  const img = insetCtx.createImageData(W, H);
  for (let py = 0; py < H; py++) {
    const gj = ((H - 1 - py) / (H - 1)) * (N - 1);
    const j0 = Math.floor(gj);
    const j1 = Math.min(N - 1, j0 + 1);
    const fj = gj - j0;
    for (let px = 0; px < W; px++) {
      const gi = (px / (W - 1)) * (N - 1);
      const i0 = Math.floor(gi);
      const i1 = Math.min(N - 1, i0 + 1);
      const fi = gi - i0;
      const v00 = grid[j0 * N + i0];
      const v01 = grid[j0 * N + i1];
      const v10 = grid[j1 * N + i0];
      const v11 = grid[j1 * N + i1];
      const v =
        (1 - fi) * (1 - fj) * v00 +
        fi * (1 - fj) * v01 +
        (1 - fi) * fj * v10 +
        fi * fj * v11;
      const [r, g, b] = viridisRGB(v / maxV);
      const idx = (py * W + px) * 4;
      img.data[idx] = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b;
      img.data[idx + 3] = 255;
    }
  }
  insetCtx.putImageData(img, 0, 0);
  // Faint isolines at 0.25, 0.5, 0.75 of max via marching squares (cheap version).
  insetCtx.strokeStyle = 'rgba(255,255,255,0.4)';
  insetCtx.lineWidth = 1;
  for (const level of [0.25, 0.5, 0.75]) {
    drawIsoline(grid, N, W, H, level * maxV);
  }
  // Border.
  insetCtx.strokeStyle = 'rgba(255,255,255,0.25)';
  insetCtx.lineWidth = 1;
  insetCtx.strokeRect(0.5, 0.5, W - 1, H - 1);
}

function drawIsoline(grid, N, W, H, level) {
  // Marching squares — line segments per cell.
  const toCanvas = (gi, gj) => {
    const px = (gi / (N - 1)) * (W - 1);
    const py = (1 - gj / (N - 1)) * (H - 1);
    return [px, py];
  };
  const interp = (a, b, va, vb) => (level - va) / (vb - va);
  insetCtx.beginPath();
  for (let j = 0; j < N - 1; j++) {
    for (let i = 0; i < N - 1; i++) {
      const v00 = grid[j * N + i];
      const v10 = grid[j * N + i + 1];
      const v01 = grid[(j + 1) * N + i];
      const v11 = grid[(j + 1) * N + i + 1];
      const code =
        (v00 > level ? 1 : 0) |
        (v10 > level ? 2 : 0) |
        (v11 > level ? 4 : 0) |
        (v01 > level ? 8 : 0);
      if (code === 0 || code === 15) continue;
      // Edge midpoints
      const eBot = () => toCanvas(i + interp(0, 1, v00, v10), j);
      const eRight = () => toCanvas(i + 1, j + interp(0, 1, v10, v11));
      const eTop = () => toCanvas(i + interp(0, 1, v01, v11), j + 1);
      const eLeft = () => toCanvas(i, j + interp(0, 1, v00, v01));
      const segs = {
        1: [eLeft(), eBot()],
        2: [eBot(), eRight()],
        3: [eLeft(), eRight()],
        4: [eTop(), eRight()],
        5: [eLeft(), eTop(), eBot(), eRight()],
        6: [eBot(), eTop()],
        7: [eLeft(), eTop()],
        8: [eLeft(), eTop()],
        9: [eBot(), eTop()],
        10: [eLeft(), eBot(), eTop(), eRight()],
        11: [eTop(), eRight()],
        12: [eLeft(), eRight()],
        13: [eBot(), eRight()],
        14: [eLeft(), eBot()],
      }[code];
      for (let k = 0; k < segs.length; k += 2) {
        insetCtx.moveTo(segs[k][0], segs[k][1]);
        insetCtx.lineTo(segs[k + 1][0], segs[k + 1][1]);
      }
    }
  }
  insetCtx.stroke();
}

function renderWireframe(B) {
  const W = inset.width;
  const H = inset.height;
  const M = 28;
  const { grid, maxV } = sampleBSplineGrid(B, M);
  const margin = 14;
  const drawW = W - 2 * margin;
  const drawH = H - 2 * margin;
  const project = (i, j) => {
    const u = i / (M - 1);
    const v = j / (M - 1);
    const z = grid[j * M + i] / maxV;
    const cx = u * 0.7 + v * 0.25 + 0.05;
    const cy = 1 - z * 0.7 - v * 0.25;
    return [margin + cx * drawW, margin + cy * drawH];
  };
  // Floor box outline (z=0).
  insetCtx.strokeStyle = 'rgba(255,255,255,0.18)';
  insetCtx.lineWidth = 1;
  insetCtx.beginPath();
  const corners = [
    [0, 0], [M - 1, 0], [M - 1, M - 1], [0, M - 1], [0, 0],
  ];
  for (let k = 0; k < corners.length; k++) {
    const [i, j] = corners[k];
    // Project floor corner with z=0 (override grid value temporarily).
    const u = i / (M - 1);
    const v = j / (M - 1);
    const cx = u * 0.7 + v * 0.25 + 0.05;
    const cy = 1 - 0 - v * 0.25;
    const px = margin + cx * drawW;
    const py = margin + cy * drawH;
    if (k === 0) insetCtx.moveTo(px, py);
    else insetCtx.lineTo(px, py);
  }
  insetCtx.stroke();
  // Wireframe surface, painter's algorithm: back-to-front (high j first).
  insetCtx.strokeStyle = 'rgba(96, 165, 250, 0.75)';
  insetCtx.lineWidth = 0.9;
  for (let j = M - 1; j >= 0; j--) {
    insetCtx.beginPath();
    for (let i = 0; i < M; i++) {
      const [px, py] = project(i, j);
      if (i === 0) insetCtx.moveTo(px, py);
      else insetCtx.lineTo(px, py);
    }
    insetCtx.stroke();
  }
  for (let i = 0; i < M; i++) {
    insetCtx.beginPath();
    for (let j = 0; j < M; j++) {
      const [px, py] = project(i, j);
      if (j === 0) insetCtx.moveTo(px, py);
      else insetCtx.lineTo(px, py);
    }
    insetCtx.stroke();
  }
}

function renderInset() {
  const W = inset.width;
  const H = inset.height;
  insetCtx.fillStyle = '#0b0d12';
  insetCtx.fillRect(0, 0, W, H);
  const idx = store.selectedBSplineIndex;
  const B = idx !== null && idx !== undefined ? store.current.bsplines[idx] : null;
  if (!B) {
    insetLabelEl.textContent = '—';
    insetCtx.fillStyle = 'rgba(255,255,255,0.45)';
    insetCtx.font = '11px system-ui, sans-serif';
    insetCtx.textAlign = 'center';
    insetCtx.textBaseline = 'middle';
    insetCtx.fillText('Click a B-spline to preview', W / 2, H / 2);
    return;
  }
  insetLabelEl.textContent = `B[${idx}]   c=${B.coeff.toFixed(3)}`;
  if (store.insetMode === 'contour') renderContour(B);
  else renderWireframe(B);
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

// Verify the precomputed Marsden identity numerically: for every monomial
// x1^a x2^b with a ≤ p, b ≤ q, expand it in the current B-spline basis
// using each B-spline's stored dual polynomial, evaluate the resulting
// linear combination on a sample grid, and report the worst-case error
// against the analytic monomial value.
function runMarsdenReproductionTest() {
  const state = store.current;
  const { p, q, domain } = state;
  const [xmin, xmax, ymin, ymax] = domain;
  const xs = [];
  const ys = [];
  for (let i = 1; i <= 5; i++) {
    xs.push(xmin + ((xmax - xmin) * i) / 6);
    ys.push(ymin + ((ymax - ymin) * i) / 6);
  }
  let maxErr = 0;
  let worst = null;
  let worstMono = null;
  let totalChecks = 0;
  for (let a = 0; a <= p; a++) {
    for (let b = 0; b <= q; b++) {
      const fMatrix = [];
      for (let i = 0; i <= p; i++) fMatrix.push(new Array(q + 1).fill(0));
      fMatrix[a][b] = 1;
      const alphas = expandPolynomialInBasis(state, fMatrix);
      for (const x1 of xs) {
        for (const x2 of ys) {
          let sum = 0;
          for (let i = 0; i < state.bsplines.length; i++) {
            sum += alphas[i] * evalBSpline2D(state.bsplines[i], x1, x2);
          }
          const expected = Math.pow(x1, a) * Math.pow(x2, b);
          const err = Math.abs(sum - expected);
          totalChecks += 1;
          if (err > maxErr) {
            maxErr = err;
            worst = { x1, x2, sum, expected };
            worstMono = { a, b };
          }
        }
      }
    }
  }
  return { maxErr, worst, worstMono, totalChecks };
}

function showMarsdenResult() {
  const r = runMarsdenReproductionTest();
  const tol = 1e-6;
  const ok = r.maxErr < tol;
  const numMonomials = (store.current.p + 1) * (store.current.q + 1);
  if (ok) {
    marsdenTestResult.className = 'note passed';
    marsdenTestResult.textContent =
      `passed: ${numMonomials} monomials × ${r.totalChecks / numMonomials} sample points, ` +
      `max error ${r.maxErr.toExponential(2)}`;
  } else {
    marsdenTestResult.className = 'note failed';
    const m = r.worstMono;
    const w = r.worst;
    marsdenTestResult.textContent =
      `FAILED at x₁^${m.a} x₂^${m.b}, ` +
      `(${w.x1.toFixed(2)}, ${w.x2.toFixed(2)}): ` +
      `got ${w.sum.toFixed(6)}, expected ${w.expected.toFixed(6)}, ` +
      `max error ${r.maxErr.toExponential(2)}`;
  }
}

// --- Event wiring ----------------------------------------------------------
btnReset.addEventListener('click', reset);
btnUndo.addEventListener('click', undo);
btnRedo.addEventListener('click', redo);
btnExport.addEventListener('click', exportJSON);
btnMarsdenTest.addEventListener('click', showMarsdenResult);

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
// so a press-and-drag insertion can be committed on pointerup. In idle
// mode it does B-spline hover detection (smallest-containing-support wins)
// for two-way list↔canvas sync.
board.addEventListener('pointermove', (e) => {
  if (longPress.timerId !== null) {
    const dx = e.clientX - longPress.startClientX;
    const dy = e.clientY - longPress.startClientY;
    if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_PX) cancelLongPress();
  }
  if (insertion.mode === 'firstPicked') {
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
    return;
  }
  // idle mode: hover detection.
  const svgPt = svgPointFromEvent(e);
  const userPt = svgPointToUserCoords(svgPt);
  if (!userPt) return;
  const state = store.current;
  const [xmin, xmax, ymin, ymax] = state.domain;
  const [u, v] = userPt;
  if (u < xmin || u > xmax || v < ymin || v > ymax) {
    setHoveredBSpline(null);
    return;
  }
  setHoveredBSpline(bsplineUnderPoint(state, u, v));
});

// Clear hover when pointer leaves the board.
board.addEventListener('pointerleave', () => {
  if (insertion.mode !== 'firstPicked') setHoveredBSpline(null);
});

// Click on empty canvas (outside any anchor) cancels insertion. Also arms
// a long-press timer for touch input, which — when held still inside a
// B-spline's support — promotes that B-spline to selected and scrolls the
// preview into view (the touch counterpart of desktop's double-click).
board.addEventListener('pointerdown', (e) => {
  if (e.button === 2) return;
  if (insertion.mode === 'firstPicked') {
    cancelInsertion('Insertion cancelled.');
    return;
  }
  if (e.pointerType !== 'mouse') {
    cancelLongPress();
    longPress.startClientX = e.clientX;
    longPress.startClientY = e.clientY;
    const evt = e;
    longPress.timerId = setTimeout(() => {
      longPress.timerId = null;
      selectBSplineAndShowPreview(evt);
    }, LONG_PRESS_MS);
  }
});

function selectBSplineAndShowPreview(e) {
  const svgPt = svgPointFromEvent(e);
  const userPt = svgPointToUserCoords(svgPt);
  if (!userPt) return;
  const state = store.current;
  const [xmin, xmax, ymin, ymax] = state.domain;
  const [u, v] = userPt;
  if (u < xmin || u > xmax || v < ymin || v > ymax) return;
  const idx = bsplineUnderPoint(state, u, v);
  if (idx === null) return;
  store.selectedBSplineIndex = idx;
  renderBSplineList();
  renderBoard();
  renderInset();
  scrollToInsetPreview();
}

// Pointerup on the document so we can recover even if the user drags off
// the board. If a real drag happened, commit using the snapped hot anchor.
document.addEventListener('pointerup', () => {
  cancelLongPress();
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

document.addEventListener('pointercancel', cancelLongPress);

// Desktop double-click on a B-spline support: promote that B-spline to
// selected and scroll to the basis-functions preview. Mirrors the long-press
// gesture on touch devices.
board.addEventListener('dblclick', (e) => {
  if (insertion.mode === 'firstPicked') return;
  selectBSplineAndShowPreview(e);
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

insetToggle.addEventListener('click', () => {
  store.insetMode = store.insetMode === 'contour' ? 'wireframe' : 'contour';
  insetToggle.textContent =
    store.insetMode === 'contour' ? '2D contour' : '3D wireframe';
  insetToggle.dataset.mode = store.insetMode;
  renderInset();
});

// --- Init ------------------------------------------------------------------
writeConfigToControls();
rebuildFromConfig();
setMultiplicity(1);
setStatus('Ready.');
