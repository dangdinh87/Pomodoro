'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { detectFormatSupport } from '@/lib/format-detection';
import { findImageById } from '@/data/background-packs';
import { PATH_TO_ID_MAP, REMOVED_BACKGROUND_IDS } from '@/data/background-migration';

type BGType = 'none' | 'solid' | 'image' | 'gradient' | 'random';

interface BackgroundSettings {
  type: BGType;
  value: string;
  opacity: number;
  blur: number;
  brightness: number;
}

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

const defaultBackground: BackgroundSettings = {
  type: 'solid',
  value: 'hsl(var(--background))',
  opacity: 1,
  blur: 0,
  brightness: 100,
};

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

/** Migrate old or broken configs to safe defaults */
const migrateBackground = (bg: BackgroundSettings): BackgroundSettings => {
  if (!bg?.value || bg.type === 'none') {
    return {
      ...bg,
      type: 'solid',
      value: 'hsl(var(--background))',
      opacity: 1,
      blur: 0,
      brightness: 100,
    };
  }

  if (bg.type === 'random') {
    return {
      ...bg,
      type: 'solid',
      value: 'hsl(var(--background))',
      opacity: bg.opacity ?? 1,
      blur: bg.blur ?? 0,
      brightness: bg.brightness ?? 100,
    };
  }

  // Migrate old path-based values to new pack IDs
  if (bg.type === 'image' && bg.value) {
    if (REMOVED_BACKGROUND_IDS.has(bg.value)) {
      return {
        ...bg,
        type: 'solid',
        value: 'hsl(var(--background))',
        opacity: 1,
        blur: 0,
        brightness: 100,
      };
    }
    if (!findImageById(bg.value)) {
      const newId = PATH_TO_ID_MAP[bg.value];
      if (newId) return { ...bg, value: newId };
    }
  }

  return bg;
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
            value: 'hsl(var(--background))',
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
