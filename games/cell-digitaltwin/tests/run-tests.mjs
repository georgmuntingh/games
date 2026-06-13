// Node test runner. Usage: node games/cell-digitaltwin/tests/run-tests.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runAll } from './suite.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(readFileSync(resolve(__dirname, f), 'utf8'));
const paramsMap = {
  erythrocyte: read('../data/erythrocyte.params.json'),
  cardiomyocyte: read('../data/cardiomyocyte.params.json'),
  neuron: read('../data/neuron.params.json'),
};

const results = runAll(paramsMap);
let failed = 0;
for (const r of results) {
  console.log(`${r.pass ? '✓' : '✗'} ${r.name}\n    ${r.detail}`);
  if (!r.pass) failed++;
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
