/**
 * SSR Pricing component - all plan names, features, prices rendered server-side for SEO
 */
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/server-translations';

export function Pricing() {
  const plans = [
    {
      name: t('landing.pricing.free.name'),
      description: t('landing.pricing.free.description'),
      icon: Zap,
      price: { monthly: 0, annually: 0 },
      features: [
        t('landing.pricing.free.features.timer'),
        t('landing.pricing.free.features.tasks'),
        t('landing.pricing.free.features.history'),
        t('landing.pricing.free.features.chatAI'),
        t('landing.pricing.free.features.games'),
        t('landing.pricing.free.features.leaderboard'),
        t('landing.pricing.free.features.focus'),
        t('landing.pricing.free.features.themes'),
        t('landing.pricing.free.features.sounds'),
        t('landing.pricing.free.features.stats'),
      ],
      cta: t('landing.pricing.free.cta'),
      popular: false,
      comingSoon: false,
      gradient: 'from-slate-500 to-slate-600',
    },
    {
      name: t('landing.pricing.pro.name'),
      description: t('landing.pricing.pro.description'),
      icon: Sparkles,
      price: { monthly: 9, annually: 7 },
      features: [
        t('landing.pricing.pro.includesEverything'),
        t('landing.pricing.pro.features.unlimited'),
        t('landing.pricing.pro.features.fullHistory'),
        t('landing.pricing.pro.features.sounds'),
        t('landing.pricing.pro.features.advanced'),
        t('landing.pricing.pro.features.cloudSync'),
        t('landing.pricing.pro.features.themes'),
        t('landing.pricing.pro.features.priority'),
      ],
      cta: t('landing.pricing.pro.cta'),
      popular: true,
      comingSoon: true,
      gradient: 'from-blue-500 via-violet-500 to-purple-500',
    },
  ];

  return (
    <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            {t('landing.pricing.badge')}
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('landing.pricing.title')}
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t('landing.pricing.titleHighlight')}
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 cursor-pointer ${plan.popular
                ? 'border-violet-500/30 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent shadow-2xl shadow-violet-500/10'
                : 'border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/10 hover:bg-white/90 dark:hover:bg-white/5'
                }`}
            >
              {/* Animated gradient border for coming soon */}
              {plan.comingSoon && (
                <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-3xl opacity-40 blur-sm" />
              )}

              {/* Card content container */}
              <div className={`relative ${plan.comingSoon ? 'z-10' : ''} h-full flex flex-col`}>
                {plan.popular && (
                  <div className="absolute -inset-px bg-gradient-to-b from-violet-500/20 to-transparent rounded-3xl blur-xl -z-10" />
                )}

                {/* Coming Soon badge */}
                {plan.comingSoon && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white text-xs font-semibold shadow-lg shadow-orange-500/25">
                      <Sparkles className="h-3.5 w-3.5" />
                      {t('landing.pricing.pro.comingSoon')}
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className={`flex items-center gap-3 mb-4 ${plan.comingSoon ? 'mt-4' : ''}`}>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${plan.gradient}`}>
                    <plan.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  {plan.comingSoon ? (
                    <div className="flex flex-col items-start gap-2">
                      <div className="text-xl font-bold bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                        {t('landing.pricing.pro.brewingTitle')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('landing.pricing.pro.brewingSubtitle')}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">$0</span>
                      <span className="text-muted-foreground text-sm">/{t('landing.pricing.forever')}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-0.5 rounded-full bg-gradient-to-br ${plan.gradient}`}>
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className={`text-sm ${plan.comingSoon ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-6">
                  {plan.comingSoon ? (
                    <Button
                      className="w-full py-5 rounded-xl cursor-pointer font-medium bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/25 group"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {plan.cta}
                    </Button>
                  ) : (
                    <Link href="/timer" className="block">
                      <Button
                        className="w-full py-5 rounded-xl cursor-pointer font-medium bg-white/10 hover:bg-white/20 text-foreground group"
                        variant="ghost"
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>{t('landing.pricing.noCreditCard')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>{t('landing.pricing.freeForever')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>{t('landing.pricing.cancelAnytime')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
