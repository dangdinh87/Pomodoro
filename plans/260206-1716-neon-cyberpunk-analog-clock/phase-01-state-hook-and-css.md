# Phase 01: State Hook + CSS Foundation

> Parent plan: [plan.md](./plan.md)
> Dependencies: None
> Docs: [brainstorm](../reports/brainstorm-260206-1716-neon-cyberpunk-analog-clock.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-02-06 |
| Priority | P1 - Foundation |
| Effort | 1.5h |
| Implementation Status | Pending |
| Review Status | Pending |

Create state machine hook `use-analog-clock-state.ts` and add neon CSS keyframes/classes to `globals.css` + `tailwind.config.js`.

## Key Insights

- Current analog clock has NO state reactivity — doesn't receive `isRunning` prop
- Timer store already tracks: `timeLeft`, `isRunning`, `mode`, `totalTimeForMode`
- Existing CSS already has `timer-pulse`, `timer-glow`, `timer-shake` — extend pattern
- HSL color system via CSS variables allows smooth theme-aware color transitions

## Requirements

1. State hook derives visual state from timer props
2. CSS keyframes for neon breathing, pulse, color shift
3. No new dependencies
4. Theme-compatible (uses `--timer-foreground` CSS var)

## Architecture

### State Machine: `use-analog-clock-state.ts`

```typescript
type ClockVisualState = 'idle' | 'running' | 'urgent' | 'critical' | 'complete';

interface ClockAnimationConfig {
  state: ClockVisualState;
  glowIntensity: number;       // 0-1, controls drop-shadow spread
  glowColor: string;           // HSL string for current glow
  pulseSpeed: number | null;   // seconds per cycle, null = no pulse
  particleCount: number;       // 0-12
  particleSpawnRate: number;   // ms between spawns
  ringScale: number;           // 1.0 - 1.05
}

function useAnalogClockState(props: {
  timeLeft: number;
  totalTimeForMode: number;
  isRunning: boolean;
}): ClockAnimationConfig
```

**State Derivation Logic:**
```
if (!isRunning && timeLeft === totalTimeForMode) → 'idle'
if (!isRunning && timeLeft < totalTimeForMode)   → 'idle' (paused variant, dimmer)
if (isRunning && timeLeft > 60)                   → 'running'
if (isRunning && timeLeft <= 60 && timeLeft > 10) → 'urgent'
if (isRunning && timeLeft <= 10)                  → 'critical'
if (timeLeft === 0)                               → 'complete'
```

**Config per state:**

| State | glowIntensity | glowColor | pulseSpeed | particleCount | spawnRate | ringScale |
|-------|-------------|-----------|-----------|---------------|-----------|-----------|
| idle | 0.3 | theme default | 3s (breathe) | 0 | - | 1.0 |
| running | 0.7 | theme default | null | 8 | 200ms | 1.0 |
| urgent | 0.9 | amber `30 95% 55%` | 1.5s→0.8s | 12 | 100ms | 1.02 |
| critical | 1.0 | red `0 85% 55%` | 0.5s | 12 | 80ms | 1.05 |
| complete | 1.0 | flash white | null | 0 | - | 1.0 |

**Urgent pulse acceleration:** `pulseSpeed = 1.5 - (1 - timeLeft/60) * 0.7` (1.5s → 0.8s as time decreases)

### CSS Additions: `globals.css`

```css
/* Neon breathing - idle state */
@keyframes neon-breathe {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Neon pulse - urgent/critical states */
@keyframes neon-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(var(--neon-pulse-scale, 1.02)); opacity: 1; }
}

/* Color shift transition utility */
.neon-color-transition {
  transition: color 2s ease-in-out, filter 1s ease-in-out;
}

/* Neon glow stacks */
.neon-glow-idle {
  filter: drop-shadow(0 0 3px currentColor) drop-shadow(0 0 6px currentColor);
}
.neon-glow-running {
  filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 8px currentColor) drop-shadow(0 0 14px currentColor);
}
.neon-glow-urgent {
  filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 12px currentColor) drop-shadow(0 0 20px currentColor);
}
.neon-glow-critical {
  filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor) drop-shadow(0 0 28px currentColor);
}

/* Neon text glow */
.neon-text-glow {
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor;
}
```

### Tailwind Config Additions

Add to `tailwind.config.js` → `theme.extend.keyframes`:
```js
'neon-breathe': {
  '0%, 100%': { opacity: '0.4' },
  '50%': { opacity: '0.8' },
},
'neon-pulse': {
  '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
  '50%': { transform: 'scale(var(--neon-pulse-scale, 1.02))', opacity: '1' },
},
```

Add to `theme.extend.animation`:
```js
'neon-breathe': 'neon-breathe 3s ease-in-out infinite',
'neon-pulse': 'neon-pulse var(--neon-pulse-speed, 1.5s) ease-in-out infinite',
```

## Related Code Files

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(main)/timer/components/clocks/use-analog-clock-state.ts` | CREATE | State machine hook |
| `src/app/globals.css` | EDIT | Add neon keyframes + glow classes |
| `tailwind.config.js` | EDIT | Add neon keyframe + animation definitions |

## Implementation Steps

- [ ] 1. Create `use-analog-clock-state.ts` with state derivation logic
- [ ] 2. Export `ClockVisualState` and `ClockAnimationConfig` types
- [ ] 3. Implement smooth urgent pulse acceleration (lerp based on timeLeft)
- [ ] 4. Add `prefers-reduced-motion` handling (disable glow/pulse, keep basic state)
- [ ] 5. Add neon keyframes to `globals.css` (breathe, pulse, glow classes)
- [ ] 6. Add tailwind keyframe definitions to `tailwind.config.js`
- [ ] 7. Manual test: import hook in analog-clock, console.log state transitions

## Success Criteria

- [ ] Hook returns correct state for all 5 conditions
- [ ] Urgent pulse speed smoothly accelerates from 1.5s→0.8s
- [ ] CSS classes produce visible glow when applied to any SVG element
- [ ] `prefers-reduced-motion` disables animations gracefully
- [ ] No new dependencies added

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| State flicker at boundary (60s/10s) | Low | Medium | Add hysteresis: once urgent, stay urgent until paused or <10s |
| CSS filter perf on mobile | Low | Medium | Test on real device early |

## Security Considerations

None — purely client-side UI state logic.

## Next Steps

→ Phase 02: Build neon ring SVG using this state hook's output
