import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timer • Study Bro App',
  description:
    'Manage work and break sessions with a refined Pomodoro timer and unified settings.',
};

const EnhancedTimer = dynamic(
  () => import('@/app/(main)/timer/components/enhanced-timer'),
  {
    ssr: false,
  },
);

export default function TimerPage() {
  return (
    <main
      className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center relative"
      aria-label="Pomodoro timer page"
    >
      <Suspense fallback={null}>
        <EnhancedTimer />
      </Suspense>
    </main>
  );
}
