import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { getT } from '@/lib/server-translations';
import { getFaqItems } from './faq-items';
import { PanelLink } from './panel-link';

/** Native <details> keeps every answer in the HTML for search engines, with no client JS. */
export async function FAQ() {
  const t = await getT();
  const items = getFaqItems(t);

  return (
    <section id="faq" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] pb-20 lg:pb-24">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div>
          <h2 className="font-heading text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-ink sm:text-4xl">{t('site.faq.title')}</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {t('site.faq.still')}{' '}
            <PanelLink panel="feedback" className="font-medium text-brand hover:underline">
              {t('site.faq.contact')}
            </PanelLink>
          </p>
        </div>

        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 text-left font-medium text-ink marker:hidden focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
                {item.question}
                <CaretDown size={16} className="shrink-0 text-ink-muted transition-transform duration-150 group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-ink-secondary">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
