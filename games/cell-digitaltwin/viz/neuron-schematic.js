// Neuron morphology schematic: dendrites -> soma -> myelinated axon (alternating
// internodes and nodes of Ranvier). Every compartment is colour-mapped by its
// local membrane potential (a heat map), so an action potential is visible as a
// bright wave jumping node to node. Channel glyphs are clustered at the soma and
// the first node (clickable, with animated flux arrows). A companion canvas shows
// the membrane-potential profile "Vm vs position along the cell".
//
// Implements the same interface as viz/schematic.js: createNeuronSchematic(svg,
// model, opts) -> { update(state, activity, opts), highlight(ids) }, so main.js
// can use it interchangeably (the neuron view sets view.createSchematic).

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 560, H = 420;
const AXIS_Y = 232;            // baseline of soma + axon
const CLASS_COLOR = { pump: '#ef4444', channel: '#8b5cf6', leak: '#94a3b8' };

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

// Diverging cold->warm colour map for membrane potential (mV).
function vColor(v) {
  const t = Math.max(0, Math.min(1, (v + 85) / 130)); // -85..+45 mV
  // three stops: deep blue -> pale -> hot red
  const stops = [[30, 58, 138], [226, 232, 240], [239, 68, 68]];
  const seg = t < 0.5 ? 0 : 1;
  const f = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const a = stops[seg], b = stops[seg + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}

export function createNeuronSchematic(svg, model, { onTransporterClick, posCanvas, ctx } = {}) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let liveCtx = ctx;

  // extracellular bath
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#dbeafe', opacity: 0.35 }, svg);
  el('text', { x: 14, y: 22, 'font-size': 12, fill: '#1e3a8a', 'font-weight': 600 }, svg)
    .textContent = 'Extracellular';

  // ---- layout: assign each compartment a screen shape -----------------------
  // Dendrites taper up-left into the soma; the axon marches to the right with
  // wide myelinated internodes and narrow bare nodes.
  const comps = model.comps;
  const shapes = new Array(model.N);
  const somaX = 150, somaR = 26;

  // dendrites (indices before soma) fanned up-left
  const dend = model.dendIdx;
  dend.forEach((i, k) => {
    const frac = (k + 1) / (dend.length + 1);
    shapes[i] = { type: 'dend', cx: somaX - 60 - k * 42, cy: AXIS_Y - 60 - k * 34, r: 12 - k * 2 };
  });
  // soma
  shapes[model.somaIndex] = { type: 'soma', cx: somaX, cy: AXIS_Y, r: somaR };
  // axon chain (hillock, nodes, internodes) laid left->right
  const axonStart = somaX + somaR + 6;
  const axonComps = comps.filter((c) => c.kind === 'hillock' || c.kind === 'node' || c.kind === 'internode');
  const totalLen = axonComps.reduce((s, c) => s + (c.kind === 'internode' ? 2.4 : 1), 0);
  const axonSpan = W - axonStart - 16;
  let x = axonStart;
  for (const c of axonComps) {
    const wUnits = c.kind === 'internode' ? 2.4 : 1;
    const w = (wUnits / totalLen) * axonSpan;
    shapes[c.i] = { type: c.kind, x, y: AXIS_Y, w, half: c.kind === 'internode' ? 11 : 7 };
    x += w + 2;
  }

  // draw axon segments (myelin sheath for internodes, bare for nodes/hillock)
  const segNodes = {};
  for (const c of axonComps) {
    const s = shapes[c.i];
    if (c.kind === 'internode') {
      el('rect', { x: s.x, y: s.y - s.half - 3, width: s.w, height: 2 * (s.half + 3), rx: 6,
        fill: '#fde68a', stroke: '#d97706', 'stroke-width': 1, opacity: 0.9 }, svg); // myelin sheath
    }
    const core = el('rect', { x: s.x, y: s.y - s.half, width: s.w, height: 2 * s.half, rx: 3,
      fill: '#1e3a8a', stroke: c.kind === 'internode' ? 'none' : '#0f172a', 'stroke-width': 0.5,
      style: 'cursor:pointer' }, svg);
    core.addEventListener('click', () => { if (liveCtx) liveCtx.controls.injectComp = c.i; });
    segNodes[c.i] = core;
  }
  // dendrite + soma bodies (drawn after axon so they sit on top near the soma)
  const dendNodes = {};
  for (const i of dend) {
    const s = shapes[i];
    el('line', { x1: s.cx, y1: s.cy, x2: somaX, y2: AXIS_Y, stroke: '#64748b', 'stroke-width': 3, opacity: 0.5 }, svg);
    const n = el('circle', { cx: s.cx, cy: s.cy, r: s.r, fill: '#1e3a8a', stroke: '#334155', 'stroke-width': 1, style: 'cursor:pointer' }, svg);
    n.addEventListener('click', () => { if (liveCtx) liveCtx.controls.injectComp = i; });
    dendNodes[i] = n;
  }
  const somaNode = el('circle', { cx: somaX, cy: AXIS_Y, r: somaR, fill: '#1e3a8a',
    stroke: '#0f172a', 'stroke-width': 1.5, style: 'cursor:pointer' }, svg);
  somaNode.addEventListener('click', () => { if (liveCtx) liveCtx.controls.injectComp = model.somaIndex; });
  el('text', { x: somaX, y: AXIS_Y + 42, 'font-size': 11, 'text-anchor': 'middle', fill: '#475569' }, svg).textContent = 'soma';
  el('text', { x: dend.length ? shapes[dend[dend.length - 1]].cx : 60, y: (dend.length ? shapes[dend[dend.length - 1]].cy : 150) - 18, 'font-size': 11, 'text-anchor': 'middle', fill: '#475569' }, svg).textContent = 'dendrites';

  // injection marker
  const injMarker = el('circle', { cx: somaX, cy: AXIS_Y, r: somaR + 5, fill: 'none',
    stroke: '#22c55e', 'stroke-width': 2.5, 'stroke-dasharray': '4 3', opacity: 0 }, svg);

  // Vm badge
  const vmBadge = el('text', { x: W - 12, y: 24, 'font-size': 13, 'text-anchor': 'end',
    fill: 'var(--ui-fg)', 'font-weight': 600 }, svg);

  // ---- channel glyphs (clickable, with animated flux arrows) ----------------
  const glyphs = {};
  const tps = model.transporters;
  const gx0 = 60, gy = H - 54, gstep = (W - 120) / Math.max(1, tps.length - 1);
  tps.forEach((tp, k) => {
    const gx = gx0 + k * gstep;
    const g = el('g', { style: 'cursor:pointer' }, svg);
    const ring = el('rect', { x: gx - 22, y: gy - 14, width: 44, height: 30, rx: 8, fill: 'none',
      stroke: 'var(--ui-accent)', 'stroke-width': 2.5, opacity: 0 }, g);
    const arrow = el('line', { x1: gx, y1: gy - 20, x2: gx, y2: gy + 16, stroke: CLASS_COLOR[tp.cls] || '#8b5cf6',
      'stroke-width': 3, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round', class: 'flux-arrow', opacity: 0 }, g);
    el('rect', { x: gx - 20, y: gy - 11, width: 40, height: 22, rx: 5, fill: 'var(--ui-bg)',
      stroke: CLASS_COLOR[tp.cls] || '#8b5cf6', 'stroke-width': 2 }, g);
    el('text', { x: gx, y: gy + 4, 'font-size': 9, 'text-anchor': 'middle', fill: 'var(--ui-fg)', 'font-weight': 600 }, g)
      .textContent = (tp.id || '').replace(/^I/, '');
    g.addEventListener('click', () => onTransporterClick && onTransporterClick(tp));
    glyphs[tp.id] = { g, arrow, ring };
  });
  el('text', { x: W / 2, y: H - 30, 'font-size': 10, 'text-anchor': 'middle', fill: '#94a3b8' }, svg)
    .textContent = 'membrane channels & pump (click for detail) — click any compartment to set the injection site';

  // ---- companion Vm-vs-position canvas --------------------------------------
  let pctx = null;
  if (posCanvas) { posCanvas.hidden = false; pctx = posCanvas.getContext('2d'); }

  function drawProfile(state) {
    if (!pctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cw = posCanvas.clientWidth || 900, ch = posCanvas.clientHeight || 120;
    if (posCanvas.width !== cw * dpr || posCanvas.height !== ch * dpr) { posCanvas.width = cw * dpr; posCanvas.height = ch * dpr; }
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, cw, ch);
    const padL = 36, padR = 8, padT = 8, padB = 16;
    const lo = -90, hi = 50;
    const yOf = (v) => padT + (1 - (v - lo) / (hi - lo)) * (ch - padT - padB);
    const xOf = (i) => padL + (i / Math.max(1, model.N - 1)) * (cw - padL - padR);
    // gridlines at 0 and -65
    pctx.strokeStyle = 'rgba(127,127,127,0.25)'; pctx.fillStyle = 'rgba(127,127,127,0.8)';
    pctx.font = '10px system-ui, sans-serif'; pctx.textAlign = 'right'; pctx.textBaseline = 'middle';
    for (const gv of [0, -65]) { const y = yOf(gv); pctx.beginPath(); pctx.moveTo(padL, y); pctx.lineTo(cw - padR, y); pctx.stroke(); pctx.fillText(`${gv}`, padL - 3, y); }
    // profile line, coloured by V
    pctx.lineWidth = 2;
    for (let i = 0; i < model.N - 1; i++) {
      const v0 = state[`V${i}`], v1 = state[`V${i + 1}`];
      pctx.strokeStyle = vColor((v0 + v1) / 2);
      pctx.beginPath(); pctx.moveTo(xOf(i), yOf(v0)); pctx.lineTo(xOf(i + 1), yOf(v1)); pctx.stroke();
    }
    pctx.fillStyle = 'rgba(127,127,127,0.8)'; pctx.textAlign = 'left';
    pctx.fillText('Vm vs position (mV) — dendrite → soma → axon', padL, padT + 2);
  }

  // ---- update ---------------------------------------------------------------
  function update(state, activity, opts = {}) {
    liveCtx = opts.ctx || liveCtx;
    // colour every compartment by its local Vm
    for (const i of dend) dendNodes[i].setAttribute('fill', vColor(state[`V${i}`]));
    somaNode.setAttribute('fill', vColor(state[`V${model.somaIndex}`]));
    for (const c of axonComps) segNodes[c.i].setAttribute('fill', vColor(state[`V${c.i}`]));

    // injection marker follows the chosen site
    const inj = liveCtx && liveCtx.controls && liveCtx.controls.injectComp != null ? liveCtx.controls.injectComp : model.somaIndex;
    const sh = shapes[inj];
    if (sh) {
      const cx = sh.type === 'soma' || sh.type === 'dend' ? sh.cx : sh.x + sh.w / 2;
      const cy = sh.type === 'soma' || sh.type === 'dend' ? sh.cy : sh.y;
      injMarker.setAttribute('cx', cx); injMarker.setAttribute('cy', cy);
      injMarker.setAttribute('r', (sh.r || sh.half + 4) + 5); injMarker.setAttribute('opacity', 0.9);
    }

    const Vmax = model.observables ? model.observables(state, liveCtx || {}).Vmax : state[`V${model.somaIndex}`];
    vmBadge.textContent = `peak Vm = ${Vmax.toFixed(0)} mV`;

    // flux glyph arrows
    for (const tp of model.transporters) {
      const gl = glyphs[tp.id]; if (!gl) continue;
      const a = activity[tp.id] || { rate: 0, dir: 0 };
      const mag = Math.min(1, Math.abs(a.rate) / (opts.fluxScale || 1));
      gl.arrow.setAttribute('opacity', (0.12 + 0.88 * mag).toFixed(2));
      const period = 1.4 / (0.15 + mag);
      gl.arrow.style.animation = `${a.dir >= 0 ? 'fluxDown' : 'fluxUp'} ${period.toFixed(2)}s linear infinite`;
    }

    drawProfile(state);
  }

  function highlight(ids) {
    const set = new Set(ids || []);
    for (const tp of model.transporters) {
      if (glyphs[tp.id]) glyphs[tp.id].ring.setAttribute('opacity', set.has(tp.id) ? 0.9 : 0);
    }
  }

  return { update, highlight };
}
