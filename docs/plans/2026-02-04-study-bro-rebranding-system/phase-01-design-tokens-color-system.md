---
title: "Phase 01: Design Tokens & Color System"
status: completed
effort: 4h
dependencies: []
completed: 2026-02-04
---

# Phase 01: Design Tokens & Color System

**Parent Plan**: [plan.md](./plan.md)

## Overview

Migrate CSS variables to new brand palette. Add semantic tokens for gamification states. Update Tailwind config with extended color utilities.

## Key Insights (from Research)

- HSL format already in use; maintain pattern for consistency
- Existing sidebar-specific variables need color updates
- Timer-foreground variable used for unified timer display
- Chart colors need harmonization with new palette

## Requirements

### R1: Primary Color Migration
Replace neutral primary with Growth Green:
- `--primary: 142 71% 45%` (light) -> #4ADE80
- `--primary: 142 76% 60%` (dark) -> brighter variant

### R2: Accent Colors
Add warm accent (Coral) and focus secondary (Teal):
```css
--accent: 24 95% 62%;        /* #FB923C coral */
--secondary: 168 76% 50%;    /* #2DD4BF teal */
```

### R3: Semantic Gamification Tokens
```css
/* Streak states */
--streak-flame: 24 95% 55%;
--streak-ember: 38 92% 50%;
--streak-at-risk: 45 93% 47%;

/* XP/Level */
--xp-fill: 142 71% 45%;
--level-glow: 142 76% 60%;

/* Achievement tiers */
--badge-bronze: 30 80% 55%;
--badge-silver: 240 5% 65%;
--badge-gold: 45 93% 47%;

/* Coins */
--coin-primary: 45 93% 47%;
--coin-shine: 45 100% 75%;
```

### R4: Warm Neutral Background
Shift from pure gray to warm tints:
```css
/* Light */
--background: 30 15% 99%;    /* warm white */
--foreground: 20 14% 4%;     /* warm black */
--muted: 30 10% 96%;

/* Dark */
--background: 24 10% 6%;
--foreground: 30 10% 96%;
```

## Architecture Decisions

1. **Preserve existing variable names** - minimize component changes
2. **Add new tokens as extensions** - gamification-specific vars are additive
3. **Update Tailwind colors** - map new vars to Tailwind utilities
4. **Theme preset structure unchanged** - only color values modified

## Related Files

| File | Action |
|------|--------|
| `/src/app/globals.css` | Update `:root` and `.dark` variables |
| `/tailwind.config.js` | Add gamification color mappings |
| `/src/config/themes.ts` | Update default theme colors |

## Implementation Steps

### Step 1: Update globals.css (2h)

1.1 Replace `:root` primary colors:
```css
:root {
  /* Brand colors */
  --primary: 142 71% 45%;
  --primary-foreground: 142 90% 98%;

  /* Accent (coral) */
  --accent: 24 95% 62%;
  --accent-foreground: 24 10% 10%;

  /* Secondary (teal) */
  --secondary: 168 76% 50%;
  --secondary-foreground: 168 90% 98%;

  /* Warm neutrals */
  --background: 30 15% 99%;
  --foreground: 20 14% 4%;
  --muted: 30 10% 96%;
  --muted-foreground: 20 10% 45%;
  --card: 30 20% 98%;
  --card-foreground: 20 14% 4%;
  --popover: 30 18% 97%;
  --popover-foreground: 20 14% 4%;
  --border: 30 12% 88%;
  --input: 30 10% 90%;
  --ring: 142 71% 45%;

  /* Gamification tokens */
  --streak-flame: 24 95% 55%;
  --streak-ember: 38 92% 50%;
  --streak-at-risk: 45 93% 47%;
  --xp-fill: 142 71% 45%;
  --level-glow: 142 76% 60%;
  --badge-bronze: 30 80% 55%;
  --badge-silver: 240 5% 65%;
  --badge-gold: 45 93% 47%;
  --coin-primary: 45 93% 47%;
  --coin-shine: 45 100% 75%;

  /* Timer inherits primary */
  --timer-foreground: 142 71% 45%;
}
```

1.2 Update `.dark` overrides with appropriate dark mode values.

1.3 Update sidebar variables to use new primary/accent.

### Step 2: Update tailwind.config.js (1h)

2.1 Add gamification color mappings:
```js
extend: {
  colors: {
    // ... existing
    streak: {
      flame: 'hsl(var(--streak-flame))',
      ember: 'hsl(var(--streak-ember))',
      'at-risk': 'hsl(var(--streak-at-risk))',
    },
    xp: {
      fill: 'hsl(var(--xp-fill))',
    },
    level: {
      glow: 'hsl(var(--level-glow))',
    },
    badge: {
      bronze: 'hsl(var(--badge-bronze))',
      silver: 'hsl(var(--badge-silver))',
      gold: 'hsl(var(--badge-gold))',
    },
    coin: {
      DEFAULT: 'hsl(var(--coin-primary))',
      shine: 'hsl(var(--coin-shine))',
    },
  },
}
```

### Step 3: Update default theme in themes.ts (1h)

3.1 Modify `defaultTheme` object with new HSL values.

3.2 Ensure light/dark variants properly contrast.

## Todo

- [ ] Backup current globals.css
- [ ] Update :root variables with new primary palette
- [ ] Update .dark variables
- [ ] Add all gamification semantic tokens
- [ ] Update sidebar color variables
- [ ] Add Tailwind color mappings
- [ ] Update defaultTheme in themes.ts
- [ ] Test color rendering in dev mode
- [ ] Verify dark mode contrast ratios (WCAG AA)

## Success Criteria

1. Primary button renders as green #4ADE80
2. All gamification tokens accessible via `hsl(var(--token))`
3. Dark mode colors properly inverted
4. No TypeScript/CSS errors
5. Existing components render with new colors without code changes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Color contrast issues | Medium | Medium | Test with WCAG tools before merge |
| Theme preset conflicts | Low | Medium | Update presets in Phase 05 |
| Sidebar color breakage | Low | Low | Sidebar vars updated together |

## Next Phase

[Phase 02: Typography & Base Components](./phase-02-typography-base-components.md)
