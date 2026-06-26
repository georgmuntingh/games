// Mitochondrion — the Cortassa-Aon-Marbán-Winslow-O'Rourke (2003) integrated
// model of cardiac mitochondrial energy metabolism and Ca²⁺ dynamics, with a
// reactive-oxygen-species module (after Cortassa 2004 / Zhou 2009) and a
// permeability transition pore (after Pokhilko 2006 / Bernardi 2015).
//
// The inner membrane is the transport boundary (matrix vs cytosol). The TCA
// cycle produces NADH/FADH₂; the electron-transport chain pumps protons to
// charge the inner-membrane potential ΔΨ; the F1F0-ATP synthase, ANT and proton
// leak discharge it; the Ca²⁺ uniporter and Na⁺/Ca²⁺ exchanger set matrix Ca²⁺,
// which feeds back on the TCA dehydrogenases. Integrated by RK4 (engine).
//
// State (15 ODEs): ADP_m, NADH, ISOC, aKG, SCoA, Suc, FUM, MAL, OAA, ASP, Ca_m,
// dPsi (ΔΨ, V), plus ROS (matrix superoxide, µM) and Pptp (pore open fraction).
//
// All TCA/OxPhos/Ca equations and parameters are verbatim from the authoritative
// CellML encoding. Two documented curation fixes are applied: (1) the Na⁺/Ca²⁺
// exchanger uses the matrix/cytosol Ca ratio [Ca]m/[Ca]i so it exports matrix
// Ca²⁺; (2) the F1F0 ATP-synthase and its proton flux are signed positive (net
// ATP synthesis / proton influx), matching the Magnus-Keizer form. Units:
// concentrations mM (Ca in µM), fluxes mM/s, potentials V, time s.

const STATE_KEYS = ['ADP_m', 'NADH', 'ISOC', 'aKG', 'SCoA', 'Suc', 'FUM', 'MAL', 'OAA', 'ASP', 'Ca_m', 'dPsi', 'ROS', 'Pptp'];

const clampPos = (x, lo) => (x > lo ? x : lo);
function hill(x, K, n) { const xn = Math.pow(Math.max(0, x), n); return xn / (Math.pow(K, n) + xn); }

export function buildModel(P) {
  const RTF = P.physical.R * P.physical.T / P.physical.F;   // V
  const F_RT = 1 / RTF;
  const Cmito = P.physical.C_mito;

  // ---- the full Cortassa flux set + ROS/PTP, evaluated at a given state -----
  function fluxes(y, ctx) {
    const ctrl = (ctx && ctx.controls) || {};
    // controls / clamped cytosolic boundary
    const ADP_i = ctrl.adp != null ? ctrl.adp : P.cyto.ADP_i;        // mM
    const Ca_i = ctrl.cai != null ? ctrl.cai : P.cyto.Ca_i;          // µM
    const AcCoA = (ctrl.substrate != null ? ctrl.substrate : 1) * P.cyto.AcCoA;
    const roten = 1 - (ctrl.rotenone || 0);     // complex I (NADH arm)
    const cyan = 1 - (ctrl.cyanide || 0);       // complex IV (both arms)
    const oligo = 1 - (ctrl.oligomycin || 0);   // ATP synthase
    const fccp = (ctrl.fccp || 0);              // uncoupler -> proton leak
    const shunt = ctrl.shunt != null ? ctrl.shunt : P.ros.shunt;

    // state (clamped to physical ranges)
    const ADP_m = clampPos(y.ADP_m, 1e-6);
    const NADH = Math.min(P.pools.C_PN - 1e-6, clampPos(y.NADH, 1e-6));
    const ISOC = clampPos(y.ISOC, 1e-9), aKG = clampPos(y.aKG, 1e-9), SCoA = clampPos(y.SCoA, 1e-9);
    const Suc = clampPos(y.Suc, 1e-9), FUM = clampPos(y.FUM, 1e-9), MAL = clampPos(y.MAL, 1e-9);
    const OAA = clampPos(y.OAA, 1e-12), ASP = clampPos(y.ASP, 1e-12);
    const Ca_m = clampPos(y.Ca_m, 1e-6);        // µM
    const dPsi = y.dPsi;                          // V
    const ROS = clampPos(y.ROS, 0);
    const Pptp = Math.min(1, clampPos(y.Pptp, 0));

    // conserved pools
    const ATP_m = clampPos(P.pools.Cm - ADP_m, 1e-6);
    const NAD = clampPos(P.pools.C_PN - NADH, 1e-6);
    const CIT = clampPos(P.pools.C_Kint - (ISOC + aKG + SCoA + Suc + FUM + MAL + OAA), 1e-9);
    const H = P.fixed.H, Pi = P.fixed.Pi, Mg = P.fixed.Mg, CoA = P.fixed.CoA, GLU = P.fixed.GLU;

    // ---- TCA cycle (verbatim) ----
    const cs = P.CS, aco = P.ACO, idh = P.IDH, kg = P.KGDH, sl = P.SL, sdh = P.SDH, mdh = P.MDH, fh = P.FH, aat = P.AAT;
    const V_CS = (cs.Kcat_CS * cs.ET_CS) / (1 + cs.Km_AcCoA / AcCoA + cs.Km_OAA / OAA + (cs.Km_AcCoA / AcCoA) * (cs.Km_OAA / OAA));
    const V_ACO = aco.Kf_ACO * (CIT - ISOC / aco.KE_ACO);
    const V_IDH = (idh.Kcat_IDH * idh.ET_IDH) / (1 + H / idh.Kh_1 + idh.Kh_2 / H
      + Math.pow(idh.Km_ISOC / ISOC, idh.ni) / ((1 + ADP_m / idh.Ka_ADP) * (1 + Ca_m / idh.Ka_Ca))
      + (idh.Km_NAD / NAD) * (1 + NADH / idh.Ki_NADH)
      + (Math.pow(idh.Km_ISOC / ISOC, idh.ni) * (idh.Km_NAD / NAD) * (1 + NADH / idh.Ki_NADH)) / ((1 + ADP_m / idh.Ka_ADP) * (1 + Ca_m / idh.Ka_Ca)));
    const V_KGDH = (kg.Kcat_KGDH * kg.ET_KGDH) / (1
      + Math.pow(kg.Km_alpha_KG / aKG, kg.n_alpha_KG) / ((1 + Mg / kg.Kd_Mg) * (1 + Ca_m / kg.Kd_Ca))
      + (kg.Km_NAD / NAD) / ((1 + Mg / kg.Kd_Mg) * (1 + Ca_m / kg.Kd_Ca)));
    const V_SL = sl.kf_SL * (SCoA * ADP_m - (Suc * ATP_m * CoA) / sl.Ke_SL);
    const V_SDH = (sdh.Kcat_SDH * sdh.ET_SDH) / (1 + (sdh.Km_Suc / Suc) * (1 + OAA / sdh.Kisdh_OAA) * (1 + FUM / sdh.Ki_FUM));
    const fh_a = 1 / (1 + H / mdh.kh1 + (H * H) / (mdh.kh1 * mdh.kh2)) + mdh.k_offset;
    const fh_i = Math.pow(1 / (1 + mdh.kh3 / H + (mdh.kh3 * mdh.kh4) / (H * H)), 2);
    const V_MDH = (mdh.Kcat_MDH * mdh.ET_MDH * fh_a * fh_i) / (1
      + (mdh.Km_MAL / MAL) * (1 + OAA / mdh.Ki_OAA) + mdh.Km_NAD / NAD
      + (mdh.Km_MAL / MAL) * (1 + OAA / mdh.Ki_OAA) * (mdh.Km_NAD / NAD));
    const V_FH = fh.kf_FH * (FUM - MAL / fh.Ke_FH);
    const V_AAT = aat.kf_AAT * (OAA * GLU - (aKG * ASP) / aat.Ke_AAT);
    const V_C_ASP = aat.k_C_ASP * ASP;

    // ---- oxidative phosphorylation (verbatim, with proton-motive force) ----
    const ox = P.oxphos;
    const dmuH = RTF * P.fixed.delta_pH + dPsi;           // delta_mu_H (V)
    const Ares = RTF * Math.log(ox.Kres * Math.sqrt(NADH / NAD));
    const Ares_F = RTF * Math.log(ox.Kres_F * Math.sqrt(P.fixed.FADH2 / P.fixed.FAD));
    const eAr = Math.exp(Ares * F_RT), eArF = Math.exp(Ares_F * F_RT);
    const eB = Math.exp(6 * P.oxphos.delta_psi_B * F_RT);
    const eMu = Math.exp(ox.g * 6 * dmuH * F_RT);
    const denRes = (1 + ox.r1 * eAr) * eB + (ox.r2 + ox.r3 * eAr) * eMu;
    const denResF = (1 + ox.r1 * eArF) * eB + (ox.r2 + ox.r3 * eArF) * eMu;
    const V_O2 = roten * cyan * 0.5 * ox.rho_res * (((ox.ra + ox.rc1 * eB) * eAr - ox.ra * eMu + ox.rc2 * eAr * eMu) / denRes);
    const V_He = roten * cyan * 6 * ox.rho_res * ((ox.ra * eAr - (ox.ra + ox.rb) * eMu) / denRes);
    const V_He_F = cyan * 6 * ox.rho_res_F * ((ox.ra * eArF - (ox.ra + ox.rb) * eMu) / denResF);
    const V_Hleak = ox.gH * (1 + 3000 * fccp) * dmuH;     // uncoupler massively raises the leak → ΔΨ collapses

    const AF1 = RTF * Math.log(ox.KF1 * ATP_m / (ADP_m * Pi));
    const eAF1 = Math.exp(AF1 * F_RT);
    const eB3 = Math.exp(3 * ox.delta_psi_B * F_RT);
    const eMu3 = Math.exp(3 * dmuH * F_RT);
    const denF1 = (1 + ox.p1 * eAF1) * eB3 + (ox.p2 + ox.p3 * eAF1) * eMu3;
    // F1F0 ATP synthase. The leading minus makes the synthase self-limit toward
    // equilibrium AF1 ≈ 3·Δμ_H: net ATP synthesis is positive when the
    // phosphorylation potential sits below the proton-motive drive and reverses
    // to hydrolysis above it. The proton flux is stoichiometrically coupled at
    // 3 H⁺ per ATP (V_Hu = 3·V_ATPase) — this keeps the two thermodynamically
    // consistent (the published CellML's separate V_Hu expression has an
    // inconsistent sign and is the documented reason it 'will not integrate').
    const V_ATPase = oligo * (-ox.rho_F1) * (((100 * ox.pa + ox.pc1 * eB3) * eAF1 - (ox.pa * eMu3 + ox.pc2 * eAF1 * eMu3)) / denF1);
    const V_Hu = 3 * V_ATPase;

    // ---- adenine nucleotide translocase & Ca handling ----
    const ca = P.ca;
    // ANT voltage term uses the constant delta_psi_0 (as encoded in the source).
    const V_ANT = ca.Vmax_ANT * ((1 - (0.05 * P.fixed.ATP_i * 0.45 * 0.8 * ADP_m) / (0.45 * ADP_i * 0.05 * ATP_m))
      / ((1 + (0.05 * P.fixed.ATP_i) / (0.45 * ADP_i) * Math.exp(-ca.h * ca.delta_psi_0 * F_RT))
        * (1 + (0.45 * 0.8 * ADP_m) / (0.05 * ATP_m))));
    const dPsiDrive = dPsi - ca.delta_psi_0;
    const V_uni = ca.Vmax_uni * ((Ca_i / ca.K_trans) * Math.pow(1 + Ca_i / ca.K_trans, 3) * (2 * dPsiDrive * F_RT)
      / (Math.pow(1 + Ca_i / ca.K_trans, 4) + (ca.L / Math.pow(1 + Ca_i / ca.K_act, ca.na)) * (1 - Math.exp(-2 * dPsiDrive * F_RT))));
    // documented fix: matrix/cytosol ratio so the exchanger exports matrix Ca2+
    const V_NaCa = ca.Vmax_NaCa * (Math.exp(ca.b * dPsiDrive * F_RT) * (Ca_m / Ca_i)
      / (Math.pow(1 + ca.KNa / P.fixed.Na_i, ca.n) * (1 + ca.KCa / Ca_m)));

    // ---- ROS (matrix superoxide, µM): shunt production, SOD + autocatalytic IMAC ----
    const r = P.ros;
    const imacOpen = hill(ROS, r.kappa_IMAC, 2);                 // ROS-induced ROS release
    const V_ROSprod = shunt * Math.max(0, V_O2) * r.ros_conv;    // µM/s
    const V_IMAC_psi = r.k_IMAC * imacOpen * Math.max(0, dPsi);  // depolarising charge flux (mM/s)
    const V_ROS = V_ROSprod - r.k_SOD * ROS - r.k_scav_i * imacOpen * ROS;

    // ---- permeability transition pore (Ca/ROS-gated) ----
    const pt = P.ptp;
    const gateCa = hill(Ca_m, pt.K_Ca_ptp, pt.n_Ca_ptp);
    const gateROS = hill(ROS, pt.K_ROS_ptp, 2);
    const Pinf = Math.min(1, Math.max(ctrl.ptpTrigger || 0, gateCa * (0.4 + 0.6 * gateROS)));
    const V_PTP_psi = pt.g_ptp_psi * Pptp * Math.max(0, dPsi);  // collapses ΔΨ
    const V_PTP_Ca = pt.k_ptp_Ca * Pptp * (Ca_m - Ca_i);       // releases matrix Ca²⁺

    return {
      V_CS, V_ACO, V_IDH, V_KGDH, V_SL, V_SDH, V_MDH, V_FH, V_AAT, V_C_ASP,
      V_O2, V_He, V_He_F, V_Hleak, V_ATPase, V_Hu, V_ANT, V_uni, V_NaCa,
      V_ROSprod, V_IMAC_psi, V_ROS, V_PTP_psi, V_PTP_Ca, Pinf, imacOpen,
      dmuH, Ares, AF1, ATP_m, NAD, CIT, Ca_i, ADP_i,
    };
  }

  function derivatives(t, y, ctx) {
    const v = fluxes(y, ctx);
    const ca = P.ca;
    return {
      ADP_m: v.V_ANT - (v.V_ATPase + v.V_SL),
      NADH: -v.V_O2 + v.V_IDH + v.V_KGDH + v.V_MDH,
      ISOC: v.V_ACO - v.V_IDH,
      aKG: v.V_AAT + v.V_IDH - v.V_KGDH,
      SCoA: v.V_KGDH - v.V_SL,
      Suc: v.V_SL - v.V_SDH,
      FUM: v.V_SDH - v.V_FH,
      MAL: v.V_FH - v.V_MDH,
      OAA: v.V_MDH - (v.V_CS + v.V_AAT),
      ASP: v.V_AAT - v.V_C_ASP,
      // matrix Ca²⁺ (µM): uniporter in, exchanger + pore out; f = free fraction
      Ca_m: ca.f_Ca * ca.ca_conv * (v.V_uni - v.V_NaCa) - v.V_PTP_Ca,
      // inner-membrane potential charge balance (V/s)
      dPsi: (v.V_He + v.V_He_F - v.V_Hu - v.V_ANT - v.V_Hleak - v.V_NaCa - 2 * v.V_uni - v.V_IMAC_psi - v.V_PTP_psi) / Cmito,
      ROS: v.V_ROS,
      Pptp: (v.Pinf - y.Pptp) / P.ptp.tau_ptp,
    };
  }

  const y0 = {
    ADP_m: P.init.ADP_m, NADH: P.init.NADH, ISOC: P.init.ISOC, aKG: P.init.alpha_KG,
    SCoA: P.init.SCoA, Suc: P.init.Suc, FUM: P.init.FUM, MAL: P.init.MAL, OAA: P.init.OAA,
    ASP: P.init.ASP, Ca_m: P.init.Ca_m, dPsi: P.init.delta_psi_m, ROS: 0.02, Pptp: 0,
  };

  // Keep every state variable within its physical bounds after each step. The
  // conserved pools (adenine, pyridine, Krebs intermediates) cannot exceed their
  // totals or go negative; ΔΨ, Ca, ROS and the pore fraction are non-negative.
  const TCA_KEYS = ['ISOC', 'aKG', 'SCoA', 'Suc', 'FUM', 'MAL', 'OAA'];
  function stepHook(t, y) {
    y.ADP_m = Math.min(P.pools.Cm - 1e-4, Math.max(1e-4, y.ADP_m));
    y.NADH = Math.min(P.pools.C_PN - 1e-4, Math.max(1e-4, y.NADH));
    let sum = 0;
    for (const k of TCA_KEYS) { y[k] = Math.max(1e-7, y[k]); sum += y[k]; }
    if (sum > P.pools.C_Kint - 1e-4) { const s = (P.pools.C_Kint - 1e-4) / sum; for (const k of TCA_KEYS) y[k] *= s; }
    y.ASP = Math.max(1e-7, y.ASP);
    y.Ca_m = Math.max(1e-4, y.Ca_m);
    y.dPsi = Math.min(0.30, Math.max(0, y.dPsi));
    y.ROS = Math.max(0, y.ROS);
    y.Pptp = Math.min(1, Math.max(0, y.Pptp));
  }

  // ----------------------------------------------------------- view helpers
  function computeFluxes(y, ctx) {
    const v = fluxes(y, ctx);
    v.dPsi_mV = y.dPsi * 1000;
    return v;
  }

  function concentrations(y) {
    return {
      cyto: { ATP: 6.5, ADP: 0.05, Ca: Math.max(1e-4, 0) },
      matrix: { NADH: y.NADH, ATP: P.pools.Cm - y.ADP_m, ADP: y.ADP_m, Ca: y.Ca_m / 1000 },
    };
  }

  function observables(y, ctx) {
    const v = fluxes(y, ctx);
    const Z = 2.303 * RTF * 1000;                  // mV per pH unit (~61.5)
    const dPsi_mV = y.dPsi * 1000;
    const dPH_mV = -Z * P.fixed.delta_pH;          // chemiosmotic ΔpH contribution (+, matrix alkaline)
    return {
      DeltaPsi: dPsi_mV,
      dPsi: dPsi_mV, dPH: dPH_mV, pmf: dPsi_mV + dPH_mV,
      NADH: y.NADH, NADHfrac: y.NADH / P.pools.C_PN,
      ATPm: P.pools.Cm - y.ADP_m, ADPm: y.ADP_m, ATP_ADP: (P.pools.Cm - y.ADP_m) / Math.max(1e-6, y.ADP_m),
      Cam: y.Ca_m,
      VO2: Math.max(0, v.V_O2) * 1000, VO2max: 12,
      VATP: Math.max(0, v.V_ATPase) * 1000, VATPmax: 30,
      VANT: v.V_ANT * 1000, VHleak: v.V_Hleak,
      ROS: y.ROS, ROSmax: 1.0,
      PTP: y.Pptp,
    };
  }

  return {
    id: 'mitochondrion',
    name: 'Mitochondrion (Cortassa 2003)',
    subtitle: 'TCA cycle + oxidative phosphorylation + Ca²⁺ handling coupled through ΔΨm.',
    refs: ['cortassa_2003', 'magnus_keizer_1997', 'mitchell_1961', 'cortassa_2004', 'bernardi_2015'],
    stateKeys: STATE_KEYS,
    compartments: [
      { id: 'cyto', name: 'Cytosol / intermembrane space', extracellular: true },
      { id: 'matrix', name: 'Matrix', extracellular: false },
    ],
    species: SPECIES,
    transporters: TRANSPORTERS,
    y0, derivatives, stepHook, computeFluxes, concentrations, observables,
  };
}

export const SPECIES = [
  { id: 'NADH', name: 'NADH', symbol: 'NADH', z: 0, color: '#2563eb' },
  { id: 'ATP', name: 'ATP', symbol: 'ATP', z: 0, color: '#22c55e' },
  { id: 'Ca', name: 'Calcium', symbol: 'Ca²⁺', z: +2, color: '#ef4444' },
  { id: 'H', name: 'Proton', symbol: 'H⁺', z: +1, color: '#f59e0b' },
];

// Inner-membrane complexes and carriers (drawn as glyphs by the schematic).
export const TRANSPORTERS = [
  { id: 'CI', short: 'I', name: 'Complex I (NADH dehydrogenase)', cls: 'etc', moves: ['H'],
    equation: 'oxidises NADH; pumps H⁺ (part of V_He, ρ_res)', refs: ['cortassa_2003'],
    blurb: 'Accepts electrons from NADH and pumps protons out of the matrix. Blocked by rotenone.' },
  { id: 'CII', short: 'II', name: 'Complex II (succinate dehydrogenase)', cls: 'etc', moves: [],
    equation: 'oxidises succinate → FADH₂ (V_SDH; feeds V_He_F)', refs: ['cortassa_2003'],
    blurb: 'Feeds electrons from the TCA cycle (FADH₂) into the chain without pumping protons.' },
  { id: 'CIII', short: 'III', name: 'Complex III (cytochrome bc₁)', cls: 'etc', moves: ['H'],
    equation: 'pumps H⁺ (part of V_He)', refs: ['cortassa_2003'],
    blurb: 'Passes electrons to cytochrome c and pumps protons. Blocked by antimycin A.' },
  { id: 'CIV', short: 'IV', name: 'Complex IV (cytochrome c oxidase)', cls: 'etc', moves: ['H'],
    equation: 'reduces O₂ → H₂O; pumps H⁺ (V_O2, V_He)', refs: ['cortassa_2003'],
    blurb: 'Reduces O₂ to water — the terminal electron acceptor. Blocked by cyanide.' },
  { id: 'CV', short: 'V', name: 'Complex V (F₁F₀-ATP synthase)', cls: 'synthase', moves: ['H'],
    equation: 'V_ATPase / V_Hu: H⁺ in → ATP from ADP + Pi', refs: ['cortassa_2003', 'magnus_keizer_1997'],
    blurb: 'Lets protons flow back into the matrix and uses the energy to make ATP. Blocked by oligomycin.' },
  { id: 'ANT', short: 'ANT', name: 'Adenine nucleotide translocase', cls: 'carrier', moves: ['ATP'],
    equation: 'V_ANT: matrix ATP⁴⁻ out ⇄ cytosolic ADP³⁻ in', refs: ['cortassa_2003'],
    blurb: 'Exports newly made ATP to the cytosol in exchange for ADP. Electrogenic.' },
  { id: 'leak', short: 'leak', name: 'Proton leak', cls: 'leak', moves: ['H'],
    equation: 'V_Hleak = g_H·Δμ_H', refs: ['cortassa_2003'],
    blurb: 'Passive proton return that dissipates ΔΨm as heat. Hugely increased by uncouplers (FCCP/DNP).' },
  { id: 'MCU', short: 'MCU', name: 'Ca²⁺ uniporter', cls: 'uniporter', moves: ['Ca'],
    equation: 'V_uni: ΔΨ-driven matrix Ca²⁺ uptake', refs: ['cortassa_2003'],
    blurb: 'Drives Ca²⁺ into the matrix down the huge electrical gradient; couples Ca²⁺ signals to metabolism.' },
  { id: 'NCLX', short: 'NCLX', name: 'Na⁺/Ca²⁺ exchanger', cls: 'exchanger', moves: ['Ca'],
    equation: 'V_NaCa: exports matrix Ca²⁺ for Na⁺', refs: ['cortassa_2003'],
    blurb: 'Extrudes matrix Ca²⁺ in exchange for Na⁺, setting the resting matrix Ca²⁺ level.' },
  { id: 'IMAC', short: 'IMAC', name: 'ROS / inner-membrane anion channel', cls: 'ros', moves: [],
    equation: 'superoxide-activated anion efflux (depolarising)', refs: ['cortassa_2004', 'zhou_2009'],
    blurb: 'Carries superoxide out of the matrix; activated by ROS (ROS-induced ROS release) and depolarises ΔΨm.' },
  { id: 'PTP', short: 'PTP', name: 'Permeability transition pore', cls: 'ptp', moves: ['Ca'],
    equation: 'Ca/ROS-gated; collapses ΔΨ, releases Ca²⁺', refs: ['bernardi_2015', 'pokhilko_2006'],
    blurb: 'A Ca²⁺/ROS-triggered megachannel. Opening collapses ΔΨm and dumps matrix Ca²⁺ — the path to cell death.' },
];
