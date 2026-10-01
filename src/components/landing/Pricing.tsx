/**
 * SSR Pricing component - all plan names, features, prices rendered server-side for SEO
 */
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Lightning, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { getT } from '@/lib/server-translations';

export async function Pricing() {
  const t = await getT();
  const plans = [
    {
      name: t('landing.pricing.free.name'),
      description: t('landing.pricing.free.description'),
      icon: Lightning,
      features: [
        t('landing.pricing.free.features.timer'),
        t('landing.pricing.free.features.tasks'),
        t('landing.pricing.free.features.history'),
        t('landing.pricing.free.features.games'),
        t('landing.pricing.free.features.focus'),
        t('landing.pricing.free.features.themes'),
        t('landing.pricing.free.features.sounds'),
        t('landing.pricing.free.features.stats'),
      ],
      cta: t('landing.pricing.free.cta'),
      popular: false,
      comingSoon: false,
    },
    {
      name: t('landing.pricing.pro.name'),
      description: t('landing.pricing.pro.description'),
      icon: Crown,
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
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">{t('landingUi.pricing.title')}</h2>
          <p className="mt-3 text-ink-secondary">{t('landingUi.pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 sm:p-8 rounded-lg border bg-surface flex flex-col ${plan.popular
                ? 'border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]'
                : 'border-border'
                }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <plan.icon size={20} className="shrink-0 text-ink-secondary" />
                  <div>
                    <h3 className="font-heading text-xl font-bold text-ink">{plan.name}</h3>
                    <p className="text-xs text-ink-muted">{plan.description}</p>
                  </div>
                </div>
                {plan.comingSoon && (
                  <Badge variant="brand">{t('landing.pricing.pro.comingSoon')}</Badge>
                )}
              </div>

              <div className="mb-6 pb-6 border-b border-border">
                {plan.comingSoon ? (
                  <div className="flex flex-col items-start gap-2">
                    <div className="font-heading text-xl font-bold text-ink">
                      {t('landing.pricing.pro.brewingTitle')}
                    </div>
                    <p className="text-sm text-ink-secondary">
                      {t('landing.pricing.pro.brewingSubtitle')}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-5xl font-bold tabular-nums text-ink">$0</span>
                    <span className="text-ink-muted text-sm">/{t('landing.pricing.forever')}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-success-ink" />
                    <span className="text-sm text-ink-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {!plan.comingSoon && (
                <Button asChild className="mt-6 w-full">
                  <Link href="/timer">
                    {plan.cta}
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
