---
title: "Phase 03b: Mascot Enhancements - Lottie & Speech Bubbles"
status: pending
effort: 6h
dependencies: [phase-03]
---

# Phase 03b: Mascot Enhancements

**Parent Plan**: [plan.md](./plan.md)
**Depends On**: [Phase 03](./phase-03-mascot-system-assets.md) (foundation completed)

## Overview

Upgrade Studie mascot from static SVG to Lottie animations. Add speech bubble system with motivational tips. Place mascot globally across all pages with interactive click reactions.

## Key Changes from Phase 03

| Aspect | Phase 03 (Done) | Phase 03b (New) |
|--------|-----------------|-----------------|
| **Rendering** | SVG components | Lottie animations |
| **Placement** | Timer page only | All pages (floating) |
| **Interaction** | State-driven only | Click + speech bubbles |
| **Messages** | None | Motivational tips, task encouragement |
| **Bundle** | ~40KB (8 SVGs) | ~80KB (Lottie JSON) |

## Requirements

### R1: Lottie Animation System

**Library**: `@lottiefiles/dotlottie-react` (official, maintained)

**Animation States** (replace SVG expressions):
- `idle` - Default breathing animation
- `happy` - Tail wag, bounce
- `focused` - Determined look, subtle pulse
- `sleepy` - Yawn, droopy eyes
- `excited` - Jump, sparkles
- `celebrating` - Party hat, confetti burst

**Assets Source**:
- LottieFiles free Shiba animations OR
- Custom After Effects → Bodymovin export

### R2: Speech Bubble System

**Bubble Types**:
- `tip` - Motivational tip (auto-dismiss 5s)
- `reminder` - Task/break reminder (requires dismiss)
- `celebration` - Achievement congratulation (with confetti)
- `greeting` - Time-based greeting (morning/afternoon/evening)

**Content Categories**:
```typescript
interface MascotMessage {
  id: string;
  type: 'tip' | 'reminder' | 'celebration' | 'greeting';
  text: string;
  expression: MascotState;
  duration?: number; // ms, null = requires dismiss
}

const TIPS: MascotMessage[] = [
  { id: 't1', type: 'tip', text: 'Bạn đang làm tốt lắm! 💪', expression: 'happy' },
  { id: 't2', type: 'tip', text: 'Nghỉ ngơi cũng là năng suất đó!', expression: 'sleepy' },
  { id: 't3', type: 'tip', text: 'Mỗi phút tập trung đều có giá trị 🎯', expression: 'focused' },
  // ... more tips
];
```

**Trigger Events**:
- App load → greeting message
- Task complete → celebration
- Every 3 Pomodoros → random tip
- Click mascot → random tip or reaction
- Idle 5+ minutes → encouragement

### R3: Global Mascot Placement

**Position**: Floating bottom-right corner (responsive)
- Desktop: Fixed position, 120x120px
- Mobile: Fixed position, 80x80px
- Minimizable to icon (32x32)

**Pages**: Timer, Tasks, Progress, Settings, History, Entertainment, Chat
- Mascot context aware (different default expressions per page)

**Page Context**:
| Page | Default Expression | Special Behavior |
|------|-------------------|------------------|
| Timer | `focused` (during session) / `idle` | React to timer events |
| Tasks | `encouraging` | Celebrate task completion |
| Progress | `happy` | Show stats-related tips |
| Settings | `idle` | Minimal interaction |
| Chat | Hidden (AI has own avatar) | — |

### R4: Click Interactions

**On Click**:
1. Play random reaction animation (0.5s)
2. Show speech bubble with random tip OR
3. Toggle expressions (happy → excited → celebrating → happy)

**Long Press** (mobile):
- Open mascot menu: Hide, Settings, Pet (easter egg animation)

## Architecture

### File Structure
```
src/components/mascot/
├── MascotProvider.tsx      # UPDATE: Add message queue, click handler
├── Mascot.tsx              # UPDATE: Replace SVG with Lottie
├── LottieMascot.tsx        # NEW: Lottie player wrapper
├── SpeechBubble.tsx        # NEW: Animated speech bubble
├── MascotFloating.tsx      # NEW: Floating container for all pages
├── messages/
│   ├── tips.ts             # Motivational tips data
│   ├── greetings.ts        # Time-based greetings
│   └── celebrations.ts     # Achievement messages
└── animations/             # Lottie JSON files
    ├── idle.lottie
    ├── happy.lottie
    ├── focused.lottie
    ├── sleepy.lottie
    ├── excited.lottie
    └── celebrating.lottie
```

### Store Updates
```typescript
// mascot-store.ts additions
interface MascotStore {
  // ... existing
  isMinimized: boolean;
  currentMessage: MascotMessage | null;
  messageQueue: MascotMessage[];

  setMinimized: (value: boolean) => void;
  showMessage: (message: MascotMessage) => void;
  dismissMessage: () => void;
  handleClick: () => void;
}
```

## Implementation Steps

### Step 1: Install Lottie Dependencies (0.5h)

1.1 Install packages:
```bash
pnpm add @lottiefiles/dotlottie-react
```

1.2 Download/create Lottie assets (6 states)

### Step 2: Create LottieMascot Component (1h)

2.1 Create `/src/components/mascot/LottieMascot.tsx`:
```tsx
'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useMascotStore, type MascotState } from '@/stores/mascot-store';

const LOTTIE_SOURCES: Record<MascotState, string> = {
  idle: '/mascot/idle.lottie',
  happy: '/mascot/happy.lottie',
  focused: '/mascot/focused.lottie',
  encouraging: '/mascot/happy.lottie', // reuse happy
  sleepy: '/mascot/sleepy.lottie',
  excited: '/mascot/excited.lottie',
  worried: '/mascot/idle.lottie', // reuse with filter
  sad: '/mascot/sleepy.lottie', // reuse with filter
  celebrating: '/mascot/celebrating.lottie',
};

interface LottieMascotProps {
  size?: number;
  className?: string;
}

export function LottieMascot({ size = 120, className }: LottieMascotProps) {
  const { currentState, reducedMotion } = useMascotStore();

  return (
    <DotLottieReact
      src={LOTTIE_SOURCES[currentState]}
      loop
      autoplay={!reducedMotion}
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
```

### Step 3: Create Speech Bubble Component (1.5h)

3.1 Create `/src/components/mascot/SpeechBubble.tsx`
3.2 Add Framer Motion animations (fade, slide, typed text)
3.3 Support different bubble types (tip, reminder, celebration)

### Step 4: Create Floating Mascot Container (1h)

4.1 Create `/src/components/mascot/MascotFloating.tsx`
4.2 Add minimize/expand functionality
4.3 Add click handler for interactions
4.4 Responsive positioning (desktop/mobile)

### Step 5: Update MascotProvider & Store (1h)

5.1 Add message queue to store
5.2 Add click handler logic
5.3 Add page context awareness
5.4 Integrate with existing timer events

### Step 6: Add to All Pages (1h)

6.1 Add MascotFloating to main layout (already has MascotProvider)
6.2 Configure page-specific default expressions
6.3 Hide on Chat page

## Todo

- [ ] Install @lottiefiles/dotlottie-react
- [ ] Download/create Lottie Shiba animations (6 states)
- [ ] Create LottieMascot.tsx component
- [ ] Create SpeechBubble.tsx with Framer Motion
- [ ] Create MascotFloating.tsx container
- [ ] Add message data (tips, greetings, celebrations)
- [ ] Update mascot-store with message queue
- [ ] Add MascotFloating to main layout
- [ ] Configure page context expressions
- [ ] Add click interactions
- [ ] Test on mobile (responsive, touch)
- [ ] Verify reduced motion support

## Success Criteria

1. Lottie mascot loads and animates smoothly (<100ms)
2. Speech bubbles appear on events and clicks
3. Mascot visible on all pages except Chat
4. Minimize/expand works correctly
5. Tips display in Vietnamese
6. Mobile responsive (80px on mobile, 120px desktop)
7. Bundle size increase <100KB gzip

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lottie load delay | Medium | Medium | Preload on app init, skeleton fallback |
| Animation jank | Low | High | Use DotLottie worker, reduce complexity |
| Speech bubble overlap | Medium | Low | Queue system, auto-dismiss |
| Mobile touch issues | Medium | Medium | Touch event handling, larger hit area |

## Next Phase

Continue to [Phase 04](./phase-04-gamification-ui-components.md) for gamification components.
