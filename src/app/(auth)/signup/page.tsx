'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/auth-store';
import { useI18n } from '@/contexts/i18n-context';

import { BorderBeam } from '@/components/ui/border-beam';
import Image from 'next/image';

// Component that handles redirect logic with useSearchParams
function SignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    const redirectUrl = searchParams.get('redirect') ?? '/timer';
    router.replace(redirectUrl);
  }, [user, router, searchParams]);

  return null;
}

export default function SignupPage() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isBusy = signupLoading || googleLoading;

  const getSupabaseClient = () => {
    if (!supabase) {
      toast.error(t('signup.errors.supabaseNotConfigured'));
      return null;
    }
    return supabase;
  };

  const handleEmailSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    if (!email || !password) {
      toast.error(t('signup.errors.emailPasswordRequired'));
      return;
    }
    setSignupLoading(true);
    try {
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) {
        toast.error(error.message || t('signup.errors.signupFailed'));
      } else {
        toast.success(t('signup.success.checkEmail'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('signup.errors.signupError'));
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setGoogleLoading(true);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        toast.error(t('signup.errors.googleConnectionFailed'));
      } else {
        toast.message(t('signup.success.redirectingToGoogle'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('signup.errors.googleAuthError'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <SignupRedirect />
      </Suspense>
        <Card className="relative w-full max-w-md overflow-hidden border-white/10 bg-background/80 shadow-2xl backdrop-blur">
          <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold flex flex-col items-center gap-2">
            <Image src="/images/logo.svg" alt={t('brand.title')} width={52} height={52} />
            {t('signup.title')}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {t('signup.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleEmailSignup}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.form.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('signup.form.emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.form.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('signup.form.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
              />
            </div>
            <Button className="w-full" type="submit" disabled={signupLoading}>
              {signupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signup.form.signingUp')}
                </>
              ) : (
                t('signup.form.signUp')
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Separator className="flex-1" />
            {t('signup.form.or')}
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={googleLoading || Boolean(user)}
          >
            {googleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Google
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t('signup.form.signUpWithGoogle')}
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p className="text-center">
            {t('signup.form.haveAccount')}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {t('signup.form.signInNow')}
            </Link>
          </p>
          <Button variant="ghost" asChild>
            <Link href="/timer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('signup.form.backToApp')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
