// Human erythrocyte (red blood cell) model.
//
// Integrated ion + volume homeostasis (Lew & Bookchin 1986) coupled with a
// reduced anaerobic glycolysis / 2,3-BPG shunt (Mulquiney & Kuchel 1999;
// Joshi & Palsson 1989). Glycolytic ATP powers the Na+/K+- and Ca2+-ATPases.
//
// State is tracked as AMOUNTS per resting-cell-volume (units: mM at v = 1), so
// total amounts are exactly conserved and concentrations follow as amount / v,
// where v is the cytosolic volume relative to rest. The extracellular bath is a
// finite compartment (vp = V_plasma / V_cyto0) so the closed system conserves
// mass and charge; this is what the conservation tests check.
//
// The membrane potential is solved at quasi-steady state each step (RBC Vm is
// essentially the Donnan/Goldman value set by the dominant Cl- permeability of
// Band 3), via root-finding on net charge flux.

import {
  thermalVoltagemV, ghkEfflux, michaelisMenten, hill,
  nakPumpCycleRate, pmcaRate, gardosPermeability, glut1Flux,
  band3ClInflux, solveSteadyVm,
} from '../engine/fluxes.js';

// Geometry + units conversion turning a permeability P [cm/s] into an effective
// first-order coefficient [1/min]: (Area/Volume) * 60. Area 1.4e-6 cm^2,
// V = 9e-14 L = 9e-11 cm^3  ->  ~9.33e5. Absolute value sets kinetic timescale;
// permeability RATIOS set the resting Vm (Goldman equation).
const KGEO = (1.4e-6 / 9.0e-11) * 60; // ~9.33e5

// Cytosolic species tracked as amounts (key -> charge z). Metabolites z=0 here
// (their charge is lumped into the impermeant anion X for electroneutrality).
const CYTO_IONS = ['Na', 'K', 'Cl', 'Ca', 'HCO3'];
const PLASMA_IONS = ['Na', 'K', 'Cl', 'Ca', 'HCO3', 'Glc'];

export function buildModel(P) {
  const VT = thermalVoltagemV(P.physical.R, P.physical.T, P.physical.F); // mV
  const vp = P.geometry.V_plasma / P.geometry.V_cyto0; // relative plasma volume

  // ---- initial amounts (at v = 1, amount == concentration) -----------------
  const ci = P.cyto_init, co = P.plasma, mi = P.metabolites_init;
  const y0 = {
    // cytosol ion amounts
    Na_i: ci.Na, K_i: ci.K, Cl_i: ci.Cl, Ca_i: ci.Ca, HCO3_i: ci.HCO3, Glc_i: ci.glucose,
    // impermeant anion amount (fixed); concentration set by electroneutrality
    X_i: 0,
    // plasma ion amounts (amount = conc * vp)
    Na_o: co.Na * vp, K_o: co.K * vp, Cl_o: co.Cl * vp, Ca_o: co.Ca * vp,
    HCO3_o: co.HCO3 * vp, Glc_o: co.glucose * vp,
    // metabolites (cytosol only)
    ATP: mi.ATP, ADP: mi.ADP, Pi: mi.Pi, BPG23: mi.BPG23, lactate: mi.lactate,
    NADH: mi.NADH, NAD: mi.NAD,
    // cytosolic volume relative to rest
    v: 1,
  };

  // Impermeant anion amount fixed so the cytosol is electroneutral at rest.
  const cationsInit = ci.Na + ci.K + 2 * ci.Ca;
  const anionsInit = ci.Cl + ci.HCO3;
  const zX = ci.zX; // negative
  y0.X_i = (cationsInit - anionsInit) / (-zX); // > 0
  const internalOsmConst = mi.Pi + mi.NADH + mi.NAD; // small, treated as buffered

  // External osmolarity baseline so dv/dt = 0 at rest (osmotic balance).
  const osmInit =
    ci.Na + ci.K + ci.Cl + ci.Ca + ci.HCO3 + ci.glucose + y0.X_i +
    mi.ATP + mi.ADP + mi.Pi + mi.BPG23 + mi.lactate + mi.NADH + mi.NAD;
  const osmExtSolutes = co.Na + co.K + co.Cl + co.Ca + co.HCO3 + co.glucose;
  const osmExtConst = osmInit - osmExtSolutes; // impermeant plasma osmolytes (albumin, etc.)

  function controls(ctx) {
    return (ctx && ctx.controls) || {};
  }

  // Concentrations (mM) for the math and for display.
  function conc(y) {
    const v = y.v;
    return {
      Nai: y.Na_i / v, Ki: y.K_i / v, Cli: y.Cl_i / v, Cai: y.Ca_i / v,
      HCO3i: y.HCO3_i / v, Glci: y.Glc_i / v, Xi: y.X_i / v,
      ATP: y.ATP / v, ADP: y.ADP / v, BPG: y.BPG23 / v, Lac: y.lactate / v,
      Nao: y.Na_o / vp, Ko: y.K_o / vp, Clo: y.Cl_o / vp, Cao: y.Ca_o / vp,
      HCO3o: y.HCO3_o / vp, Glco: y.Glc_o / vp,
    };
  }

  // Effective leak coefficients (1/min), Gardos folded into K.
  function leakCoeffs(c, Cai) {
    const ctl = c;
    const gNa = P.leaks.P_Na * KGEO * (1 - (ctl.naLeak ? -((ctl.naLeak) - 1) : 0));
    const gardos = gardosPermeability(P.gardos, Cai) * KGEO * (ctl.gardosBlock ? (1 - ctl.gardosBlock) : 1);
    const gK = P.leaks.P_K * KGEO + gardos;
    const gCl = P.leaks.P_Cl * KGEO * (1 - (ctl.band3block || 0));
    return { gNa, gK, gCl, gardos };
  }

  // Core flux computation at a given state; returns everything needed for both
  // the derivatives and the visualization.
  function computeFluxes(y, ctx) {
    const c = controls(ctx);
    const C = conc(y);

    const pumpBlock = 1 - (c.ouabain || 0);
    const nak = nakPumpCycleRate(P.nakatpase, C.Nai, C.Ko, C.ATP) * pumpBlock; // cycles/min
    const jpmca = pmcaRate(P.pmca, C.Cai, C.ATP) * (1 - (c.pmcaBlock || 0));   // Ca efflux

    const gCa = P.leaks.P_Ca * KGEO;
    const { gNa, gK, gCl, gardos } = leakCoeffs(c, C.Cai);

    // Quasi-steady Vm: net charge influx = 0.
    // charge influx = -(Na_eff + K_eff - Cl_eff) - pumpChargeOut
    const f = (Vm) => {
      const JnaE = ghkEfflux(gNa, +1, Vm, C.Nai, C.Nao, VT);
      const JkE = ghkEfflux(gK, +1, Vm, C.Ki, C.Ko, VT);
      const JclE = ghkEfflux(gCl, -1, Vm, C.Cli, C.Clo, VT);
      return -(JnaE + JkE - JclE) - nak; // pump extrudes net +1 per cycle
    };
    const Vm = solveSteadyVm(f, -150, 80);

    const JnaE = ghkEfflux(gNa, +1, Vm, C.Nai, C.Nao, VT); // efflux (out +)
    const JkE = ghkEfflux(gK, +1, Vm, C.Ki, C.Ko, VT);
    const JclE = ghkEfflux(gCl, -1, Vm, C.Cli, C.Clo, VT);
    const JkGardos = ghkEfflux(gardos, +1, Vm, C.Ki, C.Ko, VT);
    const JcaE = ghkEfflux(gCa, +2, Vm, C.Cai, C.Cao, VT);

    const jB3 = band3ClInflux(P.band3, C.Cli, C.Clo, C.HCO3i, C.HCO3o) *
      (1 - (c.band3block || 0)); // net Cl- influx
    const jGlut = (c.glut1block ? 0 : 1) * glut1Flux(P.glut1, C.Glci, C.Glco);

    // Glycolysis (mM/min glucose consumed).
    const g = P.glycolysis;
    const noFuel = c.noGlucose ? 0 : 1;
    const jGly = noFuel * g.Vmax_HK * michaelisMenten(C.Glci, g.Km_Glc) *
      michaelisMenten(C.ATP, g.Km_ATP_gly) * michaelisMenten(C.ADP, g.Km_ADP_gly);

    return {
      Vm, nak, jpmca,
      JnaIn: -JnaE, JkIn: -JkE, JclIn: -JclE, JcaIn: -JcaE, JkGardos: -JkGardos,
      jB3, jGlut, jGly, C,
    };
  }

  function derivatives(t, y, ctx) {
    const F = computeFluxes(y, ctx);
    const C = F.C;
    const g = P.glycolysis;

    const pumpNaOut = 3 * F.nak;
    const pumpKIn = 2 * F.nak;

    // ATP economy.
    const atpGen = g.ATP_yield * F.jGly;
    const atpPump = F.nak;        // 1 ATP / cycle
    const atpPmca = F.jpmca;      // 1 ATP / Ca extruded
    const atpLoad = g.k_ATPase_load * C.ATP;
    const dATP = atpGen - atpPump - atpPmca - atpLoad;

    const dy = {};
    for (const k of Object.keys(y)) dy[k] = 0;

    // cytosol ions
    dy.Na_i = F.JnaIn - pumpNaOut;
    dy.K_i = F.JkIn + pumpKIn;
    dy.Cl_i = F.JclIn + F.jB3;
    dy.Ca_i = F.JcaIn - F.jpmca;
    dy.HCO3_i = -F.jB3;
    dy.Glc_i = F.jGlut - F.jGly;
    dy.X_i = 0;

    // plasma (mirror, mass-conserving)
    dy.Na_o = -dy.Na_i;
    dy.K_o = -dy.K_i;
    dy.Cl_o = -dy.Cl_i;
    dy.Ca_o = -dy.Ca_i;
    dy.HCO3_o = -dy.HCO3_i;
    // Plasma glucose is resupplied by the body (open metabolic boundary): the
    // cell is an open system for fuel/waste but closed for the ions above.
    dy.Glc_o = (controls(ctx).closedGlucose ? -F.jGlut : 0);

    // metabolites
    dy.ATP = dATP;
    dy.ADP = -dATP; // adenine pool conserved
    dy.BPG23 = g.f_BPG * F.jGly - g.k_BPG_deg * C.BPG;
    dy.lactate = 2 * F.jGly - g.k_lactate_efflux * C.Lac; // produced then cleared
    dy.Pi = 0; dy.NADH = 0; dy.NAD = 0;

    // volume (osmotic): relax toward osmotic balance
    const c = controls(ctx);
    const tonicity = c.tonicity == null ? 1 : c.tonicity;
    const osmIn =
      C.Nai + C.Ki + C.Cli + C.Cai + C.HCO3i + C.Glci + C.Xi +
      C.ATP + C.ADP + C.BPG + C.Lac + internalOsmConst;
    const osmOut = tonicity * (C.Nao + C.Ko + C.Clo + C.Cao + C.HCO3o + C.Glco + osmExtConst);
    dy.v = P.water.Lp * (osmIn - osmOut);

    return dy;
  }

  // ---- display helpers -----------------------------------------------------
  function concentrations(y) {
    const C = conc(y);
    return {
      cyto: {
        Na: C.Nai, K: C.Ki, Cl: C.Cli, Ca: C.Cai, HCO3: C.HCO3i, glucose: C.Glci,
        ATP: C.ATP, ADP: C.ADP, BPG23: C.BPG, lactate: C.Lac,
      },
      plasma: {
        Na: C.Nao, K: C.Ko, Cl: C.Clo, Ca: C.Cao, HCO3: C.HCO3o, glucose: C.Glco,
      },
    };
  }

  function observables(y, ctx) {
    const F = computeFluxes(y, ctx || {});
    const C = F.C;
    return {
      Vm: F.Vm,
      volume: y.v,
      ATP: C.ATP,
      ADP: C.ADP,
      ATP_ADP: C.ATP / C.ADP,
      BPG: C.BPG,
      pumpRate: F.nak,
      ECl: (VT / -1) * Math.log(C.Clo / C.Cli),
      EK: (VT / 1) * Math.log(C.Ko / C.Ki),
      ENa: (VT / 1) * Math.log(C.Nao / C.Nai),
    };
  }

  return {
    id: 'erythrocyte',
    name: 'Erythrocyte (red blood cell)',
    subtitle: 'Ion & volume homeostasis coupled to anaerobic glycolysis.',
    refs: ['lew_bookchin_1986', 'lew_bookchin_2005', 'mulquiney_kuchel_1999', 'jennings_1989'],
    VT, vp, zX,
    compartments: [
      { id: 'plasma', name: 'Blood plasma', extracellular: true },
      { id: 'cyto', name: 'Cytosol', extracellular: false },
    ],
    species: SPECIES,
    transporters: TRANSPORTERS,
    y0,
    derivatives,
    computeFluxes,
    concentrations,
    observables,
    conservedSpecies: {
      Na: ['Na_i', 'Na_o'], K: ['K_i', 'K_o'], Cl: ['Cl_i', 'Cl_o'],
      Ca: ['Ca_i', 'Ca_o'], HCO3: ['HCO3_i', 'HCO3_o'],
    },
  };
}

// Species metadata for the schematic / plots (charge z, display colour).
export const SPECIES = [
  { id: 'Na', name: 'Sodium', symbol: 'Na⁺', z: +1, color: '#f59e0b' },
  { id: 'K', name: 'Potassium', symbol: 'K⁺', z: +1, color: '#8b5cf6' },
  { id: 'Cl', name: 'Chloride', symbol: 'Cl⁻', z: -1, color: '#10b981' },
  { id: 'Ca', name: 'Calcium', symbol: 'Ca²⁺', z: +2, color: '#ef4444' },
  { id: 'HCO3', name: 'Bicarbonate', symbol: 'HCO₃⁻', z: -1, color: '#06b6d4' },
  { id: 'glucose', name: 'Glucose', symbol: 'Glc', z: 0, color: '#eab308' },
  { id: 'ATP', name: 'ATP', symbol: 'ATP', z: 0, color: '#22c55e' },
  { id: 'BPG23', name: '2,3-BPG', symbol: '2,3-BPG', z: 0, color: '#a855f7' },
  { id: 'lactate', name: 'Lactate', symbol: 'Lac⁻', z: -1, color: '#64748b' },
];

// Transporter metadata: id, class, the species it moves, an equation string for
// the "show equations" layer, references, and a membrane position (0..1 along
// the membrane) for the schematic.
export const TRANSPORTERS = [
  {
    id: 'nakatpase', name: 'Na⁺/K⁺-ATPase', cls: 'pump', pos: 0.12,
    moves: ['Na', 'K'], drives: 'ATP',
    equation: 'J = I_max · h(Na_i;K_mNa,3) · h(K_o;K_mK,2) · MM(ATP) ; 3 Na⁺ out / 2 K⁺ in / ATP',
    refs: ['garrahan_glynn_1967', 'post_1972'],
    blurb: 'Primary active transport. Builds the Na⁺ and K⁺ gradients; consumes ATP.',
  },
  {
    id: 'band3', name: 'Band 3 / AE1', cls: 'antiporter', pos: 0.3,
    moves: ['Cl', 'HCO3'],
    equation: 'J_Cl,in = k · ([Cl]_o[HCO₃]_i − [Cl]_i[HCO₃]_o)  (electroneutral 1:1 exchange)',
    refs: ['jennings_1989'],
    blurb: 'Electroneutral Cl⁻/HCO₃⁻ antiport — the chloride shift that lets blood carry CO₂.',
  },
  {
    id: 'glut1', name: 'GLUT1', cls: 'uniporter', pos: 0.48,
    moves: ['glucose'],
    equation: 'J = V_max · ([Glc]_o − [Glc]_i) / (K_m + [Glc]_o + [Glc]_i)',
    refs: ['lowe_walmsley_1986'],
    blurb: 'Facilitated diffusion of glucose down its gradient (no ATP).',
  },
  {
    id: 'gardos', name: 'Gardos channel (KCa3.1)', cls: 'channel', pos: 0.66,
    moves: ['K'], gatedBy: 'Ca',
    equation: 'P_K = g_max · h([Ca]_i; K_0.5, n) ; GHK flux',
    refs: ['gardos_1958', 'hoffman_2003'],
    blurb: 'Ca²⁺-activated K⁺ channel. Opening causes K⁺ (and water) loss — cell dehydration.',
  },
  {
    id: 'pmca', name: 'PMCA (Ca²⁺-ATPase)', cls: 'pump', pos: 0.82,
    moves: ['Ca'], drives: 'ATP',
    equation: 'J = I_max · h([Ca]_i; K_mCa, n) · MM(ATP) ; Ca²⁺ out',
    refs: ['tiffert_lew_2001'],
    blurb: 'Keeps free [Ca²⁺]_i near 50 nM against a 10⁴-fold gradient; consumes ATP.',
  },
  {
    id: 'naleak', name: 'Na⁺ leak', cls: 'leak', pos: 0.2,
    moves: ['Na'],
    equation: 'GHK constant-field flux with permeability P_Na',
    refs: ['lew_bookchin_1986'],
    blurb: 'Passive background Na⁺ entry, balanced by the Na⁺/K⁺-ATPase.',
  },
  {
    id: 'kleak', name: 'K⁺ leak', cls: 'leak', pos: 0.74,
    moves: ['K'],
    equation: 'GHK constant-field flux with permeability P_K',
    refs: ['lew_bookchin_1986'],
    blurb: 'Passive background K⁺ exit, balanced by the pump.',
  },
];
