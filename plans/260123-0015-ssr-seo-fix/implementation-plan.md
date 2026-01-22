---
title: "SSR & SEO Fix for Landing Page"
description: "Fix client-side rendering issues and add missing SEO files to enable search engine indexing"
status: pending
priority: P1
effort: 4h
branch: feature/update-UI
tags: [seo, ssr, landing-page, performance]
created: 2026-01-23
---

# SSR & SEO Fix Implementation Plan

## Executive Summary

The entire website is de-opted into CSR due to client context providers in root layout. This makes the site invisible to search engines. This plan fixes SSR for the landing page while preserving full functionality for the authenticated app sections.

**Strategy**: Hybrid SSR/CSR architecture
- Landing page: Server-rendered for SEO
- App sections: Client-rendered (acceptable for authenticated users)

---

## Current Architecture Problems

```
Root Layout (Server)
    └── ThemeProvider ('use client')     ← BREAKS SSR HERE
        └── I18nProvider ('use client')
            └── QueryProvider ('use client')
                └── ALL CHILDREN         ← Everything becomes CSR
```

**Impact**: 16 pages de-opted to CSR, landing page invisible to crawlers.

---

## Phase 1: Add Missing SEO Files (30 min)

### 1.1 Create `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.pomodoro-focus.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/timer/', '/tasks/', '/history/', '/chat/', '/settings/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

**Rationale**: Block crawlers from authenticated app pages, allow landing/marketing pages.

### 1.2 Create `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pomodoro-focus.site';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
```

### 1.3 Create `public/llms.txt`

```
# Study Bro - Pomodoro Focus App

> AI-powered Pomodoro timer for maximum focus and productivity.

## Description
Study Bro is a comprehensive Pomodoro Timer web application featuring AI-powered insights, task management, ambient sounds, and detailed analytics for focus enhancement and productivity tracking.

## Website
https://www.pomodoro-focus.site

## Features
- Precision Pomodoro Timer with customizable intervals
- Task Management with session linking
- Performance Analytics and progress tracking
- Ambient Soundscapes for deep work
- Consistency Streaks and habit building
- Light/Dark adaptive interface

## Pricing
- Free tier: Core timer, 5 active tasks, 7-day history
- Pro tier: Coming soon (unlimited tasks, cloud sync)

## Contact
- Feedback: https://www.pomodoro-focus.site/feedback
- GitHub: https://github.com/dangdinh87
```

---

## Phase 2: Create SSR-Compatible Landing Layout (1h)

### 2.1 Create Landing-Specific Layout

**File**: `src/app/(landing)/layout.tsx`

The landing page needs its own provider chain that doesn't force CSR for the entire tree.

```typescript
// src/app/(landing)/layout.tsx
import { ThemeProvider } from '@/components/layout/theme-provider';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <main className="relative z-10">{children}</main>
      </ThemeProvider>
    </div>
  );
}
```

**Key change**: Landing layout has `ThemeProvider` but NOT `I18nProvider` at layout level. I18n will be handled differently for landing page components.

### 2.2 Create Server-Side Translation Helper

**File**: `src/lib/server-translations.ts`

```typescript
import en from '@/i18n/locales/en.json';

type Dict = typeof en;

function safeGet(obj: any, path: string): string {
  const result = path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : path;
}

export function getServerTranslation(key: string): string {
  return safeGet(en, key);
}

export function getServerDict(): Dict {
  return en;
}
```

**Rationale**: For SSR, we use English as default. Client-side hydration handles user preference.

---

## Phase 3: Create SSR-Compatible Landing Components (2h)

### 3.1 Component Architecture Pattern

Each landing component will be split into:
1. **Server Wrapper**: Static HTML content (SSR'd)
2. **Client Enhancement**: Animations and interactions (hydrated)

### 3.2 Create SSR Hero Component

**File**: `src/components/landing/HeroSSR.tsx`

```typescript
// Server Component - no 'use client'
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getServerTranslation } from '@/lib/server-translations';
import { HeroAnimations } from './HeroAnimations';

export function HeroSSR() {
  const t = getServerTranslation;

  return (
    <section className="relative min-h-screen w-full flex items-center bg-gradient-to-b from-white via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-950/80 dark:to-neutral-900 border-b border-white/5">
      <div className="mx-auto max-w-6xl relative z-10 w-full px-4 sm:px-6 lg:px-8 py-32">
        {/* Static Content for SEO */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-foreground">
            <span className="block">{t('landing.hero.title')}</span>
            <span className="relative inline-block mt-2">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 via-violet-600 to-orange-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-orange-400">
                {t('landing.hero.titleHighlight')}
              </span>
            </span>
          </h1>
        </div>

        <p className="mt-8 text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 hover:from-blue-700 hover:via-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 text-base px-8 py-6 cursor-pointer group rounded-xl"
            >
              {t('landing.hero.getStarted')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Timer Preview - Static */}
        <div className="mt-24 relative max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  studybro.app
                </div>
              </div>
            </div>
            <div className="p-8 sm:p-16 bg-white dark:bg-neutral-950">
              <div className="flex flex-col items-center justify-center">
                <div className="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter text-foreground">
                  25:00
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-sm font-medium">{t('landing.hero.timer')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client-side animations overlay */}
      <HeroAnimations />
    </section>
  );
}
```

**File**: `src/components/landing/HeroAnimations.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { Spotlight } from '@/components/ui/spotlight';

export function HeroAnimations() {
  return (
    <>
      {/* Spotlights - purely decorative, can load after SSR */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 absolute"
        fill="rgba(99, 102, 241, 0.15)"
      />
      <Spotlight
        className="top-10 left-full -translate-x-1/2 opacity-75 absolute"
        fill="rgba(168, 85, 247, 0.12)"
      />
    </>
  );
}
```

### 3.3 Create SSR Features Component

**File**: `src/components/landing/FeaturesSSR.tsx`

```typescript
// Server Component
import {
  Timer,
  BarChart3,
  ListTodo,
  Music,
  Palette,
  Flame,
} from 'lucide-react';
import { getServerTranslation } from '@/lib/server-translations';
import { cn } from '@/lib/utils';

const FEATURE_ICONS = [Timer, ListTodo, BarChart3, Music, Flame, Palette];
const FEATURE_COLORS = [
  'bg-blue-600',
  'bg-orange-600',
  'bg-purple-600',
  'bg-green-600',
  'bg-red-600',
  'bg-pink-600',
];
const FEATURE_KEYS = ['timer', 'tasks', 'analytics', 'sounds', 'streaks', 'themes'];

export function FeaturesSSR() {
  const t = getServerTranslation;

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            {t('landing.features.title')} {t('landing.features.titleHighlight')}
          </h2>
          <p className="text-slate-600 dark:text-neutral-400 max-w-2xl text-lg">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_KEYS.map((key, index) => {
            const Icon = FEATURE_ICONS[index];
            return (
              <article
                key={key}
                className="group relative flex flex-col p-8 rounded-[2.5rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/[0.05] transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <div className={cn(
                  'h-12 w-12 rounded-xl flex items-center justify-center mb-8 shadow-lg ring-1 ring-white/10',
                  FEATURE_COLORS[index]
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t(`landing.features.items.${key}.title`)}
                  </h3>
                  <p className="text-slate-600 dark:text-neutral-500 leading-relaxed font-medium">
                    {t(`landing.features.items.${key}.description`)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

### 3.4 Create SSR Navbar Component

**File**: `src/components/landing/NavbarSSR.tsx`

```typescript
// Server Component
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getServerTranslation } from '@/lib/server-translations';
import { NavbarClient } from './NavbarClient';

export function NavbarSSR() {
  const t = getServerTranslation;

  const navLinks = [
    { href: '#features', label: t('landing.nav.features') },
    { href: '#pricing', label: t('landing.nav.pricing') },
    { href: '/feedback', label: t('landing.nav.contact') },
  ];

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl rounded-2xl border bg-white/5 dark:bg-white/[0.02] backdrop-blur-lg border-white/10 transition-all duration-500">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Logo - Static */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="flex h-9 w-9 items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Study Bro"
              width={36}
              height={36}
              className="drop-shadow-lg"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight">Study Bro</span>
        </Link>

        {/* Desktop Nav - Static links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions - Static */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="cursor-pointer text-sm font-medium">
              {t('auth.login')}
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="relative bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-violet-500/20 cursor-pointer text-sm font-medium rounded-lg px-4 group overflow-hidden"
            >
              {t('landing.hero.getStarted')}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu handled by client component */}
        <NavbarClient navLinks={navLinks} />
      </div>
    </nav>
  );
}
```

**File**: `src/components/landing/NavbarClient.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

interface NavbarClientProps {
  navLinks: { href: string; label: string }[];
}

export function NavbarClient({ navLinks }: NavbarClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Theme toggle for desktop */}
      <div className="hidden md:block absolute right-20">
        <AnimatedThemeToggler />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-4 right-4 z-50 md:hidden rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-6"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center cursor-pointer">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white cursor-pointer">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 3.5 Update Landing Page to Use SSR Components

**File**: `src/app/(landing)/page.tsx`

```typescript
import { NavbarSSR } from '@/components/landing/NavbarSSR';
import { HeroSSR } from '@/components/landing/HeroSSR';
import { FeaturesSSR } from '@/components/landing/FeaturesSSR';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { FAQ } from '@/components/landing/FAQ';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CTA } from '@/components/landing/CTA';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Bro - AI-Powered Pomodoro Timer for Maximum Focus',
  description:
    'Boost your productivity with Study Bro. Smart Pomodoro timer with AI insights, task management, ambient sounds, and detailed analytics. Free to use.',
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'study', 'AI', 'task management'],
  openGraph: {
    title: 'Study Bro - AI-Powered Pomodoro Timer',
    description: 'Boost your productivity with Study Bro. Smart Pomodoro timer with AI insights.',
    type: 'website',
    url: 'https://www.pomodoro-focus.site',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro - AI-Powered Pomodoro Timer',
    description: 'Boost your productivity with Study Bro. Smart Pomodoro timer with AI insights.',
  },
};

export default function LandingPage() {
  return (
    <>
      <NavbarSSR />
      <main>
        <HeroSSR />
        <FeaturesSSR />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
```

---

## Phase 4: Isolate App Section Providers (30 min)

### 4.1 Update Root Layout

Move the heavy client providers to app-only sections, keep root layout lean.

**File**: `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Study Bro App',
  description: 'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.pomodoro-focus.site'),
  keywords: ['Pomodoro Timer', 'Study Timer', 'Focus Timer', 'Productivity Tool', 'Study Bro'],
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    title: 'Study Bro App',
    description: 'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
    url: 'https://www.pomodoro-focus.site',
    siteName: 'Study Bro App',
    images: [{ url: '/card.jpg', width: 1200, height: 630, alt: 'Study Bro App' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro App',
    description: 'A comprehensive Pomodoro Timer web application for focus enhancement and productivity tracking',
    images: ['/card.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${beVietnamPro.variable}`}>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Study Bro',
              description: 'AI-Powered Pomodoro Timer for Maximum Focus and Productivity',
              url: 'https://www.pomodoro-focus.site',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              featureList: ['Pomodoro Timer', 'Task Management', 'Progress Analytics', 'Ambient Sounds'],
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              id="ga-loader"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}</Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
```

### 4.2 Create App Providers Wrapper

**File**: `src/components/providers/app-providers.tsx`

```typescript
'use client';

import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { I18nProvider } from '@/contexts/i18n-context';
import { SupabaseAuthProvider } from '@/components/providers/supabase-auth-provider';
import { BackgroundRenderer } from '@/components/background/background-renderer';
import GATracker from '@/components/trackings/ga';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextTopLoader color="hsl(var(--primary))" showSpinner={false} height={3} />
      <I18nProvider>
        <QueryProvider>
          <SupabaseAuthProvider />
          <BackgroundRenderer />
          {process.env.NEXT_PUBLIC_GA_ID && <GATracker />}
          {children}
          <Toaster />
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
```

### 4.3 Update Main App Layout

**File**: `src/app/(main)/layout.tsx`

```typescript
import { AppProviders } from '@/components/providers/app-providers';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
```

### 4.4 Update Auth Layout

**File**: `src/app/(auth)/layout.tsx`

```typescript
import { AppProviders } from '@/components/providers/app-providers';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/app/robots.ts` | Create | SEO robots configuration |
| `src/app/sitemap.ts` | Create | SEO sitemap generation |
| `public/llms.txt` | Create | LLM-friendly documentation |
| `src/lib/server-translations.ts` | Create | Server-side translation helper |
| `src/components/landing/HeroSSR.tsx` | Create | SSR Hero component |
| `src/components/landing/HeroAnimations.tsx` | Create | Client-side Hero animations |
| `src/components/landing/FeaturesSSR.tsx` | Create | SSR Features component |
| `src/components/landing/NavbarSSR.tsx` | Create | SSR Navbar component |
| `src/components/landing/NavbarClient.tsx` | Create | Client-side Navbar interactions |
| `src/components/providers/app-providers.tsx` | Create | Consolidated app providers |
| `src/app/layout.tsx` | Modify | Remove client providers from root |
| `src/app/(landing)/layout.tsx` | Modify | Add ThemeProvider only |
| `src/app/(landing)/page.tsx` | Modify | Use SSR components |
| `src/app/(main)/layout.tsx` | Modify | Use AppProviders wrapper |
| `src/app/(auth)/layout.tsx` | Modify | Use AppProviders wrapper |

---

## Testing Checklist

### Pre-Implementation
- [ ] Run `npm run build` - document current CSR warnings count (16)
- [ ] Curl landing page - document empty body issue

### Post-Implementation

#### SEO Files
- [ ] `curl localhost:3000/robots.txt` returns valid robots file
- [ ] `curl localhost:3000/sitemap.xml` returns valid sitemap
- [ ] `public/llms.txt` is accessible

#### SSR Verification
- [ ] Run `npm run build` - verify landing page shows `○` (static) without CSR warning
- [ ] `curl localhost:3000 | grep "Master Your"` - content visible in HTML
- [ ] `curl localhost:3000 | grep "Precision Timer"` - features visible in HTML
- [ ] Verify metadata is in `<head>` section

#### Functionality
- [ ] Landing page renders correctly
- [ ] Theme toggle works
- [ ] Navigation works (desktop + mobile)
- [ ] CTA buttons link correctly
- [ ] App sections still work (timer, tasks, etc.)
- [ ] I18n works in app sections
- [ ] Auth flow works

#### Performance
- [ ] Check First Contentful Paint improved
- [ ] Check Lighthouse SEO score

---

## Rollback Plan

If issues arise:

1. **Revert root layout**: Restore original `src/app/layout.tsx` with all providers
2. **Keep SEO files**: `robots.ts`, `sitemap.ts`, `llms.txt` are safe additions
3. **Delete new files**: Remove SSR component variants if not working

Rollback command:
```bash
git checkout HEAD -- src/app/layout.tsx src/app/(landing)/layout.tsx src/app/(landing)/page.tsx
```

---

## Unresolved Questions

1. Should we implement SSR i18n for Vietnamese landing page content? (Currently defaults to English for SSR)
2. Are there specific components beyond Hero/Features/Navbar that need SSR treatment?
3. Should Pricing, FAQ, HowItWorks, CTA, Footer also get SSR versions? (Currently still client-side but lower priority for SEO)

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| SSR Pages | 0 | 1 (landing) |
| CSR Warnings | 16 | 15 |
| robots.txt | 500 error | 200 OK |
| sitemap.xml | 404 | 200 OK |
| Landing HTML Content | Empty | Full |
| Lighthouse SEO | ~50 | 90+ |
