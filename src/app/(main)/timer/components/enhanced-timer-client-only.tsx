'use client';

import dynamic from 'next/dynamic';

// The timer reads persisted client state (localStorage, audio) on first render;
// `ssr: false` must live in a Client Component since Next 15.
export const EnhancedTimerClientOnly = dynamic(() => import('./enhanced-timer'), { ssr: false });
