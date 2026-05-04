// Marsden identity tracking for tensor-product / LR B-splines.
//
// For bidegree (p, q) the Marsden identity reads
//
//   (y1 - x1)^p (y2 - x2)^q  =  Σ_i  p_i(y1, y2) · B_i(x1, x2),
//
// where the natural dual polynomial of a tensor-product B-spline whose
// interior x-knots are kx[1..p] and interior y-knots are ky[1..q] is the
// single product
//
//   p_i(y) = ∏_{a=1..p} (y1 - kx[a]) · ∏_{b=1..q} (y2 - ky[b]).
//
// Under refinement (Cox-de Boor knot insertion + LR merge) each child's
// dual polynomial is the linear combination of its parents' dual polys
// weighted by the same α-coefficients used to combine the basis-function
// coefficients. The result is in general a *sum* of separable products;
// it sometimes collapses back to a single product (the "new dual points"),
// sometimes it does not.
//
// Internal representation:
//   { terms: [ { coeff, xRoots: number[], yRoots: number[] }, ... ] }
// Each term equals  coeff · ∏(y1 - xRoots[k]) · ∏(y2 - yRoots[k]).
// The polynomial value is the sum of the terms.

const EPS = 1e-9;
// Relative tolerance for the rank-1 / root-imaginary checks. Loose enough to
// survive a few rounds of float arithmetic during cascading splits, tight
// enough to refuse genuinely non-factorable polynomials.
const FACTOR_REL_TOL = 1e-7;

export function initialDualPoly(kx, ky, p, q) {
  return {
    terms: [
      {
        coeff: 1,
        xRoots: kx.slice(1, p + 1),
        yRoots: ky.slice(1, q + 1),
      },
    ],
  };
}

export function cloneDualPoly(poly) {
  return {
    terms: poly.terms.map((t) => ({
      coeff: t.coeff,
      xRoots: [...t.xRoots],
      yRoots: [...t.yRoots],
    })),
  };
}

export function scaleDualPoly(poly, alpha) {
  return {
    terms: poly.terms.map((t) => ({
      coeff: t.coeff * alpha,
      xRoots: [...t.xRoots],
      yRoots: [...t.yRoots],
    })),
  };
}

export function addDualPoly(p1, p2) {
  const terms = [
    ...p1.terms.map((t) => ({ coeff: t.coeff, xRoots: [...t.xRoots], yRoots: [...t.yRoots] })),
    ...p2.terms.map((t) => ({ coeff: t.coeff, xRoots: [...t.xRoots], yRoots: [...t.yRoots] })),
  ];
  return simplifyDualPoly({ terms });
}

export function evalDualPoly(poly, y1, y2) {
  let sum = 0;
  for (const t of poly.terms) {
    let v = t.coeff;
    for (const r of t.xRoots) v *= y1 - r;
    for (const r of t.yRoots) v *= y2 - r;
    sum += v;
  }
  return sum;
}

function rootsKey(roots) {
  return roots
    .slice()
    .sort((a, b) => a - b)
    .map((v) => v.toFixed(10))
    .join(',');
}

// Combine identical-root terms, drop near-zero terms, then attempt to
// collapse the whole sum into a single product.
export function simplifyDualPoly(poly) {
  const map = new Map();
  for (const t of poly.terms) {
    const xs = t.xRoots.slice().sort((a, b) => a - b);
    const ys = t.yRoots.slice().sort((a, b) => a - b);
    const k = rootsKey(xs) + '|' + rootsKey(ys);
    if (map.has(k)) {
      map.get(k).coeff += t.coeff;
    } else {
      map.set(k, { coeff: t.coeff, xRoots: xs, yRoots: ys });
    }
  }
  const terms = [...map.values()].filter((t) => Math.abs(t.coeff) > EPS);
  if (terms.length === 0) return { terms: [] };
  if (terms.length === 1) return { terms };
  const factored = tryFactorize({ terms });
  return factored || { terms };
}

// Multiply out ∏(y - r_k) into monomial-coefficient form a[0] + a[1] y + ...
function expandLinearProduct(roots) {
  let coeffs = [1];
  for (const r of roots) {
    const next = new Array(coeffs.length + 1).fill(0);
    for (let i = 0; i < coeffs.length; i++) {
      next[i] += -r * coeffs[i];
      next[i + 1] += coeffs[i];
    }
    coeffs = next;
  }
  return coeffs;
}

// Sum every term into a single (p+1) × (q+1) coefficient matrix C[i][j],
// where the polynomial is Σ C[i][j] y1^i y2^j. Both p and q are read off
// the first term (all terms in our simplified poly have the same bidegree).
function polyToMatrix(poly) {
  const t0 = poly.terms[0];
  const p = t0.xRoots.length;
  const q = t0.yRoots.length;
  const C = [];
  for (let i = 0; i <= p; i++) C.push(new Array(q + 1).fill(0));
  for (const t of poly.terms) {
    const xc = expandLinearProduct(t.xRoots);
    const yc = expandLinearProduct(t.yRoots);
    for (let i = 0; i <= p; i++) {
      for (let j = 0; j <= q; j++) {
        C[i][j] += t.coeff * xc[i] * yc[j];
      }
    }
  }
  return { C, p, q };
}

// Returns a single-term poly equal to `poly`, or null if no such factoring
// exists with all-real roots and full bidegree. Method:
//   1. Reduce to monomial coefficient matrix C.
//   2. Test rank(C) = 1 (otherwise not separable).
//   3. Recover f(y1) and g(y2) as the row / column vectors.
//   4. Find their real roots via Durand-Kerner.
function tryFactorize(poly) {
  const { C, p, q } = polyToMatrix(poly);
  let pi = 0,
    pj = 0,
    pivAbs = 0;
  for (let i = 0; i <= p; i++) {
    for (let j = 0; j <= q; j++) {
      if (Math.abs(C[i][j]) > pivAbs) {
        pivAbs = Math.abs(C[i][j]);
        pi = i;
        pj = j;
      }
    }
  }
  if (pivAbs < EPS) return null;
  const piv = C[pi][pj];
  const tol = pivAbs * FACTOR_REL_TOL;
  for (let i = 0; i <= p; i++) {
    for (let j = 0; j <= q; j++) {
      if (Math.abs(C[i][j] * piv - C[i][pj] * C[pi][j]) > tol) return null;
    }
  }
  const a = [];
  for (let i = 0; i <= p; i++) a.push(C[i][pj]);
  const b = [];
  for (let j = 0; j <= q; j++) b.push(C[pi][j] / piv);

  const xFact = factorRealUnivariate(a, p);
  const yFact = factorRealUnivariate(b, q);
  if (!xFact || !yFact) return null;

  return {
    terms: [
      {
        coeff: xFact.lead * yFact.lead,
        xRoots: xFact.roots,
        yRoots: yFact.roots,
      },
    ],
  };
}

// Factor coeffs[0] + coeffs[1] y + ... + coeffs[expectedDeg] y^expectedDeg
// into  lead · ∏ (y - r_k)  with all r_k real. Returns null if the leading
// coefficient drops, or any root is non-real within tolerance.
function factorRealUnivariate(coeffs, expectedDeg) {
  let deg = coeffs.length - 1;
  const head = coeffs[deg];
  while (deg > 0 && Math.abs(coeffs[deg]) < EPS * (Math.abs(head) + 1)) deg--;
  if (deg !== expectedDeg) return null;
  const lead = coeffs[deg];
  if (Math.abs(lead) < EPS) return null;
  if (deg === 0) return { lead, roots: [] };
  if (deg === 1) return { lead, roots: [-coeffs[0] / coeffs[1]] };

  const roots = durandKerner(coeffs, deg);
  if (!roots) return null;
  let maxMag = 1;
  for (const r of roots) maxMag = Math.max(maxMag, Math.hypot(r.re, r.im));
  const imagTol = maxMag * 1e-5;
  const realRoots = [];
  for (const r of roots) {
    if (Math.abs(r.im) > imagTol) return null;
    realRoots.push(r.re);
  }
  realRoots.sort((a, b) => a - b);
  return { lead, roots: realRoots };
}

// Durand-Kerner / Weierstrass simultaneous root iteration. Returns an array
// of {re, im} or null if it failed to converge.
function durandKerner(coeffs, deg) {
  const monic = coeffs.map((c) => c / coeffs[deg]);
  let bound = 1;
  for (let i = 0; i < deg; i++) bound = Math.max(bound, Math.abs(monic[i]));
  bound = 1 + bound;
  const roots = [];
  for (let k = 0; k < deg; k++) {
    const angle = (2 * Math.PI * k) / deg + 0.4;
    roots.push({
      re: 0.5 * bound * Math.cos(angle),
      im: 0.5 * bound * Math.sin(angle),
    });
  }
  for (let iter = 0; iter < 500; iter++) {
    let maxDelta = 0;
    for (let k = 0; k < deg; k++) {
      const z = roots[k];
      // p(z) by Horner.
      let pre = 1,
        pim = 0;
      for (let i = deg - 1; i >= 0; i--) {
        const nre = pre * z.re - pim * z.im + monic[i];
        const nim = pre * z.im + pim * z.re;
        pre = nre;
        pim = nim;
      }
      // ∏_{j ≠ k} (z_k - z_j)
      let dre = 1,
        dim = 0;
      for (let j = 0; j < deg; j++) {
        if (j === k) continue;
        const ar = z.re - roots[j].re;
        const ai = z.im - roots[j].im;
        const nre = dre * ar - dim * ai;
        const nim = dre * ai + dim * ar;
        dre = nre;
        dim = nim;
      }
      const dmag2 = dre * dre + dim * dim;
      if (dmag2 < 1e-30) continue;
      const drer = (pre * dre + pim * dim) / dmag2;
      const dimr = (pim * dre - pre * dim) / dmag2;
      roots[k].re -= drer;
      roots[k].im -= dimr;
      const mag = Math.hypot(drer, dimr);
      if (mag > maxDelta) maxDelta = mag;
    }
    if (maxDelta < 1e-13) return roots;
  }
  // Best-effort: caller will check whether the imaginary parts are tight enough.
  return roots;
}

// --- Rendering -------------------------------------------------------------

function fmtNum(v) {
  const r = v.toFixed(2);
  return r === '-0.00' ? '0.00' : r;
}

function rootFactor(varHTML, root) {
  if (Math.abs(root) < 5e-3) return varHTML;
  if (root > 0) return `(${varHTML} − ${fmtNum(root)})`;
  return `(${varHTML} + ${fmtNum(-root)})`;
}

function renderTermHTML(t) {
  const factors = [];
  for (const r of t.xRoots) factors.push(rootFactor('y<sub>1</sub>', r));
  for (const r of t.yRoots) factors.push(rootFactor('y<sub>2</sub>', r));
  const product = factors.length ? factors.join('') : '1';
  if (Math.abs(t.coeff - 1) < 1e-6) return product;
  if (Math.abs(t.coeff + 1) < 1e-6) return '−' + product;
  const sign = t.coeff < 0 ? '−' : '';
  return `${sign}${fmtNum(Math.abs(t.coeff))}·${product}`;
}

export function renderDualPolyHTML(poly) {
  if (!poly || poly.terms.length === 0) return '0';
  // Sort terms for stable display: x-roots then y-roots.
  const sorted = [...poly.terms].sort((u, v) => {
    const ku = rootsKey(u.xRoots) + '|' + rootsKey(u.yRoots);
    const kv = rootsKey(v.xRoots) + '|' + rootsKey(v.yRoots);
    return ku < kv ? -1 : ku > kv ? 1 : 0;
  });
  let out = renderTermHTML(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const t = sorted[i];
    if (t.coeff < 0) {
      out += ' − ' + renderTermHTML({ ...t, coeff: -t.coeff });
    } else {
      out += ' + ' + renderTermHTML(t);
    }
  }
  return out;
}
