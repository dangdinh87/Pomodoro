# Study Bro — Pomodoro Focus Timer

A study-focused Pomodoro web app: a customizable timer with several clock styles, tasks linked to focus sessions, ambient sounds and a YouTube player, focus history and streaks, and short break games. Available in English, Vietnamese and Japanese.

Live: https://www.pomodoro-focus.site

## Features

- **Timer**: work, short break and long break phases with five clock styles (digital, flip, analog, progress bar, animated). It keeps time accurately when the tab is in the background or after a reload, coordinates across open tabs, and sends a notification when a phase ends while the tab is hidden.
- **Tasks**: priorities, tags, due dates, subtasks, templates, drag-and-drop ordering, and pomodoro tracking per task.
- **History**: focus statistics, charts and streaks. Requires sign-in.
- **Audio**: an ambient sound mixer, alarm sounds and a YouTube player.
- **Break games**: 2048, Snake, Wordle and others.
- **Account**: change password, export your data as JSON, and delete your account.
- **Optional, behind feature flags**: the AI study chat (`NEXT_PUBLIC_FEATURE_CHAT`) and the leaderboard (`NEXT_PUBLIC_FEATURE_LEADERBOARD`). Both are off by default.

Guests can use the timer without an account. Sessions are only saved for signed-in users.

## Tech stack

- **Next.js 14** (App Router) with TypeScript, deployed on Vercel
- **Supabase**: Auth (Google OAuth and email) and Postgres with Row Level Security
- **State and data**: Zustand (persisted client state) and TanStack Query (server state)
- **UI**: Tailwind CSS, shadcn/ui and Radix primitives, Motion
- **i18n**: a custom provider (en, vi, ja). The locale is negotiated from `Accept-Language`, stored in the `app.lang` cookie, and rendered on the server.
- **AI chat**: MegaLLM through a server route, with per-user quotas
- **Testing and CI**: Jest and React Testing Library, run by GitHub Actions on every pull request (type-check, lint, i18n key check, tests, build)

## Getting started

Prerequisites: Node.js 22+, pnpm 10, and a Supabase project.

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev                     # http://localhost:3000
```

### Environment variables

Every variable is documented in [`.env.example`](./.env.example). In short:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public by design. Access is enforced by RLS. |
| `MEGALLM_API_KEY` | for chat | Server-only. |
| `SUPABASE_SERVICE_ROLE_KEY` | for account deletion | Server-only. Without it, `DELETE /api/account` returns 503. |
| `NEXT_PUBLIC_FEATURE_CHAT` / `_LEADERBOARD` / `_HISTORY` | no | Build-time flags. Redeploy after changing them. |
| `NEXT_PUBLIC_GA_ID` | no | Google Analytics. |

Never put a secret in a `NEXT_PUBLIC_` variable: those values are inlined into the browser bundle.

### Database

SQL migrations live in [`migrations/`](./migrations) and are currently applied by hand in the Supabase SQL editor. The base `tasks` and `sessions` tables are not yet in the repo. Moving to the Supabase CLI with a baseline dump of the live schema is planned; see [the remediation plan](./plans/261001-0847-project-gap-remediation/plan.md), phase 02.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build and start. The build fails on type or lint errors. |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm lint` | ESLint (`next/core-web-vitals` and `next/typescript`) |
| `pnpm test` | Jest; coverage thresholds are set in `jest.config.js` |
| `pnpm i18n:check` | Fails if en, vi and ja have different translation keys |
| `pnpm bg:optimize` | Regenerate optimized background images (also runs before `build`) |
| `node scripts/generate-pwa-icons.mjs` | Regenerate the PWA icons from `public/images/logo.svg` |

## Project structure

```
src/
├── app/
│   ├── (landing)/     # Marketing pages, server-rendered: home, privacy, terms
│   ├── (auth)/        # login, signup, reset-password
│   ├── (main)/        # App: timer, tasks, history, settings, guide, entertainment, feedback…
│   ├── api/           # Route handlers: tasks, sessions, account, chat, …
│   └── auth/callback/ # Supabase OAuth / email callback
├── components/        # UI by feature (tasks, audio, settings, layout, ui primitives)
├── config/            # Constants, feature flags
├── hooks/  stores/    # React Query hooks, Zustand stores
├── i18n/locales/      # en.json, vi.json, ja.json
└── lib/               # Supabase clients, timer engine helpers, API guards, i18n
```

More docs are in [`docs/`](./docs) (architecture, audio system, backgrounds). Reviews and plans are in [`plans/`](./plans).

## Security notes

- API routes authenticate with `supabase.auth.getUser()` and scope every query by user. Inputs are validated: task, session and feedback schemas, ownership checks, and sanitized filters.
- `/api/chat` has an hourly per-user quota and caps message size, history and output tokens.
- Security headers are set in `next.config.js`. The CSP runs in Report-Only mode for now; review the console reports before enforcing it.

## License

No license file has been added yet.
