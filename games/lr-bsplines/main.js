// Phase 3 — state management. Renderer and interactive insertion UX
// land in Phases 4 and 5; until then the SVG shows a minimal placeholder.

import {
  createInitialState,
  insertMeshLine,
  cloneState,
  serialize,
  deserialize,
} from './lr-math.js';

// --- DOM references --------------------------------------------------------
const board = document.getElementById('board');
const status = document.getElementById('status');

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
  renderBSplineList();
  renderPlaceholder();
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

function renderPlaceholder() {
  const s = store.current;
  board.innerHTML =
    `<rect class="domain-bg" x="40" y="40" width="520" height="520" />` +
    `<text x="300" y="290" text-anchor="middle" dominant-baseline="middle" ` +
    `      fill="currentColor" font-size="14" opacity="0.55">` +
    `${s.bsplines.length} active B-splines` +
    `</text>` +
    `<text x="300" y="310" text-anchor="middle" dominant-baseline="middle" ` +
    `      fill="currentColor" font-size="11" opacity="0.35">` +
    `(mesh renderer arrives in Phase 4)` +
    `</text>`;
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
  const v = clampInt(inputMult.value, 1, Math.max(store.current.p, store.current.q) + 1);
  inputMult.value = v;
});

window.addEventListener('keydown', (e) => {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
  } else if (ctrl && (e.key === 'y' || e.key === 'Y')) {
    e.preventDefault();
    redo();
  }
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
setStatus('Ready.');
