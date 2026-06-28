import { emptyTally, record, metrics, formatPercent } from '../scoring.js';
import { PROFILES, BY_DIFFICULTY, DIFFICULTIES } from '../profiles.js';

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assertEq(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg || ''}: expected ${expected}, got ${actual}`);
}

function assertClose(actual, expected, tol, msg) {
  if (Math.abs(actual - expected) > (tol ?? 1e-9)) {
    throw new Error(`${msg || ''}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// 1. Tally bookkeeping ----------------------------------------------------
test('record fills the four confusion cells correctly', () => {
  const t = emptyTally();
  record(t, true, true); // TP: said bot, is bot
  record(t, true, false); // FP: said bot, is human
  record(t, false, true); // FN: said human, is bot
  record(t, false, false); // TN: said human, is human
  assertEq(t.tp, 1, 'tp');
  assertEq(t.fp, 1, 'fp');
  assertEq(t.fn, 1, 'fn');
  assertEq(t.tn, 1, 'tn');
});

test('record accumulates across many calls', () => {
  const t = emptyTally();
  for (let i = 0; i < 3; i++) record(t, true, true);
  for (let i = 0; i < 2; i++) record(t, false, false);
  assertEq(t.tp, 3);
  assertEq(t.tn, 2);
  assertEq(t.fp, 0);
  assertEq(t.fn, 0);
});

// 2. Metrics on known inputs ---------------------------------------------
test('metrics: perfect score is all 100%', () => {
  const t = { tp: 5, fp: 0, fn: 0, tn: 5 };
  const m = metrics(t);
  assertEq(m.total, 10);
  assertClose(m.accuracy, 1);
  assertClose(m.precision, 1);
  assertClose(m.recall, 1);
  assertClose(m.f1, 1);
});

test('metrics: mixed case computes precision/recall/F1', () => {
  // tp=3, fp=1, fn=2, tn=4
  const m = metrics({ tp: 3, fp: 1, fn: 2, tn: 4 });
  assertEq(m.total, 10);
  assertClose(m.accuracy, 7 / 10);
  assertClose(m.precision, 3 / 4);
  assertClose(m.recall, 3 / 5);
  // F1 = 2PR/(P+R) = 2*0.75*0.6 / (0.75+0.6) = 0.9 / 1.35
  assertClose(m.f1, 0.9 / 1.35);
});

// 3. Divide-by-zero guards ------------------------------------------------
test('metrics: no predicted positives -> precision is null, F1 null', () => {
  // Never guessed "bot": tp=0, fp=0
  const m = metrics({ tp: 0, fp: 0, fn: 3, tn: 4 });
  assertEq(m.precision, null, 'precision undefined');
  assertClose(m.recall, 0, 1e-9, 'recall is 0/(0+3)=0');
  assertEq(m.f1, null, 'f1 undefined when precision null');
});

test('metrics: no actual positives -> recall is null', () => {
  const m = metrics({ tp: 0, fp: 2, fn: 0, tn: 5 });
  assertEq(m.recall, null, 'recall undefined');
  assertClose(m.precision, 0, 1e-9, 'precision 0/(0+2)=0');
  assertEq(m.f1, null, 'f1 undefined when recall null');
});

test('metrics: empty tally -> accuracy null, total 0', () => {
  const m = metrics(emptyTally());
  assertEq(m.total, 0);
  assertEq(m.accuracy, null);
});

test('metrics: precision and recall both 0 -> F1 null (no divide by zero)', () => {
  // tp=0 but some fp and fn -> P=0, R=0, P+R=0
  const m = metrics({ tp: 0, fp: 2, fn: 2, tn: 1 });
  assertClose(m.precision, 0);
  assertClose(m.recall, 0);
  assertEq(m.f1, null);
});

// 4. formatPercent --------------------------------------------------------
test('formatPercent renders ratios and null', () => {
  assertEq(formatPercent(1), '100%');
  assertEq(formatPercent(0), '0%');
  assertEq(formatPercent(0.756), '76%');
  assertEq(formatPercent(null), '—');
  assertEq(formatPercent(undefined), '—');
});

// 5. Dataset integrity ----------------------------------------------------
test('every profile has the required fields and a valid label', () => {
  for (const p of PROFILES) {
    assertTrue(typeof p.id === 'string' && p.id.length > 0, `id missing on ${p.username}`);
    assertTrue(p.label === 'bot' || p.label === 'human', `bad label on ${p.id}`);
    assertTrue(['easy', 'medium', 'hard', 'expert'].includes(p.difficulty), `bad difficulty on ${p.id}`);
    assertTrue(Array.isArray(p.samplePosts) && p.samplePosts.length > 0, `no posts on ${p.id}`);
    assertTrue(Array.isArray(p.tells) && p.tells.length > 0, `no tells on ${p.id}`);
    assertTrue(typeof p.outcome === 'string' && p.outcome.length > 0, `no outcome on ${p.id}`);
  }
});

test('profile ids are unique', () => {
  const ids = new Set();
  for (const p of PROFILES) {
    assertTrue(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
  }
});

test('each difficulty tier has a balanced bot/human mix', () => {
  for (const diff of DIFFICULTIES) {
    const pool = BY_DIFFICULTY[diff.id] ?? [];
    assertTrue(pool.length >= 4, `tier ${diff.id} too small`);
    const bots = pool.filter((p) => p.label === 'bot').length;
    const humans = pool.length - bots;
    assertTrue(bots > 0 && humans > 0, `tier ${diff.id} not balanced (${bots} bots / ${humans} humans)`);
    // Roughly balanced: neither class more than ~70% of the tier.
    assertTrue(bots <= pool.length * 0.7 && humans <= pool.length * 0.7, `tier ${diff.id} skewed`);
  }
});

export function runAll() {
  const out = { pass: 0, fail: 0, results: [] };
  for (const t of tests) {
    try {
      t.fn();
      out.pass += 1;
      out.results.push({ name: t.name, ok: true });
    } catch (e) {
      out.fail += 1;
      out.results.push({ name: t.name, ok: false, error: e.message });
    }
  }
  return out;
}

if (typeof window !== 'undefined' && window.location) {
  window.addEventListener('DOMContentLoaded', () => {
    const out = runAll();
    const target = document.getElementById('out');
    if (!target) return;
    target.innerHTML =
      `<p><strong>${out.pass} passed, ${out.fail} failed</strong></p>` +
      out.results
        .map(
          (r) =>
            `<div class="${r.ok ? 'pass' : 'fail'}">${r.ok ? '✓' : '✗'} ${r.name}${
              r.ok ? '' : ` — ${r.error}`
            }</div>`,
        )
        .join('');
  });
}
