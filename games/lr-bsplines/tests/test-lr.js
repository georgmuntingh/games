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
  previewSplitTargets,
  serialize,
  deserialize,
  approxEq,
} from '../lr-math.js';
import {
  initialDualPoly,
  evalDualPoly,
  scaleDualPoly,
  addDualPoly,
  simplifyDualPoly,
  renderDualPolyHTML,
} from '../marsden.js';

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
  // Same direction, different c, different mid -> not compatible.
  const a2 = { dir: 'h', c: 0.5, edgeLo: 0, edgeHi: 1, mid: 0.25 };
  assertEq(meshlineFromAnchors(a1, a2, 1), null);
  // Cross direction with no alignment between a4.c and a1.mid -> not compatible.
  const a4 = { dir: 'v', c: 0.25, edgeLo: 0, edgeHi: 1, mid: 0.5 };
  assertEq(meshlineFromAnchors(a1, a4, 1), null);
});

test('meshlineFromAnchors: cross-direction snap to perpendicular endpoint', () => {
  // a1 is a midpoint anchor on horizontal line y=0 at mid x=0.5.
  // a2 is a T-junction at the lower endpoint (y=0.5) of a vertical line at x=0.5.
  // Together they should define a vertical mesh-line at x=0.5 from y=0 to y=0.5.
  const a1 = { kind: 'midpoint', dir: 'h', c: 0,   edgeLo: 0, edgeHi: 1, mid: 0.5 };
  const a2 = { kind: 'tjunction', dir: 'v', c: 0.5, edgeLo: 0.5, edgeHi: 0.5, mid: 0.5 };
  const ml = meshlineFromAnchors(a1, a2, 1);
  assertEq(ml.dir, 'v');
  assertClose(ml.c, 0.5);
  assertClose(ml.a, 0);
  assertClose(ml.b, 0.5);
});

test('computeAnchors: T-junctions appear at endpoints of partial mesh-lines', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 1, Ny: 1, openKnots: true, domain: [0, 1, 0, 1],
  });
  // Insert a partial vertical line at x=0.25 spanning y in [0, 0.5]; its
  // endpoints are at the bottom boundary and the y=0.5 horizontal — both on
  // perpendicular meshlines, so both endpoints should yield T-junctions.
  insertMeshLine(s, { dir: 'v', c: 0.25, a: 0, b: 0.5, m: 1 });
  const tjs = computeAnchors(s).filter((a) => a.kind === 'tjunction');
  assertTrue(tjs.length >= 2, `expected ≥2 T-junction anchors, got ${tjs.length}`);
  const hasLower = tjs.some(
    (a) => a.dir === 'v' && Math.abs(a.c - 0.25) < 1e-9 && Math.abs(a.mid - 0) < 1e-9
  );
  const hasUpper = tjs.some(
    (a) => a.dir === 'v' && Math.abs(a.c - 0.25) < 1e-9 && Math.abs(a.mid - 0.5) < 1e-9
  );
  assertTrue(hasLower, 'lower endpoint T-junction missing');
  assertTrue(hasUpper, 'upper endpoint T-junction missing');
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

// 9. End-to-end Phase-9 walkthrough scenarios -----------------------------
test('default config (Nx=Ny=2, biquadratic open) produces 25 B-splines', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  // knotsX length = (p+1) + Nx + (p+1) = 3+2+3 = 8 -> 8 - 3 = 5 B-splines in x;
  // same in y; total = 25.
  assertEq(s.bsplines.length, 25);
});

test('default config has 24 anchors (4 mesh-lines × 3 edges, both directions)', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  assertEq(computeAnchors(s).length, 24);
});

test('press-and-drag perpendicular: same-mid + different-c builds a new perpendicular line', () => {
  // Picks two anchors on horizontal mesh-lines at the same mid_x, on different
  // y-mesh-lines, to insert a new vertical mesh-line through their midpoint.
  const a1 = { dir: 'h', c: 0,    edgeLo: 0, edgeHi: 1 / 3, mid: 1 / 6 };
  const a2 = { dir: 'h', c: 1/3,  edgeLo: 0, edgeHi: 1 / 3, mid: 1 / 6 };
  const ml = meshlineFromAnchors(a1, a2, 1);
  assertEq(ml.dir, 'v');
  assertClose(ml.c, 1 / 6);
  assertClose(ml.a, 0);
  assertClose(ml.b, 1 / 3);
});

test('full pipeline: insert perpendicular line on default mesh, basis grows, PoU holds', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  const before = s.bsplines.length;
  // Insert a vertical mesh-line at x=1/6 spanning y ∈ [0, 1/3]; this should
  // split B-splines whose support is fully traversed.
  insertMeshLine(s, { dir: 'v', c: 1 / 6, a: 0, b: 1 / 3, m: 1 });
  assertTrue(s.bsplines.length > before, 'basis must grow');
  for (const x of [0.05, 0.2, 0.55, 0.95]) {
    for (const y of [0.05, 0.2, 0.55, 0.95]) {
      let sum = 0;
      for (const B of s.bsplines) sum += B.coeff * evalBSpline2D(B, x, y);
      assertClose(sum, 1, 1e-6, `pou at (${x},${y})`);
    }
  }
});

test('multiple sequential insertions preserve PoU', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'v', c: 1 / 6, a: 0, b: 1 / 3, m: 1 });
  insertMeshLine(s, { dir: 'h', c: 1 / 6, a: 0, b: 1 / 3, m: 1 });
  insertMeshLine(s, { dir: 'v', c: 5 / 6, a: 2 / 3, b: 1, m: 1 });
  for (const x of [0.07, 0.4, 0.85]) {
    for (const y of [0.07, 0.4, 0.85]) {
      let sum = 0;
      for (const B of s.bsplines) sum += B.coeff * evalBSpline2D(B, x, y);
      assertClose(sum, 1, 1e-6, `pou at (${x},${y})`);
    }
  }
});

test('previewSplitTargets is consistent with the cascade', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  const ml = { dir: 'v', c: 1 / 6, a: 0, b: 1 / 3, m: 1 };
  const targets = previewSplitTargets(s, ml);
  assertTrue(targets.length > 0, 'preview should report at least one target');
  // After insertion, the listed targets must no longer appear verbatim in
  // the basis (they have been split).
  insertMeshLine(s, ml);
  for (const orig of targets) {
    const stillThere = s.bsplines.some(
      (B) =>
        B.kx.length === orig.kx.length &&
        B.ky.length === orig.ky.length &&
        B.kx.every((v, k) => approxEq(v, orig.kx[k])) &&
        B.ky.every((v, k) => approxEq(v, orig.ky[k]))
    );
    assertTrue(!stillThere, 'predicted target B-spline must have been replaced');
  }
});
// 10. Marsden identity ----------------------------------------------------
function checkMarsden(state, samples) {
  const { p, q } = state;
  const [xmin, xmax, ymin, ymax] = state.domain;
  for (const [x1, x2, y1, y2] of samples) {
    const lhs = Math.pow(y1 - x1, p) * Math.pow(y2 - x2, q);
    let rhs = 0;
    for (const B of state.bsplines) {
      const Bval = evalBSpline2D(B, x1, x2);
      if (Bval === 0) continue;
      rhs += evalDualPoly(B.dualPoly, y1, y2) * Bval;
    }
    assertClose(rhs, lhs, 1e-6, `Marsden at x=(${x1},${x2}) y=(${y1},${y2})`);
  }
  // Reference samples not used; arguments just for tag.
  return [xmin, xmax, ymin, ymax];
}

function gridSamples(state) {
  const [xmin, xmax, ymin, ymax] = state.domain;
  const xs = [];
  for (let i = 1; i < 5; i++) xs.push(xmin + ((xmax - xmin) * i) / 5);
  const ys = [];
  for (let j = 1; j < 5; j++) ys.push(ymin + ((ymax - ymin) * j) / 5);
  // y-points for the dual polynomial — Marsden is a polynomial identity in y,
  // so any reals work. Pick a mix inside and outside the domain.
  const Ys = [-0.3, 0.15, 0.5, 0.83, 1.4];
  const samples = [];
  for (const x1 of xs)
    for (const x2 of ys)
      for (const y1 of Ys)
        for (const y2 of Ys) samples.push([x1, x2, y1, y2]);
  return samples;
}

test('initial dual polynomial: bidegree (2,2) tensor product → factored form', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  for (const B of s.bsplines) {
    assertEq(B.dualPoly.terms.length, 1, 'initial dual must be a single product');
    const t = B.dualPoly.terms[0];
    assertEq(t.xRoots.length, 2, 'two x-dual points for p=2');
    assertEq(t.yRoots.length, 2, 'two y-dual points for q=2');
    // Roots must equal the interior knots.
    const xs = B.kx.slice(1, 3).slice().sort((a, b) => a - b);
    const ys = B.ky.slice(1, 3).slice().sort((a, b) => a - b);
    assertClose(t.xRoots[0], xs[0]);
    assertClose(t.xRoots[1], xs[1]);
    assertClose(t.yRoots[0], ys[0]);
    assertClose(t.yRoots[1], ys[1]);
    assertClose(t.coeff, 1);
  }
});

test('Marsden identity holds on initial tensor product, biquadratic', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  checkMarsden(s, gridSamples(s));
});

test('Marsden identity holds on initial tensor product, bilinear', () => {
  const s = createInitialState({
    p: 1, q: 1, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  // Bilinear: 2 dual points (1 in x + 1 in y) per B-spline.
  for (const B of s.bsplines) {
    assertEq(B.dualPoly.terms.length, 1);
    assertEq(B.dualPoly.terms[0].xRoots.length, 1);
    assertEq(B.dualPoly.terms[0].yRoots.length, 1);
  }
  checkMarsden(s, gridSamples(s));
});

test('Marsden identity holds on initial tensor product, mixed (p=2,q=3)', () => {
  const s = createInitialState({
    p: 2, q: 3, Nx: 1, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  checkMarsden(s, gridSamples(s));
});

test('Marsden identity is preserved by a global horizontal split', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 1, Ny: 1, openKnots: true, domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 0.3, a: 0, b: 1, m: 1 });
  checkMarsden(s, gridSamples(s));
});

test('Marsden identity is preserved by sequential global splits', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 1, Ny: 1, openKnots: true, domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 0.25, a: 0, b: 1, m: 1 });
  insertMeshLine(s, { dir: 'v', c: 0.6, a: 0, b: 1, m: 1 });
  insertMeshLine(s, { dir: 'h', c: 0.75, a: 0, b: 1, m: 1 });
  checkMarsden(s, gridSamples(s));
});

test('Marsden identity is preserved by a partial (LR) split', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 2, Ny: 2, openKnots: true, domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 1 / 3, a: 0, b: 2 / 3, m: 1 });
  checkMarsden(s, gridSamples(s));
});

test('Marsden identity holds at full multiplicity (p+1) horizontal split', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 0, Ny: 0, openKnots: true, domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 0.5, a: 0, b: 1, m: 2 });
  checkMarsden(s, gridSamples(s));
});

test('global tensor-product knot insertion keeps every dual poly factored', () => {
  // A globally inserted full-span horizontal line is a tensor-product knot
  // insertion in the y-direction; Cox-de Boor guarantees that every new
  // B-spline's dual polynomial has the natural factored form.
  const s = createInitialState({
    p: 2, q: 2, Nx: 1, Ny: 1, openKnots: true, domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 0.2, a: 0, b: 1, m: 1 });
  insertMeshLine(s, { dir: 'v', c: 0.7, a: 0, b: 1, m: 1 });
  for (const B of s.bsplines) {
    assertEq(
      B.dualPoly.terms.length,
      1,
      `B-spline ${JSON.stringify({ kx: B.kx, ky: B.ky })} should factor`
    );
    // And the factored roots must match the natural ones (interior knots).
    const t = B.dualPoly.terms[0];
    const natX = B.kx.slice(1, s.p + 1).slice().sort((a, b) => a - b);
    const natY = B.ky.slice(1, s.q + 1).slice().sort((a, b) => a - b);
    for (let k = 0; k < natX.length; k++) assertClose(t.xRoots[k], natX[k]);
    for (let k = 0; k < natY.length; k++) assertClose(t.yRoots[k], natY[k]);
  }
});

test('Marsden round-trips through serialize/deserialize', () => {
  const s = createInitialState({
    p: 2, q: 2, Nx: 1, Ny: 1, openKnots: true, domain: [0, 1, 0, 1],
  });
  insertMeshLine(s, { dir: 'h', c: 1 / 3, a: 0, b: 2 / 3, m: 1 });
  const recovered = deserialize(serialize(s));
  // Sample a few (x, y) points; the recovered state must satisfy Marsden.
  const samples = [];
  for (const x1 of [0.1, 0.45, 0.8])
    for (const x2 of [0.1, 0.45, 0.8])
      for (const y1 of [-0.1, 0.4, 1.1])
        for (const y2 of [-0.1, 0.4, 1.1]) samples.push([x1, x2, y1, y2]);
  checkMarsden(recovered, samples);
});

// 11. Marsden algebra units ------------------------------------------------
test('simplifyDualPoly factors a sum that secretly is one product', () => {
  // (y1-1)(y2-1) + (y1-1)(y2-2) = (y1-1)(2 y2 - 3) = 2 (y1-1)(y2 - 1.5).
  const poly = {
    terms: [
      { coeff: 1, xRoots: [1], yRoots: [1] },
      { coeff: 1, xRoots: [1], yRoots: [2] },
    ],
  };
  const simplified = simplifyDualPoly(poly);
  assertEq(simplified.terms.length, 1, 'should collapse to one term');
  const t = simplified.terms[0];
  assertClose(t.coeff, 2);
  assertClose(t.xRoots[0], 1);
  assertClose(t.yRoots[0], 1.5);
});

test('simplifyDualPoly leaves a non-factorable sum as multiple terms', () => {
  // (y1-0)(y2-0) + (y1-1)(y2-1)  is NOT separable (y1 y2 + y1 y2 - y1 - y2 + 1
  // = 2 y1 y2 - y1 - y2 + 1; the coefficient matrix has rank 2).
  const poly = {
    terms: [
      { coeff: 1, xRoots: [0], yRoots: [0] },
      { coeff: 1, xRoots: [1], yRoots: [1] },
    ],
  };
  const simplified = simplifyDualPoly(poly);
  assertTrue(simplified.terms.length >= 2, 'should remain a sum of two terms');
});

test('simplifyDualPoly cancels opposite terms', () => {
  const poly = {
    terms: [
      { coeff: 1, xRoots: [0.5], yRoots: [0.5] },
      { coeff: -1, xRoots: [0.5], yRoots: [0.5] },
    ],
  };
  const simplified = simplifyDualPoly(poly);
  assertEq(simplified.terms.length, 0, 'opposite terms cancel');
});

test('scaleDualPoly multiplies every term coefficient', () => {
  const p = initialDualPoly([0, 0, 0.5, 1], [0, 0, 0.5, 1], 2, 2);
  const s = scaleDualPoly(p, 0.5);
  assertEq(s.terms.length, 1);
  assertClose(s.terms[0].coeff, 0.5);
});

test('addDualPoly combines and simplifies', () => {
  const a = { terms: [{ coeff: 1, xRoots: [1], yRoots: [1] }] };
  const b = { terms: [{ coeff: 2, xRoots: [1], yRoots: [1] }] };
  const r = addDualPoly(a, b);
  assertEq(r.terms.length, 1);
  assertClose(r.terms[0].coeff, 3);
});

test('renderDualPolyHTML formats a single product with subscripted variables', () => {
  const poly = {
    terms: [{ coeff: 1, xRoots: [0.25], yRoots: [0.5] }],
  };
  const html = renderDualPolyHTML(poly);
  assertTrue(html.includes('y<sub>1</sub>'), 'has y_1');
  assertTrue(html.includes('y<sub>2</sub>'), 'has y_2');
  assertTrue(html.includes('0.25'), 'has the x-root');
  assertTrue(html.includes('0.50'), 'has the y-root');
});

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
