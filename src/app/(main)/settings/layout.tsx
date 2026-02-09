import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings • Study Bro App',
  description: 'Customize your Study Bro App experience: themes, timer settings, notifications, and more.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
