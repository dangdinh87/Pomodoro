/**
 * Landing Page - SSR-first for SEO crawlability
 * All content rendered server-side, animations via client wrappers
 */
import { NavbarSSR } from '@/components/landing/NavbarSSR';
import { HeroSSR } from '@/components/landing/HeroSSR';
import { FeaturesSSR } from '@/components/landing/FeaturesSSR';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { AIChatIndicator } from '@/components/landing/AIChatIndicator';
import { CTA } from '@/components/landing/CTA';
import { FAQ } from '@/components/landing/FAQ';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Metadata } from 'next';
import { t } from '@/lib/server-translations';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Study Bro - Free Pomodoro Timer with AI Coach & Task Management',
  description:
    'Free online Pomodoro timer with task linking, AI study coach, mini games for breaks, leaderboard, focus mode, and productivity analytics. No signup required.',
  keywords: [
    'pomodoro timer',
    'pomodoro timer online',
    'free pomodoro timer',
    'study timer',
    'pomodoro timer with task list',
    'free pomodoro timer no signup',
    'focus timer online',
    'AI study coach',
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
  alternates: {
    canonical: 'https://www.pomodoro-focus.site',
    languages: {
      'en': 'https://www.pomodoro-focus.site',
      'vi': 'https://www.pomodoro-focus.site',
      'ja': 'https://www.pomodoro-focus.site',
      'x-default': 'https://www.pomodoro-focus.site',
    },
  },
  openGraph: {
    title: 'Study Bro - Free Pomodoro Timer with AI Coach',
    description:
      'Pomodoro timer, AI coach, mini games, leaderboard, and focus tools. Free to use, no signup required.',
    type: 'website',
    url: 'https://www.pomodoro-focus.site',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro - Free Pomodoro Timer with AI Coach',
    description:
      'Pomodoro timer, AI coach, mini games, leaderboard, and focus tools. Free to use.',
  },
};

export default function LandingPage() {
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
      <main>
        <HeroSSR />
        <FeaturesSSR />
        <HowItWorks />
        <AIChatIndicator />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
