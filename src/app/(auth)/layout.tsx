/**
 * Auth Layout - Server Component wrapper with client providers
 * For login, signup, password reset pages
 */
import { AppProviders } from '@/components/providers/app-providers';
import { AuthLayoutClient } from './layout-client';

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
