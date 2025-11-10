import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timer • Pomodoro Focus App',
  description:
    'Manage work and break sessions with a refined Pomodoro timer and unified settings.',
};

const EnhancedTimer = dynamic(
  () => import('@/app/timer/components/enhanced-timer'),
  {
    ssr: false,
  },
);

export default function TimerPage() {
  return (
    <main
      className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center"
      aria-label="Pomodoro timer page"
    >
      <Suspense fallback={null}>
        <EnhancedTimer />
      </Suspense>
    </main>
  );
}
