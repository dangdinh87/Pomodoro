/**
 * Auth Layout - Server Component wrapper with client providers
 * For login, signup, password reset pages
 */
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/app-providers';
import { AuthLayoutClient } from './layout-client';

// Login/signup/reset-password: never indexed
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <AuthLayoutClient>{children}</AuthLayoutClient>
    </AppProviders>
  );
}
