import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback • Study Bro App',
  description: 'Share your thoughts, report issues, and help us improve Study Bro App.',
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
