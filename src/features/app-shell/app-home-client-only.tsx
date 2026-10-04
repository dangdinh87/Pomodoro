'use client';

import dynamic from 'next/dynamic';
import { AppHomeSkeleton } from './app-home-skeleton';

// The timer restores persisted state (localStorage) on first render, so it renders on the client only.
// `loading` is part of the server HTML (Next renders it in place of an `ssr: false` component):
// the "25:00" card in it is the LCP and keeps the stage height stable until the app mounts.
export const AppHomeClientOnly = dynamic(() => import('./app-home'), {
  ssr: false,
  loading: () => <AppHomeSkeleton />,
});
