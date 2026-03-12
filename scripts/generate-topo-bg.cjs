const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const W = 960;
const H = 540;

const C0 = 0.211324865405187;
const C1 = 0.366025403784439;
const C2 = -0.577350269189626;
const C3 = 0.024390243902439;

function glslFract(x) { return x - Math.floor(x); }
function mod289(x) { return x - Math.floor(x * (1.0 / 289.0)) * 289.0; }
function permute(x) { return mod289(((x * 34.0) + 1.0) * x); }

function snoise(vx, vy) {
  const s = (vx + vy) * C1;
  let ix = Math.floor(vx + s);
  let iy = Math.floor(vy + s);

  const t = (ix + iy) * C0;
  const x0x = vx - ix + t;
  const x0y = vy - iy + t;

  let i1x, i1y;
  if (x0x > x0y) { i1x = 1.0; i1y = 0.0; }
  else { i1x = 0.0; i1y = 1.0; }

  const x12_x = x0x + C0 - i1x;
  const x12_y = x0y + C0 - i1y;
  const x12_z = x0x + C2;
  const x12_w = x0y + C2;

  ix = mod289(ix);
  iy = mod289(iy);

  const p_val = permute(permute(iy + 0.0) + ix + 0.0);
  const p1_val = permute(permute(iy + i1y) + ix + i1x);
  const p2_val = permute(permute(iy + 1.0) + ix + 1.0);

  let m0 = Math.max(0.5 - (x0x * x0x + x0y * x0y), 0.0);
  let m1 = Math.max(0.5 - (x12_x * x12_x + x12_y * x12_y), 0.0);
  let m2 = Math.max(0.5 - (x12_z * x12_z + x12_w * x12_w), 0.0);
  m0 = m0 * m0; m0 = m0 * m0;
  m1 = m1 * m1; m1 = m1 * m1;
  m2 = m2 * m2; m2 = m2 * m2;

  const xx0 = 2.0 * glslFract(p_val * C3) - 1.0;
  const xx1 = 2.0 * glslFract(p1_val * C3) - 1.0;
  const xx2 = 2.0 * glslFract(p2_val * C3) - 1.0;

  const h0 = Math.abs(xx0) - 0.5;
  const h1 = Math.abs(xx1) - 0.5;
  const h2 = Math.abs(xx2) - 0.5;
  const ox0 = Math.floor(xx0 + 0.5);
  const ox1 = Math.floor(xx1 + 0.5);
  const ox2 = Math.floor(xx2 + 0.5);
  const a0x = xx0 - ox0;
  const a0y = xx1 - ox1;
  const a0z = xx2 - ox2;

  m0 *= 1.79284291400159 - 0.85373472095314 * (a0x * a0x + h0 * h0);
  m1 *= 1.79284291400159 - 0.85373472095314 * (a0y * a0y + h1 * h1);
  m2 *= 1.79284291400159 - 0.85373472095314 * (a0z * a0z + h2 * h2);

  const g0 = a0x * x0x + h0 * x0y;
  const g1 = a0y * x12_x + h1 * x12_y;
  const g2 = a0z * x12_z + h2 * x12_w;
  return 130.0 * (m0 * g0 + m1 * g1 + m2 * g2);
}

function fbm(px, py) {
  let v = 0.0, a = 0.5, f = 1.0;
  for (let i = 0; i < 4; i++) {
    v += a * snoise(px * f, py * f);
    a *= 0.45; f *= 2.0;
  }
  return v;
}

function contourLine(ht, sp, th) {
  const val = glslFract(ht / sp + 0.5);
  const l = Math.abs(val - 0.5) * sp;
  if (l >= th) return 0.0;
  return 1.0 - l / th;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3.0 - 2.0 * t);
}

const brandR = 0.18, brandG = 0.408, brandB = 0.518;
const aspectX = W / H;

const png = new PNG({ width: W, height: H });

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const uvx = x / W;
    const uvy = 1.0 - y / H;
    const px = uvx * aspectX * 1.6;
    const py = uvy * 1.6;
    const ht = fbm(px, py) + 0.2 * snoise(px * 0.4, py * 0.4);
    const maj = contourLine(ht, 0.15, 0.008);
    const mn = contourLine(ht, 0.05, 0.004);
    const tn = snoise(px * 0.25, py * 0.25) * 0.5 + 0.5;
    const dkR = brandR * 0.78, dkG = brandG * 0.78, dkB = brandB * 0.78;
    const ltR = brandR + (1.0 - brandR) * 0.28;
    const ltG = brandG + (1.0 - brandG) * 0.28;
    const ltB = brandB + (1.0 - brandB) * 0.28;
    let lcR, lcG, lcB;
    if (tn < 0.4) {
      const t = tn / 0.4;
      lcR = dkR + (brandR - dkR) * t; lcG = dkG + (brandG - dkG) * t; lcB = dkB + (brandB - dkB) * t;
    } else if (tn < 0.7) {
      const t = (tn - 0.4) / 0.3;
      lcR = brandR + (ltR - brandR) * t; lcG = brandG + (ltG - brandG) * t; lcB = brandB + (ltB - brandB) * t;
    } else {
      const t = (tn - 0.7) / 0.3;
      lcR = ltR + (brandR - ltR) * t; lcG = ltG + (brandG - ltG) * t; lcB = ltB + (brandB - ltB) * t;
    }
    let cl = Math.min(maj * 0.85 + mn * 0.35, 1.0);
    let alpha = cl * 0.70;
    alpha *= smoothstep(0.0, 0.15, uvx) * smoothstep(0.0, 0.15, 1.0 - uvx);
    alpha *= smoothstep(0.0, 0.1, uvy) * smoothstep(0.0, 0.1, 1.0 - uvy);
    const r = Math.round((1.0 + (lcR - 1.0) * alpha) * 255);
    const g = Math.round((1.0 + (lcG - 1.0) * alpha) * 255);
    const b = Math.round((1.0 + (lcB - 1.0) * alpha) * 255);
    const idx = (y * W + x) << 2;
    png.data[idx] = Math.max(0, Math.min(255, r));
    png.data[idx + 1] = Math.max(0, Math.min(255, g));
    png.data[idx + 2] = Math.max(0, Math.min(255, b));
    png.data[idx + 3] = 255;
  }
}

const outDir = path.join(__dirname, '..', 'client', 'public', 'images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'topo-bg.png');
const buffer = PNG.sync.write(png, { colorType: 2 });
fs.writeFileSync(outPath, buffer);
console.log(`Generated ${outPath} (${buffer.length} bytes)`);
