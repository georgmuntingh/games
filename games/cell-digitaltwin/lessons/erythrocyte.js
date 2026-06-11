// Guided lessons for the erythrocyte. Each lesson is a sequence of steps. A step
// can: set sandbox controls (merged onto a clean baseline), highlight
// transporters on the schematic, choose the tint species, set a playback speed,
// and reset the simulation. `html` is shown as the narrative; `eq` (shown only
// when "Show equations & sources" is on) carries the maths; `observe` is a
// highlighted "what to watch for" note.
//
// controls keys: ouabain, pmcaBlock, band3block, gardosBlock, glut1block,
// noGlucose, closedGlucose, tonicity (1 = isotonic).

export const erythrocyteLessons = [
  {
    id: 'resting',
    title: '1 · Resting potential & the Donnan equilibrium',
    steps: [
      {
        title: 'A cell at rest',
        html: `The red cell sits near electrochemical equilibrium. Trapped inside is
          a large <strong>impermeant anion</strong> (haemoglobin + organic phosphates).
          Because it cannot leave, the permeant ions redistribute into a
          <strong>Gibbs–Donnan</strong> equilibrium: Cl⁻ ends up <em>lower</em> inside than
          out, and the membrane voltage settles near the Cl⁻ equilibrium potential.`,
        eq: `E_Cl = −(RT/F)·ln([Cl]o/[Cl]i) ≈ −12 mV     (Goldman, Cl⁻-dominated)`,
        observe: `Watch Vm settle near −10 to −12 mV, and note [Cl⁻]i (~75 mM) sitting below plasma (116 mM).`,
        controls: {}, tint: 'Cl', highlight: ['band3'], speed: 20, reset: true,
      },
      {
        title: 'Why Band 3 sets the voltage',
        html: `The membrane is overwhelmingly permeable to Cl⁻ through <strong>Band 3
          (AE1)</strong> — the most abundant membrane protein in the red cell. With one
          ion dominating the conductance, the Goldman voltage collapses onto that
          ion's Nernst potential. That is why the red cell's resting potential is
          set by chloride, not potassium (unlike a neuron).`,
        eq: `Vm = (RT/F)·ln[(P_Na[Na]o+P_K[K]o+P_Cl[Cl]i)/(P_Na[Na]i+P_K[K]i+P_Cl[Cl]o)]`,
        observe: `Compare E_Na, E_K, E_Cl in the readouts: Vm tracks E_Cl, far from E_K (−89 mV).`,
        controls: {}, tint: 'Cl', highlight: ['band3', 'naleak', 'kleak'], speed: 20,
      },
    ],
  },
  {
    id: 'pumpleak',
    title: '2 · The pump–leak balance',
    steps: [
      {
        title: 'Gradients leak away',
        html: `Na⁺ constantly leaks <em>in</em> and K⁺ leaks <em>out</em> down their
          gradients. The <strong>Na⁺/K⁺-ATPase</strong> pushes them back: 3 Na⁺ out and
          2 K⁺ in per ATP. At steady state, pump flux exactly balances leak flux —
          the gradients are maintained at a metabolic cost.`,
        eq: `J_pump = I_max·h(Na_i;K_m,3)·h(K_o;K_m,2)·MM(ATP);  3 Na⁺ : 2 K⁺ : 1 ATP`,
        observe: `At rest Na_i ≈ 10 mM, K_i ≈ 140 mM hold steady. The pump is electrogenic (net +1 charge out per cycle).`,
        controls: {}, tint: 'Na', highlight: ['nakatpase', 'naleak', 'kleak'], speed: 30, reset: true,
      },
      {
        title: 'Poison the pump with ouabain',
        html: `<strong>Ouabain</strong> (a cardiac glycoside) blocks the Na⁺/K⁺-ATPase.
          With the pump off, only the leaks remain: Na⁺ creeps up and K⁺ falls.
          The red cell's leak is slow, so run-down takes hours — which is exactly
          why <em>stored blood</em> slowly loses K⁺ into the plasma.`,
        observe: `Crank up the speed and watch Na_i rise / K_i fall over simulated hours. Vm drifts as the gradients collapse.`,
        controls: { ouabain: 1 }, tint: 'Na', highlight: ['nakatpase'], speed: 120,
      },
    ],
  },
  {
    id: 'band3',
    title: '3 · Band 3 and the chloride shift',
    steps: [
      {
        title: 'Carrying CO₂ in the blood',
        html: `In tissues, CO₂ enters the red cell and carbonic anhydrase makes
          HCO₃⁻. <strong>Band 3</strong> swaps that HCO₃⁻ out for plasma Cl⁻ — the
          <strong>chloride shift</strong> (Hamburger shift). This electroneutral 1:1
          antiport lets blood carry far more CO₂ than dissolved gas alone, and
          reverses in the lungs.`,
        eq: `J_Cl,in = k·([Cl]o[HCO₃]i − [Cl]i[HCO₃]o)   (electroneutral Cl⁻/HCO₃⁻ exchange)`,
        observe: `Cl⁻ and HCO₃⁻ stay at their cross-equilibrium ratio. Block Band 3 to see the exchange (and the Cl⁻-set voltage) fail.`,
        controls: {}, tint: 'HCO3', highlight: ['band3'], speed: 20, reset: true,
      },
    ],
  },
  {
    id: 'gardos',
    title: '4 · The Gardos channel & dehydration',
    steps: [
      {
        title: 'Calcium opens a K⁺ door',
        html: `Free intracellular Ca²⁺ is held near 50 nM by the <strong>PMCA</strong> pump.
          If Ca²⁺ rises, it activates the <strong>Gardos channel (KCa3.1)</strong> — a
          Ca²⁺-gated K⁺ channel. K⁺ rushes out toward E_K, Cl⁻ and water follow, and
          the cell <strong>dehydrates and shrinks</strong>. This pathway drives sickle-cell
          dehydration.`,
        eq: `P_K(Gardos) = g_max·h([Ca]i; K_0.5≈0.4 µM, 2)`,
        observe: `We block the Ca²⁺ pump so Ca²⁺ climbs into the µM range. Watch the Gardos arrow open, K⁺ leave, and the cell volume fall.`,
        controls: { pmcaBlock: 1 }, tint: 'K', highlight: ['pmca', 'gardos'], speed: 40, reset: true,
      },
    ],
  },
  {
    id: 'glut1',
    title: '5 · GLUT1 and glucose uptake',
    steps: [
      {
        title: 'Facilitated diffusion, no ATP',
        html: `Glucose enters through <strong>GLUT1</strong>, a uniporter that simply lets
          glucose move <em>down</em> its concentration gradient — fast, saturable, and
          ATP-free. It is so abundant that intracellular glucose stays near plasma
          levels. GLUT1 is the textbook example of <strong>facilitated diffusion</strong>.`,
        eq: `J = V_max·([Glc]o − [Glc]i)/(K_m + [Glc]o + [Glc]i),  K_m ≈ 1.5 mM`,
        observe: `Net flux is near zero at rest (glucose nearly equilibrated). Block GLUT1 and intracellular glucose — and ATP — fall as glycolysis starves.`,
        controls: {}, tint: 'glucose', highlight: ['glut1'], speed: 30, reset: true,
      },
    ],
  },
  {
    id: 'glycolysis',
    title: '6 · Glycolysis, 2,3-BPG and ATP',
    steps: [
      {
        title: 'The only power source',
        html: `Red cells have no mitochondria, so <strong>anaerobic glycolysis</strong> is
          their sole ATP supply (glucose → 2 lactate, net 2 ATP). That ATP runs the
          ion pumps — metabolism and transport are coupled. The
          <strong>Rapoport–Luebering (2,3-BPG) shunt</strong> diverts flux to make 2,3-BPG,
          which lowers haemoglobin's O₂ affinity to release O₂ to tissues.`,
        eq: `glucose → 2 lactate + 2 ATP (net);  shunt: 1,3-BPG → 2,3-BPG → 3-PG`,
        observe: `ATP ≈ 1.8 mM and 2,3-BPG ≈ 5 mM hold steady while the pumps draw on ATP.`,
        controls: {}, tint: 'ATP', highlight: ['glut1', 'nakatpase', 'pmca'], speed: 30, reset: true,
      },
      {
        title: 'Starve the cell',
        html: `Remove glucose. Glycolysis stops, ATP falls, and the ATP-dependent
          pumps fail one after another: Na⁺ floods in, K⁺ leaks out, Ca²⁺ rises and
          opens the Gardos channel, and the cell loses its gradients — the metabolic
          death of a stored or starved red cell.`,
        observe: `Watch ATP collapse, then Na_i climb and Ca²⁺ rise as the pumps run out of fuel.`,
        controls: { noGlucose: true, closedGlucose: true }, tint: 'ATP', highlight: ['nakatpase', 'pmca'], speed: 60,
      },
    ],
  },
  {
    id: 'volume',
    title: '7 · Osmotic volume regulation',
    steps: [
      {
        title: 'Water follows solute',
        html: `The membrane is freely permeable to water (via aquaporin-1). Cell
          volume is set by <strong>osmotic balance</strong>: water moves until internal and
          external osmolarity match. The impermeant anion would tend to swell the
          cell (colloid osmosis); the Na⁺ pump opposes this by exporting solute —
          the <strong>pump–leak volume stabiliser</strong>.`,
        eq: `dV/dt ∝ (Osm_in − Osm_out);  Osm includes every dissolved solute`,
        observe: `At rest, volume is steady (relative volume ≈ 1).`,
        controls: {}, tint: 'Na', highlight: ['nakatpase'], speed: 20, reset: true,
      },
      {
        title: 'Hypotonic shock',
        html: `Drop the external osmolarity (dilute the plasma). Water rushes in and
          the cell <strong>swells</strong>. Push far enough and a real red cell would
          haemolyse. Use the tonicity slider in the sandbox to explore.`,
        observe: `Relative volume jumps above 1 and the cell visibly swells; intracellular concentrations dilute.`,
        controls: { tonicity: 0.6 }, tint: 'Na', highlight: [], speed: 15,
      },
      {
        title: 'Hypertonic shock',
        html: `Now raise external osmolarity. Water leaves and the cell
          <strong>shrinks and crenates</strong>. Volume regulation in real cells engages
          K–Cl and Na–K–2Cl cotransporters to recover — a story for a richer model.`,
        observe: `Relative volume falls below 1; the cell shrinks and contents concentrate.`,
        controls: { tonicity: 1.5 }, tint: 'Na', highlight: [], speed: 15,
      },
    ],
  },
];
