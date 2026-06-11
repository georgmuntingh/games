// Headless smoke test for the browser-only view modules (schematic, plots).
// Stubs just enough of the DOM/Canvas/SVG API to execute the render paths and
// surface any API misuse. Not a visual check — just "does it run without throwing".
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { resolveParams } from '../engine/model.js';
import { Simulator } from '../engine/integrator.js';
import { buildModel } from '../cells/erythrocyte.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- minimal DOM stub ------------------------------------------------------
function fakeNode(tag) {
  const n = {
    tagName: tag, children: [], dataset: {}, style: {},
    _text: '', _html: '', attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener() {},
    set textContent(v) { this._text = v; },
    get textContent() { return this._text; },
    set innerHTML(v) { this._html = v; this.children = []; },
    get innerHTML() { return this._html; },
  };
  return n;
}
global.document = {
  createElementNS: (_ns, tag) => fakeNode(tag),
  createElement: (tag) => fakeNode(tag),
};
global.window = { devicePixelRatio: 2 };
global.getComputedStyle = () => ({ color: '#222' });

const ctx2d = new Proxy({ canvas: { clientWidth: 900, clientHeight: 260 } }, {
  get(target, prop) {
    if (prop in target) return target[prop];
    // any drawing method is a no-op function; any property read returns ''.
    return typeof prop === 'string' && /^[a-z]/.test(prop) && prop.length > 2
      ? (() => {}) : '';
  },
  set() { return true; },
});

const { createSchematic } = await import('../viz/schematic.js');
const { createPlots } = await import('../viz/plots.js');

const params = JSON.parse(readFileSync(resolve(__dirname, '../data/erythrocyte.params.json'), 'utf8'));
const { values: P } = resolveParams(params);
const model = buildModel(P); model.dtMax = 0.02;
const sim = new Simulator(model, { controls: {} });

let ok = true;
try {
  const svg = fakeNode('svg');
  const schem = createSchematic(svg, model, { onTransporterClick: () => {} });
  const canvas = { getContext: () => ctx2d, width: 0, height: 0, clientWidth: 900, clientHeight: 260, style: {} };
  ctx2d.canvas = canvas;
  const plots = createPlots(canvas, { windowSpan: 60, timeLabel: 'min' });
  plots.setSeries([
    { key: 'Vm', label: 'Vm', color: '#000', axis: 'mV', on: true },
    { key: 'Na_i', label: 'Na', color: '#f00', axis: 'mM', on: true },
  ]);

  for (let i = 0; i < 50; i++) {
    sim.advance(0.2, 0.02);
    const C = model.concentrations(sim.y);
    const O = model.observables(sim.y, { controls: {} });
    const F = model.computeFluxes(sim.y, { controls: {} });
    const activity = {
      nakatpase: { dir: -1, rate: 3 * F.nak }, pmca: { dir: -1, rate: F.jpmca },
      band3: { dir: 1, rate: Math.abs(F.jB3) }, glut1: { dir: 1, rate: Math.abs(F.jGlut) },
      gardos: { dir: -1, rate: Math.abs(F.JkGardos) }, naleak: { dir: 1, rate: Math.abs(F.JnaIn) },
      kleak: { dir: -1, rate: Math.abs(F.JkIn) },
    };
    schem.update(sim.y, activity, {
      tintSpecies: 'Cl', tintRange: [0, 130], ctx: { controls: {} }, fluxScale: 0.06,
      plasmaChips: [{ label: 'Na⁺', color: '#f59e0b', text: '140' }],
      cytoChips: [{ label: 'K⁺', color: '#8b5cf6', text: '140' }],
    });
    schem.highlight(['nakatpase']);
    plots.addSample(sim.t, { Vm: O.Vm, Na_i: C.cyto.Na });
    plots.draw();
  }
  console.log('✓ view smoke: schematic + plots executed 50 frames without throwing');
} catch (e) {
  ok = false;
  console.log('✗ view smoke threw:', e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n') : e);
}
process.exit(ok ? 0 : 1);
