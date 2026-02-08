# Phase 2: Data Model & Pack System

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 1 (build script must exist to generate manifest)
- **Docs:** [Brainstorm](../reports/brainstorm-260208-1408-background-optimization.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-08 |
| Priority | P2 |
| Effort | 2h |
| Implementation | pending |
| Review | pending |

Replace flat `background-presets.ts` with pack-structured `background-packs.ts`. Add format detection utility. Add localStorage migration from old path-based values to new ID-based system.

## Key Insights

1. Current `backgroundPresets` is a flat array of 31 items with `{ nameKey, value, kind }`.
2. `value` field stores raw file paths (`/backgrounds/travelling.jpg`) or sentinel strings (`system:auto-color`, `lofi:auto`).
3. `background-context.tsx` stores `{ type, value, opacity, blur, brightness }` in localStorage key `background-settings`.
4. Migration must map old `value` (path) to new `id` on first load. One-time operation.
5. Format detection needed because CSS `background-image` can't use `<picture>` element. Must detect AVIF/WebP support once and pick best URL.

## Requirements

1. Define `BackgroundImage` and `BackgroundPack` TypeScript interfaces
2. Create `src/data/background-packs.ts` with 7 packs, 31 items
3. Create `src/lib/format-detection.ts` for AVIF/WebP browser support detection
4. Update `background-context.tsx` to:
   - Store background `id` instead of raw path in `value` field
   - Add migration logic for old path-based values
   - Resolve `id` -> best format URL using format detection
5. Keep backward compatibility during transition

## Architecture

### New Data Model

```typescript
// src/data/background-packs.ts

export interface BackgroundImage {
  id: string;                    // e.g., 'travelling-1'
  nameKey: string;               // i18n key
  kind: 'system' | 'auto' | 'video' | 'image';
  thumb?: string;                // '/backgrounds/thumb/travelling-1.webp'
  sources?: {
    avif: string;                // '/backgrounds/full/travelling-1.avif'
    webp: string;                // '/backgrounds/full/travelling-1.webp'
  };
  value?: string;                // sentinel for system/auto, video path for video
}

export interface BackgroundPack {
  id: string;                    // e.g., 'travelling'
  nameKey: string;               // i18n key for pack name
  icon: string;                  // emoji identifier
  items: BackgroundImage[];
}

export const backgroundPacks: BackgroundPack[];

// Flat lookup helper
export function findImageById(id: string): BackgroundImage | undefined;
export function getAllImages(): BackgroundImage[];
```

### Format Detection

```typescript
// src/lib/format-detection.ts

let _avifSupported: boolean | null = null;
let _webpSupported: boolean | null = null;

export async function detectFormatSupport(): Promise<void>;
export function isAvifSupported(): boolean;
export function isWebpSupported(): boolean;
export function getBestImageUrl(sources: { avif: string; webp: string }): string;
```

Detection uses 1x1 pixel test images (data URI). Run once at app init, cache result in module-level variables.

### Migration Map

```typescript
// src/data/background-migration.ts

export const PATH_TO_ID_MAP: Record<string, string> = {
  '/backgrounds/travelling.jpg': 'travelling-1',
  '/backgrounds/travelling2.jpg': 'travelling-2',
  // ... all 27 image paths
  '/backgrounds/new/night_light.jpg': 'night-light',
  // ... etc
  'system:auto-color': 'system-auto-color',
  'lofi:auto': 'lofi-auto',
  '/backgrounds/day.mp4': 'day-chill',
  '/backgrounds/night.mp4': 'night-chill',
};
```

## Related Code Files

| File | Action |
|------|--------|
| `src/data/background-presets.ts` | Deprecated, replaced by `background-packs.ts` |
| `src/data/background-packs.ts` | **New** -- pack definitions |
| `src/data/background-migration.ts` | **New** -- old path -> new ID mapping |
| `src/lib/format-detection.ts` | **New** -- AVIF/WebP detection |
| `src/contexts/background-context.tsx` | Update -- migration + ID-based resolution |
| `src/components/settings/background-settings.tsx` | Import change (presets -> packs) |

## Pack Definitions

### Pack 1: System (`system`)
| ID | Kind | Value/Sentinel |
|----|------|---------------|
| system-auto-color | system | `system:auto-color` |
| lofi-auto | auto | `lofi:auto` |

### Pack 2: Lofi Video (`lofi-video`)
| ID | Kind | Value |
|----|------|-------|
| day-chill | video | `/backgrounds/day.mp4` |
| night-chill | video | `/backgrounds/night.mp4` |

### Pack 3: Travelling (`travelling`)
| ID | Kind |
|----|------|
| travelling-1 | image |
| travelling-2 | image |
| travelling-3 | image |
| travelling-4 | image |
| travelling-5 | image |
| travelling-6 | image |
| travelling-7 | image |
| travelling-8 | image |
| travelling-9 | image |

### Pack 4: Classic (`classic`)
| ID | Kind |
|----|------|
| landscape-cartoon | image |
| chill-shiba | image |
| study-desk | image |

### Pack 5: Cyberpunk (`cyberpunk`)
| ID | Kind |
|----|------|
| night-light | image |
| cyberpunk-scene-1 | image |
| cyberpunk-scene-2 | image |
| futuristic-city-abstract | image |
| cyber-city | image |
| futuristic-city-night | image |

### Pack 6: Anime & Cozy (`anime-cozy`)
| ID | Kind |
|----|------|
| anime-cozy-home-1 | image |
| anime-cozy-home-2 | image |
| cozy-anime-interior | image |
| cozy-room-sunset | image |

### Pack 7: Fantasy (`fantasy`)
| ID | Kind |
|----|------|
| fantasy-adventurers-1 | image |
| fantasy-adventurers-2 | image |
| fantasy-adventurers-3 | image |
| fantasy-adventurers-4 | image |
| fantasy-adventurers-5 | image |

**Total: 7 packs, 31 items**

## Implementation Steps

### 1. Create `src/lib/format-detection.ts`

```typescript
const AVIF_TEST = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAEOAAEAAAAAAAABGAAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAATmVwcm9wAAAAMGlwY28AAAAUaXNwZQAAAAAAAAACAAAAAgAAABBwaXhpAAAAAAMICAgAAAAJaXBtYQAAAAAAAAABAAEEAQKDBAAAABltZGF0EgAKBzgABokSJGfC8EBQ2A==';
const WEBP_TEST = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

let _avif: boolean | null = null;
let _webp: boolean | null = null;

function testFormat(dataUri: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = dataUri;
  });
}

export async function detectFormatSupport(): Promise<void> {
  if (_avif !== null) return; // already detected
  [_avif, _webp] = await Promise.all([testFormat(AVIF_TEST), testFormat(WEBP_TEST)]);
}

export function isAvifSupported(): boolean { return _avif ?? false; }
export function isWebpSupported(): boolean { return _webp ?? false; }

export function getBestImageUrl(sources: { avif: string; webp: string }): string {
  if (_avif) return sources.avif;
  return sources.webp; // WebP has 97%+ support, safe default
}
```

### 2. Create `src/data/background-packs.ts`

Define all 7 packs as a const array. Each image item with kind `image` references paths following the convention:
- `thumb`: `/backgrounds/thumb/{id}.webp`
- `sources.avif`: `/backgrounds/full/{id}.avif`
- `sources.webp`: `/backgrounds/full/{id}.webp`

System/auto/video items retain their sentinel `value` field and have no `thumb`/`sources`.

Export helper functions:
- `findImageById(id)` -- flat search across all packs
- `getAllImages()` -- flat array of all items
- `getPackById(id)` -- find pack by ID

### 3. Create `src/data/background-migration.ts`

A simple `Record<string, string>` mapping every old `value` string to the new `id`. Used by context on first load.

### 4. Update `src/contexts/background-context.tsx`

Modify `migrateBackground()` function:

```typescript
import { PATH_TO_ID_MAP } from '@/data/background-migration';
import { findImageById } from '@/data/background-packs';

const migrateBackground = (bg: BackgroundSettings): BackgroundSettings => {
  // Existing migrations (none, random) ...

  // New: migrate old path-based value to ID
  if (bg.type === 'image' && bg.value && !findImageById(bg.value)) {
    const newId = PATH_TO_ID_MAP[bg.value];
    if (newId) {
      return { ...bg, value: newId };
    }
  }

  return bg;
};
```

After migration, `value` stores the image ID (e.g., `travelling-1`) instead of the file path.

### 5. Call format detection at app init

In `BackgroundProvider`, call `detectFormatSupport()` in the mount `useEffect`. Non-blocking -- renderer waits for detection before resolving image URLs.

### 6. Deprecate `background-presets.ts`

Keep file temporarily with a `@deprecated` JSDoc comment. Remove in Phase 5 after all consumers migrated.

## Todo

- [ ] Create `src/lib/format-detection.ts` with AVIF/WebP detection
- [ ] Create `src/data/background-packs.ts` with 7 packs
- [ ] Create `src/data/background-migration.ts` with path-to-ID map
- [ ] Update `background-context.tsx` migration logic
- [ ] Add `detectFormatSupport()` call to `BackgroundProvider` mount
- [ ] Add `@deprecated` to `background-presets.ts`
- [ ] Update existing imports from presets -> packs where needed
- [ ] Add i18n keys for pack names (en.json, vi.json, ja.json)

## Success Criteria

1. `BackgroundPack[]` contains exactly 7 packs and 31 items
2. `findImageById('travelling-1')` returns correct image data
3. Format detection resolves AVIF on supported browsers, WebP elsewhere
4. Existing users with old path values (`/backgrounds/travelling.jpg`) auto-migrate to `travelling-1`
5. No runtime errors after migration

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration misses an old path | Low | Medium | PATH_TO_ID_MAP covers all 31 presets; test each |
| Format detection race condition | Low | Low | Renderer waits for detection before resolving |
| Custom image URLs (from use-custom-backgrounds) wrongly migrated | Low | Medium | Migration only applies when `findImageById()` fails AND path exists in map |

## Security Considerations

- No network requests for format detection (uses data URIs)
- Migration is read-only on localStorage, write-once update

## Unresolved Questions

1. Should `BackgroundSettings.value` store the full resolved URL or just the ID? **Recommendation:** Store ID only. Resolve to URL at render time using format detection. This makes the stored value format-agnostic and future-proof.

## Next Steps

Phase 3 updates `background-renderer.tsx` to resolve IDs to URLs using the new data model and format detection.
