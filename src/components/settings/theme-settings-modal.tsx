'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ThemeSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  type ThemeVars = {
    name: string;
    key: string;
    light: Record<string, string>;
    dark: Record<string, string>;
  };

  const defaultTheme: ThemeVars = {
    name: 'Default',
    key: 'default',
    light: {
      primary: '0 0% 9%',
      border: '0 0% 89.8%',
    },
    dark: {
      primary: '0 0% 98%',
      border: '0 0% 14.9%',
    },
  };

  const themePresets: ThemeVars[] = [
    {
      name: 'Rose',
      key: 'rose',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 3.9%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 3.9%',
        primary: '346.8 77.2% 49.8%',
        'primary-foreground': '355.7 100% 97.3%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        'accent-foreground': '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '346.8 77.2% 49.8%',
        'timer-foreground': '346.8 77.2% 49.8%',
      },
      dark: {
        background: '20 14.3% 4.1%',
        foreground: '0 0% 95%',
        popover: '0 0% 9%',
        'popover-foreground': '0 0% 95%',
        card: '24 9.8% 10%',
        'card-foreground': '0 0% 95%',
        primary: '346.8 77.2% 49.8%',
        'primary-foreground': '355.7 100% 97.3%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '0 0% 15%',
        'muted-foreground': '240 5% 64.9%',
        accent: '12 6.5% 15.1%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '0 85.7% 97.3%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '346.8 77.2% 49.8%',
        'timer-foreground': '346 84% 65%',
      },
    },
    {
      name: 'Green',
      key: 'emerald',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 3.9%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 3.9%',
        primary: '142.1 76.2% 36.3%',
        'primary-foreground': '355.7 100% 97.3%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        'accent-foreground': '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '142.1 76.2% 36.3%',
        'timer-foreground': '142 71% 45%',
        radius: '0.65rem',
        'chart-1': '12 76% 61%',
        'chart-2': '173 58% 39%',
        'chart-3': '197 37% 24%',
        'chart-4': '43 74% 66%',
        'chart-5': '27 87% 67%',
      },
      dark: {
        background: '20 14.3% 4.1%',
        foreground: '0 0% 95%',
        popover: '0 0% 9%',
        'popover-foreground': '0 0% 95%',
        card: '24 9.8% 10%',
        'card-foreground': '0 0% 95%',
        primary: '142.1 70.6% 45.3%',
        'primary-foreground': '144.9 80.4% 10%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '0 0% 15%',
        'muted-foreground': '240 5% 64.9%',
        accent: '12 6.5% 15.1%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '0 85.7% 97.3%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '142.4 71.8% 29.2%',
        'timer-foreground': '142 76% 60%',
        'chart-1': '220 70% 50%',
        'chart-2': '160 60% 45%',
        'chart-3': '30 80% 55%',
        'chart-4': '280 65% 60%',
        'chart-5': '340 75% 55%',
      },
    },
    {
      name: 'Indigo',
      key: 'indigo',
      light: {
        background: '0 0% 100%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        'card-foreground': '222.2 84% 4.9%',
        popover: '0 0% 100%',
        'popover-foreground': '222.2 84% 4.9%',
        primary: '226 70% 55%',
        'primary-foreground': '210 40% 98%',
        secondary: '210 40% 96.1%',
        'secondary-foreground': '222.2 47.4% 11.2%',
        muted: '210 40% 96.1%',
        'muted-foreground': '215.4 16.3% 46.9%',
        accent: '210 40% 96.1%',
        'accent-foreground': '222.2 47.4% 11.2%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '210 40% 98%',
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
        ring: '226 70% 55%',
        'timer-foreground': '226 70% 55%',
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        'card-foreground': '210 40% 98%',
        popover: '222.2 84% 4.9%',
        'popover-foreground': '210 40% 98%',
        primary: '227 82% 60%',
        'primary-foreground': '222.2 47.4% 11.2%',
        secondary: '217.2 32.6% 17.5%',
        'secondary-foreground': '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        'muted-foreground': '215 20.2% 65.1%',
        accent: '217.2 32.6% 17.5%',
        'accent-foreground': '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
        ring: '227 82% 60%',
        'timer-foreground': '210 40% 98%',
      },
    },
    {
      name: 'Violet',
      key: 'violet',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 3.9%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 3.9%',
        primary: '262 83% 57%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        'accent-foreground': '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '262 83% 57%',
        'timer-foreground': '262 83% 57%',
      },
      dark: {
        background: '240 10% 4%',
        foreground: '0 0% 98%',
        card: '240 10% 4%',
        'card-foreground': '0 0% 98%',
        popover: '240 10% 4%',
        'popover-foreground': '0 0% 98%',
        primary: '262 83% 57%',
        'primary-foreground': '240 10% 4%',
        secondary: '240 3.7% 15.9%',
        'secondary-foreground': '0 0% 98%',
        muted: '240 3.7% 15.9%',
        'muted-foreground': '240 5% 64.9%',
        accent: '240 3.7% 15.9%',
        'accent-foreground': '0 0% 98%',
        destructive: '0 62% 30%',
        'destructive-foreground': '0 0% 98%',
        border: '240 3.7% 15.9%',
        input: '240 3.7% 15.9%',
        ring: '262 83% 57%',
        'timer-foreground': '262 84% 70%',
      },
    },
    {
      name: 'Amber',
      key: 'amber',
      light: {
        background: '0 0% 100%',
        foreground: '20 14.3% 4.1%',
        card: '0 0% 100%',
        'card-foreground': '20 14.3% 4.1%',
        popover: '0 0% 100%',
        'popover-foreground': '20 14.3% 4.1%',
        primary: '38 92% 50%',
        'primary-foreground': '60 9.1% 97.8%',
        secondary: '60 4.8% 95.9%',
        'secondary-foreground': '24 9.8% 10%',
        muted: '60 4.8% 95.9%',
        'muted-foreground': '25 5.3% 44.7%',
        accent: '60 4.8% 95.9%',
        'accent-foreground': '24 9.8% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '60 9.1% 97.8%',
        border: '20 5.9% 90%',
        input: '20 5.9% 90%',
        ring: '38 92% 50%',
        'timer-foreground': '38 92% 50%',
      },
      dark: {
        background: '20 14.3% 4.1%',
        foreground: '60 9.1% 97.8%',
        card: '20 14.3% 4.1%',
        'card-foreground': '60 9.1% 97.8%',
        popover: '20 14.3% 4.1%',
        'popover-foreground': '60 9.1% 97.8%',
        primary: '35 92% 47%',
        'primary-foreground': '60 9.1% 97.8%',
        secondary: '12 6.5% 15.1%',
        'secondary-foreground': '60 9.1% 97.8%',
        muted: '12 6.5% 15.1%',
        'muted-foreground': '24 5.4% 63.9%',
        accent: '12 6.5% 15.1%',
        'accent-foreground': '60 9.1% 97.8%',
        destructive: '0 72.2% 50.6%',
        'destructive-foreground': '60 9.1% 97.8%',
        border: '12 6.5% 15.1%',
        input: '12 6.5% 15.1%',
        ring: '35 92% 47%',
        'timer-foreground': '38 92% 60%',
      },
    },
    {
      name: 'Cyan',
      key: 'cyan',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 3.9%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 3.9%',
        primary: '189 94% 43%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        'accent-foreground': '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '189 94% 43%',
        'timer-foreground': '189 94% 43%',
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        'card-foreground': '210 40% 98%',
        popover: '222.2 84% 4.9%',
        'popover-foreground': '210 40% 98%',
        primary: '190 90% 45%',
        'primary-foreground': '222.2 47.4% 11.2%',
        secondary: '217.2 32.6% 17.5%',
        'secondary-foreground': '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        'muted-foreground': '215 20.2% 65.1%',
        accent: '217.2 32.6% 17.5%',
        'accent-foreground': '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
        ring: '190 90% 45%',
        'timer-foreground': '210 40% 98%',
      },
    },
    {
      name: 'Teal',
      key: 'teal',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 3.9%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 3.9%',
        primary: '174 72% 40%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        'accent-foreground': '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '174 72% 40%',
        'timer-foreground': '174 72% 40%',
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        'card-foreground': '210 40% 98%',
        popover: '222.2 84% 4.9%',
        'popover-foreground': '210 40% 98%',
        primary: '175 80% 45%',
        'primary-foreground': '222.2 47.4% 11.2%',
        secondary: '217.2 32.6% 17.5%',
        'secondary-foreground': '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        'muted-foreground': '215 20.2% 65.1%',
        accent: '217.2 32.6% 17.5%',
        'accent-foreground': '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
        ring: '175 80% 45%',
        'timer-foreground': '210 40% 98%',
      },
    },
    {
      name: 'Pink',
      key: 'pink',
      light: {
        background: '0 0% 100%',
        foreground: '240 10% 3.9%',
        card: '0 0% 100%',
        'card-foreground': '240 10% 3.9%',
        popover: '0 0% 100%',
        'popover-foreground': '240 10% 3.9%',
        primary: '330 81% 60%',
        'primary-foreground': '0 0% 98%',
        secondary: '240 4.8% 95.9%',
        'secondary-foreground': '240 5.9% 10%',
        muted: '240 4.8% 95.9%',
        'muted-foreground': '240 3.8% 46.1%',
        accent: '240 4.8% 95.9%',
        'accent-foreground': '240 5.9% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '240 5.9% 90%',
        input: '240 5.9% 90%',
        ring: '330 81% 60%',
        'timer-foreground': '330 81% 60%',
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        'card-foreground': '210 40% 98%',
        popover: '222.2 84% 4.9%',
        'popover-foreground': '210 40% 98%',
        primary: '330 85% 62%',
        'primary-foreground': '222.2 47.4% 11.2%',
        secondary: '217.2 32.6% 17.5%',
        'secondary-foreground': '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        'muted-foreground': '215 20.2% 65.1%',
        accent: '217.2 32.6% 17.5%',
        'accent-foreground': '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
        ring: '330 85% 62%',
        'timer-foreground': '210 40% 98%',
      },
    }
  ];

  const styleTagId = 'app-theme-vars';
  const [selectedKey, setSelectedKey] = useState<string>('');

  const injectTheme = (theme: ThemeVars) => {
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
${optionalDark}
}
`.trim();

    let styleEl = document.getElementById(
      styleTagId,
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleTagId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = cssBlock;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedKey = localStorage.getItem('ui-theme-key');
    if (savedKey && savedKey !== 'default') {
      const theme = themePresets.find((t) => t.key === savedKey);
      if (theme) {
        injectTheme(theme);
        setSelectedKey(savedKey);
        return;
      }
    }
    // Fallback to default selection if nothing applied or saved is 'default'
    setSelectedKey('default');
  }, []);

  const applyTheme = (key: string) => {
    if (key === 'default') {
      resetTheme(true);
      localStorage.setItem('ui-theme-key', 'default');
      setSelectedKey('default');
      toast.success('Theme "Default" applied');
      return;
    }
    const theme = themePresets.find((t) => t.key === key);
    if (!theme) return;
    injectTheme(theme);
    localStorage.setItem('ui-theme-key', key);
    setSelectedKey(key);
    toast.success('Theme "' + theme.name + '" applied');
  };

  const resetTheme = (silent?: boolean) => {
    const styleEl = document.getElementById(styleTagId);
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    localStorage.removeItem('ui-theme-key');
    setSelectedKey('default');
    if (!silent) toast.success('Theme reset to default');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Chọn theme</Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[defaultTheme, ...themePresets].map((t) => {
              const selected =
                selectedKey === t.key ||
                (t.key === 'default' && selectedKey === 'default');
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => applyTheme(t.key)}
                  className={`relative p-3 rounded-lg border text-left transition-all duration-150 hover:scale-105 ${
                    selected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border hover:bg-muted'
                  }`}
                  title={t.name}
                  aria-label={`Chọn theme ${t.name}`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full border-2 shadow-sm"
                      style={{
                        backgroundColor: `hsl(${t.light.primary})`,
                        borderColor: `hsl(${t.light.border || '0 0% 89.8%'})`,
                      }}
                      title="Light primary"
                    />
                    <div
                      className="w-7 h-7 rounded-full border-2 shadow-sm"
                      style={{
                        backgroundColor: `hsl(${t.dark.primary})`,
                        borderColor: `hsl(${t.dark.border || '0 0% 14.9%'})`,
                      }}
                      title="Dark primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{t.name}</div>
                    {selected && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between pt-3 border-t mt-2">
          <Button variant="outline" onClick={() => { resetTheme(); }}>
            Reset to Defaults
          </Button>
          <Button onClick={() => { toast.success('Theme settings saved successfully!'); onClose(); }}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ThemeSettingsModal;
