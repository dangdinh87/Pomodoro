---
title: "Phase 06: Animations & Polish"
status: pending
effort: 3h
dependencies: [phase-03, phase-04]
---

# Phase 06: Animations & Polish

**Parent Plan**: [plan.md](./plan.md)
**Depends On**: [Phase 03](./phase-03-mascot-system-assets.md), [Phase 04](./phase-04-gamification-ui-components.md)

## Overview

Add celebration animations (confetti, level-up glow), polish mascot animation state machine, add micro-interactions, and implement performance optimizations including `prefers-reduced-motion` support.

## Key Insights (from Research)

- **GPU-accelerated properties**: Only animate `transform` and `opacity`
- **Framer Motion variants**: Bundle animations for state coordination
- **Mascot fatigue guards**: Limit interaction frequency
- **Reduced motion**: Must respect user preference

## Requirements

### R1: Celebration Animations

**Confetti Burst** (achievement unlock, level up):
- Trigger: Badge unlock, level up
- Duration: 2-3 seconds
- Style: Colorful particles, gravity fall
- Library: canvas-confetti (already installed)

**Level Up Glow**:
- Trigger: Level increase
- Effect: Expanding ring from XP bar
- Duration: 1.5 seconds
- CSS keyframe animation

**Streak Milestone**:
- Trigger: 7/30/100 day streaks
- Effect: Confetti + mascot celebrating + toast
- Duration: 3 seconds

### R2: Mascot Animation State Machine

```typescript
const mascotAnimations = {
  happy: {
    body: { y: [0, -8, 0] },
    tail: { rotate: [-10, 15, -10] },
    transition: { duration: 0.6, repeat: 2 }
  },
  focused: {
    body: { scale: [1, 1.02, 1] },
    eyes: { scaleY: [1, 0.7, 1] },
    transition: { duration: 2, repeat: Infinity }
  },
  encouraging: {
    paw: { rotate: [0, 15, 0, 15, 0] },
    body: { x: [0, 2, -2, 0] },
    transition: { duration: 0.8 }
  },
  sleepy: {
    body: { scale: [1, 1.03, 1] },
    eyes: { scaleY: [1, 0.2, 0.2, 1] },
    transition: { duration: 3, repeat: Infinity }
  },
  excited: {
    body: { y: [0, -15, 0], rotate: [-5, 5, -5, 5, 0] },
    transition: { duration: 0.5 }
  },
  worried: {
    body: { x: [-1, 1, -1, 1, 0] },
    sweat: { opacity: [0, 1] },
    transition: { duration: 0.3, repeat: 3 }
  },
  sad: {
    ears: { rotate: [0, -15] },
    body: { y: [0, 5] },
    transition: { duration: 0.5 }
  },
  celebrating: {
    body: { rotate: [0, 360], scale: [1, 1.1, 1] },
    transition: { duration: 1 }
  }
};
```

### R3: Micro-interactions

| Element | Interaction | Animation |
|---------|-------------|-----------|
| Button hover | Lift effect | `translateY(-2px)` |
| Card hover | Subtle scale | `scale(1.01)` |
| Badge unlock | Pop in | `scale(0 -> 1.1 -> 1)` |
| XP gain | Number fly | Float up and fade |
| Coin earn | Spin | Rotate 360 + scale |
| Streak mark | Pulse | Ring expansion |
| Task complete | Check bounce | Scale bounce |

### R4: Reduced Motion Support

```typescript
// Hook for reduced motion detection
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

// Usage in components
const shouldAnimate = !useReducedMotion();
```

### R5: Performance Targets

- Animation frame budget: <16ms (60fps)
- Max concurrent animations: 3
- Confetti particle limit: 50
- SVG animation cleanup on unmount

## Architecture Decisions

1. **canvas-confetti for celebrations** - performant, already installed
2. **Framer Motion for mascot** - state-driven animation bundles
3. **CSS keyframes for glows** - GPU-accelerated
4. **Centralized animation config** - `/src/config/animations.ts`

## Related Files

| File | Action |
|------|--------|
| `/src/config/animations.ts` | NEW: Animation variants config |
| `/src/components/animations/Confetti.tsx` | NEW: Confetti wrapper |
| `/src/components/animations/LevelUpCelebration.tsx` | NEW: Level up effect |
| `/src/components/animations/XPFlyNumber.tsx` | NEW: XP gain display |
| `/src/hooks/useReducedMotion.ts` | NEW: Motion preference hook |
| `/src/app/globals.css` | UPDATE: Add keyframes |
| `/src/components/mascot/animations.ts` | UPDATE: Full state machine |

## Implementation Steps

### Step 1: Create Animation Config (0.5h)

1.1 Create `/src/config/animations.ts`:
```typescript
import { Variants } from 'framer-motion';

export const ANIMATION_DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  celebration: 2,
};

export const ANIMATION_EASINGS = {
  bounce: [0.34, 1.56, 0.64, 1],
  smooth: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 20 },
};

export const buttonVariants: Variants = {
  initial: { y: 0 },
  hover: { y: -2 },
  tap: { y: 0, scale: 0.98 },
};

export const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.01 },
};

export const badgeUnlockVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const xpFlyVariants: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: {
    opacity: 0,
    y: -30,
    transition: { duration: 1, ease: 'easeOut' }
  },
};

export const coinEarnVariants: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.3, 1],
    rotate: 360,
    transition: { duration: 0.6 }
  },
};

export const mascotVariants = {
  happy: {
    body: { y: [0, -8, 0] },
    tail: { rotate: [-10, 15, -10] },
    transition: { duration: 0.6, repeat: 2 }
  },
  // ... rest of mascot states
};
```

### Step 2: Create Confetti Component (0.5h)

2.1 Create `/src/components/animations/Confetti.tsx`:
```tsx
'use client';

import { useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const reducedMotion = useReducedMotion();

  const fire = useCallback(() => {
    if (reducedMotion) {
      onComplete?.();
      return;
    }

    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#4ADE80', '#FB923C', '#2DD4BF', '#FBBF24'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        onComplete?.();
      }
    })();
  }, [reducedMotion, onComplete]);

  useEffect(() => {
    if (trigger) fire();
  }, [trigger, fire]);

  return null;
}
```

### Step 3: Create Level Up Celebration (0.5h)

3.1 Create `/src/components/animations/LevelUpCelebration.tsx`:
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Confetti } from './Confetti';

interface LevelUpCelebrationProps {
  show: boolean;
  level: number;
  onComplete: () => void;
}

export function LevelUpCelebration({ show, level, onComplete }: LevelUpCelebrationProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti trigger={show} />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={reducedMotion ? {} : { scale: 0.5, opacity: 0 }}
              animate={reducedMotion ? {} : { scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onAnimationComplete={onComplete}
            >
              <motion.div
                className="text-6xl font-bold text-primary"
                animate={reducedMotion ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Level {level}!
              </motion.div>
              <p className="text-xl text-muted-foreground mt-2">Congratulations!</p>
            </motion.div>

            {/* Glow ring effect */}
            {!reducedMotion && (
              <motion.div
                className="absolute w-32 h-32 rounded-full border-4 border-primary"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Step 4: Create useReducedMotion Hook (0.25h)

4.1 Create `/src/hooks/useReducedMotion.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

### Step 5: Add CSS Keyframes (0.25h)

5.1 Add to `/src/app/globals.css`:
```css
/* Level up glow */
@keyframes level-up-glow {
  0% {
    box-shadow: 0 0 0 0 hsl(var(--primary) / 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px hsl(var(--primary) / 0);
  }
  100% {
    box-shadow: 0 0 0 0 hsl(var(--primary) / 0);
  }
}

.animate-level-glow {
  animation: level-up-glow 1.5s ease-out;
}

/* Streak pulse */
@keyframes streak-pulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.2);
  }
}

.animate-streak-pulse {
  animation: streak-pulse 0.5s ease-out;
}

/* Badge unlock pop */
@keyframes badge-pop {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-badge-pop {
  animation: badge-pop 0.5s ease-out forwards;
}

/* Coin spin */
@keyframes coin-spin {
  0% {
    transform: rotateY(0deg) scale(1);
  }
  50% {
    transform: rotateY(180deg) scale(1.2);
  }
  100% {
    transform: rotateY(360deg) scale(1);
  }
}

.animate-coin-spin {
  animation: coin-spin 0.6s ease-out;
}

/* XP fly */
@keyframes xp-fly {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
  }
}

.animate-xp-fly {
  animation: xp-fly 1s ease-out forwards;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Step 6: Integration & Polish (1h)

6.1 Integrate LevelUpCelebration with gamification store level changes.

6.2 Add confetti trigger to badge unlocks.

6.3 Add XP fly numbers to XP gains.

6.4 Polish mascot animation timing.

6.5 Test reduced motion across all animations.

## Todo

- [ ] Create animations.ts config
- [ ] Create Confetti.tsx component
- [ ] Create LevelUpCelebration.tsx
- [ ] Create XPFlyNumber.tsx
- [ ] Create useReducedMotion hook
- [ ] Add CSS keyframes to globals.css
- [ ] Add reduced motion media query
- [ ] Integrate level up celebration
- [ ] Integrate confetti on badge unlock
- [ ] Integrate XP fly on earn
- [ ] Polish mascot animation variants
- [ ] Add button hover animations
- [ ] Add card hover animations
- [ ] Test all animations at 60fps
- [ ] Test reduced motion support
- [ ] Verify cleanup on unmount

## Success Criteria

1. Confetti fires on level up and badge unlock
2. Level up shows celebration overlay
3. XP gains show fly-up numbers
4. All animations run at 60fps
5. `prefers-reduced-motion: reduce` disables all motion
6. No memory leaks from animation cleanup

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance on low-end | Medium | High | Limit particles, test on slow devices |
| Animation timing conflicts | Medium | Low | Debounce rapid triggers |
| Reduced motion incomplete | Low | Medium | Comprehensive testing |
| Confetti memory leak | Low | Medium | Cleanup on unmount |

## Performance Monitoring

```typescript
// Add to key animation components
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (duration > 16) {
        console.warn(`Animation exceeded frame budget: ${duration.toFixed(2)}ms`);
      }
    };
  }
}, []);
```

## Final Checklist

- [ ] All phases complete
- [ ] Full E2E test pass
- [ ] Lighthouse performance audit
- [ ] Accessibility audit (a11y)
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] Documentation updated
