# Study Bro - Website Rebranding System
> Brainstorm Summary | 2026-02-04

---

## 📋 Problem Statement

### Current Issues
- **Brand identity yếu**: Logo, màu sắc, typography chưa memorable/unique
- **UI/UX outdated**: Giao diện cần refresh cho hiện đại hơn
- **Lack of differentiation**: Không có yếu tố unique để cạnh tranh

### Target Audience
- **Primary**: Học sinh, Sinh viên (Gen Z) - cần fun, engaging
- **Secondary**: Professionals, Freelancers - cần clean, professional
- **Goal**: Balance giữa playful và professional

---

## 🎯 Rebranding Scope

| Aspect | Decision |
|--------|----------|
| Brand Name | **Giữ "Study Bro"** |
| Style Direction | **Playful & Friendly** (Duolingo/Headspace inspired) |
| Color Approach | **Combo A+B**: Green growth + Warm accents |
| Mascot | **Shiba Inu character** |
| Typography | **Rounded & Friendly** |
| Animations | **Rich with Framer Motion** |
| Gamification | **Full**: Streaks, badges, levels, rewards |
| Themes | **Redesign all 11 themes** |

---

## 🎨 Brand Identity System

### 1. Color Palette

#### Primary Colors
```css
/* Growth Green - Main brand color */
--primary: #4ADE80;        /* Fresh, energetic green */
--primary-dark: #22C55E;   /* Darker variant */
--primary-light: #86EFAC;  /* Lighter variant */

/* Warm Accent - Energy & enthusiasm */
--accent: #FB923C;         /* Warm coral/orange */
--accent-dark: #F97316;
--accent-light: #FDBA74;

/* Focus Teal - Calm & balance */
--secondary: #2DD4BF;      /* Soft teal */
--secondary-dark: #14B8A6;
--secondary-light: #5EEAD4;
```

#### Semantic Colors
```css
/* Success/Progress */
--success: #4ADE80;

/* Warning/Streak at risk */
--warning: #FBBF24;

/* Destructive/Streak lost */
--destructive: #F87171;

/* Info/Tips */
--info: #60A5FA;
```

#### Neutral Palette
```css
/* Warm grays for friendly feel */
--background: #FAFAF9;     /* Warm white */
--foreground: #1C1917;     /* Warm black */
--muted: #F5F5F4;
--border: #E7E5E4;
```

### 2. Typography

#### Recommended Font Stack
```css
/* Primary - Headers & UI */
font-family: 'Nunito', 'Poppins', sans-serif;
/* Weights: 400, 500, 600, 700, 800 */

/* Secondary - Body text (Vietnamese support) */
font-family: 'Be Vietnam Pro', sans-serif;
/* Weights: 400, 500, 600 */

/* Monospace - Code/Timer */
font-family: 'JetBrains Mono', monospace;
```

#### Type Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px - Timer */
```

### 3. Mascot System - "Studie" the Shiba

#### Character Design Guidelines
- **Base pose**: Friendly, alert, ready to help
- **Style**: 2D vector, soft gradients, rounded edges
- **Colors**:
  - Main: `#FFB347` (warm orange-tan)
  - Accent: `#FFF5E6` (cream chest)
  - Details: `#1C1917` (eyes, nose)

#### Expression States
| State | Usage | Description |
|-------|-------|-------------|
| **Happy** | Task complete, streak maintained | Tail wagging, bright eyes |
| **Focused** | During Pomodoro session | Determined look, slightly squinted |
| **Encouraging** | Session starting, motivation | Thumbs up paw, smile |
| **Sleepy** | Break time | Yawning, relaxed |
| **Excited** | Achievement unlocked, level up | Jumping, sparkles |
| **Worried** | Streak at risk | Concerned look, ears down |
| **Sad** | Streak lost | Droopy ears, watery eyes |
| **Celebrating** | Major milestone | Party hat, confetti |

#### Mascot Placement
- **Timer screen**: Small reactive mascot in corner
- **Empty states**: Full illustration with message
- **Achievement modals**: Celebrating pose
- **Onboarding**: Guide character
- **Error states**: Helpful pose with tips

---

## 🎮 Gamification System

### 1. Streak System

```typescript
interface StreakSystem {
  currentStreak: number;
  longestStreak: number;
  streakFreeze: number; // Items to protect streak
  lastActiveDate: Date;

  // Visual states
  flame_stages: ['spark', 'small', 'medium', 'large', 'inferno'];
  // 1-7 days, 8-14 days, 15-30 days, 31-60 days, 60+ days
}
```

### 2. Level & XP System

```typescript
interface LevelSystem {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;

  // XP earning actions
  completedPomodoro: 10; // XP per completed session
  completedTask: 5;
  dailyStreak: 20;
  weeklyGoal: 50;
  achievementUnlock: varies;
}

// Level titles (themed)
const levelTitles = [
  'Rookie Pup',        // 1-5
  'Study Apprentice',  // 6-10
  'Focus Warrior',     // 11-20
  'Productivity Pro',  // 21-30
  'Master Scholar',    // 31-50
  'Legendary Bro',     // 51+
];
```

### 3. Achievement/Badge System

#### Badge Categories
1. **Streak Badges**: 7-day, 30-day, 100-day, 365-day
2. **Session Badges**: First session, 100 sessions, 1000 sessions
3. **Time Badges**: 10 hours, 100 hours, 1000 hours focused
4. **Special Badges**: Early bird, Night owl, Weekend warrior
5. **Seasonal Badges**: Limited time achievements

### 4. Virtual Rewards

```typescript
interface RewardSystem {
  coins: number;

  // Purchasable with coins
  themes: ThemeUnlock[];
  mascotOutfits: Outfit[]; // Hats, accessories for Studie
  backgroundPacks: Background[];
  soundPacks: Sound[];

  // Special rewards
  streakFreezes: number;
  doubleXPTokens: number;
}
```

---

## 🎨 Theme System Redesign

### New Theme Structure

Each theme includes:
```typescript
interface Theme {
  id: string;
  name: string;
  emoji: string;

  colors: {
    light: ColorSet;
    dark: ColorSet;
  };

  // Optional theme-specific
  mascotVariant?: string; // Studie outfit for this theme
  backgroundSuggestion?: string;
  soundPack?: string;
}
```

### Redesigned Theme Presets (11 Themes)

| # | Theme | Primary | Vibe | Mascot Variant |
|---|-------|---------|------|----------------|
| 1 | **Default** | Green `#4ADE80` | Fresh, Growth | Normal Studie |
| 2 | **Ocean** | Teal `#2DD4BF` | Calm, Focus | Sailor hat |
| 3 | **Sunset** | Coral `#FB923C` | Warm, Energetic | Sunglasses |
| 4 | **Lavender** | Purple `#A78BFA` | Creative, Soft | Flower crown |
| 5 | **Rose** | Pink `#F472B6` | Cute, Friendly | Bow tie |
| 6 | **Midnight** | Indigo `#818CF8` | Deep focus, Night | Star cape |
| 7 | **Forest** | Emerald `#34D399` | Natural, Zen | Leaf headband |
| 8 | **Autumn** | Amber `#FBBF24` | Cozy, Warm | Scarf |
| 9 | **Cherry** | Red `#F87171` | Bold, Passionate | Headphones |
| 10 | **Mint** | Cyan `#22D3EE` | Fresh, Clean | Chef hat |
| 11 | **Monochrome** | Gray `#A1A1AA` | Minimal, Pro | Glasses |

---

## 🎭 UI Component Guidelines

### 1. Border Radius
```css
--radius-sm: 0.5rem;   /* 8px - small elements */
--radius-md: 0.75rem;  /* 12px - buttons, inputs */
--radius-lg: 1rem;     /* 16px - cards */
--radius-xl: 1.5rem;   /* 24px - modals, panels */
--radius-full: 9999px; /* pills, avatars */
```

### 2. Shadows
```css
/* Soft, friendly shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
--shadow-glow: 0 0 20px var(--primary-light);
```

### 3. Animation Tokens
```css
/* Timing */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easing */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### 4. Key Animations

#### Mascot Reactions
```css
@keyframes mascot-happy {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes mascot-celebrate {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
```

#### Progress Celebrations
```css
@keyframes confetti-burst {
  /* Particle explosion for achievements */
}

@keyframes level-up-glow {
  0% { box-shadow: 0 0 0 0 var(--primary); }
  100% { box-shadow: 0 0 30px 10px transparent; }
}

@keyframes streak-flame {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
}
```

---

## 📱 Key Screen Redesigns

### 1. Timer Screen
- Central large timer với countdown
- Mascot "Studie" phản ứng theo trạng thái
- Progress ring với gradient
- Quick stats: streak, XP, level
- Ambient animations (subtle particles khi focus)

### 2. Dashboard
- Daily/Weekly progress charts
- Streak calendar heatmap
- Recent achievements
- Mascot greeting based on time of day
- Quick start session button

### 3. Profile/Stats
- Level progress bar prominent
- Achievement showcase
- Statistics với beautiful visualizations
- Mascot customization preview

### 4. Achievement/Reward Screens
- Full celebration animations
- Mascot reactions
- Share to social options
- Confetti effects

---

## 🛠 Implementation Considerations

### Technical Architecture

1. **Design Tokens System**
   - Migrate từ CSS variables hiện tại
   - Add semantic tokens cho gamification
   - Theme-able mascot variants

2. **Component Updates**
   - Update 44 shadcn components với new tokens
   - Add gamification components (badges, progress, streak)
   - Create mascot component system

3. **Animation Library**
   - Leverage existing Framer Motion
   - Add celebration animations (confetti, particles)
   - Mascot animation state machine

4. **Asset Pipeline**
   - SVG mascot variants
   - Achievement badge icons
   - Theme-specific backgrounds

### Migration Strategy

1. **Phase 1**: Design tokens & color system
2. **Phase 2**: Typography & base components
3. **Phase 3**: Mascot system & assets
4. **Phase 4**: Gamification UI components
5. **Phase 5**: Theme redesign (all 11)
6. **Phase 6**: Animations & polish

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing user themes | Provide migration path, save old preferences |
| Performance với animations | Respect prefers-reduced-motion, lazy load |
| Mascot asset file size | SVG sprites, lazy loading, CDN |
| Gamification complexity | Start với core features, iterate |

---

## 📊 Success Metrics

### Brand Metrics
- [ ] User recognition/recall survey improvement
- [ ] Social media mention sentiment
- [ ] App store rating improvement

### Engagement Metrics
- [ ] Daily active users increase
- [ ] Session completion rate
- [ ] Streak retention rate
- [ ] Time spent in app

### Gamification Metrics
- [ ] Achievement unlock rate
- [ ] Theme/reward purchase rate
- [ ] Share/social actions

---

## 🔗 References & Inspiration

### Research Sources
- [Duolingo Brand Colors - Mobbin](https://mobbin.com/colors/brand/duolingo)
- [Headspace Design System - Figma Blog](https://www.figma.com/blog/building-a-design-system-that-breathes-with-headspace/)
- [Color Psychology in Apps - UXPin](https://www.uxpin.com/studio/blog/color-schemes-for-apps/)
- [Productivity App Designs - DesignRush](https://www.designrush.com/best-designs/apps/productivity)
- [Pomodoro Apps Review - Reclaim](https://reclaim.ai/blog/best-pomodoro-timer-apps)

### Design Inspiration
- **Duolingo**: Gamification, mascot reactions, celebration UX
- **Headspace**: Soft animations, calming colors, friendly illustrations
- **Forest**: Growth visualization, nurturing concept
- **Notion**: Clean UI, subtle personality

---

## ✅ Next Steps

1. **Create detailed implementation plan** với `/plan:hard`
2. Design mascot "Studie" variations
3. Build design token system
4. Prototype key screens
5. User testing với new brand

---

*Brainstorm completed: 2026-02-04*
*Status: Ready for implementation planning*
