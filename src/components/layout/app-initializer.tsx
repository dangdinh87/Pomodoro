'use client';

import { useBackground } from '@/contexts/background-context';
import { useGlobalLoader } from '@/hooks/use-global-loader';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface AppInitializerProps {
  children: React.ReactNode;
}

export default function AppInitializer({ children }: AppInitializerProps) {
  const { showLoader, hideLoader } = useGlobalLoader();
  const [isInitialized, setIsInitialized] = useState(false);
  const { setTheme } = useTheme();
  const { background, setBackground, isLoading } = useBackground();

  // Ensure default "Lofi Chill (Auto)" background if none is set
  useEffect(() => {
    if (isLoading) return;
    if (!background.value || background.type === 'none') {
      setBackground({
        showDottedMap: false,
        type: 'image',
        value: 'lofi:auto',
        opacity: 0.9,
        blur: 0,
      });
    }
  }, [isLoading, background.value, background.type, setBackground]);

  return <>{children}</>;
}
