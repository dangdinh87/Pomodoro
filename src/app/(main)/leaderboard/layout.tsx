import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isFeatureEnabled } from '@/config/feature-flags';

export const metadata: Metadata = {
  title: 'Leaderboard • Study Bro App',
  robots: { index: false },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled('leaderboard')) notFound();
  return <>{children}</>;
}
