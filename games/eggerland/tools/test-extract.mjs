// Round-trip test for the extraction pipeline: builds the synthetic
// fixture map, runs atlas + rooms over it and compares the result with
// the fixture's expected rooms. Run with:  node tools/test-extract.mjs
// Exits 0 on success, 1 on any mismatch.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFixture } from './fixture.mjs';
import { loadPng, runAtlas, runRooms, emitRoomsModule } from './extract.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');

let failures = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  ok: ${msg}`);
  } else {
    failures++;
    console.error(`  FAIL: ${msg}`);
  }
}

const sortEntities = (list) =>
  [...list].sort((a, b) =>
    a.t === b.t ? a.y - b.y || a.x - b.x : a.t.localeCompare(b.t)
  );

console.log('building fixture…');
const { mapFile, layout, labels, index, expected } = buildFixture(OUT);
const image = loadPng(mapFile);

console.log('atlas…');
const atlas = runAtlas(image, layout, { outDir: OUT });
const labeled = atlas.filter((t) => labels[t.hash]).length;
assert(atlas.length > 0, `${atlas.length} unique tiles found`);
assert(
  labeled === atlas.length,
  `every unique tile has a label (${labeled}/${atlas.length})`
);

console.log('rooms…');
const rooms = runRooms(image, layout, labels, index);
assert(
  Object.keys(rooms).length === Object.keys(expected).length,
  `${Object.keys(expected).length} rooms extracted`
);

for (const [id, want] of Object.entries(expected)) {
  const got = rooms[id];
  if (!got) {
    assert(false, `room ${id} present`);
    continue;
  }
  assert(got.stage === want.stage, `room ${id}: stage ${want.stage}`);
  assert(
    got.terrain.join('|') === want.terrain.join('|'),
    `room ${id}: terrain matches`
  );
  assert(
    JSON.stringify(sortEntities(got.entities)) ===
      JSON.stringify(sortEntities(want.entities)),
    `room ${id}: entities match`
  );
  assert(
    JSON.stringify(got.exits) === JSON.stringify(want.exits),
    `room ${id}: exits match`
  );
}

// The emitted module must be valid JS that round-trips through import.
const moduleText = emitRoomsModule(rooms);
const tmp = path.join(OUT, 'rooms-roundtrip.js');
const fs = await import('node:fs');
// Rewrite the tiles.js re-export so the temp module resolves from out/.
fs.writeFileSync(
  tmp,
  moduleText.replace("./tiles.js", '../../tiles.js')
);
const mod = await import(tmp);
assert(
  Object.keys(mod.ROOMS).length === Object.keys(expected).length,
  'emitted rooms.js imports cleanly'
);

console.log(failures === 0 ? '\nAll extraction checks passed.' : `\n${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
