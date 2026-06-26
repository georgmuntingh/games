// Guided lessons for the ventricular cardiomyocyte (Luo–Rudy I).
//
// controls keys: paced (bool), bcl (ms), naBlock, caBlock, kBlock, k1Block
// (0–1 conductance block). A step may also request a single stimulus via
// `stimulate: true` (the host fires one suprathreshold pulse on entry).

export const cardiomyocyteLessons = [
  {
    id: 'ap-phases',
    title: '1 · The action potential, phase by phase',
    steps: [
      {
        title: 'Resting cell (phase 4)',
        html: `At rest the cardiomyocyte sits near −85 mV, held there by the
          inward-rectifier K⁺ current <strong>I_K1</strong> (Vm ≈ E_K). Nothing happens
          until a wave of excitation arrives from a neighbouring cell. Press
          <strong>Stimulate</strong> (or enable pacing) to inject a depolarising current.`,
        eq: `Resting: I_K1 dominates, Vm ≈ E_K1 = (RT/F)·ln([K]o/[K]i) ≈ −85 mV`,
        observe: `Watch the flat resting potential. I_K1's arrow is the active one.`,
        controls: { paced: false }, tint: 'Ca', highlight: ['IK1'], speed: 400, reset: true,
      },
      {
        title: 'Upstroke (phase 0) — fire!',
        html: `A stimulus pushes Vm past threshold (~−65 mV). Voltage-gated
          <strong>Na⁺ channels (I_Na)</strong> snap open (gate m), Na⁺ floods in, and Vm
          rockets to ≈ +40 mV in under 2 ms — the <strong>rapid upstroke</strong>. The
          channels then inactivate (gates h, j).`,
        eq: `I_Na = G_Na·m³·h·j·(V − E_Na);  dV/dt up to ~300 mV/ms`,
        observe: `Hit Stimulate and watch the near-vertical upstroke and the spike in I_Na.`,
        controls: { paced: false }, tint: 'Ca', highlight: ['INa'], speed: 250, stimulate: true, reset: true,
      },
      {
        title: 'Plateau (phase 2) — the cardiac signature',
        html: `What makes a cardiac AP special: a long <strong>plateau</strong>. Inward
          Ca²⁺ through the <strong>slow inward current I_si</strong> nearly balances outward
          K⁺, holding Vm near 0 mV for ~200 ms. That Ca²⁺ entry triggers
          contraction, and the long plateau gives the heart its refractory
          period — preventing tetanus.`,
        eq: `Plateau: I_si (Ca²⁺ in) ≈ I_K + I_Kp (K⁺ out), Vm ≈ 0 mV`,
        observe: `During the plateau, [Ca²⁺]i rises (toggle the µM trace) — the link to contraction.`,
        controls: { paced: false }, tint: 'Ca', highlight: ['Isi'], speed: 250, stimulate: true, reset: true,
      },
      {
        title: 'Repolarisation (phase 3) & recovery',
        html: `The Ca²⁺ current inactivates while the <strong>delayed rectifier I_K</strong>
          (gate X) keeps activating. Outward K⁺ now wins and Vm falls back toward
          E_K; I_K1 finishes the job and restores phase 4. The cell is ready for
          the next beat.`,
        eq: `Phase 3: I_K and I_K1 (K⁺ out) repolarise Vm → −85 mV`,
        observe: `Watch I_K grow as the plateau ends and Vm slides back to rest.`,
        controls: { paced: false }, tint: 'Ca', highlight: ['IK', 'IK1'], speed: 250, stimulate: true, reset: true,
      },
    ],
  },
  {
    id: 'pacing',
    title: '2 · Pacing and rate',
    steps: [
      {
        title: 'Drive the cell at a steady rhythm',
        html: `Enable <strong>pacing</strong> to stimulate the cell every <em>basic cycle
          length</em> (BCL). At 500 ms (2 Hz) you get a regular train of action
          potentials. Lower the BCL (faster heart rate) and the AP duration
          <strong>shortens</strong> — rate adaptation, an emergent property of the
          channel kinetics.`,
        eq: `Pacing: stimulate when (t mod BCL) < t_stim`,
        observe: `Watch a regular AP train. Try lowering BCL in the sandbox to see APD shorten.`,
        controls: { paced: true, bcl: 500 }, tint: 'Ca', highlight: ['INa', 'Isi'], speed: 400, reset: true,
      },
    ],
  },
  {
    id: 'drugs',
    title: '3 · Channel blockers & arrhythmia',
    steps: [
      {
        title: 'Sodium-channel block (class I / local anaesthetic)',
        html: `Block <strong>I_Na</strong> and the upstroke fails — the cell can barely
          depolarise. This is how local anaesthetics and class-I antiarrhythmics
          slow conduction; too much, and excitability is lost.`,
        eq: `Reduce G_Na → smaller, slower upstroke (lower dV/dt_max)`,
        observe: `With I_Na blocked, Stimulate produces little or no upstroke.`,
        controls: { paced: false, naBlock: 1 }, tint: 'Ca', highlight: ['INa'], speed: 250, stimulate: true, reset: true,
      },
      {
        title: 'Potassium-channel block (class III / long QT)',
        html: `Block the delayed rectifier <strong>I_K</strong> and repolarisation is
          crippled: the plateau drags on and the <strong>AP duration balloons</strong>.
          This is the action of class-III antiarrhythmics — and, taken too far,
          the mechanism of drug-induced <strong>long-QT</strong> and dangerous arrhythmias.`,
        eq: `Reduce G_K → delayed phase 3 → prolonged APD`,
        observe: `Compare the APD here with lesson 1 — it is dramatically longer.`,
        controls: { paced: false, kBlock: 1 }, tint: 'Ca', highlight: ['IK', 'IKp'], speed: 250, stimulate: true, reset: true,
      },
      {
        title: 'Calcium-channel block',
        html: `Block <strong>I_si</strong> and the plateau collapses — Vm repolarises
          early and little Ca²⁺ enters, so contraction weakens. This is how
          L-type Ca²⁺-channel blockers reduce contractility and shorten the
          plateau.`,
        eq: `Reduce G_si → loss of plateau, smaller [Ca²⁺]i transient`,
        observe: `The plateau is gone and the [Ca²⁺]i rise (µM trace) is much smaller.`,
        controls: { paced: false, caBlock: 1 }, tint: 'Ca', highlight: ['Isi'], speed: 250, stimulate: true, reset: true,
      },
    ],
  },
];
