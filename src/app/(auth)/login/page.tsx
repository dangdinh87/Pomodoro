'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, LogIn } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/auth-store';
import { useI18n } from '@/contexts/i18n-context';

import { BorderBeam } from '@/components/ui/border-beam';
import Image from 'next/image';

// Component that handles redirect logic with useSearchParams
function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Only redirect if we have a user AND we're not in a loading state
    // This prevents redirecting with stale user data during failed login attempts
    if (!user || isLoading) return;

    // Verify the session is actually valid before redirecting
    const checkSessionAndRedirect = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const redirectUrl = searchParams.get('redirect') ?? '/timer';
          router.replace(redirectUrl);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    checkSessionAndRedirect();
  }, [user, isLoading, router, searchParams]);

  return null;
}

export default function LoginPage() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const isBusy = emailLoading || googleLoading;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getSupabaseClient = () => {
    if (!supabase) {
      toast.error(t('login.errors.supabaseNotConfigured'));
      return null;
    }
    return supabase;
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    if (!email || !password) {
      toast.error(t('login.errors.emailPasswordRequired'));
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        // Clear any stale user data to prevent unwanted redirects
        setUser(null);
        toast.error(error.message || t('login.errors.loginFailed'));
        setEmailLoading(false);
      } else {
        toast.success(t('login.success.loginSuccess'));
        // Don't set loading to false here, let the redirect happen
      }
    } catch (error) {
      console.error(error);
      // Clear any stale user data to prevent unwanted redirects
      setUser(null);
      toast.error(t('login.errors.loginError'));
      setEmailLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    const emailToUse = forgotEmail.trim() || email.trim();
    if (!emailToUse) {
      toast.error(t('login.forgot.emailRequired'));
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(emailToUse, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        toast.error(error.message || t('login.forgot.error'));
      } else {
        toast.success(t('login.forgot.success'));
        setForgotPasswordOpen(false);
        setForgotEmail('');
      }
    } catch (err) {
      console.error(err);
      toast.error(t('login.forgot.error'));
    } finally {
      setForgotLoading(false);
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
        toast.error(t('login.errors.googleConnectionFailed'));
      } else {
        toast.message(t('login.success.redirectingToGoogle'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('login.errors.googleAuthError'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <LoginRedirect />
      </Suspense>
        <Card className="relative w-full max-w-md overflow-hidden border-white/10 bg-background/80 shadow-2xl backdrop-blur">
          <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold flex flex-col items-center gap-2">
            <Image src="/images/logo.svg" alt={t('brand.title')} width={52} height={52} />
            {t('login.title')}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {t('login.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.form.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.form.emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isBusy}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.form.password')}</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotPasswordOpen(true);
                  }}
                >
                  {t('login.form.forgotPassword')}
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('login.form.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
              />
            </div>
            <Button className="w-full" type="submit" disabled={emailLoading}>
              {emailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.form.signingIn')}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('login.form.signIn')}
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Separator className="flex-1" />
            {t('login.form.or')}
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
                {t('login.form.continueWithGoogle')}
              </>
            )}
          </Button>
        </CardContent>

        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('login.forgot.title')}</DialogTitle>
              <DialogDescription>{t('login.forgot.description')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t('login.form.email')}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder={t('login.form.emailPlaceholder')}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotPasswordOpen(false)}
                  disabled={forgotLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('login.forgot.sending')}
                    </>
                  ) : (
                    t('login.forgot.sendLink')
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p className="text-center">
            {t('login.form.noAccount')}{' '}
            <Link href="/signup" className="text-primary hover:underline">
              {t('login.form.signUpNow')}
            </Link>
          </p>
          <Button variant="ghost" asChild>
            <Link href="/timer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('login.form.backToApp')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
