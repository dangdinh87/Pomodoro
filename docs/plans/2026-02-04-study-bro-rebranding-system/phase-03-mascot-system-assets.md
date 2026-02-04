---
title: "Phase 03: Mascot System & Assets"
status: pending
effort: 8h
dependencies: [phase-01, phase-02]
---

# Phase 03: Mascot System & Assets

**Parent Plan**: [plan.md](./plan.md)
**Depends On**: [Phase 02](./phase-02-typography-base-components.md)

## Overview

Design and implement "Studie" the Shiba Inu mascot with 8 expression states. Create SVG assets, MascotProvider context, and Mascot component with Framer Motion state machine.

## Key Insights (from Research)

- **Duolingo pattern**: Data-driven mascot; emotional design maintains engagement
- **Headspace approach**: Ambiguous, curved forms; metaphorical emotions (steam = anger)
- **Notion AI**: Minimal geometry (eyes, brows, nose); state machine integration
- **Performance**: GPU-accelerated transforms only; target <50KB per mascot
- **Minimum viable**: 2 poses + 5-7 expressions; we target 8 expressions

## Requirements

### R1: Mascot Design Specifications

**Character: Studie the Shiba**
- Style: 2D vector, soft gradients, rounded edges
- Colors:
  - Main fur: `#FFB347` (warm orange-tan)
  - Chest/face accent: `#FFF5E6` (cream)
  - Details: `#1C1917` (eyes, nose)
  - Blush: `#FFCBA4` (cheeks when happy)

**SVG Structure**:
```
<svg viewBox="0 0 120 120">
  <g id="body">...</g>
  <g id="face">
    <g id="eyes">...</g>
    <g id="eyebrows">...</g>
    <g id="mouth">...</g>
    <g id="nose">...</g>
    <g id="blush">...</g>
  </g>
  <g id="ears">...</g>
  <g id="tail">...</g>
  <g id="accessories">...</g>  <!-- Theme-specific -->
</svg>
```

### R2: Expression States (8 total)

| State | Trigger | Visual Description | Animation |
|-------|---------|-------------------|-----------|
| `happy` | Task complete, streak maintained | Bright eyes, smile, tail wag | Bounce up/down |
| `focused` | During Pomodoro | Determined squint, firm line mouth | Subtle pulse |
| `encouraging` | Session start, motivation | Paw up (thumbs up), smile | Wave animation |
| `sleepy` | Break time | Droopy eyes, yawn, relaxed | Slow breathing |
| `excited` | Achievement, level up | Wide eyes, open mouth, sparkles | Jump + rotate |
| `worried` | Streak at risk (<2h to midnight) | Ears down, sweat drop, frown | Tremble |
| `sad` | Streak lost | Droopy ears, watery eyes | Slow droop |
| `celebrating` | Major milestone (7/30/100 day) | Party hat, confetti around | Spin + confetti |

### R3: State Machine Logic

```typescript
type MascotState =
  | 'happy' | 'focused' | 'encouraging' | 'sleepy'
  | 'excited' | 'worried' | 'sad' | 'celebrating';

interface MascotContext {
  state: MascotState;
  setState: (state: MascotState) => void;
  triggerReaction: (event: MascotEvent) => void;
}

type MascotEvent =
  | 'TASK_COMPLETE' | 'SESSION_START' | 'SESSION_END'
  | 'BREAK_START' | 'ACHIEVEMENT_UNLOCK' | 'STREAK_RISK'
  | 'STREAK_LOST' | 'MILESTONE_REACHED';
```

### R4: Integration Points

- Timer: `focused` during session, `sleepy` during break
- Task completion: Flash `happy` for 2s, return to previous
- Achievement: `excited` -> `celebrating` sequence
- Streak warning: `worried` when <2h to midnight without mark
- Streak lost: `sad` for 5s on detection

## Architecture Decisions

1. **Zustand store for state** - integrates with existing state management
2. **Framer Motion variants** - consistent animation pattern
3. **SVG inline components** - enables dynamic fill colors and animations
4. **Lazy expression loading** - only load current + adjacent states
5. **Context provider** - expose mascot state to entire app

## Related Files

| File | Action |
|------|--------|
| `/src/stores/mascot-store.ts` | NEW: Zustand store |
| `/src/components/mascot/MascotProvider.tsx` | NEW: Context provider |
| `/src/components/mascot/Mascot.tsx` | NEW: Main component |
| `/src/components/mascot/expressions/*.tsx` | NEW: 8 expression SVGs |
| `/src/components/mascot/animations.ts` | NEW: Framer variants |
| `/public/mascot/` | NEW: Static SVG fallbacks |

## Implementation Steps

### Step 1: Create Mascot Store (1h)

1.1 Create `/src/stores/mascot-store.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MascotState =
  | 'happy' | 'focused' | 'encouraging' | 'sleepy'
  | 'excited' | 'worried' | 'sad' | 'celebrating';

interface MascotStore {
  currentState: MascotState;
  previousState: MascotState;
  isAnimating: boolean;
  reducedMotion: boolean;

  setState: (state: MascotState) => void;
  triggerTemporary: (state: MascotState, durationMs: number) => void;
  setReducedMotion: (value: boolean) => void;
}

export const useMascotStore = create<MascotStore>()(
  persist(
    (set, get) => ({
      currentState: 'happy',
      previousState: 'happy',
      isAnimating: false,
      reducedMotion: false,

      setState: (state) => set({
        previousState: get().currentState,
        currentState: state
      }),

      triggerTemporary: (state, durationMs) => {
        const prev = get().currentState;
        set({ currentState: state, isAnimating: true });
        setTimeout(() => {
          set({ currentState: prev, isAnimating: false });
        }, durationMs);
      },

      setReducedMotion: (value) => set({ reducedMotion: value }),
    }),
    { name: 'mascot-state' }
  )
);
```

### Step 2: Create Expression Components (3h)

2.1 Create base structure `/src/components/mascot/expressions/BaseMascot.tsx`:
```tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BaseMascotProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function BaseMascot({ children, className, animate = true }: BaseMascotProps) {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className={className}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Body - shared across expressions */}
      <g id="body">
        <ellipse cx="60" cy="85" rx="35" ry="25" fill="#FFB347" />
        <ellipse cx="60" cy="82" rx="25" ry="18" fill="#FFF5E6" />
      </g>

      {/* Face container */}
      <g id="face" transform="translate(30, 20)">
        {children}
      </g>

      {/* Ears */}
      <g id="ears">
        <path d="M25 35 L35 15 L50 40 Z" fill="#FFB347" />
        <path d="M95 35 L85 15 L70 40 Z" fill="#FFB347" />
        <path d="M30 32 L37 18 L47 38 Z" fill="#FFCBA4" />
        <path d="M90 32 L83 18 L73 38 Z" fill="#FFCBA4" />
      </g>
    </motion.svg>
  );
}
```

2.2 Create each expression (example - Happy):
```tsx
// /src/components/mascot/expressions/HappyMascot.tsx
'use client';

import { motion } from 'framer-motion';
import { BaseMascot } from './BaseMascot';

const tailWag = {
  initial: { rotate: -10 },
  animate: { rotate: [−10, 15, -10] },
  transition: { repeat: Infinity, duration: 0.6 }
};

export function HappyMascot({ className }: { className?: string }) {
  return (
    <BaseMascot className={className}>
      {/* Eyes - happy curved */}
      <path d="M15 25 Q20 20 25 25" stroke="#1C1917" strokeWidth="3" fill="none" />
      <path d="M35 25 Q40 20 45 25" stroke="#1C1917" strokeWidth="3" fill="none" />

      {/* Blush */}
      <circle cx="10" cy="35" r="6" fill="#FFCBA4" opacity="0.6" />
      <circle cx="50" cy="35" r="6" fill="#FFCBA4" opacity="0.6" />

      {/* Nose */}
      <ellipse cx="30" cy="38" rx="5" ry="4" fill="#1C1917" />

      {/* Mouth - smile */}
      <path d="M20 45 Q30 55 40 45" stroke="#1C1917" strokeWidth="2" fill="none" />

      {/* Tail - animated */}
      <motion.path
        d="M95 75 Q110 65 105 80 Q100 90 90 85"
        fill="#FFB347"
        variants={tailWag}
        initial="initial"
        animate="animate"
      />
    </BaseMascot>
  );
}
```

2.3 Create remaining 7 expressions following same pattern.

### Step 3: Create Main Mascot Component (1.5h)

3.1 Create `/src/components/mascot/Mascot.tsx`:
```tsx
'use client';

import { useMascotStore } from '@/stores/mascot-store';
import { useReducedMotion } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Lazy load expressions
const expressions = {
  happy: lazy(() => import('./expressions/HappyMascot').then(m => ({ default: m.HappyMascot }))),
  focused: lazy(() => import('./expressions/FocusedMascot').then(m => ({ default: m.FocusedMascot }))),
  encouraging: lazy(() => import('./expressions/EncouragingMascot').then(m => ({ default: m.EncouragingMascot }))),
  sleepy: lazy(() => import('./expressions/SleepyMascot').then(m => ({ default: m.SleepyMascot }))),
  excited: lazy(() => import('./expressions/ExcitedMascot').then(m => ({ default: m.ExcitedMascot }))),
  worried: lazy(() => import('./expressions/WorriedMascot').then(m => ({ default: m.WorriedMascot }))),
  sad: lazy(() => import('./expressions/SadMascot').then(m => ({ default: m.SadMascot }))),
  celebrating: lazy(() => import('./expressions/CelebratingMascot').then(m => ({ default: m.CelebratingMascot }))),
};

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  override?: keyof typeof expressions;
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export function Mascot({ size = 'md', className, override }: MascotProps) {
  const { currentState, setReducedMotion } = useMascotStore();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setReducedMotion(!!shouldReduceMotion);
  }, [shouldReduceMotion, setReducedMotion]);

  const state = override ?? currentState;
  const Expression = expressions[state];

  return (
    <div className={cn(sizeMap[size], className)}>
      <Suspense fallback={<MascotSkeleton size={size} />}>
        <Expression className="w-full h-full" />
      </Suspense>
    </div>
  );
}

function MascotSkeleton({ size }: { size: keyof typeof sizeMap }) {
  return (
    <div className={cn(sizeMap[size], 'rounded-full bg-muted animate-pulse')} />
  );
}
```

### Step 4: Create MascotProvider (1h)

4.1 Create `/src/components/mascot/MascotProvider.tsx`:
```tsx
'use client';

import { createContext, useContext, useCallback, useEffect } from 'react';
import { useMascotStore } from '@/stores/mascot-store';

type MascotEvent =
  | 'TASK_COMPLETE' | 'SESSION_START' | 'SESSION_END'
  | 'BREAK_START' | 'ACHIEVEMENT_UNLOCK' | 'STREAK_RISK'
  | 'STREAK_LOST' | 'MILESTONE_REACHED';

interface MascotContextValue {
  triggerEvent: (event: MascotEvent) => void;
}

const MascotContext = createContext<MascotContextValue | null>(null);

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const { setState, triggerTemporary } = useMascotStore();

  const triggerEvent = useCallback((event: MascotEvent) => {
    switch (event) {
      case 'TASK_COMPLETE':
        triggerTemporary('happy', 2000);
        break;
      case 'SESSION_START':
        setState('focused');
        break;
      case 'SESSION_END':
        triggerTemporary('encouraging', 3000);
        break;
      case 'BREAK_START':
        setState('sleepy');
        break;
      case 'ACHIEVEMENT_UNLOCK':
        triggerTemporary('excited', 3000);
        break;
      case 'STREAK_RISK':
        setState('worried');
        break;
      case 'STREAK_LOST':
        triggerTemporary('sad', 5000);
        break;
      case 'MILESTONE_REACHED':
        triggerTemporary('celebrating', 5000);
        break;
    }
  }, [setState, triggerTemporary]);

  return (
    <MascotContext.Provider value={{ triggerEvent }}>
      {children}
    </MascotContext.Provider>
  );
}

export function useMascot() {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within MascotProvider');
  }
  return context;
}
```

### Step 5: Integration with Timer (1.5h)

5.1 Update timer store to emit mascot events.

5.2 Update streak tracker to emit mascot events.

5.3 Add MascotProvider to main layout.

5.4 Place Mascot component in timer screen.

## Todo

- [ ] Create mascot-store.ts with state machine
- [ ] Design SVG base structure for Studie
- [ ] Create BaseMascot.tsx with shared elements
- [ ] Implement HappyMascot expression
- [ ] Implement FocusedMascot expression
- [ ] Implement EncouragingMascot expression
- [ ] Implement SleepyMascot expression
- [ ] Implement ExcitedMascot expression
- [ ] Implement WorriedMascot expression
- [ ] Implement SadMascot expression
- [ ] Implement CelebratingMascot expression
- [ ] Create Mascot.tsx with lazy loading
- [ ] Create MascotProvider.tsx with event handling
- [ ] Integrate with timer store
- [ ] Integrate with streak tracker
- [ ] Add MascotProvider to (main)/layout.tsx
- [ ] Place Mascot in timer UI
- [ ] Test all expression transitions
- [ ] Verify reduced motion support

## Success Criteria

1. Mascot renders at 4 sizes (sm/md/lg/xl)
2. All 8 expressions display correctly
3. State changes animate smoothly
4. Timer events trigger correct expressions
5. SVG files <50KB each
6. `prefers-reduced-motion` disables animations

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SVG complexity/size | Medium | Medium | Simplify paths, SVGO optimization |
| Animation jank | Medium | High | GPU-only transforms, test on low-end |
| State race conditions | Low | Medium | Debounce rapid events |
| Expression load delay | Low | Low | Preload adjacent states |

## Security Considerations

- SVG sanitization: Inline SVGs are safe since authored internally
- No external SVG loading

## Next Phase

[Phase 04: Gamification UI Components](./phase-04-gamification-ui-components.md)
