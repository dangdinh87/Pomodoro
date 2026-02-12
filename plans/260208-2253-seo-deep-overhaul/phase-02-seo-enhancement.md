# Phase 2: SEO Enhancement

## Context Links
- [Plan Overview](./plan.md)
- [Phase 1](./phase-01-critical-seo-fixes.md) (prerequisite)
- [Phase 3](./phase-03-content-and-setup.md)

## Overview
After Phase 1 makes the core content crawlable, Phase 2 enhances SEO signals: refactor remaining 6 client-only landing components to SSR-first, add structured data (FAQ JSON-LD), implement hreflang for multilingual support, and set up Web Vitals monitoring.

## Key Insights
- Remaining client components (FAQ, CTA, Footer, HowItWorks, Pricing, AIChatIndicator) all follow same pattern: `'use client'` + `useTranslation()` + framer-motion animations
- SSR refactor pattern is proven by existing HeroSSR/NavbarSSR/FeaturesSSR: server component with `t()` from server-translations, client wrapper only for animations
- FAQ has 6 Q&A items already in `en.json` -- perfect for FAQPage JSON-LD structured data
- Current i18n: client-side only (en/vi/ja via localStorage). For hreflang, we add `alternates.languages` to metadata -- no URL-based i18n routing needed
- `useReportWebVitals` is built into Next.js, just needs a client component wrapper

## Requirements
1. All 13 landing components render text content server-side
2. FAQ page structured data (JSON-LD) appears in page source
3. hreflang tags in `<head>` for en, vi, ja
4. Core Web Vitals monitoring active
5. No visual regressions -- animations still work via client hydration

## Architecture

### SSR Refactor Pattern (repeat for each component)
```
ComponentSSR.tsx (Server Component)
  - Imports t() from server-translations.ts
  - Renders all text content statically
  - Wraps interactive/animated parts in client component

ComponentAnimations.tsx (Client Component, 'use client')
  - framer-motion animations only
  - No text content (or receives text as props)
  - useState for accordion/toggle behavior
```

### For simple components (Footer, CTA) where animation is purely decorative:
```
ComponentSSR.tsx (Server Component)
  - All text content rendered
  - CSS-only hover effects (no framer-motion needed)
  - LanguageSwitcher stays as client component import
```

### Hreflang Strategy
Since the app uses client-side i18n (same URL, language in localStorage), hreflang points to the same URL with `x-default`. This signals to Google that the page serves multiple languages:

```tsx
alternates: {
  canonical: 'https://www.pomodoro-focus.site',
  languages: {
    'en': 'https://www.pomodoro-focus.site',
    'vi': 'https://www.pomodoro-focus.site',
    'ja': 'https://www.pomodoro-focus.site',
    'x-default': 'https://www.pomodoro-focus.site',
  },
}
```

> Note: This is a simplified approach. Full i18n SEO with separate URLs (/vi/, /ja/) is out of scope -- would require major routing changes.

## Related Code Files

| File | Change Type | Description |
|------|------------|-------------|
| `src/components/landing/FAQSSR.tsx` | **CREATE** | Server-rendered FAQ with text content |
| `src/components/landing/FAQClient.tsx` | **CREATE** | Accordion toggle behavior (client) |
| `src/components/landing/CTASSR.tsx` | **CREATE** | Server-rendered CTA |
| `src/components/landing/FooterSSR.tsx` | **CREATE** | Server-rendered Footer |
| `src/components/landing/HowItWorksSSR.tsx` | **CREATE** | Server-rendered HowItWorks |
| `src/components/landing/PricingSSR.tsx` | **CREATE** | Server-rendered Pricing |
| `src/components/landing/AIChatIndicatorSSR.tsx` | **CREATE** | Server-rendered AI Chat section |
| `src/app/(landing)/page.tsx` | **MODIFY** | Switch remaining imports to SSR |
| `src/app/layout.tsx` | **MODIFY** | Add hreflang, FAQ JSON-LD |
| `src/app/(landing)/page.tsx` | **MODIFY** | Add FAQ structured data |
| `src/app/web-vitals.tsx` | **CREATE** | useReportWebVitals wrapper |
| `src/components/landing/FAQ.tsx` | **DELETE** | Replaced by FAQSSR |
| `src/components/landing/CTA.tsx` | **DELETE** | Replaced by CTASSR |
| `src/components/landing/Footer.tsx` | **DELETE** | Replaced by FooterSSR |
| `src/components/landing/HowItWorks.tsx` | **DELETE** | Replaced by HowItWorksSSR |
| `src/components/landing/Pricing.tsx` | **DELETE** | Replaced by PricingSSR |
| `src/components/landing/AIChatIndicator.tsx` | **DELETE** | Replaced by AIChatIndicatorSSR |

## Implementation Steps

### Step 1: Create FAQSSR + FAQClient

This is the most complex refactor since FAQ has interactive accordion behavior.

**File: `src/components/landing/FAQClient.tsx`** (NEW)
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQAccordion({ items }: { items: FAQItemProps[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
      {items.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  // ... same toggle/animation logic as current FAQ.tsx FAQItem
}
```

**File: `src/components/landing/FAQSSR.tsx`** (NEW)
```tsx
import { t } from '@/lib/server-translations';
import { FAQAccordion } from './FAQClient';

export function FAQSSR() {
  const faqs = [
    { question: t('landing.faq.items.q1.question'), answer: t('landing.faq.items.q1.answer') },
    { question: t('landing.faq.items.q2.question'), answer: t('landing.faq.items.q2.answer') },
    { question: t('landing.faq.items.q3.question'), answer: t('landing.faq.items.q3.answer') },
    { question: t('landing.faq.items.q4.question'), answer: t('landing.faq.items.q4.answer') },
    { question: t('landing.faq.items.q5.question'), answer: t('landing.faq.items.q5.answer') },
    { question: t('landing.faq.items.q6.question'), answer: t('landing.faq.items.q6.answer') },
  ];

  return (
    <section id="faq" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="mx-auto max-w-3xl">
        {/* Server-rendered header -- crawlable */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t('landing.faq.badge')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('landing.faq.title')}
            <span className="block mt-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {t('landing.faq.titleHighlight')}
            </span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {t('landing.faq.subtitle')}
          </p>
        </div>

        {/* Client component for accordion interactivity */}
        <FAQAccordion items={faqs} />

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            {t('landing.faq.stillHaveQuestions')}{' '}
            <a href="/feedback" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              {t('landing.faq.sendMessage')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
```

Key: FAQ question/answer text is rendered server-side via props to the client accordion. Crawler sees all Q&A content in HTML.

### Step 2: Create Remaining SSR Components

Apply same pattern. For components with minimal interactivity (just framer-motion viewport animations), simplify by removing motion wrappers and using CSS-only animations or no animation:

**`HowItWorksSSR.tsx`**: Remove motion wrappers. Steps content rendered as static HTML. Use CSS `transition` for hover effects.

**`PricingSSR.tsx`**: Remove motion wrappers. All plan names, features, prices rendered server-side. "Coming Soon" badge is static. Hover effects via CSS.

**`CTASSR.tsx`**: Remove animated orbs (decorative, not needed for SEO). Render headline, subtitle, buttons statically. Keep gradient backgrounds as CSS.

**`FooterSSR.tsx`**: Remove motion wrappers from logo and social links. Import `LanguageSwitcher` as client component (it needs `useTranslation`). All nav links and copyright rendered server-side.

**`AIChatIndicatorSSR.tsx`**: Remove floating animation on icon (decorative). Render heading, subtitle, CTA button server-side. Icon animation optional via a tiny client wrapper.

### Step 3: Update Landing Page Imports

**File: `src/app/(landing)/page.tsx`**

```tsx
import { NavbarSSR } from '@/components/landing/NavbarSSR';
import { HeroSSR } from '@/components/landing/HeroSSR';
import { FeaturesSSR } from '@/components/landing/FeaturesSSR';
import { HowItWorksSSR } from '@/components/landing/HowItWorksSSR';
import { AIChatIndicatorSSR } from '@/components/landing/AIChatIndicatorSSR';
import { PricingSSR } from '@/components/landing/PricingSSR';
import { FAQSSR } from '@/components/landing/FAQSSR';
import { CTASSR } from '@/components/landing/CTASSR';
import { FooterSSR } from '@/components/landing/FooterSSR';

export default function LandingPage() {
  return (
    <>
      <NavbarSSR />
      <main>
        <HeroSSR />
        <FeaturesSSR />
        <HowItWorksSSR />
        <AIChatIndicatorSSR />
        <PricingSSR />
        <FAQSSR />
        <CTASSR />
      </main>
      <FooterSSR />
    </>
  );
}
```

### Step 4: Add FAQ Structured Data (JSON-LD)

**File: `src/app/(landing)/page.tsx`**

Add FAQ structured data as a script tag within the page component:

```tsx
import { t } from '@/lib/server-translations';

export default function LandingPage() {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t('landing.faq.items.q1.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q1.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q2.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q2.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q3.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q3.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q4.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q4.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q5.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q5.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q6.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q6.answer') } },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <NavbarSSR />
      {/* ... */}
    </>
  );
}
```

### Step 5: Add Hreflang Tags

**File: `src/app/(landing)/page.tsx`** -- update metadata:

```tsx
export const metadata: Metadata = {
  // ... existing metadata from Phase 1 ...
  alternates: {
    canonical: 'https://www.pomodoro-focus.site',
    languages: {
      'en': 'https://www.pomodoro-focus.site',
      'vi': 'https://www.pomodoro-focus.site',
      'ja': 'https://www.pomodoro-focus.site',
      'x-default': 'https://www.pomodoro-focus.site',
    },
  },
};
```

### Step 6: Add Web Vitals Monitoring

**File: `src/app/web-vitals.tsx`** (NEW)

```tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics (GA4 or console for now)
    if (process.env.NEXT_PUBLIC_GA_ID) {
      window.gtag?.('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });
  return null;
}
```

**File: `src/app/layout.tsx`** -- add import:

```tsx
import { WebVitals } from './web-vitals';

// In the body:
<body>
  <WebVitals />
  {/* ... rest */}
</body>
```

### Step 7: Delete Old Client Components

After verifying SSR versions work:

- Delete `src/components/landing/FAQ.tsx`
- Delete `src/components/landing/CTA.tsx`
- Delete `src/components/landing/Footer.tsx`
- Delete `src/components/landing/HowItWorks.tsx`
- Delete `src/components/landing/Pricing.tsx`
- Delete `src/components/landing/AIChatIndicator.tsx`

Check for imports from other files first (should only be from page.tsx).

### Step 8: Optimize Keywords in Metadata

Already done in Phase 1 Step 3. Additional optimization:

**File: `src/app/layout.tsx`** -- update JSON-LD WebApplication schema:

```tsx
{
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Study Bro',
  alternateName: 'Study Bro Pomodoro Timer',
  description: 'Free online Pomodoro timer with AI coach, task management, mini games, leaderboard, and focus analytics.',
  url: 'https://www.pomodoro-focus.site',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web Browser',
  inLanguage: ['en', 'vi', 'ja'],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Pomodoro Timer with Task Linking',
    'AI Study Coach (Bro Chat)',
    'Mini Games for Breaks',
    'Focus Mode Analytics',
    'Daily Streaks & Leaderboard',
    'Custom Themes & Ambient Sounds',
  ],
}
```

## Todo List
- [ ] Create FAQSSR.tsx + FAQClient.tsx
- [ ] Create HowItWorksSSR.tsx
- [ ] Create PricingSSR.tsx
- [ ] Create CTASSR.tsx
- [ ] Create FooterSSR.tsx
- [ ] Create AIChatIndicatorSSR.tsx
- [ ] Update page.tsx to use all SSR components
- [ ] Add FAQ JSON-LD structured data to page.tsx
- [ ] Add hreflang to landing page metadata
- [ ] Create web-vitals.tsx, add to root layout
- [ ] Update WebApplication JSON-LD schema
- [ ] Delete old client-only components
- [ ] Verify all text visible in `view-source:`
- [ ] Run build, check for errors/warnings
- [ ] Validate structured data via Google Rich Results Test

## Success Criteria
- [ ] `view-source:` shows ALL landing page text (FAQ questions, pricing features, how-it-works steps, CTA headline, footer links)
- [ ] Google Rich Results Test validates FAQ structured data
- [ ] hreflang tags present in `<head>` (`<link rel="alternate" hreflang="en" ...>`)
- [ ] No hydration mismatch warnings in dev console
- [ ] Web Vitals events appear in GA4 (or console.log)
- [ ] Lighthouse SEO score >= 95
- [ ] No visual regressions (animations still work)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Visual regression from removing framer-motion animations | Medium | Medium | Compare screenshots before/after. Prioritize content over animation. CSS transitions as fallback. |
| FAQ accordion breaks without framer-motion | Low | Low | FAQClient.tsx preserves full accordion behavior with framer-motion. |
| Hreflang with same URLs may confuse Google | Low | Low | Standard approach for client-side i18n. `x-default` signals this correctly. |
| Large number of files to create/delete | Medium | Low | Follow proven pattern from existing SSR components. Test incrementally. |
| `useReportWebVitals` import path changed in newer Next.js | Low | Low | Check Next.js 14 docs. Import from `next/web-vitals`. |

## Security Considerations
- FAQ JSON-LD: content comes from static JSON translations, no user input -- no XSS risk
- Web Vitals: sends to GA4 only, no sensitive data
- No auth changes in this phase

## Next Steps
After Phase 2 is deployed:
1. Validate structured data via [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Check `view-source:` confirms all content is server-rendered
3. Proceed to [Phase 3: Content & Setup](./phase-03-content-and-setup.md)
