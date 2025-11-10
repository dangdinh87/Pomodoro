'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface BackgroundSettings {
  showDottedMap: boolean;
  type: 'none' | 'solid' | 'image' | 'gradient' | 'random';
  value: string;
  opacity: number;
  blur: number;
}

interface BackgroundContextType {
  background: BackgroundSettings;
  isLoading: boolean;
  setBackground: (background: BackgroundSettings) => void;
  // Apply without persisting (temporary for current session)
  setBackgroundTemp: (background: BackgroundSettings) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundImage: (image: string, opacity?: number, blur?: number) => void;
  setGradientBackground: (gradient: string, opacity?: number) => void;
  setBackgroundType: (
    type: 'none' | 'solid' | 'image' | 'gradient' | 'random',
  ) => void;
  setShowDottedMap: (show: boolean) => void;
}

const defaultBackground: BackgroundSettings = {
  showDottedMap: false,
  type: 'image',
  value: 'lofi:auto',
  opacity: 0.9,
  blur: 0,
};

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined,
);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [background, setBackgroundState] =
    useState<BackgroundSettings>(defaultBackground);
  const [isLoading, setIsLoading] = useState(true);

  // Load background settings from localStorage on mount + migrate to "lofi:auto" if unset/legacy
  useEffect(() => {
    const savedBackground = localStorage.getItem('background-settings');
    if (savedBackground) {
      try {
        const parsed = JSON.parse(savedBackground) as BackgroundSettings;
        let next = parsed;

        // Migrations / sane defaults:
        // - If missing value or type is 'none' -> set System Color (Auto) using theme background
        // - If legacy type 'random' -> map to 'solid' with system auto color
        if (!parsed.value || parsed.type === 'none') {
          next = {
            ...parsed,
            type: 'solid',
            value: 'hsl(var(--background))',
            opacity: 1,
            blur: 0,
          };
        } else if (parsed.type === 'random') {
          next = {
            ...parsed,
            type: 'solid',
            value: 'hsl(var(--background))',
            opacity: parsed.opacity ?? 1,
            blur: parsed.blur ?? 0,
          };
        }

        setBackgroundState(next);
        if (next !== parsed) {
          localStorage.setItem('background-settings', JSON.stringify(next));
        }
      } catch (error) {
        console.error('Error parsing background settings:', error);
        setBackgroundState(defaultBackground);
        localStorage.setItem(
          'background-settings',
          JSON.stringify(defaultBackground),
        );
      }
    } else {
      // No saved config: initialize with Lofi Chill (Auto)
      setBackgroundState(defaultBackground);
      localStorage.setItem(
        'background-settings',
        JSON.stringify(defaultBackground),
      );
    }
    setIsLoading(false);
  }, []);

  // Internal helper to safely persist updates based on previous state
  const updateBackground = (
    updater: (prev: BackgroundSettings) => BackgroundSettings,
  ) => {
    setBackgroundState((prev) => {
      const next = updater(prev);
      localStorage.setItem('background-settings', JSON.stringify(next));
      return next;
    });
  };

  // Save background settings to localStorage whenever they change
  const setBackground = (newBackground: BackgroundSettings) => {
    setBackgroundState(newBackground);
    localStorage.setItem('background-settings', JSON.stringify(newBackground));
  };

  // Non-persistent update (temporary preview)
  const setBackgroundTemp = (newBackground: BackgroundSettings) => {
    setBackgroundState(newBackground);
  };

  const setBackgroundColor = (color: string) => {
    updateBackground((prev) => ({
      ...prev,
      type: 'solid',
      value: color,
      opacity: 1,
      blur: 0,
    }));
  };

  const setBackgroundImage = (image: string, opacity = 0.8, blur = 0) => {
    updateBackground((prev) => ({
      ...prev,
      type: 'image',
      value: image,
      opacity,
      blur,
    }));
  };

  const setGradientBackground = (gradient: string, opacity = 1) => {
    updateBackground((prev) => ({
      ...prev,
      type: 'gradient',
      value: gradient,
      opacity,
      blur: 0,
    }));
  };

  const setBackgroundType = (
    type: 'none' | 'solid' | 'image' | 'gradient' | 'random',
  ) => {
    updateBackground((prev) => ({
      ...prev,
      type,
      // Keep current value unless explicitly switching to none
      value: type === 'none' ? '' : prev.value,
    }));
  };

  const setShowDottedMap = (show: boolean) => {
    updateBackground((prev) => ({
      ...prev,
      showDottedMap: show,
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
        setShowDottedMap,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
