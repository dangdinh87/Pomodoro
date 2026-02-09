import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up • Study Bro App',
  description: 'Create a new Study Bro App account to start tracking your focus and productivity.',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
