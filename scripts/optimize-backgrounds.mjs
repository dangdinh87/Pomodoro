/**
 * Build-time background image optimization script.
 *
 * Reads source images from backgrounds-source/{pack}/ and generates:
 * - public/backgrounds/full/{id}.avif  (1920w, quality 65)
 * - public/backgrounds/full/{id}.webp  (1920w, quality 75)
 * - public/backgrounds/thumb/{id}.webp (400w, quality 60)
 * - public/backgrounds/manifest.json   (metadata for all images)
 *
 * Videos (.mp4) are copied as-is.
 * Idempotent: skips files whose output is newer than source.
 *
 * Usage: node scripts/optimize-backgrounds.mjs
 */

import { existsSync, mkdirSync, statSync, readdirSync, copyFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import sharp from 'sharp';

// Limit sharp memory to prevent OOM on large batches
sharp.cache({ memory: 256 });
sharp.concurrency(1);

const ROOT = process.cwd();
const SOURCE_DIR = join(ROOT, 'backgrounds-source');
const OUTPUT_DIR = join(ROOT, 'public', 'backgrounds');
const FULL_DIR = join(OUTPUT_DIR, 'full');
const THUMB_DIR = join(OUTPUT_DIR, 'thumb');

// Packs to process (directories under backgrounds-source/)
const PACKS = ['travelling', 'classic', 'cyberpunk', 'anime-cozy', 'fantasy'];
const VIDEO_PACK = 'lofi-video';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Optimization settings
const FULL_WIDTH = 1920;
const THUMB_WIDTH = 400;
const AVIF_QUALITY = 65;
const WEBP_FULL_QUALITY = 75;
const WEBP_THUMB_QUALITY = 60;

function ensureDirs() {
  for (const dir of [FULL_DIR, THUMB_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

function isNewer(outputPath, sourceMtime) {
  if (!existsSync(outputPath)) return false;
  return statSync(outputPath).mtimeMs >= sourceMtime;
}

async function optimizeImage(sourcePath, id, pack) {
  const sourceMtime = statSync(sourcePath).mtimeMs;

  const fullAvif = join(FULL_DIR, `${id}.avif`);
  const fullWebp = join(FULL_DIR, `${id}.webp`);
  const thumbWebp = join(THUMB_DIR, `${id}.webp`);

  const allExist =
    isNewer(fullAvif, sourceMtime) &&
    isNewer(fullWebp, sourceMtime) &&
    isNewer(thumbWebp, sourceMtime);

  if (allExist) {
    return { id, pack, skipped: true };
  }

  // Read source once, clone for each output to reduce memory usage
  const source = sharp(sourcePath);
  const metadata = await source.metadata();

  if (!isNewer(fullAvif, sourceMtime)) {
    await source.clone()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .avif({ quality: AVIF_QUALITY })
      .toFile(fullAvif);
  }

  if (!isNewer(fullWebp, sourceMtime)) {
    await source.clone()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_FULL_QUALITY })
      .toFile(fullWebp);
  }

  if (!isNewer(thumbWebp, sourceMtime)) {
    await source.clone()
      .resize({ width: THUMB_WIDTH })
      .webp({ quality: WEBP_THUMB_QUALITY })
      .toFile(thumbWebp);
  }

  // Get output sizes for logging
  const fullAvifSize = statSync(fullAvif).size;
  const fullWebpSize = statSync(fullWebp).size;
  const thumbSize = statSync(thumbWebp).size;

  return {
    id,
    pack,
    skipped: false,
    sourceSize: metadata.size || statSync(sourcePath).size,
    fullAvifSize,
    fullWebpSize,
    thumbSize,
    width: Math.min(metadata.width || FULL_WIDTH, FULL_WIDTH),
  };
}

function copyVideos() {
  const videoDir = join(SOURCE_DIR, VIDEO_PACK);
  if (!existsSync(videoDir)) return [];

  const copied = [];
  for (const file of readdirSync(videoDir)) {
    if (extname(file).toLowerCase() === '.mp4') {
      const dest = join(OUTPUT_DIR, file);
      const sourcePath = join(videoDir, file);
      const sourceMtime = statSync(sourcePath).mtimeMs;

      if (!isNewer(dest, sourceMtime)) {
        copyFileSync(sourcePath, dest);
        copied.push(file);
      }
    }
  }
  return copied;
}

async function generateManifest(results) {
  const images = {};
  for (const r of results) {
    images[r.id] = {
      pack: r.pack,
      thumb: `/backgrounds/thumb/${r.id}.webp`,
      full: {
        avif: `/backgrounds/full/${r.id}.avif`,
        webp: `/backgrounds/full/${r.id}.webp`,
      },
      width: FULL_WIDTH,
      thumbWidth: THUMB_WIDTH,
    };
  }

  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    images,
  };

  await writeFile(
    join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  return manifest;
}

async function main() {
  console.log('🖼️  Background optimization starting...\n');

  ensureDirs();

  if (!existsSync(SOURCE_DIR)) {
    console.error(`  ❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Process images
  const results = [];
  let skippedCount = 0;
  let processedCount = 0;
  let errorCount = 0;

  for (const pack of PACKS) {
    const packDir = join(SOURCE_DIR, pack);
    if (!existsSync(packDir)) {
      console.warn(`  ⚠ Pack dir not found: ${pack}`);
      continue;
    }

    const files = readdirSync(packDir)
      .filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()))
      .sort();

    for (const file of files) {
      const id = basename(file, extname(file));
      const sourcePath = join(packDir, file);

      try {
        const result = await optimizeImage(sourcePath, id, pack);
        results.push(result);

        if (result.skipped) {
          skippedCount++;
        } else {
          processedCount++;
          const srcKB = Math.round((result.sourceSize || 0) / 1024);
          const avifKB = Math.round((result.fullAvifSize || 0) / 1024);
          const webpKB = Math.round((result.fullWebpSize || 0) / 1024);
          const thumbKB = Math.round((result.thumbSize || 0) / 1024);
          console.log(
            `  ✓ ${id} (${pack}): ${srcKB}KB → AVIF ${avifKB}KB, WebP ${webpKB}KB, thumb ${thumbKB}KB`,
          );
        }
      } catch (err) {
        errorCount++;
        console.error(`  ✗ ${id} (${pack}): ${err.message}`);
      }
    }
  }

  // Copy videos
  const copiedVideos = copyVideos();
  if (copiedVideos.length > 0) {
    console.log(`\n  📹 Copied videos: ${copiedVideos.join(', ')}`);
  }

  // Generate manifest
  const manifest = await generateManifest(results);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`  Images processed: ${processedCount}`);
  console.log(`  Images skipped (up-to-date): ${skippedCount}`);
  console.log(`  Total images in manifest: ${Object.keys(manifest.images).length}`);
  console.log(`  Videos: ${copiedVideos.length} copied`);
  if (errorCount > 0) console.log(`  Errors: ${errorCount}`);

  if (processedCount > 0) {
    const totalAvif = results
      .filter((r) => !r.skipped)
      .reduce((sum, r) => sum + (r.fullAvifSize || 0), 0);
    const totalWebp = results
      .filter((r) => !r.skipped)
      .reduce((sum, r) => sum + (r.fullWebpSize || 0), 0);
    const totalThumb = results
      .filter((r) => !r.skipped)
      .reduce((sum, r) => sum + (r.thumbSize || 0), 0);
    const totalSource = results
      .filter((r) => !r.skipped)
      .reduce((sum, r) => sum + (r.sourceSize || 0), 0);

    console.log(`\n  Source total: ${(totalSource / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  AVIF total:   ${(totalAvif / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  WebP total:   ${(totalWebp / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  Thumbs total: ${(totalThumb / 1024 / 1024).toFixed(1)}MB`);
    console.log(
      `  Reduction:    ${(((totalSource - totalAvif) / totalSource) * 100).toFixed(0)}% (AVIF vs source)`,
    );
  }

  console.log('\n✅ Done!\n');
}

main().catch((err) => {
  console.error('❌ Background optimization failed:', err);
  process.exit(1);
});
