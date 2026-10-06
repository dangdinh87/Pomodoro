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
 * Rendered by the (main) layout, so it runs on hydration of every app page load
 * (before the app's own code arrives: it also styles the server HTML).
 */
export function ThemeRestorer() {
  useLayoutEffect(() => {
    applyColorPreset(getSavedColorPreset());
    applyUiFont(getSavedUiFont());
    applyUiFontSize(getSavedUiFontSize());
  }, []);

  return null;
}
