/**
 * SSR CTA component - text content rendered server-side for SEO
 * Decorative animations removed (CSS gradients preserved)
 */
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/server-translations';

export function CTA() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-50 dark:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-violet-600/10 to-purple-600/10 dark:from-blue-600/20 dark:via-violet-600/20 dark:to-purple-600/20" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='currentColor'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl relative">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-white/10 backdrop-blur-sm border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-sm font-medium mb-8">
            <Zap className="w-4 h-4 text-amber-500 dark:text-yellow-400" />
            <span>{t('landing.cta.badge')}</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t('landing.cta.title')}
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 dark:from-blue-300 dark:via-violet-300 dark:to-purple-300 bg-clip-text text-transparent">
              {t('landing.cta.titleHighlight')}
            </span>
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-white/70 max-w-2xl mx-auto leading-relaxed">
            {t('landing.cta.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/timer">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90 shadow-xl shadow-slate-200 dark:shadow-white/20 text-base px-8 py-6 cursor-pointer group rounded-xl font-semibold"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t('landing.cta.getStarted')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/timer">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-6 cursor-pointer rounded-xl border-slate-300 dark:border-white/30 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                {t('landing.cta.tryDemo')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
