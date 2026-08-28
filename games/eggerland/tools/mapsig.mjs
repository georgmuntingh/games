// Dedupe every interior tile by sprite-signature (terrain masked out) and
// emit a numbered contact sheet + JSON, so the small overlay vocabulary
// (entities + decor terrain) can be labeled by hand into sig-labels.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngjs from 'pngjs';
import { loadPng, roomRects } from './extract.mjs';
import { terrainOf, signature } from './classify-core.mjs';

const { PNG } = pngjs;
const HERE = path.dirname(fileURLToPath(import.meta.url));

function copyTile(src, x0, y0, size, dst, dx, dy, zoom) {
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const si = ((y0 + y) * src.width + (x0 + x)) * 4;
      for (let zy = 0; zy < zoom; zy++)
        for (let zx = 0; zx < zoom; zx++) {
          const di = ((dy + y * zoom + zy) * dst.width + (dx + x * zoom + zx)) * 4;
          dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1];
          dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = 255;
        }
    }
}
const DIG = { 0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111'],4:['101','101','111','001','001'],5:['111','100','111','001','111'],6:['111','100','111','101','111'],7:['111','001','010','010','010'],8:['111','101','111','101','111'],9:['111','101','111','001','111'] };
function num(png,n,x0,y0){const t=String(n);for(let d=0;d<t.length;d++){const g=DIG[t[d]];for(let gy=0;gy<5;gy++)for(let gx=0;gx<3;gx++){if(g[gy][gx]!=='1')continue;const px=x0+d*4+gx,py=y0+gy;if(px>=png.width||py>=png.height)continue;const i=(py*png.width+px)*4;png.data[i]=255;png.data[i+1]=255;png.data[i+2]=0;png.data[i+3]=255;}}}

const img = loadPng(path.join(HERE, 'eggerland2-map.png'));
const layout = JSON.parse(fs.readFileSync(path.join(HERE, 'map-layout.json'), 'utf8'));
const ts = layout.tileSize;
const map = new Map();
for (const r of roomRects(layout))
  for (let ty = 0; ty < r.h; ty++)
    for (let tx = 0; tx < r.w; tx++) {
      const x = r.px + tx * ts, y = r.py + ty * ts;
      const terr = terrainOf(img, x, y, ts);
      const { sig, nonEmpty } = signature(img, x, y, ts, terr);
      const e = map.get(sig);
      if (e) e.count++;
      else map.set(sig, { sig, count: 1, nonEmpty, first: { room: r.id, tx, ty, x, y } });
    }
const entries = [...map.values()].sort((a, b) => b.count - a.count);
console.log('distinct sprite-signatures:', entries.length);
console.log('empty-sig (flat terrain) tiles share sig:', map.get('.'.repeat(64))?.count);
const outDir = path.join(HERE, 'out'); fs.mkdirSync(outDir, { recursive: true });
const zoom = 4, cols = 20, cellW = ts * zoom + 6, cellH = ts * zoom + 10;
const rows = Math.ceil(entries.length / cols);
const sheet = new PNG({ width: cols * cellW, height: rows * cellH });
sheet.data.fill(25); for (let a = 3; a < sheet.data.length; a += 4) sheet.data[a] = 255;
entries.forEach((e, i) => {
  const cx = (i % cols) * cellW, cy = Math.floor(i / cols) * cellH;
  copyTile(img, e.first.x, e.first.y, ts, sheet, cx + 2, cy + 2, zoom);
  num(sheet, i, cx + 2, cy + ts * zoom + 3);
});
fs.writeFileSync(path.join(outDir, 'sig-tiles.png'), PNG.sync.write(sheet));
fs.writeFileSync(path.join(outDir, 'sig-tiles.json'),
  JSON.stringify(entries.map((e, i) => ({ index: i, sig: e.sig, count: e.count, first: e.first })), null, 2));
console.log('contact sheet -> out/sig-tiles.png  (', rows, 'rows )');
