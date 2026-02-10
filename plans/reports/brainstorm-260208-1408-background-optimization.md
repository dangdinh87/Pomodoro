# Brainstorm: Background Image Optimization & Pack System

## Problem Statement

Current background system has critical performance issues:
- **95MB total** assets (folder `new/` alone = 88MB, largest file = 21MB)
- All JPG/JPEG — no modern formats (AVIF/WebP)
- No responsive sizing — full resolution always loaded
- Settings picker loads all thumbnails simultaneously
- Flat data structure — no categorization or pack system

## Current Architecture

```
background-presets.ts → flat array of 31 presets
  ↓
background-context.tsx → state management (type, value, opacity, blur, brightness)
  ↓
background-renderer.tsx → Image() preload → CSS background-image
  ↓
general-settings.tsx → background picker grid (loads all at once)
```

## User Decisions

| Decision | Choice |
|----------|--------|
| Hosting | Vercel (has Image Optimization API) |
| Image processing | Build-time convert (sharp) |
| Pack strategy | Theme/mood based |
| Picker UX | Tab per pack |

---

## Recommended Solution

### 1. Build-Time Image Pipeline

**Script**: `scripts/optimize-backgrounds.mjs` using `sharp`

**Process**:
```
backgrounds-source/         →  public/backgrounds/
  ├── travelling/*.jpg           ├── thumb/{id}.webp      (~20-40KB, 400w)
  ├── anime/*.jpg                ├── full/{id}.avif       (~100-300KB, 1920w)
  ├── cyberpunk/*.jpg            ├── full/{id}.webp       (~150-400KB, 1920w)
  └── ...                        ├── day.mp4
                                 ├── night.mp4
                                 └── manifest.json
```

**Key specs**:
- **Thumbnail**: 400px wide, WebP only, quality 60 → ~20-40KB each
- **Full display**: 1920px wide, AVIF (quality 65) + WebP (quality 75) → ~100-400KB each
- **Estimated total**: ~31 images × ~500KB avg = **~15MB** (down from 95MB = **~84% reduction**)
- Videos kept as-is (already small at ~1MB total)

**Why build-time over Vercel Image Optimization for backgrounds?**
- Background uses CSS `background-image`, not `<img>` — can't use `next/image`
- Build-time gives predictable sizes, no cold-start latency
- Thumbnails in picker CAN use `next/image` for extra optimization

### 2. Data Model Refactor

```ts
// background-packs.ts
interface BackgroundImage {
  id: string;
  nameKey: string;
  kind: 'system' | 'auto' | 'video' | 'image';
  thumb?: string;           // 400w WebP (picker only)
  sources?: {
    avif: string;           // 1920w AVIF
    webp: string;           // 1920w WebP fallback
  };
  value?: string;           // for system/auto/video types
}

interface BackgroundPack {
  id: string;
  nameKey: string;
  icon: string;             // emoji or icon
  items: BackgroundImage[];
}
```

**Packs (theme/mood)**:
| Pack | Items | Description |
|------|-------|-------------|
| `system` | 2 | Auto-color, Lofi auto |
| `lofi-video` | 2 | Day/Night chill videos |
| `travelling` | 9 | Travelling series |
| `classic` | 4 | Landscape, Cafe, Study, Xmas Shiba |
| `cyberpunk` | 5 | Night light, Futuristic cities, Cyber city |
| `anime-cozy` | 4 | Anime home interiors, Cozy room sunset |
| `fantasy` | 5 | Fantasy adventurers series |

Total: 7 packs, 31 items (same count, organized)

### 3. Format Detection & Loading

**Background renderer** needs format detection since CSS `background-image` can't use `<picture>`:

```ts
// Detect AVIF/WebP support once at app init
const formatSupport = {
  avif: false,
  webp: false,
};

async function detectFormats() {
  formatSupport.avif = await checkFormat('avif');
  formatSupport.webp = await checkFormat('webp');
}

function getBestSource(sources: { avif: string; webp: string }): string {
  if (formatSupport.avif) return sources.avif;
  if (formatSupport.webp) return sources.webp;
  return sources.webp; // WebP has 97%+ support, safe fallback
}
```

Simple, no over-engineering. Detect once, use everywhere.

### 4. Preload Strategy

- **On app load**: Preload the user's saved background with `<link rel="preload" as="image">`
- **On picker open**: Load only thumbnails of the active tab/pack
- **On background select**: Preload full image before switching (existing behavior, keep it)

### 5. Picker UI (Tab per Pack)

```
┌─────────────────────────────────────────┐
│ Background Settings                      │
├──────────────────────────────────────────┤
│ [System] [Lofi] [Travel] [Classic] ...   │  ← tabs
├──────────────────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│ │ 🌅│ │ 🌇│ │ 🏞️│ │ 🌄│ │ 🌃│         │  ← thumbnails
│ └───┘ └───┘ └───┘ └───┘ └───┘         │     (only active pack)
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐               │
│ │ 🌅│ │ 🌇│ │ 🏞️│ │ 🌄│               │
│ └───┘ └───┘ └───┘ └───┘               │
├──────────────────────────────────────────┤
│ Opacity: [======●===]  Blur: [●========] │
│ Brightness: [=====●====]                 │
└──────────────────────────────────────────┘
```

- Thumbnails use `next/image` with `loading="lazy"` + `sizes="200px"`
- Only render thumbnails for the active tab
- Inactive tab content unmounted (not hidden)

### 6. Migration Path

**Backward compatibility**: Current preset `value` field stores path like `/backgrounds/travelling.jpg`. After refactor, stored value format changes.

**Migration approach**:
- New presets use `id` field (e.g., `travelling-1`)
- `background-context.tsx` migration: map old paths → new IDs on first load
- One-time localStorage migration, same pattern as existing migration code

### 7. Build Script Integration

```json
// package.json
{
  "scripts": {
    "bg:optimize": "node scripts/optimize-backgrounds.mjs",
    "prebuild": "node scripts/optimize-backgrounds.mjs"
  }
}
```

- Script is idempotent: skips already-optimized images (check by hash/mtime)
- Dev: run manually when adding new backgrounds
- CI/Build: runs automatically before build
- `.gitignore` optimized output OR commit them (both valid; committing avoids CI dependency on sharp)

---

## Trade-offs Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Build-time sharp | Predictable, no runtime cost, works with CSS bg-image | Need script maintenance, CI dependency | **Chosen** |
| Vercel Image Opt | Zero config, auto format | Can't use with CSS bg-image, cold start | Rejected for bg, OK for thumbs |
| External CDN (Cloudinary) | Powerful transforms, no build step | External dependency, cost, latency | Over-kill for preset images |
| Runtime sharp API route | Dynamic, flexible | Server load, cold starts, complexity | Over-engineered |

## Implementation Estimate

| Phase | Scope |
|-------|-------|
| 1 | Build script (sharp pipeline) + source image restructure |
| 2 | Data model refactor (packs, sources, manifest) |
| 3 | Format detection + background-renderer update |
| 4 | Picker UI (tabs, lazy thumbnails, next/image) |
| 5 | Preload optimization + localStorage migration |

## Risks

- **Sharp as dev dependency**: adds ~30MB to node_modules but only used at build time
- **AVIF encoding speed**: slower than WebP; build script may take 1-2 min for 31 images
- **Source images in repo**: 95MB in `backgrounds-source/` — consider Git LFS if repo size is concern
- **Existing user settings**: need migration for stored background paths → new IDs

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Total asset size | 95MB | ~15MB |
| Largest single image | 21MB | ~400KB |
| Picker initial load | All 31 thumbs | 2-9 thumbs (active pack) |
| Format support | JPG only | AVIF + WebP |
| Image sizes | Original (up to 6000px+) | 1920px max |

## Open Questions

1. Commit optimized images to git or generate at build time only? (Committing = simpler CI, larger repo. Build-only = smaller repo, CI needs sharp)
2. Keep `backgrounds-source/` in same repo or separate? (95MB of source assets)
3. Want a "Custom" tab in picker for user-uploaded backgrounds? (Currently single-slot via separate UI)
