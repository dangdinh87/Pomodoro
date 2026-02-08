/**
 * Landing Page - Client Components for i18n support
 * Uses client components for multi-language support
 */
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';
import { AIChatIndicator } from '@/components/landing/AIChatIndicator';
import { CTA } from '@/components/landing/CTA';
import { FAQ } from '@/components/landing/FAQ';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Metadata } from 'next';

// SEO Metadata - rendered server-side
export const metadata: Metadata = {
  title: 'Improcode - Pomodoro Timer, AI Coach & Focus Tools',
  description:
    'Improcode: Pomodoro timer with task linking, valid-session tracking, AI coach, mini games for breaks, leaderboard, focus mode, and analytics. Free to use.',
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'study', 'AI', 'Improcode', 'task management', 'leaderboard', 'Improcode Every Day'],
  openGraph: {
    title: 'Improcode - Pomodoro Timer, AI Coach & Focus Tools',
    description: 'Improcode: Pomodoro timer, AI coach, mini games, leaderboard, and focus tools. Free to use.',
    type: 'website',
    url: 'https://improcode.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Improcode - Pomodoro Timer, AI Coach & Focus Tools',
    description: 'Improcode: Pomodoro timer, AI coach, mini games, leaderboard, and focus tools. Free to use.',
  },
};

// Landing page with client components for i18n support
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
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
