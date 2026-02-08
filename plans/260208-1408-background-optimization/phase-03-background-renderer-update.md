# Phase 3: Background Renderer Update

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 2 (data model + format detection must exist)
- **Docs:** [Scout](../reports/scout-260208-1408-background-implementation.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-08 |
| Priority | P2 |
| Effort | 1.5h |
| Implementation | pending |
| Review | pending |

Update `background-renderer.tsx` to resolve image IDs to best-format URLs using the data model from Phase 2. Add `<link rel="preload">` for the user's saved background. Keep all existing visual behavior (fade transition, opacity, blur, brightness).

## Key Insights

1. Current renderer uses `background.value` directly as URL in `background-image: url(...)`.
2. After Phase 2, `background.value` stores an ID (e.g., `travelling-1`) for image-type backgrounds.
3. Renderer must resolve ID -> `BackgroundImage` -> best format URL (AVIF if supported, WebP fallback).
4. System/auto/video types continue using sentinel values as-is.
5. Preloading: inject `<link rel="preload" as="image" href="..." type="image/avif">` in `<head>` on mount for instant display.

## Requirements

1. Resolve image ID to full URL via `findImageById()` + `getBestImageUrl()`
2. Keep existing rendering logic for solid, gradient, none types unchanged
3. Keep existing video rendering unchanged (mp4 path in value)
4. Add preload link for user's saved background image
5. Handle edge case: custom images (user-uploaded) still use raw URLs -- no ID resolution needed
6. Ensure fade transition (800ms) still works with new URL resolution

## Architecture

### Resolution Flow

```
background.value (ID: 'travelling-1')
  ↓
findImageById('travelling-1')
  ↓
BackgroundImage { sources: { avif: '...', webp: '...' } }
  ↓
getBestImageUrl(sources) → '/backgrounds/full/travelling-1.avif'
  ↓
CSS: background-image: url('/backgrounds/full/travelling-1.avif')
```

### Preload Strategy

```tsx
// In BackgroundRenderer or a dedicated PreloadHead component
useEffect(() => {
  if (resolvedSrc && background.type === 'image' && !isVideo) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = resolvedSrc;
    // Set type hint for AVIF to help browser prioritize
    if (resolvedSrc.endsWith('.avif')) link.type = 'image/avif';
    else if (resolvedSrc.endsWith('.webp')) link.type = 'image/webp';
    document.head.appendChild(link);

    return () => { document.head.removeChild(link); };
  }
}, [resolvedSrc]);
```

## Related Code Files

| File | Action |
|------|--------|
| `src/components/background/background-renderer.tsx` | Update -- ID resolution + preload |
| `src/lib/format-detection.ts` | Import `getBestImageUrl` |
| `src/data/background-packs.ts` | Import `findImageById` |

## Implementation Steps

### 1. Add URL resolution helper

Create a helper function in `background-renderer.tsx` (or extract to a utility) that resolves `background.value` to a displayable URL:

```typescript
import { findImageById } from '@/data/background-packs';
import { getBestImageUrl } from '@/lib/format-detection';

function resolveBackgroundUrl(value: string): string {
  // Sentinel values pass through
  if (value === 'lofi:auto' || value.startsWith('system:')) return value;

  // Video paths pass through
  if (value.endsWith('.mp4')) return value;

  // Custom images (data URLs or http URLs) pass through
  if (value.startsWith('data:') || value.startsWith('http')) return value;

  // Old-style paths (shouldn't happen after migration, but safety fallback)
  if (value.startsWith('/backgrounds/')) return value;

  // ID-based resolution
  const image = findImageById(value);
  if (image?.sources) {
    return getBestImageUrl(image.sources);
  }

  // Fallback: return as-is
  return value;
}
```

### 2. Update `resolvedSrc` useMemo

Replace direct `background.value` usage with the resolver:

```typescript
const resolvedSrc = useMemo(() => {
  if (background.value === 'lofi:auto') {
    return resolvedTheme === 'dark'
      ? '/backgrounds/night.mp4'
      : '/backgrounds/day.mp4';
  }
  return resolveBackgroundUrl(background.value);
}, [background.value, resolvedTheme]);
```

### 3. Add preload link effect

Add a `useEffect` that injects a `<link rel="preload">` element for the resolved image URL. Clean up on unmount or URL change.

### 4. Keep all existing behavior

No changes to:
- Video rendering (`<video>` element with autoPlay, muted, etc.)
- Solid/gradient/none rendering
- Opacity, blur, brightness CSS filters
- 800ms fade transition
- Timer page only rendering (`isTimerPage` check)
- `Image()` constructor preload for fade-in timing

### 5. Handle format detection timing

Format detection is async (Phase 2 calls it on mount). If renderer mounts before detection completes, `getBestImageUrl()` returns WebP as default. This is acceptable -- WebP is the safe fallback. Once detection completes, the component re-renders are NOT needed (detection runs once at app init before any background loads).

Ensure `detectFormatSupport()` is called in `BackgroundProvider` useEffect BEFORE setting `isLoading = false`. This guarantees format detection completes before renderer tries to resolve URLs.

## Todo

- [ ] Create `resolveBackgroundUrl()` helper function
- [ ] Update `resolvedSrc` useMemo to use resolver
- [ ] Add preload link injection useEffect
- [ ] Verify fade transition still works with AVIF/WebP URLs
- [ ] Test: system auto-color renders correctly
- [ ] Test: lofi auto resolves to correct video
- [ ] Test: image ID resolves to AVIF on supported browsers
- [ ] Test: custom uploaded images still work (data URL / http URL)
- [ ] Test: preload link appears in `<head>`

## Success Criteria

1. Background images render correctly using AVIF or WebP based on browser support
2. Preload link visible in `<head>` for the active background image
3. All existing visual effects (fade, opacity, blur, brightness) work as before
4. System/auto/video/custom types render unchanged
5. No flash of unstyled content (FOUC) -- preload prevents visible loading delay

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Format detection not ready when renderer first resolves | Low | Low | WebP fallback is acceptable; detection runs before isLoading=false |
| Preload link causes double download | Low | Low | Browser deduplicates identical URLs between preload and background-image |
| Custom images (data URLs) matched by resolver | Low | Medium | Explicit check for data: and http: prefixes to pass through |

## Security Considerations

- Preload link only references same-origin paths (`/backgrounds/...`)
- No XSS risk from `background-image: url(...)` -- value is always from controlled preset data or user's own data URL

## Next Steps

Phase 4 updates the picker UI to use tab-based pack navigation with lazy-loaded thumbnails.
