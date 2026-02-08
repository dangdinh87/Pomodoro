import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback • Improcode',
  description: 'Share your thoughts, report issues, and help us improve Improcode.',
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
