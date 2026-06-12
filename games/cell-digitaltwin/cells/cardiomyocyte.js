// Ventricular cardiomyocyte — Luo-Rudy phase I (LR91) action-potential model.
//
// Luo & Rudy, Circ Res 1991;68:1501-1526. Six Hodgkin-Huxley gates (m,h,j for
// the fast Na+ current; d,f for the slow inward Ca2+ current; X for the delayed
// rectifier) plus two membrane-potential-dependent instantaneous gates (Xi, K1)
// and a dynamic intracellular [Ca2+]. The membrane voltage is integrated:
//   dV/dt = -(I_ion + I_stim)/Cm,  I_ion = I_Na + I_si + I_K + I_K1 + I_Kp + I_b.
// Gates are advanced by Rush-Larsen; V and [Ca2+]i by RK4 (see engine/integrator).
//
// This is structured to grow toward ten Tusscher 2006 (explicit SR Ca2+ handling,
// more currents): currents are computed in computeFluxes() and summed in one place.

const VT_FACTOR = 1; // E uses RT/F directly (mV)

function safeExpDiv(num, den, limit) {
  // returns num/den, falling back to `limit` where den ~ 0 (removable singularity)
  return Math.abs(den) < 1e-9 ? limit : num / den;
}

export function buildModel(P) {
  const RTF = (P.physical.R * P.physical.T / P.physical.F) * 1000; // mV
  const c = P.concentrations;
  const Nao = c.Nao, Nai = c.Nai, Ko = c.Ko, Ki = c.Ki;
  const sqrtKo = Math.sqrt(Ko / 5.4);

  const E_Na = RTF * Math.log(Nao / Nai);
  const E_K = RTF * Math.log((Ko + P.IK.PRNaK * Nao) / (Ki + P.IK.PRNaK * Nai));
  const E_K1 = RTF * Math.log(Ko / Ki);

  // ---- gate rate constants (alpha, beta) -----------------------------------
  function rate_m(V) {
    const a = 0.32 * safeExpDiv(V + 47.13, 1 - Math.exp(-0.1 * (V + 47.13)), 1 / 0.1) ;
    const b = 0.08 * Math.exp(-V / 11);
    return [a, b];
  }
  function rate_h(V) {
    if (V >= -40) {
      return [0, 1 / (0.13 * (1 + Math.exp(-(V + 10.66) / 11.1)))];
    }
    const a = 0.135 * Math.exp(-(80 + V) / 6.8);
    const b = 3.56 * Math.exp(0.079 * V) + 3.1e5 * Math.exp(0.35 * V);
    return [a, b];
  }
  function rate_j(V) {
    if (V >= -40) {
      const b = 0.3 * Math.exp(-2.535e-7 * V) / (1 + Math.exp(-0.1 * (V + 32)));
      return [0, b];
    }
    const a = (-1.2714e5 * Math.exp(0.2444 * V) - 3.474e-5 * Math.exp(-0.04391 * V)) *
      (V + 37.78) / (1 + Math.exp(0.311 * (V + 79.23)));
    const b = 0.1212 * Math.exp(-0.01052 * V) / (1 + Math.exp(-0.1378 * (V + 40.14)));
    return [a, b];
  }
  function rate_d(V) {
    const a = 0.095 * Math.exp(-0.01 * (V - 5)) / (1 + Math.exp(-0.072 * (V - 5)));
    const b = 0.07 * Math.exp(-0.017 * (V + 44)) / (1 + Math.exp(0.05 * (V + 44)));
    return [a, b];
  }
  function rate_f(V) {
    const a = 0.012 * Math.exp(-0.008 * (V + 28)) / (1 + Math.exp(0.15 * (V + 28)));
    const b = 0.0065 * Math.exp(-0.02 * (V + 30)) / (1 + Math.exp(-0.2 * (V + 30)));
    return [a, b];
  }
  function rate_X(V) {
    const a = 0.0005 * Math.exp(0.083 * (V + 50)) / (1 + Math.exp(0.057 * (V + 50)));
    const b = 0.0013 * Math.exp(-0.06 * (V + 20)) / (1 + Math.exp(-0.04 * (V + 20)));
    return [a, b];
  }
  const inf = ([a, b]) => a / (a + b);
  const tau = ([a, b]) => 1 / (a + b);

  // instantaneous gates (functions of V only)
  function Xi_of(V) {
    if (V <= -100) return 1;
    const u = V + 77;
    return safeExpDiv(2.837 * (Math.exp(0.04 * u) - 1), u * Math.exp(0.04 * (V + 35)), 0.6088);
  }
  function K1inf_of(V) {
    const a = 1.02 / (1 + Math.exp(0.2385 * (V - E_K1 - 59.215)));
    const b = (0.49124 * Math.exp(0.08032 * (V - E_K1 + 5.476)) +
      Math.exp(0.06175 * (V - E_K1 - 594.31))) /
      (1 + Math.exp(-0.5143 * (V - E_K1 + 4.753)));
    return a / (a + b);
  }

  // ---- stimulus ------------------------------------------------------------
  function stimulus(t, ctrl) {
    const amp = ctrl.stimAmp != null ? ctrl.stimAmp : P.stim.amplitude;
    const dur = ctrl.stimDur != null ? ctrl.stimDur : P.stim.duration;
    if (ctrl.paced) {
      const bcl = ctrl.bcl || P.stim.bcl;
      const phase = ((t % bcl) + bcl) % bcl;
      if (phase < dur) return -amp;
    }
    if (ctrl._stimUntil != null && t < ctrl._stimUntil) return -amp;
    return 0;
  }

  // ---- currents ------------------------------------------------------------
  function computeFluxes(y, ctx) {
    const ctrl = (ctx && ctx.controls) || {};
    const V = y.V, Cai = Math.max(1e-6, y.Cai);
    const naB = 1 - (ctrl.naBlock || 0);
    const caB = 1 - (ctrl.caBlock || 0);
    const kB = 1 - (ctrl.kBlock || 0);
    const k1B = 1 - (ctrl.k1Block || 0);

    const INa = naB * P.INa.G_Na * y.m ** 3 * y.h * y.j * (V - E_Na);
    const E_si = 7.7 - 13.0287 * Math.log(Cai);
    const Isi = caB * P.Isi.G_si * y.d * y.f * (V - E_si);
    const IK = kB * (P.IK.G_K * sqrtKo) * y.X * Xi_of(V) * (V - E_K);
    const IK1 = k1B * (P.IK1.G_K1 * sqrtKo) * K1inf_of(V) * (V - E_K1);
    const Kp = 1 / (1 + Math.exp((7.488 - V) / 5.98));
    const IKp = P.IKp.G_Kp * Kp * (V - E_K1);
    const Ib = P.Ib.G_b * (V + 59.87);
    const Iion = INa + Isi + IK + IK1 + IKp + Ib;
    const Istim = stimulus(ctx ? ctx.t ?? y._t ?? 0 : 0, ctrl);

    return { Vm: V, INa, Isi, IK, IK1, IKp, Ib, Iion, Istim, E_si };
  }

  function derivatives(t, y, ctx) {
    const ctrl = (ctx && ctx.controls) || {};
    const V = y.V, Cai = Math.max(1e-6, y.Cai);

    const naB = 1 - (ctrl.naBlock || 0);
    const caB = 1 - (ctrl.caBlock || 0);
    const kB = 1 - (ctrl.kBlock || 0);
    const k1B = 1 - (ctrl.k1Block || 0);

    const INa = naB * P.INa.G_Na * y.m ** 3 * y.h * y.j * (V - E_Na);
    const E_si = 7.7 - 13.0287 * Math.log(Cai);
    const Isi = caB * P.Isi.G_si * y.d * y.f * (V - E_si);
    const IK = kB * (P.IK.G_K * sqrtKo) * y.X * Xi_of(V) * (V - E_K);
    const IK1 = k1B * (P.IK1.G_K1 * sqrtKo) * K1inf_of(V) * (V - E_K1);
    const Kp = 1 / (1 + Math.exp((7.488 - V) / 5.98));
    const IKp = P.IKp.G_Kp * Kp * (V - E_K1);
    const Ib = P.Ib.G_b * (V + 59.87);
    const Iion = INa + Isi + IK + IK1 + IKp + Ib;
    const Istim = stimulus(t, ctrl);

    const dV = -(Iion + Istim) / P.physical.Cm;
    const dCai = -P.Isi.ca_influx_k * Isi + P.Isi.ca_relax * (P.Isi.ca_rest - Cai);

    return { V: dV, Cai: dCai, m: 0, h: 0, j: 0, d: 0, f: 0, X: 0 };
  }

  // ---- initial state (resting, gates at steady state) ----------------------
  const Vrest = -84.5;
  const y0 = {
    V: Vrest,
    m: inf(rate_m(Vrest)), h: inf(rate_h(Vrest)), j: inf(rate_j(Vrest)),
    d: inf(rate_d(Vrest)), f: inf(rate_f(Vrest)), X: inf(rate_X(Vrest)),
    Cai: c.Cai0,
  };

  const gating = [
    { name: 'm', inf: (t, y) => inf(rate_m(y.V)), tau: (t, y) => tau(rate_m(y.V)) },
    { name: 'h', inf: (t, y) => inf(rate_h(y.V)), tau: (t, y) => tau(rate_h(y.V)) },
    { name: 'j', inf: (t, y) => inf(rate_j(y.V)), tau: (t, y) => tau(rate_j(y.V)) },
    { name: 'd', inf: (t, y) => inf(rate_d(y.V)), tau: (t, y) => tau(rate_d(y.V)) },
    { name: 'f', inf: (t, y) => inf(rate_f(y.V)), tau: (t, y) => tau(rate_f(y.V)) },
    { name: 'X', inf: (t, y) => inf(rate_X(y.V)), tau: (t, y) => tau(rate_X(y.V)) },
  ];

  function concentrations(y) {
    return {
      cyto: { Na: Nai, K: Ki, Ca: Math.max(1e-6, y.Cai) },
      plasma: { Na: Nao, K: Ko },
    };
  }
  function observables(y, ctx) {
    const F = computeFluxes(y, ctx || {});
    return {
      Vm: y.V, Cai_uM: Math.max(1e-6, y.Cai) * 1000,
      INa: F.INa, Isi: F.Isi, IK: F.IK, IK1: F.IK1, IKp: F.IKp, Ib: F.Ib,
      E_Na, E_K, E_K1,
    };
  }

  return {
    id: 'cardiomyocyte',
    name: 'Ventricular cardiomyocyte (Luo–Rudy I)',
    subtitle: 'Guinea-pig ventricular action potential (Luo & Rudy 1991).',
    refs: ['luo_rudy_1991', 'hodgkin_huxley_1952', 'rush_larsen_1978'],
    E_Na, E_K, E_K1, RTF,
    compartments: [
      { id: 'plasma', name: 'Extracellular', extracellular: true },
      { id: 'cyto', name: 'Cytosol', extracellular: false },
    ],
    species: SPECIES,
    transporters: TRANSPORTERS,
    y0, gating, derivatives, computeFluxes, concentrations, observables,
  };
}

export const SPECIES = [
  { id: 'Na', name: 'Sodium', symbol: 'Na⁺', z: +1, color: '#f59e0b' },
  { id: 'K', name: 'Potassium', symbol: 'K⁺', z: +1, color: '#8b5cf6' },
  { id: 'Ca', name: 'Calcium', symbol: 'Ca²⁺', z: +2, color: '#ef4444' },
];

// Currents drawn as membrane "channels" (the LR91 conductances).
export const TRANSPORTERS = [
  {
    id: 'INa', name: 'Fast Na⁺ channel (I_Na)', cls: 'channel', pos: 0.1,
    moves: ['Na'],
    equation: 'I_Na = G_Na·m³·h·j·(V − E_Na);  m,h,j Hodgkin–Huxley gates',
    refs: ['luo_rudy_1991', 'hodgkin_huxley_1952'],
    blurb: 'Carries the rapid upstroke (phase 0). Activates (m) in <1 ms, then inactivates (h, j).',
  },
  {
    id: 'Isi', name: 'Slow inward Ca²⁺ channel (I_si)', cls: 'channel', pos: 0.3,
    moves: ['Ca'],
    equation: 'I_si = G_si·d·f·(V − E_si);  E_si = 7.7 − 13.0287·ln[Ca]i',
    refs: ['luo_rudy_1991'],
    blurb: 'L-type-like Ca²⁺ current. Sustains the plateau (phase 2) and raises [Ca²⁺]i.',
  },
  {
    id: 'IK', name: 'Delayed rectifier K⁺ (I_K)', cls: 'channel', pos: 0.5,
    moves: ['K'],
    equation: 'I_K = G_K·X·Xi·(V − E_K);  G_K ∝ √([K]o/5.4)',
    refs: ['luo_rudy_1991'],
    blurb: 'Time-dependent K⁺ efflux that drives repolarisation (phase 3).',
  },
  {
    id: 'IK1', name: 'Inward rectifier K⁺ (I_K1)', cls: 'channel', pos: 0.68,
    moves: ['K'],
    equation: 'I_K1 = G_K1·K1∞(V)·(V − E_K1)',
    refs: ['luo_rudy_1991'],
    blurb: 'Holds the resting potential near E_K (phase 4) and helps terminal repolarisation.',
  },
  {
    id: 'IKp', name: 'Plateau K⁺ (I_Kp)', cls: 'channel', pos: 0.82,
    moves: ['K'],
    equation: 'I_Kp = G_Kp·Kp(V)·(V − E_K1),  Kp = 1/(1+e^{(7.488−V)/5.98})',
    refs: ['luo_rudy_1991'],
    blurb: 'Small, time-independent K⁺ current active at plateau voltages.',
  },
  {
    id: 'Ib', name: 'Background current (I_b)', cls: 'leak', pos: 0.92,
    moves: [],
    equation: 'I_b = G_b·(V + 59.87)',
    refs: ['luo_rudy_1991'],
    blurb: 'Linear background leak setting the baseline current balance.',
  },
];
