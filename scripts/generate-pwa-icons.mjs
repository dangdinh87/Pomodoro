// Generates PWA icons from public/images/logo.svg. Run: node scripts/generate-pwa-icons.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logo = path.join(root, 'public/images/logo.svg');
// Dark theme background (hsl(24 10% 6%) from globals.css)
const BG = '#110f0e';
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

async function render(size, fraction, background, out) {
  const inner = Math.round(size * fraction);
  const fg = await sharp(logo, { density: 384 })
    .resize(inner, inner, { fit: 'contain', background: transparent })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: fg, gravity: 'center' }])
    .png()
    .toFile(path.join(root, out));
  console.log('wrote', out);
}

await mkdir(path.join(root, 'public/icons'), { recursive: true });
await render(192, 0.9, transparent, 'public/icons/icon-192x192.png');
await render(512, 0.9, transparent, 'public/icons/icon-512x512.png');
await render(512, 0.7, BG, 'public/icons/maskable-icon-512x512.png');
await render(180, 0.8, BG, 'public/apple-touch-icon.png');
