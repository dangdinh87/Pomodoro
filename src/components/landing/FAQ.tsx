/**
 * SSR FAQ component - text content rendered server-side for SEO
 * Accordion interactivity handled by FAQAccordion client component
 */
import { getT } from '@/lib/server-translations';
import { FAQAccordion } from './faq-accordion';

export async function FAQ() {
  const t = await getT();
  const faqs = [
    { question: t('landing.faq.items.q1.question'), answer: t('landing.faq.items.q1.answer') },
    { question: t('landing.faq.items.q2.question'), answer: t('landing.faq.items.q2.answer') },
    { question: t('landing.faq.items.q3.question'), answer: t('landing.faq.items.q3.answer') },
    { question: t('landing.faq.items.q4.question'), answer: t('landing.faq.items.q4.answer') },
    { question: t('landing.faq.items.q5.question'), answer: t('landing.faq.items.q5.answer') },
    { question: t('landing.faq.items.q6.question'), answer: t('landing.faq.items.q6.answer') },
  ];

  return (
    <section id="faq" className="scroll-mt-24 px-[clamp(16px,4vw,32px)] pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="mb-10 text-3xl font-bold text-ink sm:text-4xl">{t('landingUi.faq.title')}</h2>

        <FAQAccordion items={faqs} />

        <div className="mt-6">
          <p className="text-sm text-ink-secondary">
            {t('landing.faq.stillHaveQuestions')}{' '}
            <a href="/feedback" className="text-brand hover:underline font-medium">
              {t('landing.faq.sendMessage')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
