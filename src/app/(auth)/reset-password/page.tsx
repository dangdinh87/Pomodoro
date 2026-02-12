'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { useI18n } from '@/contexts/i18n-context';
import { BorderBeam } from '@/components/ui/border-beam';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !supabase) return;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasValidSession(!!data.session?.user);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          setHasValidSession(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [mounted]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error(t('login.errors.supabaseNotConfigured'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('resetPassword.errors.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('resetPassword.errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message || t('resetPassword.errors.updateFailed'));
        setLoading(false);
        return;
      }
      toast.success(t('resetPassword.success'));
      router.replace('/login');
    } catch (err) {
      console.error(err);
      toast.error(t('resetPassword.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (hasValidSession === false) {
    return (
      <Card className="relative w-full max-w-md overflow-hidden border-white/10 bg-background/80 shadow-2xl backdrop-blur">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt={t('brand.title')} width={36} height={36} />
            {t('resetPassword.invalidTitle')}
          </CardTitle>
          <CardDescription>{t('resetPassword.invalidDescription')}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('login.form.backToApp')}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (hasValidSession === null) {
    return (
      <Card className="relative w-full max-w-md overflow-hidden border-white/10 bg-background/80 shadow-2xl backdrop-blur p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-white/10 bg-background/80 shadow-2xl backdrop-blur">
      <BorderBeam size={250} duration={12} delay={0} />
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold flex flex-col items-center gap-2">
          <Image src="/images/logo.svg" alt={t('brand.title')} width={52} height={52} />
          {t('resetPassword.title')}
        </CardTitle>
        <CardDescription>{t('resetPassword.description')}</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <Label htmlFor="password">{t('resetPassword.newPassword')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('resetPassword.newPasswordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('resetPassword.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              minLength={6}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('resetPassword.updating')}
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {t('resetPassword.submit')}
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <Button variant="ghost" asChild className="w-full">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('login.form.backToApp')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
