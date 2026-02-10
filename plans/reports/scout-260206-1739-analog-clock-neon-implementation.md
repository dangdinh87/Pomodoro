# Scout Report: Analog Clock Neon Cyberpunk Upgrade

**Date:** 2026-02-06 17:39 | **Scope:** Implementation planning for analog-clock.tsx upgrade

---

## CURRENT IMPLEMENTATION SUMMARY

### AnalogClock Component
**File:** `src/app/(main)/timer/components/clocks/analog-clock.tsx` (67 lines)

**Props:**
- `formattedTime: string` — display time (e.g., "25:00")
- `totalTimeForMode: number` — total session duration (seconds)
- `timeLeft: number` — remaining time (seconds)
- `clockSize?: 'small' | 'medium' | 'large'` — responsive sizing

**Key Patterns:**
- Memoized functional component
- Uses `cn()` utility for class composition
- Responsive size mappings:
  - small: `w-56 h-56 md:w-64 md:h-64`, text: `text-4xl md:text-5xl`
  - medium: `w-72 h-72 md:w-80 md:h-80`, text: `text-6xl md:text-7xl`
  - large: `w-80 h-80 md:w-96 md:h-96`, text: `text-7xl md:text-8xl`
- CSS variables: `color: 'hsl(var(--timer-foreground))'` for theme adaptation
- SVG-based circular progress: strokeDasharray animation with `transition-all duration-1000`
- Centered text display (absolute positioning)

**Rendering:**
- Circle background (opacity-20) with animated progress ring on top
- stroke-width: 8, radius: 90
- Transition: `duration-1000` (1 second smooth update)

---

## COMPARABLE PATTERNS (Reference implementations)

### DigitalClock
- Uses `font-space-grotesk` font family
- Class: `text-timer-foreground` (direct CSS class reference)
- Responsive text sizes: `text-6xl → text-[12rem]`
- Supports aria-live regions for accessibility
- timeRef: React.RefObject for DOM manipulation

### FlipClock
- Separate digit boxes with `bg-white/10 backdrop-blur-sm`
- Border color: `hsl(var(--timer-foreground))`
- 3D perspective: `transform: 'perspective(1000px) rotateX(0deg)'`
- Class: `timer-state-transition` for smooth updates
- Size mappings include padding/digit/separator variants

### AnimatedCountdown (NumberFlow pattern)
- Uses `@number-flow/react` for smooth digit animations
- Timing config:
  - transformTiming: 600ms cubic-bezier(0.4, 0, 0.2, 1)
  - spinTiming: 600ms cubic-bezier(0.65, 0, 0.35, 1)
  - opacityTiming: 350ms ease-out
- Responsive text: `text-[20vw] → text-[12vw]`
- Font: `font-mono` + `font-bold` + `tracking-tight`

---

## THEME ARCHITECTURE

### CSS Variables (globals.css & themes.ts)
**Primary Timer Variable:**
- Light: `--timer-foreground: 12 85% 55%` (orange primary)
- Dark: `--timer-foreground: 12 85% 58%`
- Format: HSL (Hue Saturation Lightness)

**Available color variables:**
- `--primary`, `--foreground`, `--background`
- `--accent`, `--destructive`, `--border`
- Chart colors: `--chart-1` through `--chart-5`
- Streak/level/badge colors (gamification)

**Theme structure (themes.ts):**
```
ThemeVars = {
  name, key, emoji, description, mascotVariant,
  light: Record<string, string>,   // HSL color strings
  dark: Record<string, string>
}
```

**Existing animation keyframes in globals.css:**
- `timer-pulse` (0.15s scale 1→1.03→1)
- `timer-shake` (0.18s translateX for warning)
- `timer-glow` (text-shadow with --timer-foreground)
- `gradient-x`, `pulse-slow`, `spin-slow`, `border-beam`
- `pulse-red`, `pulse-primary` (box-shadow variants)

---

## TAILWIND KEYFRAMES (tailwind.config.js)

Already defined:
- `accordion-down/up` (height collapse)
- `fade-in` (opacity)
- `slide-in-from-top/bottom` (translateY)
- `pulse-ring` (scale + opacity)

---

## INTEGRATION TOUCHPOINTS

### ClockDisplay Switch (clock-display.tsx)
```typescript
switch (settings.clockType) {
  case 'analog':
    return <AnalogClock ... />
```
**No changes needed** — existing switch handles new types correctly.

### TimerSettings Type (timer-store.ts)
```typescript
export type ClockType = 'digital' | 'analog' | 'progress' | 'flip' | 'animated';
```
**Action:** Add `'neon-cyberpunk'` to ClockType union if creating separate variant.
**OR:** Keep as 'analog' and add visual flag in settings if styling is runtime-switchable.

### Default Settings
```typescript
const defaultSettings = {
  clockType: 'digital',
  clockSize: 'medium',
  // ... other settings
}
```

---

## CSS ANIMATION FOUNDATION

### Key Animation Patterns to Adopt
1. **Glow effect:** Already exists (`.timer-glow` with text-shadow)
2. **Pulse animations:** `pulse-ring` in Tailwind or custom `timer-pulse`
3. **Smooth transitions:** `transition-all duration-1000` (current)
4. **3D transforms:** Supported in FlipClock pattern (perspective, rotateX)
5. **Stagger timing:** Use in keyframes (0%, 20%, 40%, etc.)

### Recommended Neon Elements
- Stroke-based glowing rings (SVG)
- Box-shadow glows (CSS)
- Text-shadow for text glows
- Animated gradient backgrounds (existing: `gradient-x`)
- Scanline/VHS effect (CSS backdrop-filter or pseudo-elements)
- Color flicker animations (rapid hue shifts)

---

## ACTIONABLE INSIGHTS FOR IMPLEMENTATION

### 1. Component Structure
- **Keep:** Current prop interface (formattedTime, totalTimeForMode, timeLeft, clockSize)
- **Extend:** Add optional `variant?: 'default' | 'neon-cyberpunk'` prop OR create new `<NeonCyberpunkClock />`
- **Use:** Existing memo() wrapper and cn() utilities

### 2. SVG Customization
- Keep circular progress ring structure
- Add multiple animated rings (nested circles with different speeds)
- Apply neon stroke colors: cyan, magenta, lime-green
- Use filter= `<feGaussianBlur>` + `<feDropShadow>` for glow
- Animate `stroke-dashoffset` with 600-1200ms durations

### 3. CSS Additions Needed
- New keyframes: `neon-flicker`, `neon-glow-pulse`, `neon-scanline`, `neon-color-shift`
- New classes: `.neon-text-glow`, `.neon-ring-glow`, `.neon-scanlines`
- Use hue rotation or multiple text-shadows for flicker

### 4. Tailwind Integration
- Define neon colors in `tailwind.config.js`:
  - `--neon-cyan: 180 100% 50%`
  - `--neon-magenta: 300 100% 50%`
  - `--neon-lime: 90 100% 50%`
- Add keyframes to `extend.keyframes`
- Add animations to `extend.animation`

### 5. Theme Compatibility
- Neon colors should work in both light & dark modes
- Consider adding `neon-cyan`, `neon-magenta`, `neon-lime` to theme presets
- Update `timer-foreground` or create dedicated `--neon-primary` variable

### 6. Performance Considerations
- Limit animated rings to 2-3 (SVG rendering cost)
- Use `will-change: transform, opacity, stroke-dashoffset` on SVG elements
- Keep animation durations reasonable (600-2000ms)
- Prefer transform/opacity over color changes (GPU acceleration)

---

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/app/(main)/timer/components/clocks/analog-clock.tsx` | Add variant prop, conditional rendering of neon elements |
| `src/app/globals.css` | Add neon keyframes + glow classes |
| `tailwind.config.js` | Add neon color vars + keyframe definitions |
| `src/stores/timer-store.ts` | Update ClockType if creating new variant |
| `src/config/themes.ts` | Optional: add neon color definitions to themes |
| `src/app/(main)/timer/components/clocks/index.ts` | No changes (exports remain same) |
| `src/app/(main)/timer/components/clock-display.tsx` | Possible: handle new clockType in switch |

---

## UNRESOLVED QUESTIONS

1. **Variant approach:** Should neon be a separate `clockType` or a style variant within analog?
2. **Color scheme:** Cyan/magenta/lime, or use theme's primary color as neon base?
3. **Scanline effect:** Full-screen overlay or just on clock container?
4. **Animation intensity:** Subtle glow vs. aggressive flicker?
5. **Mobile performance:** Should neon animations be reduced on low-end devices?
