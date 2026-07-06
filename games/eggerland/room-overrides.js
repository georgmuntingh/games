// Hand-curated facts the map image cannot express, merged over the
// generated ROOMS data by overworld.js. Keeping these separate lets
// tools/extract.mjs regenerate rooms.js from scratch at any time.
//
// Per-room fields:
//   shotHearts   — [x,y] pairs of hearts that grant 2 magic shots
//   entityProps  — [{ x, y, props }] patches matched by spawn position,
//                  e.g. Don Medusa patrol axis or Gol facing direction

export const OVERRIDES = {
  '2,8': {
    shotHearts: [[2, 2]],
    entityProps: [{ x: 7, y: 2, props: { dir: [0, 1] } }],
  },

  'test-shots': {
    shotHearts: [
      [2, 1],
      [10, 1],
    ],
  },
  'test-donmedusa': {
    entityProps: [{ x: 2, y: 2, props: { axis: 'h' } }],
  },
  'test-gol-skull': {
    entityProps: [{ x: 7, y: 2, props: { dir: [0, 1] } }],
  },
};
