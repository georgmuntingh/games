# The digit recogniser

Trains the model that reads handwritten answers in Pet Zoo, and writes it into
`games/pet-zoo/ink/weights.js` as inlined int8. Nothing is fetched at runtime — the game
has to work on a phone with no signal.

## Getting the data

The `mnist` npm package bundles 10,000 labelled 28x28 samples as JSON inside its tarball,
already centred by centre of mass the way MNIST itself is. That is the whole dataset this
needs, and it is the only one reachable from a sandbox with no access to the usual mirrors.

```sh
mkdir -p /tmp/mnist && curl -sS https://registry.npmjs.org/mnist/-/mnist-1.1.0.tgz \
  | tar -xz -C /tmp/mnist --strip-components=2 package/src/digits
```

The 21 MB of JSON is **not** committed. The weights are.

## Training

```sh
pip install numpy
python3 train.py --digits /tmp/mnist/digits --out ../../games/pet-zoo/ink/weights.js
```

About ten minutes for 45 epochs. It prints held-out accuracy per epoch and a per-digit
breakdown at the end — worth reading, because an overall number hides the case where one
class is simply unreadable, and 1-against-7 or 4-against-9 is exactly where that happens.

Then regenerate the two test assets:

```sh
python3 export_fixtures.py --digits /tmp/mnist/digits \
  --weights ../../games/pet-zoo/ink/weights.js \
  --out ../../games/pet-zoo/tests/ink-fixtures.js
python3 export_samples.py --digits /tmp/mnist/digits \
  --out ../../games/pet-zoo/tests/ink-samples.js
```

`export_fixtures.py` reads the weights file that ships, on purpose: its job is to hold
`ink/model.js` to the same answer as numpy, so it has to use the same quantised weights the
browser will load. Fixtures taken before quantising leave a gap that looks exactly like a
bug and is not one.

## Why numpy and not a framework

The model is 33k parameters. A framework would be more dependency than help, and the
forward pass has to be re-implementable in about sixty lines of plain JavaScript anyway —
writing it twice, here and in `ink/model.js`, is what keeps both honest. The fixtures are
how that is checked, to seven decimal places.

## What the augmentation is for

MNIST is adult handwriting on paper. This model has to read a six-year-old's finger on
glass. Rotation, scale and shear close some of that gap; **stroke thickness closes most of
it**, because a finger lays down a far heavier line than a pen and a model trained only on
MNIST's weight reads a thick 8 as a blob.

The other half of the gap is closed at inference rather than here: `ink/raster.js` re-draws
the captured polyline at a fixed normalised width, so how thick the child's finger is never
reaches the model at all.

## Checking it

Open `games/pet-zoo/tests/ink.html` in the dev server. It reports whether the JavaScript
agrees with numpy, how the classifier does on held-out digits, and — the number that
actually matters — how the whole pipeline does on a corpus of real handwriting captured on
that page. Until somebody has written into section 3, the last number is unknown, and the
page says so rather than guessing.
