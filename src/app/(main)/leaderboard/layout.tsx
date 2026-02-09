import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard • Study Bro App',
  description: 'See the top focus masters and compete for the top spot on the Study Bro App leaderboard.',
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
