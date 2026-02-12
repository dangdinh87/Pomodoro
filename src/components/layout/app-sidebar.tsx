'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import {
  LogOut,
  Settings,
  BookOpen,
  MessageSquare,
  Globe,
  ChevronsUpDown,
} from 'lucide-react';
import { BotMessageSquare } from '@/components/animate-ui/icons/bot-message-square';
import {
  AnimatedTimer,
  AnimatedTasks,
  AnimatedHistory,
  AnimatedLeaderboard,
  AnimatedEntertainment,
} from '@/components/ui/animated-sidebar-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { AnimateIcon } from '../animate-ui/icons/icon';
import { useI18n, LANGS, Lang } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

// Navigation item component - using default shadcn styling
function NavItem({
  href,
  icon,
  label,
  isActive,
  tooltip,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  tooltip?: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={tooltip || label}>
        <Link href={href}>
          {icon}
          <span suppressHydrationWarning>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { t, lang, setLang } = useI18n();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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

  const currentLang = LANGS.find((l) => l.code === lang);

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      {/* Header - Brand */}
      <SidebarHeader className="border-b border-sidebar-border/50 dark:border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent/70 transition-all duration-200"
            >
              <Link href="/timer" className="group/brand">
                <div
                  className={cn(
                    'flex aspect-square size-9 items-center justify-center rounded-xl',
                    'bg-gradient-to-br from-primary/10 to-primary/5',
                    'dark:from-sidebar-primary/20 dark:to-sidebar-primary/5',
                    'ring-1 ring-primary/10 dark:ring-sidebar-primary/20',
                    'transition-transform duration-200 group-hover/brand:scale-105'
                  )}
                >
                  <Image
                    alt="StudyBro"
                    width={32}
                    height={32}
                    src="/images/logo.png"
                    className="rounded-lg"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span
                    className="truncate font-semibold tracking-tight"
                    suppressHydrationWarning
                  >
                    {t('brand.title')}
                  </span>
                  <span
                    className="truncate text-xs text-muted-foreground/80 dark:text-sidebar-foreground/50"
                    suppressHydrationWarning
                  >
                    {t('brand.subtitle')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {/* Primary Actions - Core Features */}
        <SidebarGroup className="py-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <NavItem
                href="/timer"
                icon={<AnimatedTimer isActive={pathname === '/timer'} />}
                label={t('nav.timer')}
                isActive={pathname === '/timer'}
              />
              <NavItem
                href="/tasks"
                icon={<AnimatedTasks isActive={pathname === '/tasks'} />}
                label={t('nav.tasks')}
                isActive={pathname === '/tasks'}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 bg-sidebar-border/50 dark:bg-sidebar-border" />

        {/* Analytics & Progress */}
        <SidebarGroup className="py-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <NavItem
                href="/history"
                icon={<AnimatedHistory isActive={pathname === '/history'} />}
                label={t('nav.history')}
                isActive={pathname === '/history'}
              />
              <NavItem
                href="/leaderboard"
                icon={
                  <AnimatedLeaderboard isActive={pathname === '/leaderboard'} />
                }
                label={t('nav.leaderboard')}
                isActive={pathname === '/leaderboard'}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 bg-sidebar-border/50 dark:bg-sidebar-border" />

        {/* Tools & Entertainment */}
        <SidebarGroup className="py-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/chat'}
                  tooltip="Bro Chat"
                >
                  <Link href="/chat">
                    <AnimateIcon animateOnHover>
                      <BotMessageSquare
                        animate={pathname === '/chat'}
                        loop={pathname === '/chat'}
                        className="size-5"
                      />
                    </AnimateIcon>
                    <span suppressHydrationWarning>Bro Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <NavItem
                href="/entertainment"
                icon={
                  <AnimatedEntertainment
                    isActive={pathname === '/entertainment'}
                  />
                }
                label={t('nav.entertainment')}
                isActive={pathname === '/entertainment'}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Menu Dropdown */}
      <SidebarFooter className="border-t border-sidebar-border/50 dark:border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={cn(
                    'group/user transition-all duration-200',
                    'hover:bg-sidebar-accent/50 dark:hover:bg-sidebar-accent/70',
                    'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  )}
                  tooltip={user?.name || t('nav.loginNow')}
                >
                  {user ? (
                    <>
                      <Avatar
                        className={cn(
                          'h-8 w-8 shrink-0 rounded-lg',
                          'ring-2 ring-sidebar-border/50 dark:ring-sidebar-border',
                          'transition-all duration-200 group-hover/user:ring-primary/30 dark:group-hover/user:ring-sidebar-primary/30'
                        )}
                      >
                        <AvatarImage src={user.avatarUrl || ''} alt={user.name || ''} />
                        <AvatarFallback
                          className={cn(
                            'rounded-lg',
                            'bg-gradient-to-br from-primary/20 to-primary/10',
                            'dark:from-sidebar-primary/30 dark:to-sidebar-primary/10',
                            'text-primary dark:text-sidebar-primary',
                            'font-medium'
                          )}
                        >
                          {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-medium">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground/80 dark:text-sidebar-foreground/50">
                          {user.email}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          'bg-sidebar-accent dark:bg-sidebar-accent/70',
                          'text-sidebar-foreground/70'
                        )}
                      >
                        <LogOut className="size-4 rotate-180" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-medium" suppressHydrationWarning>
                          {t('nav.loginNow')}
                        </span>
                        <span className="truncate text-xs text-muted-foreground/80 dark:text-sidebar-foreground/50">
                          Sign in to sync
                        </span>
                      </div>
                    </>
                  )}
                  <ChevronsUpDown className="ml-auto size-4 opacity-50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className={cn(
                  'w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg',
                  'bg-popover/95 backdrop-blur-xl',
                  'dark:bg-popover/90 dark:backdrop-blur-2xl',
                  'border-border/50 dark:border-border/30'
                )}
                side={isCollapsed ? 'right' : 'top'}
                align="start"
                sideOffset={8}
              >
                {/* User Info Header */}
                {user && (
                  <>
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-3 px-2 py-2.5 text-left">
                        <Avatar className="h-9 w-9 rounded-lg">
                          <AvatarImage src={user.avatarUrl || ''} alt={user.name || ''} />
                          <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
                            {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{user.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Navigation Items */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer gap-3"
                    onClick={() => router.push('/guide')}
                  >
                    <BookOpen className="size-4 text-muted-foreground" />
                    <span suppressHydrationWarning>{t('nav.guide')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-3"
                    onClick={() => router.push('/feedback')}
                  >
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <span suppressHydrationWarning>{t('nav.feedback')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-3"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    <span suppressHydrationWarning>{t('nav.settings')}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Language Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-3 cursor-pointer">
                    <Globe className="size-4 text-muted-foreground" />
                    <span suppressHydrationWarning>{t('common.language')}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {currentLang?.label}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent
                      className={cn(
                        'rounded-lg',
                        'bg-popover/95 backdrop-blur-xl',
                        'dark:bg-popover/90 dark:backdrop-blur-2xl'
                      )}
                    >
                      <DropdownMenuRadioGroup
                        value={lang}
                        onValueChange={(value) => setLang(value as Lang)}
                      >
                        {LANGS.map((l) => (
                          <DropdownMenuRadioItem
                            key={l.code}
                            value={l.code}
                            className="cursor-pointer gap-2"
                          >
                            {l.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Login/Logout */}
                {user ? (
                  <DropdownMenuItem
                    className="cursor-pointer gap-3 text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-4" />
                    <span suppressHydrationWarning>{t('nav.logout')}</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="cursor-pointer gap-3"
                    onClick={() => router.push('/login')}
                  >
                    <LogOut className="size-4 rotate-180 text-muted-foreground" />
                    <span suppressHydrationWarning>{t('nav.loginNow')}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
