# Right Sidebar Panel Patterns for Audio Mixer UI

**Research Date:** 2026-02-09
**Context:** Audio system overhaul for Pomodoro Focus timer
**Stack:** Next.js 14 App Router, Tailwind CSS, shadcn/ui, Framer Motion
**Constraints:** 300-350px desktop width, fullscreen mobile overlay

---

## 1. Component Recommendation: shadcn Sheet vs Custom

### Use shadcn Sheet Component
**Winner for this use case.** Reasons:
- Built on Radix UI Dialog with battle-tested focus management, accessibility
- Edge positioning: slides from right screen edge (exactly what we need)
- Focus trapping for keyboard navigation (critical for volume sliders)
- Mobile-optimized with smooth slide animations
- TypeScript-first with full type safety
- Tailwind CSS styling (matches existing stack)

### Installation
```bash
npx shadcn-ui@latest add sheet
```

### Why NOT Custom Drawer
- shadcn Drawer (built on Vaul) is gesture-driven, Linear/Vercel-style
- Better for mobile-first bottom sheets, not right-side audio mixers
- Sheet provides more immersive experience with adjustable size/position

### Alternative: Sidebar Component
shadcn Sidebar offers `variant="inset"` for overlay effects, but Sheet is simpler for temporary panels that don't persist across routes.

---

## 2. Overlay Implementation Pattern

### Sheet Configuration
```tsx
<Sheet>
  <SheetTrigger>Open Mixer</SheetTrigger>
  <SheetContent side="right" className="w-[350px] sm:w-full">
    {/* Audio mixer content */}
  </SheetContent>
</Sheet>
```

### Key Features
- **Overlay backdrop:** Dims screen with translucent overlay, conveys depth
- **No content push:** Overlays existing timer page without layout shift
- **Portal-based:** Renders outside DOM hierarchy, avoids z-index conflicts

---

## 3. Framer Motion Animation Approach

### Animation Objects Pattern
Three-state system for slide-in:
```tsx
const sidebarVariants = {
  initial: { x: "100%" },      // Off-screen right
  animate: { x: 0 },           // Fully visible
  exit: { x: "100%" }          // Slide out right
}
```

### AnimatePresence Critical
Sheet exit animations require wrapping:
```tsx
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Sheet content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Performance Notes
- Use `transition={{ type: "spring" }}` for natural feel (60 FPS on low-end devices)
- Avoid `ease: "linear"` - feels robotic for sidebars
- Profile if multiple volume sliders cause jank

### Backdrop Animation
Fade in/out with opacity:
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 0.5 }}
exit={{ opacity: 0 }}
```

---

## 4. Mobile Responsive Strategy

### Tailwind Breakpoints
- **Desktop (md+):** 300-350px fixed width, slide from right
- **Mobile (<md):** Fullscreen overlay (`w-full`)

### Implementation
```tsx
<SheetContent
  side="right"
  className="w-full md:w-[350px] md:max-w-[350px]"
>
```

### Responsive Behavior
- Use `hidden md:flex` pattern for desktop sidebar features
- Mobile: Full-screen takeover with close button in header
- Auto-close on breakpoint: `[--auto-close:md]` utility (Tailwind 4.0+)

### Off-Canvas Pattern
- `-translate-x-full` hides sidebar off-screen
- `translate-x-0` reveals on trigger
- Combine with `transition-transform duration-300` for smooth slide

---

## 5. Audio Mixer Volume Sliders (300px Width)

### Narrow Width Design Patterns

#### Vertical Slider Layout
For 300px width, stack sound cards vertically:
```
┌──────────────────────────┐
│ Rain               [75%] │
│ ─────●───────────────── │
│                          │
│ Thunder            [50%] │
│ ──────────●───────────  │
│                          │
│ White Noise        [30%] │
│ ───────────────●──────  │
└──────────────────────────┘
```

#### Component Structure
- **Sound card:** Hover effects with animated background (Framer Motion)
- **Label + percentage:** Top row (flex justify-between)
- **Slider:** Full-width range input below label
- **Visual feedback:** Colored bar fills left-to-right based on volume

#### HTML Range Input Pattern
```tsx
<input
  type="range"
  min="0"
  max="100"
  className="w-full h-2 accent-primary"
/>
```

#### CSS Transforms for Custom Styling
- Rotate 90° for vertical sliders if needed: `rotate-90`
- Glassy track: `bg-white/10 backdrop-blur-sm`
- Animated bar: `bg-gradient-to-r from-primary to-secondary`

### Spacing & UX
- **Card padding:** `p-4` (16px) gives breathing room
- **Gap between cards:** `space-y-4` (16px between sounds)
- **Slider height:** `h-2` (8px) - easy to grab on mobile
- **Touch target:** Minimum 44px for thumb (iOS guidelines)

### Noisli Pattern
Search revealed: "Full control over mix and volume of each sound" but no specific UI details found. Assumption: Stacked vertical sliders, similar to above pattern.

---

## 6. Implementation Checklist

### Immediate Actions
- [ ] Install shadcn Sheet: `npx shadcn-ui@latest add sheet`
- [ ] Wrap Sheet in AnimatePresence for exit animations
- [ ] Set `side="right"` and responsive width classes
- [ ] Create `<AudioMixerPanel>` component using Sheet
- [ ] Build `<SoundSlider>` component (label + range input + value display)

### Integration with Timer Page
- [ ] Add Sheet trigger button to timer page header/toolbar
- [ ] Test overlay doesn't interfere with timer controls
- [ ] Verify focus trap doesn't block timer interactions
- [ ] Test mobile fullscreen doesn't hide timer when open

### Animation Polish
- [ ] Spring transition for natural slide-in (damping: 25, stiffness: 300)
- [ ] Backdrop fade (opacity 0 → 0.5 → 0)
- [ ] Smooth volume slider updates (debounce audio changes)
- [ ] Gesture-based close (swipe right on mobile)

### Accessibility
- [ ] Keyboard navigation: Tab through sliders, Esc to close
- [ ] Screen reader labels: "Rain volume slider, currently 75%"
- [ ] Focus management: Return focus to trigger on close
- [ ] Color contrast: Ensure slider labels readable on backdrop

---

## Unresolved Questions

1. **Audio persistence:** Should mixer state persist across sessions (localStorage)?
2. **Global vs per-timer:** Different mixer settings for work/break timers?
3. **Preset system:** Save/load mixer configurations ("Focus", "Relax", etc.)?
4. **Sheet z-index:** Will it conflict with existing modals/toasts in timer page?
5. **Mobile gesture conflicts:** Swipe-to-close vs scrolling mixer content?

---

## Sources

- [shadcn Sheet Component](https://ui.shadcn.com/docs/components/radix/sheet)
- [shadcn Drawer vs Sheet - Medium](https://medium.com/@enayetflweb/exploring-drawer-and-sheet-components-in-shadcn-ui-cf2332e91c40)
- [Animated Sidebar with Framer Motion - FreeCodeCamp](https://www.freecodecamp.org/news/create-a-fully-animated-sidebar/)
- [Framer Motion Advanced Patterns - Maxime Heckel](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)
- [Responsive Design - Tailwind CSS](https://tailwindcss.com/docs/responsive-design)
- [Tailwind Sidebar Examples - WP Dean](https://wpdean.com/tailwind-sidebar/)
- [Custom Volume Slider - Code Web Stack](https://codewebstack.com/custom-volume-slider-html-css-js/)
