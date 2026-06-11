// Reusable, literature-grounded flux and potential laws.
//
// Sign / unit conventions used throughout the engine:
//   * Concentrations are in mM.
//   * "Efflux" (outward, cytosol -> extracellular) is POSITIVE.
//   * VT = RT/F is the thermal voltage in mV.
//   * Electrodiffusive fluxes use the Goldman-Hodgkin-Katz (GHK) constant-field
//     equation. At the Nernst potential of a species its GHK flux is exactly 0,
//     which the test-suite verifies (test-fluxes.js).
//
// References (see data/references.json):
//   goldman_1943, hodgkin_huxley_1952, post_1972, garrahan_glynn_1967,
//   tiffert_lew_2001, hoffman_2003, lowe_walmsley_1986, jennings_1989.

/** Thermal voltage RT/F in mV. */
export function thermalVoltagemV(R, T, F) {
  return (R * T / F) * 1000; // V -> mV
}

/**
 * Nernst equilibrium potential (mV) for an ion of valence z.
 * E = (VT / z) * ln(co / ci).
 */
export function nernst(z, ci, co, VT) {
  return (VT / z) * Math.log(co / ci);
}

/**
 * GHK constant-field flux for one permeant ion (Goldman 1943).
 * Returns OUTWARD (efflux) flux in the same units as `g` (an effective
 * permeability with units mM/min per unit driving term).
 *
 *   J_efflux = g * u * (ci - co * e^{-u}) / (1 - e^{-u}),  u = z * Vm / VT
 *
 * Equals g*(ci - co) at Vm = 0, and 0 at Vm = Nernst(z, ci, co).
 */
export function ghkEfflux(g, z, Vm, ci, co, VT) {
  const u = (z * Vm) / VT;
  if (Math.abs(u) < 1e-6) {
    // Limit u -> 0 : J -> g * (ci - co).
    return g * (ci - co);
  }
  const e = Math.exp(-u);
  return g * u * (ci - co * e) / (1 - e);
}

/** Inward (extracellular -> cytosol) GHK flux. Convenience sign flip. */
export function ghkInflux(g, z, Vm, ci, co, VT) {
  return -ghkEfflux(g, z, Vm, ci, co, VT);
}

/** Michaelis-Menten saturation factor S / (Km + S), in [0, 1). */
export function michaelisMenten(S, Km) {
  return S / (Km + S);
}

/** Hill activation S^n / (K^n + S^n), in [0, 1). */
export function hill(S, K, n) {
  const sn = Math.pow(S, n);
  return sn / (Math.pow(K, n) + sn);
}

/**
 * Na+/K+-ATPase cycling rate (cycles per minute, per L_cell).
 * 3 Na+ out / 2 K+ in / 1 ATP per cycle (Garrahan & Glynn 1967; Post 1972).
 * Activated by internal Na+ (Hill nNa), external K+ (Hill nK) and ATP (MM).
 */
export function nakPumpCycleRate(p, Nai, Ko, ATP) {
  const aNa = hill(Nai, p.Km_Nai, p.n_Na);
  const aK = hill(Ko, p.Km_Ko, p.n_K);
  const aATP = michaelisMenten(ATP, p.Km_ATP);
  // p.Imax is the maximum Na+ efflux; divide by stoich to get cycle rate.
  return (p.Imax / p.stoich_Na) * aNa * aK * aATP;
}

/**
 * PMCA Ca2+-ATPase extrusion (mM/min, per L_cell). Electroneutral here
 * (Ca2+ out countered by 2 H+ in); high-affinity, keeps [Ca2+]i ~ 50 nM.
 * Tiffert & Lew 2001.
 */
export function pmcaRate(p, Cai, ATP) {
  return p.Imax * hill(Cai, p.Km_Cai, p.n_Ca) * michaelisMenten(ATP, 0.05);
}

/**
 * Gardos (KCa3.1) channel effective K+ permeability as a function of [Ca2+]i.
 * Hoffman et al. 2003: sub-micromolar Ca2+ activation, Hill form.
 * Returns an effective permeability (same units as a leak g).
 */
export function gardosPermeability(p, Cai) {
  return p.g_max * hill(Cai, p.K0p5_Ca, p.n_Ca);
}

/**
 * GLUT1 facilitated diffusion (net inward, mM/min). Symmetric carrier:
 * reversible Michaelis-Menten, zero net flux when [glc]i = [glc]o.
 * Lowe & Walmsley 1986.
 */
export function glut1Flux(p, glcIn, glcOut) {
  const Km = p.Km;
  return p.Vmax * (glcOut - glcIn) / (Km + glcOut + glcIn);
}

/**
 * Band 3 / AE1 electroneutral Cl-/HCO3- exchange (Jennings 1989).
 * Returns net Cl- INFLUX (mM/min); HCO3- moves equal and opposite.
 * Drives the system toward [Cl]o[HCO3]i = [Cl]i[HCO3]o.
 */
export function band3ClInflux(p, Cli, Clo, HCO3i, HCO3o) {
  // Normalised by the summed concentrations so k_exchange has units 1/min and
  // the flux stays well-scaled (mM/min). Net zero when [Cl]o[HCO3]i=[Cl]i[HCO3]o.
  const denom = Clo + Cli + HCO3o + HCO3i;
  return p.k_exchange * (Clo * HCO3i - Cli * HCO3o) / denom;
}

/**
 * Find the quasi-steady membrane potential (mV) at which the net charge
 * flux across the membrane is zero, by bisection. `netChargeInflux(Vm)`
 * must be monotonically decreasing in Vm (true for GHK cation/anion sums).
 */
export function solveSteadyVm(netChargeInflux, lo = -150, hi = 80) {
  let fLo = netChargeInflux(lo);
  let fHi = netChargeInflux(hi);
  // Expand if the root is not bracketed (should not happen physiologically).
  if (fLo * fHi > 0) return fLo > 0 ? hi : lo;
  for (let i = 0; i < 60; i++) {
    const mid = 0.5 * (lo + hi);
    const fMid = netChargeInflux(mid);
    if (fMid > 0) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
      fHi = fMid;
    }
  }
  return 0.5 * (lo + hi);
}

/**
 * Goldman-Hodgkin-Katz voltage equation (monovalent Na+, K+, Cl-), mV.
 * Closed-form resting potential for permeabilities pNa, pK, pCl.
 */
export function goldmanVm(VT, pNa, pK, pCl, Nai, Nao, Ki, Ko, Cli, Clo) {
  const num = pNa * Nao + pK * Ko + pCl * Cli;
  const den = pNa * Nai + pK * Ki + pCl * Clo;
  return VT * Math.log(num / den);
}
