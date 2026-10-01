'use client';

import dynamic from 'next/dynamic';

// The timer restores persisted state (localStorage) on first render, so it
// renders on the client only; the placeholder keeps the stage height stable.
export const AppHomeClientOnly = dynamic(() => import('./app-home'), {
  ssr: false,
  loading: () => <div data-theme="dark" className="min-h-dvh w-full" aria-hidden="true" />,
});
