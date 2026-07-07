# Eggerland map-extraction pipeline

Converts the fan-made Eggerland 2 (Meikyū Shinwa) global map PNG into
the game's `rooms.js`. The map was created by Benoît Delvaux
(MSX blue, msxblue.com); a zip of it is hosted at:

    https://www.msx.org/download/download/2015/11/eggerland2-map.zip

The image is copyrighted, so it is **not** committed — `assets/` and
`out/` are gitignored. Only the derived room data (`../rooms.js`) is
checked in.

## Getting the map into `assets/`

This remote environment's network egress allowlist currently blocks
both msx.org and msxblue.com (verified 2026-07-06 and again on
2026-07-07: the proxy gateway answers 403 `host_not_allowed` to the
CONNECT). Two ways to unblock the real extraction (milestone M6):

1. Add `msx.org` (and optionally `msxblue.com`) to the environment's
   network egress settings, then:

       curl -LO https://www.msx.org/download/download/2015/11/eggerland2-map.zip
       unzip eggerland2-map.zip -d games/eggerland/tools/assets/
       # expected file: games/eggerland/tools/assets/eggerland2-map.png

2. Or download it on your own machine and drop the PNG into
   `games/eggerland/tools/assets/eggerland2-map.png` (e.g. commit it
   temporarily to a scratch branch, or paste it into a session with
   filesystem access — just don't merge the PNG itself).

## Workflow

```
# 1. Measure the room grid (border peaks, pitch, tile-size hints):
node games/eggerland/tools/extract.mjs analyze

# 2. Write map-layout.json by hand from those measurements:
#    - tileSize: for 14-tile-wide rooms separated by a 1-tile border,
#      tileSize = column pitch / 15 (e.g. pitch 240 -> 16 px tiles).
#      (The self-similarity hint is unreliable on flat-colored areas;
#      trust the border pitch.)
#    - mainGrid.origin: pixel of stage row-0/col-0's top-left interior
#    - mainGrid.pitch/cols/rows: from the peak spacing (10×10 expected)
#    - extraRooms: pixel origins of the lettered/hidden stages
#    - excludeRects: legend and text areas to ignore
#    - roomOverrides: any room whose interior is not 14×10

# 3. Slice + dedupe tiles, emit the numbered contact sheet:
node games/eggerland/tools/extract.mjs atlas
#    -> out/contact-sheet.png, out/tile-atlas.json
#    View the sheet and write tile-labels.json mapping every hash to a
#    label from LABEL_DEFS in ../tiles.js (floor, rock, tree, water,
#    lava, sand, arrow-*, brick, door, heart, chest, emerald, player,
#    snakey, leeper, medusa, don-medusa, gol, skull, rocky, alma,
#    decoration). Use --quant if anti-aliasing inflates the tile count
#    (a warning fires above ~400 unique tiles).

# 4. Fill in room-index.json (grid coordinate -> stage number, read off
#    the map labels), then regenerate the game data:
node games/eggerland/tools/extract.mjs rooms
#    -> ../rooms.js (fails loudly listing any unlabeled hash)
```

Facts the image cannot express — Don Medusa/Rocky patrol axes, which
hearts grant magic shots, hidden-stage triggers — belong in
`../room-overrides.js`, which the game merges over the generated data.
That keeps `rooms` a pure, re-runnable function of PNG + labels.

## Test

```
node games/eggerland/tools/test-extract.mjs
```

Builds a synthetic 2×2-room fixture map (`fixture.mjs`), runs the
atlas + rooms pipeline over it and diffs the result against the
fixture's expected rooms; exits non-zero on any mismatch. This keeps
the pipeline verifiable while the real map is unavailable.
