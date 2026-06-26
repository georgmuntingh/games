// Myelinated mammalian neuron — a multi-compartment Hodgkin-Huxley cable.
//
// Morphology (proximal -> distal): dendrite x N -> soma -> axon hillock ->
// alternating nodes of Ranvier / myelinated internodes (a node at each end).
// Each compartment carries its own membrane potential V{i}, gating variables,
// and intracellular [Na]i/[K]i/[Ca]i; neighbours are coupled by an axial
// (cytoplasmic) conductance (cable theory, Rall 1962). The whole vector is
// integrated by the shared engine: V and concentrations by RK4, the
// Hodgkin-Huxley gates by Rush-Larsen — no engine change required, because the
// integrator simply iterates over named state keys.
//
// Channels: fast Na+ (m^3 h), delayed-rectifier K+ (n^4) and leak (Pospischil
// et al. 2008, mammalian, with a threshold parameter V_T); transient A-type K+
// (Connor-Stevens 1971, a^3 b); high-threshold L-type Ca2+ (Pospischil, q^2 r);
// Ca2+-activated K+ (SK, instantaneous Hill in [Ca2+]i); hyperpolarization-
// activated I_h (Destexhe et al. 1993); and an electrogenic Na+/K+-ATPase
// (3 Na+ out / 2 K+ in, net +1 charge out). Node densities follow McIntyre-
// Richardson-Grill 2002; internodes are nearly passive (myelin).
//
// Units: V mV, t ms, length um, current uA, conductance mS, capacitance uF,
// concentration mM. Conductance densities (mS/cm^2) are multiplied by each
// compartment's membrane area (cm^2). dV/dt = (-I_ion - I_syn + I_inj + I_ax)/Cm.
//
// Spiking gates (m,h,n) are only integrated where the active conductances live
// (soma, hillock, nodes, dendrites); the slow sub-threshold gates (a,b,cq,cr,hf)
// only where their channels exist (soma + dendrites). State keys are precomputed
// once so the hot derivative path does no per-step string allocation.

import { hill } from '../engine/fluxes.js';

const PI = Math.PI;
const UM = 1e-4;          // 1 um in cm

// (exp(x)-1)/x with a removable singularity at x=0 -> 1. Lets the Hodgkin-
// Huxley alpha/beta "vtrap" terms stay finite at their singular voltages.
function expm1div(x) {
  return Math.abs(x) < 1e-6 ? 1 + x / 2 + x * x / 6 : (Math.exp(x) - 1) / x;
}

export function buildModel(P) {
  const RTF0 = (P.physical.R * P.physical.T / P.physical.F) * 1000; // mV at default T
  const VT = P.gates.VT;

  // ------------------------------------------------------------------ geometry
  const g = P.geometry;
  const comps = [];
  const cylArea = (d, L) => PI * (d * UM) * (L * UM);
  const cylVol = (d, L) => PI / 4 * (d * UM) ** 2 * (L * UM) * 1e-3;
  const sphArea = (d) => PI * (d * UM) ** 2;
  const sphVol = (d) => PI / 6 * (d * UM) ** 3 * 1e-3;

  for (let k = 0; k < g.n_dend; k++) {
    comps.push({ kind: 'dendrite', d: g.dend_d, L: g.dend_L,
      area: cylArea(g.dend_d, g.dend_L), vol: cylVol(g.dend_d, g.dend_L), cm: P.physical.cm });
  }
  comps.push({ kind: 'soma', d: g.soma_d, L: g.soma_d,
    area: sphArea(g.soma_d), vol: sphVol(g.soma_d), cm: P.physical.cm });
  comps.push({ kind: 'hillock', d: g.hillock_d, L: g.hillock_L,
    area: cylArea(g.hillock_d, g.hillock_L), vol: cylVol(g.hillock_d, g.hillock_L), cm: P.physical.cm });
  for (let k = 0; k < g.n_nodes; k++) {
    comps.push({ kind: 'node', d: g.axon_d, L: g.node_L,
      area: cylArea(g.axon_d, g.node_L), vol: cylVol(g.axon_d, g.node_L), cm: P.physical.cm });
    if (k < g.n_nodes - 1) {
      comps.push({ kind: 'internode', d: g.axon_d, L: g.internode_L,
        area: cylArea(g.axon_d, g.internode_L), vol: cylVol(g.axon_d, g.internode_L), cm: P.physical.cm_myelin });
    }
  }
  const N = comps.length;
  comps.forEach((c, i) => { c.i = i; c.isNode = c.kind === 'node' || c.kind === 'hillock'; });

  const somaIndex = comps.findIndex((c) => c.kind === 'soma');
  const hillockIndex = comps.findIndex((c) => c.kind === 'hillock');
  const nodeIdx = comps.filter((c) => c.kind === 'node').map((c) => c.i);
  const dendIdx = comps.filter((c) => c.kind === 'dendrite').map((c) => c.i);
  const firstNode = nodeIdx[0];
  const lastNode = nodeIdx[nodeIdx.length - 1];
  const isDend = new Array(N).fill(false); dendIdx.forEach((i) => { isDend[i] = true; });

  const Cm = comps.map((c) => c.cm * c.area);

  const gAxial = new Array(N - 1);
  for (let i = 0; i < N - 1; i++) {
    const a = comps[i], b = comps[i + 1];
    const Aa = PI / 4 * (a.d * UM) ** 2, Ab = PI / 4 * (b.d * UM) ** 2;
    const R = P.physical.Ri * (a.L * UM / 2) / Aa + P.physical.Ri * (b.L * UM / 2) / Ab;
    gAxial[i] = 1000 / R; // mS
  }

  // -------------------------------------------------- per-region conductances
  const D = P.density;
  function dens(kind) {
    switch (kind) {
      case 'dendrite': return { gNa: D.gNa_dend, gKd: D.gKd_dend, gA: D.gA, gCaL: D.gCaL, gSK: D.gSK, gH: D.gH, gLeak: D.gLeak };
      case 'soma': return { gNa: D.gNa_soma, gKd: D.gKd_soma, gA: D.gA, gCaL: D.gCaL, gSK: D.gSK, gH: D.gH, gLeak: D.gLeak };
      case 'hillock': return { gNa: D.gNa_node, gKd: D.gKd_node, gA: 0, gCaL: 0, gSK: 0, gH: 0, gLeak: D.gLeak };
      case 'node': return { gNa: D.gNa_node, gKd: D.gKd_node, gA: 0, gCaL: 0, gSK: 0, gH: 0, gLeak: D.gLeak };
      case 'internode': return { gNa: D.gNa_inter, gKd: 0, gA: 0, gCaL: 0, gSK: 0, gH: 0, gLeak: D.gLeak_inter };
      default: return { gNa: 0, gKd: 0, gA: 0, gCaL: 0, gSK: 0, gH: 0, gLeak: D.gLeak };
    }
  }
  const G = comps.map((c) => {
    const d = dens(c.kind), a = c.area;
    return { gNa: d.gNa * a, gKd: d.gKd * a, gA: d.gA * a, gCaL: d.gCaL * a,
      gSK: d.gSK * a, gH: d.gH * a, gLeak: d.gLeak * a, iPump: P.pump.iMax * a };
  });

  // -------------------------------------------------- precomputed state keys
  const K = comps.map((c, i) => ({
    V: `V${i}`, Na: `Nai${i}`, K: `Ki${i}`, Ca: `Cai${i}`,
    m: `m${i}`, h: `h${i}`, n: `n${i}`, a: `a${i}`, b: `b${i}`, cq: `cq${i}`, cr: `cr${i}`, hf: `hf${i}`,
  }));
  // which gates does each compartment actually integrate?
  const hasFast = comps.map((c, i) => G[i].gNa > 5 || G[i].gKd > 0);   // m,h,n (skip myelin)
  const hasSlow = comps.map((c, i) => G[i].gA > 0 || G[i].gCaL > 0 || G[i].gH > 0); // a,b,cq,cr,hf

  // ------------------------------------------------------------ gate kinetics
  function rates_m(V) { const am = 1.28 / expm1div(-(V - VT - 13) / 4); const bm = 1.4 / expm1div((V - VT - 40) / 5); return [am, bm]; }
  function rates_h(V) { const ah = 0.128 * Math.exp(-(V - VT - 17) / 18); const bh = 4 / (1 + Math.exp(-(V - VT - 40) / 5)); return [ah, bh]; }
  function rates_n(V) { const an = 0.16 / expm1div(-(V - VT - 15) / 5); const bn = 0.5 * Math.exp(-(V - VT - 10) / 40); return [an, bn]; }
  function rates_cq(V) { const aq = 0.209 / expm1div((-27 - V) / 3.8); const bq = 0.94 * Math.exp((-75 - V) / 17); return [aq, bq]; }
  function rates_cr(V) { const ar = 0.000457 * Math.exp((-13 - V) / 50); const br = 0.0065 / (Math.exp((-15 - V) / 28) + 1); return [ar, br]; }
  const inf = ([a, b]) => a / (a + b);
  const tau = ([a, b]) => 1 / (a + b);
  function aInf(V) { return Math.cbrt(0.0761 * Math.exp((V + 94.22) / 31.84) / (1 + Math.exp((V + 1.17) / 28.93))); }
  function aTau(V) { return 0.3632 + 1.158 / (1 + Math.exp((V + 55.96) / 20.12)); }
  function bInf(V) { return (1 / (1 + Math.exp((V + 53.3) / 14.54))) ** 4; }
  function bTau(V) { return 1.24 + 2.678 / (1 + Math.exp((V + 50) / 16.027)); }
  function hfInf(V) { return 1 / (1 + Math.exp((V + 82) / 9)); }
  function hfTau(V) { return 1 / (Math.exp(-14.59 - 0.086 * V) + Math.exp(-1.87 + 0.0701 * V)); }

  function phiOf(ctx) {
    const tempC = ctx && ctx.controls && ctx.controls.tempC != null ? ctx.controls.tempC : (P.physical.T - 273.15);
    return Math.pow(P.physical.Q10, (tempC - (P.physical.Tref - 273.15)) / 10);
  }
  function rtfOf(ctx) {
    const tempC = ctx && ctx.controls && ctx.controls.tempC != null ? ctx.controls.tempC : (P.physical.T - 273.15);
    return (P.physical.R * (tempC + 273.15) / P.physical.F) * 1000;
  }

  // ---------------------------------------------------------------- currents
  function compartmentCurrents(i, y, ctrl, RTF, Nao, Ko, Cao) {
    const k = K[i], gc = G[i];
    const V = y[k.V];
    const Nai = y[k.Na] > 1e-3 ? y[k.Na] : 1e-3;
    const Ki = y[k.K] > 1e-3 ? y[k.K] : 1e-3;
    const Cai = y[k.Ca] > 1e-7 ? y[k.Ca] : 1e-7;
    const ENa = RTF * Math.log(Nao / Nai);
    const EK = RTF * Math.log(Ko / Ki);
    const ECa = (RTF / 2) * Math.log(Cao / Cai);

    const INa = (1 - (ctrl.ttx || 0)) * gc.gNa * y[k.m] ** 3 * y[k.h] * (V - ENa);
    const IKd = (1 - (ctrl.tea || 0)) * gc.gKd * y[k.n] ** 4 * (V - EK);
    const IA = gc.gA ? (1 - (ctrl.fourAP || 0)) * gc.gA * y[k.a] ** 3 * y[k.b] * (V - EK) : 0;
    const ICaL = gc.gCaL ? (1 - (ctrl.caBlock || 0)) * gc.gCaL * y[k.cq] ** 2 * y[k.cr] * (V - ECa) : 0;
    const ISK = gc.gSK ? gc.gSK * hill(Cai, P.channels.SK_Kd, P.channels.SK_n) * (V - EK) : 0;
    const Ih = gc.gH ? gc.gH * y[k.hf] * (V - P.channels.E_h) : 0;
    const iPump = (1 - (ctrl.ouabain || 0)) * gc.iPump * hill(Nai, P.pump.Km_Nai, P.pump.n_Na) * (Ko / (Ko + P.pump.Km_Ko));

    let gLeak = gc.gLeak;
    if (comps[i].kind === 'internode' && ctrl.demyelin) gLeak = gc.gLeak * (1 + 40 * ctrl.demyelin);
    const Ileak = gLeak * (V - P.channels.E_leak);

    const Iion = INa + IKd + IA + ICaL + ISK + Ih + Ileak + iPump;
    return { V, INa, IKd, IA, ICaL, ISK, Ih, Ileak, iPump, Iion, ENa, EK, ECa, Nai, Ki, Cai };
  }

  function injCurrent(i, t, ctrl) {
    const target = ctrl.injectComp != null ? ctrl.injectComp : somaIndex;
    if (i !== target) return 0;
    const amp = (ctrl.stimAmp != null ? ctrl.stimAmp : P.stim.amplitude) * 1e-3;
    const dur = ctrl.stimDur != null ? ctrl.stimDur : P.stim.duration;
    let I = ctrl.tonic ? ctrl.tonic * 1e-3 : 0;
    let on = ctrl._stimUntil != null && t < ctrl._stimUntil;
    if (ctrl.paced) {
      const bcl = ctrl.bcl || P.stim.bcl;
      if (((t % bcl) + bcl) % bcl < dur) on = true;
    }
    if (on) I += amp;
    return I;
  }

  function synCurrent(i, V, t, ctrl) {
    if (!isDend[i]) return 0;
    let I = 0;
    const tsyn = P.synapse.tau;
    if (ctrl._epspT0 != null && t >= ctrl._epspT0) I += P.synapse.gE * 1e-6 * Math.exp(-(t - ctrl._epspT0) / tsyn) * (V - P.synapse.E_E);
    if (ctrl._ipspT0 != null && t >= ctrl._ipspT0) I += P.synapse.gI * 1e-6 * Math.exp(-(t - ctrl._ipspT0) / tsyn) * (V - P.synapse.E_I);
    return I;
  }

  // --------------------------------------------------------------- derivatives
  const conv = 1e-6 / P.physical.F;
  function derivatives(t, y, ctx) {
    const ctrl = (ctx && ctx.controls) || {};
    const RTF = rtfOf(ctx);
    const Nao = ctrl.Nao != null ? ctrl.Nao : P.bath.Nao;
    const Ko = ctrl.Ko != null ? ctrl.Ko : P.bath.Ko;
    const Cao = P.bath.Cao;
    const dy = {};
    const cur = new Array(N);
    for (let i = 0; i < N; i++) cur[i] = compartmentCurrents(i, y, ctrl, RTF, Nao, Ko, Cao);

    for (let i = 0; i < N; i++) {
      const c = cur[i], k = K[i];
      let Iax = 0;
      if (i > 0) Iax += gAxial[i - 1] * (y[K[i - 1].V] - c.V);
      if (i < N - 1) Iax += gAxial[i] * (y[K[i + 1].V] - c.V);
      const Isyn = synCurrent(i, c.V, t, ctrl);
      const Iinj = injCurrent(i, t, ctrl);
      // demyelination restores the bare-membrane capacitance the AP must charge
      // (myelin is lost), in addition to the leak increase in compartmentCurrents.
      let cmi = Cm[i];
      if (comps[i].kind === 'internode' && ctrl.demyelin) {
        cmi *= 1 + (P.physical.cm / P.physical.cm_myelin - 1) * ctrl.demyelin;
      }
      dy[k.V] = (-c.Iion - Isyn + Iinj + Iax) / cmi;

      const volEff = comps[i].vol * P.conc.buffer;
      const kf = conv / volEff;
      let dNa = -(c.INa + 3 * c.iPump + c.Ih) * kf - P.conc.kRelax * (c.Nai - P.rest.Nai);
      let dK = -(c.IKd + c.IA + c.ISK - 2 * c.iPump) * kf - P.conc.kRelax * (c.Ki - P.rest.Ki);
      const dCa = -(c.ICaL) * (kf / 2) - P.conc.caRelax * (c.Cai - P.rest.Cai);
      if (i > 0) { dNa += P.conc.dLong * (y[K[i - 1].Na] - c.Nai); dK += P.conc.dLong * (y[K[i - 1].K] - c.Ki); }
      if (i < N - 1) { dNa += P.conc.dLong * (y[K[i + 1].Na] - c.Nai); dK += P.conc.dLong * (y[K[i + 1].K] - c.Ki); }
      dy[k.Na] = dNa; dy[k.K] = dK; dy[k.Ca] = dCa;

      // gate derivatives are zero (Rush-Larsen owns the integrated ones; the
      // rest are held constant). Set only the keys that exist in y.
      dy[k.m] = 0; dy[k.h] = 0; dy[k.n] = 0;
      if (hasSlow[i]) { dy[k.a] = 0; dy[k.b] = 0; dy[k.cq] = 0; dy[k.cr] = 0; dy[k.hf] = 0; }
    }
    return dy;
  }

  // ------------------------------------------------------------- initial state
  const Vr = P.rest.Vrest;
  const y0 = {};
  for (let i = 0; i < N; i++) {
    const k = K[i];
    y0[k.V] = Vr; y0[k.Na] = P.rest.Nai; y0[k.K] = P.rest.Ki; y0[k.Ca] = P.rest.Cai;
    y0[k.m] = inf(rates_m(Vr)); y0[k.h] = inf(rates_h(Vr)); y0[k.n] = inf(rates_n(Vr));
    if (hasSlow[i]) {
      y0[k.a] = aInf(Vr); y0[k.b] = bInf(Vr);
      y0[k.cq] = inf(rates_cq(Vr)); y0[k.cr] = inf(rates_cr(Vr)); y0[k.hf] = hfInf(Vr);
    }
  }

  // ----------------------------------------------------------------- gating[]
  const gating = [];
  for (let i = 0; i < N; i++) {
    const k = K[i];
    if (hasFast[i]) {
      gating.push({ name: k.m, inf: (t, y) => inf(rates_m(y[k.V])), tau: (t, y, ctx) => tau(rates_m(y[k.V])) / phiOf(ctx) });
      gating.push({ name: k.h, inf: (t, y) => inf(rates_h(y[k.V])), tau: (t, y, ctx) => tau(rates_h(y[k.V])) / phiOf(ctx) });
      gating.push({ name: k.n, inf: (t, y) => inf(rates_n(y[k.V])), tau: (t, y, ctx) => tau(rates_n(y[k.V])) / phiOf(ctx) });
    }
    if (hasSlow[i]) {
      gating.push({ name: k.a, inf: (t, y) => aInf(y[k.V]), tau: (t, y, ctx) => aTau(y[k.V]) / phiOf(ctx) });
      gating.push({ name: k.b, inf: (t, y) => bInf(y[k.V]), tau: (t, y, ctx) => bTau(y[k.V]) / phiOf(ctx) });
      gating.push({ name: k.cq, inf: (t, y) => inf(rates_cq(y[k.V])), tau: (t, y, ctx) => tau(rates_cq(y[k.V])) / phiOf(ctx) });
      gating.push({ name: k.cr, inf: (t, y) => inf(rates_cr(y[k.V])), tau: (t, y, ctx) => tau(rates_cr(y[k.V])) / phiOf(ctx) });
      gating.push({ name: k.hf, inf: (t, y) => hfInf(y[k.V]), tau: (t, y, ctx) => hfTau(y[k.V]) / phiOf(ctx) });
    }
  }

  // -------------------------------------------------------------- view helpers
  function computeFluxes(y, ctx) {
    const ctrl = (ctx && ctx.controls) || {};
    const RTF = rtfOf(ctx);
    const Nao = ctrl.Nao != null ? ctrl.Nao : P.bath.Nao;
    const Ko = ctrl.Ko != null ? ctrl.Ko : P.bath.Ko;
    const Cao = P.bath.Cao;
    const out = { V: [], INa: [], IKd: [], IA: [], ICaL: [], ISK: [], Ih: [], Ileak: [], iPump: [], Nai: [], Ki: [], Cai: [], ENa: [], EK: [] };
    let Vmax = -1e9, VmaxIdx = 0;
    for (let i = 0; i < N; i++) {
      const c = compartmentCurrents(i, y, ctrl, RTF, Nao, Ko, Cao);
      out.V.push(c.V); out.INa.push(c.INa); out.IKd.push(c.IKd); out.IA.push(c.IA);
      out.ICaL.push(c.ICaL); out.ISK.push(c.ISK); out.Ih.push(c.Ih); out.Ileak.push(c.Ileak);
      out.iPump.push(c.iPump); out.Nai.push(c.Nai); out.Ki.push(c.Ki); out.Cai.push(c.Cai);
      out.ENa.push(c.ENa); out.EK.push(c.EK);
      if (c.V > Vmax) { Vmax = c.V; VmaxIdx = i; }
    }
    out.Vmax = Vmax; out.VmaxIdx = VmaxIdx; out.focus = somaIndex;
    return out;
  }

  function concentrations(y) {
    const k = K[somaIndex];
    return {
      cyto: { Na: y[k.Na], K: y[k.K], Ca: Math.max(1e-7, y[k.Ca]) },
      plasma: { Na: P.bath.Nao, K: P.bath.Ko, Ca: P.bath.Cao },
    };
  }

  function observables(y, ctx) {
    const ctrl = (ctx && ctx.controls) || {};
    const RTF = rtfOf(ctx);
    const Nao = ctrl.Nao != null ? ctrl.Nao : P.bath.Nao;
    const Ko = ctrl.Ko != null ? ctrl.Ko : P.bath.Ko;
    let Vmax = -1e9;
    for (let i = 0; i < N; i++) if (y[K[i].V] > Vmax) Vmax = y[K[i].V];
    const s = somaIndex, k = K[s];
    const c = compartmentCurrents(s, y, ctrl, RTF, Nao, Ko, P.bath.Cao);
    return {
      Vm: y[k.V], Vsoma: y[k.V], Vlast: y[K[lastNode].V], Vmax,
      Cai_uM: Math.max(1e-7, y[k.Ca]) * 1000, Nai: y[k.Na], Ki: y[k.K],
      INa: c.INa, IKd: c.IKd, ISK: c.ISK, Ih: c.Ih, iPump: c.iPump, ENa: c.ENa, EK: c.EK,
    };
  }

  return {
    id: 'neuron',
    name: 'Myelinated neuron',
    subtitle: 'Multi-compartment Hodgkin-Huxley cable with saltatory conduction.',
    refs: ['hodgkin_huxley_1952', 'pospischil_2008', 'mcintyre_richardson_grill_2002',
      'connor_stevens_1971', 'destexhe_babloyantz_1993', 'rall_1962', 'rush_larsen_1978'],
    N, comps, somaIndex, hillockIndex, dendIdx, nodeIdx, firstNode, lastNode, gAxial,
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

// Membrane "channels" drawn as glyphs (clustered at a node + the soma).
export const TRANSPORTERS = [
  {
    id: 'INa', name: 'Fast Na⁺ channel (Naᵥ)', cls: 'channel', pos: 0.08, moves: ['Na'],
    equation: 'I_Na = g_Na·m³·h·(V − E_Na);  m,h Hodgkin–Huxley gates',
    refs: ['hodgkin_huxley_1952', 'pospischil_2008'],
    blurb: 'Voltage-gated Na⁺. Dense at the hillock and nodes of Ranvier; drives the all-or-none upstroke.',
  },
  {
    id: 'IKd', name: 'Delayed-rectifier K⁺ (Kᵥ)', cls: 'channel', pos: 0.22, moves: ['K'],
    equation: 'I_Kd = g_Kd·n⁴·(V − E_K)',
    refs: ['hodgkin_huxley_1952', 'pospischil_2008'],
    blurb: 'Repolarising K⁺ current that ends each spike and sets the refractory period.',
  },
  {
    id: 'IA', name: 'A-type K⁺ (transient)', cls: 'channel', pos: 0.36, moves: ['K'],
    equation: 'I_A = g_A·a³·b·(V − E_K);  fast a, slow b',
    refs: ['connor_stevens_1971'],
    blurb: 'Transient outward K⁺ that delays firing and lengthens the inter-spike interval.',
  },
  {
    id: 'ICaL', name: 'L-type Ca²⁺ channel', cls: 'channel', pos: 0.5, moves: ['Ca'],
    equation: 'I_CaL = g_CaL·q²·r·(V − E_Ca)',
    refs: ['pospischil_2008'],
    blurb: 'High-threshold Ca²⁺ entry during spikes; raises [Ca²⁺]i to recruit the SK current.',
  },
  {
    id: 'ISK', name: 'Ca²⁺-activated K⁺ (SK)', cls: 'channel', pos: 0.64, moves: ['K'], gatedBy: 'Ca',
    equation: 'I_SK = g_SK·h([Ca]i;K_Ca,n)·(V − E_K)',
    refs: ['hoffman_2003'],
    blurb: 'Opened by intracellular Ca²⁺ build-up; produces spike-frequency adaptation.',
  },
  {
    id: 'Ih', name: 'H-current (HCN)', cls: 'channel', pos: 0.78, moves: ['Na', 'K'],
    equation: 'I_h = g_h·q·(V − E_h),  E_h ≈ −43 mV',
    refs: ['destexhe_babloyantz_1993'],
    blurb: 'Hyperpolarisation-activated mixed-cation current; gives voltage sag and rebound firing.',
  },
  {
    id: 'INaK', name: 'Na⁺/K⁺-ATPase', cls: 'pump', pos: 0.9, moves: ['Na', 'K'], drives: 'ATP',
    equation: 'i_NaK = i_max·h(Na_i)·MM(K_o);  3 Na⁺ out / 2 K⁺ in (electrogenic)',
    refs: ['post_1972', 'mcintyre_richardson_grill_2002'],
    blurb: 'Rebuilds the Na⁺/K⁺ gradients after spikes; electrogenic (net outward). Blocked by ouabain → run-down.',
  },
  {
    id: 'Ileak', name: 'Leak', cls: 'leak', pos: 0.15, moves: [],
    equation: 'I_leak = g_leak·(V − E_leak)',
    refs: ['mcintyre_richardson_grill_2002'],
    blurb: 'Passive background conductance setting the resting potential (very low under myelin).',
  },
];
