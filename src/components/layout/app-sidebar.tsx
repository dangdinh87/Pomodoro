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
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import {
  LogOut,
  MessageSquare,
} from 'lucide-react';
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

export function AppSidebar() {
  const pathname = usePathname();
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
                  <span className="truncate font-semibold">StudyBro</span>
                  <span className="truncate text-xs">Pomodoro Timer Focus</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/timer'}>
                  <Link href="/timer">
                    <AnimatedTimer isActive={pathname === '/timer'} />
                    <span>Timer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/tasks'}>
                  <Link href="/tasks">
                    <AnimatedTasks isActive={pathname === '/tasks'} />
                    <span>Tasks</span>
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
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/leaderboard'}>
                  <Link href="/leaderboard">
                    <AnimatedLeaderboard isActive={pathname === '/leaderboard'} />
                    <span>Leaderboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                  <Link href="/settings">
                    <AnimatedSettings isActive={pathname === '/settings'} />
                    <span>Settings</span>
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
                <span>Guide</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/feedback'}>
              <Link href="/feedback">
                <MessageSquare className="size-5" />
                <span>Feedback</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.avatarUrl || ''}
                    alt={user.name || ''}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <div
                  onClick={handleSignOut}
                >
                  <LogOut className="ml-auto size-4" />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton className="py-3 bg-primary text-primary-foreground hover:bg-primary/90 justify-center" asChild>
                <Link href="/login" className="font-semibold">Đăng nhập ngay</Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
