import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { getT } from '@/lib/server-translations';
import { LiveTimer } from './live-timer';

export async function HeroSSR() {
  const t = await getT();
  return (
    <section className="border-b border-border bg-surface-page px-[clamp(16px,4vw,32px)] pb-16 pt-32 lg:pb-24 lg:pt-40">
      <div className="mx-auto grid max-w-[1180px] gap-x-16 gap-y-8 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start">
        <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold text-ink lg:self-end">
          {t('landingUi.hero.title')}
        </h1>

        <LiveTimer className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center" />

        <div className="flex flex-col gap-8 lg:self-start">
          <p className="max-w-136 text-lg leading-relaxed text-ink-secondary">{t('landingUi.hero.lead')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/timer">
                {t('landingUi.hero.start')}
                <ArrowRight size={16} weight="bold" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">{t('landingUi.hero.login')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
