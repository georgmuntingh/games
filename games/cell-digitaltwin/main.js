import erythrocyteParams from './data/erythrocyte.params.json';
import referencesData from './data/references.json';
import { resolveParams } from './engine/model.js';
import { Simulator } from './engine/integrator.js';
import { buildModel, SPECIES } from './cells/erythrocyte.js';
import { createSchematic } from './viz/schematic.js';
import { createPlots } from './viz/plots.js';
import { createLessonController } from './lessons/framework.js';
import { erythrocyteLessons } from './lessons/erythrocyte.js';

const $ = (id) => document.getElementById(id);

// ---- model + simulator -----------------------------------------------------
const { values: P, meta: PMETA } = resolveParams(erythrocyteParams);
const model = buildModel(P);
model.dtMax = 0.02;          // model-minutes per integrator sub-step
model.timeLabel = 'min';
const ctx = { controls: {} };
const sim = new Simulator(model, ctx);

// ---- schematic -------------------------------------------------------------
const schematic = createSchematic($('schematic'), model, {
  onTransporterClick: showTransporter,
});

// ---- plots -----------------------------------------------------------------
const plots = createPlots($('plots'), { windowSpan: 60, timeLabel: 'min' });
const SERIES = [
  { key: 'Vm', label: 'Vm', color: '#ef4444', axis: 'mV', on: true },
  { key: 'Na_i', label: '[Na⁺]i', color: '#f59e0b', axis: 'mM', on: true },
  { key: 'K_i', label: '[K⁺]i', color: '#8b5cf6', axis: 'mM', on: true },
  { key: 'Cl_i', label: '[Cl⁻]i', color: '#10b981', axis: 'mM', on: true },
  { key: 'HCO3_i', label: '[HCO₃⁻]i', color: '#06b6d4', axis: 'mM', on: false },
  { key: 'ATP', label: 'ATP', color: '#22c55e', axis: 'mM', on: false },
  { key: 'BPG', label: '2,3-BPG', color: '#a855f7', axis: 'mM', on: false },
  { key: 'glucose_i', label: '[Glc]i', color: '#eab308', axis: 'mM', on: false },
  { key: 'lactate', label: 'Lac', color: '#64748b', axis: 'mM', on: false },
];
plots.setSeries(SERIES);
syncSeriesUI();

function syncSeriesUI() {
  const series = plots.getSeries();
  const legend = $('plot-legend');
  legend.innerHTML = '';
  const picker = $('series-picker');
  picker.innerHTML = '';
  for (const s of series) {
    const item = document.createElement('span');
    item.className = 'item' + (s.on ? '' : ' off');
    item.innerHTML = `<span class="swatch" style="background:${s.color}"></span>${s.label}`;
    item.addEventListener('click', () => { plots.toggle(s.key); syncSeriesUI(); });
    legend.appendChild(item);

    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = s.on;
    cb.addEventListener('change', () => { plots.toggle(s.key); syncSeriesUI(); });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(s.label));
    picker.appendChild(label);
  }
}

// ---- tint selector ---------------------------------------------------------
const TINT_RANGE = {
  Na: [0, 20], K: [0, 160], Cl: [0, 130], Ca: [0, 0.001], HCO3: [0, 30],
  glucose: [0, 8], ATP: [0, 3], BPG23: [0, 6], lactate: [0, 5],
};
const tintSelect = $('tint-select');
for (const sp of SPECIES) {
  if (!(sp.id in TINT_RANGE)) continue;
  const opt = document.createElement('option');
  opt.value = sp.id; opt.textContent = sp.name;
  tintSelect.appendChild(opt);
}
tintSelect.value = 'Cl';
let tintSpecies = 'Cl';
tintSelect.addEventListener('change', () => { tintSpecies = tintSelect.value; });

// ---- perturbation (sandbox) controls --------------------------------------
const CONTROL_DEFS = [
  { key: 'ouabain', label: 'Ouabain (Na⁺/K⁺-ATPase block)', type: 'range', min: 0, max: 1, step: 0.05, def: 0, eq: 'scales J_pump by (1 − ouabain)' },
  { key: 'pmcaBlock', label: 'PMCA Ca²⁺-pump block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, eq: 'scales J_PMCA by (1 − block)' },
  { key: 'band3block', label: 'Band 3 (Cl⁻/HCO₃⁻) block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, eq: 'scales J_AE1 and P_Cl by (1 − block)' },
  { key: 'gardosBlock', label: 'Gardos channel block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, eq: 'scales Gardos P_K by (1 − block)' },
  { key: 'glut1block', label: 'GLUT1 block', type: 'range', min: 0, max: 1, step: 0.05, def: 0, eq: 'scales J_GLUT1 by (1 − block)' },
  { key: 'tonicity', label: 'External tonicity', type: 'range', min: 0.4, max: 1.8, step: 0.05, def: 1, eq: 'Osm_out ×= tonicity (1 = isotonic)' },
  { key: 'noGlucose', label: 'Remove glucose (starve)', type: 'check', def: false, eq: 'sets glycolytic flux to 0' },
];
const controlInputs = {};
function buildControls() {
  const wrap = $('controls');
  wrap.innerHTML = '';
  for (const d of CONTROL_DEFS) {
    const div = document.createElement('div');
    div.className = 'control';
    if (d.type === 'range') {
      div.innerHTML = `<div class="row"><span>${d.label}</span><span class="val" data-k="${d.key}"></span></div>`;
      const input = document.createElement('input');
      input.type = 'range'; input.min = d.min; input.max = d.max; input.step = d.step; input.value = d.def;
      input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        if (d.key === 'tonicity') ctx.controls.tonicity = v;
        else ctx.controls[d.key] = v;
        updateControlValue(d, v);
      });
      div.appendChild(input);
      controlInputs[d.key] = input;
    } else {
      const label = document.createElement('label');
      label.className = 'check';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.addEventListener('change', () => {
        ctx.controls[d.key] = cb.checked;
        if (d.key === 'noGlucose') ctx.controls.closedGlucose = cb.checked;
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' ' + d.label));
      div.appendChild(label);
      controlInputs[d.key] = cb;
    }
    const eq = document.createElement('div');
    eq.className = 'ctl-eq'; eq.textContent = d.eq;
    div.appendChild(eq);
    wrap.appendChild(div);
  }
  refreshControlUI();
}
function updateControlValue(d, v) {
  const span = document.querySelector(`.val[data-k="${d.key}"]`);
  if (span) span.textContent = d.key === 'tonicity' ? `${v.toFixed(2)}×` : (v === 0 ? 'off' : v.toFixed(2));
}
function refreshControlUI() {
  for (const d of CONTROL_DEFS) {
    const input = controlInputs[d.key];
    if (d.type === 'range') {
      const v = ctx.controls[d.key] ?? d.def;
      input.value = v; updateControlValue(d, v);
    } else {
      input.checked = !!ctx.controls[d.key];
    }
  }
}
function setControls(obj) {
  ctx.controls = { ...(obj || {}) };
  if (ctx.controls.noGlucose) ctx.controls.closedGlucose = true;
  refreshControlUI();
}
buildControls();
$('controls-reset').addEventListener('click', () => setControls({}));

// ---- readouts + tables -----------------------------------------------------
function renderReadouts() {
  const C = model.concentrations(sim.y);
  const O = model.observables(sim.y, ctx);
  const items = [
    ['Membrane Vm', O.Vm.toFixed(1), 'mV'],
    ['Volume', O.volume.toFixed(2), '× rest'],
    ['[Na⁺]i', C.cyto.Na.toFixed(1), 'mM'],
    ['[K⁺]i', C.cyto.K.toFixed(1), 'mM'],
    ['[Cl⁻]i', C.cyto.Cl.toFixed(1), 'mM'],
    ['[Ca²⁺]i', (C.cyto.Ca * 1e6).toFixed(0), 'nM'],
    ['ATP', O.ATP.toFixed(2), 'mM'],
    ['2,3-BPG', O.BPG.toFixed(2), 'mM'],
  ];
  $('readouts').innerHTML = items.map(([l, v, u]) =>
    `<div class="readout"><div class="label">${l}</div><div class="value">${v} <span class="unit">${u}</span></div></div>`
  ).join('');
}

function renderStateTable() {
  const C = model.concentrations(sim.y);
  const O = model.observables(sim.y, ctx);
  const rows = [];
  const add = (n, ci, co, u = 'mM') => rows.push(
    `<tr><td>${n}</td><td>${fmt(ci)}</td><td>${co == null ? '' : fmt(co)}</td><td>${u}</td></tr>`);
  rows.push('<tr><td><strong>species</strong></td><td><strong>cyto</strong></td><td><strong>plasma</strong></td><td></td></tr>');
  add('Na⁺', C.cyto.Na, C.plasma.Na);
  add('K⁺', C.cyto.K, C.plasma.K);
  add('Cl⁻', C.cyto.Cl, C.plasma.Cl);
  add('Ca²⁺', C.cyto.Ca * 1e6, C.plasma.Ca * 1e6, 'nM');
  add('HCO₃⁻', C.cyto.HCO3, C.plasma.HCO3);
  add('glucose', C.cyto.glucose, C.plasma.glucose);
  add('ATP', C.cyto.ATP, null);
  add('2,3-BPG', C.cyto.BPG23, null);
  add('lactate', C.cyto.lactate, null);
  rows.push(`<tr><td>E_Na / E_K / E_Cl</td><td colspan="3">${O.ENa.toFixed(0)} / ${O.EK.toFixed(0)} / ${O.ECl.toFixed(0)} mV</td></tr>`);
  $('state-table').innerHTML = `<table>${rows.join('')}</table>`;
}

function renderParamTable() {
  const leaves = [];
  walkMeta(PMETA, [], leaves);
  const rows = leaves.map(({ path, leaf }) =>
    `<tr><td>${leaf.symbol || path[path.length - 1]}</td><td>${fmt(leaf.value)}</td><td class="sym">${leaf.units || ''}</td><td class="ref">${leaf.ref || ''}</td></tr>`
  ).join('');
  $('param-table').innerHTML = `<table>${rows}</table>`;
}
function walkMeta(node, path, out) {
  if (node && node.__leaf) { out.push({ path, leaf: node.__leaf }); return; }
  for (const [k, v] of Object.entries(node || {})) {
    if (k === '__leaf') continue;
    if (v && typeof v === 'object') walkMeta(v, [...path, k], out);
  }
}

function renderReferences() {
  const refs = referencesData.references;
  const ol = $('reference-list');
  ol.innerHTML = '';
  for (const [key, r] of Object.entries(refs)) {
    const li = document.createElement('li');
    let link = '';
    if (r.doi) link = `https://doi.org/${r.doi}`;
    else if (r.search) link = `https://scholar.google.com/scholar?q=${encodeURIComponent(r.search)}`;
    const title = link ? `<a href="${link}" target="_blank" rel="noopener">${r.title}</a>` : r.title;
    li.innerHTML = `${r.authors} (${r.year}). ${title}. <em>${r.journal}</em>${r.volume ? ', ' + r.volume : ''}${r.pages ? ': ' + r.pages : ''}.`;
    ol.appendChild(li);
  }
}

// ---- transporter info panel ------------------------------------------------
function showTransporter(tp) {
  const panel = $('transporter-info');
  panel.hidden = false;
  const refLinks = (tp.refs || []).map((k) => {
    const r = referencesData.references[k];
    if (!r) return k;
    const link = r.doi ? `https://doi.org/${r.doi}` : (r.search ? `https://scholar.google.com/scholar?q=${encodeURIComponent(r.search)}` : null);
    const label = `${r.authors.split(',')[0]} ${r.year}`;
    return link ? `<a href="${link}" target="_blank" rel="noopener">${label}</a>` : label;
  }).join('; ');
  panel.innerHTML =
    `<h3 class="cls-${tp.cls}">${tp.name}</h3>` +
    `<div>${tp.blurb}</div>` +
    `<div class="eq">${escapeHtml(tp.equation)}</div>` +
    `<div class="refs">${refLinks}</div>`;
  schematic.highlight([tp.id]);
}

// ---- lessons ---------------------------------------------------------------
let lessonHighlight = null;
const lessons = createLessonController({
  lessons: erythrocyteLessons,
  dom: {
    list: $('lesson-list'), active: $('lesson-active'), title: $('lesson-title'),
    body: $('lesson-body'), progress: $('lesson-progress'),
    prev: $('lesson-prev'), next: $('lesson-next'), exit: $('lesson-exit'),
  },
  apply(step) {
    if (!step) { lessonHighlight = null; schematic.highlight([]); return; }
    if (step.reset) { sim.reset(); plots.clear(); }
    setControls(step.controls || {});
    if (step.tint) { tintSpecies = step.tint; tintSelect.value = step.tint; }
    lessonHighlight = step.highlight || [];
    schematic.highlight(lessonHighlight);
    if (step.speed != null) setSpeedFromValue(step.speed);
  },
});

// ---- transport controls (play/pause/speed) ---------------------------------
let playing = false;
function setPlaying(on) {
  playing = on;
  $('play-btn').textContent = on ? '❚❚ Pause' : '▶ Play';
  $('play-btn').classList.toggle('primary', !on);
}
$('play-btn').addEventListener('click', () => setPlaying(!playing));
$('step-btn').addEventListener('click', () => { stepOnce(1.0); });
$('reset-btn').addEventListener('click', () => { sim.reset(); plots.clear(); render(); });

const speedSlider = $('speed');
function speedValue() { return 0.2 * Math.pow(1500, parseFloat(speedSlider.value) / 100); }
function setSpeedFromValue(minPerSec) {
  const v = 100 * Math.log(minPerSec / 0.2) / Math.log(1500);
  speedSlider.value = Math.max(0, Math.min(100, v));
  updateSpeedOut();
}
function updateSpeedOut() { $('speed-out').textContent = speedValue().toFixed(speedValue() < 10 ? 1 : 0); }
speedSlider.addEventListener('input', updateSpeedOut);
updateSpeedOut();

$('show-math').addEventListener('change', (e) => {
  document.body.classList.toggle('show-math', e.target.checked);
});

// ---- simulation stepping ---------------------------------------------------
let sampleAcc = 0;
const SAMPLE_EVERY = 0.1; // model-min between plot samples
function stepOnce(modelMinutes) {
  sim.advance(modelMinutes, model.dtMax);
  sampleAcc += modelMinutes;
  while (sampleAcc >= SAMPLE_EVERY) { sampleAcc -= SAMPLE_EVERY; samplePlot(); }
}
function samplePlot() {
  const C = model.concentrations(sim.y);
  const O = model.observables(sim.y, ctx);
  plots.addSample(sim.t, {
    Vm: O.Vm, Na_i: C.cyto.Na, K_i: C.cyto.K, Cl_i: C.cyto.Cl,
    HCO3_i: C.cyto.HCO3, ATP: C.cyto.ATP, BPG: C.cyto.BPG23,
    glucose_i: C.cyto.glucose, lactate: C.cyto.lactate,
  });
}

function transporterActivity(F) {
  const bgK = F.JkIn - F.JkGardos; // background K leak (exclude Gardos)
  return {
    nakatpase: { dir: -1, rate: 3 * F.nak },
    pmca: { dir: -1, rate: F.jpmca },
    band3: { dir: F.jB3 >= 0 ? 1 : -1, rate: Math.abs(F.jB3) },
    glut1: { dir: F.jGlut >= 0 ? 1 : -1, rate: Math.abs(F.jGlut) },
    gardos: { dir: F.JkGardos >= 0 ? 1 : -1, rate: Math.abs(F.JkGardos) },
    naleak: { dir: F.JnaIn >= 0 ? 1 : -1, rate: Math.abs(F.JnaIn) },
    kleak: { dir: bgK >= 0 ? 1 : -1, rate: Math.abs(bgK) },
  };
}

let lastUiT = 0;
function render() {
  const F = model.computeFluxes(sim.y, ctx);
  schematic.update(sim.y, transporterActivity(F), {
    tintSpecies, tintRange: TINT_RANGE[tintSpecies], ctx, fluxScale: 0.06,
    plasmaChips: chips('plasma'), cytoChips: chips('cyto'),
  });
  plots.draw();
  $('clock').textContent = sim.t.toFixed(1);
  // Throttle the heavier table rebuilds to ~12 Hz; schematic + plots stay at full rate.
  const now = performance.now();
  if (now - lastUiT > 80) {
    lastUiT = now;
    renderReadouts();
    renderStateTable();
  }
}

function chips(side) {
  const C = model.concentrations(sim.y);
  const wanted = side === 'plasma'
    ? ['Na', 'K', 'Cl', 'Ca', 'HCO3', 'glucose']
    : ['Na', 'K', 'Cl', 'Ca', 'glucose', 'ATP'];
  return wanted.map((id) => {
    const sp = SPECIES.find((s) => s.id === id);
    const val = C[side][id];
    const text = id === 'Ca' ? `${(val * 1e6).toFixed(0)} nM` : `${val.toFixed(val < 1 ? 2 : 0)}`;
    return { label: sp.symbol, color: sp.color, text };
  });
}

// ---- main loop -------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dtReal = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (playing) {
    const adv = speedValue() * dtReal;
    stepOnce(adv);
  }
  // throttle heavy DOM updates to ~20 Hz; always animate schematic.
  render();
  requestAnimationFrame(frame);
}

// ---- init ------------------------------------------------------------------
renderParamTable();
renderReferences();
samplePlot();
render();
requestAnimationFrame(frame);

// ---- helpers ---------------------------------------------------------------
function fmt(v) {
  if (v == null || !isFinite(v)) return '–';
  const a = Math.abs(v);
  if (a !== 0 && (a < 0.01 || a >= 1e4)) return v.toExponential(1);
  if (a >= 100) return v.toFixed(0);
  if (a >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
