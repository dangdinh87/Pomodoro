# Phase 1: Build Script & Source Restructure

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** None (first phase)
- **Docs:** [Brainstorm](../reports/brainstorm-260208-1408-background-optimization.md), [Scout](../reports/scout-260208-1408-background-implementation.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-08 |
| Priority | P2 |
| Effort | 3h |
| Implementation | pending |
| Review | pending |

Create `scripts/optimize-backgrounds.mjs` using sharp to convert source images into AVIF + WebP at two sizes. Reorganize source images from `public/backgrounds/` into `backgrounds-source/` organized by pack. Generate `public/backgrounds/manifest.json` with metadata.

## Key Insights

1. Current `public/backgrounds/` has 95MB of raw JPGs. The `/new/` subfolder alone is 88MB.
2. Build script must be idempotent -- skip files already optimized (compare mtime or content hash).
3. Videos (day.mp4, night.mp4) pass through unchanged -- already small.
4. `cafe_1.jpeg` exists in `public/backgrounds/` but is NOT referenced in `background-presets.ts` -- exclude it.
5. Sharp adds ~30MB to node_modules but only needed at build time (devDependency).

## Requirements

1. Install `sharp` as devDependency
2. Create `backgrounds-source/` directory structure organized by pack
3. Move all source images from `public/backgrounds/` to `backgrounds-source/{pack}/`
4. Create `scripts/optimize-backgrounds.mjs` that:
   - Reads from `backgrounds-source/{pack}/*.jpg`
   - Outputs to `public/backgrounds/full/{id}.avif`, `public/backgrounds/full/{id}.webp`, `public/backgrounds/thumb/{id}.webp`
   - Generates `public/backgrounds/manifest.json`
5. Copy videos as-is to output
6. Add npm scripts to `package.json`
7. Update `.gitignore`

## Architecture

```
backgrounds-source/                    (COMMITTED to git, ~95MB of sources)
  ├── system/                          (empty -- system/auto have no image files)
  ├── lofi-video/
  │   ├── day.mp4
  │   └── night.mp4
  ├── travelling/
  │   ├── travelling.jpg
  │   ├── travelling2.jpg
  │   └── ... (9 files)
  ├── classic/
  │   ├── landscape-cartoon.jpg
  │   ├── chill-shiba-sleeping-christmas-room.jpg
  │   ├── study_1.jpg
  │   └── cafe_1.jpeg               (excluded -- not in presets)
  ├── cyberpunk/
  │   ├── night_light.jpg
  │   ├── 2151176471.jpg
  │   ├── 2151470662.jpg
  │   ├── abstract-futuristic-city-*.jpg
  │   ├── building-house-*.jpg
  │   └── futuristic-city-skyline-*.jpg
  ├── anime-cozy/
  │   ├── anime-style-cozy-home-*.jpg
  │   ├── anime-style-cozy-home-* (1).jpg
  │   ├── cozy-home-interior-anime-style.jpg
  │   └── cozy-room-with-sunset-student.jpg
  └── fantasy/
      ├── fantasy-group-adventurers.jpg
      ├── fantasy-group-adventurers (1).jpg
      ├── fantasy-group-adventurers (2).jpg
      ├── fantasy-group-adventurers (3).jpg
      └── fantasy-group-adventurers (4).jpg

public/backgrounds/                    (GITIGNORED -- build output)
  ├── full/
  │   ├── travelling-1.avif
  │   ├── travelling-1.webp
  │   ├── travelling-2.avif
  │   └── ... (27 images x 2 formats = 54 files)
  ├── thumb/
  │   ├── travelling-1.webp
  │   └── ... (27 thumbnails, WebP only)
  ├── day.mp4                          (copied from source)
  ├── night.mp4                        (copied from source)
  └── manifest.json                    (generated metadata)
```

### Manifest Format

```json
{
  "version": 1,
  "generated": "2026-02-08T14:00:00Z",
  "images": {
    "travelling-1": {
      "pack": "travelling",
      "thumb": "/backgrounds/thumb/travelling-1.webp",
      "full": {
        "avif": "/backgrounds/full/travelling-1.avif",
        "webp": "/backgrounds/full/travelling-1.webp"
      },
      "width": 1920,
      "thumbWidth": 400
    }
  }
}
```

## Related Code Files

| File | Role |
|------|------|
| `package.json` | Add `sharp` devDep, add `bg:optimize` + `prebuild` scripts |
| `.gitignore` | Add `public/backgrounds/full/`, `public/backgrounds/thumb/`, `public/backgrounds/manifest.json` |
| `scripts/optimize-backgrounds.mjs` | New -- build script |

## Source-to-ID Mapping

Complete mapping from current file paths to new IDs and packs:

| Current Path | Pack | New ID |
|---|---|---|
| (no file -- sentinel `system:auto-color`) | system | system-auto-color |
| (no file -- sentinel `lofi:auto`) | system | lofi-auto |
| `/backgrounds/day.mp4` | lofi-video | day-chill |
| `/backgrounds/night.mp4` | lofi-video | night-chill |
| `/backgrounds/travelling.jpg` | travelling | travelling-1 |
| `/backgrounds/travelling2.jpg` | travelling | travelling-2 |
| `/backgrounds/travelling3.jpg` | travelling | travelling-3 |
| `/backgrounds/travelling4.jpg` | travelling | travelling-4 |
| `/backgrounds/travelling5.jpg` | travelling | travelling-5 |
| `/backgrounds/travelling6.jpg` | travelling | travelling-6 |
| `/backgrounds/travelling7.jpg` | travelling | travelling-7 |
| `/backgrounds/travelling8.jpg` | travelling | travelling-8 |
| `/backgrounds/travelling9.jpg` | travelling | travelling-9 |
| `/backgrounds/landscape-cartoon.jpg` | classic | landscape-cartoon |
| `/backgrounds/xmas/chill-shiba-sleeping-christmas-room.jpg` | classic | chill-shiba |
| `/backgrounds/study_1.jpg` | classic | study-desk |
| `/backgrounds/new/night_light.jpg` | cyberpunk | night-light |
| `/backgrounds/new/2151176471.jpg` | cyberpunk | cyberpunk-scene-1 |
| `/backgrounds/new/2151470662.jpg` | cyberpunk | cyberpunk-scene-2 |
| `/backgrounds/new/abstract-futuristic-city-*.jpg` | cyberpunk | futuristic-city-abstract |
| `/backgrounds/new/building-house-*.jpg` | cyberpunk | cyber-city |
| `/backgrounds/new/futuristic-city-skyline-*.jpg` | cyberpunk | futuristic-city-night |
| `/backgrounds/new/anime-style-cozy-home-*.jpg` | anime-cozy | anime-cozy-home-1 |
| `/backgrounds/new/anime-style-cozy-home-* (1).jpg` | anime-cozy | anime-cozy-home-2 |
| `/backgrounds/new/cozy-home-interior-anime-style.jpg` | anime-cozy | cozy-anime-interior |
| `/backgrounds/new/cozy-room-with-sunset-student.jpg` | anime-cozy | cozy-room-sunset |
| `/backgrounds/new/fantasy-group-adventurers.jpg` | fantasy | fantasy-adventurers-1 |
| `/backgrounds/new/fantasy-group-adventurers (1).jpg` | fantasy | fantasy-adventurers-2 |
| `/backgrounds/new/fantasy-group-adventurers (2).jpg` | fantasy | fantasy-adventurers-3 |
| `/backgrounds/new/fantasy-group-adventurers (3).jpg` | fantasy | fantasy-adventurers-4 |
| `/backgrounds/new/fantasy-group-adventurers (4).jpg` | fantasy | fantasy-adventurers-5 |

## Implementation Steps

### 1. Install sharp

```bash
npm install --save-dev sharp
```

### 2. Create source directory structure

```bash
mkdir -p backgrounds-source/{system,lofi-video,travelling,classic,cyberpunk,anime-cozy,fantasy}
```

Move files from `public/backgrounds/` to corresponding `backgrounds-source/{pack}/` directories per the mapping table above. Rename files to clean IDs (e.g., `travelling.jpg` -> `travelling-1.jpg`).

### 3. Create `scripts/optimize-backgrounds.mjs`

Script logic:
1. Read pack config (inline map of pack -> source dir)
2. For each source image (`.jpg`, `.jpeg`, `.png`):
   a. Generate `id` from filename (strip extension)
   b. Resize to 1920px wide -> save as `.avif` (quality 65) and `.webp` (quality 75) in `public/backgrounds/full/`
   c. Resize to 400px wide -> save as `.webp` (quality 60) in `public/backgrounds/thumb/`
   d. Skip if output files exist and are newer than source (idempotent)
3. Copy `.mp4` files from `lofi-video/` to `public/backgrounds/`
4. Generate `manifest.json` with all metadata
5. Log summary: total images, total size before/after

Key sharp operations:
```js
import sharp from 'sharp';

// Full AVIF
await sharp(inputPath)
  .resize({ width: 1920, withoutEnlargement: true })
  .avif({ quality: 65 })
  .toFile(outputAvif);

// Full WebP
await sharp(inputPath)
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 75 })
  .toFile(outputWebp);

// Thumbnail WebP
await sharp(inputPath)
  .resize({ width: 400 })
  .webp({ quality: 60 })
  .toFile(outputThumb);
```

### 4. Update `package.json` scripts

```json
{
  "scripts": {
    "bg:optimize": "node scripts/optimize-backgrounds.mjs",
    "prebuild": "node scripts/optimize-backgrounds.mjs",
    "dev": "next dev",
    "build": "next build"
  }
}
```

### 5. Update `.gitignore`

Append:
```
# Build-generated background assets
public/backgrounds/full/
public/backgrounds/thumb/
public/backgrounds/manifest.json
```

Keep `backgrounds-source/` committed (NOT gitignored) -- these are the canonical sources.

### 6. Verify idempotency

Run `npm run bg:optimize` twice. Second run should skip all files and complete in <1s.

## Todo

- [ ] Install `sharp` as devDependency
- [ ] Create `backgrounds-source/` directory structure
- [ ] Move + rename source images per mapping table
- [ ] Write `scripts/optimize-backgrounds.mjs`
- [ ] Add `bg:optimize` and `prebuild` scripts to `package.json`
- [ ] Update `.gitignore` for generated output
- [ ] Test: run script, verify output sizes and formats
- [ ] Test: idempotent re-run skips existing files
- [ ] Copy videos (day.mp4, night.mp4) to source dir

## Success Criteria

1. `npm run bg:optimize` produces AVIF + WebP + thumbnails for all 27 images
2. Total output size < 20MB (target ~15MB)
3. `manifest.json` generated with correct paths for all images
4. Videos copied to output unchanged
5. Second run is a no-op (idempotent)
6. No source images remain in `public/backgrounds/` after migration

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Sharp install fails on CI (native deps) | Low | High | Vercel has pre-built sharp binaries; test in CI early |
| AVIF encoding slow (1-2 min for 31 images) | Medium | Low | Idempotent -- only runs on new/changed images |
| Source images 95MB bloats git repo | Medium | Medium | Consider Git LFS later if repo size concern |
| File names with spaces/parens cause issues | Medium | Medium | Rename to clean IDs during migration |

## Security Considerations

- No user input processed by build script (reads from controlled source dir only)
- No secrets or env vars required
- Output is static assets only

## Next Steps

After this phase, Phase 2 (Data Model & Pack System) uses `manifest.json` and the new ID scheme to build the `background-packs.ts` data model.
