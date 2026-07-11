// Quick engine check: a power-heart (from the POWER legend) grants +2 shots
// and emits a bonus event, and every one of the 22 legend stages has one.
import { createRoomState, tick } from '../engine.js';
import { getRoom, mapKeys } from '../overworld.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}: ${msg}`); if (!cond) failed++; };

// 1) Synthetic room: player next to a power-heart.
const room = {
  stage: 0,
  terrain: ['...', '...', '...'],
  entities: [{ t: 'player', x: 0, y: 0 }, { t: 'heart', x: 1, y: 0 }, { t: 'chest', x: 2, y: 2 }],
  exits: { n: null, s: null, e: null, w: null },
  shotHearts: new Set(['1,0']),
};
const state = createRoomState(room);
let bonusSeen = false;
for (let i = 0; i < 60 && state.shots === 0; i++) {
  for (const ev of tick(state, 1 / 60, { dir: [1, 0] })) if (ev.type === 'heart' && ev.bonus) bonusSeen = true;
}
ok(state.shots === 2, `collecting a power-heart grants 2 shots (got ${state.shots})`);
ok(bonusSeen, 'power-heart emits a bonus heart event');

// 2) A plain heart grants no shots.
const plain = createRoomState({
  stage: 0, terrain: ['...', '...', '...'],
  entities: [{ t: 'player', x: 0, y: 0 }, { t: 'heart', x: 1, y: 0 }, { t: 'chest', x: 2, y: 2 }],
  exits: { n: null, s: null, e: null, w: null }, shotHearts: new Set(),
});
for (let i = 0; i < 60 && plain.hearts.size; i++) tick(plain, 1 / 60, { dir: [1, 0] });
ok(plain.shots === 0, `a plain heart grants no shots (got ${plain.shots})`);

// 3) All 22 legend POWER stages have a power-heart that sits on a real heart.
const powerRooms = mapKeys().map(getRoom).filter((r) => r.shotHearts.size > 0);
let onHeart = 0;
for (const r of powerRooms) {
  const hearts = new Set(r.entities.filter((e) => e.t === 'heart').map((e) => `${e.x},${e.y}`));
  if ([...r.shotHearts].every((k) => hearts.has(k))) onHeart++;
}
ok(powerRooms.length === 22, `22 rooms carry a power-heart (got ${powerRooms.length})`);
ok(onHeart === powerRooms.length, `every power-heart sits on a real heart (${onHeart}/${powerRooms.length})`);

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll power checks passed.');
process.exit(failed ? 1 : 0);
