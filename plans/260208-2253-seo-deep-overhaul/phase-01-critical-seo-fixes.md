# Phase 1: Critical SEO Fixes

## Context Links
- [Plan Overview](./plan.md)
- [Phase 2](./phase-02-seo-enhancement.md)
- [Phase 3](./phase-03-content-and-setup.md)

## Overview
Fix the 5 critical blockers preventing Google from indexing pomodoro-focus.site. Primary issue: all landing content is client-rendered, invisible to crawlers. Secondary: middleware intercepts crawlers, sitemap has dynamic dates + auth pages, metadata incomplete.

## Key Insights
- SSR components already exist (HeroSSR, NavbarSSR, FeaturesSSR) with correct architecture: static content on server, client wrappers for animations only
- `server-translations.ts` already provides English translations for SSR -- no new i18n infra needed
- Middleware currently runs `supabase.auth.getUser()` on every non-static request including `/`, which adds latency for crawlers and may cause timeouts
- `metadataBase` is already set correctly in root layout; landing page metadata just needs canonical + absolute OG image

## Requirements
1. Landing page must render full text content server-side (verifiable via `curl` or `view-source:`)
2. Middleware must NOT run auth logic on public routes (/, /guide, /leaderboard, /privacy, /terms, /feedback, /login, /signup)
3. Sitemap must use static dates, exclude login/signup, include all public pages
4. OG image must use absolute URL
5. GSC verification meta tag must be in metadata

## Architecture

### Current Flow (broken)
```
Crawler -> middleware (Supabase auth) -> page.tsx -> all client components -> empty HTML
```

### Target Flow
```
Crawler -> middleware (skipped for public routes) -> page.tsx -> SSR components -> full HTML
User -> same + client hydration for animations/interactivity
```

### Component Architecture
```
page.tsx (Server Component)
  ├── NavbarSSR (Server) -> NavbarClient (Client: mobile menu, theme toggle)
  ├── HeroSSR (Server) -> HeroAnimations (Client: spotlights)
  ├── FeaturesSSR (Server) -> no client wrapper needed
  ├── HowItWorks (Client) -- Phase 2 refactor
  ├── AIChatIndicator (Client) -- Phase 2 refactor
  ├── Pricing (Client) -- Phase 2 refactor
  ├── FAQ (Client) -- Phase 2 refactor
  ├── CTA (Client) -- Phase 2 refactor
  └── Footer (Client) -- Phase 2 refactor
```

## Related Code Files

| File | Change Type | Description |
|------|------------|-------------|
| `src/app/(landing)/page.tsx` | **MODIFY** | Switch Hero/Navbar/Features to SSR versions |
| `src/app/layout.tsx` | **MODIFY** | Add canonical, GSC verification, fix OG image |
| `src/middleware.ts` | **MODIFY** | Narrow matcher to auth-protected routes only |
| `src/app/sitemap.ts` | **MODIFY** | Static dates, remove auth pages |
| `src/components/landing/Hero.tsx` | **DELETE** | Replaced by HeroSSR |
| `src/components/landing/Navbar.tsx` | **DELETE** | Replaced by NavbarSSR |
| `src/components/landing/Features.tsx` | **DELETE** | Replaced by FeaturesSSR |

## Implementation Steps

### Step 1: Switch Landing Page to SSR Components

**File: `src/app/(landing)/page.tsx`**

Replace client component imports with SSR versions:

```tsx
// REMOVE these imports:
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';

// ADD these imports:
import { NavbarSSR } from '@/components/landing/NavbarSSR';
import { HeroSSR } from '@/components/landing/HeroSSR';
import { FeaturesSSR } from '@/components/landing/FeaturesSSR';
```

Update the JSX:

```tsx
export default function LandingPage() {
  return (
    <>
      <NavbarSSR />
      <main>
        <HeroSSR />
        <FeaturesSSR />
        <HowItWorks />
        <AIChatIndicator />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
```

### Step 2: Fix Metadata in Root Layout

**File: `src/app/layout.tsx`**

Add to the `metadata` export:

```tsx
export const metadata: Metadata = {
  title: 'Study Bro App',
  description:
    'Free Pomodoro timer with task management, AI coach, mini games, focus analytics, and leaderboard. No signup required.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.pomodoro-focus.site'),
  // ADD: canonical
  alternates: {
    canonical: 'https://www.pomodoro-focus.site',
  },
  // ADD: GSC verification (replace with actual ID after GSC setup)
  verification: {
    google: 'YOUR_GSC_VERIFICATION_ID',
  },
  keywords: [
    'pomodoro timer',
    'pomodoro timer online free',
    'study timer',
    'focus timer',
    'pomodoro timer with tasks',
    'free pomodoro timer no signup',
    'productivity tool',
    'Study Bro',
  ],
  openGraph: {
    title: 'Study Bro - Free Pomodoro Timer & Focus Tools',
    description:
      'Free Pomodoro timer with task management, AI coach, mini games, focus analytics, and leaderboard.',
    url: 'https://www.pomodoro-focus.site',
    siteName: 'Study Bro',
    images: [
      {
        // FIX: absolute URL instead of relative
        url: 'https://www.pomodoro-focus.site/card.jpg',
        width: 1200,
        height: 630,
        alt: 'Study Bro - Pomodoro Timer App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro - Free Pomodoro Timer & Focus Tools',
    description:
      'Free Pomodoro timer with task management, AI coach, mini games, and analytics.',
    // FIX: absolute URL
    images: ['https://www.pomodoro-focus.site/card.jpg'],
  },
};
```

### Step 3: Fix Landing Page Metadata

**File: `src/app/(landing)/page.tsx`**

Update the page-level metadata with canonical and better keywords:

```tsx
export const metadata: Metadata = {
  title: 'Study Bro - Free Pomodoro Timer with AI Coach & Task Management',
  description:
    'Free online Pomodoro timer with task linking, AI study coach, mini games for breaks, leaderboard, focus mode, and productivity analytics. No signup required.',
  keywords: [
    'pomodoro timer',
    'pomodoro timer online',
    'free pomodoro timer',
    'study timer',
    'pomodoro timer with task list',
    'free pomodoro timer no signup',
    'focus timer online',
    'AI study coach',
    'productivity timer',
  ],
  alternates: {
    canonical: 'https://www.pomodoro-focus.site',
  },
  openGraph: {
    title: 'Study Bro - Free Pomodoro Timer with AI Coach',
    description:
      'Pomodoro timer, AI coach, mini games, leaderboard, and focus tools. Free to use, no signup required.',
    type: 'website',
    url: 'https://www.pomodoro-focus.site',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro - Free Pomodoro Timer with AI Coach',
    description:
      'Pomodoro timer, AI coach, mini games, leaderboard, and focus tools. Free to use.',
  },
};
```

### Step 4: Narrow Middleware Matcher

**File: `src/middleware.ts`**

Change the matcher from catch-all to only auth-relevant routes:

```tsx
export const config = {
  matcher: [
    // Only match routes that need auth checks:
    '/login',
    '/signup',
    '/timer/:path*',
    '/tasks/:path*',
    '/history/:path*',
    '/chat/:path*',
    '/settings/:path*',
  ],
};
```

This ensures crawlers hitting `/`, `/guide`, `/leaderboard`, `/privacy`, `/terms`, `/feedback` skip Supabase auth entirely. Faster response, no cookie issues.

### Step 5: Fix Sitemap

**File: `src/app/sitemap.ts`**

```tsx
import { MetadataRoute } from 'next';

// Force static generation at build time
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pomodoro-focus.site';
  const lastModified = '2026-02-08'; // Update on each deploy

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
  // REMOVED: /login, /signup (auth pages waste crawl budget)
}
```

### Step 6: Delete Replaced Client Components

After verifying the landing page works with SSR versions:

- Delete `src/components/landing/Hero.tsx` (replaced by HeroSSR.tsx)
- Delete `src/components/landing/Navbar.tsx` (replaced by NavbarSSR.tsx)
- Delete `src/components/landing/Features.tsx` (replaced by FeaturesSSR.tsx)

Search codebase for any other imports of these files first:
```bash
grep -r "from.*landing/Hero'" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*landing/Navbar'" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*landing/Features'" src/ --include="*.tsx" --include="*.ts"
```

### Step 7: Update Landing Layout (if needed)

**File: `src/app/(landing)/layout.tsx`**

The `I18nProvider` wrapping is still needed for client components (FAQ, CTA, etc.) that use `useTranslation()`. No change needed in Phase 1. The SSR components use `server-translations.ts` directly.

Verify `ThemeProvider` does not add `'use client'` to the layout -- it should be fine since it's a separate component.

## Todo List
- [ ] Switch page.tsx imports to SSR components (Hero, Navbar, Features)
- [ ] Update root layout metadata (canonical, GSC tag, absolute OG image URL)
- [ ] Update landing page metadata (keywords, canonical)
- [ ] Narrow middleware matcher to auth routes only
- [ ] Fix sitemap (static dates, remove login/signup)
- [ ] Delete old client-only Hero.tsx, Navbar.tsx, Features.tsx
- [ ] Verify with `curl https://www.pomodoro-focus.site` that HTML contains text
- [ ] Run `npm run build` to confirm no build errors
- [ ] Lighthouse SEO audit

## Success Criteria
- [ ] `curl` to landing page returns HTML with h1, h2, paragraphs containing real text (not empty divs)
- [ ] `view-source:` shows "Study Bro", "Pomodoro", feature descriptions in HTML
- [ ] Sitemap.xml has no login/signup entries, uses static dates
- [ ] Middleware does not run on `/` (check via Vercel function logs or local Next.js dev output)
- [ ] No build errors, no hydration mismatches
- [ ] Lighthouse SEO >= 90

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hydration mismatch from SSR/client text differences | Medium | Medium | SSR uses English, I18nProvider initializes with English -- should match. Test thoroughly. |
| Middleware too narrow misses route that needs auth | Low | High | Only auth-redirect logic exists (login/signup -> /timer). Protected route check is commented out. Test each route. |
| Deleting old client components breaks other imports | Low | High | Search entire codebase before deleting. Only page.tsx imports them. |
| `ThemeProvider` in landing layout forces client rendering | Low | Medium | ThemeProvider is a separate client component -- children (page.tsx) remain server. Verify in build output. |

## Security Considerations
- Middleware change: narrowing matcher means public routes no longer set auth cookies. This is intentional -- public routes don't need auth.
- GSC verification: the verification ID is not secret but should come from env variable or be committed directly. Either approach is fine for GSC.
- No auth logic changes, no data exposure changes.

## Next Steps
After Phase 1 is deployed and verified:
1. Submit sitemap to Google Search Console
2. Request indexing for homepage
3. Proceed to [Phase 2: SEO Enhancement](./phase-02-seo-enhancement.md)
