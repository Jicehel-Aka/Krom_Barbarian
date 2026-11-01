import fs from 'node:fs';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

function toRgbaPng(inputPath, tmpPngPath, extraArgs = []) {
  execFileSync('/usr/bin/convert', [
    inputPath,
    ...extraArgs,
    '-alpha',
    'on',
    '-depth',
    '8',
    '-define',
    'png:color-type=6',
    tmpPngPath,
  ]);
}

function readRgbaPng(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 8;
  let width = 0;
  let height = 0;
  const idatChunks = [];

  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const colorType = data[9];
      if (bitDepth !== 8 || colorType !== 6) {
        throw new Error(`Expected 8-bit RGBA PNG, got depth=${bitDepth} colorType=${colorType} for ${filePath}`);
      }
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + len;
  }

  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * 4;
  const pixels = new Uint8Array(width * height * 4);

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < height; y++) {
    const filter = inflated[y * (stride + 1)];
    const rowIn = y * (stride + 1) + 1;
    const rowOut = y * stride;
    for (let i = 0; i < stride; i++) {
      const raw = inflated[rowIn + i];
      const left = i >= 4 ? pixels[rowOut + i - 4] : 0;
      const up = y > 0 ? pixels[rowOut - stride + i] : 0;
      const upLeft = y > 0 && i >= 4 ? pixels[rowOut - stride + i - 4] : 0;
      let val = raw;
      if (filter === 1) val = (raw + left) & 0xff;
      else if (filter === 2) val = (raw + up) & 0xff;
      else if (filter === 3) val = (raw + ((left + up) >> 1)) & 0xff;
      else if (filter === 4) val = (raw + paeth(left, up, upLeft)) & 0xff;
      pixels[rowOut + i] = val;
    }
  }

  return { width, height, pixels };
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function writeRgbaPng(filePath, width, height, pixels) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // Filter 0 (None)
    Buffer.from(pixels.buffer, pixels.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw, { level: 6 });
  const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const out = Buffer.concat([
    pngSig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(filePath, out);
}

// ---------------------------------------------------------------------------
// 1. MEASURE & EXPORT 6 PANORAMAS (1800 x 240)
// ---------------------------------------------------------------------------
fs.mkdirSync('public/sheets', { recursive: true });

function measureDualStripBounds(pngPath) {
  const tmp = `/tmp/pano_${Date.now()}.png`;
  toRgbaPng(pngPath, tmp);
  const { width, height, pixels } = readRgbaPng(tmp);
  fs.unlinkSync(tmp);

  function findCleanBand(yMin, yMax) {
    const active = [];
    for (let y = yMin; y <= yMax; y++) {
      let sumLum = 0;
      let nonBlack = 0;
      let whiteish = 0;
      for (let x = 60; x < width - 60; x += 4) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const lum = r + g + b;
        sumLum += lum;
        if (lum > 30) nonBlack++;
        if (r > 215 && g > 215 && b > 215) whiteish++;
      }
      const samples = Math.floor((width - 120) / 4);
      // Exclude black letterbox bars and full-width white divider lines
      if (nonBlack > samples * 0.25 && whiteish < samples * 0.65) {
        active.push(y);
      }
    }
    // Find longest contiguous run
    let bestStart = active[0];
    let bestEnd = active[0];
    let curStart = active[0];
    let prev = active[0];
    for (let k = 1; k < active.length; k++) {
      if (active[k] <= prev + 2) {
        prev = active[k];
      } else {
        if (prev - curStart > bestEnd - bestStart) {
          bestStart = curStart;
          bestEnd = prev;
        }
        curStart = active[k];
        prev = active[k];
      }
    }
    if (prev - curStart > bestEnd - bestStart) {
      bestStart = curStart;
      bestEnd = prev;
    }
    // Trim 1px inside top and bottom to guarantee zero border bleed
    return { yTop: bestStart + 1, yBot: bestEnd - 1, h: bestEnd - bestStart - 1 };
  }

  return {
    width,
    height,
    top: findCleanBand(4, Math.floor(height / 2) - 4),
    bottom: findCleanBand(Math.floor(height / 2) + 4, height - 4),
  };
}

const b67 = measureDualStripBounds('public/assets/aistudio/image_67ff0fab.png');
const b6a = measureDualStripBounds('public/assets/aistudio/image_6a2f1924.png');
const bc0 = measureDualStripBounds('public/assets/aistudio/image_c0a34249.png');
console.log('Measured dual-strip bounds:', { b67, b6a, bc0 });

const panoSpecs = [
  {
    out: 'public/sheets/panorama_acte1_foret.png',
    src: 'public/assets/aistudio/image_67ff0fab.png',
    band: b67.bottom,
  },
  {
    out: 'public/sheets/panorama_acte2_cavernes.png',
    src: 'public/assets/aistudio/image_6a2f1924.png',
    band: b6a.bottom,
  },
  {
    out: 'public/sheets/panorama_acte3_crypte.png',
    src: 'public/assets/aistudio/image_c0a34249.png',
    band: bc0.bottom,
  },
  {
    out: 'public/sheets/panorama_acte4_arene.png',
    src: 'public/assets/aistudio/image_67ff0fab.png',
    band: b67.top,
  },
  {
    out: 'public/sheets/panorama_acte5_citadelle.png',
    src: 'public/assets/aistudio/image_6a2f1924.png',
    band: b6a.top,
  },
  {
    out: 'public/sheets/panorama_acte6_sanctuaire.png',
    src: 'public/assets/aistudio/image_c0a34249.png',
    band: bc0.top,
  },
];

for (const p of panoSpecs) {
  if (!fs.existsSync(p.out)) {
    const cropArg = `2172x${p.band.h}+0+${p.band.yTop}`;
    execFileSync('/usr/bin/convert', [
      p.src,
      '-crop',
      cropArg,
      '+repage',
      '-filter',
      'Catrom',
      '-resize',
      '1800x240!',
      '-depth',
      '8',
      p.out,
    ]);
    console.log(`Built ${p.out} from crop ${cropArg}`);
  }
}

// ---------------------------------------------------------------------------
// 2. BUILD 6 BOSS ARENAS (320 x 240) + 3x2 ATLAS (960 x 480)
// ---------------------------------------------------------------------------
const arenaSpecs = [
  ['src/assets/images/stage_forest_pixel_1793121003697.jpg', 'public/sheets/decor_acte1_foret_320x240.png'],
  ['src/assets/images/stage_caverns_arena_1793402526129.jpg', 'public/sheets/decor_acte2_cavernes_320x240.png'],
  ['src/assets/images/stage_crypt_pixel_1793121006436.jpg', 'public/sheets/decor_acte3_crypte_320x240.png'],
  ['src/assets/images/stage_arena_pixel_1793121009126.jpg', 'public/sheets/decor_acte4_arene_320x240.png'],
  ['src/assets/images/stage_inferno_arena_1793402530359.jpg', 'public/sheets/decor_acte5_citadelle_320x240.png'],
  ['src/assets/images/stage_sanctuary_pixel_1793121025789.jpg', 'public/sheets/decor_acte6_sanctuaire_320x240.png'],
];

for (const [src, out] of arenaSpecs) {
  execFileSync('/usr/bin/convert', [
    src,
    '-filter',
    'Catrom',
    '-resize',
    '320x240!',
    '-depth',
    '8',
    out,
  ]);
}
execFileSync('/usr/bin/convert', [
  '(',
  'public/sheets/decor_acte1_foret_320x240.png',
  'public/sheets/decor_acte2_cavernes_320x240.png',
  'public/sheets/decor_acte3_crypte_320x240.png',
  '+append',
  ')',
  '(',
  'public/sheets/decor_acte4_arene_320x240.png',
  'public/sheets/decor_acte5_citadelle_320x240.png',
  'public/sheets/decor_acte6_sanctuaire_320x240.png',
  '+append',
  ')',
  '-append',
  'public/sheets/planche_decors_320x240.png',
]);

// ---------------------------------------------------------------------------
// HELPER: COMPUTE SPRITE ANCHOR AX (Stance center of lower body)
// ---------------------------------------------------------------------------
function computeAnchorAx(pixels, width, box, useFullHeight = false) {
  const yStart = useFullHeight ? box.y : box.y + Math.floor(box.h * 0.55);
  let sumX = 0;
  let count = 0;
  for (let y = yStart; y < box.y + box.h; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      const i = (y * width + x) * 4;
      const isBg = pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255;
      if (!isBg) {
        sumX += x - box.x;
        count++;
      }
    }
  }
  if (count < 20 && !useFullHeight) {
    return computeAnchorAx(pixels, width, box, true);
  }
  return count > 0 ? Math.round(sumX / count) : Math.round(box.w / 2);
}

function find2DComponents(pixels, width, height, y0, y1, radius = 1) {
  const visited = new Uint8Array(width * height);
  const comps = [];
  const isBg = (x, y) => {
    const i = (y * width + x) * 4;
    return pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255;
  };
  for (let y = y0; y <= y1; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      if (visited[start] || isBg(x, y)) continue;
      const queue = [start];
      visited[start] = 1;
      let minX = x, maxX = x, minY = y, maxY = y;
      let sumX = 0, sumY = 0;
      for (let q = 0; q < queue.length; q++) {
        const cur = queue[q];
        const cx = cur % width;
        const cy = (cur / width) | 0;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        sumX += cx;
        sumY += cy;
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = cy + dy;
          if (ny < y0 || ny > y1) continue;
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            if (nx < 0 || nx >= width) continue;
            const nxt = ny * width + nx;
            if (!visited[nxt] && !isBg(nx, ny)) {
              visited[nxt] = 1;
              queue.push(nxt);
            }
          }
        }
      }
      comps.push({
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1,
        cx: sumX / queue.length,
        cy: sumY / queue.length,
        area: queue.length,
        pixelsList: queue,
      });
    }
  }
  return comps;
}

// ---------------------------------------------------------------------------
// 3. PROCESS BOSS SHEETS (THALGRIM & BAELGOR) VIA 2D CONNECTED COMPONENTS
// ---------------------------------------------------------------------------
function processBossSheet(jpgPath, outPngPath, label, rowCountsExpected) {
  const tmp = `/tmp/boss_${label}.png`;
  toRgbaPng(jpgPath, tmp);
  const { width, height, pixels } = readRgbaPng(tmp);
  fs.unlinkSync(tmp);

  const isBgIdx = (pIdx) => {
    const r = pixels[pIdx * 4];
    const g = pixels[pIdx * 4 + 1];
    const b = pixels[pIdx * 4 + 2];
    return r === 255 && g === 0 && b === 255;
  };

  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (
      (r > 180 && b > 175 && g < 95 && r + b - g * 2 > 195) ||
      (r > 150 && b > 150 && g < 52 && Math.abs(r - b) < 22)
    ) {
      pixels[i] = 255;
      pixels[i + 1] = 0;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
    }
  }

  for (let pass = 0; pass < 2; pass++) {
    const bgMask = new Uint8Array(width * height);
    for (let p = 0; p < width * height; p++) {
      if (isBgIdx(p)) bgMask[p] = 1;
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        if (bgMask[p]) continue;
        const touchesBg =
          (x > 0 && bgMask[p - 1]) ||
          (x < width - 1 && bgMask[p + 1]) ||
          (y > 0 && bgMask[p - width]) ||
          (y < height - 1 && bgMask[p + width]);
        if (!touchesBg) continue;
        const i = p * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r > 135 && b > 130 && g < 100 && r > g + 45 && b > g + 45 && Math.abs(r - b) < 42) {
          pixels[i] = 255;
          pixels[i + 1] = 0;
          pixels[i + 2] = 255;
        }
      }
    }
  }

  // Remove tiny speckles (< 30px) and detached severed heads in Row 5 (y > 680)
  const rawComps = find2DComponents(pixels, width, height, 0, height - 1, 1);
  for (const c of rawComps) {
    const isTiny = c.area < 30;
    const isDetachedSeveredHead = c.y > 680 && c.w < 82 && c.h < 85 && c.area < 3600;
    if (isTiny || isDetachedSeveredHead) {
      for (const p of c.pixelsList) {
        pixels[p * 4] = 255;
        pixels[p * 4 + 1] = 0;
        pixels[p * 4 + 2] = 255;
      }
    }
  }

  // Extract 2D sprite components with radius=3 so any weapon spark stays attached
  const spriteComps = find2DComponents(pixels, width, height, 0, height - 1, 3)
    .filter((c) => c.area >= 400)
    .sort((a, b) => a.cy - b.cy);

  console.log(`${label} total 2D sprites: ${spriteComps.length} (expected ${rowCountsExpected.reduce((s, n) => s + n, 0)})`);

  // Slice sorted-by-cy sprites into the 5 rows according to rowCountsExpected, then sort each row by x
  const rowBoxes = [];
  let cursor = 0;
  for (let rIdx = 0; rIdx < rowCountsExpected.length; rIdx++) {
    const cnt = rowCountsExpected[rIdx];
    const slice = spriteComps.slice(cursor, cursor + cnt).sort((a, b) => a.x - b.x);
    cursor += cnt;
    const boxes = slice.map((c) => {
      const b = { x: c.x, y: c.y, w: c.w, h: c.h, ax: 0 };
      b.ax = computeAnchorAx(pixels, width, b, b.h < 95);
      return b;
    });
    console.log(
      `  ${label} Row ${rIdx + 1}: ${boxes.length} sprites`,
      boxes.map((b) => `${b.w}x${b.h}@(${b.x},${b.y})`)
    );
    rowBoxes.push(boxes);
  }

  writeRgbaPng(outPngPath, width, height, pixels);
  return { width, height, rowBoxes };
}

const thalgrim = processBossSheet(
  'src/assets/images/boss_thalgrim_sheet_1793402534130.jpg',
  'public/sheets/planche_boss_thalgrim.png',
  'THALGRIM',
  [8, 7, 7, 7, 5]
);

const baelgor = processBossSheet(
  'src/assets/images/boss_baelgor_sheet_1793402534891.jpg',
  'public/sheets/planche_boss_baelgor.png',
  'BAELGOR',
  [8, 6, 7, 6, 5]
);

// ---------------------------------------------------------------------------
// 4. PROCESS 11-MONSTER SHEET (public/assets/aistudio/image_35f586d6.png)
// ---------------------------------------------------------------------------
function processMonsters11Sheet(srcPngPath, outPngPath) {
  const tmp = `/tmp/m11_${Date.now()}.png`;
  toRgbaPng(srcPngPath, tmp);
  const { width, height, pixels } = readRgbaPng(tmp);
  fs.unlinkSync(tmp);

  const bgPerY = [];
  for (let y = 0; y < height; y++) {
    const i = (y * width + (width - 3)) * 4;
    bgPerY.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }

  function isRowGradientBg(x, y) {
    const i = (y * width + x) * 4;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const [br, bg, bb] = bgPerY[y];
    const dist = Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
    if (dist < 44) return true;
    if (r > 185 && b > 190 && g < 78 && r + b - 2 * g > 215) return true;
    return false;
  }

  function isWhiteMagentaTextBlend(x, y) {
    const i = (y * width + x) * 4;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const [br, bg, bb] = bgPerY[y];
    const denom = Math.max(1, 255 - bg);
    const t = Math.max(0, Math.min(1, (g - bg) / denom));
    const rp = br + (255 - br) * t;
    const bp = bb + (255 - bb) * t;
    return Math.abs(r - rp) <= 28 && Math.abs(b - bp) <= 28 && r >= br - 20 && b >= bb - 20;
  }

  const monsterRowSignal = new Int32Array(height);
  for (let y = 0; y < height; y++) {
    let sig = 0;
    for (let x = 0; x < width; x++) {
      if (!isRowGradientBg(x, y) && !isWhiteMagentaTextBlend(x, y)) {
        sig++;
      }
    }
    monsterRowSignal[y] = sig;
  }

  const mBands = [];
  let inM = false;
  let mStart = 0;
  for (let y = 0; y < height; y++) {
    if (monsterRowSignal[y] >= 4 && !inM) {
      inM = true;
      mStart = y;
    } else if (monsterRowSignal[y] < 4 && inM) {
      let bridge = false;
      for (let ny = y + 1; ny < Math.min(height, y + 4); ny++) {
        if (monsterRowSignal[ny] >= 4) bridge = true;
      }
      if (!bridge) {
        inM = false;
        if (y - mStart >= 32) {
          mBands.push({ y0: mStart, y1: y - 1 });
        }
      }
    }
  }
  if (inM && height - mStart >= 32) mBands.push({ y0: mStart, y1: height - 1 });

  const insideBand = new Uint8Array(height);
  for (const b of mBands) {
    for (let y = Math.max(0, b.y0 - 1); y <= Math.min(height - 1, b.y1 + 1); y++) {
      insideBand[y] = 1;
    }
  }

  // First pass: erase outside bands and background gradient
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (!insideBand[y] || isRowGradientBg(x, y)) {
        pixels[i] = 255;
        pixels[i + 1] = 0;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
    }
  }

  // Second pass: erase white-on-magenta header text ("1. GOBELIN" .. "11. DEMON") & partial glyph remnants on top-left of each band
  for (const band of mBands) {
    const comps = find2DComponents(pixels, width, height, Math.max(0, band.y0 - 1), Math.min(height - 1, band.y1 + 1), 1);
    for (const c of comps) {
      if (c.x + c.w <= 265 && c.h <= 25 && c.y <= band.y0 + 30 && c.y + c.h <= band.y1 - 36) {
        for (const p of c.pixelsList) {
          pixels[p * 4] = 255;
          pixels[p * 4 + 1] = 0;
          pixels[p * 4 + 2] = 255;
        }
      }
    }
  }

  // De-fringe 1px violet/magenta border halo
  const bgMask = new Uint8Array(width * height);
  for (let p = 0; p < width * height; p++) {
    if (pixels[p * 4] === 255 && pixels[p * 4 + 1] === 0 && pixels[p * 4 + 2] === 255) {
      bgMask[p] = 1;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      if (bgMask[p]) continue;
      const touchesBg =
        (x > 0 && bgMask[p - 1]) ||
        (x < width - 1 && bgMask[p + 1]) ||
        (y > 0 && bgMask[p - width]) ||
        (y < height - 1 && bgMask[p + width]);
      if (!touchesBg) continue;
      const i = p * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r > 155 && b > 165 && g < 95 && r > g + 55 && b > g + 65 && Math.abs(r - b) < 42) {
        pixels[i] = 255;
        pixels[i + 1] = 0;
        pixels[i + 2] = 255;
      }
    }
  }

  const isPureBg = (x, y) => {
    const i = (y * width + x) * 4;
    return pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255;
  };

  // Helper to split a wide component into k sub-boxes along X density valleys
  function splitPixelGroupIntoK(pixelsList, k) {
    let minX = width, maxX = 0;
    for (const p of pixelsList) {
      const x = p % width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    const span = maxX - minX + 1;
    const colHist = new Int32Array(span);
    for (const p of pixelsList) {
      colHist[(p % width) - minX]++;
    }
    const cuts = [minX];
    for (let s = 1; s < k; s++) {
      const target = Math.round((span * s) / k);
      const win = Math.max(8, Math.round(span / (k * 3.2)));
      const lo = Math.max(cuts[cuts.length - 1] - minX + 12, target - win);
      const hi = Math.min(span - 12, target + win);
      let bestRel = target;
      let bestVal = 1e9;
      for (let rx = lo; rx <= hi; rx++) {
        const val = colHist[rx - 1] + colHist[rx] * 2 + colHist[rx + 1];
        if (val < bestVal) {
          bestVal = val;
          bestRel = rx;
        }
      }
      cuts.push(minX + bestRel);
    }
    cuts.push(maxX + 1);

    const groups = Array.from({ length: k }, () => []);
    for (const p of pixelsList) {
      const x = p % width;
      let gIdx = k - 1;
      for (let s = 0; s < k; s++) {
        if (x >= cuts[s] && x < cuts[s + 1]) {
          gIdx = s;
          break;
        }
      }
      groups[gIdx].push(p);
    }
    return groups.filter((g) => g.length > 0).map((g) => buildCompFromPixels(g));
  }

  function buildCompFromPixels(pixelsList) {
    let minX = width, maxX = 0, minY = height, maxY = 0, sumX = 0, sumY = 0;
    for (const p of pixelsList) {
      const x = p % width;
      const y = (p / width) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      sumX += x;
      sumY += y;
    }
    return {
      x: minX,
      y: minY,
      w: maxX - minX + 1,
      h: maxY - minY + 1,
      cx: sumX / pixelsList.length,
      cy: sumY / pixelsList.length,
      area: pixelsList.length,
      pixelsList,
    };
  }

  const expectedCounts = [13, 12, 13, 13, 11, 14, 12, 11, 11, 10, 10];
  const monsterBoxes = [];

  for (let mIdx = 0; mIdx < mBands.length; mIdx++) {
    const { y0, y1 } = mBands[mIdx];
    const expected = expectedCounts[mIdx];
    // Extract strict 8-connected components (radius=1) so diagonal non-touching weapons stay separate!
    const raw = find2DComponents(pixels, width, height, Math.max(0, y0 - 1), Math.min(height - 1, y1 + 1), 1);

    // Separate primary pose bodies from tiny detached fragments (bones, pebbles, sparks)
    // Note: Bat (mIdx=5) death poses have small clusters (~110px), others have bodies >= 320px
    const minBodyArea = mIdx === 5 ? 95 : 290;
    let bodies = raw.filter((c) => c.area >= minBodyArea).sort((a, b) => a.cx - b.cx);
    const fragments = raw.filter((c) => c.area < minBodyArea && c.area >= 4);

    // If bodies.length > expected (e.g. multi-piece skeleton/ghost/bat death pose where two chunks exceeded minBodyArea),
    // merge closest adjacent pair in X until bodies.length <= expected OR only wide merged bodies remain
    while (bodies.length > expected) {
      let bestIdx = 0;
      let bestDist = 1e9;
      for (let i = 0; i < bodies.length - 1; i++) {
        const gapX = Math.max(0, bodies[i + 1].x - (bodies[i].x + bodies[i].w));
        const centerDist = Math.abs(bodies[i + 1].cx - bodies[i].cx);
        const score = gapX * 3 + centerDist;
        if (score < bestDist) {
          bestDist = score;
          bestIdx = i;
        }
      }
      const merged = buildCompFromPixels([...bodies[bestIdx].pixelsList, ...bodies[bestIdx + 1].pixelsList]);
      bodies.splice(bestIdx, 2, merged);
    }

    // If bodies.length < expected (e.g. 2 poses touched by 1px at weapon/wing tip),
    // split the widest body component until bodies.length === expected!
    while (bodies.length < expected && bodies.length > 0) {
      let widestIdx = 0;
      for (let i = 1; i < bodies.length; i++) {
        if (bodies[i].w > bodies[widestIdx].w) widestIdx = i;
      }
      const targetBody = bodies[widestIdx];
      // Estimate how many poses are inside targetBody if it's huge, else split in 2
      const avgPoseW = 960 / expected;
      const missing = expected - bodies.length;
      const k = Math.min(missing + 1, Math.max(2, Math.round(targetBody.w / avgPoseW)));
      const parts = splitPixelGroupIntoK(targetBody.pixelsList, k);
      if (parts.length <= 1) break;
      bodies.splice(widestIdx, 1, ...parts);
      bodies.sort((a, b) => a.cx - b.cx);
    }

    // Re-attach fragments (flying helmet shards, scattered bones, pebbles, embers) to nearest body
    for (const frag of fragments) {
      if (bodies.length === 0) break;
      let bestB = bodies[0];
      let bestScore = 1e9;
      for (const b of bodies) {
        const dx = frag.cx < b.x ? b.x - frag.cx : frag.cx > b.x + b.w ? frag.cx - (b.x + b.w) : 0;
        const dy = frag.cy < b.y ? b.y - frag.cy : frag.cy > b.y + b.h ? frag.cy - (b.y + b.h) : 0;
        const dist = dx + dy * 0.5 + Math.abs(frag.cx - b.cx) * 0.25;
        if (dist < bestScore) {
          bestScore = dist;
          bestB = b;
        }
      }
      if (bestScore < 55) {
        const idx = bodies.indexOf(bestB);
        bodies[idx] = buildCompFromPixels([...bestB.pixelsList, ...frag.pixelsList]);
      }
    }

    bodies.sort((a, b) => a.x - b.x);
    const boxes = bodies.map((c) => {
      const b = { x: c.x, y: c.y, w: c.w, h: c.h, ax: 0 };
      const isFlyer = mIdx === 5 || mIdx === 6;
      b.ax = computeAnchorAx(pixels, width, b, isFlyer || b.h < 58);
      return b;
    });

    console.log(
      `  Monster ${mIdx + 1}: got ${boxes.length} (expected ${expected})`,
      boxes.map((b) => `${b.w}x${b.h}@${b.x}`)
    );
    monsterBoxes.push(boxes);
  }

  writeRgbaPng(outPngPath, width, height, pixels);
  return { width, height, monsterBoxes };
}

const m11 = processMonsters11Sheet(
  'public/assets/aistudio/image_35f586d6.png',
  'public/sheets/planche_11_monstres.png'
);

// ---------------------------------------------------------------------------
// 5. EMIT /src/game/newAtlasCoords.ts
// ---------------------------------------------------------------------------
const thalgrimMap = {};
const tNames = [
  ['T_IDLE_0', 'T_IDLE_1', 'T_IDLE_2', 'T_IDLE_3', 'T_WALK_0', 'T_WALK_1', 'T_WALK_2', 'T_WALK_3'],
  ['T_CL_0', 'T_CL_1', 'T_CL_2', 'T_CL_3', 'T_BLOCK_0', 'T_BLOCK_1', 'T_BLOCK_2'],
  ['T_SWEEP_0', 'T_SWEEP_1', 'T_SWEEP_2', 'T_SWEEP_3', 'T_CROUCH_0', 'T_CROUCH_1', 'T_CROUCH_2'],
  ['T_JUMP_0', 'T_JUMP_1', 'T_JUMP_2', 'T_JUMP_3', 'T_HIT_0', 'T_FALL_0', 'T_FALL_1'],
  ['T_DEAD_0', 'T_DECAP_0', 'T_DECAP_1', 'T_VIC_0', 'T_VIC_1'],
];
tNames.forEach((rowKeys, rIdx) => {
  const boxes = thalgrim.rowBoxes[rIdx] || [];
  rowKeys.forEach((k, cIdx) => {
    const b = boxes[Math.min(cIdx, boxes.length - 1)];
    if (b) thalgrimMap[k] = b;
  });
});

const baelgorMap = {};
const bNames = [
  ['B_IDLE_0', 'B_IDLE_1', 'B_IDLE_2', 'B_IDLE_3', 'B_WALK_0', 'B_WALK_1', 'B_WALK_2', 'B_WALK_3'],
  ['B_SLASH_0', 'B_SLASH_1', 'B_THRUST_0', 'B_THRUST_1', 'B_BLOCK_0', 'B_BLOCK_1'],
  ['B_ROLL_0', 'B_ROLL_1', 'B_ROLL_2', 'B_LEAP_0', 'B_CROUCH_0', 'B_CROUCH_1', 'B_SWEEP_0'],
  ['B_JUMP_0', 'B_JUMP_1', 'B_JUMP_2', 'B_HIT_0', 'B_FALL_0', 'B_FALL_1'],
  ['B_DEAD_0', 'B_DECAP_0', 'B_DECAP_1', 'B_VIC_0', 'B_VIC_1'],
];
bNames.forEach((rowKeys, rIdx) => {
  const boxes = baelgor.rowBoxes[rIdx] || [];
  rowKeys.forEach((k, cIdx) => {
    const b = boxes[Math.min(cIdx, boxes.length - 1)];
    if (b) baelgorMap[k] = b;
  });
});

const monsters11Map = {};
m11.monsterBoxes.forEach((boxes, mIdx) => {
  const pfx = `M${String(mIdx + 1).padStart(2, '0')}`;
  boxes.forEach((b, cIdx) => {
    monsters11Map[`${pfx}_${cIdx}`] = b;
  });
});

const tsLines = [
  "import type { VerifiedSpriteBox } from './atlasCoords';",
  '',
  'export const NEW_SHEET_META = {',
  `  thalgrimBoss: { width: ${thalgrim.width}, height: ${thalgrim.height}, count: ${Object.keys(thalgrimMap).length} },`,
  `  baelgorBoss: { width: ${baelgor.width}, height: ${baelgor.height}, count: ${Object.keys(baelgorMap).length} },`,
  `  monsters11Sheet: { width: ${m11.width}, height: ${m11.height}, count: ${Object.keys(monsters11Map).length} },`,
  '} as const;',
  '',
  'export const THALGRIM_COORDS = {',
  ...Object.entries(thalgrimMap).map(
    ([k, b]) => `  ${k}: { x: ${b.x}, y: ${b.y}, w: ${b.w}, h: ${b.h}, ax: ${b.ax} },`
  ),
  '} as const satisfies Record<string, VerifiedSpriteBox>;',
  '',
  'export const BAELGOR_COORDS = {',
  ...Object.entries(baelgorMap).map(
    ([k, b]) => `  ${k}: { x: ${b.x}, y: ${b.y}, w: ${b.w}, h: ${b.h}, ax: ${b.ax} },`
  ),
  '} as const satisfies Record<string, VerifiedSpriteBox>;',
  '',
  'export const MONSTERS11_COORDS = {',
  ...Object.entries(monsters11Map).map(
    ([k, b]) => `  ${k}: { x: ${b.x}, y: ${b.y}, w: ${b.w}, h: ${b.h}, ax: ${b.ax} },`
  ),
  '} as const satisfies Record<string, VerifiedSpriteBox>;',
  '',
];

fs.writeFileSync('src/game/newAtlasCoords.ts', tsLines.join('\n'));
console.log('Wrote src/game/newAtlasCoords.ts successfully!');
