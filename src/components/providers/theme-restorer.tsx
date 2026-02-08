'use client';

import { useEffect } from 'react';
import { themePresets, type ThemeVars } from '@/config/themes';

const STYLE_TAG_ID = 'app-theme-vars';
const STORAGE_KEY = 'ui-theme-key';

function injectTheme(theme: ThemeVars) {
  const optionalLight = [
    theme.light.radius ? `  --radius: ${theme.light.radius};` : '',
    theme.light['chart-1'] ? `  --chart-1: ${theme.light['chart-1']};` : '',
    theme.light['chart-2'] ? `  --chart-2: ${theme.light['chart-2']};` : '',
    theme.light['chart-3'] ? `  --chart-3: ${theme.light['chart-3']};` : '',
    theme.light['chart-4'] ? `  --chart-4: ${theme.light['chart-4']};` : '',
    theme.light['chart-5'] ? `  --chart-5: ${theme.light['chart-5']};` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const optionalDark = [
    theme.dark.radius ? `  --radius: ${theme.dark.radius};` : '',
    theme.dark['chart-1'] ? `  --chart-1: ${theme.dark['chart-1']};` : '',
    theme.dark['chart-2'] ? `  --chart-2: ${theme.dark['chart-2']};` : '',
    theme.dark['chart-3'] ? `  --chart-3: ${theme.dark['chart-3']};` : '',
    theme.dark['chart-4'] ? `  --chart-4: ${theme.dark['chart-4']};` : '',
    theme.dark['chart-5'] ? `  --chart-5: ${theme.dark['chart-5']};` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const cssBlock = `
:root {
  --background: ${theme.light.background};
  --foreground: ${theme.light.foreground};
  --card: ${theme.light.card};
  --card-foreground: ${theme.light['card-foreground']};
  --popover: ${theme.light.popover};
  --popover-foreground: ${theme.light['popover-foreground']};
  --primary: ${theme.light.primary};
  --primary-foreground: ${theme.light['primary-foreground']};
  --secondary: ${theme.light.secondary};
  --secondary-foreground: ${theme.light['secondary-foreground']};
  --muted: ${theme.light.muted};
  --muted-foreground: ${theme.light['muted-foreground']};
  --accent: ${theme.light.accent};
  --accent-foreground: ${theme.light['accent-foreground']};
  --destructive: ${theme.light.destructive};
  --destructive-foreground: ${theme.light['destructive-foreground']};
  --border: ${theme.light.border};
  --input: ${theme.light.input};
  --ring: ${theme.light.ring};
  --timer-foreground: ${theme.light['timer-foreground']};
  --sidebar-background: ${theme.light['sidebar-background'] || theme.light.background};
  --sidebar-foreground: ${theme.light['sidebar-foreground'] || theme.light.foreground};
  --sidebar-primary: ${theme.light['sidebar-primary'] || theme.light.primary};
  --sidebar-primary-foreground: ${theme.light['sidebar-primary-foreground'] || theme.light['primary-foreground']};
  --sidebar-accent: ${theme.light['sidebar-accent'] || theme.light.accent};
  --sidebar-accent-foreground: ${theme.light['sidebar-accent-foreground'] || theme.light['accent-foreground']};
  --sidebar-border: ${theme.light['sidebar-border'] || theme.light.border};
  --sidebar-ring: ${theme.light['sidebar-ring'] || theme.light.ring};
${optionalLight}
}
.dark {
  --background: ${theme.dark.background};
  --foreground: ${theme.dark.foreground};
  --card: ${theme.dark.card};
  --card-foreground: ${theme.dark['card-foreground']};
  --popover: ${theme.dark.popover};
  --popover-foreground: ${theme.dark['popover-foreground']};
  --primary: ${theme.dark.primary};
  --primary-foreground: ${theme.dark['primary-foreground']};
  --secondary: ${theme.dark.secondary};
  --secondary-foreground: ${theme.dark['secondary-foreground']};
  --muted: ${theme.dark.muted};
  --muted-foreground: ${theme.dark['muted-foreground']};
  --accent: ${theme.dark.accent};
  --accent-foreground: ${theme.dark['accent-foreground']};
  --destructive: ${theme.dark.destructive};
  --destructive-foreground: ${theme.dark['destructive-foreground']};
  --border: ${theme.dark.border};
  --input: ${theme.dark.input};
  --ring: ${theme.dark.ring};
  --timer-foreground: ${theme.dark['timer-foreground']};
  --sidebar-background: ${theme.dark['sidebar-background'] || theme.dark.background};
  --sidebar-foreground: ${theme.dark['sidebar-foreground'] || theme.dark.foreground};
  --sidebar-primary: ${theme.dark['sidebar-primary'] || theme.dark.primary};
  --sidebar-primary-foreground: ${theme.dark['sidebar-primary-foreground'] || theme.dark['primary-foreground']};
  --sidebar-accent: ${theme.dark['sidebar-accent'] || theme.dark.accent};
  --sidebar-accent-foreground: ${theme.dark['sidebar-accent-foreground'] || theme.dark['accent-foreground']};
  --sidebar-border: ${theme.dark['sidebar-border'] || theme.dark.border};
  --sidebar-ring: ${theme.dark['sidebar-ring'] || theme.dark.ring};
${optionalDark}
}
`.trim();

  let styleEl = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_TAG_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = cssBlock;
}

/**
 * Restores the user's saved color theme on app startup.
 * Must be rendered inside AppProviders so it runs on every page load.
 */
export function ThemeRestorer() {
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (!savedKey || savedKey === 'default') return;

    // Skip if already injected (e.g., settings page mounted first)
    if (document.getElementById(STYLE_TAG_ID)) return;

    const theme = themePresets.find((t) => t.key === savedKey);
    if (theme) {
      injectTheme(theme);
    }
  }, []);

  // Also restore font and font size
  useEffect(() => {
    const savedFont = localStorage.getItem('ui-font');
    if (savedFont) {
      if (savedFont === 'Inter') {
        document.body.style.fontFamily = '';
      } else if (savedFont === 'Space Grotesk') {
        document.body.style.fontFamily = 'var(--font-space-grotesk)';
      } else if (savedFont === 'System UI') {
        document.body.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      } else if (savedFont === 'Nunito') {
        document.body.style.fontFamily = 'var(--font-nunito)';
      }
    } else {
      document.body.style.fontFamily = 'var(--font-nunito)';
    }

    const savedFontSize = localStorage.getItem('ui-font-size');
    if (savedFontSize) {
      if (savedFontSize === 'small') {
        document.documentElement.style.fontSize = '14px';
      } else if (savedFontSize === 'large') {
        document.documentElement.style.fontSize = '18px';
      } else {
        document.documentElement.style.fontSize = '16px';
      }
    }
  }, []);

  return null;
}
