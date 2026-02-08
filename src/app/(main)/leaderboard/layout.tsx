import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard • Improcode',
  description: 'See the top focus masters and compete for the top spot on the Improcode leaderboard.',
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
