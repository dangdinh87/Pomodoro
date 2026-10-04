# Study Bro — Pomodoro Focus Timer

A study-focused Pomodoro web app: a customizable timer with several clock styles, tasks linked to focus sessions, ambient sounds and a YouTube player, focus history and streaks, and short break games. Available in English, Vietnamese and Japanese.

Live: https://studywithbro.com

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

Every variable is documented in [`.env.example`](./.env.example) (one line each, with where it is read). With none set, the app runs locally on a built-in PGlite database and prints sign-in codes to the console.

Never put a secret in a `NEXT_PUBLIC_` variable: those values are inlined into the browser bundle.

### Database

Postgres through Drizzle ORM. Locally the app uses PGlite (`.pglite/`, created and migrated on server start) whenever `DATABASE_URL` is unset; production uses Neon.

1. Edit `src/db/schema.ts`.
2. `pnpm db:generate --name <what-changed>` writes `drizzle/NNNN_<name>.sql` and its `meta/` snapshot. Commit both.
3. Tests run every migration on an in-memory PGlite, so a broken migration fails `pnpm test`.
4. Production is migrated by [`.github/workflows/db-migrate.yml`](./.github/workflows/db-migrate.yml) (push to `master` touching `drizzle/**`, or run it by hand). Write migrations additive (new column, new index) so the previous deploy keeps working while the new one rolls out.

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
| `pnpm icons:brand` | Regenerate `favicon.svg`/`.ico`, the PWA icons and `apple-touch-icon.png` from the Tomo artwork (`src/components/brand/tomo-art.ts`) |

## Deploy checklist

Do these once, in order, before the first production deploy.

**1. GitHub** (Settings > Secrets and variables > Actions; a `production` environment secret works too)

| Secret | Used by | Value |
|---|---|---|
| `DATABASE_URL` | `db-migrate.yml` | Neon **unpooled** (direct) connection string. The job fails on a pooled `-pooler` URL or an empty value. |

**2. Vercel** (Production environment; Preview should use its own Neon branch, never the production database)

| Variable | Required | Value |
|---|---|---|
| `DATABASE_URL` | yes | Neon **pooled** connection string (the app runs on serverless functions) |
| `BETTER_AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL` | yes | `https://studywithbro.com` |
| `RESEND_API_KEY`, `EMAIL_FROM` | yes | Without them nobody can sign in by email. `EMAIL_FROM` must belong to a domain verified in Resend. |
| `SENTRY_DSN` | recommended | Error tracking. Without it errors still go to the Vercel runtime logs as JSON. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional | Redirect URI `<BETTER_AUTH_URL>/api/auth/callback/google` |
| `NEXT_PUBLIC_GA_ID` | optional | `G-XXXXXXXXXX` or `GTM-XXXXXXX` |
| `DOMAIN_MOVE` | only at the domain move | `1` makes the old domain 308 to the canonical one. Leave it unset until the new domain serves this project. |

Remove the old Supabase, MegaLLM and Spotify variables from Vercel.

**3. First deploy**

1. Run the **DB migrate** workflow by hand (Actions > DB migrate > Run workflow, branch `master`) so the schema exists before traffic arrives.
2. Merge to `master`; Vercel deploys. Later migrations run by themselves when `drizzle/**` changes.
3. Check `/api/auth/ok`, sign in with an email code, and open the browser console for Content-Security-Policy-Report-Only reports. Reports are also posted to `/api/csp-report` and logged. When they are clean, rename the header to `Content-Security-Policy` in `next.config.ts` to enforce.
4. Point an uptime monitor at `/` and `/api/auth/ok`, and schedule a database backup (Neon point-in-time restore has a short window on the free plan).

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
