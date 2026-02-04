---
title: "Study Bro Full Rebranding System"
description: "Playful branding with Shiba mascot, gamification, and themed UI"
status: in-progress
priority: P1
effort: 32h
branch: feature/update-UI
tags: [branding, gamification, mascot, themes, animation]
created: 2026-02-04
---

# Study Bro Rebranding System

## Overview

Transform Study Bro from a standard productivity app into a playful, engaging experience inspired by Duolingo/Headspace. Core deliverables: Shiba mascot "Studie", full gamification suite (XP/Levels/Badges/Coins), new color system, and rich animations.

## Quick Links

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| [Phase 01](./phase-01-design-tokens-color-system.md) | Design Tokens & Color System | 4h | ✅ completed |
| [Phase 02](./phase-02-typography-base-components.md) | Typography & Base Components | 3h | ✅ completed |
| [Phase 03](./phase-03-mascot-system-assets.md) | Mascot Foundation (SVG) | 8h | ✅ completed |
| [Phase 03b](./phase-03b-mascot-enhancements.md) | **Lottie Mascot + Speech Bubbles** | 6h | 🔥 pending |
| [Phase 04](./phase-04-gamification-ui-components.md) | Gamification UI (XP/Levels) | 10h | pending |
| [Phase 05](./phase-05-theme-redesign.md) | Theme Redesign (11 themes) | 4h | pending |
| [Phase 06](./phase-06-animations-polish.md) | Animations & Polish | 3h | pending |

## Architecture Summary

```
src/
├── config/
│   ├── themes.ts          # Update: new color presets + mascot variants
│   └── gamification.ts    # NEW: XP/level/badge configs
├── stores/
│   ├── gamification-store.ts  # NEW: Zustand store for XP/coins/badges
│   └── mascot-store.ts        # ✅ DONE: Mascot state machine + messages
├── components/
│   ├── mascot/
│   │   ├── MascotProvider.tsx    # ✅ DONE
│   │   ├── Mascot.tsx            # ✅ DONE (SVG) → Upgrade to Lottie
│   │   ├── LottieMascot.tsx      # NEW: Lottie player wrapper
│   │   ├── SpeechBubble.tsx      # NEW: Animated speech bubbles
│   │   ├── MascotFloating.tsx    # NEW: Global floating container
│   │   ├── expressions/          # ✅ DONE: 8 SVG components (fallback)
│   │   └── messages/             # NEW: Tips, greetings, celebrations
│   ├── gamification/
│   │   ├── XPProgress.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── AchievementCard.tsx
│   │   └── CoinDisplay.tsx
│   └── animations/
│       ├── Confetti.tsx
│       └── LevelUpCelebration.tsx
├── public/mascot/          # NEW: Lottie animation files (.lottie)
├── app/globals.css         # ✅ DONE: new CSS variables
└── tailwind.config.js      # ✅ DONE: new tokens + keyframes
```

## Key Dependencies

- **Existing**: Framer Motion v12, shadcn/ui, Zustand, next-themes, canvas-confetti
- **Add**: Google Fonts (Nunito) ✅, `@lottiefiles/dotlottie-react`

## Success Criteria

1. ✅ New color palette applied across all UI (green #4ADE80 primary)
2. ✅ Studie mascot renders with 8 expressions, reacts to app state
3. 🔥 Mascot appears on ALL pages with Lottie animations
4. 🔥 Speech bubbles show motivational tips and celebrations
5. Gamification dashboard: XP bar, level display, badge grid
6. All 11 themes updated with mascot variants
7. Celebration animations on achievements (confetti, level-up glow)
8. Respects `prefers-reduced-motion` + custom toggle in settings

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing themes | Feature flag for new system, preserve old theme keys |
| Mascot asset size | SVG optimization (<50KB), lazy load expressions |
| Animation perf | GPU-only transforms, conditional rendering |
| Complex gamification | Ship core (streaks+XP) first, iterate on badges/coins |

---

## Validation Summary

**Validated:** 2026-02-04
**Questions asked:** 5

### Confirmed Decisions

| Decision | Choice | Impact |
|----------|--------|--------|
| **Data Persistence** | localStorage only | No backend changes needed, offline-first |
| **Mascot Design** | Lottie animations (replaced SVG) | Better animations, ~80KB bundle |
| **Mascot Placement** | Floating on ALL pages | Global presence, page-aware expressions |
| **Speech Bubbles** | Motivational tips + celebrations | Engaging, Vietnamese localized |
| **Focus/Streak Page** | ~~Removed~~ | Gamification moved to XP system |
| **Gamification Scope** | Iterative (2 releases) | Release 1: Core (XP+Levels), Release 2: Badges+Coins |
| **Animation Accessibility** | Toggle in app settings | Custom control, not just OS prefers-reduced-motion |

### Action Items

- [x] ~~Phase 03~~: Mascot foundation completed (SVG expressions)
- [ ] **Phase 03b**: Upgrade to Lottie + add speech bubbles
- [ ] **Phase 04**: XP/Levels gamification (streaks removed with Focus page)
- [ ] **Phase 06**: Add animation toggle to settings UI

### Release Strategy (Updated)

**Release 1 - Core Rebranding:**
- Phase 01-03: Colors, Typography, Mascot Foundation ✅
- Phase 03b: Lottie Mascot + Speech Bubbles 🔥
- Phase 04: XP/Levels Gamification
- Phase 05-06: Themes, Animations

**Release 2 - Full Gamification:**
- Phase 04b: Badges, Coins, Shop
