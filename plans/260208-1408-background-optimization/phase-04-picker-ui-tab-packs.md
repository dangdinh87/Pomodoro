# Phase 4: Picker UI - Tab Pack System

## Context

- **Parent plan:** [plan.md](./plan.md)
- **Dependencies:** Phase 2 (data model), Phase 3 (renderer accepts IDs)
- **Docs:** [Brainstorm](../reports/brainstorm-260208-1408-background-optimization.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-08 |
| Priority | P2 |
| Effort | 2h |
| Implementation | pending |
| Review | pending |

Refactor `background-settings.tsx` to use pack-based tabs. One tab per pack (7 packs). Only render thumbnails for the active tab -- inactive tab content is unmounted, not hidden. Use `next/image` for thumbnails for automatic optimization.

## Key Insights

1. Current UI has 2 tabs: "System" (all 31 presets) and "Personal" (custom upload). All 27 image thumbnails load as full-resolution `<img>` tags simultaneously.
2. New UI: 7+ tabs (7 packs + Personal). Each pack tab renders only its items. Inactive tabs unmounted.
3. `@radix-ui/react-tabs` already in dependencies -- used by current `background-settings.tsx`.
4. Thumbnails should use `next/image` with `loading="lazy"` and explicit `sizes="200px"` for Vercel optimization (thumbs are static WebP files).
5. Personal tab (custom upload) behavior unchanged.
6. Current modal is 1000px wide, 85vh height. Grid layout 12-col (8 left, 4 right).
7. Tab row may overflow horizontally with 8 tabs -- need horizontal scroll or condensed tab labels.

## Requirements

1. Replace 2-tab system with pack-based tabs (7 packs + 1 Personal tab)
2. Each pack tab renders only that pack's items as thumbnail grid
3. Inactive tab content unmounted (not `display:none`)
4. Thumbnails use `next/image` with `loading="lazy"` + `sizes="200px"`
5. Thumbnail `src` = `/backgrounds/thumb/{id}.webp` (400px WebP)
6. Selection sets `styleValue` to image `id` (not path)
7. System + Lofi Video packs have special rendering (no image thumbnails)
8. Keep all existing slider controls (opacity, brightness, blur) in right panel
9. Tab row scrollable horizontally on overflow

## Architecture

### Tab Layout

```
┌──────────────────────────────────────────────────┐
│ Background Settings              [Reset] [Save] X│
├──────────────────────────────────────────────────┤
│ [System][Lofi][Travel][Classic][Cyber][Anime][Fan]│ ← scrollable tabs
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─[Personal]│
├──────────────────────────────────┬────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐        │ Opacity: 80%  │
│ │   │ │   │ │   │ │   │        │ [======●===]   │
│ └───┘ └───┘ └───┘ └───┘        │                │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │ Brightness:100%│
│ │   │ │   │ │   │ │   │ │   │ │ [=====●====]   │
│ └───┘ └───┘ └───┘ └───┘ └───┘ │                │
│  (only active pack thumbnails)  │ Blur: 0px      │
│                                 │ [●========]    │
└─────────────────────────────────┴────────────────┘
```

### Pack Tab Icons

| Pack | Icon | Label Key |
|------|------|-----------|
| system | `Monitor` (lucide) | `settings.background.packs.system` |
| lofi-video | `Film` (lucide) | `settings.background.packs.lofiVideo` |
| travelling | `Globe` (lucide) | `settings.background.packs.travelling` |
| classic | `Image` (lucide) | `settings.background.packs.classic` |
| cyberpunk | `Zap` (lucide) | `settings.background.packs.cyberpunk` |
| anime-cozy | `Heart` (lucide) | `settings.background.packs.animeCozy` |
| fantasy | `Sword` (lucide) | `settings.background.packs.fantasy` |
| personal | `FolderHeart` (lucide) | `settings.background.tabs.personal` |

### Thumbnail Component

```tsx
import Image from 'next/image';

function PackThumbnail({ image, selected, onSelect }: {
  image: BackgroundImage;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105
        ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
      onClick={() => onSelect(image.id)}
    >
      {image.thumb && (
        <Image
          src={image.thumb}
          alt={t(image.nameKey)}
          fill
          sizes="200px"
          loading="lazy"
          className="object-cover"
        />
      )}
      {selected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
          <Check className="h-3 w-3" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1.5 text-center font-medium">
        {t(image.nameKey)}
      </div>
    </button>
  );
}
```

## Related Code Files

| File | Action |
|------|--------|
| `src/components/settings/background-settings.tsx` | Major refactor -- pack tabs, next/image thumbs |
| `src/data/background-packs.ts` | Import packs data |
| `src/i18n/locales/en.json` | Add pack name keys |
| `src/i18n/locales/vi.json` | Add pack name keys |
| `src/i18n/locales/ja.json` | Add pack name keys |

## Implementation Steps

### 1. Update tab structure

Replace current 2-tab (`system`/`personal`) Tabs component with dynamic tabs from `backgroundPacks`:

```tsx
import { backgroundPacks } from '@/data/background-packs';

<Tabs defaultValue={backgroundPacks[0].id} className="w-full">
  <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto flex-nowrap">
    {backgroundPacks.map((pack) => (
      <TabsTrigger key={pack.id} value={pack.id} className="...">
        <PackIcon packId={pack.id} className="h-4 w-4" />
        {t(pack.nameKey)}
      </TabsTrigger>
    ))}
    <TabsTrigger value="personal" className="...">
      <FolderHeart className="h-4 w-4" />
      {t('settings.background.tabs.personal')}
    </TabsTrigger>
  </TabsList>

  {backgroundPacks.map((pack) => (
    <TabsContent key={pack.id} value={pack.id} forceMount={false}>
      <PackGrid pack={pack} selectedId={styleValue} onSelect={setStyleValue} />
    </TabsContent>
  ))}

  <TabsContent value="personal" forceMount={false}>
    {/* existing personal tab content unchanged */}
  </TabsContent>
</Tabs>
```

Key: `forceMount={false}` (or simply omitting it, since Radix unmounts inactive by default) ensures inactive tab content is removed from DOM.

### 2. Create `PackGrid` component

Renders the thumbnail grid for a single pack. Handles special rendering for system/auto/video kind items:

- `kind === 'system'`: Render color circle (existing behavior)
- `kind === 'auto'`: Render split video preview (existing behavior)
- `kind === 'video'`: Render `<video>` preview with `preload="metadata"`
- `kind === 'image'`: Render `next/image` thumbnail

### 3. Update `styleValue` to use IDs

Currently `setStyleValue(p.value)` sets path. Change to `setStyleValue(image.id)`.

Update `buildBackground()`:
```typescript
const buildBackground = () => {
  if (styleValue === 'system-auto-color') {
    return { ...background, type: 'solid', value: 'system:auto-color', ... };
  }
  // For all other types, store the ID as value
  return { ...background, type: 'image', value: styleValue, ... };
};
```

Wait -- context migration already handles this. The stored `value` in localStorage will be the ID. The renderer (Phase 3) resolves ID -> URL. So `buildBackground()` just stores the ID in `value`.

Actually, revisiting: `system:auto-color` is both the sentinel AND the ID (`system-auto-color` with hyphen). Need to decide: store sentinel or ID?

**Decision:** Store the ID everywhere. System items have `value: 'system:auto-color'` sentinel in their definition. The renderer checks for the sentinel. In background-settings, when building the persist object, use the item's `value` field for system/auto types:

```typescript
const buildBackground = () => {
  const image = findImageById(styleValue);
  if (image?.kind === 'system') {
    return { type: 'solid', value: image.value!, opacity: 1, blur: 0, brightness: 100 };
  }
  // Store image ID for all other types
  return { type: 'image', value: styleValue, opacity: opacity / 100, blur: 0, brightness };
};
```

### 4. Make TabsList horizontally scrollable

With 8 tabs, overflow is likely on narrow modal widths. Add `overflow-x-auto` and `flex-nowrap` to TabsList. Use compact labels (e.g., "Travel" not "Travelling", "Anime" not "Anime & Cozy").

### 5. Add i18n keys for pack names

Add to `en.json`, `vi.json`, `ja.json`:

```json
"settings": {
  "background": {
    "packs": {
      "system": "System",
      "lofiVideo": "Lofi",
      "travelling": "Travel",
      "classic": "Classic",
      "cyberpunk": "Cyber",
      "animeCozy": "Anime",
      "fantasy": "Fantasy"
    }
  }
}
```

### 6. Determine active tab from current selection

When the picker opens, auto-select the tab containing the user's current background. Find which pack contains `styleValue`:

```typescript
const activePackId = backgroundPacks.find(p =>
  p.items.some(i => i.id === styleValue)
)?.id || backgroundPacks[0].id;
```

Use this as `defaultValue` for `Tabs`.

## Todo

- [ ] Refactor `background-settings.tsx` tab structure to dynamic pack tabs
- [ ] Create `PackGrid` component for rendering pack thumbnails
- [ ] Create `PackThumbnail` component using `next/image`
- [ ] Update `styleValue` to use image IDs instead of paths
- [ ] Update `buildBackground()` to handle ID-based selection
- [ ] Make TabsList horizontally scrollable
- [ ] Add i18n keys for pack names (en, vi, ja)
- [ ] Auto-select tab matching user's current background
- [ ] Test: switching tabs unmounts previous tab thumbnails
- [ ] Test: selecting image in a pack stores correct ID
- [ ] Test: personal tab still works for custom uploads

## Success Criteria

1. 7 pack tabs + 1 Personal tab render in the picker
2. Only active tab's thumbnails are in the DOM (verify via DevTools)
3. Thumbnails use `next/image` with lazy loading
4. Tab for user's current background is auto-selected on open
5. All 31 presets accessible and selectable across the 7 packs
6. Personal tab custom upload/URL functionality unchanged
7. Slider controls (opacity, brightness, blur) still work

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| 8 tabs overflow on small screens | High | Medium | Horizontal scroll on TabsList; compact labels |
| next/image requires width/height or fill | Low | Low | Use `fill` prop with relative container |
| Tab switching feels slow if thumbnails re-mount | Low | Low | Thumbnails are 400px WebP (~20-40KB) -- loads fast |
| Radix Tabs forceMount default behavior changes | Low | Low | Explicitly set `forceMount={false}` or verify unmount |

## Security Considerations

- `next/image` validates image sources against `next.config.js` `images.remotePatterns` -- our images are local (`/backgrounds/...`), no config needed
- Custom image URLs from Personal tab are user-provided -- existing validation in `use-custom-backgrounds.ts` handles this

## Unresolved Questions

1. Should the system pack and lofi-video pack be merged into one "System" tab? Currently brainstorm says separate. Merging would reduce tab count from 8 to 7. **Recommendation:** Keep separate for clarity, but can be revisited based on user feedback.

## Next Steps

Phase 5 handles integration testing, cleanup of old files, and Vercel deployment verification.
