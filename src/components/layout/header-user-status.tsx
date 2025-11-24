'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/auth-store';
import { LogOut, UserRound } from 'lucide-react';
import { toast } from 'sonner';

export function HeaderUserStatus() {
  const user = useAuthStore((state) => state.user);

  const handleSignOut = async () => {
    if (!supabase) {
      toast.error('Supabase chưa được cấu hình.');
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Không thể đăng xuất.');
        return;
      }
      toast.success('Đã đăng xuất.');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi đăng xuất.');
    }
  };

  if (!user) {
    return (
      <Button asChild size="sm" variant="secondary">
        <Link href="/login">Đăng nhập</Link>
      </Button>
    );
  }

  const initials = user.name?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 shadow-sm">
        <div className="relative">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name ?? 'Người dùng'}
              width={36}
              height={36}
              className="rounded-full border border-white/10 shadow"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-100">
              {initials}
            </div>
          )}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground hover:text-foreground"
        onClick={handleSignOut}
        aria-label="Đăng xuất"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}



