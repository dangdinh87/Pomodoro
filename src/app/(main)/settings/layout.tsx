import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings • Improcode',
  description: 'Customize your Improcode experience: themes, timer settings, notifications, and more.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
