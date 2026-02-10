# Phase 02: Neon Ring SVG + Glow System

> Parent plan: [plan.md](./plan.md)
> Dependencies: [Phase 01](./phase-01-state-hook-and-css.md)
> Docs: [brainstorm](../reports/brainstorm-260206-1716-neon-cyberpunk-analog-clock.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-06 |
| Priority | P1 - Core Visual |
| Effort | 2h |
| Implementation Status | Pending |
| Review Status | Pending |

Rewrite `analog-clock.tsx` with multi-layer neon ring SVG, glowing progress arc, animated head dot, and state-reactive glow system. This is the core visual transformation.

## Key Insights

- Current SVG: viewBox `0 0 200 200`, radius 90, strokeWidth 8, rotated -90deg
- CSS `drop-shadow()` chains proven more performant than SVG `feGaussianBlur` on WebKit
- Progress arc uses `strokeDasharray` + `strokeDashoffset` — keep this pattern
- Need `isRunning` prop added — update both AnalogClock props AND clock-display.tsx

## Requirements

1. Multi-ring neon SVG with progress visualization
2. Glowing head dot at arc endpoint
3. State-reactive glow intensity/color via Phase 01 hook
4. Responsive sizing matching existing system (small/medium/large)
5. `prefers-reduced-motion` fallback

## Architecture

### SVG Layer Structure (viewBox: `0 0 200 200`)

```
┌─────────────────────────────────┐
│ <svg viewBox="0 0 200 200">     │
│                                 │
│   Layer 1: Outer ambient ring   │  r=94, strokeWidth=1, opacity 0.1
│   Layer 2: Background ring      │  r=90, strokeWidth=6, opacity 0.15
│   Layer 3: Progress arc         │  r=90, strokeWidth=6, bright, dashoffset
│   Layer 4: Glow arc (duplicate) │  r=90, strokeWidth=10, blurred via CSS
│   Layer 5: Inner accent ring    │  r=82, strokeWidth=1, opacity 0.2
│   Layer 6: Head dot             │  <circle> positioned at arc end
│                                 │
│   Center: Time display (HTML)   │  Positioned via absolute div overlay
│                                 │
│ </svg>                          │
└─────────────────────────────────┘
```

### Head Dot Position Calculation

```typescript
// Arc starts at top (12 o'clock), goes clockwise
// SVG is rotated -90deg, so angle 0 = top
const angle = fraction * 2 * Math.PI; // fraction = elapsed / total
const headX = 100 + 90 * Math.cos(angle - Math.PI / 2);
const headY = 100 + 90 * Math.sin(angle - Math.PI / 2);
// Wait: SVG already rotated -90deg via className, so just use:
const headX = 100 + 90 * Math.cos(fraction * 2 * Math.PI);
const headY = 100 + 90 * Math.sin(fraction * 2 * Math.PI);
// Since transform -rotate-90 is on parent, raw angle works
```

### Component Props (Updated)

```typescript
export type AnalogClockProps = {
  formattedTime: string;
  totalTimeForMode: number;
  timeLeft: number;
  clockSize?: 'small' | 'medium' | 'large';
  isRunning: boolean;  // NEW
};
```

### Component Structure

```tsx
export const AnalogClock = memo(({ formattedTime, totalTimeForMode, timeLeft, clockSize, isRunning }) => {
  const animConfig = useAnalogClockState({ timeLeft, totalTimeForMode, isRunning });

  const fraction = (totalTimeForMode - timeLeft) / (totalTimeForMode || 1);
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference * (1 - fraction);

  // Head dot position
  const angle = fraction * 2 * Math.PI;
  const headX = 100 + 90 * Math.cos(angle);
  const headY = 100 + 90 * Math.sin(angle);

  // Dynamic glow color based on state
  const glowColor = getGlowColor(animConfig);

  return (
    <div className="text-center">
      <div className={cn('relative mx-auto mb-4', sizeClasses[clockSize].container)}
           style={{ color: glowColor }}>

        {/* Neon SVG Ring System */}
        <svg className={cn(
          'w-full h-full transform -rotate-90',
          animConfig.state === 'idle' && 'animate-neon-breathe',
          (animConfig.state === 'urgent' || animConfig.state === 'critical') && 'animate-neon-pulse',
          `neon-glow-${animConfig.state}`,
          'neon-color-transition'
        )}
        style={{
          '--neon-pulse-scale': animConfig.ringScale,
          '--neon-pulse-speed': `${animConfig.pulseSpeed}s`,
        }}
        viewBox="0 0 200 200">

          {/* Layer 1: Outer ambient ring */}
          <circle cx="100" cy="100" r="94" strokeWidth="1" stroke="currentColor" fill="none" opacity="0.1" />

          {/* Layer 2: Background ring */}
          <circle cx="100" cy="100" r="90" strokeWidth="6" stroke="currentColor" fill="none" opacity="0.15" />

          {/* Layer 3: Progress arc */}
          <circle cx="100" cy="100" r="90" strokeWidth="6" stroke="currentColor" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000" />

          {/* Layer 4: Glow arc (wider, same path, blurred via parent filter) */}
          <circle cx="100" cy="100" r="90" strokeWidth="12" stroke="currentColor" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            opacity={animConfig.glowIntensity * 0.4}
            className="transition-all duration-1000" />

          {/* Layer 5: Inner accent ring */}
          <circle cx="100" cy="100" r="82" strokeWidth="1" stroke="currentColor" fill="none" opacity="0.2" />

          {/* Layer 6: Head dot (only when progress > 0) */}
          {fraction > 0.01 && (
            <circle cx={headX} cy={headY} r="4" fill="currentColor"
              className="transition-all duration-300"
              opacity={animConfig.glowIntensity} />
          )}
        </svg>

        {/* Center: Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* NumberFlow digits — see Phase 03 */}
          <div className={cn(sizeClasses[clockSize].text, 'font-bold tabular-nums neon-text-glow')}>
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
});
```

### Glow Color Function

```typescript
function getGlowColor(config: ClockAnimationConfig): string {
  switch (config.state) {
    case 'idle':
    case 'running':
      return 'hsl(var(--timer-foreground))';     // theme color
    case 'urgent':
      return 'hsl(30, 95%, 55%)';                // amber
    case 'critical':
      return 'hsl(0, 85%, 55%)';                 // red
    case 'complete':
      return 'hsl(var(--timer-foreground))';      // back to theme
    default:
      return 'hsl(var(--timer-foreground))';
  }
}
```

### Size System (keep existing, adjust for ring)

```typescript
const sizeClasses = {
  small:  { container: 'w-56 h-56 md:w-64 md:h-64',   text: 'text-3xl md:text-4xl' },
  medium: { container: 'w-72 h-72 md:w-80 md:h-80',   text: 'text-5xl md:text-6xl' },
  large:  { container: 'w-80 h-80 md:w-96 md:h-96',   text: 'text-6xl md:text-7xl' },
};
// Text sizes slightly reduced vs current to fit within ring comfortably
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(main)/timer/components/clocks/analog-clock.tsx` | REWRITE | Full neon ring implementation |
| `src/app/(main)/timer/components/clock-display.tsx` | EDIT | Pass `isRunning` to AnalogClock |
| `src/app/(main)/timer/components/clocks/index.ts` | NO CHANGE | Exports stay the same |

## Implementation Steps

- [ ] 1. Update `AnalogClockProps` type — add `isRunning: boolean`
- [ ] 2. Update `clock-display.tsx` — pass `isRunning` prop to `<AnalogClock>`
- [ ] 3. Import `useAnalogClockState` hook in analog-clock
- [ ] 4. Build SVG layer structure (6 layers as specified)
- [ ] 5. Implement head dot position calculation with trigonometry
- [ ] 6. Apply state-reactive CSS classes (`neon-glow-{state}`, `animate-neon-*`)
- [ ] 7. Wire `getGlowColor()` to `style.color` for dynamic color shifts
- [ ] 8. Add CSS custom properties for pulse speed/scale (dynamic via style prop)
- [ ] 9. Add `prefers-reduced-motion` media query: disable filters, keep basic progress
- [ ] 10. Test all 5 states visually (idle → running → urgent → critical → complete)
- [ ] 11. Test across 3 clock sizes (small/medium/large)
- [ ] 12. Verify theme compatibility (test 3+ themes)

## Success Criteria

- [ ] Visible neon glow on progress ring
- [ ] Head dot tracks arc endpoint smoothly
- [ ] Color transitions from theme → amber → red are smooth (2s)
- [ ] Pulse animation visible in urgent/critical states
- [ ] Breathing animation visible in idle state
- [ ] 60fps in Chrome DevTools performance panel
- [ ] No visual regression on other clock types

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Head dot jitter at low fractions | Medium | Low | Hide dot when fraction < 0.01 |
| Glow too intense on light themes | Medium | Medium | Reduce glow opacity for light mode |
| CSS filter not animating smoothly | Low | Medium | Use transition on opacity instead of filter as fallback |
| SVG re-render perf with 6 circles | Low | Low | All circles are static except dashoffset — minimal repaints |

## Security Considerations

None — purely visual SVG rendering.

## Next Steps

→ Phase 03: Add particle system + NumberFlow integration
