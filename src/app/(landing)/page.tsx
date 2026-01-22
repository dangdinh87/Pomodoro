/**
 * Landing Page - Server Component
 * Uses SSR components for SEO, client components for interactivity
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

// SEO Metadata - rendered server-side
export const metadata: Metadata = {
  title: 'Study Bro - AI-Powered Pomodoro Timer for Maximum Focus',
  description:
    'Boost your productivity with Study Bro. Smart Pomodoro timer with AI insights, task management, ambient sounds, and detailed analytics. Free to use.',
  keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'study', 'AI', 'task management'],
  openGraph: {
    title: 'Study Bro - AI-Powered Pomodoro Timer',
    description: 'Boost your productivity with Study Bro. Smart Pomodoro timer with AI insights.',
    type: 'website',
    url: 'https://www.pomodoro-focus.site',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Bro - AI-Powered Pomodoro Timer',
    description: 'Boost your productivity with Study Bro. Smart Pomodoro timer with AI insights.',
  },
};

// Server Component - Static HTML rendered on server for SEO
export default function LandingPage() {
  return (
    <>
      {/* SSR Components - Content visible to search engines */}
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
