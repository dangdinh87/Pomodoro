---
title: "Phase 05: Theme Redesign"
status: completed
effort: 4h
dependencies: [phase-01, phase-03]
---

# Phase 05: Theme Redesign

**Parent Plan**: [plan.md](./plan.md)
**Depends On**: [Phase 01](./phase-01-design-tokens-color-system.md), [Phase 03](./phase-03-mascot-system-assets.md)

## Overview

Update all 11 theme presets with new brand palette. Add mascot variants per theme. Create theme preview components with mascot integration. Update theme settings modal.

## Key Insights (from Brainstorm)

Each theme should include:
- Light/dark color sets (existing pattern)
- Primary color matching new brand direction
- Mascot variant/accessory for personalization
- Optional background suggestion

## Requirements

### R1: Theme Structure Extension

```typescript
interface ThemeVars {
  name: string;
  key: string;
  emoji: string;           // NEW: theme icon
  mascotVariant?: string;  // NEW: Studie accessory
  light: Record<string, string>;
  dark: Record<string, string>;
}
```

### R2: 11 Redesigned Theme Presets

| # | Key | Name | Primary HSL | Mascot Variant |
|---|-----|------|-------------|----------------|
| 1 | `default` | Default | `142 71% 45%` (Green) | Normal Studie |
| 2 | `ocean` | Ocean | `168 76% 50%` (Teal) | Sailor hat |
| 3 | `sunset` | Sunset | `24 95% 62%` (Coral) | Sunglasses |
| 4 | `lavender` | Lavender | `262 83% 58%` (Purple) | Flower crown |
| 5 | `rose` | Rose | `346 77% 50%` (Pink) | Bow tie |
| 6 | `midnight` | Midnight | `226 70% 55%` (Indigo) | Star cape |
| 7 | `forest` | Forest | `160 60% 45%` (Emerald) | Leaf headband |
| 8 | `autumn` | Autumn | `38 92% 50%` (Amber) | Scarf |
| 9 | `cherry` | Cherry | `0 72% 55%` (Red) | Headphones |
| 10 | `mint` | Mint | `180 60% 50%` (Cyan) | Chef hat |
| 11 | `mono` | Monochrome | `0 0% 45%` (Gray) | Glasses |

### R3: Theme Color Harmonization

Each theme must include these semantic colors derived from its primary:
- `--primary` / `--primary-foreground`
- `--accent` (complementary or analogous)
- `--secondary` (muted variant)
- `--destructive` (consistent red)
- Chart colors harmonized with theme
- Sidebar colors matching theme

### R4: Theme Preview Component

Visual preview card showing:
- Theme name and emoji
- Color swatches (primary, accent, secondary)
- Mini mascot with theme variant
- Light/dark mode toggle preview

## Architecture Decisions

1. **Extend existing ThemeVars** - backward compatible
2. **Mascot variants as CSS classes** - `mascot-variant-sailor` applied to Mascot
3. **Theme-specific accessories in separate SVG** - composited onto base mascot
4. **Preview component for settings modal** - reusable card

## Related Files

| File | Action |
|------|--------|
| `/src/config/themes.ts` | UPDATE: All 11 presets |
| `/src/components/theme/ThemePreviewCard.tsx` | NEW: Preview component |
| `/src/components/mascot/accessories/*.tsx` | NEW: 10 accessory SVGs |
| `/src/components/settings/ThemeSettingsModal.tsx` | UPDATE: Use previews |

## Implementation Steps

### Step 1: Update Theme Type Definition (0.5h)

1.1 Update `/src/config/themes.ts` type:
```typescript
export type ThemeVars = {
  name: string;
  key: string;
  emoji: string;
  mascotVariant?: string;
  light: Record<string, string>;
  dark: Record<string, string>;
};
```

### Step 2: Redesign Default Theme (0.5h)

2.1 Update `defaultTheme`:
```typescript
export const defaultTheme: ThemeVars = {
  name: 'Default',
  key: 'default',
  emoji: '🌿',
  mascotVariant: 'normal',
  light: {
    background: '30 15% 99%',
    foreground: '20 14% 4%',
    card: '30 20% 98%',
    'card-foreground': '20 14% 4%',
    popover: '30 18% 97%',
    'popover-foreground': '20 14% 4%',
    primary: '142 71% 45%',
    'primary-foreground': '142 90% 98%',
    secondary: '168 50% 90%',
    'secondary-foreground': '168 50% 20%',
    accent: '24 80% 92%',
    'accent-foreground': '24 80% 20%',
    muted: '30 10% 96%',
    'muted-foreground': '20 10% 45%',
    destructive: '0 84% 60%',
    'destructive-foreground': '0 0% 98%',
    border: '30 12% 88%',
    input: '30 10% 90%',
    ring: '142 71% 45%',
    'timer-foreground': '142 71% 45%',
    // Sidebar
    'sidebar-background': '30 15% 97%',
    'sidebar-foreground': '20 14% 10%',
    'sidebar-primary': '142 71% 45%',
    'sidebar-primary-foreground': '142 90% 98%',
    'sidebar-accent': '30 12% 94%',
    'sidebar-accent-foreground': '20 14% 15%',
    'sidebar-border': '30 12% 90%',
    'sidebar-ring': '142 71% 45%',
    // Charts
    'chart-1': '142 70% 45%',
    'chart-2': '168 60% 50%',
    'chart-3': '24 80% 55%',
    'chart-4': '262 70% 60%',
    'chart-5': '346 70% 55%',
  },
  dark: {
    background: '24 10% 6%',
    foreground: '30 10% 96%',
    card: '24 12% 8%',
    'card-foreground': '30 10% 96%',
    popover: '24 12% 7%',
    'popover-foreground': '30 10% 96%',
    primary: '142 76% 60%',
    'primary-foreground': '142 50% 10%',
    secondary: '168 30% 15%',
    'secondary-foreground': '168 40% 90%',
    accent: '24 40% 15%',
    'accent-foreground': '24 60% 90%',
    muted: '24 10% 15%',
    'muted-foreground': '30 10% 60%',
    destructive: '0 62% 35%',
    'destructive-foreground': '0 0% 98%',
    border: '24 10% 15%',
    input: '24 10% 15%',
    ring: '142 76% 60%',
    'timer-foreground': '142 76% 60%',
    // Sidebar
    'sidebar-background': '24 10% 6%',
    'sidebar-foreground': '30 10% 96%',
    'sidebar-primary': '142 76% 60%',
    'sidebar-primary-foreground': '142 50% 10%',
    'sidebar-accent': '24 12% 12%',
    'sidebar-accent-foreground': '30 10% 96%',
    'sidebar-border': '24 10% 15%',
    'sidebar-ring': '142 76% 60%',
    // Charts
    'chart-1': '142 70% 55%',
    'chart-2': '168 60% 55%',
    'chart-3': '24 80% 60%',
    'chart-4': '262 70% 65%',
    'chart-5': '346 70% 60%',
  },
};
```

### Step 3: Update All Theme Presets (1.5h)

3.1 Ocean theme:
```typescript
{
  name: 'Ocean',
  key: 'ocean',
  emoji: '🌊',
  mascotVariant: 'sailor',
  light: {
    primary: '168 76% 50%',
    // ... full color set
  },
  dark: { ... }
}
```

3.2 Continue for all 11 themes following the color mappings in R2.

### Step 4: Create Mascot Accessories (1h)

4.1 Create `/src/components/mascot/accessories/index.ts`:
```typescript
export { SailorHat } from './SailorHat';
export { Sunglasses } from './Sunglasses';
export { FlowerCrown } from './FlowerCrown';
export { BowTie } from './BowTie';
export { StarCape } from './StarCape';
export { LeafHeadband } from './LeafHeadband';
export { Scarf } from './Scarf';
export { Headphones } from './Headphones';
export { ChefHat } from './ChefHat';
export { Glasses } from './Glasses';
```

4.2 Create each accessory as simple SVG component:
```tsx
// /src/components/mascot/accessories/SailorHat.tsx
export function SailorHat({ className }: { className?: string }) {
  return (
    <g className={className}>
      <ellipse cx="60" cy="12" rx="25" ry="8" fill="#2DD4BF" />
      <rect x="40" y="12" width="40" height="10" fill="#1e3a5f" />
      <path d="M50 12 L60 2 L70 12" fill="#2DD4BF" />
    </g>
  );
}
```

### Step 5: Create Theme Preview Component (0.5h)

5.1 Create `/src/components/theme/ThemePreviewCard.tsx`:
```tsx
'use client';

import { ThemeVars } from '@/config/themes';
import { Mascot } from '@/components/mascot/Mascot';
import { cn } from '@/lib/utils';

interface ThemePreviewCardProps {
  theme: ThemeVars;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemePreviewCard({ theme, isSelected, onSelect }: ThemePreviewCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-3 rounded-xl border-2 transition-all',
        isSelected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{theme.emoji}</span>
        <div className="flex-1 text-left">
          <p className="font-medium">{theme.name}</p>
          <div className="flex gap-1 mt-1">
            {/* Color swatches */}
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: `hsl(${theme.light.primary})` }}
            />
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: `hsl(${theme.light.accent})` }}
            />
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: `hsl(${theme.light.secondary})` }}
            />
          </div>
        </div>
        <Mascot size="sm" />
      </div>
    </button>
  );
}
```

## Todo

- [x] Update ThemeVars type with emoji and mascotVariant
- [x] Redesign defaultTheme with new green primary
- [x] Redesign ocean theme (teal)
- [x] Redesign sunset theme (coral)
- [x] Redesign lavender theme (purple)
- [x] Redesign rose theme (pink)
- [x] Redesign midnight theme (indigo)
- [x] Redesign forest theme (emerald)
- [x] Redesign autumn theme (amber)
- [x] Redesign cherry theme (red)
- [x] Redesign mint theme (cyan)
- [x] Redesign mono theme (gray)
- [ ] Create SailorHat accessory
- [ ] Create Sunglasses accessory
- [ ] Create FlowerCrown accessory
- [ ] Create BowTie accessory
- [ ] Create StarCape accessory
- [ ] Create LeafHeadband accessory
- [ ] Create Scarf accessory
- [ ] Create Headphones accessory
- [ ] Create ChefHat accessory
- [ ] Create Glasses accessory
- [x] Create ThemePreviewCard component
- [ ] Update theme settings modal
- [ ] Test all themes in light/dark modes
- [ ] Verify mascot accessory rendering

## Success Criteria

1. All 11 themes render correctly in light/dark mode
2. Each theme has distinct, harmonized color palette
3. Theme preview shows mascot with correct accessory
4. Theme switching animates smoothly
5. Existing user theme preferences preserved (key compatibility)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing theme keys | Low | High | Keep same key values |
| Color accessibility issues | Medium | Medium | Test contrast ratios |
| Accessory SVG alignment | Medium | Low | Standardize viewBox |
| Theme-specific bugs | Medium | Low | Test each theme individually |

## Next Phase

[Phase 06: Animations & Polish](./phase-06-animations-polish.md)
