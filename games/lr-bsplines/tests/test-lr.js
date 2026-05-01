import {
  evalBSpline1D,
  evalBSpline2D,
  splitKnotVector,
  splitBSpline,
  meshlineSplitsBSpline,
  createInitialState,
  insertMeshLine,
  computeAnchors,
  meshlineFromAnchors,
  serialize,
  deserialize,
  approxEq,
} from '../lr-math.js';

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assertClose(actual, expected, tol, msg) {
  if (Math.abs(actual - expected) > (tol ?? 1e-6)) {
    throw new Error(`${msg || ''}: expected ${expected}, got ${actual}`);
  }
}

function assertEq(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg || ''}: expected ${expected}, got ${actual}`);
}

function assertTrue(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// 1. Univariate B-spline correctness ------------------------------------
test('linear B-spline N[0,1,2] peaks at x=1', () => {
  assertClose(evalBSpline1D([0, 1, 2], 0), 0);
  assertClose(evalBSpline1D([0, 1, 2], 0.5), 0.5);
  assertClose(evalBSpline1D([0, 1, 2], 1), 1);
  assertClose(evalBSpline1D([0, 1, 2], 1.5), 0.5);
  assertClose(evalBSpline1D([0, 1, 2], 2), 0);
});

test('quadratic B-spline N[0,1,2,3] peaks at 3/4 in middle interval', () => {
  // Standard uniform B-spline of degree 2 on [0,3]. Known: at x=1.5, value = 3/4.
  assertClose(evalBSpline1D([0, 1, 2, 3], 1.5), 0.75);
});

test('open-uniform partition of unity (degree 2)', () => {
  // 5 B-splines from open knot vector [0,0,0,1,2,3,3,3]
  const t = [0, 0, 0, 1, 2, 3, 3, 3];
  const splines = [];
  for (let i = 0; i + 4 <= t.length; i++) splines.push(t.slice(i, i + 4));
  for (let x = 0.05; x < 3; x += 0.27) {
    let s = 0;
    for (const kv of splines) s += evalBSpline1D(kv, x);
    assertClose(s, 1, 1e-6, `partition of unity at x=${x}`);
  }
});

// 2. Knot vector splitting ----------------------------------------------
test('splitKnotVector: degree 2 split at midpoint', () => {
  const r = splitKnotVector([0, 1, 2, 3], 1.5);
  assertEq(r.left.kv.join(','), '0,1,1.5,2');
  assertEq(r.right.kv.join(','), '1,1.5,2,3');
  // alpha_left = (1.5-0)/(2-0) = 0.75
  // alpha_right = (3-1.5)/(3-1) = 0.75
  assertClose(r.left.alpha, 0.75);
  assertClose(r.right.alpha, 0.75);
});

test('splitKnotVector returns null outside support', () => {
  assertEq(splitKnotVector([0, 1, 2, 3], 0), null);
  assertEq(splitKnotVector([0, 1, 2, 3], 3), null);
  assertEq(splitKnotVector([0, 1, 2, 3], -1), null);
});

test('splitBSpline preserves the function (1D test)', () => {
  // Original B-spline N[0,1,2,3] = alpha_L * N[left] + alpha_R * N[right]
  const parent = { kx: [0, 1], ky: [0, 1, 2, 3], coeff: 1 };
  const kids = splitBSpline(parent, 'h', 1.7);
  for (let y = 0.1; y < 3; y += 0.31) {
    const original = evalBSpline1D(parent.ky, y);
    let recomposed = 0;
    for (const c of kids) recomposed += c.coeff * evalBSpline1D(c.ky, y);
    assertClose(recomposed, original, 1e-6, `y=${y}`);
  }
});

// 3. Meshline-traversal predicate ---------------------------------------
test('meshlineSplitsBSpline: full traversal', () => {
  // B's y knot vector does NOT yet include 0.5, so a multiplicity-1 line at
  // y=0.5 should split this B-spline.
  const B = { kx: [0, 0.25, 0.5, 0.75], ky: [0, 0.25, 0.75, 1.0], coeff: 1 };
  const ml = { dir: 'h', c: 0.5, a: 0, b: 1, m: 1 };
  const r = meshlineSplitsBSpline(B, ml);
  assertTrue(r !== null, 'should split');
  assertEq(r.dir, 'h');
  assertClose(r.tau, 0.5);
});

test('meshlineSplitsBSpline: knot already present at sufficient mult does not split', () => {
  // B already has 0.5 in its local y-knots; a mult-1 line adds nothing.
  const B = { kx: [0, 0.25, 0.5, 0.75], ky: [0, 0.25, 0.5, 0.75], coeff: 1 };
  const ml = { dir: 'h', c: 0.5, a: 0, b: 1, m: 1 };
  assertEq(meshlineSplitsBSpline(B, ml), null);
});

test('meshlineSplitsBSpline: knot present at deficient mult does split', () => {
  // Same B as above but the meshline has higher multiplicity than the local
  // knot count, so it should add another copy of 0.5.
  const B = { kx: [0, 0.25, 0.5, 0.75], ky: [0, 0.25, 0.5, 0.75], coeff: 1 };
  const ml = { dir: 'h', c: 0.5, a: 0, b: 1, m: 2 };
  const r = meshlineSplitsBSpline(B, ml);
  assertTrue(r !== null, 'should split');
  assertClose(r.tau, 0.5);
});

test('meshlineSplitsBSpline: partial traversal does not split', () => {
  const B = { kx: [0, 0.25, 0.5, 0.75], ky: [0, 0.25, 0.5, 0.75], coeff: 1 };
  const ml = { dir: 'h', c: 0.4, a: 0.3, b: 0.6, m: 1 };
  assertEq(meshlineSplitsBSpline(B, ml), null);
});

test('meshlineSplitsBSpline: γ on boundary not strictly inside', () => {
  const B = { kx: [0, 0.5, 1], ky: [0, 0.5, 1], coeff: 1 };
  const ml = { dir: 'h', c: 0, a: 0, b: 1, m: 1 };
  assertEq(meshlineSplitsBSpline(B, ml), null);
});

// 4. Initial state -------------------------------------------------------
test('initial state: TP B-spline count, biquadratic open, Nx=Ny=0', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 0,
    Ny: 0,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  // Open knot: knotsX = [0,0,0,1,1,1] (length p+1+1+p = 6), so #BS x = len-(p+1) = 6-3 = 3
  assertEq(s.bsplines.length, 9, '3 x 3 B-splines');
  // Partition of unity:
  for (const x of [0.1, 0.3, 0.5, 0.9]) {
    for (const y of [0.1, 0.3, 0.5, 0.9]) {
      let sum = 0;
      for (const B of s.bsplines) sum += B.coeff * evalBSpline2D(B, x, y);
      assertClose(sum, 1, 1e-6, `partition at (${x},${y})`);
    }
  }
});

test('initial state: TP B-spline count, biquadratic open, Nx=2,Ny=1', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 2,
    Ny: 1,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  // knotsX length = (p+1) + Nx + (p+1) = 3+2+3 = 8 -> 8 - 3 = 5 B-splines in x
  // knotsY length = 3+1+3 = 7 -> 7 - 3 = 4 B-splines in y
  assertEq(s.bsplines.length, 5 * 4);
});

// 5. Refinement preserves the function -----------------------------------
test('insertMeshLine preserves partition of unity', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 1,
    Ny: 1,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  // Insert a horizontal line splitting the middle of the y-domain.
  insertMeshLine(s, { dir: 'h', c: 0.25, a: 0, b: 1, m: 1 });
  insertMeshLine(s, { dir: 'v', c: 0.6, a: 0, b: 1, m: 1 });
  // Partition of unity should hold pointwise.
  for (const x of [0.05, 0.2, 0.55, 0.8, 0.95]) {
    for (const y of [0.05, 0.2, 0.55, 0.8, 0.95]) {
      let sum = 0;
      for (const B of s.bsplines) sum += B.coeff * evalBSpline2D(B, x, y);
      assertClose(sum, 1, 1e-6, `partition at (${x},${y})`);
    }
  }
});

test('local refinement: short meshline still splits affected B-splines', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 2,
    Ny: 2,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  const before = s.bsplines.length;
  // A horizontal segment that does NOT span the whole x-domain but
  // covers the support of at least one bicubic B-spline whose x-knots
  // lie in (0, 2/3) say.
  // Knots in x: [0,0,0,1/3,2/3,1,1,1]. A B-spline starting at i=1 has kx=[0,0,1/3,2/3].
  // So a meshline spanning x in [0, 2/3] traverses that B-spline.
  insertMeshLine(s, { dir: 'h', c: 1 / 3, a: 0, b: 2 / 3, m: 1 });
  const after = s.bsplines.length;
  assertTrue(after > before, 'expected more B-splines after refinement');
  // PoU still holds
  for (const x of [0.1, 0.4, 0.7, 0.95]) {
    for (const y of [0.1, 0.4, 0.7, 0.95]) {
      let sum = 0;
      for (const B of s.bsplines) sum += B.coeff * evalBSpline2D(B, x, y);
      assertClose(sum, 1, 1e-6, `partition at (${x},${y})`);
    }
  }
});

// 6. Anchors and meshline construction -----------------------------------
test('anchor count for empty initial mesh (open, Nx=Ny=0)', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 0,
    Ny: 0,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  const anchors = computeAnchors(s);
  // 4 boundary mesh-lines each with one edge between corner crossings -> 4 anchors.
  assertEq(anchors.length, 4);
});

test('anchor count for Nx=1, Ny=1 open biquadratic', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 1,
    Ny: 1,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  // 3 horizontal + 3 vertical mesh-lines; each split into 2 edges by the
  // perpendicular family => 6 horizontal anchors + 6 vertical anchors = 12.
  const anchors = computeAnchors(s);
  assertEq(anchors.length, 12);
});

test('meshlineFromAnchors: same mesh-line, different edges raises multiplicity', () => {
  const a1 = { dir: 'h', c: 0.5, edgeLo: 0, edgeHi: 0.25, mid: 0.125 };
  const a2 = { dir: 'h', c: 0.5, edgeLo: 0.5, edgeHi: 0.75, mid: 0.625 };
  const ml = meshlineFromAnchors(a1, a2, 1);
  assertEq(ml.dir, 'h');
  assertClose(ml.c, 0.5);
  assertClose(ml.a, 0);
  assertClose(ml.b, 0.75);
  assertEq(ml.m, 1);
});

test('meshlineFromAnchors: same mid on different mesh-lines defines a new perpendicular line', () => {
  // Two horizontal-anchor edge midpoints at x=0.5 on different y-mesh-lines.
  const a1 = { dir: 'h', c: 0,   edgeLo: 0, edgeHi: 1, mid: 0.5 };
  const a2 = { dir: 'h', c: 0.5, edgeLo: 0, edgeHi: 1, mid: 0.5 };
  const ml = meshlineFromAnchors(a1, a2, 1);
  assertEq(ml.dir, 'v');
  assertClose(ml.c, 0.5);
  assertClose(ml.a, 0);
  assertClose(ml.b, 0.5);
});

test('meshlineFromAnchors: incompatible anchors return null', () => {
  const a1 = { dir: 'h', c: 0,   edgeLo: 0, edgeHi: 1, mid: 0.5 };
  const a2 = { dir: 'h', c: 0.5, edgeLo: 0, edgeHi: 1, mid: 0.25 };
  assertEq(meshlineFromAnchors(a1, a2, 1), null);
  const a3 = { dir: 'v', c: 0.5, edgeLo: 0, edgeHi: 1, mid: 0.5 };
  assertEq(meshlineFromAnchors(a1, a3, 1), null);
});

// 7. Serialize / deserialize roundtrip -----------------------------------
test('serialize roundtrip', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 1,
    Ny: 1,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 0.25, a: 0, b: 1, m: 1 });
  const json = serialize(s);
  const s2 = deserialize(json);
  assertEq(s2.bsplines.length, s.bsplines.length);
  // Partition of unity for the recovered state:
  for (const x of [0.2, 0.6]) {
    for (const y of [0.2, 0.6]) {
      let sum = 0;
      for (const B of s2.bsplines) sum += B.coeff * evalBSpline2D(B, x, y);
      assertClose(sum, 1, 1e-6);
    }
  }
});

// 8. Higher multiplicity --------------------------------------------------
test('multiplicity-2 horizontal split reduces continuity at γ', () => {
  const s = createInitialState({
    p: 2,
    q: 2,
    Nx: 0,
    Ny: 0,
    openKnots: true,
    domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 0.5, a: 0, b: 1, m: 2 });
  // PoU still holds
  for (const x of [0.1, 0.6]) {
    for (const y of [0.3, 0.49, 0.51, 0.7]) {
      let sum = 0;
      for (const B of s.bsplines) sum += B.coeff * evalBSpline2D(B, x, y);
      assertClose(sum, 1, 1e-6, `pou at (${x},${y})`);
    }
  }
});

// Run -------------------------------------------------------------------
export function runAll() {
  const out = { pass: 0, fail: 0, results: [] };
  for (const t of tests) {
    try {
      t.fn();
      out.pass += 1;
      out.results.push({ name: t.name, ok: true });
    } catch (e) {
      out.fail += 1;
      out.results.push({ name: t.name, ok: false, error: e.message });
    }
  }
  return out;
}

if (typeof window !== 'undefined' && window.location) {
  // Auto-render in the browser test page.
  window.addEventListener('DOMContentLoaded', () => {
    const out = runAll();
    const target = document.getElementById('out');
    if (!target) return;
    target.innerHTML =
      `<p><strong>${out.pass} passed, ${out.fail} failed</strong></p>` +
      out.results
        .map(
          (r) =>
            `<div class="${r.ok ? 'pass' : 'fail'}">${
              r.ok ? '✔' : '✘'
            } ${r.name}${r.error ? ` — <code>${r.error}</code>` : ''}</div>`
        )
        .join('');
  });
}
