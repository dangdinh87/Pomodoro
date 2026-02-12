# Component Files Using Translations (i18n)

**Generated:** 2026-02-12 | **Count:** 100+ files

## Summary by Feature

### Authentication (5 files)
- `/src/app/(auth)/login/page.tsx` - Login form & forgot password dialog
- `/src/app/(auth)/signup/page.tsx` - Signup form with email & OAuth
- `/src/app/(auth)/reset-password/page.tsx` - Password reset page
- `/src/components/auth/auth-code-handler.tsx` - OAuth callback handler
- `/src/components/layout/app-sidebar.tsx` - Sign in/out buttons

### Navigation & Layout (5 files)
- `/src/components/layout/navigation.tsx` - Main navigation menu
- `/src/components/layout/app-sidebar.tsx` - Sidebar with user menu
- `/src/components/landing/NavbarSSR.tsx` - Landing page navbar
- `/src/components/landing/NavbarClient.tsx` - Client-side navbar wrapper
- `/src/components/landing/Footer.tsx` - Footer links

### Timer Feature (6 files)
- `/src/app/(main)/timer/page.tsx` - Main timer page
- `/src/app/(main)/timer/components/daily-progress.tsx` - Daily stats display
- `/src/app/(main)/timer/hooks/use-page-title.ts` - Dynamic page title
- `/src/components/timer/timer-guide-dialog.tsx` - Help dialog with modes
- `/src/components/settings/timer-settings.tsx` - Timer configuration panel
- `/src/components/settings/timer-settings-modal.tsx` - Settings modal

### Tasks Management (10 files)
- `/src/app/(main)/tasks/page.tsx` - Main tasks page
- `/src/components/tasks/task-management.tsx` - Kanban board
- `/src/components/tasks/components/task-form-modal.tsx` - Create/edit task
- `/src/components/tasks/components/task-list.tsx` - Task list view
- `/src/components/tasks/components/task-table.tsx` - Task table view
- `/src/components/tasks/components/task-kanban-column.tsx` - Kanban column
- `/src/components/tasks/components/tag-manager.tsx` - Tag management
- `/src/components/tasks/components/template-picker.tsx` - Template selection
- `/src/components/tasks/components/template-manager.tsx` - Template CRUD
- `/src/app/(main)/tasks/layout.tsx` - Tasks layout wrapper

### History & Stats (8 files)
- `/src/app/(main)/history/page.tsx` - Statistics page
- `/src/app/(main)/history/components/session-history.tsx` - Session table
- `/src/app/(main)/history/components/stats-cards.tsx` - KPI cards
- `/src/app/(main)/history/components/stats-empty.tsx` - Empty state
- `/src/app/(main)/history/components/stats-loading.tsx` - Loading state
- `/src/app/(main)/history/components/distribution-chart.tsx` - Mode distribution
- `/src/app/(main)/history/components/focus-chart.tsx` - Focus time chart
- `/src/app/(main)/history/components/date-range-picker.tsx` - Date selector

### Audio & Ambient Sounds (10 files)
- `/src/components/audio/audio-sidebar.tsx` - Audio tabs (ambient/youtube)
- `/src/components/audio/ambient-mixer.tsx` - Ambient sound controls
- `/src/components/audio/sound-list-category.tsx` - Sound category list
- `/src/components/audio/preset-chips.tsx` - Preset save/load/rename
- `/src/components/audio/youtube/youtube-input-section.tsx` - YouTube player
- `/src/components/audio/youtube/youtube-pane.tsx` - YouTube library
- `/src/components/audio/youtube/youtube-suggestions.tsx` - YouTube recommendations
- `/src/components/audio/active-sound-card.tsx` - Playing sound card
- `/src/components/audio/sound-icon-grid.tsx` - Sound icon display
- `/src/components/audio/alarm-settings.tsx` - Alarm configuration

### Settings (4 files)
- `/src/components/settings/settings-modal.tsx` - Settings tabs
- `/src/components/settings/timer-settings.tsx` - Timer config (detailed)
- `/src/components/settings/background-settings.tsx` - Background & theme
- `/src/components/settings/language-settings-modal.tsx` - Language picker

### Chat & AI (5 files)
- `/src/app/(main)/chat/page.tsx` - Chat interface
- `/src/components/assistant-ui/thread.tsx` - Chat thread & messages
- `/src/components/chat/conversation-selector.tsx` - Chat history sidebar
- `/src/components/chat/chat-history-panel.tsx` - Chat history panel
- `/src/components/chat/model-selector.tsx` - Model selection

### Entertainment/Games (8 files)
- `/src/app/(main)/entertainment/page.tsx` - Games hub
- `/src/components/entertainment/snake-game.tsx` - Snake game
- `/src/components/entertainment/neon-flip-game.tsx` - Memory match game
- `/src/components/entertainment/tic-tac-toe-game.tsx` - Tic-tac-toe
- `/src/components/entertainment/space-shooter-game.tsx` - Space shooter
- `/src/components/entertainment/brick-breaker-game.tsx` - Brick breaker
- `/src/components/entertainment/game-2048.tsx` - 2048 game

### Leaderboard (1 file)
- `/src/app/(main)/leaderboard/page.tsx` - Leaderboard rankings

### Feedback (1 file)
- `/src/app/(main)/feedback/page.tsx` - Feedback form

### Landing Page (8 files)
- `/src/components/landing/HeroSSR.tsx` - Hero section
- `/src/components/landing/FeaturesSSR.tsx` - Features section
- `/src/components/landing/Pricing.tsx` - Pricing table
- `/src/components/landing/HowItWorks.tsx` - How it works steps
- `/src/components/landing/CTA.tsx` - Call-to-action
- `/src/components/landing/FAQ.tsx` - FAQ section

### Progress & Other (2 files)
- `/src/app/(main)/progress/page.tsx` - Progress tracking
- `/src/app/(main)/general-settings.tsx` - General settings

## File Count by Category

| Feature | File Count | Key Prefix |
|---------|-----------|-----------|
| Authentication | 5 | `auth`, `login`, `signup`, `resetPassword` |
| Navigation | 5 | `nav`, `brand` |
| Timer | 6 | `timer`, `timerSettings`, `timerGuide`, `timerComponents` |
| Tasks | 10 | `tasks`, `errors` |
| History | 8 | `history`, `historyComponents` |
| Audio | 10 | `audio` |
| Settings | 4 | `settings`, `timerSettings`, `timerGuide` |
| Chat | 5 | `chat` |
| Entertainment | 8 | `entertainment` |
| Leaderboard | 1 | `leaderboard` |
| Feedback | 1 | `feedback` |
| Landing | 8 | `landing` |
| Common | 3+ | `common` |
| **Total** | **90+** | **22 categories** |

## Translation Key Dependencies Map

### Core Keys (used everywhere)
- `common.*` - Used in 40+ files
- `brand.*` - Used in 10+ files
- `nav.*` - Used in 5+ files
- `auth.*` - Used in 5+ files

### Feature-Specific Keys (isolated)
- `timer.*` - Only in `/timer/` pages
- `tasks.*` - Only in `/tasks/` pages
- `audio.*` - Only in audio components
- `entertainment.*` - Only in games

### Cross-Feature Keys (shared)
- `historyComponents.*` - Shared history stats components
- `common.*` - Everywhere
- `errors.*` - Multiple features

## How to Verify Translation Coverage

1. **Count usage of each key:**
   ```bash
   grep -r "t\('timer\." src --include="*.tsx" | wc -l
   ```

2. **Find files using specific key:**
   ```bash
   grep -r "t\('audio.presets" src --include="*.tsx"
   ```

3. **List all files with translations:**
   ```bash
   grep -r "t\(" src --include="*.tsx" -l | sort
   ```

4. **Check missing keys:**
   ```bash
   grep -r "t\(" src --include="*.tsx" | \
   grep -o "t\('[^']*'" | \
   sort -u | \
   while read key; do
     grep -q "$key" src/i18n/locales/en.json || echo "MISSING: $key"
   done
   ```

## Files Modified by Audio Overhaul

These files gained new keys during the audio system overhaul:

**New/Modified Audio Files:**
- `/src/components/audio/preset-chips.tsx` - NEW preset system
- `/src/components/audio/ambient-mixer.tsx` - NEW ambient controls
- `/src/components/audio/sound-list-category.tsx` - NEW category display
- `/src/components/audio/youtube/youtube-input-section.tsx` - Enhanced
- `/src/components/audio/youtube/youtube-pane.tsx` - Enhanced
- `/src/data/sound-presets.ts` - NEW preset data structure
- `/src/lib/audio/sound-catalog.ts` - NEW sound catalog
- `/src/stores/audio-store.ts` - Enhanced with preset logic

**Files Referencing Audio:**
- `/src/components/layout/app-sidebar.tsx` - Audio menu item
- `/src/components/audio/audio-sidebar.tsx` - Main audio container
- `/src/app/(main)/timer/components/timer-settings-dock.tsx` - Audio integration

## Testing Strategy

After resolving merge conflicts, test translations in these files:

1. **Critical flow (sign-up to timer):**
   - signup → login → timer → audio

2. **Full feature test:**
   - Timer (all modes & settings)
   - Tasks (create, edit, delete)
   - History (view stats)
   - Audio (play, preset save)
   - Chat (send message)
   - Settings (change theme)

3. **Language switching:**
   - Change language in settings
   - Verify all pages show translated text
   - No console errors for missing keys

## Notes
- Majority of files are React client components (.tsx)
- API routes (route.ts) do NOT use t() for UI
- Server components use server-side translations
- Client components use useTranslation() context hook
