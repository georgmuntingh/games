// Shared test suite for the Cell Digital Twin engine + erythrocyte model.
// Runnable in the browser (tests/index.html) and in Node (run-tests.mjs).
// `runAll(params)` returns [{ name, pass, detail }].

import {
  thermalVoltagemV, ghkEfflux, nernst, solveSteadyVm, goldmanVm,
} from '../engine/fluxes.js';
import { resolveParams, totalAmount } from '../engine/model.js';
import { Simulator } from '../engine/integrator.js';
import { buildModel } from '../cells/erythrocyte.js';

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const approx = (a, b, tol) => Math.abs(a - b) <= tol;
const inRange = (x, lo, hi) => x >= lo && x <= hi;

// ---- pure flux-law identities ----------------------------------------------
test('GHK flux is zero at the Nernst potential', () => {
  const VT = thermalVoltagemV(8.314, 310, 96485);
  for (const [z, ci, co] of [[1, 10, 140], [1, 140, 5], [-1, 75, 116], [2, 5e-5, 1.2]]) {
    const E = nernst(z, ci, co, VT);
    const J = ghkEfflux(1, z, E, ci, co, VT);
    if (!approx(J, 0, 1e-9)) return { pass: false, detail: `z=${z}: J(E)=${J.toExponential(2)} ≠ 0` };
  }
  return { pass: true, detail: 'J(E_Nernst)=0 for Na,K,Cl,Ca' };
});

test('GHK flux at Vm=0 equals g·(ci−co)', () => {
  const VT = thermalVoltagemV(8.314, 310, 96485);
  const J = ghkEfflux(2.5, 1, 0, 10, 140, VT);
  return { pass: approx(J, 2.5 * (10 - 140), 1e-6), detail: `J(0)=${J.toFixed(3)} vs ${2.5 * (10 - 140)}` };
});

test('solveSteadyVm matches the closed-form Goldman voltage', () => {
  const VT = thermalVoltagemV(8.314, 310, 96485);
  const pNa = 0.04, pK = 0.05, pCl = 1.0;
  const Nai = 10, Nao = 140, Ki = 140, Ko = 5, Cli = 75, Clo = 116;
  const Vg = goldmanVm(VT, pNa, pK, pCl, Nai, Nao, Ki, Ko, Cli, Clo);
  // Net charge influx (no pump) using the same permeabilities.
  const f = (Vm) => {
    const JnaE = ghkEfflux(pNa, +1, Vm, Nai, Nao, VT);
    const JkE = ghkEfflux(pK, +1, Vm, Ki, Ko, VT);
    const JclE = ghkEfflux(pCl, -1, Vm, Cli, Clo, VT);
    return -(JnaE + JkE - JclE);
  };
  const Vs = solveSteadyVm(f, -150, 80);
  return { pass: approx(Vs, Vg, 0.05), detail: `solve=${Vs.toFixed(3)} mV, Goldman=${Vg.toFixed(3)} mV` };
});

// ---- integrator: Rush-Larsen vs analytic -----------------------------------
test('Rush-Larsen integrates a gating variable to its analytic solution', () => {
  const minf = 0.8, tau = 3.0; // constant
  const gateModel = {
    y0: { m: 0.1 },
    gating: [{ name: 'm', inf: () => minf, tau: () => tau }],
    derivatives: () => ({ m: 0 }),
  };
  const sim = new Simulator(gateModel, {});
  const dt = 0.5, T = 12;
  for (let t = 0; t < T; t += dt) sim.step(dt);
  const analytic = minf - (minf - 0.1) * Math.exp(-sim.t / tau);
  return { pass: approx(sim.y.m, analytic, 1e-3), detail: `m=${sim.y.m.toFixed(5)} vs analytic ${analytic.toFixed(5)}` };
});

// ---- erythrocyte model: conservation ---------------------------------------
function buildRBC(params) {
  const { values: P } = resolveParams(params);
  const model = buildModel(P);
  model.dtMax = 0.02;
  return model;
}

test('Ion mass is conserved over a 2 h run (drift < 1e-6)', (params) => {
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
  return { pass: maxDrift < 1e-6, detail: `max ion drift ${(maxDrift).toExponential(2)} (${worst})` };
});

test('Net electric charge is conserved over a 2 h run', (params) => {
  const { values: P } = resolveParams(params);
  const model = buildModel(P); model.dtMax = 0.02;
  const sim = new Simulator(model, { controls: {} });
  const charge = (y) =>
    (y.Na_i + y.K_i - y.Cl_i + 2 * y.Ca_i - y.HCO3_i + model.zX * y.X_i) +
    (y.Na_o + y.K_o - y.Cl_o + 2 * y.Ca_o - y.HCO3_o);
  const q0 = charge(sim.y);
  for (let m = 0; m < 120; m += 0.02) sim.advance(0.02, 0.02);
  const drift = Math.abs(charge(sim.y) - q0);
  return { pass: drift < 1e-6, detail: `charge drift ${drift.toExponential(2)} (q0=${q0.toExponential(2)})` };
});

// ---- erythrocyte model: resting steady state -------------------------------
test('Reaches a physiological resting steady state (t = 60 min)', (params) => {
  const model = buildRBC(params);
  const sim = new Simulator(model, { controls: {} });
  for (let m = 0; m < 60; m += 0.02) sim.advance(0.02, 0.02);
  const C = model.concentrations(sim.y);
  const O = model.observables(sim.y, { controls: {} });
  const checks = [
    ['Vm', O.Vm, -14, -8, 'mV'],
    ['Na_i', C.cyto.Na, 8, 13, 'mM'],
    ['K_i', C.cyto.K, 133, 148, 'mM'],
    ['Cl_i', C.cyto.Cl, 68, 82, 'mM'],
    ['Ca_i', C.cyto.Ca * 1e6, 20, 80, 'nM'],
    ['ATP', O.ATP, 1.4, 2.6, 'mM'],
    ['BPG', O.BPG, 2, 6, 'mM'],
    ['volume', O.volume, 0.9, 1.05, '×'],
  ];
  const bad = checks.filter(([, v, lo, hi]) => !inRange(v, lo, hi));
  const detail = checks.map(([n, v, , , u]) => `${n}=${v.toFixed(n === 'Ca_i' ? 0 : 1)}${u}`).join(' ');
  return { pass: bad.length === 0, detail: bad.length ? `out of range: ${bad.map((b) => b[0]).join(',')} | ${detail}` : detail };
});

// ---- perturbation responses ------------------------------------------------
test('Ouabain (pump block) raises Na_i and lowers K_i', (params) => {
  const model = buildRBC(params);
  const sim = new Simulator(model, { controls: { ouabain: 1 } });
  const C0 = model.concentrations(sim.y);
  for (let m = 0; m < 600; m += 0.02) sim.advance(0.02, 0.02); // 10 h
  const C = model.concentrations(sim.y);
  return {
    pass: C.cyto.Na > C0.cyto.Na + 3 && C.cyto.K < C0.cyto.K - 3,
    detail: `Na ${C0.cyto.Na.toFixed(1)}→${C.cyto.Na.toFixed(1)}, K ${C0.cyto.K.toFixed(1)}→${C.cyto.K.toFixed(1)}`,
  };
});

test('Hypotonic shock swells, hypertonic shrinks', (params) => {
  const model = buildRBC(params);
  const run = (tonicity) => {
    const s = new Simulator(model, { controls: { tonicity } });
    for (let m = 0; m < 20; m += 0.02) s.advance(0.02, 0.02);
    return s.y.v;
  };
  const lo = run(0.6), hi = run(1.5);
  return { pass: lo > 1.1 && hi < 0.9, detail: `hypotonic v=${lo.toFixed(2)} (>1.1), hypertonic v=${hi.toFixed(2)} (<0.9)` };
});

test('Blocking PMCA raises intracellular Ca²⁺ into the µM range', (params) => {
  const model = buildRBC(params);
  const sim = new Simulator(model, { controls: { pmcaBlock: 1 } });
  for (let m = 0; m < 30; m += 0.02) sim.advance(0.02, 0.02);
  const Ca = model.concentrations(sim.y).cyto.Ca * 1e6; // nM
  return { pass: Ca > 1000, detail: `[Ca²⁺]i = ${Ca.toFixed(0)} nM after PMCA block` };
});

export function runAll(params) {
  return tests.map(({ name, fn }) => {
    try {
      const r = fn(params);
      return { name, pass: !!r.pass, detail: r.detail || '' };
    } catch (e) {
      return { name, pass: false, detail: 'threw: ' + (e && e.message) };
    }
  });
}
