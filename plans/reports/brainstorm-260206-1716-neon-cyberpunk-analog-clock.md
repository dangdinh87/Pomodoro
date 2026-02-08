# Brainstorm: Neon Cyberpunk Analog Clock

## Problem Statement

Current Analog Clock is bare-minimum SVG: 1 background circle + 1 progress circle + centered text. No glow, no particles, no state reactivity. Needs jaw-dropping upgrade to Neon Cyberpunk aesthetic with full timer-state-reactive animations.

## Current State

- **Component:** `src/app/(main)/timer/components/clocks/analog-clock.tsx` (67 lines)
- **Props received:** formattedTime, totalTimeForMode, timeLeft, clockSize
- **Missing props:** `isRunning` (needed for state reactivity)
- **Animation stack available:** Framer Motion, Motion/React, NumberFlow, Canvas-Confetti, TSParticles (unused)
- **Theme system:** HSL CSS variables (`--timer-foreground`)

## Agreed Direction

| Aspect | Decision |
|--------|----------|
| Style | Neon Cyberpunk (Tron/glowing rings) |
| Animation Level | Jaw-dropping (particles, glow, morphing) |
| State Reactivity | Full (idle → running → urgent → complete) |
| Low-time FX | Pulse + Color shift (calm → red/amber) |
| Tick Marks | No - keep clean |

## Proposed Architecture: "Neon Ring"

### Visual Layers (bottom → top)

```
Layer 0: Outer glow aura (CSS filter: drop-shadow, animates with state)
Layer 1: Background ring (dim, 10-15% opacity, thin stroke)
Layer 2: Progress arc (bright neon stroke, animated dashoffset)
Layer 3: Glow duplicate (same arc but blurred = neon effect)
Layer 4: Progress head dot (glowing orb at arc endpoint)
Layer 5: Particle sparks (8-12 particles from head dot)
Layer 6: Center time display (NumberFlow digits + neon text-shadow)
```

### State Machine

| State | Glow Color | Pulse | Particles | Speed | Extra |
|-------|-----------|-------|-----------|-------|-------|
| **Idle** (paused) | Dim theme color | Slow breathing (3s) | Off | - | Frosted/dimmed |
| **Running** (>60s left) | Bright theme color | None | Gentle flow (8 particles) | Normal | Smooth arc progress |
| **Urgent** (≤60s) | Shift → amber/red | Heartbeat (1.5s→0.8s) | Intense (12 particles) | Accelerating | Ring scale pulse 1.0→1.05 |
| **Critical** (≤10s) | Deep red | Rapid (0.5s) | Burst mode | Fast | Flash on each second |
| **Complete** | Flash white → theme | Expand burst | Explosion out | - | Triggers existing confetti |

### Color Shift Strategy

Use CSS `transition` on HSL values with theme-aware mapping:

```
Calm:     hsl(var(--timer-foreground))           → theme default
Warning:  hsl(30, 95%, 55%)                      → amber
Critical: hsl(0, 85%, 55%)                       → red
Complete: hsl(var(--timer-foreground)) + flash    → back to theme
```

Transition duration: 2s ease-in-out for smooth shift.

### Neon Glow Technique

**Recommended: Layered CSS drop-shadow** (best performance/quality ratio)

```css
/* Neon glow stack - 3 layers for realistic falloff */
.neon-ring {
  filter:
    drop-shadow(0 0 4px currentColor)
    drop-shadow(0 0 8px currentColor)
    drop-shadow(0 0 16px currentColor);
}

/* Breathing animation */
@keyframes neon-breathe {
  0%, 100% { filter: drop-shadow(0 0 4px ...) drop-shadow(0 0 8px ...); }
  50% { filter: drop-shadow(0 0 8px ...) drop-shadow(0 0 16px ...); }
}
```

Why not SVG `feGaussianBlur`: Not GPU-accelerated in WebKit/Firefox, worse performance.

### Particle System

**Approach: Framer Motion + AnimatePresence** (no canvas needed for 8-12 particles)

```
- Particles spawn from progress head position
- Calculate head position: x = cx + r*cos(angle), y = cy + r*sin(angle)
- Each particle: small circle (2-4px), random drift outward
- Lifecycle: spawn → drift outward + fade → remove (800ms)
- Spawn rate: 1 every 200ms (running) → 1 every 100ms (urgent)
```

### Number Display

- Replace plain text with **NumberFlow** component (already installed)
- Add neon text-shadow: `0 0 10px currentColor, 0 0 20px currentColor`
- Slight size pulse on second change for cyberpunk feel

### Props Changes Required

```typescript
// Need to add isRunning to AnalogClock props
type AnalogClockProps = {
  formattedTime: string;
  totalTimeForMode: number;
  timeLeft: number;
  clockSize?: 'small' | 'medium' | 'large';
  isRunning: boolean;  // NEW - needed for state reactivity
};
```

Also update `clock-display.tsx` to pass `isRunning` to AnalogClock.

## Technical Approach

### Option A: Pure SVG + CSS Filters + Framer Motion (Recommended)

**Pros:**
- No new dependencies
- CSS drop-shadow is GPU-accelerated
- Framer Motion handles particle orchestration well
- NumberFlow already installed for digit transitions
- Works with existing theme system

**Cons:**
- Need careful filter stacking for Safari
- 8-12 Framer Motion instances for particles (acceptable)

### Option B: SVG + Canvas Overlay for Particles

**Pros:** Unlimited particle count, pixel-perfect control
**Cons:** Z-index complexity with SVG, canvas doesn't respect CSS themes, extra abstraction layer

### Option C: Use TSParticles (already installed)

**Pros:** Feature-rich particle engine
**Cons:** Overkill for 8-12 particles, large bundle impact, hard to constrain to ring shape

**Verdict: Option A** - leverages existing stack, no new deps, good performance.

## File Structure

```
src/app/(main)/timer/components/clocks/
├── analog-clock.tsx           → Complete rewrite (Neon Cyberpunk)
├── analog-clock-particles.tsx → Particle system sub-component
└── use-analog-clock-state.ts  → State machine hook (idle/running/urgent/critical/complete)
```

## Performance Safeguards

1. **`prefers-reduced-motion`**: Disable particles + glow, keep basic progress ring
2. **Memoize SVG defs**: `<defs>` with filter definitions don't re-render
3. **`will-change: filter`** on glow elements for GPU compositing
4. **Throttle particle spawns**: requestAnimationFrame-based, not setInterval
5. **Particle pool**: Max 12 active, recycle instead of create/destroy
6. **Test Safari first**: Worst filter perf - ensure 60fps baseline

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Safari glow perf | Medium | Reduce drop-shadow layers to 2 on Safari |
| Mobile battery drain | Low | Particles auto-reduce on mobile (6 max) |
| Theme color conflict | Low | Use CSS variable throughout, no hardcoded colors |
| NumberFlow bundle size | None | Already installed |
| State transition jank | Low | Framer Motion `layout` animations smooth transitions |

## Success Metrics

- [ ] 60fps on Chrome/Safari desktop (DevTools perf audit)
- [ ] Visible "wow" reaction - glow, particles, smooth transitions
- [ ] 4 distinct visual states clearly distinguishable
- [ ] Low-time pulse creates genuine urgency feeling
- [ ] Works across all 11 theme presets
- [ ] Reduced-motion fallback functional
- [ ] No new dependencies added

## Estimated Scope

- **Files changed:** 3-4 (analog-clock rewrite + new particle component + state hook + clock-display prop update)
- **New files:** 2 (particle component + state hook)
- **Complexity:** Medium-High (SVG math + animation orchestration)

## Next Steps

1. Create implementation plan with detailed component specs
2. Implement state machine hook first (testable in isolation)
3. Build neon ring SVG with glow layers
4. Add particle system
5. Integrate NumberFlow for digits
6. Test across themes + Safari
