'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import GATracker from '@/components/trackings/ga';
import { useSystemStore } from '@/stores/system-store';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isFocusMode } = useSystemStore();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-screen overflow-hidden flex flex-col">
                {!isFocusMode && (
                    <header className="flex h-14 items-center justify-between px-4 lg:h-[60px] shrink-0 gap-2">
                        <SidebarTrigger />
                        <AnimatedThemeToggler />
                    </header>
                )}
                {process.env.NEXT_PUBLIC_GA_ID ? <GATracker /> : null}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 lg:px-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
