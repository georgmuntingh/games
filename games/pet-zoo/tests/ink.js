// The accuracy page. Its job is to make the recogniser's quality a number somebody can
// look at, rather than a claim in a commit message.

import { featuresOf } from '../ink/features.js';
import { classify, logits, parameterCount } from '../ink/model.js';
import { createInkPad } from '../ink/pad.js';
import { rasterize, SIZE, toAscii } from '../ink/raster.js';
import { recognize } from '../ink/recognize.js';
import { CASES } from './ink-fixtures.js';
import { LABELS, PIXELS } from './ink-samples.js';

const $ = (id) => document.getElementById(id);
const CORPUS_KEY = 'pet-zoo/ink-corpus';

/* ------------------------------------------------------- 1 · forward-pass parity */

function parity() {
  let worst = 0;
  let agreed = 0;
  for (const test of CASES) {
    const image = Float32Array.from(test.pixels);
    const mine = logits(image);
    for (let i = 0; i < mine.length; i += 1) {
      worst = Math.max(worst, Math.abs(mine[i] - test.logits[i]));
    }
    const top = mine.indexOf(Math.max(...mine));
    if (top === test.logits.indexOf(Math.max(...test.logits))) agreed += 1;
  }
  // The fixtures are computed from the same quantised weights the browser loads, so the only
  // difference left is float32 rounding. Anything above a thousandth means the two forward
  // passes have genuinely diverged.
  const ok = worst < 1e-3 && agreed === CASES.length;
  $('parity').innerHTML =
    `<span class="${ok ? 'pass' : 'fail'}">${ok ? '✓' : '✗'}</span> ` +
    `${agreed}/${CASES.length} cases pick the same digit · ` +
    `largest logit difference ${worst.toExponential(2)}<br>` +
    `${parameterCount().toLocaleString()} parameters`;
}

/* --------------------------------------------------- 2 · classifier on real digits */

function decodeSamples() {
  const binary = atob(PIXELS);
  const out = [];
  for (let i = 0; i < LABELS.length; i += 1) {
    const image = new Float32Array(SIZE * SIZE);
    for (let p = 0; p < image.length; p += 1) {
      image[p] = binary.charCodeAt(i * image.length + p) / 255;
    }
    out.push({ image, label: LABELS[i] });
  }
  return out;
}

function confusionTable(matrix) {
  const head = `<tr><th></th>${matrix.map((_, i) => `<th>${i}</th>`).join('')}<th>·</th></tr>`;
  const rows = matrix.map((row, actual) => {
    const total = row.reduce((a, b) => a + b, 0);
    const cells = row
      .map((n, read) => {
        if (!n) return '<td class="zero">·</td>';
        return `<td class="${read === actual ? 'hit' : 'miss'}">${n}</td>`;
      })
      .join('');
    return `<tr><th>${actual}</th>${cells}<td>${total}</td></tr>`;
  });
  return `<table><caption class="muted small">rows: what it was · columns: what it read</caption>${head}${rows.join('')}</table>`;
}

function bitmaps() {
  const samples = decodeSamples();
  const matrix = Array.from({ length: 10 }, () => new Array(10).fill(0));
  const started = performance.now();
  let hits = 0;
  for (const { image, label } of samples) {
    const scores = classify(image);
    let best = 0;
    for (let i = 1; i < scores.length; i += 1) if (scores[i] > scores[best]) best = i;
    matrix[label][best] += 1;
    if (best === label) hits += 1;
  }
  const each = (performance.now() - started) / samples.length;
  $('bitmaps').innerHTML =
    `<strong>${((hits / samples.length) * 100).toFixed(1)}%</strong> ` +
    `(${hits}/${samples.length}) · ${each.toFixed(2)} ms per digit<br><br>` +
    confusionTable(matrix);
}

/* --------------------------------------------------------------- 3 · capture */

const loadCorpus = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CORPUS_KEY) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};
const saveCorpus = (list) => {
  try {
    localStorage.setItem(CORPUS_KEY, JSON.stringify(list));
  } catch {
    /* full or blocked; the page still works, it just will not remember */
  }
};

let corpus = loadCorpus();
let latest = null;

const pad = createInkPad({
  host: $('pad-host'),
  onStart: () => {
    $('reading').textContent = '…';
  },
  onSettled: ({ strokes, pad: span }) => {
    latest = { strokes, pad: span };
    show(recognize(strokes, { pad: span }));
  },
});
pad.attach();

function show(result) {
  if (result.digit === null) {
    $('reading').textContent = '—';
    $('preview').textContent = '';
    $('detail').textContent = 'nothing to read';
    return;
  }
  $('reading').innerHTML =
    `${result.digit}` +
    (result.alternative !== null ? `<span class="alt">or ${result.alternative}?</span>` : '');
  $('preview').textContent = toAscii(result.image);
  $('detail').textContent =
    `confidence ${(result.confidence * 100).toFixed(0)}% · ` +
    `network said ${result.detail.classifier} at ${(result.detail.classifierConfidence * 100).toFixed(0)}%` +
    (result.detail.structural !== null ? ` · structure preferred ${result.detail.structural}` : '') +
    (result.mirrored ? ' · written mirrored' : '');
}

$('labels').innerHTML = Array.from(
  { length: 10 },
  (_, n) => `<button type="button" data-label="${n}">${n}</button>`
).join('');

$('labels').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || !latest || !latest.strokes.length) return;
  corpus = [...corpus, { ...latest, label: Number(button.dataset.label) }];
  saveCorpus(corpus);
  pad.clear();
  latest = null;
  $('reading').textContent = '—';
  $('preview').textContent = '';
  $('detail').textContent = '';
  replay();
});

$('undo').addEventListener('click', () => pad.undo());
$('clear').addEventListener('click', () => {
  pad.clear();
  latest = null;
  $('reading').textContent = '—';
  $('preview').textContent = '';
});

$('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(corpus)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pet-zoo-ink-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

$('import').addEventListener('click', () => {
  const text = prompt('Paste an exported corpus');
  if (!text) return;
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('not a list');
    corpus = [...corpus, ...parsed.filter((s) => Array.isArray(s?.strokes) && Number.isInteger(s?.label))];
    saveCorpus(corpus);
    replay();
  } catch (error) {
    alert(`Could not read that: ${error.message}`);
  }
});

$('forget').addEventListener('click', () => {
  if (!confirm(`Delete all ${corpus.length} samples?`)) return;
  corpus = [];
  saveCorpus(corpus);
  replay();
});

/* ---------------------------------------------------------------- 4 · replay */

/**
 * The number that actually matters. Replayed leave-one-out where the memory is concerned:
 * each sample is read with a memory built from the *other* samples, so the score is not
 * flattered by the sample being in its own training set.
 */
function replay() {
  if (!corpus.length) {
    $('corpus').textContent =
      'no samples yet — the accuracy of this recogniser on real handwriting is unknown until section 3 has been used';
    $('misreads').innerHTML = '';
    return;
  }
  const matrix = Array.from({ length: 10 }, () => new Array(10).fill(0));
  const misreads = [];
  const started = performance.now();
  let hits = 0;
  let unsure = 0;

  corpus.forEach((sample, index) => {
    const memory = corpus
      .filter((_, i) => i !== index)
      .map((other) => {
        const image = rasterize(other.strokes);
        return { f: Array.from(featuresOf(other.strokes, image)), d: other.label };
      });
    const result = recognize(sample.strokes, { memory, pad: sample.pad ?? 1 });
    const read = result.digit ?? -1;
    if (read >= 0) matrix[sample.label][read] += 1;
    if (read === sample.label) hits += 1;
    else misreads.push({ ...sample, read, result });
    if (result.unsure) unsure += 1;
  });

  const each = (performance.now() - started) / corpus.length;
  $('corpus').innerHTML =
    `<strong>${((hits / corpus.length) * 100).toFixed(1)}%</strong> ` +
    `(${hits}/${corpus.length}) · ${misreads.length} misread · ` +
    `${unsure} offered a second guess · ${each.toFixed(1)} ms each<br><br>` +
    confusionTable(matrix);

  $('misreads').innerHTML = misreads
    .slice(0, 24)
    .map(
      (miss) =>
        `<div class="misread"><pre>${toAscii(rasterize(miss.strokes))}</pre>` +
        `<div class="caption">was <b>${miss.label}</b>, read <b>${miss.read}</b></div></div>`
    )
    .join('');
}

parity();
bitmaps();
replay();
