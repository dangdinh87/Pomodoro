---
title: "Deep SEO Overhaul"
description: "Fix zero Google indexing by switching to SSR-first architecture, fixing metadata/sitemap, and narrowing middleware"
status: completed
priority: P1
effort: 10h
branch: feat/new-branding
tags: [seo, ssr, performance, indexing]
created: 2026-02-08
---

# Deep SEO Overhaul - Study Bro (pomodoro-focus.site)

## Problem
`site:pomodoro-focus.site` returns 0 results. Brand search "Study Bro" returns nothing.

## Root Causes
1. All 13 landing components are `'use client'` -- crawler sees empty HTML
2. Google Search Console not configured
3. Middleware runs Supabase auth on ALL requests including crawlers
4. Sitemap uses `new Date()`, includes login/signup pages
5. Missing canonical URL, broken OG image (relative path), no hreflang
6. SSR versions (HeroSSR, NavbarSSR, FeaturesSSR) exist but unused

## Architecture Decision
**Use existing SSR components** (HeroSSR, NavbarSSR, FeaturesSSR) in landing `page.tsx`. They already follow the correct pattern: server-rendered content + client wrappers for interactivity. Create similar SSR versions for remaining components.

## Phases

### [Phase 1: Critical SEO Fixes](./phase-01-critical-seo-fixes.md) (~4h)
- Switch landing page to SSR-first (use existing SSR components)
- Fix metadata: canonical, OG image absolute URL, GSC verification tag
- Fix sitemap: static dates, remove auth pages
- Narrow middleware matcher to auth-protected routes only
- Remove old client-only duplicates (Hero.tsx, Navbar.tsx, Features.tsx)

### [Phase 2: SEO Enhancement](./phase-02-seo-enhancement.md) (~4h)
- Refactor FAQ, CTA, Footer, HowItWorks, Pricing, AIChatIndicator to SSR-first
- Add hreflang tags (en/vi/ja)
- Add FAQ structured data (JSON-LD)
- Optimize keyword strategy in metadata
- Add `useReportWebVitals` monitoring

### [Phase 3: Content & Setup](./phase-03-content-and-setup.md) (~2h)
- Google Search Console: submit sitemap + request indexing (verification HTML file already exists: `public/googleb3842cbf1c4206d4.html`)
- Vietnamese keyword metadata
- Backlinks strategy
- ~~Blog skeleton~~ (skipped per user decision)

## Success Criteria
- [ ] `view-source:` of landing page shows full text content (h1, h2, paragraphs)
- [ ] Google Search Console verified + sitemap submitted
- [ ] Middleware skips unauthenticated public routes
- [ ] Lighthouse SEO score >= 95
- [ ] `site:pomodoro-focus.site` returns results within 2-4 weeks

## Key Files
| File | Role |
|------|------|
| `src/app/(landing)/page.tsx` | Landing page - needs SSR components |
| `src/app/(landing)/layout.tsx` | Landing layout with I18nProvider |
| `src/app/layout.tsx` | Root layout, metadata, JSON-LD |
| `src/middleware.ts` | Auth middleware - too broad matcher |
| `src/app/sitemap.ts` | Sitemap config |
| `src/app/robots.ts` | Robots config |
| `src/components/landing/*SSR.tsx` | Existing SSR components (unused) |
| `src/components/landing/*.tsx` | Client-only components |
| `src/lib/server-translations.ts` | Server-side i18n (English only) |
