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
| [Phase 03](./phase-03-mascot-system-assets.md) | Mascot System & Assets | 8h | pending |
| [Phase 04](./phase-04-gamification-ui-components.md) | Gamification UI Components | 10h | pending |
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
│   └── mascot-store.ts        # NEW: Mascot state machine
├── components/
│   ├── mascot/
│   │   ├── MascotProvider.tsx
│   │   ├── Mascot.tsx
│   │   └── expressions/      # 8 SVG expression components
│   ├── gamification/
│   │   ├── XPProgress.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── StreakFlame.tsx   # Enhanced streak tracker
│   │   ├── AchievementCard.tsx
│   │   └── CoinDisplay.tsx
│   └── animations/
│       ├── Confetti.tsx
│       └── LevelUpCelebration.tsx
├── app/globals.css        # Update: new CSS variables
└── tailwind.config.js     # Update: new tokens + keyframes
```

## Key Dependencies

- **Existing**: Framer Motion v12, shadcn/ui, Zustand, next-themes, canvas-confetti
- **Add**: Google Fonts (Nunito, Poppins)

## Success Criteria

1. New color palette applied across all UI (green #4ADE80 primary)
2. Studie mascot renders with 8 expressions, reacts to app state
3. Gamification dashboard: streaks, XP bar, level display, badge grid
4. All 11 themes updated with mascot variants
5. Celebration animations on achievements (confetti, level-up glow)
6. Respects `prefers-reduced-motion`

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
| **Mascot Design** | AI generate (DALL-E/Midjourney) + vectorize | Need extra step to convert to SVG |
| **Streak Migration** | Auto-migrate on first load | Preserve user history, delete old key |
| **Gamification Scope** | Iterative (2 releases) | Release 1: Core (XP+Levels+Streaks), Release 2: Badges+Coins |
| **Animation Accessibility** | Toggle in app settings | Custom control, not just OS prefers-reduced-motion |

### Action Items

- [ ] **Phase 03**: Add step for AI image generation → SVG conversion workflow
- [ ] **Phase 04**: Split into 4a (Core: XP/Levels/Streaks) and 4b (Badges/Coins/Shop)
- [ ] **Phase 06**: Add animation toggle to settings UI instead of only OS detection
- [ ] **Phase 04**: Add migration logic from `pomodoro-streak` localStorage key

### Release Strategy (Updated)

**Release 1 - Core Rebranding:**
- Phase 01-03: Colors, Typography, Mascot
- Phase 04a: XP/Levels/Enhanced Streaks
- Phase 05-06: Themes, Animations

**Release 2 - Full Gamification:**
- Phase 04b: Badges, Coins, Shop
