/**
 * SSR-compatible Hero component for SEO
 * Static content rendered on server, animations handled by client component
 */
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/server-translations';
import { HeroAnimations } from './HeroAnimations';

export function HeroSSR() {
  return (
    <section className="relative min-h-screen w-full flex items-center bg-gradient-to-b from-white via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-950/80 dark:to-neutral-900 border-b border-white/5">
      {/* Client-side animations overlay */}
      <HeroAnimations />

      <div className="mx-auto max-w-6xl relative z-10 w-full px-4 sm:px-6 lg:px-8 py-32">
        {/* Static SEO-friendly content */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-foreground">
            <span className="block">{t('landing.hero.title')}</span>
            <span className="relative inline-block mt-2">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 via-violet-600 to-orange-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-violet-400 dark:to-orange-400">
                {t('landing.hero.titleHighlight')}
              </span>
              {/* Static underline decoration */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-4"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path
                  d="M2 8 Q 50 2, 100 8 Q 150 14, 198 6"
                  stroke="url(#hero-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
        </div>

        {/* Subtitle - SEO important */}
        <p className="mt-8 text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>

        {/* CTA Buttons */}
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

        {/* Product Preview - Static */}
        <div className="mt-24 relative max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Browser header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  improcode.com
                </div>
              </div>
            </div>

            {/* Timer Content */}
            <div className="p-8 sm:p-16 bg-white dark:bg-neutral-950">
              <div className="flex flex-col items-center justify-center">
                <div className="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter text-foreground">
                  25:00
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-sm font-medium">{t('landing.hero.timer')}</p>
                </div>
                {/* Play button */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
