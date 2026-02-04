# Scout Report 01: Styling Infrastructure & Theme System
**Date**: 2026-02-04  
**Scope**: CSS variables, theme system, component library, animations, gamification

---

## 1. CSS/Styling Infrastructure

### Tailwind Configuration
- **Path**: `/Users/nguyendangdinh/Personal/Pomodoro/tailwind.config.js`
- **Details**: 
  - Dark mode: class-based (`darkMode: ['class']`)
  - Prefix: empty (no prefix)
  - Extended colors: background-light, background-dark
  - Custom keyframes: accordion-down, accordion-up, fade-in, slide-in-*, pulse-ring
  - Animations: Maps keyframes to motion utilities
  - Uses Tailwind CSS v3.4.18 with tailwindcss-animate plugin

### Global CSS/Base Styles
- **Path**: `/Users/nguyendangdinh/Personal/Pomodoro/src/app/globals.css`
- **Content**: 
  - Tailwind directives: base, components, utilities
  - Root CSS variables for light theme (default)
  - Dark mode overrides (`.dark` selector)
  - Scrollbar styling (webkit + Firefox)
  - Timer-specific animations: timer-pulse, timer-glow, timer-shake
  - Border-beam animation
  - Gradient animations: gradient-x, pulse-slow, spin-slow
  - Safe area utilities for notched devices (iOS/Android)
  - Sidebar-specific enhancements
  - Smooth transitions on theme toggle (body, color, border-color)

### CSS Variables Structure

**Light Theme** (:root):
```
Base colors:
  --background: 0 0% 100%
  --foreground: 0 0% 3.9%
  --primary: 0 0% 9%
  --secondary: 0 0% 96.1%
  --accent: 0 0% 96.1%
  --destructive: 0 84.2% 60.2%

Extended:
  --surface, --surface-variant
  --outline, --outline-variant
  --focus-active: 220 90% 56%
  --focus-inactive: 215 25% 27%
  --timer-foreground: 0 0% 9%
  --chart-1 through --chart-5 (for data visualization)
  --sidebar-* (12 sidebar-related variables)
  --radius: 0.5rem
```

**Dark Theme** (.dark):
- Inverted values for accessibility
- Focus colors remain consistent
- Chart colors adjusted for dark backgrounds

---

## 2. Theme System

### Theme Provider
- **Path**: `/Users/nguyendangdinh/Personal/Pomodoro/src/components/layout/theme-provider.tsx`
- **Dependencies**: next-themes
- **Structure**: 
  - Wraps NextThemesProvider from next-themes
  - Includes BackgroundProvider context
  - Client-side component ('use client')

### Theme Presets & Configuration
- **Path**: `/Users/nguyendangdinh/Personal/Pomodoro/src/config/themes.ts`
- **Type**: `ThemeVars` (name, key, light {}, dark {})
- **Default Theme**: "Default" (key: 'default')
  - Uses standard light/dark mode overrides in globals.css
- **Available Presets** (10 total):
  1. **Rose** (key: 'rose') - Pink/red tones
  2. **Green/Emerald** (key: 'emerald') - Green tones with custom radius
  3. **Indigo** (key: 'indigo') - Blue tones
  4. **Violet** (key: 'violet') - Purple tones
  5. **Amber** (key: 'amber') - Gold/orange tones
  6. **Cyan** (key: 'cyan') - Light blue tones
  7. **Teal** (key: 'teal') - Teal/green tones
  8. **Pink-Light** (key: 'pink-light') - Pastel pink
  9. **Pink-Mild** (key: 'pink-mild') - Saturated pink

Each preset includes:
- Light & dark mode color values (HSL format)
- Chart colors for data visualization
- Sidebar-specific colors
- Timer foreground colors
- Custom radius (some presets)

### Theme Toggle Components
- **AnimatedThemeToggler**: `/Users/nguyendangdinh/Personal/Pomodoro/src/components/ui/animated-theme-toggler.tsx`
  - Uses View Transition API for smooth theme switch animation
  - Circular clip-path animation from button position
  - Duration configurable (default: 400ms)
  - Optional label display
  - Fallback to standard toggle if API unavailable

- **ThemeToggle**: `/Users/nguyendangdinh/Personal/Pomodoro/src/components/layout/theme-toggle.tsx`
  - Simple toggle with Sun/Moon icons
  - Uses CSS transitions (rotate, scale)
  - No Framer Motion

---

## 3. Component Library (shadcn/ui)

### Core UI Components
Located in `/Users/nguyendangdinh/Personal/Pomodoro/src/components/ui/`

**Form Components**:
- button.tsx, input.tsx, label.tsx, textarea.tsx
- checkbox.tsx, radio-group.tsx, switch.tsx
- select.tsx, calendar.tsx

**Display Components**:
- badge.tsx, card.tsx, separator.tsx, skeleton.tsx
- table.tsx, tabs.tsx, progress.tsx, slider.tsx
- avatar.tsx, tooltip.tsx, popover.tsx

**Dialog/Modal Components**:
- dialog.tsx, alert-dialog.tsx, dropdown-menu.tsx
- sheet.tsx (off-canvas sidebar)

**Layout Components**:
- scroll-area.tsx, sidebar.tsx, floating-navbar.tsx

### Custom/Enhanced Components

**Animated Components**:
- `animated-theme-toggler.tsx` - Theme toggle with View Transition API
- `animated-icons.tsx` - Framer Motion icon animations
  - AnimatedTrash, AnimatedEdit, AnimatedTarget, AnimatedPlay, AnimatedSquare
  - Each with distinct hover animations (rotate, scale, translate)
- `animated-tabs.tsx` - Tab component with animations
- `animated-list.tsx` - List with entry animations
- `animated-testimonials.tsx` - Testimonial carousel
- `animated-sidebar-icons.tsx` - Sidebar icon animations

**Visual Effect Components**:
- border-beam.tsx - Animated border beam effect
- spotlight.tsx - Spotlight/glow effect
- background-beams-with-collision.tsx - Background animation
- bento-grid.tsx - Grid layout component
- lamp.tsx - Lamp-like glow effect
- sparkles.tsx - Sparkle particle effects
- text-generate-effect.tsx - Text generation animation

**Utilities**:
- loader.tsx, global-loader.tsx - Loading indicators
- toaster.tsx - Toast notifications (Sonner)

---

## 4. Animation System

### Framework
- **Primary**: Framer Motion (v12.23.24)
- **Fallback**: CSS-based transitions and keyframes

### Framer Motion Usage
Found in: `/Users/nguyendangdinh/Personal/Pomodoro/src/components/ui/animated-icons.tsx`
- `motion` component for HTML elements
- `Variants` interface for defining animation states
- `whileHover` prop for hover-triggered animations
- Examples:
  ```
  trashVariants: rotate [0, -10, 10, -10, 10, 0] over 0.5s
  editVariants: rotate + scale over 0.3s
  targetVariants: scale + rotate (180°) over 0.4s
  ```

### Tailwind-based Animations
Defined in `tailwind.config.js`:
- accordion-down/up: 0.2s ease-out
- fade-in: 0.5s ease-out
- slide-in-from-top/bottom: 0.3s ease-out
- pulse-ring: 2s infinite (scale + opacity)

### CSS Keyframes
In `globals.css`:
- **timer-pulse**: Scale 1 → 1.03 → 1 (0.15s)
- **timer-shake**: Subtle X-axis shake (0.18s)
- **gradient-x**: Background position shift (3s)
- **pulse-slow**: Opacity fade (2s)
- **spin-slow**: 360° rotation (3s)
- **border-beam**: Offset-distance animation
- **pulse-red/primary**: Box-shadow pulse effect (2s)

### Transition Classes
- `.timer-state-transition`: opacity + transform (0.2s ease-in-out)
- `.timer-button-transition`: opacity + transform (0.15s ease-out)
- Body theme toggle: 0.3s on background, color, border-color
- SVG elements: transition disabled to avoid performance issues

---

## 5. Current Gamification Features

### Streak Tracking System
- **Path**: `/Users/nguyendangdinh/Personal/Pomodoro/src/components/focus/streak-tracker.tsx`
- **Features**:
  - Daily streak counter with localStorage persistence
  - Calendar view (month-based, with navigation)
  - Mark-today button to record focused day
  - Milestone tracking: 7, 30, 100 days
  - Toast notifications for achievements
  - History tracking (ISO dates)
  - Current streak calculation algorithm

- **UI Elements**:
  - Flame icon (from lucide-react)
  - Card-based layout
  - Calendar grid (7 columns, color-coded)
  - Focused days: primary/80 background
  - Today indicator: ring-2 ring-primary
  - Stats display: current streak, month count
  - Milestone progress tracker

- **Storage**:
  - Key: `pomodoro-streak`
  - Structure: { streak, lastDateISO, history }
  - Validation & sanitization on load

### Gamification Components Status
- **Badges**: Basic badge component exists (shadcn/ui), no badge system implemented
- **XP/Level System**: Not found in scout
- **Rewards**: Not found in scout
- **Achievements**: Only milestones (7, 30, 100) in streak tracker

### Related Research
- **Path**: `/Users/nguyendangdinh/Personal/Pomodoro/docs/plans/2026-02-04-study-bro-rebranding-system/research/researcher-01-gamification.md`
- Contains gamification strategy documentation (not detailed in this scout)

---

## 6. Key Files Summary

| File | Purpose | Type |
|------|---------|------|
| `tailwind.config.js` | Tailwind configuration | Config |
| `src/app/globals.css` | Global styles, CSS variables | Styles |
| `src/config/themes.ts` | Theme presets & definitions | Config |
| `src/components/layout/theme-provider.tsx` | Theme context provider | Component |
| `src/components/layout/theme-toggle.tsx` | Simple theme toggle | Component |
| `src/components/ui/animated-theme-toggler.tsx` | Animated theme toggle | Component |
| `src/components/ui/animated-icons.tsx` | Framer Motion icons | Component |
| `src/components/focus/streak-tracker.tsx` | Streak gamification | Component |

---

## 7. Architecture Notes

### CSS Variable Convention
- HSL format: `hsl(var(--primary))` for dynamic theme switching
- Semantic naming: background, foreground, primary, secondary, accent, destructive
- Sidebar-specific variants for navigation UI
- Timer-specific variable for unified color management

### Theme Switching
- CSS class-based: `.dark` on root element
- Next-themes integration for SSR support
- View Transition API for animated switch
- Smooth color/background transitions (0.3s)

### Animation Strategy
- **Performance-first**: SVG excluded from transitions, image/video excluded
- **Accessibility**: Uses safe, subtle animations
- **Mixed approach**: Framer Motion for interactive components, CSS for bulk animations
- **Timer-specific**: Custom keyframes for visual feedback during focus sessions

### Sidebar Architecture
- Dedicated color system (12 variables)
- Enhanced focus states
- Gradient separators
- Glow effects on active menu items

---

## 8. Unresolved Questions

- Where is the background context (`BackgroundProvider`) defined? (imported in theme-provider)
- Are there additional XP/level systems beyond streak tracking?
- How is the theme preset applied to CSS variables at runtime?
- Are there any CSS-in-JS solutions in use (emotion, styled-components)?

