# Study Bro App - Codebase Summary

**Last Updated**: 2026-02-05
**Framework**: Next.js 14 (App Router) + React 18 + TypeScript
**Status**: Active Development (Phase 06 Complete)

## Project Overview

Study Bro is a modern productivity and gamification platform combining:
- **Pomodoro Timer** with adaptive session scheduling
- **Task Management** with drag-and-drop, smart templates, and subtasks
- **Gamification System** featuring levels, badges, XP, and coins
- **AI Assistant** powered by multiple LLM models (GPT-4, Claude, Gemini)
- **Smart Analytics** tracking focus sessions, productivity trends, and goals

Built for Gen Z students with Vietnamese language support and accessibility-first design.

---

## Core Technology Stack

### Frontend Framework
- **Next.js 14.0.4** - App Router, SSR, ISR, API Routes
- **React 18** - Server Components, Client Components, Hooks
- **TypeScript** - Type-safe development across full stack

### State & Data Management
- **Zustand** - Client-side persistent state (timer, user, gamification)
- **TanStack Query v5** - Server-state sync, caching, optimistic updates
- **Supabase Client** - Real-time database and authentication

### UI & Styling
- **Tailwind CSS** - Utility-first styling with custom design system
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Physics-based animations and transitions
- **Lucide React** - Lightweight icon library
- **canvas-confetti** - Celebration particle effects

### Backend & Services
- **Supabase** - PostgreSQL database, Auth (GoTrue), Real-time subscriptions
- **MegaLLM** - Unified LLM inference (GPT-4, Claude, Gemini switching)
- **Vercel AI SDK** - Streaming response handling for AI chat
- **Spotify API** - Music integration for focus sessions
- **YouTube API** - Video content recommendations

### Developer Tools
- **ESLint + Prettier** - Code quality and formatting
- **Vitest/Jest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Git/GitHub** - Version control and CI/CD

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Protected routes group
│   │   ├── layout.tsx            # Main app layout with GamificationCelebrationProvider
│   │   ├── page.tsx              # Dashboard
│   │   ├── timer/                # Pomodoro timer pages
│   │   ├── tasks/                # Task management pages
│   │   ├── gamification/         # Leaderboard, badges, profile
│   │   └── chat/                 # AI assistant interface
│   ├── auth/                     # Authentication pages (login, signup)
│   ├── api/                      # API routes
│   │   ├── chat                  # LLM streaming endpoint
│   │   ├── tasks                 # Task CRUD operations
│   │   ├── sessions              # Pomodoro session tracking
│   │   └── gamification          # XP, badge, level calculations
│   ├── layout.tsx                # Root layout with fonts
│   ├── globals.css               # Global styles + CSS variables
│   ├── middleware.ts             # Auth middleware at Edge
│   └── error.tsx, not-found.tsx  # Error pages
│
├── components/                   # React components by feature
│   ├── ui/                       # Base components (Button, Input, Card, etc.)
│   ├── animations/               # Celebration effects
│   │   ├── Confetti.tsx          # Canvas-based confetti with intensity control
│   │   ├── LevelUpCelebration.tsx # Full-screen level-up modal
│   │   ├── XPFlyNumber.tsx       # Floating XP/coin numbers
│   │   └── index.ts              # Public animation API
│   ├── timer/                    # Pomodoro timer components
│   │   ├── TimerDisplay.tsx      # Large countdown display
│   │   ├── TimerControls.tsx     # Play/pause/skip buttons
│   │   ├── SessionSelector.tsx   # Work/break duration picker
│   │   └── NotificationBell.tsx  # Audio/notification settings
│   ├── tasks/                    # Task management UI
│   │   ├── TaskList.tsx          # Drag-and-drop task container
│   │   ├── TaskCard.tsx          # Individual task item
│   │   ├── TaskForm.tsx          # Create/edit task modal
│   │   ├── TaskTemplates.tsx     # Quick task templates
│   │   └── SubtaskManager.tsx    # Nested subtask UI
│   ├── gamification/             # Gamification UI
│   │   ├── GamificationCelebrationProvider.tsx # Global celebration provider
│   │   ├── LevelBadge.tsx        # XP/level display
│   │   ├── BadgeCard.tsx         # Badge showcase
│   │   ├── Leaderboard.tsx       # User ranking
│   │   └── StatCard.tsx          # Stats display
│   ├── chat/                     # AI assistant UI
│   │   ├── ChatInterface.tsx     # Main chat container
│   │   ├── MessageBubble.tsx     # Message rendering
│   │   ├── ModelSelector.tsx     # LLM model switcher
│   │   └── ContextMenu.tsx       # Chat context settings
│   └── layout/                   # Layout components
│       ├── Header.tsx            # Top navigation
│       ├── Sidebar.tsx           # Navigation sidebar
│       ├── Footer.tsx            # Footer
│       └── NotificationCenter.tsx # Notification panel
│
├── hooks/                        # Custom React hooks
│   ├── useReducedMotion.ts       # Accessibility: prefers-reduced-motion detection
│   ├── useGamificationCelebrations.ts # Celebration state management
│   ├── useTimer.ts               # Pomodoro timer logic with deadlineAt
│   ├── useLocalStorage.ts        # Persistent state hook
│   ├── useTasks.ts               # Task CRUD with TanStack Query
│   ├── useDebounce.ts            # Input debouncing
│   ├── useIntersectionObserver.ts # Lazy loading trigger
│   └── useTheme.ts               # Dark/light mode toggle
│
├── stores/                       # Zustand state management
│   ├── timer-store.ts            # Timer state: time, status, deadlineAt
│   ├── user-store.ts             # User: profile, preferences, theme
│   ├── gamification-store.ts     # Gamification: level, XP, badges, coins
│   ├── task-store.ts             # Local task state cache
│   ├── notification-store.ts     # UI notifications and toasts
│   └── theme-store.ts            # Theme preference (light/dark)
│
├── lib/                          # Utilities and configurations
│   ├── supabase.ts               # Supabase client initialization
│   ├── supabase-server.ts        # Server-side Supabase operations
│   ├── constants.ts              # App-wide constants
│   ├── utils.ts                  # Helper functions (cn, format, etc.)
│   └── spotify-utils.ts          # Spotify integration helpers
│
├── config/                       # Configuration files
│   ├── animations.ts             # Animation variants, durations, easings, colors
│   ├── gamification.ts           # Level titles, badge definitions, XP formulas
│   ├── timer-presets.ts          # Predefined timer configurations (Pomodoro, custom)
│   ├── task-templates.ts         # Quick task template library
│   └── theme.ts                  # Color system, typography, design tokens
│
├── contexts/                     # React Context API
│   ├── AuthContext.tsx           # Authentication state
│   ├── ThemeContext.tsx          # Dark/light mode provider
│   ├── I18nContext.tsx           # Localization (Vietnamese/English)
│   └── NotificationContext.tsx   # Toast/notification provider
│
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Database schema types (auto-generated from Supabase)
│   ├── api.ts                    # API request/response types
│   ├── gamification.ts           # Gamification domain types
│   └── ui.ts                     # UI component prop types
│
├── middleware.ts                 # Next.js Edge Middleware
│   └── Auth checks, session validation
│
└── env.ts                        # Environment variables schema (Zod)
```

---

## Key Features by Phase

### Phase 01: Foundation & Analytics (COMPLETED)
- Basic Pomodoro timer with countdown
- Session tracking and database schema
- Analytics dashboard with productivity metrics
- User authentication (Supabase)

### Phase 02: Typography & Base Components (COMPLETED)
- Font stack: Nunito (UI), Be Vietnam Pro (body), Space Grotesk (numbers)
- CSS design system: radius scale, shadow palette, color tokens
- Base UI components: Button, Input, Card, Modal
- Dark mode support with warm color tints

### Phase 03: Mascot System & Assets (COMPLETED)
- SVG mascot character with customizable emotions
- 8 emotion states: happy, focused, encouraging, sleepy, excited, worried, sad, celebrating
- Animated mascot presence in sidebar
- Mascot dialogue for UI guidance

### Phase 04: Gamification Engine (COMPLETED)
- XP and coin earning on session completion
- Dynamic level progression (exponential XP curves)
- Badge unlock system with achievement tracking
- Leaderboard with user ranking

### Phase 05: Task Management & Drag-Drop (COMPLETED)
- Full CRUD operations for tasks with optimistic updates
- Drag-and-drop task reordering
- Subtask support with completion tracking
- Task templates for quick creation (Study, Code, Exercise, etc.)
- Recurring task patterns

### Phase 06: Animations & Polish (COMPLETED)
- Celebration animations: confetti, level-up modals, XP fly numbers
- Animation configuration system with variants and easings
- Accessibility: useReducedMotion hook with proper fallbacks
- Global GamificationCelebrationProvider for consistent celebrations
- Mascot animation states (8 emotions with motion)
- Performance-optimized animation components

### Phase 07-10: Planned
- Advanced analytics and insights
- Multiplayer challenges and social features
- AI-powered study recommendations
- Performance optimization and scaling

---

## Data Model

### Core Tables (Supabase PostgreSQL)

#### users
- `id` (UUID, PK)
- `email` (text, unique)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### sessions
- `id` (UUID, PK)
- `user_id` (FK: users)
- `duration_minutes` (int)
- `completed` (boolean)
- `started_at` (timestamp)
- `ended_at` (timestamp)

#### tasks
- `id` (UUID, PK)
- `user_id` (FK: users)
- `title` (text)
- `description` (text)
- `completed` (boolean)
- `order` (int, for drag-and-drop)
- `parent_id` (FK: tasks, for subtasks)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### gamification
- `id` (UUID, PK)
- `user_id` (FK: users)
- `level` (int, default: 1)
- `xp_total` (int, default: 0)
- `xp_next_level` (int, calculated)
- `coins` (int, default: 0)
- `updated_at` (timestamp)

#### badges
- `id` (UUID, PK)
- `user_id` (FK: users)
- `badge_id` (text, e.g., "first_session", "level_10")
- `unlocked_at` (timestamp)

#### conversations
- `id` (UUID, PK)
- `user_id` (FK: users)
- `model` (text, e.g., "gpt-4", "claude-3")
- `created_at` (timestamp)

#### messages
- `id` (UUID, PK)
- `conversation_id` (FK: conversations)
- `role` (enum: "user" | "assistant")
- `content` (text)
- `created_at` (timestamp)

---

## Animation System (Phase 06)

### Variants Library
Centralized in `/src/config/animations.ts`:
- Button hover/tap effects
- Card scale transitions
- Badge unlock spin + scale
- XP fly fade + rise
- Coin earn pulse + rotation
- Mascot emotions (8 states with body/eyes/tail motion)
- Level up modal entry/exit
- Glow ring expanding effect

### Animation Hooks
- **useReducedMotion()** - Accessibility preference detection
- **useGamificationCelebrations()** - Celebration state from gamification store

### Animation Components
- **Confetti** - Canvas-based particle effect with intensity control (low/medium/high)
- **LevelUpCelebration** - Full-screen modal with confetti and glow ring
- **XPFlyNumber** - Floating number with fade + rise animation
- **GamificationCelebrationProvider** - Global provider for automatic celebration rendering

### Configuration
- **Durations**: fast (0.15s), normal (0.3s), slow (0.5s), celebration (2s)
- **Easings**: bounce, smooth, spring
- **Colors**: Green, Orange, Cyan, Amber, Pink (brand-aligned)

---

## State Management Architecture

### Client-Side (Zustand Stores)
```typescript
// Persistent stores (synced to localStorage)
timerStore          // time, status, deadlineAt
userStore           // profile, preferences
gamificationStore   // level, XP, badges, coins
taskStore          // local task cache
notificationStore  // toast/snackbar state
themeStore         // light/dark mode preference
```

### Server-Side (TanStack Query)
```typescript
// Cache management with automatic sync
useQuery(['tasks'])           // Fetch from /api/tasks
useMutation(updateTask)       // POST to /api/tasks
optimisticUpdateQuery()       // Instant UI update
```

### Global Providers
- **GamificationCelebrationProvider** - Celebration rendering
- **ThemeProvider** - Dark mode toggle
- **I18nProvider** - Language switching
- **AuthProvider** - Session management

---

## Code Standards

### TypeScript Patterns
- Strict mode enabled (`strict: true`)
- No implicit `any` (`noImplicitAny: true`)
- Proper type exports for component props
- Database types auto-generated from Supabase schema

### Component Architecture
- **Server Components** by default (better performance)
- **Client Components** only when hooks/interactivity needed (`'use client'`)
- **Composition** over inheritance
- **Prop drilling** avoided via context/stores

### Naming Conventions
```typescript
// Components: PascalCase
ComponentName.tsx

// Hooks: use* prefix, camelCase
useTimer, useReducedMotion

// Stores: *Store suffix, camelCase
timerStore, gamificationStore

// Config: SCREAMING_SNAKE_CASE constants
ANIMATION_DURATIONS, CONFETTI_COLORS

// Variables/functions: camelCase
calculateXP, handleLevelUp
```

### Styling Strategy
- **Tailwind utilities** for layout and responsive design
- **CSS variables** for design tokens (colors, radius, shadows)
- **Dark mode** via `next-themes` with warm HSL tints
- **Animations** via Framer Motion variants

### File Organization
- One component per file (except UI primitives)
- Hooks colocated with features or in `/hooks` directory
- Config files centralized in `/src/config/`
- Types in `/src/types/` with domain-specific organization

---

## Accessibility Features

### Motion & Animation
- **useReducedMotion()** - Respects `prefers-reduced-motion: reduce` preference
- **Instant Completion** - Animations skip when reduced motion enabled
- **Fallback States** - Static UI always functional without animation

### Keyboard Navigation
- **Semantic HTML** - Proper heading hierarchy, form labels
- **Focus Management** - Visible focus indicators, tab order
- **ARIA Labels** - Image alt text, button descriptions

### Color & Contrast
- **WCAG AA Compliance** - Minimum 4.5:1 contrast ratio for text
- **Color Not Only** - Information not conveyed by color alone
- **Dark Mode** - Full color system for light and dark themes

### Localization
- **Vietnamese Support** - Font subsetting, RTL-ready structure
- **i18n System** - Translation keys in config files
- **Locale Detection** - Browser language preference fallback

---

## Performance Optimizations

### Code Splitting
- **Route-based splitting** - Each page auto-split by Next.js
- **Dynamic imports** - Heavy components (chat, analytics) lazy-loaded
- **Image optimization** - `next/image` with responsive sizing

### Rendering Strategy
- **Server Components** - Reduce JavaScript sent to client
- **Streaming** - Progressive page rendering with suspense
- **ISR** - Static pages revalidated on demand

### Data Fetching
- **TanStack Query** - Request deduplication and caching
- **Optimistic Updates** - Instant UI feedback before API response
- **Mutation Batching** - Reduce API calls on bulk operations

### Asset Optimization
- **Font subsetting** - Vietnamese characters only loaded when needed
- **SVG icons** - Inline SVGs avoid HTTP requests
- **Lazy loading** - Images load on intersection (IntersectionObserver)

---

## Security

### Authentication
- **Supabase Auth** - Session-based with JWT tokens
- **Middleware** - Auth checks at Edge level before rendering
- **RLS Policies** - Database row-level security per user

### Data Protection
- **HTTPS** - All traffic encrypted in transit
- **Environment Variables** - Secrets never exposed to client
- **API Route Validation** - Server-side input validation with Zod

### API Security
- **CORS Configuration** - Only allow trusted origins
- **Rate Limiting** - Prevent brute force and DoS attacks
- **SQL Injection Prevention** - Parameterized queries via Supabase

---

## Development Workflow

### Git Workflow
- **Main Branch**: `master` (production-ready)
- **Feature Branches**: `feature/*` for new development
- **Commits**: Semantic commit messages (feat:, fix:, docs:, etc.)

### Testing Strategy
- **Unit Tests**: Component logic and utility functions (Vitest)
- **Integration Tests**: Component interactions with stores (Vitest)
- **E2E Tests**: User workflows (Playwright)
- **Manual Testing**: Visual regression and accessibility checks

### Code Quality
- **ESLint**: Static analysis, style consistency
- **Prettier**: Automatic code formatting
- **Pre-commit Hooks**: Run tests before commits
- **Type Safety**: Full TypeScript coverage

---

## Deployment

### Hosting
- **Vercel**: Frontend deployment with serverless functions
- **Supabase**: Database and API hosting
- **CDN**: Static assets served globally

### CI/CD
- **GitHub Actions**: Automated testing on PR, deployment on merge
- **Build Process**: Next.js build with `npm run build`
- **Environment Separation**: `.env.local` for dev, `.env.production` for prod

### Monitoring
- **Error Tracking**: Sentry integration (optional)
- **Performance Monitoring**: Web Vitals tracking
- **Database Monitoring**: Supabase dashboard analytics

---

## Integration Checklist

### New Feature Integration
1. Add database schema (Supabase migrations)
2. Generate types from schema (`supabase gen types`)
3. Create API routes in `/src/app/api/`
4. Build UI components in `/src/components/`
5. Add Zustand store if persistent state needed
6. Integrate TanStack Query for server state
7. Add accessibility attributes (ARIA labels)
8. Write unit and E2E tests
9. Update documentation and Storybook
10. Deploy and monitor errors

### Gamification Integration Example
- User completes task → Task store dispatch
- API confirms completion → XP calculation
- Gamification store updates → useGamificationCelebrations detects change
- GamificationCelebrationProvider renders LevelUpCelebration → Confetti + Modal

---

## Resources & References

### Documentation Files
- `/docs/ARCHITECTURE.md` - Detailed technical architecture
- `/docs/PHASE-*.md` - Phase-specific completion summaries
- `/docs/TYPOGRAPHY-QUICK-REFERENCE.md` - Font and design tokens

### Configuration Files
- `/src/config/animations.ts` - Animation variants and settings
- `/src/config/gamification.ts` - Level titles and badge definitions
- `/tailwind.config.js` - Design tokens and CSS variable mappings
- `/next.config.js` - Build optimizations and webpack configuration

### Environment Setup
- See `.env.example` for required variables
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- Tailwind: https://tailwindcss.com/docs

---

**Codebase Summary Last Updated**: 2026-02-05
**Current Phase**: 06 - Animations & Polish (Complete)
**Next Phase**: 07 - Advanced Analytics & Insights
