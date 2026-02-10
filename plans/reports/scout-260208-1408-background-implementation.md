# Background Image/Preset Implementation Scout Report

**Date:** 2026-02-08  
**Scope:** Current background image/preset implementation analysis  
**Total Background Directory Size:** 95 MB

---

## 1. Data Structure for Background Presets

### `src/data/background-presets.ts`
The main data source containing 31 preset background options with consistent structure:

```typescript
interface BackgroundPreset {
  nameKey: string;        // i18n translation key
  value: string;          // URL path or sentinel value
  kind: 'system' | 'auto' | 'video' | 'image'
}
```

#### Preset Categories:

**System/Auto (2):**
- `system:auto-color` - Uses CSS variable `hsl(var(--background))`
- `lofi:auto` - Resolves to day.mp4 (light) or night.mp4 (dark) based on theme

**Videos (2):**
- `/backgrounds/day.mp4` (936 KB)
- `/backgrounds/night.mp4` (492 KB)

**Static Images (27):**
- **Travelling series** (9 images): `/backgrounds/travelling.jpg` → `travelling9.jpg`
  - Sizes: 108 KB - 299 KB (compact series)
- **Classic/themed** (4 images):
  - `landscape-cartoon.jpg` (1.0 MB)
  - `study_1.jpg` (2.0 MB)
  - `chill-shiba-sleeping-christmas-room.jpg` (297 KB, xmas folder)
  - `night_light.jpg` (1.1 MB)
- **New/AI-generated** (14 images in `/backgrounds/new/`):
  - Small: `2151176471.jpg` (2.4 MB), `2151470662.jpg` (2.2 MB)
  - Medium: Futuristic city (5.5 MB), cyber city (5.8 MB)
  - Large: Abstract city (21 MB), anime cozy home (9.1 MB), cozy room (8.9 MB)
  - Multiple adventure variants (2-4 MB range)

---

## 2. Background Context & State Management

### `src/contexts/background-context.tsx`

**BackgroundSettings Interface:**
```typescript
{
  type: 'none' | 'solid' | 'image' | 'gradient' | 'random'
  value: string                      // color, URL, or CSS gradient
  opacity: number                    // 0-1 range
  blur: number                       // 0-20px
  brightness: number                 // 0-200%
}
```

**Default State:**
- Type: `solid`
- Value: `hsl(var(--background))` (theme color)
- Opacity: 1
- Blur: 0
- Brightness: 100%

**Storage:** localStorage key `background-settings` (JSON serialized)

**Performance Features:**
- Device-aware defaults: Detects slow connections (`effectiveType: 2g/slow-2g`) and low-end devices (`deviceMemory <= 4GB`)
- Lightweight background auto-selection for resource-constrained environments
- Automatic migration of broken/old configs to safe defaults

**Public API Methods:**
- `setBackground()` - Persist full settings
- `setBackgroundTemp()` - Preview without persistence
- `setBackgroundColor()` - Quick color switch
- `setBackgroundImage()` - Set image with opacity/blur/brightness
- `setGradientBackground()` - CSS gradient support
- `setBackgroundType()` - Type-only change

---

## 3. Image Loading & Display

### `src/components/background/background-renderer.tsx`

**Rendering Logic:**
- Only renders on `/timer` page (pathname check)
- Returns `null` on other pages (lets theme background show)
- Conditional rendering based on background type

**Video Handling:**
- Detected by `.mp4` extension check
- Rendered as `<video>` element with:
  - `autoPlay`, `muted`, `playsInline`, `loop`
  - Fixed positioning (z-index: -10)
  - Smooth 800ms fade-in transition
  - `preload="metadata"` in settings preview

**Image Handling:**
- Pre-loads using native `Image()` constructor
- Tracks load state with cleanup on unmount
- Prevents memory leaks (tracks `isMounted` flag)
- Graceful error handling (treats errors like success to prevent blocking)
- Applied filters: `blur()` and `brightness()`

**CSS Properties Applied:**
- Fixed positioning: `position: fixed`, `inset-0`, full w/h
- Object fit: `backgroundSize: cover`, `backgroundPosition: center`
- z-index: -10 (behind content)
- Opacity fade: 0 → target opacity over 800ms
- Filter: CSS filter with blur + brightness values

**Theme Resolution:**
- Auto-detects system theme preference if `currentTheme === 'system'`
- Dynamically resolves `lofi:auto` to day/night video based on theme

---

## 4. Custom Background Support

### `src/hooks/use-custom-backgrounds.ts`

**Features:**
- Single-slot custom image storage (replacement mode)
- File upload support (max 2 MB per file)
- URL-based image adding (http/https only)
- Base64 encoding for local files
- Direct URL storage for remote images

**Storage:** localStorage key `custom-background-images` (JSON array)

**Max Limits:**
- File size: 2 MB
- Quantity: 1 image (replaceable)
- Formats: Any MIME type starting with `image/`

**API:**
```typescript
{
  images: CustomImage[]
  isLoading: boolean
  addImage(file: File)
  addImageByUrl(url: string)
  removeImage(id: string)
  canAddMore: boolean
}
```

---

## 5. UI Components

### `src/components/settings/background-settings.tsx` (Main Settings Panel)

**Layout:** Two-column split view
- **Left (col-span-8):** Scrollable tabs with preset selection
- **Right (col-span-4):** Fixed slider controls

**Tabs:**
1. **System Tab:**
   - System auto-color (single option)
   - Video backgrounds (lofi:auto + raw day/night)
   - Image presets (27 static images)
   
2. **Personal Tab:**
   - URL input with validation
   - File upload with drag-drop ready
   - Single custom image preview (aspect-video)
   - Replacement notice

**Sliders (Right Panel):**
- Opacity: 10-100% (disabled for system:auto-color)
- Brightness: 0-200% (disabled for system:auto-color)
- Blur: 0-20px (disabled for system:auto-color)

**Live Preview:**
- `setBackgroundTemp()` on slider drag
- Real-time visual feedback
- Persists on "Save Changes" button

**UX Features:**
- Hover scale effect on preset buttons
- Active selection indicator (border + ring)
- Slider drag state tracking (`draggedSlider`)
- Header/content opacity transitions during drag
- Toast notifications (success/error)
- i18n support for all text

### `src/components/settings/background-settings-modal.tsx`
- Dialog wrapper with max-width 1000px, height 85vh
- Transparent overlay during drag
- No gap/padding (custom layout)

---

## 6. File System Structure

### Directory Layout:
```
public/backgrounds/
├── day.mp4                    (936 KB)
├── night.mp4                  (492 KB)
├── landscape-cartoon.jpg      (1.0 MB)
├── study_1.jpg                (2.0 MB)
├── travelling.jpg → travelling9.jpg (108-299 KB each)
├── xmas/
│   └── chill-shiba-sleeping-christmas-room.jpg (297 KB)
└── new/
    ├── night_light.jpg        (1.1 MB)
    ├── 2151176471.jpg         (2.4 MB)
    ├── 2151470662.jpg         (2.2 MB)
    ├── abstract-futuristic-city-*.jpg (21 MB) ← LARGEST
    ├── anime-style-cozy-home-*.jpg (9.1 MB)
    ├── building-house-*.jpg   (5.8 MB)
    ├── cozy-home-interior-anime-style.jpg (8.9 MB)
    ├── cozy-room-with-sunset-student.jpg (7.2 MB)
    ├── fantasy-group-adventurers*.jpg (2.1-2.4 MB)
    └── futuristic-city-skyline-*.jpg (5.5 MB)

Total: 95 MB
```

**File Format Distribution:**
- JPG: 24 images (main format)
- MP4: 2 videos
- Unused: `cafe_1.jpeg` (not referenced in presets)

---

## 7. Current Optimization & Performance

### Lazy Loading:
- **Images:** Preloaded via `Image()` constructor before display
- **Videos:** Preload="metadata" (headers only, not full video)
- **Conditional Rendering:** Only on `/timer` page

### Memory Management:
- Image load event listeners cleaned up on unmount
- `isMounted` flag prevents state updates after unmount
- Single custom image stored (not accumulating)

### Browser Features Utilized:
- LocalStorage for persistence (JSON serialization)
- Lightweight mode detection (navigator.connection, deviceMemory)
- System theme preference detection (prefers-color-scheme media query)
- CSS filter properties (GPU-accelerated blur/brightness)

### No Current Optimization:
- ❌ No WebP/AVIF format variants
- ❌ No responsive image sizes (srcset)
- ❌ No image compression/resizing
- ❌ Large images (21 MB) loaded at full resolution
- ❌ No progressive loading
- ❌ No caching headers specified
- ❌ No image CDN integration
- ❌ Travelling series (small files) could use more aggressive compression

---

## 8. Integration Points

**Used In:**
- `src/components/providers/app-providers.tsx` - Mounted at root level
- `src/components/settings/background-settings.tsx` - Settings UI
- `src/components/settings/background-settings-modal.tsx` - Modal wrapper
- Theme/branding pages reference backgrounds

**Related Config:**
- `src/config/themes.ts` - Theme colors (affects background default)
- `src/i18n/locales/*.json` - Translation keys for background names
- `tailwind.config.js` - CSS variables for theme

---

## Key Files Located

| Path | Purpose | Status |
|------|---------|--------|
| `/src/data/background-presets.ts` | Preset definitions | Stable |
| `/src/contexts/background-context.tsx` | State & persistence | Stable |
| `/src/hooks/use-custom-backgrounds.ts` | Custom image mgmt | Stable |
| `/src/components/background/background-renderer.tsx` | Display & loading | Stable |
| `/src/components/settings/background-settings.tsx` | UI Panel | Active (UI improvements) |
| `/src/components/settings/background-settings-modal.tsx` | Modal wrapper | Active |
| `/public/backgrounds/` | Image assets | 95 MB total |

---

## Observations & Recommendations

**Strengths:**
- ✓ Clean separation of concerns (context, hooks, components)
- ✓ Device-aware performance (lightweight mode detection)
- ✓ Flexible type system (solid, gradient, image, video, none)
- ✓ Real-time preview with temp state
- ✓ Custom image support with URL + file upload

**Optimization Opportunities:**
1. **Image Size Reduction:**
   - Abstract futuristic city (21 MB) → compress or resize
   - Multiple anime cozy variants (9-9.1 MB) → use one + variants
   - Travelling series (9 total) could be sprite sheet

2. **Format Improvements:**
   - Add WebP variants for modern browsers
   - Consider AVIF for cutting-edge performance
   - Use `next/image` for automatic optimization

3. **Loading Enhancements:**
   - Implement progressive JPEG for large images
   - Add skeleton loaders in preview panel
   - Consider virtual scroll for many presets
   - Preload next image in carousel pattern

4. **Custom Images:**
   - Consider IndexedDB for >5 MB storage
   - Add image optimization on upload (canvas resizing)
   - Implement image cropping UI

---

## Summary

The background system is well-architected with context-based state management, localStorage persistence, and support for multiple background types (solid, gradient, image, video). The implementation includes device-aware performance detection and fallback handling. Assets total 95 MB with significant optimization potential, particularly in the `/backgrounds/new/` directory. The UI provides comprehensive customization (opacity, blur, brightness) with real-time preview capabilities.
