// SVG cross-section schematic: extracellular bath + cytosol, with transporter
// glyphs embedded in the membrane. Compartments are tinted by a chosen
// species' concentration; the cell outline scales with volume; each transporter
// shows an animated flux arrow (direction = net transport, speed = magnitude)
// and is clickable.

const SVGNS = 'http://www.w3.org/2000/svg';
const CLASS_COLOR = {
  pump: '#ef4444', channel: '#8b5cf6', uniporter: '#eab308',
  antiporter: '#06b6d4', leak: '#94a3b8',
};

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

const W = 560, H = 420;
const MEM_Y = 150;          // membrane y at rest
const X0 = 50, X1 = 510;    // membrane span

export function createSchematic(svg, model, { onTransporterClick } = {}) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const plasmaRect = el('rect', {
    x: 0, y: 0, width: W, height: H, fill: '#dbeafe', opacity: 0.5,
  }, svg);
  const cell = el('rect', {
    x: X0, y: MEM_Y, width: X1 - X0, height: H - MEM_Y - 20,
    rx: 26, fill: '#fee2e2', opacity: 0.7, stroke: '#b91c1c', 'stroke-width': 2,
  }, svg);

  el('text', { x: 16, y: 24, 'font-size': 13, fill: '#1e3a8a', 'font-weight': 600 }, svg)
    .textContent = 'Blood plasma (extracellular)';
  const cellLabel = el('text', { x: 16, y: H - 8, 'font-size': 13, fill: '#7f1d1d', 'font-weight': 600 }, svg);
  cellLabel.textContent = 'Cytosol';

  // Vm badge on the membrane.
  const vmBadge = el('text', {
    x: X1 - 6, y: MEM_Y - 8, 'font-size': 13, 'text-anchor': 'end',
    fill: 'var(--ui-fg)', 'font-weight': 600,
  }, svg);

  // Concentration chip groups.
  const plasmaChips = el('g', {}, svg);
  const cytoChips = el('g', {}, svg);

  // Transporter glyphs.
  const glyphs = {};
  const transporters = model.transporters;
  transporters.forEach((tp, i) => {
    const x = X0 + 40 + (X1 - X0 - 80) * tp.pos;
    const g = el('g', { class: 'tp-glyph', style: 'cursor:pointer' }, svg);
    g.dataset.id = tp.id;

    // flux arrow (vertical line through the membrane), animated via CSS.
    const arrow = el('line', {
      x1: x, y1: MEM_Y - 34, x2: x, y2: MEM_Y + 34,
      stroke: CLASS_COLOR[tp.cls], 'stroke-width': 3,
      'stroke-dasharray': '2 7', 'stroke-linecap': 'round',
      class: 'flux-arrow', opacity: 0.0,
    }, g);

    const box = el('rect', {
      x: x - 17, y: MEM_Y - 11, width: 34, height: 22, rx: 5,
      fill: 'var(--ui-bg)', stroke: CLASS_COLOR[tp.cls], 'stroke-width': 2,
    }, g);
    const label = el('text', {
      x, y: MEM_Y + 4, 'font-size': 9, 'text-anchor': 'middle',
      fill: 'var(--ui-fg)', 'font-weight': 600,
    }, g);
    label.textContent = tp.short || shortName(tp);

    const highlightRing = el('rect', {
      x: x - 22, y: MEM_Y - 16, width: 44, height: 32, rx: 8,
      fill: 'none', stroke: 'var(--ui-accent)', 'stroke-width': 2.5,
      opacity: 0, class: 'tp-ring',
    }, g);

    g.addEventListener('click', () => onTransporterClick && onTransporterClick(tp));
    glyphs[tp.id] = { g, arrow, box, label, highlightRing, x };
  });

  // membrane line on top of the cell.
  el('line', { x1: X0, y1: MEM_Y, x2: X1, y2: MEM_Y, stroke: '#b91c1c', 'stroke-width': 1, opacity: 0.4 }, svg);

  function shortName(tp) {
    return tp.name.replace(/[^A-Za-z0-9⁺⁻/]/g, '').slice(0, 5);
  }

  function tintFor(value, lo, hi) {
    const t = Math.max(0, Math.min(1, (value - lo) / (hi - lo)));
    return t;
  }

  function renderChips(group, items, baseY, side) {
    group.innerHTML = '';
    items.forEach((it, i) => {
      const col = i % 3;
      const rown = Math.floor(i / 3);
      const x = 90 + col * 150;
      const y = baseY + rown * 22;
      const g = el('g', {}, group);
      el('circle', { cx: x, cy: y - 4, r: 5, fill: it.color }, g);
      const t = el('text', { x: x + 12, y, 'font-size': 12, fill: 'var(--ui-fg)' }, g);
      t.textContent = `${it.label} ${it.text}`;
    });
  }

  let phase = 0;
  function update(state, activity, opts = {}) {
    const C = model.concentrations(state);
    const obs = model.observables(state, opts.ctx || {});

    // volume -> cell height/width.
    const v = Math.max(0.3, Math.min(1.8, state.v));
    const fullH = H - MEM_Y - 20;
    const h = fullH * Math.sqrt(v);
    const top = H - 20 - h;
    cell.setAttribute('y', top);
    cell.setAttribute('height', h);

    // tint cell by chosen species concentration.
    if (opts.tintSpecies) {
      const sp = opts.tintSpecies;
      const ci = C.cyto[sp] ?? 0;
      const ranges = opts.tintRange || [0, 150];
      const t = tintFor(ci, ranges[0], ranges[1]);
      cell.setAttribute('fill', mix('#fee2e2', '#ef4444', t));
    }

    vmBadge.textContent = `Vm = ${obs.Vm.toFixed(1)} mV`;

    // chips
    const plasma = opts.plasmaChips || [];
    const cyto = opts.cytoChips || [];
    renderChips(plasmaChips, plasma, 50);
    renderChips(cytoChips, cyto, MEM_Y + 36);

    // flux arrows
    phase += 1;
    for (const tp of transporters) {
      const gl = glyphs[tp.id];
      const a = activity[tp.id] || { rate: 0, dir: 0 };
      const mag = Math.min(1, Math.abs(a.rate) / (opts.fluxScale || 0.05));
      gl.arrow.setAttribute('opacity', (0.15 + 0.85 * mag).toFixed(2));
      // direction: dir<0 efflux (up), dir>0 influx (down).
      const period = 1.6 / (0.15 + mag); // seconds
      gl.arrow.style.animation = `${a.dir >= 0 ? 'fluxDown' : 'fluxUp'} ${period.toFixed(2)}s linear infinite`;
      // anchor glyph vertically to current membrane top.
      gl.g.setAttribute('transform', `translate(0, ${top - MEM_Y})`);
    }
    cellLabel.setAttribute('y', H - 8);
  }

  function highlight(ids) {
    const set = new Set(ids || []);
    for (const tp of transporters) {
      glyphs[tp.id].highlightRing.setAttribute('opacity', set.has(tp.id) ? 0.9 : 0);
    }
  }

  return { update, highlight };
}

// linear hex colour mix.
function mix(a, b, t) {
  const pa = hex(a), pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
