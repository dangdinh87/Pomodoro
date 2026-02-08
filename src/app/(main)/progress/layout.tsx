import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress • Improcode',
  description: 'Track your long-term progress and achievements.',
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
