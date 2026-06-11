// Rolling multi-trace time-series plot on a 2D canvas. Series are grouped onto
// named y-axes; each axis autoscales to its visible data. Up to two axes get
// drawn tick scales (one per side, left/right); additional axes still plot
// (autoscaled, labelled in the legend). Designed for live streaming.

export function createPlots(canvas, {
  windowSpan = 60, timeLabel = 'min',
  axes = { mM: { label: 'mM', side: 'left' }, mV: { label: 'mV', side: 'right' } },
} = {}) {
  const ctx = canvas.getContext('2d');
  let series = [];          // [{ key, label, color, axis, on }]
  const data = [];          // [{ t, values:{key:val} }]
  let span = windowSpan;
  const axisCfg = axes;

  function setSeries(defs) { series = defs.map((d) => ({ on: true, ...d })); }
  function toggle(key) { const s = series.find((x) => x.key === key); if (s) s.on = !s.on; draw(); }
  function setWindow(s) { span = s; }
  function clear() { data.length = 0; draw(); }

  function addSample(t, values) {
    data.push({ t, values: { ...values } });
    const tMin = t - span;
    while (data.length > 2 && data[0].t < tMin && data[1].t < tMin) data.shift();
  }

  function niceBounds(min, max) {
    if (!isFinite(min) || !isFinite(max)) return [0, 1];
    if (min === max) { const p = Math.abs(min) || 1; return [min - p * 0.1, max + p * 0.1]; }
    const pad = (max - min) * 0.08;
    return [min - pad, max + pad];
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 900;
    const cssH = canvas.clientHeight || 260;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = cssW, h = cssH;
    const padL = 50, padR = 52, padT = 10, padB = 22;

    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    if (data.length < 2) {
      ctx.fillStyle = 'rgba(127,127,127,0.6)';
      ctx.textAlign = 'left';
      ctx.fillText('Press Play to record the time course…', padL, h / 2);
      return;
    }

    const tEnd = data[data.length - 1].t;
    const tStart = Math.max(data[0].t, tEnd - span);
    const xOf = (t) => padL + ((t - tStart) / Math.max(1e-9, tEnd - tStart)) * (w - padL - padR);

    // per-axis bounds over the visible window.
    const bounds = {};
    for (const id of Object.keys(axisCfg)) bounds[id] = { min: Infinity, max: -Infinity, used: false };
    for (const s of series) {
      if (!s.on || !bounds[s.axis]) continue;
      const b = bounds[s.axis];
      for (const d of data) {
        if (d.t < tStart) continue;
        const v = d.values[s.key];
        if (v == null || !isFinite(v)) continue;
        b.used = true; b.min = Math.min(b.min, v); b.max = Math.max(b.max, v);
      }
    }
    for (const id of Object.keys(bounds)) {
      const [lo, hi] = niceBounds(bounds[id].min, bounds[id].max);
      bounds[id].lo = lo; bounds[id].hi = hi;
    }
    const yOf = (v, axis) => {
      const b = bounds[axis] || { lo: 0, hi: 1 };
      return padT + (1 - (v - b.lo) / Math.max(1e-9, b.hi - b.lo)) * (h - padT - padB);
    };

    // choose one drawn axis per side (first used, in config order).
    let leftAxis = null, rightAxis = null;
    for (const [id, cfg] of Object.entries(axisCfg)) {
      if (!bounds[id].used) continue;
      if (cfg.side === 'left' && !leftAxis) leftAxis = id;
      if (cfg.side === 'right' && !rightAxis) rightAxis = id;
    }

    ctx.strokeStyle = 'rgba(127,127,127,0.18)';
    ctx.fillStyle = 'rgba(127,127,127,0.85)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * (h - padT - padB);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      if (leftAxis) {
        const b = bounds[leftAxis];
        const v = b.hi - (i / 4) * (b.hi - b.lo);
        ctx.textAlign = 'right'; ctx.fillText(fmt(v), padL - 4, y);
      }
      if (rightAxis) {
        const b = bounds[rightAxis];
        const v = b.hi - (i / 4) * (b.hi - b.lo);
        ctx.textAlign = 'left'; ctx.fillText(fmt(v), w - padR + 4, y);
      }
    }
    ctx.textAlign = 'center';
    ctx.fillText(`t (${timeLabel})`, (padL + w - padR) / 2, h - 8);
    if (leftAxis) { ctx.save(); ctx.translate(13, h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(axisCfg[leftAxis].label, 0, 0); ctx.restore(); }
    if (rightAxis) { ctx.save(); ctx.translate(w - 9, h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(axisCfg[rightAxis].label, 0, 0); ctx.restore(); }

    for (let i = 0; i <= 4; i++) {
      const t = tStart + (i / 4) * (tEnd - tStart);
      ctx.textAlign = 'center'; ctx.fillText(fmt(t), xOf(t), h - 8);
    }

    for (const s of series) {
      if (!s.on || !bounds[s.axis]) continue;
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.6; ctx.beginPath();
      let started = false;
      for (const d of data) {
        if (d.t < tStart) continue;
        const v = d.values[s.key];
        if (v == null || !isFinite(v)) continue;
        const x = xOf(d.t), y = yOf(v, s.axis);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function fmt(v) {
    const a = Math.abs(v);
    if (a !== 0 && (a < 0.01 || a >= 1e4)) return v.toExponential(1);
    if (a >= 100) return v.toFixed(0);
    if (a >= 1) return v.toFixed(1);
    return v.toFixed(2);
  }

  return { setSeries, toggle, addSample, clear, draw, getSeries: () => series, setWindow };
}
