import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isFeatureEnabled } from '@/config/feature-flags';

export const metadata: Metadata = {
  title: 'History • Study Bro App',
  robots: { index: false },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled('history')) notFound();
  return <>{children}</>;
}
