import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  path: '/guide',
  title: 'Guide • Study Bro',
  description:
    'How to use Study Bro: the Pomodoro technique, timer settings, linking tasks to focus sessions, and reading your focus history.',
});

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
