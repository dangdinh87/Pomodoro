import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { Tomo } from '@/components/brand/tomo';
import type { Lang } from '@/lib/i18n/negotiate-locale';
import { getT } from '@/lib/server-translations';
import { getFaqItems } from './faq-items';
import { PanelLink } from './panel-link';

/** Native <details> keeps every answer in the HTML for search engines, with no client JS. */
export function FAQ({ lang }: { lang: Lang }) {
  const t = getT(lang);
  const items = getFaqItems(t);

  return (
    <section id="faq" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] pb-16 lg:pb-24">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div>
          <Tomo face="happy" size={112} className="mb-4 size-20 sm:size-28" />
          <h2 className="font-heading text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">{t('site.faq.title')}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {t('site.faq.still')}{' '}
            <PanelLink panel="feedback" className="focus-ring rounded-sm font-bold text-brand underline-offset-4 hover:text-brand-hover hover:underline">
              {t('site.faq.contact')}
            </PanelLink>
          </p>
        </div>

        <div className="space-y-4 pr-1">
          {items.map((item) => (
            <details key={item.question} className="group sticker-sm">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-[inherit] px-5 py-4 text-left font-heading text-[1.0625rem] font-bold leading-snug text-ink marker:hidden focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-outline bg-candy-butter text-on-accent transition-transform duration-150 group-open:rotate-180 group-open:bg-candy-mint motion-reduce:transition-none"
                >
                  <CaretDown size={14} weight="bold" />
                </span>
              </summary>
              <p className="max-w-[68ch] px-5 pb-5 text-[0.9375rem] leading-[1.7] text-ink-secondary">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
