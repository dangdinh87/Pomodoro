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
import { useI18n } from '@/contexts/i18n-context';

import { defaultTheme, themePresets, type ThemeVars } from '@/config/themes';

export function ThemeSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {

  const { t } = useI18n();
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
      setSelectedKey('default');
      toast.success(t('settings.general.theme.themeApplied', { name: t('settings.general.theme.themes.default') }));
      return;
    }
    const theme = themePresets.find((t) => t.key === key);
    if (!theme) return;
    injectTheme(theme);
    localStorage.setItem('ui-theme-key', key);
    setSelectedKey(key);
    toast.success(t('settings.general.theme.themeApplied', { name: t(`settings.general.theme.themes.${key}`) || theme.name }));
  };

  const resetTheme = (silent?: boolean) => {
    const styleEl = document.getElementById(styleTagId);
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    localStorage.removeItem('ui-theme-key');
    setSelectedKey('default');
    if (!silent) toast.success(t('settings.general.theme.themeApplied', { name: t('settings.general.theme.themes.default') }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('settings.general.theme.colorTheme')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm">{t('settings.general.theme.colorThemeDescription')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('settings.general.theme.systemSolidColorHint')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[defaultTheme, ...themePresets].map((preset) => {
              const selected = selectedKey === preset.key;
              const themeName = t(`settings.general.theme.themes.${preset.key}`) || preset.name;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyTheme(preset.key)}
                  className={`relative p-3 rounded-lg border text-left transition-all duration-150 hover:scale-105 ${selected
                    ? 'ring-2'
                    : 'border-border hover:bg-muted'
                    }`}
                  style={selected ? {
                    borderColor: `hsl(${preset.light.primary})`,
                    backgroundColor: `hsl(${preset.light.primary} / 0.08)`,
                    boxShadow: `0 0 0 2px hsl(${preset.light.primary} / 0.2)`,
                  } : undefined}
                  title={themeName}
                  aria-label={themeName}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xl">{preset.emoji}</span>
                    <div
                      className="w-7 h-7 rounded-full shadow-sm ring-1 ring-black/10"
                      style={{ backgroundColor: `hsl(${preset.light.primary})` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{themeName}</div>
                    {selected && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: `hsl(${preset.light.primary})` }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end pt-3 border-t mt-2">
          <Button onClick={onClose}>
            {t('settings.general.theme.themes.default') ? 'OK' : 'OK'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ThemeSettingsModal;
