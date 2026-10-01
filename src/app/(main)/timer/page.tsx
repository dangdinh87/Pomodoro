import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { TimerLiveAnnouncer } from '@/app/(main)/timer/components/timer-live-announcer';

export const metadata: Metadata = buildPageMetadata({
  path: '/timer',
  title: 'Free Pomodoro Timer Online • Study Bro',
  description:
    'Free online Pomodoro timer with five clock styles, ambient focus sounds, task tracking and break reminders. Works without signup.',
});

const EnhancedTimer = dynamic(
  () => import('@/app/(main)/timer/components/enhanced-timer'),
  {
    ssr: false,
  },
);

export default function TimerPage() {
  return (
    <>
      <Suspense fallback={null}>
        <EnhancedTimer />
      </Suspense>
      <TimerLiveAnnouncer />
    </>
  );
}
