// Mitochondrion schematic: the outer membrane, intermembrane space, and the
// inner membrane folded into cristae enclosing the matrix. The respiratory
// complexes (I–IV), ATP synthase (V) and the inner-membrane carriers/channels
// (ANT, PiC, proton leak, Ca²⁺ uniporter, Na⁺/Ca²⁺ exchanger, ROS channel, PTP)
// sit in the cristae membrane and pump/conduct H⁺ and ions; animated arrows show
// the flux directions and magnitudes. The matrix is colour-mapped by a chosen
// variable (ΔΨm, NADH or Ca²⁺). A companion canvas draws the proton-motive-force
// gauge (ΔΨ + ΔpH) alongside respiration (O₂) and ATP-output bars.
//
// Implements the shared schematic contract: createMitoSchematic(svg, model, opts)
// -> { update(state, activity, opts), highlight(ids) }.

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 560, H = 420;
const CLASS_COLOR = {
  etc: '#8b5cf6', synthase: '#22c55e', carrier: '#eab308',
  uniporter: '#06b6d4', exchanger: '#0ea5e9', leak: '#94a3b8',
  ros: '#f97316', ptp: '#ef4444',
};

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

// Matrix tint maps a 0..1 level to a colour ramp (pale -> saturated).
function ramp(t, hi) {
  t = Math.max(0, Math.min(1, t));
  const lo = [241, 245, 249];
  const r = Math.round(lo[0] + (hi[0] - lo[0]) * t);
  const g = Math.round(lo[1] + (hi[1] - lo[1]) * t);
  const b = Math.round(lo[2] + (hi[2] - lo[2]) * t);
  return `rgb(${r},${g},${b})`;
}
const TINT_HI = { psi: [16, 185, 129], nadh: [37, 99, 235], ca: [239, 68, 68] };

export function createMitoSchematic(svg, model, { onTransporterClick, posCanvas, ctx } = {}) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let liveCtx = ctx;

  // cytosol background
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#ede9fe', opacity: 0.35 }, svg);
  el('text', { x: 14, y: 22, 'font-size': 12, fill: '#5b21b6', 'font-weight': 600 }, svg)
    .textContent = 'Cytosol';

  // outer membrane (organelle outline)
  el('rect', { x: 26, y: 60, width: W - 52, height: H - 120, rx: 60,
    fill: '#fae8ff', opacity: 0.5, stroke: '#7e22ce', 'stroke-width': 2 }, svg);
  el('text', { x: 40, y: 80, 'font-size': 11, fill: '#7e22ce' }, svg).textContent = 'outer membrane · intermembrane space';

  // matrix (inner region, tinted)
  const matrix = el('rect', { x: 70, y: 110, width: W - 140, height: H - 220, rx: 44,
    fill: '#f1f5f9', stroke: '#0f766e', 'stroke-width': 2 }, svg);
  const matrixLabel = el('text', { x: W / 2, y: H - 128, 'font-size': 12, 'text-anchor': 'middle', fill: '#0f766e', 'font-weight': 600 }, svg);
  matrixLabel.textContent = 'matrix';

  // a couple of cristae folds (decorative inner-membrane folds into the matrix)
  for (const cy of [150, H - 168]) {
    el('path', { d: `M 96 ${cy} q 40 26 80 0 q 40 -26 80 0 q 40 26 80 0 q 40 -26 80 0`,
      fill: 'none', stroke: '#0f766e', 'stroke-width': 1.5, opacity: 0.35 }, svg);
  }

  // ΔΨm badge
  const psiBadge = el('text', { x: W - 34, y: 80, 'font-size': 13, 'text-anchor': 'end',
    fill: 'var(--ui-fg)', 'font-weight': 600 }, svg);

  // ---- complex / carrier glyphs along the inner membrane --------------------
  // Two rows: respiratory chain (top inner-membrane band) and carriers (bottom).
  const memTopY = 122, memBotY = H - 132;
  const tps = model.transporters;
  const topIds = ['CI', 'CII', 'CIII', 'CIV', 'CV'];
  const top = tps.filter((t) => topIds.includes(t.id));
  const bottom = tps.filter((t) => !topIds.includes(t.id));
  const glyphs = {};

  function placeRow(list, y, pumpUp) {
    const x0 = 92, x1 = W - 92;
    list.forEach((tp, k) => {
      const x = list.length === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * (k / (list.length - 1));
      const g = el('g', { style: 'cursor:pointer' }, svg);
      const ring = el('rect', { x: x - 22, y: y - 15, width: 44, height: 30, rx: 8, fill: 'none',
        stroke: 'var(--ui-accent)', 'stroke-width': 2.5, opacity: 0 }, g);
      // flux arrow crossing the membrane (H+ or ion)
      const arrow = el('line', { x1: x, y1: y - (pumpUp ? 24 : -24), x2: x, y2: y + (pumpUp ? 24 : -24),
        stroke: CLASS_COLOR[tp.cls] || '#8b5cf6', 'stroke-width': 3, 'stroke-dasharray': '2 6',
        'stroke-linecap': 'round', class: 'flux-arrow', opacity: 0 }, g);
      el('rect', { x: x - 20, y: y - 12, width: 40, height: 24, rx: 5, fill: 'var(--ui-bg)',
        stroke: CLASS_COLOR[tp.cls] || '#8b5cf6', 'stroke-width': 2 }, g);
      el('text', { x, y: y + 4, 'font-size': 9, 'text-anchor': 'middle', fill: 'var(--ui-fg)', 'font-weight': 600 }, g)
        .textContent = tp.short || tp.id;
      g.addEventListener('click', () => onTransporterClick && onTransporterClick(tp));
      glyphs[tp.id] = { g, arrow, ring };
    });
  }
  placeRow(top, memTopY, true);
  placeRow(bottom, memBotY, false);

  // ---- proton-motive-force gauge on the companion canvas --------------------
  let pctx = null;
  if (posCanvas) { posCanvas.hidden = false; pctx = posCanvas.getContext('2d'); }

  function bar(c, x, w, vFrac, color, label, valTxt, cw, ch) {
    const padT = 16, padB = 16;
    const h = (ch - padT - padB);
    const top = padT + (1 - Math.max(0, Math.min(1, vFrac))) * h;
    c.fillStyle = 'rgba(127,127,127,0.15)'; c.fillRect(x, padT, w, h);
    c.fillStyle = color; c.fillRect(x, top, w, padT + h - top);
    c.fillStyle = 'rgba(127,127,127,0.9)'; c.font = '10px system-ui'; c.textAlign = 'center';
    c.textBaseline = 'top'; c.fillText(label, x + w / 2, padT + h + 3);
    c.textBaseline = 'bottom'; c.fillText(valTxt, x + w / 2, padT - 3);
  }

  function drawGauge(obs) {
    if (!pctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cw = posCanvas.clientWidth || 900, ch = posCanvas.clientHeight || 120;
    if (posCanvas.width !== cw * dpr || posCanvas.height !== ch * dpr) { posCanvas.width = cw * dpr; posCanvas.height = ch * dpr; }
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, cw, ch);
    // proton-motive force as a stacked bar (ΔΨ electrical + ΔpH chemical), then O2 and ATP
    const bw = 54, gap = 26; let x = 16;
    const padT = 16, padB = 16, h = ch - padT - padB;
    // stacked Δp
    const dpsi = Math.max(0, obs.dPsi), dph = Math.max(0, obs.dPH), pmf = Math.max(1, obs.pmf);
    const scale = 240; // mV full-scale
    pctx.fillStyle = 'rgba(127,127,127,0.15)'; pctx.fillRect(x, padT, bw, h);
    const hPsi = (dpsi / scale) * h, hPh = (dph / scale) * h;
    pctx.fillStyle = '#10b981'; pctx.fillRect(x, padT + h - hPsi, bw, hPsi);
    pctx.fillStyle = '#f59e0b'; pctx.fillRect(x, padT + h - hPsi - hPh, bw, hPh);
    pctx.fillStyle = 'rgba(127,127,127,0.9)'; pctx.font = '10px system-ui';
    pctx.textAlign = 'center'; pctx.textBaseline = 'top';
    pctx.fillText('Δp (mV)', x + bw / 2, padT + h + 3);
    pctx.textBaseline = 'bottom'; pctx.fillText(`${obs.pmf.toFixed(0)}`, x + bw / 2, padT - 3);
    // legend
    pctx.textAlign = 'left'; pctx.textBaseline = 'middle';
    pctx.fillStyle = '#10b981'; pctx.fillRect(x + bw + 8, padT + 4, 9, 9);
    pctx.fillStyle = 'rgba(127,127,127,0.9)'; pctx.fillText('ΔΨ ' + obs.dPsi.toFixed(0), x + bw + 20, padT + 9);
    pctx.fillStyle = '#f59e0b'; pctx.fillRect(x + bw + 8, padT + 20, 9, 9);
    pctx.fillStyle = 'rgba(127,127,127,0.9)'; pctx.fillText('ΔpH·Z ' + obs.dPH.toFixed(0), x + bw + 20, padT + 25);
    // O2 and ATP bars
    x = 220;
    bar(pctx, x, bw, obs.VO2 / (obs.VO2max || 1), '#3b82f6', 'O₂ uptake', obs.VO2.toFixed(2), cw, ch); x += bw + gap;
    bar(pctx, x, bw, obs.VATP / (obs.VATPmax || 1), '#22c55e', 'ATP synth', obs.VATP.toFixed(2), cw, ch); x += bw + gap;
    bar(pctx, x, bw, obs.NADHfrac, '#2563eb', 'NADH/N', (obs.NADHfrac * 100).toFixed(0) + '%', cw, ch); x += bw + gap;
    bar(pctx, x, bw, Math.min(1, obs.ROS / (obs.ROSmax || 1)), '#f97316', 'ROS', obs.ROS.toFixed(2), cw, ch);
    if (obs.PTP > 0.05) {
      pctx.fillStyle = '#ef4444'; pctx.textAlign = 'right'; pctx.textBaseline = 'top';
      pctx.font = 'bold 11px system-ui'; pctx.fillText('⚠ PTP OPEN', cw - 8, 4);
    }
  }

  function update(state, activity, opts = {}) {
    liveCtx = opts.ctx || liveCtx;
    const obs = model.observables(state, liveCtx || {});
    // matrix tint by chosen variable
    const which = opts.tintSpecies || 'psi';
    const level = which === 'nadh' ? obs.NADHfrac
      : which === 'ca' ? Math.min(1, obs.Cam / 2)
        : Math.min(1, obs.DeltaPsi / 200);
    matrix.setAttribute('fill', ramp(level, TINT_HI[which] || TINT_HI.psi));
    psiBadge.textContent = `ΔΨm = ${obs.DeltaPsi.toFixed(0)} mV`;
    // flux arrows
    for (const tp of model.transporters) {
      const gl = glyphs[tp.id]; if (!gl) continue;
      const a = activity[tp.id] || { rate: 0, dir: 0 };
      const mag = Math.min(1, Math.abs(a.rate) / (opts.fluxScale || 1));
      gl.arrow.setAttribute('opacity', (0.1 + 0.9 * mag).toFixed(2));
      const period = 1.4 / (0.15 + mag);
      gl.arrow.style.animation = `${a.dir >= 0 ? 'fluxDown' : 'fluxUp'} ${period.toFixed(2)}s linear infinite`;
    }
    matrix.setAttribute('opacity', obs.PTP > 0.5 ? 0.4 : 1);
    drawGauge(obs);
  }

  function highlight(ids) {
    const set = new Set(ids || []);
    for (const tp of model.transporters) {
      if (glyphs[tp.id]) glyphs[tp.id].ring.setAttribute('opacity', set.has(tp.id) ? 0.9 : 0);
    }
  }

  return { update, highlight };
}
