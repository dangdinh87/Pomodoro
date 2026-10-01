'use client';

import { useLayoutEffect } from 'react';
import {
  applyColorPreset,
  applyUiFont,
  applyUiFontSize,
  getSavedColorPreset,
  getSavedUiFont,
  getSavedUiFontSize,
} from '@/lib/ui-preferences';

/**
 * Restores the user's saved colour preset, font and font size on app startup.
 * Must be rendered inside AppProviders so it runs on every page load.
 */
export function ThemeRestorer() {
  useLayoutEffect(() => {
    applyColorPreset(getSavedColorPreset());
    applyUiFont(getSavedUiFont());
    applyUiFontSize(getSavedUiFontSize());
  }, []);

  return null;
}
