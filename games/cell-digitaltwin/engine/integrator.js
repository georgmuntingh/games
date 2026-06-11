// Generic time integrator operating on a plain object state ("y").
//
// A model exposes:
//   y0                         : initial state object (numbers)
//   derivatives(t, y, ctx)     : returns dy/dt object for the ODE variables
//   gating (optional)          : [{ name, inf(t,y,ctx), tau(t,y,ctx) }, ...]
//                                integrated by the Rush-Larsen exponential rule
//   stepHook (optional)        : (t, y, ctx) => void, run after each accepted step
//
// Non-gating variables use classic RK4. Gating variables (Hodgkin-Huxley
// activation/inactivation, in [0,1]) use Rush & Larsen (1978), which is stable
// at large dt. The two are combined by Strang-style operator splitting.

function keysOf(y, gatingNames) {
  return Object.keys(y).filter((k) => !gatingNames.has(k));
}

function axpy(out, a, x, b, y, odeKeys) {
  // out = a*x + b*y over odeKeys
  for (const k of odeKeys) out[k] = a * x[k] + b * y[k];
  return out;
}

function rushLarsenStep(y, t, ctx, gating, dt) {
  for (const g of gating) {
    const inf = g.inf(t, y, ctx);
    const tau = g.tau(t, y, ctx);
    y[g.name] = inf - (inf - y[g.name]) * Math.exp(-dt / tau);
  }
}

export class Simulator {
  constructor(model, ctx = {}) {
    this.model = model;
    this.ctx = ctx;
    this.t = 0;
    this.y = { ...model.y0 };
    this.gating = model.gating || [];
    this.gatingNames = new Set(this.gating.map((g) => g.name));
    this.odeKeys = keysOf(this.y, this.gatingNames);
  }

  reset() {
    this.t = 0;
    this.y = { ...this.model.y0 };
    if (this.model.onReset) this.model.onReset(this.y, this.ctx);
  }

  /** One RK4 step (ode vars) + Rush-Larsen half-steps (gating vars). */
  step(dt) {
    const { model, ctx } = this;
    const y = this.y;
    const t = this.t;
    const odeKeys = this.odeKeys;

    // Rush-Larsen half step for gating, using current ode values.
    if (this.gating.length) rushLarsenStep(y, t, ctx, this.gating, dt / 2);

    // RK4 for the ode variables.
    const k1 = model.derivatives(t, y, ctx);
    const y2 = axpy({ ...y }, 1, y, dt / 2, k1, odeKeys);
    const k2 = model.derivatives(t + dt / 2, y2, ctx);
    const y3 = axpy({ ...y }, 1, y, dt / 2, k2, odeKeys);
    const k3 = model.derivatives(t + dt / 2, y3, ctx);
    const y4 = axpy({ ...y }, 1, y, dt, k3, odeKeys);
    const k4 = model.derivatives(t + dt, y4, ctx);
    for (const key of odeKeys) {
      y[key] += (dt / 6) * (k1[key] + 2 * k2[key] + 2 * k3[key] + k4[key]);
    }

    // Second Rush-Larsen half step.
    if (this.gating.length) rushLarsenStep(y, t + dt, ctx, this.gating, dt / 2);

    this.t += dt;
    if (model.stepHook) model.stepHook(this.t, y, ctx);
    return y;
  }

  /** Advance by `span` model-time units in sub-steps of at most `dt`. */
  advance(span, dt) {
    let remaining = span;
    const n = Math.max(1, Math.ceil(span / dt));
    const h = span / n;
    for (let i = 0; i < n; i++) this.step(h);
    return this.y;
  }
}
