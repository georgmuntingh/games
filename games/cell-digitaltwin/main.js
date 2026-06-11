import referencesData from './data/references.json';
import { resolveParams } from './engine/model.js';
import { Simulator } from './engine/integrator.js';
import { createSchematic } from './viz/schematic.js';
import { createPlots } from './viz/plots.js';
import { createLessonController } from './lessons/framework.js';
import { CELLS, CELL_ORDER } from './cells/registry.js';

const $ = (id) => document.getElementById(id);

// ---- persistent state ------------------------------------------------------
// S holds everything that is rebuilt when the cell changes.
const S = {
  cellId: null, view: null, model: null, sim: null, ctx: null,
  PMETA: null, schematic: null, plots: null, tintSpecies: null,
  controlInputs: {},
};
let playing = false;

// ---- cell selector ---------------------------------------------------------
const cellSelect = $('cell-select');
cellSelect.innerHTML = '';
for (const id of CELL_ORDER) {
  const opt = document.createElement('option');
  opt.value = id; opt.textContent = CELLS[id].label;
  cellSelect.appendChild(opt);
}
cellSelect.addEventListener('change', () => loadCell(cellSelect.value));

// ---- lesson controller (persistent; lessons swapped per cell) --------------
const lessons = createLessonController({
  lessons: [],
  dom: {
    list: $('lesson-list'), active: $('lesson-active'), title: $('lesson-title'),
    body: $('lesson-body'), progress: $('lesson-progress'),
    prev: $('lesson-prev'), next: $('lesson-next'), exit: $('lesson-exit'),
  },
  apply(step) {
    if (!step) { S.schematic.highlight([]); return; }
    if (step.reset) { S.sim.reset(); S.plots.clear(); }
    setControls(step.controls || {});
    if (step.tint) { S.tintSpecies = step.tint; $('tint-select').value = step.tint; }
    S.schematic.highlight(step.highlight || []);
    if (step.speed != null) setSpeedFromValue(step.speed);
    if (step.stimulate) fireStimulus();
  },
});

// ---- cell loading ----------------------------------------------------------
function loadCell(id) {
  const cell = CELLS[id];
  S.cellId = id;
  S.view = cell.view;
  const { values, meta } = resolveParams(cell.params);
  S.PMETA = meta;
  S.model = cell.build(values);
  S.model.dtMax = cell.view.dtMax;
  S.model.timeLabel = cell.view.timeLabel;
  S.ctx = { controls: { ...(cell.view.defaultControls || {}) }, t: 0 };
  S.sim = new Simulator(S.model, S.ctx);
  S.tintSpecies = cell.view.tint.default;

  // schematic
  S.schematic = createSchematic($('schematic'), S.model, { onTransporterClick: showTransporter });

  // plots
  S.plots = createPlots($('plots'), {
    windowSpan: cell.view.plotWindow, timeLabel: cell.view.timeLabel, axes: cell.view.plotAxes,
  });
  S.plots.setSeries(cell.view.series.map((s) => ({ ...s })));
  syncSeriesUI();

  // sidebar: controls, tint, lessons, param table
  buildControls();
  buildTintSelect();
  lessons.setLessons(cell.lessons);
  renderParamTable();

  // cellbar actions + speed range
  buildActions();
  configureSpeed();

  // clock unit + reset
  $('clock-unit').textContent = cell.view.timeLabel;
  S.sampleAcc = 0;
  $('transporter-info').hidden = !cell.view.intro;
  if (cell.view.intro) $('transporter-info').innerHTML = `<div>${cell.view.intro}</div>`;

  setPlaying(false);
  S.plots.clear();
  samplePlot();
  render();
}

// ---- plot series UI --------------------------------------------------------
function syncSeriesUI() {
  const series = S.plots.getSeries();
  const legend = $('plot-legend'); legend.innerHTML = '';
  const picker = $('series-picker'); picker.innerHTML = '';
  for (const s of series) {
    const item = document.createElement('span');
    item.className = 'item' + (s.on ? '' : ' off');
    item.innerHTML = `<span class="swatch" style="background:${s.color}"></span>${s.label}`;
    item.addEventListener('click', () => { S.plots.toggle(s.key); syncSeriesUI(); });
    legend.appendChild(item);

    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = s.on;
    cb.addEventListener('change', () => { S.plots.toggle(s.key); syncSeriesUI(); });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(s.label));
    picker.appendChild(label);
  }
}

// ---- tint selector ---------------------------------------------------------
function buildTintSelect() {
  const sel = $('tint-select');
  sel.innerHTML = '';
  for (const o of S.view.tint.options) {
    const opt = document.createElement('option');
    opt.value = o.id; opt.textContent = o.name;
    sel.appendChild(opt);
  }
  sel.value = S.view.tint.default;
  sel.onchange = () => { S.tintSpecies = sel.value; };
}

// ---- sandbox controls ------------------------------------------------------
function buildControls() {
  const wrap = $('controls'); wrap.innerHTML = '';
  S.controlInputs = {};
  for (const d of S.view.controls) {
    const div = document.createElement('div');
    div.className = 'control';
    if (d.type === 'range') {
      div.innerHTML = `<div class="row"><span>${d.label}</span><span class="val" data-k="${d.key}"></span></div>`;
      const input = document.createElement('input');
      input.type = 'range'; input.min = d.min; input.max = d.max; input.step = d.step; input.value = d.def;
      input.addEventListener('input', () => {
        const v = parseFloat(input.value);
        S.ctx.controls[d.key] = v;
        updateControlValue(d, v);
      });
      div.appendChild(input);
      S.controlInputs[d.key] = input;
    } else {
      const label = document.createElement('label');
      label.className = 'check';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.addEventListener('change', () => {
        S.ctx.controls[d.key] = cb.checked;
        if (d.linked) for (const [k, val] of Object.entries(d.linked)) S.ctx.controls[k] = cb.checked ? val : undefined;
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' ' + d.label));
      div.appendChild(label);
      S.controlInputs[d.key] = cb;
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
  if (!span) return;
  if (d.zeroLabel && v === 0) span.textContent = d.zeroLabel;
  else span.textContent = `${fmtNum(v)}${d.unit || ''}`;
}
function refreshControlUI() {
  for (const d of S.view.controls) {
    const input = S.controlInputs[d.key];
    if (!input) continue;
    if (d.type === 'range') {
      const v = S.ctx.controls[d.key] ?? d.def;
      input.value = v; updateControlValue(d, v);
    } else {
      input.checked = !!S.ctx.controls[d.key];
    }
  }
}
function setControls(obj) {
  S.ctx.controls = { ...(S.view.defaultControls || {}), ...(obj || {}) };
  for (const d of S.view.controls) {
    if (d.linked && S.ctx.controls[d.key]) {
      for (const [k, val] of Object.entries(d.linked)) S.ctx.controls[k] = val;
    }
  }
  refreshControlUI();
}
$('controls-reset').addEventListener('click', () => setControls({}));

// ---- cellbar actions (e.g. Stimulate) --------------------------------------
function buildActions() {
  const wrap = $('cell-actions'); wrap.innerHTML = '';
  for (const a of (S.view.actions || [])) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = a.label;
    btn.addEventListener('click', () => {
      a.fn(S.ctx, S.sim);
      if (a.autoplay) setPlaying(true);
    });
    wrap.appendChild(btn);
  }
}
function fireStimulus() {
  const stim = (S.view.actions || []).find((a) => a.id === 'stim');
  if (stim) { stim.fn(S.ctx, S.sim); setPlaying(true); }
}

// ---- readouts + tables -----------------------------------------------------
function renderReadouts() {
  const items = S.view.readouts(S.model, S.sim.y, S.ctx);
  $('readouts').innerHTML = items.map(([l, v, u]) =>
    `<div class="readout"><div class="label">${l}</div><div class="value">${v} <span class="unit">${u}</span></div></div>`
  ).join('');
}
function renderStateTable() {
  const t = S.view.stateRows(S.model, S.sim.y, S.ctx);
  const head = `<tr>${t.header.map((h) => `<td><strong>${h}</strong></td>`).join('')}</tr>`;
  const body = t.rows.map(([n, a, b, u]) =>
    `<tr><td>${n}</td><td>${typeof a === 'number' ? fmt(a) : a}</td><td>${b == null ? '' : fmt(b)}</td><td>${u || ''}</td></tr>`
  ).join('');
  const foot = t.footer ? `<tr><td colspan="4">${t.footer}</td></tr>` : '';
  $('state-table').innerHTML = `<table>${head}${body}${foot}</table>`;
}
function renderParamTable() {
  const leaves = []; walkMeta(S.PMETA, [], leaves);
  $('param-table').innerHTML = `<table>${leaves.map(({ path, leaf }) =>
    `<tr><td>${leaf.symbol || path[path.length - 1]}</td><td>${fmt(leaf.value)}</td><td class="sym">${leaf.units || ''}</td><td class="ref">${leaf.ref || ''}</td></tr>`
  ).join('')}</table>`;
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
  const ol = $('reference-list'); ol.innerHTML = '';
  for (const r of Object.values(refs)) {
    const li = document.createElement('li');
    const link = r.doi ? `https://doi.org/${r.doi}` : (r.search ? `https://scholar.google.com/scholar?q=${encodeURIComponent(r.search)}` : '');
    const title = link ? `<a href="${link}" target="_blank" rel="noopener">${r.title}</a>` : r.title;
    li.innerHTML = `${r.authors} (${r.year}). ${title}. <em>${r.journal}</em>${r.volume ? ', ' + r.volume : ''}${r.pages ? ': ' + r.pages : ''}.`;
    ol.appendChild(li);
  }
}

// ---- transporter info ------------------------------------------------------
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
    `<h3 class="cls-${tp.cls}">${tp.name}</h3><div>${tp.blurb}</div>` +
    `<div class="eq">${escapeHtml(tp.equation)}</div><div class="refs">${refLinks}</div>`;
  S.schematic.highlight([tp.id]);
}

// ---- transport controls (play/step/reset/speed) ----------------------------
function setPlaying(on) {
  playing = on;
  $('play-btn').textContent = on ? '❚❚ Pause' : '▶ Play';
  $('play-btn').classList.toggle('primary', !on);
}
$('play-btn').addEventListener('click', () => setPlaying(!playing));
$('step-btn').addEventListener('click', () => stepOnce(S.view.sampleEvery * 5));
$('reset-btn').addEventListener('click', () => { S.sim.reset(); S.ctx.t = 0; S.plots.clear(); samplePlot(); render(); });

const speedSlider = $('speed');
function configureSpeed() {
  $('speed-unit').textContent = S.view.speed.unit;
  setSpeedFromValue(S.view.speed.default);
}
function speedValue() {
  const sp = S.view.speed;
  return sp.min * Math.pow(sp.max / sp.min, parseFloat(speedSlider.value) / 100);
}
function setSpeedFromValue(modelPerSec) {
  const sp = S.view.speed;
  const v = 100 * Math.log(modelPerSec / sp.min) / Math.log(sp.max / sp.min);
  speedSlider.value = Math.max(0, Math.min(100, v));
  updateSpeedOut();
}
function updateSpeedOut() {
  const v = speedValue();
  $('speed-out').textContent = v < 10 ? v.toFixed(1) : v.toFixed(0);
}
speedSlider.addEventListener('input', updateSpeedOut);

$('show-math').addEventListener('change', (e) => document.body.classList.toggle('show-math', e.target.checked));

// ---- stepping --------------------------------------------------------------
function stepOnce(modelTime) {
  S.sim.advance(modelTime, S.model.dtMax);
  S.ctx.t = S.sim.t;
  S.sampleAcc += modelTime;
  const every = S.view.sampleEvery;
  while (S.sampleAcc >= every) { S.sampleAcc -= every; samplePlot(); }
}
function samplePlot() {
  S.plots.addSample(S.sim.t, S.view.sample(S.model, S.sim.y, S.ctx));
}

let lastUiT = 0;
function render() {
  const F = S.model.computeFluxes(S.sim.y, S.ctx);
  const chips = S.view.chips(S.model, S.sim.y);
  S.schematic.update(S.sim.y, S.view.activity(S.model, F), {
    tintSpecies: S.tintSpecies, tintRange: S.view.tint.ranges[S.tintSpecies],
    ctx: S.ctx, fluxScale: S.view.fluxScale,
    plasmaChips: chips.plasma, cytoChips: chips.cyto,
  });
  S.plots.draw();
  $('clock').textContent = S.sim.t.toFixed(1);
  const now = performance.now();
  if (now - lastUiT > 80) { lastUiT = now; renderReadouts(); renderStateTable(); }
}

// ---- main loop -------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dtReal = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (playing) stepOnce(speedValue() * dtReal);
  render();
  requestAnimationFrame(frame);
}

// ---- init ------------------------------------------------------------------
renderReferences();
loadCell('erythrocyte');
requestAnimationFrame(frame);

// ---- helpers ---------------------------------------------------------------
function fmt(v) {
  if (v == null || !isFinite(v)) return typeof v === 'number' ? '–' : v;
  const a = Math.abs(v);
  if (a !== 0 && (a < 0.01 || a >= 1e4)) return v.toExponential(1);
  if (a >= 100) return v.toFixed(0);
  if (a >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
function fmtNum(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
