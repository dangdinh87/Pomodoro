import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { getGoogleCredentials } from '@/lib/auth/providers';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm googleEnabled={Boolean(getGoogleCredentials())} />
    </Suspense>
  );
}
