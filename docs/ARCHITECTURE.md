# Pomodoro Focus App - Architecture Documentation

## Overview

A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking, targeting the 10,000-hour mastery goal.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui + Radix UI |
| State | Zustand (persisted) |
| Database | PostgreSQL + Supabase |
| Data Fetching | TanStack Query |
| Animation | Framer Motion |
| Audio | Howler.js |

---

## Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/             # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/             # Main app pages (protected)
│   │   ├── timer/          # ★ Core timer feature
│   │   ├── tasks/          # Task management
│   │   ├── history/        # Session history
│   │   ├── progress/       # Progress tracking
│   │   ├── settings/       # User settings
│   │   ├── focus/          # Focus mode
│   │   └── leaderboard/    # Leaderboard
│   └── api/                # API routes
│       ├── tasks/          # Task CRUD
│       ├── history/        # Session history
│       ├── stats/          # Statistics
│       └── spotify/        # Spotify integration
├── components/
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── audio/              # Audio players (YouTube, Spotify)
│   ├── settings/           # Settings modals
│   ├── tasks/              # Task components
│   ├── animate-ui/         # Animated components
│   ├── background/         # Background effects
│   └── layout/             # Layout components
├── stores/                 # Zustand stores
│   ├── timer-store.ts      # Timer state
│   ├── audio-store.ts      # Audio playback
│   ├── user-store.ts       # User data
│   ├── task-store.ts       # Active task
│   └── ...
├── hooks/                  # Custom React hooks
├── contexts/               # React contexts
├── lib/                    # Utilities
└── middleware.ts           # Auth middleware
```

---

## Core Features

### 1. Timer System (`/timer`)

```
┌─────────────────────────────────────────────────┐
│              EnhancedTimer                      │
│  ┌─────────────────────────────────────────┐    │
│  │     Clock Display                       │    │
│  │  (Analog | Digital | Flip | Progress)   │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │    Work     │ │ Short Break │ │Long Break │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
│                                                 │
│  Controls: Play/Pause | Reset | Skip | Settings│
└─────────────────────────────────────────────────┘
```

**Features:**
- Customizable work/break durations
- Multiple clock display modes
- Custom session plans
- Task integration
- Notification sounds
- Fullscreen mode

### 2. State Management

```
┌─────────────────┐      ┌─────────────────┐
│  timer-store    │◄────►│  audio-store    │
│  - mode         │      │  - playback     │
│  - timeLeft     │      │  - volume       │
│  - settings     │      │  - sounds       │
└─────────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  task-store     │◄────►│  user-store     │
│  - activeTask   │      │  - projects     │
│  - taskId       │      │  - sessions     │
└─────────────────┘      └─────────────────┘
```

### 3. Audio System

| Source | Description |
|--------|-------------|
| Ambient | 43+ built-in sounds |
| YouTube | Embedded player |
| Spotify | OAuth integration |
| Notifications | Timer alerts |

---

## Database Schema (Supabase)

```
User (1) ──── (*) Session
  │
  ├── (*) Task ──── (*) Session
  │
  ├── (*) Project ──── (*) Task
  │
  ├── (*) Skill ──── (*) Achievement
  │
  ├── (1) UserSettings
  │
  └── (1) Streak
```

**Key Models:**
- `User` - Authentication & profile
- `Task` - Work items with pomodoro estimates
- `Session` - Completed timer sessions
- `UserSettings` - Timer, audio, theme preferences
- `Streak` - Daily streak tracking

---

## Authentication Flow

```
1. User visits protected route
        │
        ▼
2. middleware.ts checks Supabase session
        │
        ├── No session → Redirect to /login
        │
        └── Has session → Allow access
```

---

## Key Files

| File | Purpose |
|------|---------|
| `enhanced-timer.tsx` | Core timer component (771 LOC) |
| `timer-store.ts` | Timer state management |
| `audio-store.ts` | Audio playback control |
| `background-context.tsx` | Dynamic backgrounds |
| `supabase-auth-provider.tsx` | Auth state sync |

---

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Type check
pnpm type-check

# Build for production
pnpm build
```

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional
NEXT_PUBLIC_GA_ID=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```
