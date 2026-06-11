// Node test runner. Usage: node games/cell-digitaltwin/tests/run-tests.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runAll } from './suite.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const params = JSON.parse(readFileSync(resolve(__dirname, '../data/erythrocyte.params.json'), 'utf8'));

const results = runAll(params);
let failed = 0;
for (const r of results) {
  console.log(`${r.pass ? '✓' : '✗'} ${r.name}\n    ${r.detail}`);
  if (!r.pass) failed++;
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
