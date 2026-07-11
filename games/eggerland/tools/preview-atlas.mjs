// Emit a labeled PNG of the classification/classic templates (tools/
// templates.json): each 16x16 reference tile enlarged with its index number
// drawn above it, so extraction/alignment can be judged by eye. A legend
// (index -> name) is printed to stdout. Output: tools/atlas-preview.png.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngjs from 'pngjs';
import { loadPng } from './extract.mjs';

const { PNG } = pngjs;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const img = loadPng(path.join(HERE, 'eggerland2-map.png'));
const templates = JSON.parse(fs.readFileSync(path.join(HERE, 'templates.json'), 'utf8'));
const ts = 16;

const DIG = { 0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111'],4:['101','101','111','001','001'],5:['111','100','111','001','111'],6:['111','100','111','101','111'],7:['111','001','010','010','010'],8:['111','101','111','101','111'],9:['111','101','111','001','111'] };
function drawNum(png, n, x0, y0) {
  const s = String(n);
  for (let d = 0; d < s.length; d++) { const g = DIG[s[d]];
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 3; gx++) {
      if (g[gy][gx] !== '1') continue;
      for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
        const px = x0 + d * 8 + gx * 2 + sx, py = y0 + gy * 2 + sy;
        const i = (py * png.width + px) * 4; png.data[i] = 255; png.data[i + 1] = 255; png.data[i + 2] = 0; png.data[i + 3] = 255;
      }
    }
  }
}

const names = Object.keys(templates);
const zoom = 7, cols = 10, labelH = 14;
const cellW = ts * zoom + 8, cellH = ts * zoom + labelH + 6;
const rows = Math.ceil(names.length / cols);
const O = new PNG({ width: cols * cellW, height: rows * cellH });
O.data.fill(25); for (let k = 3; k < O.data.length; k += 4) O.data[k] = 255;
names.forEach((name, idx) => {
  const [tx, ty] = templates[name];
  const cx = (idx % cols) * cellW, cy = Math.floor(idx / cols) * cellH;
  drawNum(O, idx, cx + 4, cy + 2);
  for (let y = 0; y < ts * zoom; y++) for (let x = 0; x < ts * zoom; x++) {
    const sx = tx + Math.floor(x / zoom), sy = ty + Math.floor(y / zoom);
    const si = (sy * img.width + sx) * 4, di = ((cy + labelH + y) * O.width + (cx + 4 + x)) * 4;
    O.data[di] = img.data[si]; O.data[di + 1] = img.data[si + 1]; O.data[di + 2] = img.data[si + 2]; O.data[di + 3] = 255;
  }
});
fs.writeFileSync(path.join(HERE, 'atlas-preview.png'), PNG.sync.write(O));
console.log('legend (index: name @ mapXY):');
names.forEach((n, i) => console.log(`  ${i}: ${n} @ ${templates[n]}`));
console.log('-> tools/atlas-preview.png');
