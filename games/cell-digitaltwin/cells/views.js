// Per-cell UI adapters. Each `view` tells main.js everything cell-specific:
// time units, playback range, plot configuration + how to sample it, readouts,
// the state table, membrane "chips", tint options, sandbox controls, cellbar
// actions (e.g. Stimulate), and how to map fluxes to schematic activity.

import { SPECIES as ERY_SPECIES } from './erythrocyte.js';
import { SPECIES as CARDIO_SPECIES } from './cardiomyocyte.js';

const colorOf = (species, id) => (species.find((s) => s.id === id) || {}).color || '#888';
const symOf = (species, id) => (species.find((s) => s.id === id) || {}).symbol || id;

// ===========================================================================
// Erythrocyte
// ===========================================================================
export const erythrocyteView = {
  timeLabel: 'min',
  dtMax: 0.02,
  speed: { min: 0.2, max: 300, unit: 'min/s', default: 30 },
  sampleEvery: 0.1,
  plotWindow: 60,
  fluxScale: 0.06,
  defaultControls: {},

  plotAxes: { mM: { label: 'mM', side: 'left' }, mV: { label: 'mV', side: 'right' } },
  series: [
    { key: 'Vm', label: 'Vm', color: '#ef4444', axis: 'mV', on: true },
    { key: 'Na_i', label: '[Na⁺]i', color: '#f59e0b', axis: 'mM', on: true },
    { key: 'K_i', label: '[K⁺]i', color: '#8b5cf6', axis: 'mM', on: true },
    { key: 'Cl_i', label: '[Cl⁻]i', color: '#10b981', axis: 'mM', on: true },
    { key: 'HCO3_i', label: '[HCO₃⁻]i', color: '#06b6d4', axis: 'mM', on: false },
    { key: 'ATP', label: 'ATP', color: '#22c55e', axis: 'mM', on: false },
    { key: 'BPG', label: '2,3-BPG', color: '#a855f7', axis: 'mM', on: false },
    { key: 'glucose_i', label: '[Glc]i', color: '#eab308', axis: 'mM', on: false },
    { key: 'lactate', label: 'Lac', color: '#64748b', axis: 'mM', on: false },
  ],

  sample(model, y, ctx) {
    const C = model.concentrations(y);
    const O = model.observables(y, ctx);
    return {
      Vm: O.Vm, Na_i: C.cyto.Na, K_i: C.cyto.K, Cl_i: C.cyto.Cl,
      HCO3_i: C.cyto.HCO3, ATP: C.cyto.ATP, BPG: C.cyto.BPG23,
      glucose_i: C.cyto.glucose, lactate: C.cyto.lactate,
    };
  },

  readouts(model, y, ctx) {
    const C = model.concentrations(y);
    const O = model.observables(y, ctx);
    return [
      ['Membrane Vm', O.Vm.toFixed(1), 'mV'],
      ['Volume', O.volume.toFixed(2), '× rest'],
      ['[Na⁺]i', C.cyto.Na.toFixed(1), 'mM'],
      ['[K⁺]i', C.cyto.K.toFixed(1), 'mM'],
      ['[Cl⁻]i', C.cyto.Cl.toFixed(1), 'mM'],
      ['[Ca²⁺]i', (C.cyto.Ca * 1e6).toFixed(0), 'nM'],
      ['ATP', O.ATP.toFixed(2), 'mM'],
      ['2,3-BPG', O.BPG.toFixed(2), 'mM'],
    ];
  },

  stateRows(model, y, ctx) {
    const C = model.concentrations(y);
    const O = model.observables(y, ctx);
    return {
      header: ['species', 'cyto', 'plasma', ''],
      rows: [
        ['Na⁺', C.cyto.Na, C.plasma.Na, 'mM'],
        ['K⁺', C.cyto.K, C.plasma.K, 'mM'],
        ['Cl⁻', C.cyto.Cl, C.plasma.Cl, 'mM'],
        ['Ca²⁺', C.cyto.Ca * 1e6, C.plasma.Ca * 1e6, 'nM'],
        ['HCO₃⁻', C.cyto.HCO3, C.plasma.HCO3, 'mM'],
        ['glucose', C.cyto.glucose, C.plasma.glucose, 'mM'],
        ['ATP', C.cyto.ATP, null, 'mM'],
        ['2,3-BPG', C.cyto.BPG23, null, 'mM'],
        ['lactate', C.cyto.lactate, null, 'mM'],
      ],
      footer: `E_Na / E_K / E_Cl = ${O.ENa.toFixed(0)} / ${O.EK.toFixed(0)} / ${O.ECl.toFixed(0)} mV`,
    };
  },

  chips(model, y) {
    const C = model.concentrations(y);
    const mk = (side, ids) => ids.map((id) => {
      const val = C[side][id];
      const text = id === 'Ca' ? `${(val * 1e6).toFixed(0)} nM` : `${val.toFixed(val < 1 ? 2 : 0)}`;
      return { label: symOf(ERY_SPECIES, id), color: colorOf(ERY_SPECIES, id), text };
    });
    return {
      plasma: mk('plasma', ['Na', 'K', 'Cl', 'Ca', 'HCO3', 'glucose']),
      cyto: mk('cyto', ['Na', 'K', 'Cl', 'Ca', 'glucose', 'ATP']),
    };
  },

  tint: {
    options: [
      { id: 'Cl', name: 'Chloride' }, { id: 'Na', name: 'Sodium' }, { id: 'K', name: 'Potassium' },
      { id: 'Ca', name: 'Calcium' }, { id: 'HCO3', name: 'Bicarbonate' },
      { id: 'glucose', name: 'Glucose' }, { id: 'ATP', name: 'ATP' },
    ],
    ranges: { Na: [0, 20], K: [0, 160], Cl: [0, 130], Ca: [0, 0.001], HCO3: [0, 30], glucose: [0, 8], ATP: [0, 3] },
    default: 'Cl',
  },

  controls: [
    { key: 'ouabain', label: 'Ouabain (Na⁺/K⁺-ATPase block)', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales J_pump by (1 − ouabain)' },
    { key: 'pmcaBlock', label: 'PMCA Ca²⁺-pump block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales J_PMCA by (1 − block)' },
    { key: 'band3block', label: 'Band 3 (Cl⁻/HCO₃⁻) block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales J_AE1 and P_Cl by (1 − block)' },
    { key: 'gardosBlock', label: 'Gardos channel block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales Gardos P_K by (1 − block)' },
    { key: 'glut1block', label: 'GLUT1 block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales J_GLUT1 by (1 − block)' },
    { key: 'tonicity', label: 'External tonicity', type: 'range', min: 0.4, max: 1.8, step: 0.05, def: 1, unit: '×', eq: 'Osm_out ×= tonicity (1 = isotonic)' },
    { key: 'noGlucose', label: 'Remove glucose (starve)', type: 'check', def: false, eq: 'sets glycolytic flux to 0', linked: { closedGlucose: true } },
  ],

  actions: [],

  activity(model, F) {
    const bgK = F.JkIn - F.JkGardos;
    return {
      nakatpase: { dir: -1, rate: 3 * F.nak },
      pmca: { dir: -1, rate: F.jpmca },
      band3: { dir: F.jB3 >= 0 ? 1 : -1, rate: Math.abs(F.jB3) },
      glut1: { dir: F.jGlut >= 0 ? 1 : -1, rate: Math.abs(F.jGlut) },
      gardos: { dir: F.JkGardos >= 0 ? 1 : -1, rate: Math.abs(F.JkGardos) },
      naleak: { dir: F.JnaIn >= 0 ? 1 : -1, rate: Math.abs(F.JnaIn) },
      kleak: { dir: bgK >= 0 ? 1 : -1, rate: Math.abs(bgK) },
    };
  },
};

// ===========================================================================
// Cardiomyocyte (Luo–Rudy I)
// ===========================================================================
export const cardiomyocyteView = {
  timeLabel: 'ms',
  dtMax: 0.01,
  speed: { min: 5, max: 2000, unit: 'ms/s', default: 300 },
  sampleEvery: 0.5,
  plotWindow: 1000,
  fluxScale: 8,
  defaultControls: { paced: false },
  intro: 'No spontaneous activity at rest — press ⚡ Stimulate or enable pacing to fire an action potential.',

  plotAxes: {
    I: { label: 'µA/µF', side: 'left' },
    mV: { label: 'mV', side: 'right' },
    gate: { label: 'gate', side: 'left' },
    uM: { label: 'µM', side: 'left' },
  },
  series: [
    { key: 'Vm', label: 'Vm', color: '#ef4444', axis: 'mV', on: true },
    { key: 'INa', label: 'I_Na', color: '#f59e0b', axis: 'I', on: true },
    { key: 'Isi', label: 'I_si (Ca²⁺)', color: '#10b981', axis: 'I', on: true },
    { key: 'IK', label: 'I_K', color: '#8b5cf6', axis: 'I', on: true },
    { key: 'IK1', label: 'I_K1', color: '#06b6d4', axis: 'I', on: false },
    { key: 'IKp', label: 'I_Kp', color: '#a855f7', axis: 'I', on: false },
    { key: 'Ib', label: 'I_b', color: '#94a3b8', axis: 'I', on: false },
    { key: 'Cai', label: '[Ca²⁺]i (µM)', color: '#db2777', axis: 'uM', on: false },
    { key: 'm', label: 'm gate', color: '#fb923c', axis: 'gate', on: false },
    { key: 'h', label: 'h gate', color: '#38bdf8', axis: 'gate', on: false },
    { key: 'X', label: 'X gate', color: '#c084fc', axis: 'gate', on: false },
  ],

  sample(model, y, ctx) {
    const F = model.computeFluxes(y, ctx);
    return {
      Vm: y.V, INa: F.INa, Isi: F.Isi, IK: F.IK, IK1: F.IK1, IKp: F.IKp, Ib: F.Ib,
      Cai: Math.max(1e-6, y.Cai) * 1000, m: y.m, h: y.h, X: y.X,
    };
  },

  readouts(model, y, ctx) {
    const O = model.observables(y, ctx);
    return [
      ['Membrane Vm', O.Vm.toFixed(1), 'mV'],
      ['[Ca²⁺]i', O.Cai_uM.toFixed(2), 'µM'],
      ['I_Na', O.INa.toFixed(1), 'µA/µF'],
      ['I_si (Ca²⁺)', O.Isi.toFixed(2), 'µA/µF'],
      ['I_K', O.IK.toFixed(2), 'µA/µF'],
      ['I_K1', O.IK1.toFixed(2), 'µA/µF'],
    ];
  },

  stateRows(model, y, ctx) {
    const O = model.observables(y, ctx);
    const g = (k) => y[k].toFixed(3);
    return {
      header: ['variable', 'value', '', ''],
      rows: [
        ['V', y.V, null, 'mV'],
        ['[Ca²⁺]i', O.Cai_uM, null, 'µM'],
        ['m / h / j', `${g('m')} / ${g('h')} / ${g('j')}`, null, ''],
        ['d / f', `${g('d')} / ${g('f')}`, null, ''],
        ['X', g('X'), null, ''],
      ],
      footer: `E_Na / E_K / E_K1 = ${O.E_Na.toFixed(0)} / ${O.E_K.toFixed(0)} / ${O.E_K1.toFixed(0)} mV`,
    };
  },

  chips(model, y) {
    const C = model.concentrations(y);
    const mk = (side, ids) => ids.map((id) => {
      const val = C[side][id];
      const text = id === 'Ca' ? `${(val * 1000).toFixed(2)} µM` : `${val.toFixed(0)}`;
      return { label: symOf(CARDIO_SPECIES, id), color: colorOf(CARDIO_SPECIES, id), text };
    });
    return { plasma: mk('plasma', ['Na', 'K']), cyto: mk('cyto', ['Na', 'K', 'Ca']) };
  },

  tint: {
    options: [{ id: 'Ca', name: 'Calcium (only dynamic ion)' }],
    ranges: { Ca: [1e-4, 1.2e-3] },
    default: 'Ca',
  },

  controls: [
    { key: 'paced', label: 'Pace continuously', type: 'check', def: false, eq: 'stimulate every BCL ms' },
    { key: 'bcl', label: 'Basic cycle length', type: 'range', min: 200, max: 1000, step: 10, def: 500, unit: ' ms', eq: 'pacing period' },
    { key: 'naBlock', label: 'I_Na block (class I)', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales G_Na by (1 − block)' },
    { key: 'caBlock', label: 'I_si Ca²⁺ block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales G_si by (1 − block)' },
    { key: 'kBlock', label: 'I_K block (class III)', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales G_K by (1 − block)' },
    { key: 'k1Block', label: 'I_K1 block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, zeroLabel: 'off', eq: 'scales G_K1 by (1 − block)' },
  ],

  actions: [
    {
      id: 'stim', label: '⚡ Stimulate', autoplay: true,
      fn: (ctx, sim) => { ctx.controls._stimUntil = sim.t + 0.5; },
    },
  ],

  activity(model, F) {
    const ch = (I, cationInwardPositive = true) => ({ dir: I < 0 ? 1 : -1, rate: Math.abs(I) });
    return {
      INa: ch(F.INa), Isi: ch(F.Isi),
      IK: { dir: -1, rate: Math.abs(F.IK) },
      IK1: { dir: -1, rate: Math.abs(F.IK1) },
      IKp: { dir: -1, rate: Math.abs(F.IKp) },
      Ib: { dir: F.Ib < 0 ? 1 : -1, rate: Math.abs(F.Ib) },
    };
  },
};
