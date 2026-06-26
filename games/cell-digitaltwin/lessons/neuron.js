// Guided lessons for the myelinated neuron. Each step sets sandbox controls,
// highlights the relevant channels, and (optionally) fires a stimulus. The
// lesson framework (lessons/framework.js) drives them through main.js's apply().

export const neuronLessons = [
  {
    title: '1 · Action-potential fundamentals',
    steps: [
      {
        title: 'Resting potential',
        html: `At rest the neuron sits near <strong>−66 mV</strong>. The membrane is dominated by
          K⁺ leak and the delayed-rectifier, pulling toward E_K, balanced by a passive leak and the
          electrogenic <strong>Na⁺/K⁺-ATPase</strong>, which also rebuilds the Na⁺/K⁺ gradients.
          Nothing happens until the cell is pushed past threshold.`,
        eq: 'V_rest set by g_leak, g_K and the pump; E_K = (RT/F)·ln([K]o/[K]i)',
        controls: {}, highlight: ['Ileak', 'INaK'], reset: true,
        observe: 'Every compartment of the heat map is the same cool blue — the cell is uniformly polarised.',
      },
      {
        title: 'All-or-none threshold',
        html: `A current pulse that fails to reach threshold produces only a passive bump; one that
          crosses it triggers a full action potential. Try a small amplitude, then a large one —
          the spike is <strong>all-or-none</strong>.`,
        eq: 'Threshold ≈ where inward I_Na (m³h) overtakes outward I_Kd + leak',
        controls: { stimAmp: 1.5, stimDur: 1 }, highlight: ['INa', 'IKd'], stimulate: true,
        observe: 'The hillock and first node flash red first — spikes initiate where Na⁺ channels are densest.',
      },
      {
        title: 'The spike waveform',
        html: `The upstroke is carried by fast <strong>Na⁺</strong> (m³h) channels; repolarisation by the
          <strong>delayed-rectifier K⁺</strong> (n⁴). Turn on the I_Na and I_Kd traces in the plot to
          watch the inward then outward current sweep.`,
        eq: 'dV/dt = −(I_Na + I_Kd + I_leak + I_pump)/C_m',
        controls: { stimAmp: 1.5 }, highlight: ['INa', 'IKd'], stimulate: true,
      },
      {
        title: 'Refractory period',
        html: `Right after a spike the Na⁺ channels are inactivated (h ≈ 0) and K⁺ channels still open,
          so a second stimulus cannot fire — the <strong>absolute refractory period</strong>. Pacing
          faster than recovery simply drops spikes. Try pacing at a short interval.`,
        controls: { paced: true, bcl: 6, stimAmp: 2 }, highlight: ['INa'],
        observe: 'At very short intervals only some stimuli succeed — the axon enforces a maximum firing rate.',
      },
    ],
  },
  {
    title: '2 · Propagation & myelin',
    steps: [
      {
        title: 'Saltatory conduction',
        html: `The action potential regenerates only at the bare <strong>nodes of Ranvier</strong>; between
          them it spreads passively under the low-capacitance myelin. The result is a wave that appears to
          <strong>jump node to node</strong> — watch the heat map and the Vm-vs-position trace.`,
        controls: { stimAmp: 1.5 }, highlight: ['INa'], stimulate: true, reset: true,
        observe: 'Bright spots appear sequentially at the nodes, skipping the yellow myelinated segments.',
      },
      {
        title: 'Conduction velocity',
        html: `Because the signal skips the internodes, a myelinated axon conducts far faster than a bare
          one of the same diameter. The Vm-vs-position panel shows the spike sweeping rightward at a
          few metres per second.`,
        eq: 'CV rises with internode length and axon diameter',
        controls: { stimAmp: 1.5 }, highlight: ['INa'], stimulate: true,
      },
      {
        title: 'Demyelination',
        html: `Slide <strong>Demyelination</strong> up: the internodes lose their insulation, so each spike
          must charge far more membrane and leaks current. Conduction slows, and with enough damage the
          action potential <strong>fails to propagate</strong> — the basis of conduction block in diseases
          like multiple sclerosis.`,
        controls: { stimAmp: 1.5, demyelin: 0.8 }, highlight: ['INa', 'Ileak'], stimulate: true,
        observe: 'The travelling wave slows or stalls partway down the axon.',
      },
    ],
  },
  {
    title: '3 · Adaptation & the H-current',
    steps: [
      {
        title: 'Repetitive firing',
        html: `A steady (tonic) current makes the neuron fire a train of spikes rather than one. Raise the
          <strong>tonic current</strong> and watch a regular train appear.`,
        controls: { tonic: 0.7 }, highlight: ['INa', 'IKd'], reset: true,
        observe: 'A steady train of spikes — frequency grows with the injected current.',
      },
      {
        title: 'Spike-frequency adaptation',
        html: `Each spike admits Ca²⁺ through L-type channels; the rising [Ca²⁺]i opens
          <strong>Ca²⁺-activated K⁺ (SK)</strong> channels, whose outward current slows later spikes.
          Plot [Ca²⁺]i and I_SK to see the firing rate <strong>adapt</strong> over the train.`,
        eq: 'I_SK = g_SK · [Ca]i⁴/(K_Ca⁴+[Ca]i⁴) · (V − E_K)',
        controls: { tonic: 0.9 }, highlight: ['ICaL', 'ISK'],
        observe: 'Inter-spike intervals lengthen as [Ca²⁺]i and I_SK build up.',
      },
      {
        title: 'I_h sag and rebound',
        html: `Hyperpolarising the cell (a strong IPSP, or removing drive) activates the
          <strong>H-current</strong> (HCN), a slow inward cation current that produces a depolarising
          <strong>sag</strong> and can trigger <strong>rebound</strong> firing when the inhibition ends.`,
        eq: 'I_h = g_h · q · (V − E_h),  E_h ≈ −43 mV',
        controls: {}, highlight: ['Ih'],
        observe: 'After a hyperpolarisation the voltage sags back upward — sometimes past threshold.',
      },
    ],
  },
  {
    title: '4 · Pharmacology & pathology',
    steps: [
      {
        title: 'TTX blocks the spike',
        html: `Tetrodotoxin blocks voltage-gated <strong>Na⁺</strong> channels. Slide TTX up and stimulate:
          with no inward Na⁺ current there is no upstroke — the action potential is abolished.`,
        controls: { ttx: 1, stimAmp: 2 }, highlight: ['INa'], stimulate: true, reset: true,
        observe: 'Only a passive bump remains — the cell cannot spike.',
      },
      {
        title: 'TEA broadens the spike',
        html: `Tetraethylammonium blocks the <strong>delayed-rectifier K⁺</strong> channel. Without it,
          repolarisation is slow and the spike is markedly <strong>widened</strong>.`,
        controls: { tea: 0.8, stimAmp: 1.5 }, highlight: ['IKd'], stimulate: true,
      },
      {
        title: 'Ouabain — pump run-down',
        html: `Ouabain blocks the <strong>Na⁺/K⁺-ATPase</strong>. The cell can still fire, but without the
          pump the gradients are no longer rebuilt: [Na⁺]i creeps up and the resting potential
          <strong>depolarises</strong>. Pace for a while with ouabain on and watch the readouts.`,
        controls: { ouabain: 1, tonic: 0.7 }, highlight: ['INaK'],
        observe: '[Na⁺]i rises and the resting Vm drifts depolarised — homeostatic failure.',
      },
      {
        title: 'Hyperkalemia',
        html: `Raising extracellular <strong>[K⁺]o</strong> shifts E_K positive, depolarising the resting
          membrane. A little raises excitability; too much inactivates Na⁺ channels and <strong>blocks</strong>
          firing — why severe hyperkalemia is dangerous.`,
        eq: 'E_K = (RT/F)·ln([K]o/[K]i)',
        controls: { Ko: 9, stimAmp: 1.5 }, highlight: ['IKd', 'INa'], stimulate: true,
        observe: 'The whole heat map warms (depolarises) at rest; spikes shrink as [K⁺]o climbs.',
      },
    ],
  },
];
