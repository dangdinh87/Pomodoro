'use client';

import { LimelightNavigation } from '@/components/layout/limelight-navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-transparent text-foreground overflow-x-hidden">
      <LimelightNavigation />

      <div className="">{children}</div>
    </main>
  );
}
