'use client';

/**
 * Main App Layout - Client Component
 * Wraps authenticated app sections with providers
 */
import { Suspense } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import GATracker from '@/components/trackings/ga';
import { useSystemStore } from '@/stores/system-store';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { AppProviders } from '@/components/providers/app-providers';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/contexts/i18n-context';
import { isFeatureEnabled } from '@/config/feature-flags';

// Loaded lazily so the chat chunks never ship when the chat flag is off.
const GlobalChat = dynamic(
  () => import('@/components/chat/global-chat').then((m) => m.GlobalChat),
  { ssr: false },
);
const BotMessageSquare = dynamic(
  () =>
    import('@/components/animate-ui/icons/bot-message-square').then(
      (m) => m.BotMessageSquare,
    ),
  { ssr: false },
);

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow"
    >
      {t('skipLink.label')}
    </a>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFocusMode, isChatPanelOpen, setChatPanelOpen } = useSystemStore();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const showChatToggle = isFeatureEnabled('chat');

  return (
    <AppProviders>
      <SkipLink />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-screen overflow-hidden flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              {!isFocusMode && (
                <header className="flex h-14 items-center justify-between px-4 lg:h-[60px] shrink-0 gap-2">
                  <SidebarTrigger />
                  <div className="flex items-center gap-2">
                    {showChatToggle && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setChatPanelOpen(!isChatPanelOpen)}
                        className={
                          isChatPanelOpen
                            ? 'text-primary bg-primary/10'
                            : 'hover:text-primary'
                        }
                        title="Toggle Chat"
                        aria-label="Toggle Chat"
                      >
                        <BotMessageSquare
                          loop={isChatPanelOpen}
                          animate={isChatPanelOpen}
                          initial={isChatPanelOpen ? 'open' : 'close'}
                          className="h-5 w-5"
                        />
                      </Button>
                    )}
                  </div>
                </header>
              )}
              {process.env.NEXT_PUBLIC_GA_ID ? (
                <Suspense fallback={null}>
                  <GATracker />
                </Suspense>
              ) : null}
              <div
                id="main-content"
                tabIndex={-1}
                className="flex-1 overflow-y-auto overflow-x-hidden px-0 focus:outline-none"
              >
                {children}
              </div>
            </div>
            {showChatToggle && <GlobalChat />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppProviders>
  );
}
