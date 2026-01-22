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

// SEO Metadata - này sẽ được render server-side
export const metadata: Metadata = {
    title: 'Improcode - AI-Powered Pomodoro Timer for Maximum Focus',
    description: 'Boost your productivity with Improcode. Smart Pomodoro timer with AI insights, task management, ambient sounds, and detailed analytics. Free to use.',
    keywords: ['pomodoro', 'timer', 'productivity', 'focus', 'study', 'AI', 'task management'],
    openGraph: {
        title: 'Improcode - AI-Powered Pomodoro Timer',
        description: 'Boost your productivity with Improcode. Smart Pomodoro timer with AI insights.',
        type: 'website',
        url: 'https://improcode.com',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Improcode - AI-Powered Pomodoro Timer',
        description: 'Boost your productivity with Improcode. Smart Pomodoro timer with AI insights.',
    },
};

// Server Component - Static HTML sẽ được gửi trước
export default function LandingPage() {
    return (
        <>
            {/* SEO-friendly static content - rendered on server */}
            <div className="sr-only" aria-hidden="false">
                <h1>Improcode - AI-Powered Pomodoro Timer for Maximum Focus</h1>
                <p>
                    Improcode is a comprehensive productivity app featuring a smart Pomodoro timer,
                    AI-powered insights, task management, ambient sounds, and detailed analytics
                    to help you stay focused and achieve your goals.
                </p>
                <h2>Key Features</h2>
                <ul>
                    <li>Smart Timer - Customizable Pomodoro sessions with focus analytics</li>
                    <li>Task Management - Create, organize and track your daily tasks</li>
                    <li>Progress Analytics - Detailed statistics and productivity insights</li>
                    <li>Ambient Sounds - Background music and sounds for better focus</li>
                    <li>Daily Streaks - Build habits with streak tracking</li>
                    <li>Custom Themes - Personalize your workspace</li>
                </ul>
                <h2>Pricing</h2>
                <p>Free plan available with all essential features. Pro plan for advanced analytics.</p>
            </div>

            {/* Interactive components - hydrated on client */}
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
