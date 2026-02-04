---
title: "Phase 02: Typography & Base Components"
status: DONE
effort: 3h
dependencies: [phase-01]
completed: 2026-02-04
---

# Phase 02: Typography & Base Components

**Parent Plan**: [plan.md](./plan.md)
**Depends On**: [Phase 01](./phase-01-design-tokens-color-system.md)

## Overview

Add Nunito/Poppins rounded fonts for playful UI. Update layout.tsx font stack. Adjust base component styles (buttons, inputs, cards) for friendlier appearance.

## Key Insights (from Research)

- Current fonts: Be Vietnam Pro (body), Space Grotesk (numbers/tech)
- Rounded fonts (Nunito) improve approachability for Gen Z audience
- Keep Be Vietnam Pro for Vietnamese text support
- Typography scale already defined, just need font-family updates

## Requirements

### R1: Font Stack Addition
Add Nunito as primary UI font:
- Headers, buttons, labels: Nunito
- Body text (Vietnamese): Be Vietnam Pro (existing)
- Numbers/Timer: Space Grotesk (existing, keep for monospace digits)

### R2: Border Radius Adjustments
Increase default radius for friendlier feel:
```css
--radius: 0.75rem;  /* was 0.5rem */
--radius-sm: 0.5rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;
--radius-full: 9999px;
```

### R3: Shadow Softening
Update shadows for warmer appearance:
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.07);
--shadow-glow: 0 0 20px hsl(var(--primary) / 0.3);
```

### R4: Button Style Updates
- Larger padding (px-5 py-2.5 default)
- Bolder font weight (600)
- Subtle hover lift effect

## Architecture Decisions

1. **Google Fonts via next/font** - follows existing pattern
2. **CSS variable approach** - font-family set via variables for theme flexibility
3. **Keep fallback stack** - Nunito -> Be Vietnam Pro -> system-ui

## Related Files

| File | Action |
|------|--------|
| `/src/app/layout.tsx` | Add Nunito font import, update body class |
| `/src/app/globals.css` | Add radius/shadow variables |
| `/tailwind.config.js` | Add font-family extension |
| `/src/components/ui/button.tsx` | Update variant styles |
| `/src/components/ui/card.tsx` | Update border-radius |
| `/src/components/ui/input.tsx` | Update border-radius |

## Implementation Steps

### Step 1: Add Nunito Font (1h)

1.1 Update `/src/app/layout.tsx`:
```tsx
import { Be_Vietnam_Pro, Space_Grotesk, Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
});

// Update body className
<body className={`${nunito.variable} ${spaceGrotesk.variable} ${beVietnamPro.variable} font-sans`}>
```

1.2 Update `/tailwind.config.js`:
```js
extend: {
  fontFamily: {
    sans: ['var(--font-nunito)', 'var(--font-be-vietnam-pro)', 'system-ui', 'sans-serif'],
    'space-grotesk': ['var(--font-space-grotesk)', 'monospace'],
    mono: ['var(--font-space-grotesk)', 'JetBrains Mono', 'monospace'],
  },
}
```

### Step 2: Update Radius & Shadow Variables (0.5h)

2.1 Add to `/src/app/globals.css` `:root`:
```css
/* Border radius scale */
--radius: 0.75rem;
--radius-sm: 0.5rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;

/* Soft shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.07);
--shadow-glow: 0 0 20px hsl(var(--primary) / 0.3);
```

2.2 Update Tailwind config:
```js
extend: {
  borderRadius: {
    lg: 'var(--radius-lg)',
    md: 'var(--radius)',
    sm: 'var(--radius-sm)',
    xl: 'var(--radius-xl)',
  },
  boxShadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    glow: 'var(--shadow-glow)',
  },
}
```

### Step 3: Update Base Components (1.5h)

3.1 Update `/src/components/ui/button.tsx`:
```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0',
  {
    variants: {
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-9 px-4',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
  }
)
```

3.2 Update `/src/components/ui/card.tsx`:
- Ensure uses `rounded-lg` (maps to --radius-lg)

3.3 Update `/src/components/ui/input.tsx`:
- Ensure uses `rounded-md` (maps to --radius)
- Add subtle focus glow

## Implementation Summary (Completed 2026-02-04)

All requirements successfully implemented:

### Fonts Added
- **Nunito** (400/500/600/700/800, latin + vietnamese)
- **Be Vietnam Pro** (300/400/500/600/700, latin + vietnamese)
- **Space Grotesk** (300/400/500/600/700, latin)

### CSS Variables Defined
- Border radius scale: --radius-sm/--radius/--radius-lg/--radius-xl
- Shadow palette: --shadow-sm/--shadow-md/--shadow-lg/--shadow-glow

### Components Updated
| Component | Changes |
|-----------|---------|
| layout.tsx | Nunito font import + variable configuration |
| globals.css | New radius and shadow variables |
| tailwind.config.js | fontFamily, borderRadius, boxShadow extensions |
| button.tsx | font-semibold, hover:-translate-y-0.5 lift effect, px-5 py-2.5 default |
| input.tsx | rounded-md, focus-visible:shadow-glow |

## Verification Checklist

- [x] Nunito font loads with Vietnamese subset
- [x] Buttons have friendlier appearance with hover lift
- [x] Cards/inputs use increased border radius
- [x] Vietnamese text renders correctly with proper fallback
- [x] Timer continues using Space Grotesk for monospace digits
- [x] All shadow variables implemented in Tailwind config
- [x] Focus states use --shadow-glow for visual feedback

## Success Criteria

1. Nunito font loads and applies to UI elements
2. Buttons have friendlier appearance with slight hover lift
3. Cards/inputs have larger border radius
4. Vietnamese text renders correctly with fallback
5. Timer still uses Space Grotesk for digits

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Font load delay (FOIT) | Low | Low | Using font-display: swap |
| Vietnamese text fallback | Low | Medium | Be Vietnam Pro in fallback stack |
| Button layout shifts | Medium | Low | Test all button sizes |

## Next Phase

[Phase 03: Mascot System & Assets](./phase-03-mascot-system-assets.md)
