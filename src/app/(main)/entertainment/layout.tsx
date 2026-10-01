import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Break Games • Study Bro',
  robots: { index: false, follow: true },
};

export default function EntertainmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
