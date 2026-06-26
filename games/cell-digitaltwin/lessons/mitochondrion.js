// Guided lessons for the mitochondrion. Each step sets sandbox controls,
// highlights complexes/carriers, and (optionally) re-tints the matrix.

export const mitochondrionLessons = [
  {
    title: '1 · Chemiosmosis & the proton-motive force',
    steps: [
      {
        title: 'The electron transport chain',
        html: `The TCA cycle feeds electrons (as <strong>NADH</strong> and FADH₂) into Complexes I–IV.
          As electrons pass down the chain, Complexes I, III and IV <strong>pump protons</strong> out of
          the matrix, building the inner-membrane potential <strong>ΔΨm</strong>. Watch the proton
          arrows and the ΔΨm gauge.`,
        eq: 'NADH → Complex I → III → IV → O₂;  H⁺ pumped out',
        controls: {}, highlight: ['CI', 'CIII', 'CIV'], tint: 'psi', reset: true,
        observe: 'The matrix charges up (cool→deep tint) and the Δp gauge fills as protons accumulate outside.',
      },
      {
        title: 'Δp = ΔΨ + ΔpH',
        html: `The proton-motive force <strong>Δp</strong> has two parts: the electrical
          <strong>ΔΨ</strong> (most of it, ~150–180 mV) and the chemical <strong>ΔpH</strong>. Together
          they store the energy of respiration. The gauge below the diagram shows the split.`,
        eq: 'Δp = ΔΨ − (2.303·RT/F)·ΔpH',
        controls: {}, highlight: ['CI', 'CIV'],
      },
      {
        title: 'ATP synthase taps the gradient',
        html: `<strong>Complex V (F₁F₀-ATP synthase)</strong> lets protons flow back into the matrix and
          uses that energy to make <strong>ATP</strong> from ADP + Pi. The <strong>ANT</strong> then trades
          matrix ATP for cytosolic ADP. This is oxidative phosphorylation.`,
        eq: 'ADP + Pi + 3 H⁺(out) → ATP + 3 H⁺(in)',
        controls: {}, highlight: ['CV', 'ANT'],
      },
    ],
  },
  {
    title: '2 · States of respiration',
    steps: [
      {
        title: 'State 4 — resting',
        html: `With little ADP available, ATP synthase has nothing to phosphorylate, so protons can't
          flow back: ΔΨm stays <strong>high</strong>, NADH stays <strong>reduced</strong>, and O₂ uptake
          is low. This is <strong>state 4</strong>.`,
        controls: { adp: 0.05 }, highlight: ['CV'], tint: 'nadh', reset: true,
        observe: 'High ΔΨm, NADH near fully reduced, slow O₂ uptake.',
      },
      {
        title: 'State 3 — active',
        html: `Add <strong>ADP</strong>: now ATP synthase runs, protons flow back in, and respiration
          speeds up to re-pump them. O₂ uptake and ATP synthesis <strong>jump</strong>, NADH becomes more
          oxidised, ΔΨm dips slightly. This is <strong>state 3</strong>. Raise the ADP slider and watch.`,
        eq: 'respiratory control ratio = V_O2(state 3) / V_O2(state 4)',
        controls: { adp: 0.3 }, highlight: ['CV', 'ANT'], tint: 'nadh',
        observe: 'O₂ uptake and ATP synthesis rise sharply when ADP is added.',
      },
      {
        title: 'Respiratory control',
        html: `When the ADP is used up, the mitochondrion falls back to state 4 — respiration is
          <strong>controlled by demand</strong>. Toggle the ADP slider between low and high to drive the
          state 4 ↔ state 3 transition; the ratio of the two O₂-uptake rates is the
          <strong>respiratory control ratio</strong>.`,
        controls: { adp: 0.05 }, highlight: ['CIV'],
      },
    ],
  },
  {
    title: '3 · Inhibitors & uncoupling',
    steps: [
      {
        title: 'Block Complex IV (cyanide)',
        html: `<strong>Cyanide</strong> blocks Complex IV, the terminal oxidase. Electrons can no longer
          reach O₂, so the whole chain backs up: <strong>O₂ uptake stops</strong> and NADH piles up fully
          reduced. Slide cyanide up.`,
        controls: { cyanide: 1 }, highlight: ['CIV'], tint: 'nadh', reset: true,
        observe: 'O₂ uptake falls to zero and NADH saturates — the chain is jammed.',
      },
      {
        title: 'Block ATP synthase (oligomycin)',
        html: `<strong>Oligomycin</strong> blocks Complex V. Protons can't return through the synthase, so
          ΔΨm stays high but <strong>ATP synthesis stops</strong> and respiration slows (state-4-like) —
          the chain has nowhere to put the energy.`,
        controls: { oligomycin: 1 }, highlight: ['CV'], tint: 'psi',
        observe: 'ATP synthesis stops; ΔΨm stays high and O₂ uptake falls.',
      },
      {
        title: 'Uncouple (FCCP)',
        html: `An <strong>uncoupler</strong> (FCCP / DNP) is a protonophore: it carries H⁺ straight back
          across the membrane, short-circuiting the gradient. <strong>ΔΨm collapses</strong>, respiration
          runs flat-out to try to rebuild it, but <strong>no ATP is made</strong> — the energy is lost as
          heat. Slide FCCP up.`,
        eq: 'respiration uncoupled from phosphorylation',
        controls: { fccp: 1 }, highlight: ['leak', 'CV'], tint: 'psi',
        observe: 'ΔΨm collapses while O₂ uptake stays high and ATP synthesis falls to zero.',
      },
    ],
  },
  {
    title: '4 · Ca²⁺ & the permeability transition',
    steps: [
      {
        title: 'Ca²⁺ uptake',
        html: `Mitochondria buffer cytosolic <strong>Ca²⁺</strong>: the uniporter (MCU) drives Ca²⁺ into
          the matrix down the huge electrical gradient, and the Na⁺/Ca²⁺ exchanger pushes it back out.
          Matrix Ca²⁺ also <strong>stimulates the TCA dehydrogenases</strong>, matching ATP supply to demand.
          Raise cytosolic Ca²⁺ and watch the matrix fill.`,
        controls: { cai: 2 }, highlight: ['MCU', 'NCLX'], tint: 'ca', reset: true,
        observe: 'Matrix Ca²⁺ climbs as the uniporter takes it up.',
      },
      {
        title: 'Oxidative stress (ROS)',
        html: `A small fraction of electron flow leaks to form <strong>superoxide (ROS)</strong>. Normally
          antioxidants mop it up, but raising the <strong>ROS shunt</strong> lets it accumulate and open the
          inner-membrane anion channel, which begins to <strong>depolarise ΔΨm</strong> — ROS-induced ROS
          release.`,
        controls: { shunt: 0.12 }, highlight: ['IMAC'], tint: 'psi',
        observe: 'ROS rises and ΔΨm starts to sag as the anion channel opens.',
      },
      {
        title: 'The permeability transition',
        html: `Under <strong>Ca²⁺ overload</strong> (plus ROS), the <strong>permeability transition pore</strong>
          snaps open: a giant non-selective channel that <strong>collapses ΔΨm</strong>, dumps matrix Ca²⁺,
          and halts ATP synthesis — the committed step toward <strong>cell death</strong>. Push cytosolic Ca²⁺
          high, or press <em>Trigger PTP</em>.`,
        eq: 'PTP open ⇒ ΔΨm → 0, Ca²⁺ released',
        controls: { cai: 5, shunt: 0.1 }, highlight: ['PTP'], tint: 'psi',
        observe: 'ΔΨm collapses and matrix Ca²⁺ is released as the pore opens — irreversible energetic failure.',
      },
    ],
  },
];
