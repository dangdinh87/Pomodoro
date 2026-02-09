import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History • Study Bro App',
  description: 'View your session history, productivity stats, and focus trends.',
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
