'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/auth-store';

import { BorderBeam } from '@/components/ui/border-beam';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isBusy = emailLoading || googleLoading;

  useEffect(() => {
    if (!user) return;
    const redirectUrl = searchParams.get('redirect') ?? '/timer';
    router.replace(redirectUrl);
  }, [user, router, searchParams]);

  const getSupabaseClient = () => {
    if (!supabase) {
      toast.error(
        'Supabase chưa được cấu hình. Vui lòng bổ sung biến môi trường.',
      );
      return null;
    }
    return supabase;
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;
    if (!email || !password) {
      toast.error('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message || 'Không thể đăng nhập.');
        setEmailLoading(false);
      } else {
        toast.success('Đăng nhập thành công!');
        // Don't set loading to false here, let the redirect happen
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi đăng nhập.');
      setEmailLoading(false);
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
        toast.error('Không thể kết nối Google. Thử lại sau.');
      } else {
        toast.message('Đang chuyển hướng đến Google…');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi khởi tạo đăng nhập.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="relative w-full max-w-md overflow-hidden border-white/10 bg-background/80 shadow-2xl backdrop-blur">
        <BorderBeam size={250} duration={12} delay={0} />
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold flex flex-col items-center gap-2">
            <Image src="/images/logo.svg" alt="Study Bro" width={52} height={52} />
            Đăng nhập với Study Bro
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Đăng nhập để giữ nhịp học và đồng bộ mọi phiên Pomodoro.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isBusy}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
              />
            </div>
            <Button className="w-full" type="submit" disabled={emailLoading}>
              {emailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Separator className="flex-1" />
            hoặc
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
                Tiếp tục với Google
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p className="text-center">
            Chưa có tài khoản?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <Button variant="ghost" asChild>
            <Link href="/timer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại ứng dụng
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
