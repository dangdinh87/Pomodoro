import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isFeatureEnabled } from '@/config/feature-flags';

export const metadata: Metadata = {
  title: 'Chat AI • Study Bro App',
  robots: { index: false },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  if (!isFeatureEnabled('chat')) notFound();
  return <>{children}</>;
}
