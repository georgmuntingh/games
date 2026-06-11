// Shared helpers for building cell models from cited parameter files.
//
// A "cell model" is an object the Simulator can integrate. By convention every
// cell module exports:
//   buildModel(params) -> {
//     id, name, subtitle, refs,
//     compartments: [{ id, name, extracellular }],
//     species:      [{ id, name, symbol, z, color, compartments:[...] }],
//     transporters: [{ id, name, type, refs, equation, draw, species:[...] }],
//     y0, derivatives(t,y,ctx), gating?, stepHook?, onReset?,
//     concentrations(y) -> { cyto:{...}, plasma:{...} },  // mM, for display
//     membranePotential(y) -> mV,
//     observables(y) -> { Vm, volume, pHi, ... },          // scalar readouts
//     presets: { id: applyFn(ctx) }                        // lesson perturbations
//   }

/**
 * Recursively replace { value, units, ... } leaves with their numeric value,
 * producing a plain nested object of numbers usable in the math. Returns
 * { values, meta } where meta preserves the full annotated tree for the UI
 * (units, symbol, ref, note) so equations and citations can be surfaced.
 */
export function resolveParams(json) {
  const meta = {};
  const values = walk(json, meta);
  return { values, meta };

  function walk(node, metaOut) {
    if (node && typeof node === 'object' && 'value' in node && typeof node.value !== 'object') {
      metaOut.__leaf = node;
      return node.value;
    }
    const out = Array.isArray(node) ? [] : {};
    for (const [k, v] of Object.entries(node || {})) {
      if (k.startsWith('_')) continue;
      if (v && typeof v === 'object') {
        metaOut[k] = {};
        out[k] = walk(v, metaOut[k]);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
}

/** Look up the annotated leaf (value/units/symbol/ref/note) by dotted path. */
export function paramMeta(meta, path) {
  let node = meta;
  for (const part of path.split('.')) {
    if (!node || !(part in node)) return null;
    node = node[part];
  }
  return node && node.__leaf ? node.__leaf : null;
}

/**
 * Total amount of a conserved species across all compartments, in the model's
 * per-resting-cell-volume amount units. Used by conservation tests.
 */
export function totalAmount(y, keys) {
  return keys.reduce((s, k) => s + (y[k] || 0), 0);
}

/** Clamp helper used when applying perturbations / presets. */
export function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}
