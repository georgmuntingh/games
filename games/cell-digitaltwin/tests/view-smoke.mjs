// Headless smoke test for the browser-only view layer (schematic, plots, and
// each cell's view adapter). Stubs just enough DOM/Canvas/SVG to execute the
// render paths and surface API misuse. Not a visual check.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { resolveParams } from '../engine/model.js';
import { Simulator } from '../engine/integrator.js';
import { buildModel as buildErythrocyte } from '../cells/erythrocyte.js';
import { buildModel as buildCardiomyocyte } from '../cells/cardiomyocyte.js';
import { buildModel as buildNeuron } from '../cells/neuron.js';
import { buildModel as buildMitochondrion } from '../cells/mitochondrion.js';
import { erythrocyteView, cardiomyocyteView, neuronView, mitochondrionView } from '../cells/views.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(readFileSync(resolve(__dirname, f), 'utf8'));

// ---- minimal DOM stub ------------------------------------------------------
function fakeNode(tag) {
  return {
    tagName: tag, children: [], dataset: {}, style: {}, attrs: {}, _text: '', _html: '',
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; },
    appendChild(c) { this.children.push(c); return c; }, addEventListener() {},
    set textContent(v) { this._text = v; }, get textContent() { return this._text; },
    set innerHTML(v) { this._html = v; this.children = []; }, get innerHTML() { return this._html; },
  };
}
global.document = { createElementNS: (_n, t) => fakeNode(t), createElement: (t) => fakeNode(t) };
global.window = { devicePixelRatio: 2 };
const ctx2d = new Proxy({}, {
  get(t, p) { return p in t ? t[p] : (typeof p === 'string' && /^[a-z]/.test(p) && p.length > 2 ? () => {} : ''); },
  set() { return true; },
});

const { createSchematic } = await import('../viz/schematic.js');
const { createPlots } = await import('../viz/plots.js');

const cells = {
  erythrocyte: { build: buildErythrocyte, view: erythrocyteView, params: read('../data/erythrocyte.params.json'), ctrl: {} },
  cardiomyocyte: { build: buildCardiomyocyte, view: cardiomyocyteView, params: read('../data/cardiomyocyte.params.json'), ctrl: { paced: true, bcl: 500 } },
  neuron: { build: buildNeuron, view: neuronView, params: read('../data/neuron.params.json'), ctrl: { injectComp: 3, stimAmp: 1.5, stimDur: 1, _stimUntil: 1 } },
  mitochondrion: { build: buildMitochondrion, view: mitochondrionView, params: read('../data/mitochondrion.params.json'), ctrl: { adp: 0.3, cai: 2 } },
};

let ok = true;
for (const [id, cell] of Object.entries(cells)) {
  try {
    const { values: P } = resolveParams(cell.params);
    const model = cell.build(P); model.dtMax = cell.view.dtMax;
    const ctx = { controls: { ...cell.view.defaultControls, ...cell.ctrl }, t: 0 };
    const sim = new Simulator(model, ctx);

    const svg = fakeNode('svg');
    const posCanvas = { getContext: () => ctx2d, width: 0, height: 0, clientWidth: 900, clientHeight: 120, hidden: true };
    const makeSchematic = cell.view.createSchematic || createSchematic;
    const schem = makeSchematic(svg, model, { onTransporterClick: () => {}, posCanvas, ctx });
    const canvas = { getContext: () => ctx2d, width: 0, height: 0, clientWidth: 900, clientHeight: 260, style: {} };
    const plots = createPlots(canvas, { windowSpan: cell.view.plotWindow, timeLabel: cell.view.timeLabel, axes: cell.view.plotAxes });
    plots.setSeries(cell.view.series.map((s) => ({ ...s })));

    const stepT = cell.view.sampleEvery;
    for (let i = 0; i < 80; i++) {
      sim.advance(stepT, model.dtMax);
      ctx.t = sim.t;
      const F = model.computeFluxes(sim.y, ctx);
      const chips = cell.view.chips(model, sim.y);
      schem.update(sim.y, cell.view.activity(model, F), {
        tintSpecies: cell.view.tint.default, tintRange: cell.view.tint.ranges[cell.view.tint.default],
        ctx, fluxScale: cell.view.fluxScale, plasmaChips: chips.plasma, cytoChips: chips.cyto,
      });
      schem.highlight([model.transporters[0].id]);
      plots.addSample(sim.t, cell.view.sample(model, sim.y, ctx));
      plots.draw();
      cell.view.readouts(model, sim.y, ctx);
      cell.view.stateRows(model, sim.y, ctx);
    }
    console.log(`✓ view smoke [${id}]: 80 frames, schematic + plots + view adapter OK`);
  } catch (e) {
    ok = false;
    console.log(`✗ view smoke [${id}] threw:`, e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n') : e);
  }
}
process.exit(ok ? 0 : 1);
