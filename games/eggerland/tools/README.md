# Eggerland map-extraction tools

Convert the fan-made global map `eggerland2-map.png` (all 100 normal stages
of Eggerland 2 / Meikyū Shinwa, arranged spatially by Benoît Delvaux) into
the game's room data `../rooms.js`.

## Geometry (`map-layout.json`)

Measured from the image: each screenshot tile is **16 px** (the map is a 2×
upscale of the 8-px native tiles); every room is an **11×11** playfield
framed by half-tile walls, so the room-to-room pitch is 8 + 11·16 + 8 = 192.
The 10×10 grid of stages 1–100 starts at interior pixel **(291, 36)**. Note
the source has sub-pixel drift across the grid, so no integer origin tiles
every room exactly to the pixel — the classifier is deliberately ±1px
tolerant (terrain read from an inset ring, entities from tile centres).

## Pipeline

```
node tools/mapsig.mjs    # dedupe tiles by sprite-signature -> out/sig-tiles.{png,json}
                         # (view the contact sheet, label the frequent signatures
                         #  in sig-labels.json — keyed by signature string)
node tools/mapemit.mjs   # classify every tile and write ../rooms.js
```

- `classify-core.mjs` — colour categories, border-ring terrain, sprite signature.
- `classify-tile.mjs` — ±1px-tolerant `terrainInset` (floor/water/wall/tree).
- `mapemit.mjs` — hybrid classifier: terrain from the inset ring; on floor
  tiles the entity/arrow/decor type from `sig-labels.json` (nearest-signature
  fallback). Auto-opens doors between adjacent rooms for the spatial overworld,
  guarantees one player spawn + one chest per room.

`sig-labels.json` maps each sprite-signature to a label (heart, chest,
emerald, key, arrow-*, snakey, rocky, medusa, leeper, gol, tree, none). Enemy
typing from 16-px tiles is best-effort and easy to correct by editing this
file and re-running `mapemit.mjs`. Annotation skulls next to the printed stage
numbers are intentionally labelled `none`.

`out/` and `assets/` are gitignored; `eggerland2-map.png` is the source image.
