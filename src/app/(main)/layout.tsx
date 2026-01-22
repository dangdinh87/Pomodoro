'use client';

/**
 * Main App Layout - Client Component
 * Wraps authenticated app sections with providers
 */
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import GATracker from '@/components/trackings/ga';
import { useSystemStore } from '@/stores/system-store';
import { GlobalChat } from '@/components/chat/global-chat';
import { BotMessageSquare } from '@/components/animate-ui/icons/bot-message-square';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { AppProviders } from '@/components/providers/app-providers';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFocusMode, isChatPanelOpen, setChatPanelOpen } = useSystemStore();
  const pathname = usePathname();
  const showChatToggle = pathname !== '/chat';

  return (
    <AppProviders>
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
              {process.env.NEXT_PUBLIC_GA_ID ? <GATracker /> : null}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 lg:px-0">
                {children}
              </div>
            </div>
            <GlobalChat />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppProviders>
  );
}
