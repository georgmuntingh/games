// Rolling multi-trace time-series plot on a 2D canvas. Series are grouped onto
// two y-axes by unit (left = mM, right = mV). Each series autoscales to the data
// in the visible window. Designed for live streaming via addSample().

export function createPlots(canvas, { windowSpan = 60, timeLabel = 'min' } = {}) {
  const ctx = canvas.getContext('2d');
  let series = [];          // [{ key, label, color, axis, on }]
  const data = [];          // [{ t, values:{key:val} }]
  let span = windowSpan;

  function setSeries(defs) {
    series = defs.map((d) => ({ on: true, ...d }));
  }
  function toggle(key) {
    const s = series.find((x) => x.key === key);
    if (s) s.on = !s.on;
    draw();
  }
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
    const padL = 46, padR = 46, padT = 10, padB = 22;
    const fg = getComputedStyle(canvas).color || '#888';

    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    if (data.length < 2) {
      ctx.fillStyle = 'rgba(127,127,127,0.6)';
      ctx.fillText('Press Play to record the time course…', padL, h / 2);
      return;
    }

    const tEnd = data[data.length - 1].t;
    const tStart = Math.max(data[0].t, tEnd - span);
    const xOf = (t) => padL + ((t - tStart) / Math.max(1e-9, tEnd - tStart)) * (w - padL - padR);

    // axis bounds per unit, over the visible window.
    const axes = { mM: { min: Infinity, max: -Infinity, used: false }, mV: { min: Infinity, max: -Infinity, used: false } };
    for (const s of series) {
      if (!s.on) continue;
      const ax = axes[s.axis];
      for (const d of data) {
        if (d.t < tStart) continue;
        const v = d.values[s.key];
        if (v == null || !isFinite(v)) continue;
        ax.used = true;
        ax.min = Math.min(ax.min, v); ax.max = Math.max(ax.max, v);
      }
    }
    for (const k of ['mM', 'mV']) {
      const [a, b] = niceBounds(axes[k].min, axes[k].max);
      axes[k].lo = a; axes[k].hi = b;
    }
    const yOf = (v, axis) => {
      const ax = axes[axis];
      return padT + (1 - (v - ax.lo) / Math.max(1e-9, ax.hi - ax.lo)) * (h - padT - padB);
    };

    // grid + axis labels
    ctx.strokeStyle = 'rgba(127,127,127,0.18)';
    ctx.fillStyle = 'rgba(127,127,127,0.85)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * (h - padT - padB);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      if (axes.mM.used) {
        const v = axes.mM.hi - (i / 4) * (axes.mM.hi - axes.mM.lo);
        ctx.textAlign = 'right'; ctx.fillText(fmt(v), padL - 4, y);
      }
      if (axes.mV.used) {
        const v = axes.mV.hi - (i / 4) * (axes.mV.hi - axes.mV.lo);
        ctx.textAlign = 'left'; ctx.fillText(fmt(v), w - padR + 4, y);
      }
    }
    ctx.textAlign = 'center';
    ctx.fillText(`t (${timeLabel})`, (padL + w - padR) / 2, h - 8);
    if (axes.mM.used) { ctx.save(); ctx.translate(12, h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('mM', 0, 0); ctx.restore(); }
    if (axes.mV.used) { ctx.save(); ctx.translate(w - 10, h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('mV', 0, 0); ctx.restore(); }

    // x ticks
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const t = tStart + (i / 4) * (tEnd - tStart);
      ctx.fillText(fmt(t), xOf(t), h - 8);
    }

    // traces
    for (const s of series) {
      if (!s.on) continue;
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
