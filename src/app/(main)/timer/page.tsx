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
    <Suspense fallback={null}>
      <EnhancedTimer />
    </Suspense>
  );
}
