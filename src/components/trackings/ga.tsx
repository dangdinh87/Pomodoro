'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GATracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;
    if (typeof window === 'undefined') return;
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    // Send page view on route change (App Router)
    window.gtag?.('config', GA_ID as string, {
      page_path: url,
      page_location: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}
