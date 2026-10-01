'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { detectFormatSupport } from '@/lib/format-detection';
import {
  DEFAULT_BACKGROUND,
  migrateBackground,
  type BackgroundSettings,
  type BGType,
} from '@/data/background-migration';

export type { BackgroundSettings, BGType };

interface BackgroundContextType {
  background: BackgroundSettings;
  isLoading: boolean;
  setBackground: (bg: BackgroundSettings) => void;
  setBackgroundTemp: (bg: BackgroundSettings) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundImage: (image: string, opacity?: number, blur?: number, brightness?: number) => void;
  setGradientBackground: (gradient: string, opacity?: number) => void;
  setBackgroundType: (type: BGType) => void;
}

const defaultBackground = DEFAULT_BACKGROUND;

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined,
);

// ---------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------

/** Detect lightweight mode: slow device or data-saver */
const shouldUseLightweightBackground = () => {
  const nav: any = navigator;

  const prefersReducedData =
    !!nav?.connection?.saveData ||
    ['slow-2g', '2g'].includes(nav?.connection?.effectiveType || '');

  const isLowEnd =
    typeof nav?.deviceMemory === 'number' && nav.deviceMemory <= 4;

  return prefersReducedData || isLowEnd;
};

// ---------------------------------------------------------------
// Provider
// ---------------------------------------------------------------

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [background, setBackgroundState] =
    useState<BackgroundSettings>(defaultBackground);

  const [isLoading, setIsLoading] = useState(true);

  // Detect format support + load config on mount
  useEffect(() => {
    async function init() {
      // Detect AVIF/WebP support before resolving URLs
      await detectFormatSupport();

      const saved = localStorage.getItem('background-settings');

      if (saved) {
        try {
          const parsed = JSON.parse(saved) as BackgroundSettings;
          const migrated = migrateBackground(parsed);

          setBackgroundState(migrated);
          if (migrated !== parsed) {
            localStorage.setItem('background-settings', JSON.stringify(migrated));
          }
        } catch {
          setBackgroundState(defaultBackground);
          localStorage.setItem(
            'background-settings',
            JSON.stringify(defaultBackground),
          );
        }
      } else {
        // First time user → choose lightweight or default
        const firstBG = shouldUseLightweightBackground()
          ? {
            showDottedMap: false,
            type: 'solid' as const,
            value: 'var(--surface-page)',
            opacity: 1,
            blur: 0,
            brightness: 100,
          }
          : defaultBackground;

        setBackgroundState(firstBG);
        localStorage.setItem('background-settings', JSON.stringify(firstBG));
      }

      setIsLoading(false);
    }

    init();
  }, []);

  // ---------------------------------------------------------------
  // Update helpers
  // ---------------------------------------------------------------

  const persist = (next: BackgroundSettings) => {
    setBackgroundState(next);
    try {
      localStorage.setItem('background-settings', JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save background settings to localStorage:', e);
    }
  };

  const update = (
    updater: (prev: BackgroundSettings) => BackgroundSettings,
  ) => {
    setBackgroundState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('background-settings', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save background settings to localStorage:', e);
      }
      return next;
    });
  };

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------

  const setBackground = persist;

  /** Preview only — updates state without persisting to localStorage */
  const setBackgroundTemp = (bg: BackgroundSettings) => {
    setBackgroundState(bg);
  };

  const setBackgroundColor = (color: string) => {
    update((p) => ({
      ...p,
      type: 'solid',
      value: color,
      opacity: 1,
      blur: 0,
      brightness: 100,
    }));
  };

  const setBackgroundImage = (image: string, opacity = 0.8, blur = 0, brightness = 100) => {
    update((p) => ({
      ...p,
      type: 'image',
      value: image,
      opacity,
      blur,
      brightness,
    }));
  };

  const setGradientBackground = (gradient: string, opacity = 1) => {
    update((p) => ({
      ...p,
      type: 'gradient',
      value: gradient,
      opacity,
      blur: 0,
      brightness: 100,
    }));
  };

  const setBackgroundType = (type: BGType) => {
    update((p) => ({
      ...p,
      type,
      value: type === 'none' ? '' : p.value,
    }));
  };

  return (
    <BackgroundContext.Provider
      value={{
        background,
        isLoading,
        setBackground,
        setBackgroundTemp,
        setBackgroundColor,
        setBackgroundImage,
        setGradientBackground,
        setBackgroundType,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

// ---------------------------------------------------------------
// Hook
// ---------------------------------------------------------------

export function useBackground() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) {
    throw new Error('useBackground must be used within BackgroundProvider');
  }
  return ctx;
}
