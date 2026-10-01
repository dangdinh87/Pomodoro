/**
 * Landing Page - SSR-first for SEO crawlability
 * All content rendered server-side, animations via client wrappers
 */
import { NavbarSSR } from '@/components/landing/NavbarSSR';
import { HeroSSR } from '@/components/landing/HeroSSR';
import { FeaturesSSR } from '@/components/landing/FeaturesSSR';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { FAQ } from '@/components/landing/FAQ';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { getT } from '@/lib/server-translations';

// SEO Metadata. Copy only claims features that ship today.
export const metadata: Metadata = {
  ...buildPageMetadata({
    path: '/',
    title: 'Study Bro - Free Pomodoro Timer with Tasks & Focus Sounds',
    description:
      'Free online Pomodoro timer with task tracking, ambient focus sounds, break mini games, focus history and streaks. No signup required.',
  }),
  keywords: [
    'pomodoro timer',
    'pomodoro timer online',
    'free pomodoro timer',
    'study timer',
    'pomodoro timer with task list',
    'free pomodoro timer no signup',
    'focus timer online',
    'productivity timer',
    'Study Bro',
    // Vietnamese
    'dong ho pomodoro',
    'ung dung tap trung hoc tap',
    'pomodoro timer mien phi',
    // Japanese
    'ポモドーロタイマー',
    'ポモドーロ 無料',
  ],
};

export default async function LandingPage() {
  const t = await getT();
  // FAQ structured data for rich snippets
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t('landing.faq.items.q1.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q1.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q2.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q2.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q3.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q3.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q4.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q4.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q5.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q5.answer') } },
      { '@type': 'Question', name: t('landing.faq.items.q6.question'), acceptedAnswer: { '@type': 'Answer', text: t('landing.faq.items.q6.answer') } },
    ],
  };

  return (
    <>
      {/* FAQ structured data for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <NavbarSSR />
      {/* The (landing) layout already provides the <main> landmark */}
      <div>
        <HeroSSR />
        <FeaturesSSR />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </div>
      <Footer />
    </>
  );
}
