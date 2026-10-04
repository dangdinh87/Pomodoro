/**
 * `/` (and `/vi`, `/ja`) is the app. Below the timer, the server renders content (features, how
 * it works, FAQ) for search engines and first-time users. It is the same HTML for everyone, so
 * the page is static; signed-in members get it hidden on the client (GuestOnly).
 */
import { FeaturesSSR } from '@/components/landing/FeaturesSSR';
import { Footer } from '@/components/landing/Footer';
import { FAQ } from '@/components/landing/FAQ';
import { getFaqItems } from '@/components/landing/faq-items';
import { GuestOnly } from '@/components/landing/guest-only';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Metadata } from 'next';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { getT } from '@/lib/server-translations';
import { AppHomeClientOnly } from '@/features/app-shell/app-home-client-only';
import { getGoogleCredentials } from '@/lib/auth/providers';

// SEO Metadata. Copy only claims features that ship today.
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await routeLang(params);
  return {
    ...buildPageMetadata({
      lang,
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
}

export default async function HomePage({ params }: LangParams) {
  const lang = await routeLang(params);
  const t = getT(lang);
  // Same items as the visible FAQ, so the structured data never drifts from the page
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getFaqItems(t).map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <>
      {/* The one H1 of the page, in the server HTML. Visually hidden: the timer card is the first thing people see. */}
      <h1 className="sr-only">{t('shell.homeHeading')}</h1>
      <AppHomeClientOnly googleEnabled={Boolean(getGoogleCredentials())} />
      {/* Below the app: the same paper as the body (stage tint + doodle), opaque so a scene behind never shows through the text. */}
      <GuestOnly>
        <div className="paper-bg relative z-10 bg-(--stage-tint)">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
          <FeaturesSSR lang={lang} />
          <HowItWorks lang={lang} />
          <FAQ lang={lang} />
          <Footer lang={lang} />
        </div>
      </GuestOnly>
    </>
  );
}
