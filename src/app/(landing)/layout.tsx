'use client';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-black dark:to-slate-950 relative overflow-hidden">
            {/* Animated gradient mesh background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                {/* Primary gradient orbs */}
                <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-transparent blur-[120px] animate-pulse-slow" />
                <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-purple-500/15 via-pink-500/10 to-transparent blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[60%] h-[50%] rounded-full bg-gradient-to-b from-orange-500/10 via-transparent to-transparent blur-[100px]" />

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Radial gradient overlay for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            </div>

            {children}
        </div>
    );
}
