import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login • Study Bro App',
  description: 'Sign in to your Study Bro App account to access your Pomodoro timer and productivity tools.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
