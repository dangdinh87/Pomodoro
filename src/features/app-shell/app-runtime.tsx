'use client';

import { AppProviders } from '@/components/providers/app-providers';
import AppHome from './app-home';

/** The app with its providers: one client-only chunk, loaded by AppHomeClientOnly once the page has hydrated. */
export default function AppRuntime({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <AppProviders>
      <AppHome googleEnabled={googleEnabled} />
    </AppProviders>
  );
}
