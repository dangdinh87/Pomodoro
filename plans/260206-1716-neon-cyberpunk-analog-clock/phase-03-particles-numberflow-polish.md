# Phase 03: Particle System + NumberFlow + Polish

> Parent plan: [plan.md](./plan.md)
> Dependencies: [Phase 01](./phase-01-state-hook-and-css.md), [Phase 02](./phase-02-neon-ring-svg.md)
> Docs: [brainstorm](../reports/brainstorm-260206-1716-neon-cyberpunk-analog-clock.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-06 |
| Priority | P1 - Final Polish |
| Effort | 2h |
| Implementation Status | Pending |
| Review Status | Pending |

Add particle spark system emanating from head dot, replace plain text with NumberFlow smooth digit morphing, add neon text glow, and final polish (a11y, perf, cross-browser).

## Key Insights

- AnimatedCountdown already uses `@number-flow/react` with proven timing config
- Framer Motion `AnimatePresence` handles particle enter/exit cleanly
- Max 12 particles keeps DOM lightweight — no need for canvas
- Head dot position from Phase 02 is the spawn point for all particles
- `useRef` + `requestAnimationFrame` for spawn timing (not setInterval)

## Requirements

1. Particle component: spawn from head dot, drift outward, fade out
2. NumberFlow: smooth digit transitions for minutes and seconds
3. Neon text glow on digits
4. `prefers-reduced-motion`: disable particles entirely
5. Performance: ≤12 active DOM nodes for particles

## Architecture

### Particle System: `analog-clock-particles.tsx`

```typescript
interface ParticleProps {
  headX: number;          // spawn X position (SVG coords)
  headY: number;          // spawn Y position (SVG coords)
  particleCount: number;  // from ClockAnimationConfig (0, 8, or 12)
  spawnRate: number;      // ms between spawns
  isActive: boolean;      // false = no spawning, existing particles fade out
}
```

**Particle Lifecycle:**
```
1. Spawn at (headX, headY) with random angle offset (-45° to +45° from radial direction)
2. Drift outward: 15-30px distance over 800ms
3. Size: start 3px, shrink to 0px
4. Opacity: start 1.0, fade to 0
5. Remove from DOM after animation completes
```

**Spawn Logic (useRef + rAF):**
```typescript
// Pool-based approach: maintain array of max 12 particles
const [particles, setParticles] = useState<Particle[]>([]);
const lastSpawnRef = useRef(0);

useEffect(() => {
  if (!isActive) return;

  const tick = (timestamp: number) => {
    if (timestamp - lastSpawnRef.current >= spawnRate) {
      lastSpawnRef.current = timestamp;
      // Add new particle, remove expired ones (age > 800ms)
      setParticles(prev => {
        const alive = prev.filter(p => timestamp - p.born < 800);
        if (alive.length < particleCount) {
          return [...alive, createParticle(headX, headY, timestamp)];
        }
        return alive;
      });
    }
    animRef.current = requestAnimationFrame(tick);
  };

  animRef.current = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(animRef.current);
}, [isActive, headX, headY, spawnRate, particleCount]);
```

**Particle Rendering (inside SVG):**
```tsx
<AnimatePresence>
  {particles.map(p => (
    <motion.circle
      key={p.id}
      cx={p.x}
      cy={p.y}
      r={3}
      fill="currentColor"
      initial={{ opacity: 1, r: 3 }}
      animate={{
        cx: p.x + p.driftX,
        cy: p.y + p.driftY,
        opacity: 0,
        r: 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  ))}
</AnimatePresence>
```

**createParticle helper:**
```typescript
function createParticle(headX: number, headY: number, timestamp: number) {
  const radialAngle = Math.atan2(headY - 100, headX - 100); // from center
  const spread = (Math.random() - 0.5) * (Math.PI / 2); // ±45°
  const angle = radialAngle + spread;
  const distance = 15 + Math.random() * 15; // 15-30px drift

  return {
    id: `p-${timestamp}-${Math.random()}`,
    x: headX,
    y: headY,
    driftX: Math.cos(angle) * distance,
    driftY: Math.sin(angle) * distance,
    born: timestamp,
  };
}
```

### NumberFlow Integration (Center Display)

Replace the simple `{formattedTime}` text with NumberFlow components, matching the pattern from `animated-countdown.tsx`:

```tsx
// Inside analog-clock.tsx center overlay
<div className="absolute inset-0 flex items-center justify-center">
  <div className={cn(
    sizeClasses[clockSize].text,
    'font-space-grotesk font-bold tabular-nums',
    'neon-text-glow neon-color-transition'
  )}
  style={{ color: glowColor }}>
    <div className="flex items-center">
      <NumberFlow
        value={minutes}
        format={{ minimumIntegerDigits: 2 }}
        animated
        willChange
        transformTiming={{ duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        spinTiming={{ duration: 600, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }}
        opacityTiming={{ duration: 350, easing: 'ease-out' }}
      />
      <span className="mx-0.5 opacity-80">:</span>
      <NumberFlow
        value={seconds}
        format={{ minimumIntegerDigits: 2 }}
        animated
        willChange
        transformTiming={{ duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        spinTiming={{ duration: 600, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }}
        opacityTiming={{ duration: 350, easing: 'ease-out' }}
      />
    </div>
  </div>
</div>
```

**Note:** Parse `formattedTime` or compute from `timeLeft`:
```typescript
const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;
```

### Text Glow Effect

Already defined in Phase 01 CSS:
```css
.neon-text-glow {
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor;
}
```

Text glow uses `currentColor` which inherits from `style.color` → state-reactive color shifts apply automatically.

### Accessibility: `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .neon-glow-idle,
  .neon-glow-running,
  .neon-glow-urgent,
  .neon-glow-critical {
    filter: none;
    /* Keep color change for state indication */
  }
  .neon-text-glow {
    text-shadow: none;
  }
  .animate-neon-breathe,
  .animate-neon-pulse {
    animation: none;
  }
}
```

In component: conditionally skip particle rendering:
```typescript
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
// Skip particle component entirely if reduced motion
```

Or simpler — use `window.matchMedia` in the state hook to set `particleCount: 0`.

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(main)/timer/components/clocks/analog-clock-particles.tsx` | CREATE | Particle spark system |
| `src/app/(main)/timer/components/clocks/analog-clock.tsx` | EDIT | Integrate particles + NumberFlow |
| `src/app/globals.css` | EDIT | Add reduced-motion overrides |

## Implementation Steps

- [ ] 1. Create `analog-clock-particles.tsx` with Framer Motion particles
- [ ] 2. Implement spawn logic with rAF and particle pool (max 12)
- [ ] 3. Add `createParticle` helper with radial drift calculation
- [ ] 4. Integrate `<NeonParticles>` into analog-clock SVG (after head dot layer)
- [ ] 5. Replace plain text with NumberFlow components in center overlay
- [ ] 6. Parse `timeLeft` → minutes/seconds for NumberFlow values
- [ ] 7. Apply `neon-text-glow` class + `neon-color-transition` to digits
- [ ] 8. Add `prefers-reduced-motion` CSS overrides to globals.css
- [ ] 9. Add reduced-motion detection in state hook (set particleCount to 0)
- [ ] 10. Cross-browser test: Chrome, Safari, Firefox
- [ ] 11. Performance audit: Chrome DevTools → ensure ≤12 particle DOM nodes
- [ ] 12. Test complete flow: start → run → urgent → critical → complete → confetti
- [ ] 13. Test across 3+ themes (Default, Midnight, Sakura for color diversity)

## Todo List

- [ ] Particle component with Framer Motion
- [ ] NumberFlow integration
- [ ] Neon text glow
- [ ] Reduced-motion a11y
- [ ] Cross-browser testing
- [ ] Performance verification

## Success Criteria

- [ ] Particles visibly spark from head dot during running/urgent/critical
- [ ] Particles drift outward and fade naturally
- [ ] No more than 12 particle DOM elements at any time
- [ ] NumberFlow digits smoothly morph on each second tick
- [ ] Text has visible neon glow matching ring glow color
- [ ] `prefers-reduced-motion` removes all animations but keeps basic progress
- [ ] 60fps maintained with particles active (Chrome perf audit)
- [ ] Full state cycle works: idle → running → urgent → critical → complete
- [ ] No visual glitches when switching between clock types

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Framer Motion SVG `<motion.circle>` perf | Low | Medium | Max 12 elements, simple transforms only |
| NumberFlow SSR hydration mismatch | Low | Low | Component already `'use client'` |
| Particle spawn drift when tab backgrounded | Medium | Low | rAF auto-pauses in background tabs |
| Head position NaN when totalTimeForMode is 0 | Low | High | Guard with `totalTimeForMode \|\| 1` (already done) |

## Security Considerations

None — purely client-side visual rendering.

## Next Steps

→ Implementation complete after this phase. Run final QA pass.
