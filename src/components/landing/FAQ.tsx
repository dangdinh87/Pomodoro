/**
 * SSR FAQ component - text content rendered server-side for SEO
 * Accordion interactivity handled by FAQAccordion client component
 */
import { t } from '@/lib/server-translations';
import { FAQAccordion } from './faq-accordion';

export function FAQ() {
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
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-blue-500/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Section Header - server-rendered for SEO */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
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

        {/* FAQ List - text passed as props to client accordion */}
        <FAQAccordion items={faqs} />

        {/* Still have questions */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            {t('landing.faq.stillHaveQuestions')}{' '}
            <a
              href="/feedback"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {t('landing.faq.sendMessage')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
