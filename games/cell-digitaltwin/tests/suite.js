// Shared test suite for the Cell Digital Twin engine + cell models.
// Runnable in the browser (tests/index.html) and Node (run-tests.mjs).
// `runAll({ erythrocyte, cardiomyocyte })` returns [{ name, pass, detail }].

import {
  thermalVoltagemV, ghkEfflux, nernst, solveSteadyVm, goldmanVm,
} from '../engine/fluxes.js';
import { resolveParams, totalAmount } from '../engine/model.js';
import { Simulator } from '../engine/integrator.js';
import { buildModel as buildErythrocyte } from '../cells/erythrocyte.js';
import { buildModel as buildCardiomyocyte } from '../cells/cardiomyocyte.js';
import { buildModel as buildNeuron } from '../cells/neuron.js';
import { buildModel as buildMitochondrion } from '../cells/mitochondrion.js';

const tests = [];
const test = (name, cell, fn) => tests.push({ name, cell, fn });
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const inRange = (x, lo, hi) => x >= lo && x <= hi;

// ===========================================================================
// Engine: pure flux-law identities
// ===========================================================================
test('GHK flux is zero at the Nernst potential', 'erythrocyte', () => {
  const VT = thermalVoltagemV(8.314, 310, 96485);
  for (const [z, ci, co] of [[1, 10, 140], [1, 140, 5], [-1, 75, 116], [2, 5e-5, 1.2]]) {
    const E = nernst(z, ci, co, VT);
    const J = ghkEfflux(1, z, E, ci, co, VT);
    if (!approx(J, 0, 1e-9)) return { pass: false, detail: `z=${z}: J(E)=${J.toExponential(2)} ≠ 0` };
  }
  return { pass: true, detail: 'J(E_Nernst)=0 for Na,K,Cl,Ca' };
});

test('GHK flux at Vm=0 equals g·(ci−co)', 'erythrocyte', () => {
  const VT = thermalVoltagemV(8.314, 310, 96485);
  const J = ghkEfflux(2.5, 1, 0, 10, 140, VT);
  return { pass: approx(J, 2.5 * (10 - 140), 1e-6), detail: `J(0)=${J.toFixed(3)} vs ${2.5 * (10 - 140)}` };
});

test('solveSteadyVm matches the closed-form Goldman voltage', 'erythrocyte', () => {
  const VT = thermalVoltagemV(8.314, 310, 96485);
  const pNa = 0.04, pK = 0.05, pCl = 1.0;
  const Nai = 10, Nao = 140, Ki = 140, Ko = 5, Cli = 75, Clo = 116;
  const Vg = goldmanVm(VT, pNa, pK, pCl, Nai, Nao, Ki, Ko, Cli, Clo);
  const f = (Vm) => {
    const JnaE = ghkEfflux(pNa, +1, Vm, Nai, Nao, VT);
    const JkE = ghkEfflux(pK, +1, Vm, Ki, Ko, VT);
    const JclE = ghkEfflux(pCl, -1, Vm, Cli, Clo, VT);
    return -(JnaE + JkE - JclE);
  };
  const Vs = solveSteadyVm(f, -150, 80);
  return { pass: approx(Vs, Vg, 0.05), detail: `solve=${Vs.toFixed(3)} mV, Goldman=${Vg.toFixed(3)} mV` };
});

test('Rush-Larsen integrates a gating variable to its analytic solution', 'erythrocyte', () => {
  const minf = 0.8, tau = 3.0;
  const gateModel = {
    y0: { m: 0.1 }, gating: [{ name: 'm', inf: () => minf, tau: () => tau }],
    derivatives: () => ({ m: 0 }),
  };
  const sim = new Simulator(gateModel, {});
  const dt = 0.5, T = 12;
  for (let t = 0; t < T; t += dt) sim.step(dt);
  const analytic = minf - (minf - 0.1) * Math.exp(-sim.t / tau);
  return { pass: approx(sim.y.m, analytic, 1e-3), detail: `m=${sim.y.m.toFixed(5)} vs analytic ${analytic.toFixed(5)}` };
});

// ===========================================================================
// Erythrocyte
// ===========================================================================
function buildRBC(params) {
  const { values: P } = resolveParams(params);
  const model = buildErythrocyte(P); model.dtMax = 0.02;
  return model;
}

test('Ion mass is conserved over a 2 h run (drift < 1e-6)', 'erythrocyte', (params) => {
  const model = buildRBC(params);
  const sim = new Simulator(model, { controls: {} });
  const t0 = {};
  for (const [sp, keys] of Object.entries(model.conservedSpecies)) t0[sp] = totalAmount(sim.y, keys);
  for (let m = 0; m < 120; m += 0.02) sim.advance(0.02, 0.02);
  let maxDrift = 0, worst = '';
  for (const [sp, keys] of Object.entries(model.conservedSpecies)) {
    const now = totalAmount(sim.y, keys);
    const d = Math.abs(now - t0[sp]) / Math.max(1e-9, Math.abs(t0[sp]));
    if (d > maxDrift) { maxDrift = d; worst = sp; }
  }
  return { pass: maxDrift < 1e-6, detail: `max ion drift ${maxDrift.toExponential(2)} (${worst})` };
});

test('Net electric charge is conserved over a 2 h run', 'erythrocyte', (params) => {
  const { values: P } = resolveParams(params);
  const model = buildErythrocyte(P); model.dtMax = 0.02;
  const sim = new Simulator(model, { controls: {} });
  const charge = (y) =>
    (y.Na_i + y.K_i - y.Cl_i + 2 * y.Ca_i - y.HCO3_i + model.zX * y.X_i) +
    (y.Na_o + y.K_o - y.Cl_o + 2 * y.Ca_o - y.HCO3_o);
  const q0 = charge(sim.y);
  for (let m = 0; m < 120; m += 0.02) sim.advance(0.02, 0.02);
  const drift = Math.abs(charge(sim.y) - q0);
  return { pass: drift < 1e-6, detail: `charge drift ${drift.toExponential(2)} (q0=${q0.toExponential(2)})` };
});

test('Reaches a physiological resting steady state (t = 60 min)', 'erythrocyte', (params) => {
  const model = buildRBC(params);
  const sim = new Simulator(model, { controls: {} });
  for (let m = 0; m < 60; m += 0.02) sim.advance(0.02, 0.02);
  const C = model.concentrations(sim.y);
  const O = model.observables(sim.y, { controls: {} });
  const checks = [
    ['Vm', O.Vm, -14, -8, 'mV'], ['Na_i', C.cyto.Na, 8, 13, 'mM'],
    ['K_i', C.cyto.K, 133, 148, 'mM'], ['Cl_i', C.cyto.Cl, 68, 82, 'mM'],
    ['Ca_i', C.cyto.Ca * 1e6, 20, 80, 'nM'], ['ATP', O.ATP, 1.4, 2.6, 'mM'],
    ['BPG', O.BPG, 2, 6, 'mM'], ['volume', O.volume, 0.9, 1.05, '×'],
  ];
  const bad = checks.filter(([, v, lo, hi]) => !inRange(v, lo, hi));
  const detail = checks.map(([n, v, , , u]) => `${n}=${v.toFixed(n === 'Ca_i' ? 0 : 1)}${u}`).join(' ');
  return { pass: bad.length === 0, detail: bad.length ? `out of range: ${bad.map((b) => b[0]).join(',')} | ${detail}` : detail };
});

test('Ouabain (pump block) raises Na_i and lowers K_i', 'erythrocyte', (params) => {
  const model = buildRBC(params);
  const sim = new Simulator(model, { controls: { ouabain: 1 } });
  const C0 = model.concentrations(sim.y);
  for (let m = 0; m < 600; m += 0.02) sim.advance(0.02, 0.02);
  const C = model.concentrations(sim.y);
  return {
    pass: C.cyto.Na > C0.cyto.Na + 3 && C.cyto.K < C0.cyto.K - 3,
    detail: `Na ${C0.cyto.Na.toFixed(1)}→${C.cyto.Na.toFixed(1)}, K ${C0.cyto.K.toFixed(1)}→${C.cyto.K.toFixed(1)}`,
  };
});

test('Hypotonic shock swells, hypertonic shrinks', 'erythrocyte', (params) => {
  const model = buildRBC(params);
  const run = (tonicity) => {
    const s = new Simulator(model, { controls: { tonicity } });
    for (let m = 0; m < 20; m += 0.02) s.advance(0.02, 0.02);
    return s.y.v;
  };
  const lo = run(0.6), hi = run(1.5);
  return { pass: lo > 1.1 && hi < 0.9, detail: `hypotonic v=${lo.toFixed(2)} (>1.1), hypertonic v=${hi.toFixed(2)} (<0.9)` };
});

test('Blocking PMCA raises intracellular Ca²⁺ into the µM range', 'erythrocyte', (params) => {
  const model = buildRBC(params);
  const sim = new Simulator(model, { controls: { pmcaBlock: 1 } });
  for (let m = 0; m < 30; m += 0.02) sim.advance(0.02, 0.02);
  const Ca = model.concentrations(sim.y).cyto.Ca * 1e6;
  return { pass: Ca > 1000, detail: `[Ca²⁺]i = ${Ca.toFixed(0)} nM after PMCA block` };
});

// ===========================================================================
// Cardiomyocyte (Luo–Rudy I)
// ===========================================================================
function buildLR(params) {
  const { values: P } = resolveParams(params);
  const model = buildCardiomyocyte(P); model.dtMax = 0.01;
  return model;
}
function runAP(model, controls, T = 400) {
  const sim = new Simulator(model, { controls: { ...controls } });
  const dt = 0.01; const trace = [];
  for (let t = 0; t < T; t += dt) { sim.advance(dt, dt); trace.push([sim.t, sim.y.V]); }
  return { sim, trace };
}
function apd90(trace) {
  const Vs = trace.map((p) => p[1]);
  const Vmax = Math.max(...Vs), Vmin = Math.min(...Vs);
  const thr = Vmin + 0.1 * (Vmax - Vmin);
  const tPeak = trace.find((p) => p[1] === Vmax)[0];
  let tUp = null, tRep = null;
  for (const [t, V] of trace) {
    if (tUp == null && V > thr) tUp = t;
    if (tUp != null && t > tPeak && V < thr && tRep == null) tRep = t;
  }
  return { Vmax, Vmin, apd: tUp != null && tRep != null ? tRep - tUp : Infinity };
}

test('Rests near −85 mV with no stimulus', 'cardiomyocyte', (params) => {
  const model = buildLR(params);
  const sim = new Simulator(model, { controls: { paced: false } });
  for (let t = 0; t < 100; t += 0.01) sim.advance(0.01, 0.01);
  return { pass: inRange(sim.y.V, -87, -82), detail: `resting V = ${sim.y.V.toFixed(2)} mV` };
});

test('A stimulus fires an all-or-none action potential', 'cardiomyocyte', (params) => {
  const model = buildLR(params);
  const { trace } = runAP(model, { paced: false, _stimUntil: 0.5 }, 400);
  const m = apd90(trace);
  return {
    pass: m.Vmax > 20 && m.Vmin < -80,
    detail: `peak ${m.Vmax.toFixed(1)} mV, returns to ${m.Vmin.toFixed(1)} mV`,
  };
});

test('Action-potential duration (APD90) is physiological', 'cardiomyocyte', (params) => {
  const model = buildLR(params);
  const { trace } = runAP(model, { paced: false, _stimUntil: 0.5 }, 500);
  const m = apd90(trace);
  return { pass: inRange(m.apd, 250, 450), detail: `APD90 = ${m.apd.toFixed(0)} ms (peak ${m.Vmax.toFixed(0)} mV)` };
});

test('Blocking I_Na abolishes the upstroke', 'cardiomyocyte', (params) => {
  const model = buildLR(params);
  const { trace } = runAP(model, { paced: false, _stimUntil: 0.5, naBlock: 1 }, 60);
  const Vmax = Math.max(...trace.map((p) => p[1]));
  return { pass: Vmax < -20, detail: `peak with I_Na blocked = ${Vmax.toFixed(1)} mV (no regenerative upstroke)` };
});

test('Blocking I_K prolongs the action potential (long-QT)', 'cardiomyocyte', (params) => {
  const model = buildLR(params);
  const ctrl = buildLR(params);
  const base = apd90(runAP(model, { paced: false, _stimUntil: 0.5 }, 600).trace).apd;
  const blocked = apd90(runAP(ctrl, { paced: false, _stimUntil: 0.5, kBlock: 1 }, 900).trace).apd;
  const blockedStr = isFinite(blocked) ? blocked.toFixed(0) : '>900';
  return { pass: blocked > base + 100, detail: `APD90 ${base.toFixed(0)} → ${blockedStr} ms with I_K blocked` };
});

test('Pacing stays numerically stable over several beats', 'cardiomyocyte', (params) => {
  const model = buildLR(params);
  const sim = new Simulator(model, { controls: { paced: true, bcl: 500 } });
  let okFinite = true, vlo = 1e9, vhi = -1e9;
  for (let t = 0; t < 2000; t += 0.01) {
    sim.advance(0.01, 0.01);
    for (const k of Object.keys(sim.y)) if (!isFinite(sim.y[k])) okFinite = false;
    vlo = Math.min(vlo, sim.y.V); vhi = Math.max(vhi, sim.y.V);
  }
  return { pass: okFinite && vhi > 20 && vlo > -95 && vlo < -80, detail: `4 beats: V ∈ [${vlo.toFixed(0)}, ${vhi.toFixed(0)}] mV, all finite=${okFinite}` };
});

// ===========================================================================
// Neuron (myelinated multi-compartment Hodgkin-Huxley cable)
// ===========================================================================
const NDT = 0.001;
function buildNeuronModel(params) {
  const { values: P } = resolveParams(params);
  const m = buildNeuron(P); m.dtMax = NDT;
  return m;
}
// Run `T` ms with the given controls; returns the simulator and per-compartment
// peak voltage + first threshold-crossing time (for a chosen index).
function runNeuron(model, controls, T, watch = []) {
  const ctx = { controls: { ...controls }, t: 0 };
  const sim = new Simulator(model, ctx);
  const peak = {}, cross = {};
  watch.forEach((i) => { peak[i] = -1e9; cross[i] = null; });
  const n = Math.round(T / NDT);
  for (let s = 0; s < n; s++) {
    sim.advance(NDT, NDT); ctx.t = sim.t;
    for (const i of watch) {
      const v = sim.y[`V${i}`];
      if (v > peak[i]) peak[i] = v;
      if (cross[i] == null && v > -10) cross[i] = sim.t;
    }
  }
  return { sim, ctx, peak, cross };
}

test('Resting potential is in the physiological range at every compartment', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const { sim } = runNeuron(m, {}, 40);
  let lo = 1e9, hi = -1e9, finite = true;
  for (let i = 0; i < m.N; i++) { const v = sim.y[`V${i}`]; if (!isFinite(v)) finite = false; lo = Math.min(lo, v); hi = Math.max(hi, v); }
  return { pass: finite && lo > -75 && hi < -60, detail: `V ∈ [${lo.toFixed(1)}, ${hi.toFixed(1)}] mV across ${m.N} compartments, finite=${finite}` };
});

test('Action potential is all-or-none (threshold)', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const H = m.hillockIndex, FN = m.firstNode;
  const sub = runNeuron(m, { injectComp: H, stimAmp: 0.3, stimDur: 1, _stimUntil: 1.5 }, 14, [FN]).peak[FN];
  const sup = runNeuron(m, { injectComp: H, stimAmp: 1.5, stimDur: 1, _stimUntil: 1.5 }, 14, [FN]).peak[FN];
  return { pass: sub < -20 && sup > 20, detail: `peak node Vm: sub-threshold ${sub.toFixed(0)} mV (no spike), supra-threshold ${sup.toFixed(0)} mV` };
});

test('Action potential propagates distally down the axon', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const H = m.hillockIndex, FN = m.firstNode, LN = m.lastNode;
  const { cross } = runNeuron(m, { injectComp: H, stimAmp: 1.5, stimDur: 1, _stimUntil: 1.5 }, 16, [FN, LN]);
  const ok = cross[FN] != null && cross[LN] != null && cross[LN] > cross[FN];
  let len = 0; for (let i = FN; i < LN; i++) len += (m.comps[i].L + m.comps[i + 1].L) / 2;
  const cv = ok ? (len / 1000) / (cross[LN] - cross[FN]) : 0;
  return { pass: ok && cv > 0.3 && cv < 50, detail: `node1 at ${cross[FN]?.toFixed(2)} ms, last node at ${cross[LN]?.toFixed(2)} ms → CV ≈ ${cv.toFixed(1)} m/s` };
});

test('Demyelination slows conduction', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const H = m.hillockIndex, FN = m.firstNode, LN = m.lastNode;
  const a = runNeuron(m, { injectComp: H, stimAmp: 1.5, stimDur: 1, _stimUntil: 1.5 }, 18, [FN, LN]).cross;
  const b = runNeuron(m, { injectComp: H, stimAmp: 1.5, stimDur: 1, _stimUntil: 1.5, demyelin: 1 }, 18, [FN, LN]).cross;
  const dA = a[FN] != null && a[LN] != null ? a[LN] - a[FN] : null;
  const dB = b[FN] != null && b[LN] != null ? b[LN] - b[FN] : null;
  const pass = dA != null && dB != null && dB > dA * 1.5;
  return { pass, detail: `node1→last delay: myelinated ${dA?.toFixed(2)} ms, demyelinated ${dB?.toFixed(2)} ms` };
});

test('Refractory period limits the maximum firing rate', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const H = m.hillockIndex, FN = m.firstNode;
  // Pace at a high vs low rate; a refractory axon cannot follow too-fast input.
  const followRatio = (bcl, T) => {
    const ctx = { controls: { injectComp: H, stimAmp: 2.5, stimDur: 0.8, paced: true, bcl }, t: 0 };
    const sim = new Simulator(m, ctx); let c = 0, w = false;
    const n = Math.round(T / NDT);
    for (let s = 0; s < n; s++) {
      sim.advance(NDT, NDT); ctx.t = sim.t;
      const v = sim.y[`V${FN}`]; if (v > 10 && !w) { c++; w = true; } if (v < -30) w = false;
    }
    return c / Math.floor(T / bcl);
  };
  const fast = followRatio(2, 60), slow = followRatio(15, 60);
  return { pass: fast < 0.6 && slow > 0.9, detail: `spikes per stimulus: 500 Hz pacing ${fast.toFixed(2)} (drops spikes — refractory), 67 Hz pacing ${slow.toFixed(2)} (follows 1:1)` };
});

test('Lower temperature broadens the spike (Q10)', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const H = m.hillockIndex, FN = m.firstNode;
  const width = (tc) => {
    const ctx = { controls: { injectComp: H, stimAmp: 1.5, stimDur: 1, _stimUntil: 1.5, tempC: tc }, t: 0 };
    const sim = new Simulator(m, ctx); let w = 0;
    const n = Math.round(16 / NDT);
    for (let s = 0; s < n; s++) { sim.advance(NDT, NDT); ctx.t = sim.t; if (sim.y[`V${FN}`] > -20) w += NDT; }
    return w;
  };
  const cold = width(25), warm = width(37);
  return { pass: cold > warm * 1.3, detail: `spike width >−20 mV: 25 °C ${cold.toFixed(2)} ms vs 37 °C ${warm.toFixed(2)} ms` };
});

test('Intracellular ion concentrations stay bounded at rest', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const ctx = { controls: {}, t: 0 };
  const sim = new Simulator(m, ctx);
  const Na0 = sim.y[`Nai${m.somaIndex}`], K0 = sim.y[`Ki${m.somaIndex}`];
  const n = Math.round(60 / NDT);
  for (let s = 0; s < n; s++) { sim.advance(NDT, NDT); ctx.t = sim.t; }
  let dNa = 0, dK = 0;
  for (let i = 0; i < m.N; i++) { dNa = Math.max(dNa, Math.abs(sim.y[`Nai${i}`] - Na0)); dK = Math.max(dK, Math.abs(sim.y[`Ki${i}`] - K0)); }
  return { pass: dNa < 1 && dK < 1, detail: `max drift over 60 ms: Δ[Na]i ${dNa.toFixed(3)} mM, Δ[K]i ${dK.toFixed(3)} mM` };
});

test('Blocking Na⁺ (TTX) abolishes the propagating spike', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const H = m.hillockIndex, LN = m.lastNode;
  // With Na+ blocked the distal node sees no action potential (a real spike
  // would bring it to ~+60 mV); only weak electrotonic spread remains nearby.
  const peak = runNeuron(m, { injectComp: H, stimAmp: 1.5, stimDur: 1, _stimUntil: 1.5, ttx: 1 }, 14, [LN]).peak[LN];
  return { pass: peak < -10, detail: `peak at the distal node with TTX = ${peak.toFixed(0)} mV (no propagating action potential)` };
});

test('Ouabain (pump block) depolarises the cell', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const S = m.somaIndex;
  const ctrl = runNeuron(m, { injectComp: S, tonic: 0.7 }, 80).sim.y[`V${S}`];
  const oua = runNeuron(m, { injectComp: S, tonic: 0.7, ouabain: 1 }, 80).sim.y[`V${S}`];
  return { pass: oua > ctrl + 1.5, detail: `soma Vm after firing: pump on ${ctrl.toFixed(1)} mV, ouabain ${oua.toFixed(1)} mV (depolarised)` };
});

test('Pacing stays numerically stable over many spikes', 'neuron', (params) => {
  const m = buildNeuronModel(params);
  const ctx = { controls: { injectComp: m.hillockIndex, stimAmp: 2, stimDur: 0.6, paced: true, bcl: 12 }, t: 0 };
  const sim = new Simulator(m, ctx);
  let finite = true, vlo = 1e9, vhi = -1e9;
  const n = Math.round(120 / NDT);
  for (let s = 0; s < n; s++) {
    sim.advance(NDT, NDT); ctx.t = sim.t;
    for (let i = 0; i < m.N; i++) { const v = sim.y[`V${i}`]; if (!isFinite(v)) finite = false; vlo = Math.min(vlo, v); vhi = Math.max(vhi, v); }
  }
  return { pass: finite && vhi > 20 && vhi < 80 && vlo > -95, detail: `V ∈ [${vlo.toFixed(0)}, ${vhi.toFixed(0)}] mV over 120 ms of pacing, all finite=${finite}` };
});

// ===========================================================================
// Mitochondrion (Cortassa 2003 energetics + Ca²⁺ + ROS/PTP)
// ===========================================================================
const MDT = 1e-4;
function buildMito(params) {
  const { values: P } = resolveParams(params);
  const m = buildMitochondrion(P); m.dtMax = MDT;
  return m;
}
function settleMito(model, controls, T, fromState) {
  const ctx = { controls: { ...controls }, t: 0 };
  const sim = new Simulator(model, ctx);
  if (fromState) sim.y = JSON.parse(fromState);
  const n = Math.round(T / MDT);
  for (let s = 0; s < n; s++) { sim.advance(MDT, MDT); ctx.t = sim.t; if (!isFinite(sim.y.dPsi)) break; }
  return { sim, ctx, obs: model.observables(sim.y, ctx) };
}
// The resting (state-4) steady state is the same for every test, so settle it
// once and reuse the snapshot — perturbations branch from it.
let _mitoBaseline = null;
function mitoBaseline(model) {
  if (!_mitoBaseline) {
    const b = settleMito(model, {}, 200);
    _mitoBaseline = { state: JSON.stringify(b.sim.y), obs: b.obs };
  }
  return _mitoBaseline;
}

test('Reaches an energised resting (state-4) steady state', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const base = mitoBaseline(m);
  const o = base.obs;
  const y = JSON.parse(base.state);
  let finite = true; for (const k of m.stateKeys) if (!isFinite(y[k])) finite = false;
  const ok = finite && o.DeltaPsi > 120 && o.DeltaPsi < 240 && o.NADHfrac > 0.4 && o.ATP_ADP > 5;
  return { pass: ok, detail: `ΔΨm=${o.DeltaPsi.toFixed(0)} mV, NADH ${(o.NADHfrac * 100).toFixed(0)}%, ATP/ADP ${o.ATP_ADP.toFixed(0)}, finite=${finite}` };
});

test('Adding ADP drives state-3 respiration', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const base = mitoBaseline(m);
  const s3 = settleMito(m, { adp: 0.3 }, 60, base.state);
  return { pass: s3.obs.VO2 > base.obs.VO2 * 1.4, detail: `O₂ uptake: state 4 ${base.obs.VO2.toFixed(2)} → state 3 ${s3.obs.VO2.toFixed(2)} (ADP added)` };
});

test('Cyanide (Complex IV block) stops respiration', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const base = mitoBaseline(m);
  const cn = settleMito(m, { cyanide: 1 }, 60, base.state);
  return { pass: cn.obs.VO2 < base.obs.VO2 * 0.2, detail: `O₂ uptake ${base.obs.VO2.toFixed(2)} → ${cn.obs.VO2.toFixed(2)} with cyanide` };
});

test('Oligomycin blocks ATP synthesis', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const base = mitoBaseline(m);
  const ol = settleMito(m, { oligomycin: 1 }, 60, base.state);
  return { pass: ol.obs.VATP < base.obs.VATP * 0.25 + 0.05, detail: `ATP synthesis ${base.obs.VATP.toFixed(2)} → ${ol.obs.VATP.toFixed(2)} with oligomycin` };
});

test('FCCP uncouples respiration from ATP synthesis', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const base = mitoBaseline(m);
  const fccp = settleMito(m, { fccp: 1 }, 60, base.state);
  const ok = fccp.obs.VATP < base.obs.VATP * 0.25 + 0.05 && fccp.obs.VO2 > base.obs.VO2 && fccp.obs.DeltaPsi < base.obs.DeltaPsi - 40;
  return { pass: ok, detail: `uncoupled: ATP synth ${base.obs.VATP.toFixed(2)}→${fccp.obs.VATP.toFixed(2)}, O₂ ${base.obs.VO2.toFixed(2)}→${fccp.obs.VO2.toFixed(2)}, ΔΨm ${base.obs.DeltaPsi.toFixed(0)}→${fccp.obs.DeltaPsi.toFixed(0)} mV` };
});

test('Ca²⁺ challenge loads the matrix via the uniporter', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const base = mitoBaseline(m);
  const ca = settleMito(m, { cai: 5 }, 100, base.state);
  return { pass: ca.obs.Cam > base.obs.Cam * 5 && ca.obs.Cam > 0.5, detail: `matrix [Ca²⁺]: ${base.obs.Cam.toFixed(2)} → ${ca.obs.Cam.toFixed(2)} µM` };
});

test('Permeability transition pore opens and halts ATP synthesis', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const base = mitoBaseline(m);
  const ptp = settleMito(m, { cai: 5, shunt: 0.1, ptpTrigger: 1 }, 60, base.state);
  return { pass: ptp.obs.PTP > 0.5 && ptp.obs.VATP < base.obs.VATP * 0.5 + 0.05, detail: `PTP open ${ptp.obs.PTP.toFixed(2)}, ATP synthesis ${base.obs.VATP.toFixed(2)} → ${ptp.obs.VATP.toFixed(2)}` };
});

test('Integration stays bounded across perturbations', 'mitochondrion', (params) => {
  const m = buildMito(params);
  const r = settleMito(m, { adp: 0.4, cai: 4, shunt: 0.12, fccp: 0.5 }, 120);
  let finite = true, dpsi = r.obs.DeltaPsi;
  for (const k of m.stateKeys) if (!isFinite(r.sim.y[k])) finite = false;
  return { pass: finite && dpsi >= -5 && dpsi < 260, detail: `all states finite=${finite}, ΔΨm=${dpsi.toFixed(0)} mV under combined stress` };
});
export function runAll(paramsMap) {
  return tests.map(({ name, cell, fn }) => {
    try {
      const r = fn(paramsMap[cell]);
      return { name: `[${cell}] ${name}`, pass: !!r.pass, detail: r.detail || '' };
    } catch (e) {
      return { name: `[${cell}] ${name}`, pass: false, detail: 'threw: ' + (e && e.message) };
    }
  });
}
