'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import {
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { BotMessageSquare } from '@/components/animate-ui/icons/bot-message-square';
import {
  AnimatedTimer,
  AnimatedTasks,
  AnimatedHistory,
  AnimatedLeaderboard,
  AnimatedSettings,
  AnimatedGuide,
} from '@/components/ui/animated-sidebar-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { AnimateIcon } from '../animate-ui/icons/icon';
import { Clock } from '../animate-ui/icons/clock';
import { useI18n } from '@/contexts/i18n-context';

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { t } = useI18n();

  const handleSignOut = async () => {
    if (!supabase) {
      toast.error(t('auth.supabaseNotConfigured'));
      return;
    }

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

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/timer">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image alt="StudyBro" width={40} height={40} src="/images/logo.png" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold" suppressHydrationWarning>{t('brand.title')}</span>
                  <span className="truncate text-xs" suppressHydrationWarning>{t('brand.subtitle')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel suppressHydrationWarning>{t('nav.navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/timer'}>
                  <Link href="/timer">
                    <AnimatedTimer isActive={pathname === '/timer'} />
                    <span suppressHydrationWarning>{t('nav.timer')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/tasks'}>
                  <Link href="/tasks">
                    <AnimatedTasks isActive={pathname === '/tasks'} />
                    <span suppressHydrationWarning>{t('nav.tasks')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/history'}
                >
                  <Link href="/history">
                    <AnimatedHistory isActive={pathname === '/history'} />
                    <span suppressHydrationWarning>{t('nav.history')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/leaderboard'}>
                  <Link href="/leaderboard">
                    <AnimatedLeaderboard isActive={pathname === '/leaderboard'} />
                    <span suppressHydrationWarning>{t('nav.leaderboard')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/chat'}>
                  <Link href="/chat" className="group/chat">
                    <AnimateIcon animateOnHover className="group-hover/chat:text-primary">
                      <BotMessageSquare animate={pathname === '/chat'} loop={pathname === '/chat'} className="size-5" />
                    </AnimateIcon>
                    <span suppressHydrationWarning>Bro Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel suppressHydrationWarning>{t('nav.system')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                  <Link href="/settings">
                    <AnimatedSettings isActive={pathname === '/settings'} />
                    <span suppressHydrationWarning>{t('nav.settings')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/guide'}>
              <Link href="/guide">
                <AnimatedGuide isActive={pathname === '/guide'} />
                <span suppressHydrationWarning>{t('nav.guide')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/feedback'}>
              <Link href="/feedback">
                <MessageSquare className="size-5" />
                <span suppressHydrationWarning>{t('nav.feedback')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="mx-0" />

        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage
                    src={user.avatarUrl || ''}
                    alt={user.name || ''}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <div
                  onClick={handleSignOut}
                  className="group-data-[collapsible=icon]:hidden"
                >
                  <LogOut className="ml-auto size-4" />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                variant="outline"
                asChild
                size="lg"

              >
                <Link href="/login" className="font-bold justify-center">
                  <span className="group-data-[collapsible=icon]:hidden" suppressHydrationWarning>{t('nav.loginNow')}</span>
                  <LogOut className="hidden group-data-[collapsible=icon]:block size-4 rotate-180" />
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
