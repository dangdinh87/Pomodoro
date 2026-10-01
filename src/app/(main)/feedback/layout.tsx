import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback • Study Bro',
  robots: { index: false, follow: true },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
