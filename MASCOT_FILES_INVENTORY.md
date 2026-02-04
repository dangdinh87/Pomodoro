# Mascot Components - Complete File Inventory

## Summary
- **Total Mascot Files:** 22
- **Test Files:** 0
- **Source Lines of Code:** ~1,300+
- **Directory Structure:** 3 main directories

---

## File Structure & Details

### Store Layer (1 file)
```
src/stores/
└── mascot-store.ts (227 lines) ⚠️ NO TESTS
    - Zustand store for mascot state management
    - 8 mascot states
    - 10 event handlers
    - Message queue system
    - Timeout cleanup logic
    - Persistence middleware
```

### Hooks (1 file)
```
src/app/(main)/timer/hooks/
└── use-mascot-events.ts (63 lines) ⚠️ NO TESTS
    - Subscribes to timer store
    - Emits mascot events
    - Handles mode/running state changes
```

### Main Components (5 files)
```
src/components/mascot/
├── Mascot.tsx (83 lines) ⚠️ NO TESTS
│   - Expression renderer with lazy loading
│   - Size mapping (sm/md/lg/xl)
│   - Suspense fallback (MascotSkeleton)
│   - Reduced motion support
│
├── MascotFloating.tsx (200 lines) ⚠️ NO TESTS
│   - Floating UI component
│   - Fixed position at bottom-right
│   - Minimize/expand toggle
│   - Message display orchestration
│   - Page-specific expressions
│   - Hidden pages logic
│   - Click handlers for tips
│   - Greeting on first load
│
├── SpeechBubble.tsx (110 lines) ⚠️ NO TESTS
│   - Message bubble with animations
│   - Color mapping by message type
│   - Auto-dismiss button
│   - Message queue indicator
│   - Framer Motion animations
│
├── MascotProvider.tsx (43 lines) ⚠️ NO TESTS
│   - React Context provider
│   - Event trigger callback
│   - useMascot hook with error boundary
│
└── LottieMascot.tsx (59 lines) ⚠️ NO TESTS
    - Lottie animation wrapper
    - Error fallback to SVG
    - Lottie source selection by state
    - DotLottieReact integration
```

### Expression Components (9 files)
```
src/components/mascot/expressions/
├── BaseMascot.tsx (104 lines) ⚠️ NO TESTS
│   - Shared SVG structure
│   - Color palette (MASCOT_COLORS)
│   - Body, head, ears rendering
│   - Reusable Nose & Blush components
│   - Reduced motion support
│
├── HappyMascot.tsx ⚠️ NO TESTS
│   - Happy expression SVG
│   - Eyes, smile, blush
│   - Idle animation
│
├── FocusedMascot.tsx ⚠️ NO TESTS
│   - Focused expression SVG
│   - Determined look
│   - Subtle animation
│
├── EncouragingMascot.tsx ⚠️ NO TESTS
│   - Encouraging expression SVG
│   - Welcoming appearance
│
├── SleepyMascot.tsx ⚠️ NO TESTS
│   - Sleepy expression SVG
│   - Half-closed eyes
│   - Relaxed pose
│
├── ExcitedMascot.tsx ⚠️ NO TESTS
│   - Excited expression SVG
│   - Wide eyes and smile
│   - Energetic animation
│
├── WorriedMascot.tsx ⚠️ NO TESTS
│   - Worried expression SVG
│   - Concerned look
│
├── SadMascot.tsx ⚠️ NO TESTS
│   - Sad expression SVG
│   - Drooping features
│
└── CelebratingMascot.tsx ⚠️ NO TESTS
    - Celebrating expression SVG
    - Celebratory pose and animation
```

### Message System (5 files)
```
src/components/mascot/messages/
├── types.ts (12 lines) ⚠️ NO TESTS
│   - MessageType enum: tip | reminder | celebration | greeting
│   - MascotMessage interface
│
├── tips.ts ⚠️ NO TESTS
│   - TIPS array of productivity tips
│   - getRandomTip function
│
├── greetings.ts ⚠️ NO TESTS
│   - GREETINGS array of greeting messages
│   - getGreeting function
│
├── celebrations.ts ⚠️ NO TESTS
│   - CELEBRATIONS array of celebration messages
│   - getCelebration function
│
└── index.ts (5 lines)
    - Barrel export of all message modules
```

### Index File
```
src/components/mascot/
└── index.ts
    - Exports all public components
```

---

## Component Dependencies Map

```
MascotFloating
├── Mascot
│   └── Expressions (HappyMascot, FocusedMascot, etc.)
│       └── BaseMascot
│           └── MASCOT_COLORS, Nose, Blush
├── SpeechBubble
│   └── MascotMessage type
├── usePathname (Next.js)
├── useMascotStore
│   └── mascot-store
└── Messages (TIPS, getGreeting)
    └── messages/*

use-mascot-events Hook
├── useTimerStore
└── useMascotStore
    └── mascot-store

LottieMascot
├── DotLottieReact
├── useMascotStore
├── Mascot (fallback)
└── LOTTIE_SOURCES mapping

MascotProvider
├── MascotContext
├── useMascotStore
└── Exports useMascot hook

mascot-store
└── Zustand + persist middleware
```

---

## State & Type Definitions

### MascotState (8 states)
```typescript
'happy' | 'focused' | 'encouraging' | 'sleepy' | 'excited' | 'worried' | 'sad' | 'celebrating'
```

### MascotEvent (10 events)
```typescript
'TASK_COMPLETE' | 'SESSION_START' | 'SESSION_END' | 'BREAK_START' |
'ACHIEVEMENT_UNLOCK' | 'STREAK_RISK' | 'STREAK_LOST' | 'MILESTONE_REACHED' |
'CLICK' | 'GREETING'
```

### MessageType (4 types)
```typescript
'tip' | 'reminder' | 'celebration' | 'greeting'
```

### MascotMessage Interface
```typescript
{
  id: string;
  type: MessageType;
  text: string;
  expression: MascotState;
  duration?: number;  // milliseconds
}
```

### MascotStore Interface
```typescript
{
  // State
  currentState: MascotState;
  previousState: MascotState;
  isAnimating: boolean;
  reducedMotion: boolean;
  isMinimized: boolean;
  currentMessage: MascotMessage | null;
  messageQueue: MascotMessage[];

  // Methods
  setState(state: MascotState): void;
  triggerTemporary(state: MascotState, durationMs: number): void;
  setReducedMotion(value: boolean): void;
  setMinimized(value: boolean): void;
  handleEvent(event: MascotEvent): void;
  showMessage(message: MascotMessage): void;
  dismissMessage(): void;
  queueMessage(message: MascotMessage): void;
  processQueue(): void;
}
```

---

## Test File Structure Needed

Recommended test file placement (mirroring src structure):

```
src/
├── stores/
│   └── __tests__/
│       └── mascot-store.test.ts (PRIORITY 1)
│
├── app/(main)/timer/hooks/
│   └── __tests__/
│       └── use-mascot-events.test.ts (PRIORITY 1)
│
└── components/mascot/
    ├── __tests__/
    │   ├── Mascot.test.tsx (PRIORITY 2)
    │   ├── MascotFloating.test.tsx (PRIORITY 2)
    │   ├── SpeechBubble.test.tsx (PRIORITY 2)
    │   ├── LottieMascot.test.tsx (PRIORITY 2)
    │   ├── MascotProvider.test.tsx (PRIORITY 2)
    │   ├── expressions.test.tsx (PRIORITY 3)
    │   └── messages.test.ts (PRIORITY 3)
    │
    ├── expressions/
    │   └── __tests__/
    │       └── BaseMascot.test.tsx (PRIORITY 3)
    │
    └── messages/
        └── __tests__/
            └── messages.test.ts (PRIORITY 3)
```

---

## Coverage Analysis

### Lines of Code by Layer
- **Store:** 227 lines (17%)
- **Hooks:** 63 lines (5%)
- **Components (Main):** 495 lines (38%)
- **Expressions:** ~600 lines (46%)
- **Messages:** ~150 lines (11%)

**Total:** ~1,300+ lines of code

### Coverage Priorities
1. **Store tests** - Highest impact (17% of code, 100% of logic)
2. **Hook tests** - High impact (5% of code, critical integration)
3. **Component tests** - Medium impact (43% of code, UI/UX)
4. **Expression tests** - Lower impact (46% visual, 46% code)
5. **Message tests** - Lower impact (11% data, 11% code)

### Test Density Target
- Store: 100% coverage needed (state management critical)
- Hooks: 100% coverage needed (integration point)
- Components: 80%+ coverage needed
- Expressions: 70%+ coverage needed (SVG rendering visual)
- Messages: 90%+ coverage needed (data integrity)

---

## Configuration Issues Found

### jest.config.js
**Line 11:** `moduleNameMapping` should be `moduleNameMapper`
```javascript
// Current (WRONG):
moduleNameMapping: {
  '^@/components/(.*)$': '<rootDir>/src/components/$1',
  // ...
}

// Should be:
moduleNameMapper: {
  '^@/components/(.*)$': '<rootDir>/src/components/$1',
  // ...
}
```

### Node.js Version
**Current:** 18.16.0
**Required:** >= 18.17.0
**Blocks:** `npm run build`, `npm run lint`

---

## Testing Checklist

### Pre-Test Setup
- [ ] Upgrade Node.js to 18.17.0+
- [ ] Fix jest.config.js moduleNameMapper
- [ ] Create test directory structure
- [ ] Set up test utilities and mocks

### Phase 1 Tests (Critical Path)
- [ ] mascot-store.test.ts - 20+ test cases
- [ ] use-mascot-events.test.ts - 10+ test cases

### Phase 2 Tests (Component Logic)
- [ ] Mascot.test.tsx - 8+ test cases
- [ ] MascotFloating.test.tsx - 12+ test cases
- [ ] SpeechBubble.test.tsx - 8+ test cases
- [ ] LottieMascot.test.tsx - 6+ test cases
- [ ] MascotProvider.test.tsx - 4+ test cases

### Phase 3 Tests (Data & Visuals)
- [ ] BaseMascot.test.tsx - 6+ test cases
- [ ] Expression components - 8+ test cases
- [ ] Message system - 8+ test cases

### Coverage Goals
- [ ] 80%+ overall coverage
- [ ] 100% store coverage
- [ ] 100% hook coverage
- [ ] 80%+ component coverage
- [ ] Coverage report generation
- [ ] CI/CD integration

---

## Reference Files for Test Implementation

**All mascot files located at:**
- `/Users/nguyendangdinh/Personal/Pomodoro/src/stores/mascot-store.ts`
- `/Users/nguyendangdinh/Personal/Pomodoro/src/app/(main)/timer/hooks/use-mascot-events.ts`
- `/Users/nguyendangdinh/Personal/Pomodoro/src/components/mascot/*`

**Configuration files:**
- `/Users/nguyendangdinh/Personal/Pomodoro/jest.config.js`
- `/Users/nguyendangdinh/Personal/Pomodoro/jest.setup.js`
- `/Users/nguyendangdinh/Personal/Pomodoro/package.json`

**Test utilities already installed:**
- jest@29.7.0
- @testing-library/react@14.1.2
- @testing-library/jest-dom@6.1.5
- @testing-library/user-event@14.5.1
- jest-environment-jsdom@29.7.0
