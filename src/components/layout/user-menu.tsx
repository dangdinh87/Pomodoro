'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BookOpen, ChatCircle, Gear, Globe, SignIn, SignOut, UserCircle } from '@phosphor-icons/react/dist/ssr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase-client';
import { useI18n, LANGS, type Lang } from '@/contexts/i18n-context';

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { t, lang, setLang } = useI18n();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(t('auth.signOutError'));
        return;
      }
      toast.success(t('auth.signOutSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('auth.signOutUnexpectedError'));
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand data-[state=open]:bg-surface-hover"
        aria-label={user ? user.name ?? user.email ?? t('nav.settings') : t('nav.login')}
      >
        {user ? (
          <Avatar className="size-8 border border-border">
            <AvatarImage src={user.avatarUrl || ''} alt="" />
            <AvatarFallback className="bg-surface-raised text-[0.8125rem] font-semibold text-ink-secondary">
              {initial}
            </AvatarFallback>
          </Avatar>
        ) : (
          <UserCircle size={24} />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-lg border-border bg-surface p-1">
        {user ? (
          <DropdownMenuLabel className="px-2 py-2 font-normal">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuItem className="cursor-pointer gap-3 py-2" onClick={() => router.push('/login')}>
            <SignIn size={16} className="text-ink-muted" />
            <span className="flex flex-col">
              <span className="font-semibold text-ink">{t('nav.login')}</span>
              <span className="text-xs text-ink-muted">{t('nav.signInHint')}</span>
            </span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer gap-3" onClick={() => router.push('/settings')}>
          <Gear size={16} className="text-ink-muted" />
          {t('nav.settings')}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-3" onClick={() => router.push('/guide')}>
          <BookOpen size={16} className="text-ink-muted" />
          {t('nav.guide')}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-3" onClick={() => router.push('/feedback')}>
          <ChatCircle size={16} className="text-ink-muted" />
          {t('nav.feedback')}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer gap-3">
            <Globe size={16} className="text-ink-muted" />
            {t('common.language')}
            <span className="ml-auto text-xs text-ink-muted">{LANGS.find((l) => l.code === lang)?.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-lg border-border bg-surface">
              <DropdownMenuRadioGroup value={lang} onValueChange={(value) => setLang(value as Lang)}>
                {LANGS.map((l) => (
                  <DropdownMenuRadioItem key={l.code} value={l.code} className="cursor-pointer">
                    {l.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-3 text-danger-ink focus:bg-danger-bg focus:text-danger-ink"
              onClick={handleSignOut}
            >
              <SignOut size={16} />
              {t('nav.logout')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
