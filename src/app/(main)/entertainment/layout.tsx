import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Break Room • Study Bro App',
  description: 'Relax and recharge with mini-games and fun activities during your breaks.',
};

export default function EntertainmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
