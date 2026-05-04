// LR B-spline math, following Dokken, Lyche & Pettersen (CAGD 2013).
//
// State shape:
//   {
//     p, q,                      // bidegrees (1..5)
//     domain: [xmin, xmax, ymin, ymax],
//     openKnots: boolean,        // open vs uniform initial knot vectors
//     knotsX, knotsY,            // initial scalar knot coordinates (multi-set)
//     meshlines: [               // every meshline-segment in the LR-mesh
//       { dir: 'h'|'v', c, a, b, m }   // c = constant value, [a,b] = extent, m = mult
//     ],
//     bsplines: [                // active LR B-splines
//       { kx: number[p+2], ky: number[q+2], coeff: number, dualPoly }
//     ]
//   }

import {
  addDualPoly,
  cloneDualPoly,
  initialDualPoly,
  scaleDualPoly,
  simplifyDualPoly,
} from './marsden.js';

const EPS = 1e-9;

export function approxEq(a, b) {
  return Math.abs(a - b) < EPS;
}

// Univariate B-spline value at x for the unique B-spline whose local knot
// vector is kv (length p+2). Standard Cox-de Boor on the local knots.
export function evalBSpline1D(kv, x) {
  const p = kv.length - 2;
  const last = kv[p + 1];
  if (x < kv[0] - EPS || x > last + EPS) return 0;
  // Build degree-0 column: N_{i,0}(x) = 1 if kv[i] <= x < kv[i+1], 1 at right boundary.
  const N = new Array(p + 1).fill(0);
  for (let i = 0; i <= p; i++) {
    if (kv[i] <= x && x < kv[i + 1]) N[i] = 1;
  }
  if (x >= last - EPS) {
    // Right boundary: ensure the last non-degenerate interval contributes.
    for (let i = p; i >= 0; i--) {
      if (kv[i] < kv[i + 1]) {
        N[i] = 1;
        break;
      }
    }
  }
  for (let d = 1; d <= p; d++) {
    for (let i = 0; i <= p - d; i++) {
      const denomA = kv[i + d] - kv[i];
      const denomB = kv[i + d + 1] - kv[i + 1];
      const a = denomA > EPS ? ((x - kv[i]) / denomA) * N[i] : 0;
      const b = denomB > EPS ? ((kv[i + d + 1] - x) / denomB) * N[i + 1] : 0;
      N[i] = a + b;
    }
  }
  return N[0];
}

export function evalBSpline2D(B, x, y) {
  return evalBSpline1D(B.kx, x) * evalBSpline1D(B.ky, y);
}

// Insert a knot tau strictly inside (kv[0], kv[end]). Returns
// { left: { kv, alpha }, right: { kv, alpha } } such that
//   N[kv] = alpha_left * N[left.kv] + alpha_right * N[right.kv].
// Returns null if tau lies on or outside the support.
export function splitKnotVector(kv, tau) {
  const p = kv.length - 2;
  if (tau <= kv[0] + EPS || tau >= kv[p + 1] - EPS) return null;
  // Insert tau preserving sorted order.
  let insertAt = kv.length;
  for (let i = 0; i < kv.length; i++) {
    if (kv[i] > tau) {
      insertAt = i;
      break;
    }
  }
  const extended = [...kv.slice(0, insertAt), tau, ...kv.slice(insertAt)];
  const leftKv = extended.slice(0, p + 2);
  const rightKv = extended.slice(1, p + 3);
  let alphaLeft;
  if (tau >= kv[p] - EPS) alphaLeft = 1;
  else alphaLeft = (tau - kv[0]) / (kv[p] - kv[0]);
  let alphaRight;
  if (tau <= kv[1] + EPS) alphaRight = 1;
  else alphaRight = (kv[p + 1] - tau) / (kv[p + 1] - kv[1]);
  return {
    left: { kv: leftKv, alpha: alphaLeft },
    right: { kv: rightKv, alpha: alphaRight },
  };
}

// Number of times v appears in arr (within EPS).
export function countOccurrences(arr, v) {
  let n = 0;
  for (const a of arr) if (approxEq(a, v)) n += 1;
  return n;
}

// Returns true iff a horizontal meshline [a,b] x {c} (mult m) traverses B's
// support and γ would need to appear in B.ky with multiplicity > current.
// Direction 'h': constant y = c, x-extent [a,b].
// Direction 'v': constant x = c, y-extent [a,b].
export function meshlineSplitsBSpline(B, ml) {
  const { dir, c, a, b, m } = ml;
  if (dir === 'h') {
    if (a > B.kx[0] + EPS || b < B.kx[B.kx.length - 1] - EPS) return null;
    if (c <= B.ky[0] + EPS || c >= B.ky[B.ky.length - 1] - EPS) return null;
    const have = countOccurrences(B.ky, c);
    if (have >= m) return null;
    return { dir: 'h', tau: c, deficit: m - have };
  } else {
    if (a > B.ky[0] + EPS || b < B.ky[B.ky.length - 1] - EPS) return null;
    if (c <= B.kx[0] + EPS || c >= B.kx[B.kx.length - 1] - EPS) return null;
    const have = countOccurrences(B.kx, c);
    if (have >= m) return null;
    return { dir: 'v', tau: c, deficit: m - have };
  }
}

// Apply one knot insertion on a B-spline in the given direction.
// Returns up to two children with coefficients pre-multiplied by parent's coeff.
export function splitBSpline(B, dir, tau) {
  const kv = dir === 'h' ? B.ky : B.kx;
  const split = splitKnotVector(kv, tau);
  if (!split) return [B];
  const children = [];
  for (const which of ['left', 'right']) {
    const part = split[which];
    if (part.alpha <= EPS) continue;
    const child = {
      kx: dir === 'h' ? [...B.kx] : part.kv,
      ky: dir === 'h' ? part.kv : [...B.ky],
      coeff: B.coeff * part.alpha,
      dualPoly: B.dualPoly ? scaleDualPoly(B.dualPoly, part.alpha) : undefined,
    };
    children.push(child);
  }
  return children;
}

function bsplineKey(B) {
  return B.kx.map((v) => v.toFixed(10)).join(',') + '|' +
    B.ky.map((v) => v.toFixed(10)).join(',');
}

// Insert a child B-spline into the active list, summing coefficients with any
// existing B-spline that has identical local knot vectors.
export function mergeOrAdd(bsplines, B) {
  const key = bsplineKey(B);
  for (const existing of bsplines) {
    if (bsplineKey(existing) === key) {
      existing.coeff += B.coeff;
      if (existing.dualPoly && B.dualPoly) {
        existing.dualPoly = addDualPoly(existing.dualPoly, B.dualPoly);
      }
      return existing;
    }
  }
  bsplines.push(B);
  return B;
}

// Build the initial tensor-product state.
//   p, q: bidegrees
//   Nx, Ny: number of *interior* knot lines (uniformly spaced)
//   openKnots: true => open knot vectors (boundary mult p+1, q+1)
//              false => uniform (boundary mult 1) -- still includes domain endpoints
export function createInitialState({ p, q, Nx, Ny, openKnots, domain }) {
  const [xmin, xmax, ymin, ymax] = domain;
  const interiorX = [];
  for (let i = 1; i <= Nx; i++) interiorX.push(xmin + ((xmax - xmin) * i) / (Nx + 1));
  const interiorY = [];
  for (let j = 1; j <= Ny; j++) interiorY.push(ymin + ((ymax - ymin) * j) / (Ny + 1));

  const xMultBoundary = openKnots ? p + 1 : 1;
  const yMultBoundary = openKnots ? q + 1 : 1;

  const knotsX = [
    ...Array(xMultBoundary).fill(xmin),
    ...interiorX,
    ...Array(xMultBoundary).fill(xmax),
  ];
  const knotsY = [
    ...Array(yMultBoundary).fill(ymin),
    ...Array(yMultBoundary).fill(ymin), // overwrite below
  ];
  // Recompute knotsY cleanly:
  const knotsYClean = [
    ...Array(yMultBoundary).fill(ymin),
    ...interiorY,
    ...Array(yMultBoundary).fill(ymax),
  ];

  // Build the meshlines: for each distinct y-knot value, one horizontal meshline
  // spanning the whole x-domain, with multiplicity = local count in knotsY.
  const meshlines = [];
  for (const v of distinct(knotsYClean)) {
    meshlines.push({
      dir: 'h',
      c: v,
      a: xmin,
      b: xmax,
      m: countOccurrences(knotsYClean, v),
    });
  }
  for (const v of distinct(knotsX)) {
    meshlines.push({
      dir: 'v',
      c: v,
      a: ymin,
      b: ymax,
      m: countOccurrences(knotsX, v),
    });
  }

  // Build tensor-product B-splines.
  const bsplines = [];
  // For each "starting index" i, the B-spline's x-knot vector is knotsX[i..i+p+1].
  for (let i = 0; i + p + 1 < knotsX.length; i++) {
    for (let j = 0; j + q + 1 < knotsYClean.length; j++) {
      const kx = knotsX.slice(i, i + p + 2);
      const ky = knotsYClean.slice(j, j + q + 2);
      // Reject degenerate B-splines (zero-length support).
      if (kx[0] >= kx[p + 1] - EPS) continue;
      if (ky[0] >= ky[q + 1] - EPS) continue;
      bsplines.push({ kx, ky, coeff: 1, dualPoly: initialDualPoly(kx, ky, p, q) });
    }
  }

  return {
    p,
    q,
    domain: [xmin, xmax, ymin, ymax],
    openKnots,
    knotsX,
    knotsY: knotsYClean,
    meshlines,
    bsplines,
  };
}

export function distinct(arr) {
  const out = [];
  for (const v of arr) if (!out.some((u) => approxEq(u, v))) out.push(v);
  out.sort((a, b) => a - b);
  return out;
}

// Inserts (or merges) a meshline into state.meshlines with the given multiplicity.
// Collinear adjacent / overlapping segments are unioned, and the multiplicity
// is incremented for the overlapping portion. For simplicity we treat the
// supplied line as merging with any collinear segment that touches its extent;
// any non-overlapping multiplicity-difference is split into separate records.
function unionMeshline(meshlines, ml) {
  // Find all collinear records on the same constant value.
  const out = [];
  let { dir, c, a, b, m } = ml;
  // We collect overlapping/touching collinear segments and combine them.
  const collinear = [];
  for (const r of meshlines) {
    if (r.dir !== dir || !approxEq(r.c, c)) {
      out.push(r);
      continue;
    }
    if (r.b < a - EPS || r.a > b + EPS) {
      // Disjoint, keep as-is.
      out.push(r);
    } else {
      collinear.push(r);
    }
  }
  // Build a 1-D segment cover: each existing collinear segment contributes m-multiplicity
  // over [r.a, r.b]; the new line contributes m over [a, b]. Sum and re-segment.
  const breakpoints = new Set();
  breakpoints.add(a);
  breakpoints.add(b);
  for (const r of collinear) {
    breakpoints.add(r.a);
    breakpoints.add(r.b);
  }
  const bps = [...breakpoints].sort((x, y) => x - y);
  const segs = [];
  for (let i = 0; i < bps.length - 1; i++) {
    const lo = bps[i];
    const hi = bps[i + 1];
    if (hi - lo < EPS) continue;
    const mid = (lo + hi) / 2;
    let mult = 0;
    if (a - EPS <= mid && mid <= b + EPS) mult += m;
    for (const r of collinear) {
      if (r.a - EPS <= mid && mid <= r.b + EPS) mult += r.m;
    }
    if (mult > 0) segs.push({ dir, c, a: lo, b: hi, m: mult });
  }
  // Coalesce adjacent segments with equal multiplicity.
  const merged = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && last.m === s.m && approxEq(last.b, s.a)) {
      last.b = s.b;
    } else {
      merged.push({ ...s });
    }
  }
  out.push(...merged);
  return out;
}

// Returns true iff the proposed meshline ml would split at least one B-spline.
export function previewSplitTargets(state, ml) {
  const targets = [];
  for (const B of state.bsplines) {
    if (meshlineSplitsBSpline(B, ml)) targets.push(B);
  }
  return targets;
}

// Cascade: keep splitting B-splines whose support is fully traversed by some
// meshline at insufficient local multiplicity, until a fixed point.
function runCascade(state) {
  let changed = true;
  let iterations = 0;
  while (changed) {
    changed = false;
    iterations += 1;
    if (iterations > 5000) {
      throw new Error('LR cascade did not converge (>5000 iterations)');
    }
    for (let i = 0; i < state.bsplines.length; i++) {
      const B = state.bsplines[i];
      let split = null;
      for (const ml of state.meshlines) {
        const s = meshlineSplitsBSpline(B, ml);
        if (s) {
          split = s;
          break;
        }
      }
      if (!split) continue;
      const kids = splitBSpline(B, split.dir, split.tau);
      state.bsplines.splice(i, 1);
      for (const child of kids) mergeOrAdd(state.bsplines, child);
      changed = true;
      break;
    }
  }
}

// Insert a meshline into the LR mesh. Mutates state. Cascade is run.
// Returns true if any B-spline was actually split.
export function insertMeshLine(state, ml) {
  state.meshlines = unionMeshline(state.meshlines, ml);
  const before = state.bsplines.length;
  runCascade(state);
  // Active count change is not a perfect proxy for "did we split anything",
  // because duplicates merge; report instead whether anyone targeted before.
  return { newCount: state.bsplines.length, delta: state.bsplines.length - before };
}

// Anchor points: for each meshline segment in the current LR-mesh, the midpoint
// of every edge between two adjacent crossings is an anchor (kind 'midpoint').
// An "edge" along a horizontal meshline is the interval between two adjacent
// vertical meshlines that cross it (and are within the horizontal extent).
// In addition, the endpoint of any *partial* meshline (i.e. one that does not
// span the full perpendicular domain) yields a 'tjunction' anchor — a natural
// starting point for refining by continuing or extending that meshline.
export function computeAnchors(state) {
  const anchors = [];
  const [xmin, xmax, ymin, ymax] = state.domain;
  // For horizontal meshlines: anchors lie at the midpoints between adjacent
  // vertical meshlines whose constant value lies in [ml.a, ml.b] AND whose
  // extent covers the horizontal meshline's c.
  for (const ml of state.meshlines) {
    const crossingsSet = new Set();
    if (ml.dir === 'h') {
      crossingsSet.add(ml.a);
      crossingsSet.add(ml.b);
      for (const other of state.meshlines) {
        if (other.dir !== 'v') continue;
        if (other.c < ml.a - EPS || other.c > ml.b + EPS) continue;
        if (other.a > ml.c + EPS || other.b < ml.c - EPS) continue;
        crossingsSet.add(other.c);
      }
    } else {
      crossingsSet.add(ml.a);
      crossingsSet.add(ml.b);
      for (const other of state.meshlines) {
        if (other.dir !== 'h') continue;
        if (other.c < ml.a - EPS || other.c > ml.b + EPS) continue;
        if (other.a > ml.c + EPS || other.b < ml.c - EPS) continue;
        crossingsSet.add(other.c);
      }
    }
    const crossings = [...crossingsSet].sort((a, b) => a - b);
    for (let i = 0; i < crossings.length - 1; i++) {
      const lo = crossings[i];
      const hi = crossings[i + 1];
      if (hi - lo < EPS) continue;
      const mid = (lo + hi) / 2;
      anchors.push({
        kind: 'midpoint',
        dir: ml.dir,
        c: ml.c,
        edgeLo: lo,
        edgeHi: hi,
        mid,
        meshline: ml,
      });
    }
  }
  // T-junction anchors: every endpoint of a partial meshline that lands on a
  // perpendicular meshline. Full-span meshlines (e.g., the original boundary
  // lines, which run corner-to-corner across the domain) are skipped — there
  // is no useful refinement that "continues" them.
  for (const ml of state.meshlines) {
    const isFullSpan =
      ml.dir === 'h'
        ? approxEq(ml.a, xmin) && approxEq(ml.b, xmax)
        : approxEq(ml.a, ymin) && approxEq(ml.b, ymax);
    if (isFullSpan) continue;
    for (const endpoint of [ml.a, ml.b]) {
      // Confirm the endpoint sits on a perpendicular meshline, otherwise it
      // is a free end (which shouldn't really occur in a valid LR-mesh, but
      // guarding anyway).
      let touchesPerpendicular = false;
      for (const other of state.meshlines) {
        if (other.dir === ml.dir) continue;
        if (!approxEq(other.c, endpoint)) continue;
        if (other.a <= ml.c + EPS && other.b >= ml.c - EPS) {
          touchesPerpendicular = true;
          break;
        }
      }
      if (!touchesPerpendicular) continue;
      anchors.push({
        kind: 'tjunction',
        dir: ml.dir,
        c: ml.c,
        edgeLo: endpoint,
        edgeHi: endpoint,
        mid: endpoint,
        meshline: ml,
      });
    }
  }
  // De-duplicate anchors by (kind, dir, c, edgeLo, edgeHi). Multiple meshline
  // records can describe the same edge or endpoint after coalescing.
  const seen = new Map();
  for (const a of anchors) {
    const key = `${a.kind}|${a.dir}|${a.c.toFixed(10)}|${a.edgeLo.toFixed(10)}|${a.edgeHi.toFixed(10)}`;
    if (!seen.has(key)) seen.set(key, a);
  }
  return [...seen.values()];
}

// Build a mesh-line from two compatible anchors.
//
// Anchor positions in 2D space are:
//   horizontal anchor → (mid, c)
//   vertical   anchor → (c, mid)
// where `mid` is the edge midpoint (or endpoint coord, for T-junction
// anchors) and `c` is the host mesh-line's constant.
//
// Two anchors are compatible in three ways:
//   (a) same direction AND same `c` — they lie on the same existing host
//       mesh-line; the pair raises multiplicity / extends its extent over
//       the union of their edges or endpoints.
//   (b) same direction AND same `mid` — they share a perpendicular-axis
//       coordinate while sitting on different host lines; the pair defines
//       a new perpendicular mesh-line at that coordinate, spanning between
//       the two host lines.
//   (c) cross direction AND `a2.c == a1.mid` — `a2` (the second pick) lies
//       on the perpendicular line that `a1` would induce; the pair defines
//       a new perpendicular mesh-line at `a1.mid`, spanning from `a1.c` to
//       `a2.mid`. This lets the user drag from one anchor and drop on the
//       endpoint (T-junction) of any perpendicular mesh-line that aligns
//       with `a1`'s position.
//
// T-junction anchors participate in all three cases; their `mid` is the
// endpoint coord rather than an edge midpoint, but the geometry still
// applies.
//
// Returns null if the anchors are not compatible.
export function meshlineFromAnchors(a1, a2, mult) {
  // Case (a): same host mesh-line.
  if (a1.dir === a2.dir && approxEq(a1.c, a2.c)) {
    const lo = Math.min(a1.edgeLo, a2.edgeLo);
    const hi = Math.max(a1.edgeHi, a2.edgeHi);
    if (hi - lo < EPS) return null;
    return { dir: a1.dir, c: a1.c, a: lo, b: hi, m: mult };
  }
  // Cases (b) and (c): a new mesh-line perpendicular to a1's host, at c=a1.mid.
  const newDir = a1.dir === 'h' ? 'v' : 'h';
  let a2PerpPos; // a2's coordinate along the new line's direction
  if (a1.dir === a2.dir) {
    if (!approxEq(a1.mid, a2.mid)) return null;
    a2PerpPos = a2.c;
  } else {
    if (!approxEq(a2.c, a1.mid)) return null;
    a2PerpPos = a2.mid;
  }
  const lo = Math.min(a1.c, a2PerpPos);
  const hi = Math.max(a1.c, a2PerpPos);
  if (hi - lo < EPS) return null;
  return { dir: newDir, c: a1.mid, a: lo, b: hi, m: mult };
}

export function cloneState(state) {
  return {
    p: state.p,
    q: state.q,
    domain: [...state.domain],
    openKnots: state.openKnots,
    knotsX: [...state.knotsX],
    knotsY: [...state.knotsY],
    meshlines: state.meshlines.map((m) => ({ ...m })),
    bsplines: state.bsplines.map((B) => ({
      kx: [...B.kx],
      ky: [...B.ky],
      coeff: B.coeff,
      dualPoly: B.dualPoly ? cloneDualPoly(B.dualPoly) : undefined,
    })),
  };
}

export function serialize(state) {
  return JSON.stringify(
    {
      version: 1,
      p: state.p,
      q: state.q,
      domain: state.domain,
      openKnots: state.openKnots,
      knotsX: state.knotsX,
      knotsY: state.knotsY,
      meshlines: state.meshlines,
      bsplines: state.bsplines.map((B) => ({
        kx: B.kx,
        ky: B.ky,
        coeff: B.coeff,
        dualPoly: B.dualPoly ? cloneDualPoly(B.dualPoly) : undefined,
      })),
    },
    null,
    2
  );
}

export function deserialize(json) {
  const obj = typeof json === 'string' ? JSON.parse(json) : json;
  if (!obj || obj.version !== 1) throw new Error('Unsupported file version');
  const p = obj.p;
  const q = obj.q;
  return {
    p,
    q,
    domain: obj.domain,
    openKnots: !!obj.openKnots,
    knotsX: obj.knotsX,
    knotsY: obj.knotsY,
    meshlines: obj.meshlines.map((m) => ({ ...m })),
    bsplines: obj.bsplines.map((B) => ({
      kx: [...B.kx],
      ky: [...B.ky],
      coeff: B.coeff,
      // Older exports may not include dualPoly; fall back to the natural one
      // built from the B-spline's interior knots. Newer exports round-trip
      // verbatim, including non-trivial sums.
      dualPoly: B.dualPoly
        ? simplifyDualPoly(B.dualPoly)
        : initialDualPoly(B.kx, B.ky, p, q),
    })),
  };
}
