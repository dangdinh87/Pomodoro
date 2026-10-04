// Renders every brand raster from the Tomo artwork (src/components/brand/tomo-art.ts):
//   public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png,
//   public/icons/{icon-192x192,icon-512x512,maskable-icon-512x512}.png
// Run: pnpm icons:brand   (uses tsx so the .ts artwork can be imported)
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOMO_LIGHT_PALETTE, tomoSvg } from '../src/components/brand/tomo-art.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CREAM = '#FFF3E0'; // --surface-page (light)
const out = (p) => path.join(root, p);

// Master SVG: Tomo's head, cropped to the tomato. The outline gets heavier at tab-icon sizes so it holds up at 16px.
const strokeFor = (box) => (box <= 32 ? 6 : 4);
const master = (size, strokeWidth = strokeFor(size)) => tomoSvg('happy', TOMO_LIGHT_PALETTE, { size, tight: true, strokeWidth });

async function tomoPng(box) {
  // Rasterise large, then resample down: crisp strokes at every output size.
  return sharp(Buffer.from(master(box * 4, strokeFor(box))), { density: 72 }).resize(box, box).png().toBuffer();
}

/** Tomo centred on a cream tile. `fraction` = share of the tile the Tomo box covers; `radius` rounds the tile. */
async function tile(size, fraction, radius, file) {
  const box = Math.round(size * fraction);
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${CREAM}"/></svg>`,
  );
  await sharp(bg)
    .composite([{ input: await tomoPng(box), gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(out(file));
  console.log('wrote', file);
}

// .ico containing PNG frames (supported by every current browser).
async function ico(sizes, file) {
  const frames = await Promise.all(sizes.map(tomoPng));
  const head = Buffer.alloc(6 + 16 * frames.length);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(frames.length, 4);
  let offset = head.length;
  frames.forEach((png, i) => {
    const o = 6 + 16 * i;
    head.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], o);
    head.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], o + 1);
    head.writeUInt16LE(1, o + 4); // colour planes
    head.writeUInt16LE(32, o + 6); // bits per pixel
    head.writeUInt32LE(png.length, o + 8);
    head.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  await writeFile(out(file), Buffer.concat([head, ...frames]));
  console.log('wrote', file);
}

await mkdir(out('public/icons'), { recursive: true });
await writeFile(out('public/favicon.svg'), `${master(120, 5)}\n`);
console.log('wrote public/favicon.svg');
await ico([16, 32, 48], 'public/favicon.ico');

// "any": rounded cream tile. Maskable: full-bleed, Tomo inside the 80% safe circle. Apple: full-bleed, the OS rounds it.
await tile(192, 0.76, 192 * 0.2, 'public/icons/icon-192x192.png');
await tile(512, 0.76, 512 * 0.2, 'public/icons/icon-512x512.png');
await tile(512, 0.62, 0, 'public/icons/maskable-icon-512x512.png');
await tile(180, 0.74, 0, 'public/apple-touch-icon.png');
