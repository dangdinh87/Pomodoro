---
title: "UI redo — Study Bro"
status: done
branch: feat/design-system
created: 2026-10-01
---

# UI redo — design spec

Rules of the road: `docs/design-system.md` (tokens, buttons, tab vs chip, no gradients/glows/sparkles, no card soup, no left accent bars). This file adds the **page-level design**.

## Product & point of view
Study Bro is a Pomodoro focus app for students (VI/EN/JA). Primary job: **start a focus session in one click and stay in it**. Secondary: keep a short task list, see that effort adds up, take a guilt-free break.

- **The clock is the one bold element.** Everything else is quiet: neutral surfaces, hairlines, small type.
- **Colour = mode.** Work uses the brand accent (tomato). Breaks re-point the accent to cyan via `data-timer data-mode="break"` on the timer wrapper (CSS already in globals.css) — every accent-based element on the timer follows automatically.
- **Chrome recedes while focusing.** Top bar, mobile tab bar and the timer dock carry `data-chrome`; `useChromeIdle(isRunning)` (src/hooks/use-chrome-idle.ts) fades them after 3 s idle.
- **Sentence case everywhere.** No all-caps eyebrows/table headers, no `01/02/03` unless it is a real sequence, no `→` glued onto button labels, no emoji as icons.
- Copy: plain verbs, says what happens ("Start focus", "Add task"). No invented numbers or claims.

## Shell (done)
- `src/components/layout/app-top-bar.tsx`: 56px bar, logo + nav (underline, `aria-current`), settings gear, `UserMenu` (avatar → name/email, Settings, Guide, Feedback, Language, Sign out; signed-out → Sign in row). On `/timer` it is transparent (`overlay`).
- `src/components/layout/mobile-tab-bar.tsx`: fixed bottom nav < 768px. `<main>` already has bottom padding for it.
- Nav config: `src/config/app-navigation.ts`. Skip link + `<main id="main-content">` in `(main)/layout.tsx`.
- No more sidebar. Pages scroll the document (no inner scroll containers, no `h-screen overflow-hidden`).

## Primitives (done — use them, don't re-invent)
- `PageContainer` (`size="narrow"` 880px | `"wide"` 1180px), `PageHeader` (title, description, actions), `SectionHeading` — `src/components/ui/page-header.tsx`
- `FilterChip`, `FilterChipGroup` — `src/components/ui/filter-chip.tsx`
- `StatStrip` (hairline-divided numbers) — `src/components/ui/stat-strip.tsx`
- `Kbd` — `src/components/ui/kbd.tsx`
- `Button`, `Badge` (default/outline/brand/success/warning/destructive/info/ai), `Card`, `Tabs` (underline), `Input`, `Select`, `Dialog`, `EmptyState` (mascot) — `src/components/ui/*`
- Board list pattern: `divide-y divide-border rounded-lg border border-border bg-surface`, rows `px-4 py-3`/`px-5 py-4`.

## Timer `/timer`
```
[top bar — transparent, fades when idle]

            ( Work )  Short break   Long break          ← FilterChip-style mode toggle, accent = mode tone

                       24:59                            ← font-heading 700, tabular, clamp(88px, 15vw, 196px)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━────────          ← 3px progress line (accent), same width as the clock
                  Session 2 of 4   ● ● ○ ○              ← cycle position until long break (text-ink-muted)

                ↺      [ ▶ Start focus ]      ⏭         ← one primary Button size lg; ghost icon buttons
                       Space to start                   ← Kbd hint, text-ink-faint, hidden on touch

            [ ◎ Ôn chương 3 Giải tích       2/4 ▾ ]     ← task picker pill (opens popover list)
               Today: 6 sessions · 2h 30m              ← quiet daily summary (signed-in)

        [ ♫ Sounds ] [ ▣ Scene ] [ ⚙ Timer ] [ ⛶ Focus ]   ← dock, bottom centre, data-chrome
```
- Wrapper: `data-theme="dark" data-timer data-mode={work|break}`; `min-h-[calc(100dvh-56px)]`; content vertically centred; user background scene renders behind (BackgroundRenderer). Over image backgrounds only, translucent `bg-surface/60 backdrop-blur-md` surfaces are allowed.
- Primary button label: Start focus / Start break / Pause / Resume (add i18n keys).
- Progress line: elapsed / total, `transition: width 1s linear` (none under reduced motion).
- Running: `useChromeIdle(isRunning)`; dock has `data-chrome`.
- Task picker popover: hairline list of active tasks (title, 2/4 pomodoros), "Add task" inline input at bottom, link "Manage tasks" → /tasks. Signed out: "Sign in to link tasks" row.
- Sounds panel (audio sidebar sheet) and Scene picker keep their features; restyle as calm panels (board lists, filter chips for categories).
- Clock styles (digital/analog/flip/progress) stay selectable; digital is the reference design above.
- Keep a11y: `role="timer"` on the digital clock; keep any live-announcer component rendered by timer/page.tsx.

## Tasks `/tasks` — `PageContainer size="narrow"`
```
Tasks                                                   [ List | Board ]  ← view toggle = chips
4 to do, 1 in progress, 2 done

┌──────────────────────────────────────────────────────────────┐
│ +  Add a task…                         ◷ 1 pomodoro   ⚑ Med  │  ← quick add, Enter to save
└──────────────────────────────────────────────────────────────┘
(All 7) (Today 1) (To do 4) (In progress 1) (Done 2)        🔍  ← FilterChips + search toggle

In progress                                                     ← SectionHeading with count
┌──────────────────────────────────────────────────────────────┐
│ ○  Ôn chương 3 Giải tích — tích phân từng phần    ▶ Focus  ⋯ │
│    High · Due today · math              ◷◷◑○  2/4           │
├──────────────────────────────────────────────────────────────┤
To do
│ ○  Đọc paper "Attention Is All You Need"                      │
…
Done · 2  (collapsed: "Show 2 completed tasks")
```
- Row: round checkbox, title (ink, 1 line), meta line: priority Badge (high=destructive, medium=warning, low=hidden), due (today → warning-ink, overdue → danger-ink), tags (outline badges), pomodoro progress `2/4` with tiny dots. Hover/focus reveals actions: "Focus" (sets active task + navigates to /timer), edit, ⋯ (duplicate, save as template, delete). Touch: actions always visible as ⋯.
- Active task row: `ring-1 ring-inset ring-brand/50` + "Focusing" brand badge.
- Board view: three columns (To do / In progress / Done) on `bg-surface-raised` lanes, cards = flat bordered rows; drag-and-drop preserved.
- Empty (signed-in): EmptyState "No tasks yet" + quick-add focus. Signed-out: EmptyState with Sign in button.
- Edit dialog: Dialog with Input/Textarea/Select, one primary Save.

## History `/history` — `PageContainer size="wide"`
```
History                                            [ This week ▾ ]   ← range chips: Today / Week / Month
StatStrip: Focus time · Sessions · Current streak · Best streak

This week                                   ← SectionHeading
┌ bar chart (minutes per day; today bar accent, others accent/45; no gridlines except baseline) ┐

Streak                                      ← 12-week heatmap (7 rows × 12 cols, 12px cells, gap 3px,
┌ cells: 0 = surface-raised, 1–4 = accent at 30/55/80/100% mix; legend "Less ▢▢▢▢ More" ┐

Recent sessions                              ← board list: time · task title · Badge(Focus/Short/Long) · duration
```
- Fix: distribution total currently shows "1 minutes" — compute from durations, or drop the donut (preferred: drop it; the stat strip already says it).
- Signed-out: EmptyState + Sign in.

## Arcade `/entertainment` — `PageContainer size="wide"`
- Header "Arcade" + "Short games for your break." Game grid 2 → 3 cols: bordered card with Phosphor icon (28px, ink-secondary), title (font-heading), one-line description, best score if stored ("Best 1,240" text-gold Trophy 12px). Click opens the game (existing behaviour).
- When a work session is running, show a quiet note on top: "Games pause your focus. Finish the session first." — only if cheap to read from timer store.

## Settings `/settings` — `PageContainer size="narrow"`
- Underline tabs General / Timer / Background (+ Account later). Every tab uses SettingsSection/SettingsRow boards. Background picker: scene grid with selected = ring-2 ring-brand.

## Guide, Feedback, Leaderboard, 404
- Guide: long-form reading page (`narrow`), prose max 68ch, headings font-heading, figures with captions; no icon tiles. Keep any feature-flag conditions.
- Feedback: narrow form, type = FilterChips, one primary submit.
- Leaderboard (flagged off by default): board list ranking.

## Landing `/` and auth
- Hero = **a live, working mini timer** the visitor can start (local state only, no store): mode chips, big digits, Start/Pause, "Open the full app" link. Left: H1 + one-sentence value + primary CTA "Start focusing — free" + secondary "Log in". Split layout ≥ 1024px, stacked below.
- Then: what you get (hairline grid, 6 items, icon 20px + title + one line), how a session works (real sequence → numbered 1–3 allowed), pricing, FAQ (one bordered accordion), footer. Remove fabricated claims (e.g. "Join thousands of professionals").
- Auth: centred card, unchanged structure; polish only.

## Definition of done (every page)
- 1440 and 390 screenshots reviewed (signed-in via `shot-auth.mjs`, signed-out via `shot.mjs`); no horizontal scroll at 390.
- Keyboard focus visible; reduced motion respected; no new tsc errors vs baseline.
