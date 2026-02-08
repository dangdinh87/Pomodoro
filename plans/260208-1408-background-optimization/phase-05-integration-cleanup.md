# Phase 5: Integration & Cleanup

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** Phases 1-4 (all prior phases complete)
- **Docs:** [Brainstorm](../reports/brainstorm-260208-1408-background-optimization.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-08 |
| Priority | P2 |
| Effort | 1.5h |
| Implementation | pending |
| Review | pending |

End-to-end integration testing, remove deprecated files, update i18n translations, verify Vercel build pipeline, and validate performance improvements.

## Key Insights

1. Multiple consumers import from `background-presets.ts` -- all must be switched to `background-packs.ts`.
2. Old images in `public/backgrounds/` (root level JPGs, `/new/`, `/xmas/`) should be removed after build script generates optimized output.
3. Vercel's `prebuild` script will auto-run `bg:optimize` -- need to verify sharp works in Vercel's Node.js build environment.
4. i18n keys for new pack names needed in 3 locales (en, vi, ja).
5. `cafe_1.jpeg` in `public/backgrounds/` is unreferenced -- remove it.

## Requirements

1. Remove `src/data/background-presets.ts` (deprecated in Phase 2)
2. Remove old source images from `public/backgrounds/` (moved to `backgrounds-source/` in Phase 1)
3. Update all import references from `background-presets` to `background-packs`
4. Add complete i18n keys for pack names in all 3 locales
5. Verify `npm run build` works end-to-end (prebuild generates images, Next.js builds)
6. Verify Vercel deployment builds successfully
7. Performance validation: measure total asset size, largest file, picker load

## Architecture

### Cleanup Checklist

```
DELETE:
  src/data/background-presets.ts
  public/backgrounds/travelling.jpg (and 2-9)
  public/backgrounds/landscape-cartoon.jpg
  public/backgrounds/study_1.jpg
  public/backgrounds/cafe_1.jpeg
  public/backgrounds/xmas/ (entire directory)
  public/backgrounds/new/ (entire directory)

KEEP:
  backgrounds-source/              (committed source images)
  public/backgrounds/full/         (gitignored build output)
  public/backgrounds/thumb/        (gitignored build output)
  public/backgrounds/day.mp4       (gitignored, copied by build)
  public/backgrounds/night.mp4     (gitignored, copied by build)
  public/backgrounds/manifest.json (gitignored, generated)
  scripts/optimize-backgrounds.mjs (committed)
```

### Import Migration

Files that import `background-presets`:

| File | Current Import | New Import |
|------|---------------|------------|
| `src/components/settings/background-settings.tsx` | `import { backgroundPresets } from '@/data/background-presets'` | `import { backgroundPacks, findImageById } from '@/data/background-packs'` |

Verify no other files reference `background-presets` via grep.

## Related Code Files

| File | Action |
|------|--------|
| `src/data/background-presets.ts` | DELETE |
| `src/data/background-packs.ts` | Verify complete |
| `src/data/background-migration.ts` | Verify complete |
| `src/lib/format-detection.ts` | Verify complete |
| `src/contexts/background-context.tsx` | Verify migration works |
| `src/components/background/background-renderer.tsx` | Verify renders correctly |
| `src/components/settings/background-settings.tsx` | Verify pack tabs work |
| `src/i18n/locales/en.json` | Add pack keys |
| `src/i18n/locales/vi.json` | Add pack keys |
| `src/i18n/locales/ja.json` | Add pack keys |
| `package.json` | Verify `prebuild` script |
| `.gitignore` | Verify entries |
| `next.config.js` | May need `images.unoptimized` check |

## Implementation Steps

### 1. Remove deprecated `background-presets.ts`

Delete `src/data/background-presets.ts`. Run `grep -r "background-presets" src/` to find any remaining imports. Update them all.

### 2. Remove old image assets

```bash
# After verifying build output exists
rm public/backgrounds/travelling*.jpg
rm public/backgrounds/landscape-cartoon.jpg
rm public/backgrounds/study_1.jpg
rm public/backgrounds/cafe_1.jpeg
rm -rf public/backgrounds/xmas/
rm -rf public/backgrounds/new/
```

These files are now in `backgrounds-source/` and optimized output is generated at build time.

### 3. Add i18n keys for pack names

**English (`en.json`):**
```json
"packs": {
  "system": "System",
  "lofiVideo": "Lofi",
  "travelling": "Travel",
  "classic": "Classic",
  "cyberpunk": "Cyber",
  "animeCozy": "Anime",
  "fantasy": "Fantasy"
}
```

**Vietnamese (`vi.json`):**
```json
"packs": {
  "system": "He thong",
  "lofiVideo": "Lofi",
  "travelling": "Du lich",
  "classic": "Co dien",
  "cyberpunk": "Cyber",
  "animeCozy": "Anime",
  "fantasy": "Huyen ao"
}
```

**Japanese (`ja.json`):**
```json
"packs": {
  "system": "System",
  "lofiVideo": "Lofi",
  "travelling": "Travel",
  "classic": "Classic",
  "cyberpunk": "Cyber",
  "animeCozy": "Anime",
  "fantasy": "Fantasy"
}
```

Note: Vietnamese translations above are placeholders -- native speaker should review. Japanese can use English loanwords for these categories.

### 4. Verify `next.config.js` image configuration

Check if `next.config.js` has `images` config. Since thumbnails use `next/image` with local paths, no `remotePatterns` needed. But verify `images.unoptimized` is NOT set to `true` (would bypass optimization).

### 5. End-to-end build test

```bash
# Clean slate
rm -rf public/backgrounds/full public/backgrounds/thumb public/backgrounds/manifest.json

# Run build (prebuild auto-runs optimize script)
npm run build

# Verify:
# 1. public/backgrounds/full/ has 54 files (27 AVIF + 27 WebP)
# 2. public/backgrounds/thumb/ has 27 WebP files
# 3. public/backgrounds/manifest.json exists
# 4. .next/ build succeeds
```

### 6. Verify Vercel deployment

Push to branch, create preview deployment. Check:
- Build logs show optimize script running
- Background images load correctly on preview URL
- Thumbnails load lazily in picker
- AVIF served on supported browsers (check Network tab)
- No 404s for image paths

### 7. Performance validation

| Metric | Before | Target | Measure |
|--------|--------|--------|---------|
| Total `public/backgrounds/` size | 95MB | <20MB | `du -sh public/backgrounds/` |
| Largest single file | 21MB | <500KB | `ls -lhS public/backgrounds/full/` |
| Picker thumbnail count on load | 27 | 2-9 | DevTools Network tab |
| Image format | JPG only | AVIF/WebP | DevTools Network `type` column |
| Background load time (LCP) | varies | <1s with preload | Lighthouse |

### 8. localStorage migration test

1. Set a background using old path format in localStorage: `{"type":"image","value":"/backgrounds/travelling.jpg","opacity":0.8,"blur":0,"brightness":100}`
2. Reload the app
3. Verify background renders correctly (migration converts path to ID)
4. Check localStorage: `value` should now be `travelling-1`

### 9. Cross-browser format detection test

| Browser | Expected format |
|---------|----------------|
| Chrome 100+ | AVIF |
| Firefox 93+ | AVIF |
| Safari 16+ | AVIF |
| Safari 14-15 | WebP |
| Edge 100+ | AVIF |
| Older browsers | WebP |

## Todo

- [ ] Delete `src/data/background-presets.ts`
- [ ] Remove old image files from `public/backgrounds/`
- [ ] Grep for remaining `background-presets` imports; fix all
- [ ] Add i18n pack name keys to en.json, vi.json, ja.json
- [ ] Check `next.config.js` images configuration
- [ ] Run `npm run build` end-to-end
- [ ] Test Vercel preview deployment
- [ ] Measure total output size (target <20MB)
- [ ] Test localStorage migration with old path values
- [ ] Test AVIF/WebP format detection across browsers
- [ ] Verify preload link in `<head>` for saved background
- [ ] Verify picker only loads active tab thumbnails

## Success Criteria

1. `npm run build` completes with zero errors
2. Vercel preview deployment works correctly
3. Total `public/backgrounds/` output < 20MB
4. No references to deleted `background-presets.ts` remain
5. All 31 backgrounds render correctly
6. Old localStorage values auto-migrate to new IDs
7. Picker loads only active pack thumbnails
8. AVIF served on supporting browsers, WebP on others

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Sharp fails on Vercel build | Low | High | Vercel ships sharp pre-built; test preview deploy early |
| Missed import reference causes build error | Low | Medium | Grep + TypeScript compiler catches missing imports |
| i18n translations inaccurate | Medium | Low | Placeholder translations; native speakers review later |
| Old users with cached paths see broken backgrounds | Low | High | Migration map covers all 31 presets; fallback to raw path |

## Security Considerations

- Removing old public assets reduces attack surface (fewer static files served)
- No new security concerns introduced

## Unresolved Questions

1. Should `backgrounds-source/` (95MB) use Git LFS to avoid bloating the repository? **Recommendation:** Not urgent for now. Add later if clone times become problematic.
2. Should `cafe_1.jpeg` be added to any pack or permanently excluded? It is currently unreferenced. **Recommendation:** Exclude -- add later if user requests it.

## Next Steps

After Phase 5, the background optimization system is complete. Future enhancements:
- Add Git LFS for source images if repo size is a concern
- Add more background packs (seasonal, user-contributed)
- Consider service worker caching for background images
- Add progressive loading (low-res placeholder -> full resolution)
