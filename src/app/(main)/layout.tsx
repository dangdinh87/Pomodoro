import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import GATracker from '@/components/trackings/ga';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SidebarTrigger className="m-3 absolute top-0 left-0 z-50" />
                <AnimatedThemeToggler className="absolute top-4 right-4 z-50" />
                {process.env.NEXT_PUBLIC_GA_ID ? <GATracker /> : null}
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
