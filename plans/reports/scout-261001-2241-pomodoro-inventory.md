# Scout: Study Bro (Pomodoro) — codebase inventory

- Date 2026-10-01 · repo `/Users/nguyendangdinh/Personal/Pomodoro` · Next 14.2 + React 18 + Supabase + zustand + TanStack Query
- Working tree = `feat/design-system` (HEAD == `master` @ `f3031c9`, **no commits**) + 142 M / 27 D / 28 untracked files (UI redo, see `plans/261001-1020-ui-redo/design-spec.md`)
- Branch `origin/fix/security-and-quality-gates` = 6 commits on `master`, 163 files, +7379/-1757. Inspected via `git show`/`git diff`, no checkout.
- Read-only scan; ran `tsc`, `next lint`, `jest` locally. No build (prebuild writes `public/backgrounds`). Supabase host in `.env` → **NXDOMAIN** (re-checked; values not printed).
- Prior reports reused + spot-verified: `plans/reports/review-261001-0847-project-gap-analysis.md`, branch `plans/reports/implementation-261001-1000-gap-remediation.md`.

---

## 1. Feature inventory (state = working tree)

| Route | What | Nav | Quality |
|---|---|---|---|
| `/` `(landing)/page.tsx` | SSR landing: Hero w/ live mini timer (`landing/live-timer.tsx`, new), features, how-it-works, pricing (Free + "Pro waitlist"), FAQ, footer | — | works; copy still advertises Chat AI, leaderboard, focus mode, **Spotify** (removed) |
| `/privacy` `/terms` | static | footer | thin; no account-deletion/export path on master |
| `/login` `/signup` `/reset-password` | Supabase email+password, Google OAuth, reset email | — | works (if Supabase alive) |
| `/auth/callback` | code exchange, `next` redirect | — | **open redirect** `/\evil.com` (fixed on branch) |
| `/timer` | core: mode chips, 4 clock styles, controls, task picker, today summary, dock (sounds, scene, timer settings, fullscreen), guide dialog | ✓ | works; see §3 |
| `/tasks` | list/board (dnd-kit), quick-add, scope chips, search (client-side over page of 100), tags mgr, templates, clone, soft/hard delete | ✓ | works; optimistic update broken (query-key mismatch), subtasks UI dead |
| `/history` | StatStrip, week chart, 12-week heatmap, recent sessions (WIP rewrite, recharts dropped) | ✓ (`flag:'history'` field, but no flag impl in WIP) | works if API up |
| `/entertainment` | Arcade: 6 lazy games, best score per game in localStorage | ✓ | works; `wordle-game.tsx` (530 l) dead |
| `/settings` | tabs General (theme, colour preset, font, size, language) / Timer / Background | user menu | works |
| `/guide` `/feedback` | long-form guide (4 MB PNG); feedback form → `feedbacks` | user menu | works; feedback unauth, no rate limit |
| `/chat` | Bro AI (assistant-ui + MegaLLM), history panel | **hidden** (removed from nav in `2652d0c`), URL reachable | half-done: GlobalChat panel no longer mounted anywhere; tool-calling (`lib/chat-tools/*`) never wired |
| `/leaderboard` | all-time board, sort time/tasks, POSTs profile sync | **hidden**, URL reachable | works but leaks user_id/name/avatar to anon |
| `/progress` | "coming soon" placeholder | hidden | dead (branch → 301 `/history`) |
| `/focus` | renders local-only manual `StreakTracker` | hidden | dead-ish (branch → 301 `/history`) |
| 404 | mascot page | — | ok |

Dead modules (0 importers, verified by script): `stores/user-store.ts` (mock skills), `stores/navigation-store.ts`, `components/focus/focus-mode.tsx`, `chat/global-chat.tsx`, `chat/model-selector.tsx`, `hooks/use-megallm-models.ts`, `hooks/use-chat-history.ts` (0 bytes), `hooks/use-task-actions.ts`, `use-task-filters.ts`, `use-global-loader.ts`, `tasks/components/{task-list,task-table,task-form,task-view-switcher}.tsx` (+ `subtask-list` only used by dead `task-list`), `timer/components/clock-display.tsx`, `clocks/clock-state-utils.ts`, `clocks/animated-countdown.tsx` (type `'animated'` unreachable), `entertainment/wordle-game.tsx`, `ui/{animated-testimonials,animated-theme-toggler,global-loader,progress}.tsx`, `ui/skiper-ui/skiper37.tsx`, `landing/AIChatIndicator.tsx`, `settings/{settings-modal,language-settings-modal}.tsx`, `audio/{active-sound-card,alarm-settings,sound-icon-grid}.tsx`, `api/tasks/analytics` (no caller), `public/sw.js` (never registered), root `*.py`, `build.log`.

---

## 2. Data model

### 2.1 Supabase schema (reconstructed — repo cannot rebuild DB)

No `CREATE TABLE` for `tasks`/`sessions` anywhere; migrations 003/004 missing, 009/010 are 0 bytes. `streaks` uses `TIMESTAMP(3)` + `tasks.estimatedPomodoros` fallback in `use-tasks.ts` ⇒ tables were originally Prisma-created.

| Table | Source | Columns (known/inferred) | RLS |
|---|---|---|---|
| `tasks` | inferred from `api/tasks/*`, `013` | id uuid, **user_id text**, title, description, priority `LOW/MEDIUM/HIGH`, status `TODO/DOING/DONE` (legacy PENDING/IN_PROGRESS/CANCELLED), estimate_pomodoros, actual_pomodoros, time_spent (**ms, int4** → overflow at ~596 h), tags text[], is_deleted, due_date, parent_task_id (self FK cascade), display_order, is_template, created_at, updated_at | **unknown** (not in repo) |
| `sessions` | inferred | id, **user_id text**, task_id (FK set null via `supabase_schema.sql`), duration (sec), mode text, created_at | `fix_sessions_rls.sql`: own select/insert/**update**/delete via `user_id::uuid` cast |
| `streaks` | `supabase_schema.sql` (has `DROP TABLE` at top!) | id, current, longest, last_session ts w/o tz, user_id uuid FK cascade | own select/insert/update |
| `user_tags` | `006` | user_id pk, tags jsonb | own CRUD |
| `profiles` | `007`, backfill `008` (email local-part as public name) | id FK, name, avatar_url | **select USING (true)** |
| `feedbacks` | `014` | id, user_id FK set null, type enum, message, rating 1–5, name, email | insert `WITH CHECK (true)` |
| `conversations` / `messages` | `001` | conv: user_id, title, model; msg: role user/assistant/system, content | own via subquery |
| view `leaderboard` | `007` | profiles ⨝ SUM(sessions.duration where work) ⨝ COUNT(tasks DONE) | view = owner rights → bypasses RLS, anon-readable |
| fn `increment_task_pomodoro` | `002` | SECURITY DEFINER, caller-supplied user_id, no search_path | callable by anon |
| fn `get_leaderboard(period_start)` | `011`/`012` | DEFINER, granted to anon | **unused** |
| trigger `handle_new_user` | `007` | auth.users → profiles | — |

### 2.2 Client-side storage (all `localStorage`; **no IndexedDB** — `idb` dep unused)

| Key | Owner | Content |
|---|---|---|
| `timer-storage` | `stores/timer-store.ts` | mode, timeLeft, isRunning, deadlineAt, sessionCount, completed/totalFocus (local only), settings, plan fields. No `version`; `lastSessionTimeLeft` not persisted |
| `task-storage` | `stores/task-store.ts` | activeTaskId, viewMode |
| `audio-storage-v2` (version 3 + migrate) | `stores/audio-store.ts` | ambient mix + per-sound vol, user presets, activeSource, youtubeUrl, alarmType/Volume |
| `system-storage` | `stores/system-store.ts` | legacy backgroundSettings, chat panel open |
| `background-settings` | `contexts/background-context.tsx` | selected scene |
| `custom-background-images` | `hooks/use-custom-backgrounds.ts` | 1 image, dataURL ≤2 MB or http(s) URL |
| `auth-storage` | `stores/auth-store.ts` | user mirror |
| `app.lang`, `ui-theme-key`, `ui-font`, `ui-font-size` | i18n ctx, `lib/ui-preferences.ts` | prefs |
| `<game>-scores`, `game-2048-best` | entertainment | scores |
| `pomodoro-streak` | `focus/streak-tracker.tsx` | manual local streak (duplicate of DB streaks) |
| `timer-guide-shown-v*` | enhanced-timer | flag |
| `navigation-storage`, `user-storage` | dead stores | — |

Nothing user-preference-related syncs to DB ⇒ new device = default settings.

### 2.3 API routes (all `getUser()`-gated except noted)

| Route | Reads / writes |
|---|---|
| `GET/POST /api/tasks` | tasks (filters `q` injected raw into `.or()`, `dateField` unwhitelisted, limit/page unclamped) |
| `PATCH/DELETE /api/tasks/[id]` | tasks update; soft (`is_deleted`) or `?hard=true` |
| `POST /api/tasks/[id]/clone`, `GET /templates`, `POST /reorder` | tasks (reorder = N parallel UPDATEs) |
| `GET /api/tasks/analytics` | tasks+sessions full scan — **no caller** |
| `POST /api/tasks/session-complete` | insert sessions → RPC increment → read+upsert streaks (no tx, UTC day) |
| `GET /api/stats`, `GET /api/history` | sessions (+tasks title), streaks; aggregate in JS |
| `GET/POST /api/leaderboard` | GET **unauth**, view `leaderboard`, limit uncapped; POST upserts profiles |
| `GET/POST/DELETE /api/tags` | user_tags |
| `POST /api/feedback` | feedbacks — **unauth**, no rate limit |
| `/api/conversations[/id[/messages]]` | conversations, messages |
| `POST /api/chat`, `GET /api/chat/models` | MegaLLM upstream + conversations/messages |
| `/auth/callback` | Supabase code exchange |

### 2.4 Draft migration → Neon Postgres + Drizzle

0. **Data first:** Supabase host NXDOMAIN ⇒ check dashboard. Paused → restore + `pg_dump` (incl. `auth.users`, `auth.identities`). Deleted → greenfield, nothing to migrate.
1. **Auth replaces Supabase Auth** (28 files import Supabase; non-API: `middleware.ts`, `auth/callback`, 3 auth pages, `user-menu`, `supabase-auth-provider`, `use-auth`, `lib/supabase-*`). Options: Auth.js v5 (matches cv-app) or Better Auth (email+password + Google + delete-account built in, Drizzle adapter). RLS → app-layer `where user_id = session.user.id` (no public PostgREST ⇒ direct-insert cheat in §3 disappears).
2. **Tables**

| Supabase | Neon/Drizzle | Change |
|---|---|---|
| auth.users + `profiles` | `users` (+ adapter `accounts`, `verification_tokens`) | merge; add `display_name`, `locale`, `timezone`, `leaderboard_opt_in` default false |
| `sessions` | **rename `focus_sessions`** (adapter needs `sessions`) | user_id **uuid FK cascade**; mode enum `work/short_break/long_break`; `duration_sec` CHECK 1..14400; add `planned_sec`, `started_at`, `ended_at`, `is_partial`, `client_session_id` UNIQUE(user_id, …) for idempotency; idx (user_id, ended_at desc), (task_id) |
| `tasks` | `tasks` | user_id uuid FK; enums lower-case; `time_spent` ms→`time_spent_sec`; `is_deleted`→`deleted_at`; add `completed_at` (leaderboard periods used `updated_at`); idx (user_id, deleted_at, display_order); drop `parent_task_id` unless subtasks UI revived |
| `streaks` | drop → `user_stats` cache (current, longest, last_active_local_date `date`, total_focus_sec) updated in same tx, tz-aware | fixes UTC+7 streak break + stale `current` |
| `user_tags` | fold into `user_settings` or `tags(user_id,name)` | YAGNI: text[] |
| — | `user_settings` (user_id pk, timer/audio/appearance jsonb) | new, cross-device sync |
| `feedbacks` | `feedback` | + `ip_hash` for rate limit |
| `conversations`/`messages` | keep only if chat ships; + `ai_usage` (tokens, cost) | else drop |
| view `leaderboard`, `get_leaderboard`, `increment_task_pomodoro`, `handle_new_user`, `update_updated_at_column` | drop | replace w/ Drizzle tx + period query over `focus_sessions` (opt-in users only), `$onUpdate` |

3. Order: Drizzle schema + `drizzle-kit generate` → auth swap → port 15 API route files (session-complete as one `db.transaction`) → optional data copy (user_id text→uuid, ms→sec, status/mode case) → drop `@supabase/*`.

---

## 3. Timer engine

- **State**: `stores/timer-store.ts` (zustand persist). Modes `work | shortBreak | longBreak`. Deadline-based: `deadlineAt = Date.now() + timeLeft*1000`; loop `setInterval 250ms` in `app/(main)/timer/hooks/use-timer-engine.ts`. Defaults 25/5/15, long break every 4, **autoStartBreak & autoStartWork = true**. Settings clamp work 1–60, short 1–30, long 1–60, interval 2–10 (`components/settings/timer-settings.tsx`).
- **Transitions**: natural end → `handleLoopComplete` (alarm via `alarmSounds`, confetti, POST session, switch mode, auto-start). Skip → `timer-controls.tsx` duplicate logic.
- **Valid-session rule ≥50%**: only in `timer-controls.tsx` (`MINIMUM_COMPLETION_PERCENT = 50`) on **skip**: <50% → not recorded, sessionCount not incremented. Natural completion always records. Server enforces nothing.
- **Other writers**: `task-management.tsx` `recordPartialSession` on switch task / stop focus / mark active task done → POST any duration >0, **no 50% rule**, RPC +1 `actual_pomodoros` each time.
- **Hotkeys** (`use-timer-hotkeys.ts`): `Space` start/pause, `R` reset; ignored in inputs. No skip/fullscreen key. `use-page-title.ts` shows countdown in tab.
- **Plan mode** (`usePlan/plan/goToNextStep`): persisted but no UI, engine never calls `goToNextStep` ⇒ dead.
- **Bugs** (master/WIP): duration wrong after reload (`lastSessionTimeLeft` not persisted); session lost if deadline passes while tab closed (rehydrate sets `isRunning=false`, no record); no multi-tab sync (double alarm + double POST); fetch fire-and-forget, guests silently 401; skip plays `/sounds/alarm.mp3` (404).

**Points-cheating vectors** (feeds streak, task counters, public leaderboard):

| # | Vector | Branch fixes? |
|---|---|---|
| 1 | Direct `POST /api/tasks/session-complete` with arbitrary `durationSec` (unbounded, NaN), any `mode`, unlimited count | partly: enum, 1–14400 s, 24 h rolling cap (non-atomic; parallel POSTs slip) |
| 2 | **Bypass API entirely**: anon key + user JWT → supabase-js `insert`/`update` on own `sessions` (RLS allows insert+update), `upsert` own `streaks`, update own `tasks.status/actual_pomodoros` | **no** — needs REVOKE writes / server-only writes (moot on Neon) |
| 3 | Move OS clock forward → deadline elapses instantly → full planned duration recorded | no (needs server-issued `started_at` + elapsed check) |
| 4 | Work duration 1 min → each session = +1 pomodoro, keeps streak alive | no |
| 5 | Focus/unfocus task spam → many partial sessions, +1 `actual_pomodoros` each | no (deferred to Phase 02 RPC) |
| 6 | Multiple tabs → duplicate sessions | yes (localStorage claim + storage-event sync) |
| 7 | `tasks_completed` = COUNT(status DONE) incl. soft-deleted/templates; create+tick tasks freely | no |
| 8 | `increment_task_pomodoro` DEFINER w/ caller `user_id`, anon-executable → tamper others' tasks | no (DB phase) |

---

## 4. Tasks, history/stats, leaderboard, streaks

- **Tasks**: `hooks/use-tasks.ts` (390 l, TanStack Query, key `['tasks', page, limit, filters]`); optimistic mutations read `['tasks']` ⇒ no-op + rollback to `undefined`; toasts in `onSettled`. WIP `task-management.tsx` loads 100/page and filters/searches client-side. Templates, clone, tags (`user_tags` list + `tasks.tags` text[]), dnd reorder. Subtasks: column exists, UI dead.
- **Stats/History**: `/api/stats` pulls all sessions in range → JS aggregates daily focus (UTC days), distribution, totals; `/api/history` raw sessions (+task title), 50 if no range. WIP history page: `use-stats` (range + 12-week trend) + `use-history`.
- **Leaderboard**: view `leaderboard` all-time, sort by `total_focus_time` (sum work sec) or `tasks_completed`; no period UI (unused `get_leaderboard`); GET unauth; profile name fallback = email local-part.
- **Streaks**: DB `streaks` updated in session-complete per work session; UTC date compare ⇒ VN 00:00–07:00 sessions count as previous day; `current` never decays until next session (stale on display). Separate local manual streak at `/focus`. Timer page shows no streak.

---

## 5. Audio

- Engine `lib/audio/audio-manager.ts` (600 l) + `stores/audio-store.ts` (732 l); catalog `lib/audio/sound-catalog.ts`: **35 ambient in 8 cats** (docs say 32; nature 9, rain 5, noise 3, study 3, cozy 5, transport 4, city 3, machine 3) + 5 alarms. Panel `components/audio/audio-sidebar.tsx` (+ ambient-mixer, preset-chips, sound-list-category).
- Files `public/sounds/` 35 MB, 41 mp3. **Verified by md5/ffprobe**:
  - **10 files are the same 0.5 s silence** ("500 Milliseconds of Silence", Anar Software): `silence`, `study/{coffee-shop,library,coworking}`, `nature/{birds,night-crickets,fireplace}`, `noise/{white-noise,pink-noise}`, `cozy/cat-purring` ⇒ 9 catalog sounds play nothing.
  - `noise/brown-noise.mp3` == `nature/wind.mp3`.
  - **All 5 alarms identical** (bell = chime = gong = digital = soft).
  - Real loops 12–175 s; IDs/names match Moodist's sound set (hypothesis, unverified).
- **Licenses: none recorded** anywhere (`docs/audio-system.md`, plans only say "freesound CC0" as intent). No ATTRIBUTION file.
- **Presets** `data/sound-presets.ts`: 9 built-in (cafe, rain, forest, ocean, train-ride, night, library, cozy, deep-focus); 4 rely on placeholders (cafe, library, cozy, deep-focus=wind). User presets persisted in `audio-storage-v2`.
- **YouTube**: `hooks/use-youtube-player.ts` loads IFrame API into a global container **0×0, `display:none`, left −9999px** (audio-only ⇒ against YouTube API ToS on player visibility/min size). oEmbed for titles (`lib/youtube-utils.ts`). `data/youtube-suggestions.ts` 55 items / 9 cats (Piano 15, Chill VN 7, Cafe 7, Lofi 7, Ambient 6, Nature 5, Pomodoro 4, Coding 3, Brainwaves 1). Exclusive mode: YouTube vs ambient via `activeSource`. Floating player bar in app-providers. Spotify removed (plan 260209 ph1).
- **Alarm**: engine plays `alarmSounds[alarmType]` at max(10%, vol); skip path plays missing `/sounds/alarm.mp3`. No Notification API on master/WIP (branch adds).

## 6. Backgrounds

- Source `backgrounds-source/` **181 MB, 39 files tracked in git**; `scripts/optimize-backgrounds.mjs` (prebuild, sharp) → `public/backgrounds/full/{id}.{avif q65,webp q75}` 1920w + `thumb` 400w webp (gitignored, 12 MB) + mascot resize. Only packs `cyberpunk, anime-cozy, fantasy, space, working` processed; `classic/`, `travelling/` retired (mapped in `data/background-migration.ts`) but still tracked; `anime-cozy/videoplayback.mp4` unused (name suggests YouTube rip).
- `data/background-packs.ts`: 6 packs — system (auto-colour + night-light), room 8, space 6, fantasy 6, cyberpunk 3, lofi-video 2 (`public/backgrounds/{day,night}.mp4`, tracked, 1.4 MB). Header comment "7 packs, 31 items" stale.
- **Licenses/sources: none documented** (`docs/ADDING_BACKGROUNDS.md` only covers workflow). Filenames (`beautiful-office-space-cartoon-style`, `cityscape-anime-inspired-urban-area`, …) look like Freepik titles ⇒ attribution likely required.
- Custom upload: 1 image, ≤2 MB, dataURL in localStorage, or any http(s) URL (+ `images.remotePatterns: **` on master = open image proxy).
- Renderer `components/background/background-renderer.tsx` mounted globally in app-providers.

## 7. Themes, clocks, mascot, games, AI, i18n

| Area | State |
|---|---|
| Themes | next-themes light/dark + **11 colour presets** (`config/themes.ts`: Tomato default, mono, blue, rose, forest, midnight, lavender, autumn, mint, ocean, sakura — swap accent tokens only, AA-tuned). Font picker (Be Vietnam Pro / Space Grotesk / System) + size. Timer forces `data-theme=dark`, break mode re-points accent to cyan. |
| Clocks | 4 selectable: digital (role=timer), analog "neon cyberpunk" (particles), flip (3D), progress bar. `'animated'` in type only. |
| Mascot | single asset `public/mascot/wolf_cute.{png 1.6 MB, webp 36 KB}`; used in EmptyState + 404 only. Gamification plan dir `260205-1428-study-buddy-gamification` empty. |
| Games | 6 live: space-shooter, snake, neon-flip (memory), 2048, tic-tac-toe, brick-breaker (each 290–540 l, own canvas loops) + dead wordle. Scores local only. |
| AI chat | Provider **MegaLLM** (`https://ai.megallm.io/v1`, OpenAI-compatible, raw fetch + SSE parse), model `moonshotai/kimi-k2-instruct-0905` (whitelist of 1), extra title call `max_tokens 20`; main call **no max_tokens, no rate limit, no history cap**; system prompt (VI) says "no topic limit" ⇒ free LLM proxy. `NEXT_PUBLIC_MEGALLM_API_KEY` present in `.env` (unused in src). Branch adds 30 msg/h, 20 msgs, 24k chars, 2048 tokens. |
| i18n | Client context `contexts/i18n-context.tsx`, en/vi/ja JSON; en 1282 keys, vi parity, **ja missing 10** (`entertainment.controls.*`) + 1 struct conflict. `<html lang="en">` hardcoded; `lib/server-translations.ts` EN-only ⇒ landing SSR always English. |

---

## 8. Branch `fix/security-and-quality-gates`

| Area | Change (files) |
|---|---|
| Security | `lib/safe-redirect.ts` (callback/login/signup); chat cost guards `lib/chat/chat-request-guards.ts` + in-memory + DB hourly quota, ownership check; session-complete schema (`session-schemas.ts`) + 24 h cap; tasks filter sanitising, limit≤100, `task-ownership.ts` (UUID, cycle check); feedback schema + IP rate limit (`lib/api/in-memory-rate-limiter.ts`); same-origin JSON guard; generic error bodies; leaderboard name/avatar sanitise, limit≤100; `API_ROUTE_TOKEN` removed; `.env.example` rewritten |
| Headers | `next.config.js` CSP **Report-Only**, XFO DENY, nosniff, Referrer, Permissions-Policy, `poweredByHeader:false`, `remotePatterns` whitelist, 301 `/progress` `/focus` → `/history`; `ignoreBuildErrors`/`ignoreDuringBuilds` removed |
| CI | `.github/workflows/ci.yml` (pnpm 10, node 22: type-check, lint `--max-warnings 189`, `i18n:check`, jest+coverage, build), dependabot; `@types/jest`, tsconfig es2020, jest ignores `.kilo/.claude`, mocks `next/navigation` ⇒ 0 TS errors, 29 suites/227 tests, coverage 14.3% |
| Timer data | persist v1 w/ migrate, `lastSessionTimeLeft` persisted, catch-up within 15 min, multi-tab claim (`lib/timer/completion-claim.ts`), outbox recorder w/ keepalive+retry (`lib/timer/session-recorder.ts`), shared `playAlarm`, Notification when hidden; `use-tasks.ts` optimistic fix |
| Flags | `config/feature-flags.ts` env `NEXT_PUBLIC_FEATURE_{CHAT,LEADERBOARD}` (default off), `_HISTORY` (default on); `feature-gate.ts` 404s pages+APIs |
| Account | `components/settings/account-settings.tsx` (change pw w/ current pw, export JSON 3/h, delete via service role, 503 if no key); `api/account`, `api/account/export` |
| UX/SEO/PWA | `error.tsx` ×3 + `global-error.tsx`, loading for tasks/history; per-page `buildPageMetadata` canonical, no fake hreflang, sitemap 5 pages, robots; SSR i18n via `app.lang` cookie + Accept-Language in middleware; skip link, `TimerLiveAnnouncer`, `MotionConfig reducedMotion`; PWA icons + manifest (start `/timer`), `sw.js` deleted |
| Deleted | `focus-mode.tsx`, `layout/navigation.tsx`, `(main)/focus`, `(main)/progress` |

**Not fixed by branch**: DB baseline/RLS (Phase 02 needs live DB), RPC 002, leaderboard view exposure, direct-PostgREST writes, server idempotency, partial-session +1 pomodoro, UTC streaks, clock-skew cheat.

**Merge conflicts vs feat/design-system** — 46 overlapping paths:

| Kind | Files |
|---|---|
| modify/delete | branch D vs WIP M: `(main)/focus/page.tsx`, `(main)/progress/page.tsx`, `components/focus/focus-mode.tsx` · branch M vs WIP D: `layout/app-sidebar.tsx`, `ui/sidebar.tsx`, `history/components/focus-chart.tsx` (both D: `layout/navigation.tsx`) |
| high-risk content | `components/tasks/task-management.tsx` (WIP +242/−413 vs branch +46/−110; partial-session logic), `timer/components/timer-controls.tsx`, `(main)/layout.tsx` (AppTopBar vs Sidebar+flags+GlobalChat), `app/layout.tsx`, `app/globals.css`, `i18n/locales/{en,vi,ja}.json`, `(main)/history/page.tsx`, `(main)/guide/page.tsx`, `(main)/settings/page.tsx` (Account tab) |
| low-risk content | `next.config.js`, `package.json` + `pnpm-lock.yaml` (regen), `(landing)/{layout,page,privacy,terms}`, `(auth)/{login,signup}`, `not-found.tsx`, `timer/page.tsx`, `clocks/digital-clock.tsx`, `timer-settings-dock.test.tsx`, `providers/app-providers.tsx`, `chat/model-selector.tsx`, `tasks/components/{task-list,subtask-list}.tsx` (dead → delete), `ui/animated-theme-toggler.tsx` (dead) |
| untracked blockers | 10 untracked `plans/…` files in WIP also added by branch (9 identical, `plan.md` differs) ⇒ git refuses merge until moved |
| semantic | WIP `config/app-navigation.ts` has `flag` field but no `isFeatureEnabled` filter; branch account/route-error/loading UI uses pre-redo styling; branch tests target old aria labels |

---

## 9. Tech debt / risks (working tree)

| Item | Value |
|---|---|
| `tsc --noEmit` | **120 errors**: 17 runtime (animate-ui primitives 7, task-list 2, app-providers 2, theme-provider, model-selector, use-custom-backgrounds, youtube-suggestions, audio-cleanup-provider, subtask-list) + 103 in tests (no `@types/jest`). master baseline 129 |
| `next lint` | fails: 3 errors (unknown `@typescript-eslint/*` rule), 13 exhaustive-deps, 3 no-img-element |
| Tests | 4 suites / 8 tests pass (WIP deleted the beams test). No e2e, no CI |
| Build gate | `ignoreBuildErrors` + `ignoreDuringBuilds` true |
| Bundle | `/timer` first load ~470 kB (per caller; Feb builds 392–416 kB). Global providers load YouTube suggestions data, audio store, background renderer, floating player on every `(main)` page; assistant-ui + `ai` only on `/chat` |
| Unused deps (0 imports) | `crypto-js` (+types), `idb`, `react-use`, `use-debounce`, `svg-dotted-map`, `react-hot-toast`, `@radix-ui/react-toast`, **`recharts`** (dropped by WIP history) |
| Old deps | next 14, react 18, date-fns 2, eslint 8, zustand 4 |
| Repo weight | `backgrounds-source/` 181 MB in git; `public/images/content_1/pomodoro_explain.png` 4 MB; `wolf_cute.png` 1.6 MB; AI-tool dirs tracked (`.agent .claude .cursor .gemini .jules .kilo`); `build.log`, `*.py`, root SQL |
| Large files | audio-store 732, background-settings 696, audio-manager 600, 6 games 290–540 each |
| Security (master/WIP) | open redirect, unauth leaderboard/feedback, chat cost, `NEXT_PUBLIC_MEGALLM_API_KEY`, no headers, open image proxy, middleware auth commented out |
| Content/legal | 9 silent sounds + duplicated alarms/noise; no sound/background licenses; hidden YouTube player; landing promises Spotify/chat/leaderboard |
| PWA | `manifest.json` → `/icons/*` missing; `sw.js` CRA leftover |
| SEO | root canonical → homepage for all pages; robots blocks `/timer`; sitemap lists hidden `/leaderboard`, static `lastModified` |

---

## Unresolved questions

1. Supabase project: paused (restorable → dump) or deleted (greenfield)? Determines whether a data migration exists at all.
2. Neon target: standalone DB or shared with luyenphongvan (cv-app) Neon? Auth: Auth.js v5 (like cv-app) vs Better Auth vs Neon Auth?
3. Merge order: land `feat/design-system` first then rebase branch (branch report assumes this), or reverse?
4. Keep or cut: chat (cost), leaderboard (cheat surface; opt-in?), arcade, YouTube (ToS), subtasks, plan mode, local `/focus` streak?
5. Where did sounds/backgrounds come from (Moodist? Freepik?) and under which licenses? Replace the 9 silent sounds + 5 identical alarms or remove them from the catalog?
6. Was `NEXT_PUBLIC_MEGALLM_API_KEY` ever set on Vercel (rotate)? Is MegaLLM still the provider?
7. Anti-cheat level wanted: server-issued session start token + min duration for leaderboard eligibility, or leaderboard off by default?
8. `/timer` 470 kB figure: which build/commit was measured (not re-measured here)?
