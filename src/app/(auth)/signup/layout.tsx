import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up • Improcode',
  description: 'Create a new Improcode account to start tracking your focus and productivity.',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
