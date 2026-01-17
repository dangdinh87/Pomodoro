'use client';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen relative">
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
}
