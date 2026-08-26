"""Train the digit recogniser that ships inside Pet Zoo.

Pure numpy on purpose. The model is small enough that a framework would be more
dependency than help, and the forward pass has to be re-implementable in ~60 lines of
plain JavaScript anyway — writing it twice, once here and once in ink/model.js, keeps
both honest.

Data: the `mnist` npm package bundles 10,000 labelled 28x28 samples as JSON inside its
tarball (1000-ish per digit, already centred by centre of mass the way MNIST itself is).
See README.md for how to fetch it.

    python3 train.py --digits path/to/digits --out ../../games/pet-zoo/ink/weights.js

Augmentation is the part that matters. MNIST is adult handwriting captured on paper; this
model has to read a six-year-old's finger on a phone. Rotation, scale, shear and — most
importantly — stroke thickness are what close that gap.
"""

import argparse
import base64
import json
import pathlib
import time

import numpy as np

SIZE = 28
CLASSES = 10
rng = np.random.default_rng(7)


# ----------------------------------------------------------------------- data

def load_digits(folder):
    xs, ys = [], []
    for digit in range(CLASSES):
        raw = json.loads((pathlib.Path(folder) / f"{digit}.json").read_text())["data"]
        flat = np.asarray(raw, dtype=np.float32)
        samples = flat[: (len(flat) // (SIZE * SIZE)) * SIZE * SIZE].reshape(-1, SIZE, SIZE)
        xs.append(samples)
        ys.append(np.full(len(samples), digit, dtype=np.int64))
    return np.concatenate(xs)[:, None, :, :], np.concatenate(ys)


def split(x, y, per_class_test=100):
    """Hold out the same number from each digit, so the test set is not lopsided."""
    test_idx = np.concatenate([np.where(y == d)[0][:per_class_test] for d in range(CLASSES)])
    mask = np.ones(len(y), dtype=bool)
    mask[test_idx] = False
    return x[mask], y[mask], x[test_idx], y[test_idx]


# --------------------------------------------------------------- augmentation

def warp(batch, angle, scale, shear, dx, dy):
    """Affine warp about the image centre, bilinear, zero outside."""
    n = len(batch)
    cos, sin = np.cos(angle), np.sin(angle)
    # Inverse map: destination pixel -> source pixel.
    a = cos / scale
    b = (sin + shear * cos) / scale
    c = -sin / scale
    d = (cos - shear * sin) / scale

    ys, xs = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)
    xs = xs - (SIZE - 1) / 2
    ys = ys - (SIZE - 1) / 2
    sx = a[:, None, None] * xs + b[:, None, None] * ys + (SIZE - 1) / 2 - dx[:, None, None]
    sy = c[:, None, None] * xs + d[:, None, None] * ys + (SIZE - 1) / 2 - dy[:, None, None]

    x0 = np.floor(sx).astype(np.int32)
    y0 = np.floor(sy).astype(np.int32)
    fx = (sx - x0)[:, None, :, :]
    fy = (sy - y0)[:, None, :, :]

    def at(ix, iy):
        ok = (ix >= 0) & (ix < SIZE) & (iy >= 0) & (iy < SIZE)
        ix = np.clip(ix, 0, SIZE - 1)
        iy = np.clip(iy, 0, SIZE - 1)
        flat = batch[np.arange(n)[:, None, None], 0, iy, ix]
        return (flat * ok)[:, None, :, :]

    return (
        at(x0, y0) * (1 - fx) * (1 - fy)
        + at(x0 + 1, y0) * fx * (1 - fy)
        + at(x0, y0 + 1) * (1 - fx) * fy
        + at(x0 + 1, y0 + 1) * fx * fy
    ).astype(np.float32)


def thicken(batch, amount):
    """Blend towards a 3x3 dilation (fatter) or erosion (thinner).

    The single most useful augmentation here. A finger on a phone lays down a much heavier
    line than a pen on paper, and a model trained only on MNIST's stroke weight reads a
    thick 8 as a blob.
    """
    padded = np.pad(batch, ((0, 0), (0, 0), (1, 1), (1, 1)))
    shifts = [padded[:, :, dy:dy + SIZE, dx:dx + SIZE] for dy in range(3) for dx in range(3)]
    stacked = np.stack(shifts)
    fatter = stacked.max(axis=0)
    thinner = stacked.min(axis=0)
    a = amount[:, None, None, None]
    return np.where(a >= 0, batch + a * (fatter - batch), batch + (-a) * (thinner - batch)).astype(np.float32)


def augment(batch):
    n = len(batch)
    out = warp(
        batch,
        angle=rng.uniform(-0.26, 0.26, n).astype(np.float32),      # +/- 15 degrees
        scale=rng.uniform(0.85, 1.15, n).astype(np.float32),
        shear=rng.uniform(-0.2, 0.2, n).astype(np.float32),
        dx=rng.uniform(-2, 2, n).astype(np.float32),
        dy=rng.uniform(-2, 2, n).astype(np.float32),
    )
    strength = rng.uniform(-0.6, 0.8, n).astype(np.float32)
    strength[rng.random(n) < 0.25] = 0.0
    return np.clip(thicken(out, strength), 0.0, 1.0)


# ---------------------------------------------------------------------- layers

def im2col(x, k):
    n, c, h, w = x.shape
    oh, ow = h - k + 1, w - k + 1
    cols = np.lib.stride_tricks.sliding_window_view(x, (k, k), axis=(2, 3))
    return cols.transpose(0, 2, 3, 1, 4, 5).reshape(n * oh * ow, c * k * k)


class Conv:
    def __init__(self, cin, cout, k=3):
        self.k = k
        self.w = (rng.standard_normal((cout, cin * k * k)) * np.sqrt(2.0 / (cin * k * k))).astype(np.float32)
        self.b = np.zeros(cout, dtype=np.float32)

    def forward(self, x):
        pad = self.k // 2
        self.xp = np.pad(x, ((0, 0), (0, 0), (pad, pad), (pad, pad)))
        self.shape = x.shape
        self.cols = im2col(self.xp, self.k)
        out = self.cols @ self.w.T + self.b
        n, _, h, w = x.shape
        return out.reshape(n, h, w, -1).transpose(0, 3, 1, 2)

    def backward(self, g):
        n, cout, h, w = g.shape
        gf = g.transpose(0, 2, 3, 1).reshape(-1, cout)
        self.gw = gf.T @ self.cols
        self.gb = gf.sum(axis=0)
        gcols = gf @ self.w
        pad = self.k // 2
        gx = np.zeros_like(self.xp)
        cin = self.shape[1]
        gcols = gcols.reshape(n, h, w, cin, self.k, self.k)
        for dy in range(self.k):
            for dx in range(self.k):
                gx[:, :, dy:dy + h, dx:dx + w] += gcols[:, :, :, :, dy, dx].transpose(0, 3, 1, 2)
        return gx[:, :, pad:pad + self.shape[2], pad:pad + self.shape[3]]

    def params(self):
        return [(self.w, "gw"), (self.b, "gb")]


class Dense:
    def __init__(self, cin, cout):
        self.w = (rng.standard_normal((cout, cin)) * np.sqrt(2.0 / cin)).astype(np.float32)
        self.b = np.zeros(cout, dtype=np.float32)

    def forward(self, x):
        self.x = x
        return x @ self.w.T + self.b

    def backward(self, g):
        self.gw = g.T @ self.x
        self.gb = g.sum(axis=0)
        return g @ self.w

    def params(self):
        return [(self.w, "gw"), (self.b, "gb")]


def relu_f(x):
    return np.maximum(x, 0.0)


def pool_f(x):
    n, c, h, w = x.shape
    h2, w2 = h // 2, w // 2
    cut = x[:, :, : h2 * 2, : w2 * 2].reshape(n, c, h2, 2, w2, 2)
    flat = cut.transpose(0, 1, 2, 4, 3, 5).reshape(n, c, h2, w2, 4)
    idx = flat.argmax(axis=-1)
    return flat.max(axis=-1), idx, (h, w)


def pool_b(g, idx, shape):
    n, c, h2, w2 = g.shape
    h, w = shape
    flat = np.zeros((n, c, h2, w2, 4), dtype=np.float32)
    np.put_along_axis(flat, idx[..., None], g[..., None], axis=-1)
    back = flat.reshape(n, c, h2, w2, 2, 2).transpose(0, 1, 2, 4, 3, 5).reshape(n, c, h2 * 2, w2 * 2)
    out = np.zeros((n, c, h, w), dtype=np.float32)
    out[:, :, : h2 * 2, : w2 * 2] = back
    return out


# ----------------------------------------------------------------------- model

class Net:
    def __init__(self):
        self.c1, self.c2, self.c3 = Conv(1, 16), Conv(16, 32), Conv(32, 32)
        self.f1, self.f2 = Dense(3 * 3 * 32, 64), Dense(64, CLASSES)
        self.layers = [self.c1, self.c2, self.c3, self.f1, self.f2]
        self.state = {}

    def forward(self, x, train=True):
        a1 = relu_f(self.c1.forward(x)); self.m1 = a1 > 0
        p1, self.i1, self.s1 = pool_f(a1)
        a2 = relu_f(self.c2.forward(p1)); self.m2 = a2 > 0
        p2, self.i2, self.s2 = pool_f(a2)
        a3 = relu_f(self.c3.forward(p2)); self.m3 = a3 > 0
        p3, self.i3, self.s3 = pool_f(a3)
        self.flat_shape = p3.shape
        h = relu_f(self.f1.forward(p3.reshape(len(x), -1))); self.m4 = h > 0
        return self.f2.forward(h)

    def backward(self, g):
        g = self.f1.backward(self.f2.backward(g) * self.m4)
        g = pool_b(g.reshape(self.flat_shape), self.i3, self.s3)
        g = pool_b(self.c3.backward(g * self.m3), self.i2, self.s2)
        g = pool_b(self.c2.backward(g * self.m2), self.i1, self.s1)
        self.c1.backward(g * self.m1)

    def step(self, lr, t, decay=1e-4):
        for li, layer in enumerate(self.layers):
            for pi, (p, gname) in enumerate(layer.params()):
                g = getattr(layer, gname) + decay * p
                key = (li, pi)
                m, v = self.state.setdefault(key, (np.zeros_like(p), np.zeros_like(p)))
                m *= 0.9; m += 0.1 * g
                v *= 0.999; v += 0.001 * g * g
                p -= lr * (m / (1 - 0.9 ** t)) / (np.sqrt(v / (1 - 0.999 ** t)) + 1e-8)


def softmax_loss(logits, y):
    z = logits - logits.max(axis=1, keepdims=True)
    e = np.exp(z)
    p = e / e.sum(axis=1, keepdims=True)
    loss = -np.log(np.maximum(p[np.arange(len(y)), y], 1e-9)).mean()
    g = p.copy()
    g[np.arange(len(y)), y] -= 1
    return loss, g / len(y)


def accuracy(net, x, y, batch=500):
    hits = 0
    for i in range(0, len(x), batch):
        hits += (net.forward(x[i:i + batch], train=False).argmax(axis=1) == y[i:i + batch]).sum()
    return hits / len(x)


# ------------------------------------------------------------------- exporting

def quantise(a):
    """Symmetric per-tensor int8. Small enough to inline, lossless enough not to matter."""
    scale = float(np.abs(a).max()) / 127.0 or 1.0
    q = np.clip(np.rint(a / scale), -127, 127).astype(np.int8)
    return q, scale


def emit(net, path, meta):
    blobs, meta_layers = [], []
    named = [("c1", net.c1), ("c2", net.c2), ("c3", net.c3), ("f1", net.f1), ("f2", net.f2)]
    for name, layer in named:
        q, scale = quantise(layer.w)
        blobs.append(q.tobytes())
        meta_layers.append({"name": name, "kind": "conv" if name[0] == "c" else "dense",
                            "shape": list(layer.w.shape), "scale": scale,
                            "bias": [float(v) for v in layer.b]})
    payload = base64.b64encode(b"".join(blobs)).decode()
    header = (
        "// GENERATED by tools/train-digits/train.py — do not edit by hand.\n"
        "//\n"
        f"// {meta['note']}\n"
        f"// Trained {meta['when']} · {meta['params']} parameters · "
        f"held-out accuracy {meta['acc']:.4f}\n"
        "//\n"
        "// Weights are symmetric per-tensor int8 with a float scale, concatenated in layer\n"
        "// order and base64'd. ink/model.js unpacks them once at load.\n\n"
    )
    body = (
        f"export const LAYERS = {json.dumps(meta_layers, indent=2)};\n\n"
        f"export const WEIGHTS =\n  '{payload}';\n"
    )
    pathlib.Path(path).write_text(header + body)
    return len(payload)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--digits", required=True, help="folder of 0.json … 9.json")
    ap.add_argument("--out", required=True)
    ap.add_argument("--epochs", type=int, default=30)
    ap.add_argument("--batch", type=int, default=64)
    ap.add_argument("--lr", type=float, default=2e-3)
    args = ap.parse_args()

    x, y = load_digits(args.digits)
    xtr, ytr, xte, yte = split(x, y)
    print(f"train {len(xtr)}  test {len(xte)}")

    net = Net()
    total = sum(p.size for l in net.layers for p, _ in l.params())
    print(f"parameters: {total}")

    t = 0
    best = 0.0
    for epoch in range(args.epochs):
        order = rng.permutation(len(xtr))
        started = time.time()
        losses = []
        # Warm up, then decay — plain cosine, nothing clever.
        lr = args.lr * (0.5 * (1 + np.cos(np.pi * epoch / args.epochs)))
        for i in range(0, len(order) - args.batch + 1, args.batch):
            idx = order[i:i + args.batch]
            xb = augment(xtr[idx])
            t += 1
            loss, g = softmax_loss(net.forward(xb), ytr[idx])
            net.backward(g)
            net.step(lr, t)
            losses.append(loss)
        acc = accuracy(net, xte, yte)
        best = max(best, acc)
        print(f"epoch {epoch + 1:2d}/{args.epochs}  loss {np.mean(losses):.4f}  "
              f"test {acc:.4f}  ({time.time() - started:.1f}s)")

    acc = accuracy(net, xte, yte)
    size = emit(net, args.out, {
        "note": "Digit recogniser for handwritten answers. Trained on the MNIST subset "
                "bundled with the `mnist` npm package, with affine and stroke-thickness "
                "augmentation.",
        "when": time.strftime("%Y-%m-%d"),
        "params": total,
        "acc": acc,
    })
    print(f"\nfinal held-out accuracy {acc:.4f} (best seen {best:.4f})")
    print(f"wrote {args.out} — {size} base64 chars")
    # Per-digit accuracy, because an overall number can hide a class the model simply
    # cannot read — and 1 vs 7 or 4 vs 9 is exactly where that would happen.
    pred = np.concatenate([net.forward(xte[i:i + 500], train=False).argmax(axis=1)
                           for i in range(0, len(xte), 500)])
    print("\nper digit:")
    for d in range(CLASSES):
        m = yte == d
        wrong = pred[m][pred[m] != d]
        confused = ", ".join(f"{v}x{c}" for v, c in zip(*np.unique(wrong, return_counts=True))) or "-"
        print(f"  {d}: {(pred[m] == d).mean():.3f}   read instead as: {confused}")


if __name__ == "__main__":
    main()
