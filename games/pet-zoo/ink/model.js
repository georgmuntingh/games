// The digit classifier, forward pass only.
//
// Written twice on purpose: once in numpy under tools/train-digits, and once here. The two
// are held to the same answer by fixtures the trainer emits — a transposed axis or an
// off-by-one pad would otherwise show up only as "recognition feels a bit worse", which is
// the hardest kind of bug to find and the easiest to live with by mistake.
//
// The shape of the network is read from the weights file rather than hardcoded, so
// retraining at a different size does not need this file edited. Convolutions are 3x3,
// padded to keep their size, ReLU'd and halved by max-pooling; then two dense layers.
//
// Weights arrive as symmetric per-tensor int8 with a float scale — about forty kilobytes
// for thirty-three thousand parameters — and are expanded to floats once, at load.

import { LAYERS, WEIGHTS } from './weights.js';
import { SIZE } from './raster.js';

const KERNEL = 3;

function decodeInt8(base64) {
  const binary = atob(base64);
  const out = new Int8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = (binary.charCodeAt(i) << 24) >> 24;
  return out;
}

/** Expand the packed weights once. Everything after this is plain float arithmetic. */
function unpack() {
  const bytes = decodeInt8(WEIGHTS);
  let at = 0;
  return LAYERS.map((layer) => {
    const [outs, ins] = layer.shape;
    const count = outs * ins;
    const weights = new Float32Array(count);
    for (let i = 0; i < count; i += 1) weights[i] = bytes[at + i] * layer.scale;
    at += count;
    return {
      ...layer,
      weights,
      bias: Float32Array.from(layer.bias),
      // A convolution's row is one output channel's whole 3x3 stack, so the input channel
      // count falls out of the row length.
      inChannels: layer.kind === 'conv' ? ins / (KERNEL * KERNEL) : ins,
      outChannels: outs,
    };
  });
}

let net = null;
const model = () => (net ??= unpack());

/** 3x3 convolution, padded to keep its size, with ReLU folded in. */
function convolve(input, inC, size, layer) {
  const outC = layer.outChannels;
  const plane = size * size;
  const out = new Float32Array(outC * plane);
  const { weights, bias } = layer;
  for (let oc = 0; oc < outC; oc += 1) {
    const wOut = oc * inC * KERNEL * KERNEL;
    const b = bias[oc];
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        let sum = b;
        for (let ic = 0; ic < inC; ic += 1) {
          const wIn = wOut + ic * KERNEL * KERNEL;
          const iPlane = ic * plane;
          for (let ky = 0; ky < KERNEL; ky += 1) {
            const iy = y + ky - 1;
            if (iy < 0 || iy >= size) continue;
            const row = iPlane + iy * size;
            const wRow = wIn + ky * KERNEL;
            for (let kx = 0; kx < KERNEL; kx += 1) {
              const ix = x + kx - 1;
              if (ix < 0 || ix >= size) continue;
              sum += input[row + ix] * weights[wRow + kx];
            }
          }
        }
        out[oc * plane + y * size + x] = sum > 0 ? sum : 0;
      }
    }
  }
  return out;
}

/** 2x2 max pool. An odd trailing row or column is dropped, as it is in training. */
function pool(input, channels, size) {
  const half = size >> 1;
  const out = new Float32Array(channels * half * half);
  for (let c = 0; c < channels; c += 1) {
    const src = c * size * size;
    const dst = c * half * half;
    for (let y = 0; y < half; y += 1) {
      for (let x = 0; x < half; x += 1) {
        const a = input[src + 2 * y * size + 2 * x];
        const b = input[src + 2 * y * size + 2 * x + 1];
        const c2 = input[src + (2 * y + 1) * size + 2 * x];
        const d = input[src + (2 * y + 1) * size + 2 * x + 1];
        out[dst + y * half + x] = Math.max(a, b, c2, d);
      }
    }
  }
  return out;
}

function dense(input, layer, relu) {
  const out = new Float32Array(layer.outChannels);
  const { weights, bias, inChannels } = layer;
  for (let o = 0; o < layer.outChannels; o += 1) {
    let sum = bias[o];
    const base = o * inChannels;
    for (let i = 0; i < inChannels; i += 1) sum += input[i] * weights[base + i];
    out[o] = relu && sum < 0 ? 0 : sum;
  }
  return out;
}

/** Raw scores for one 28x28 image, in digit order. */
export function logits(image, size = SIZE) {
  const layers = model();
  let activations = image;
  let channels = 1;
  let side = size;
  const convs = layers.filter((l) => l.kind === 'conv');
  const denses = layers.filter((l) => l.kind === 'dense');

  for (const layer of convs) {
    activations = convolve(activations, channels, side, layer);
    channels = layer.outChannels;
    activations = pool(activations, channels, side);
    side >>= 1;
  }
  denses.forEach((layer, i) => {
    activations = dense(activations, layer, i < denses.length - 1);
  });
  return activations;
}

export function softmax(scores) {
  let top = -Infinity;
  for (const v of scores) if (v > top) top = v;
  let total = 0;
  const out = new Float32Array(scores.length);
  for (let i = 0; i < scores.length; i += 1) {
    out[i] = Math.exp(scores[i] - top);
    total += out[i];
  }
  for (let i = 0; i < out.length; i += 1) out[i] /= total;
  return out;
}

/** The probability of each digit, 0..9, for one image. */
export const classify = (image, size = SIZE) => softmax(logits(image, size));

/** How many parameters are actually in here — reported by the accuracy page. */
export const parameterCount = () =>
  model().reduce((sum, l) => sum + l.weights.length + l.bias.length, 0);
