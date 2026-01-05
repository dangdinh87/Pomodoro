'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, X } from 'lucide-react';
import { useBackground } from '@/contexts/background-context';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/i18n-context';

interface BackgroundSettingsProps {
  onClose?: () => void;
}

export function BackgroundSettings({ onClose }: BackgroundSettingsProps) {
  const { t } = useI18n();
  const {
    background,
    setBackground,
    setBackgroundTemp,
  } = useBackground();
  const [styleValue, setStyleValue] = useState<string>('system:auto-color');
  const [opacity, setOpacity] = useState<number>(
    Math.round((background.opacity ?? 1) * 100),
  );
  const [brightness, setBrightness] = useState<number>(
    background.brightness ?? 100,
  );

  useEffect(() => {
    // Normalize to sentinel values for UI so Save/apply paths work from first load
    if (
      background.type === 'solid' &&
      /var\(--background\)/.test(background.value)
    ) {
      setStyleValue('system:auto-color');
      setOpacity(100);
      setBrightness(100);
    } else {
      setStyleValue(background.value || 'lofi:auto');
      setOpacity(Math.round((background.opacity ?? 1) * 100));
      setBrightness(background.brightness ?? 100);
    }
  }, [background]);

  const presets: {
    nameKey: string;
    value: string;
    kind: 'system' | 'auto' | 'video' | 'image';
  }[] = [
      { nameKey: 'settings.background.presets.systemAutoColor', value: 'system:auto-color', kind: 'system' },
      { nameKey: 'settings.background.presets.lofiChillAuto', value: 'lofi:auto', kind: 'auto' },
      { nameKey: 'settings.background.presets.dayChill', value: '/backgrounds/day.mp4', kind: 'video' },
      { nameKey: 'settings.background.presets.nightChill', value: '/backgrounds/night.mp4', kind: 'video' },
      {
        nameKey: 'settings.background.presets.travelling1',
        value: '/backgrounds/travelling.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling2',
        value: '/backgrounds/travelling2.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling3',
        value: '/backgrounds/travelling3.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling4',
        value: '/backgrounds/travelling4.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling5',
        value: '/backgrounds/travelling5.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling6',
        value: '/backgrounds/travelling6.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling7',
        value: '/backgrounds/travelling7.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling8',
        value: '/backgrounds/travelling8.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.travelling9',
        value: '/backgrounds/travelling9.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.background1',
        value: '/backgrounds/landscape-cartoon.jpg',
        kind: 'image',
      },
      {
        nameKey: 'settings.background.presets.chillShiba',
        value: '/backgrounds/xmas/chill-shiba-sleeping-christmas-room.jpg',
        kind: 'image',
      }
    ];

  const buildBackground = () => {
    // System auto color uses CSS var from theme
    if (styleValue.startsWith('system:')) {
      return {
        ...background,
        type: 'solid' as const,
        value: 'hsl(var(--background))',
        opacity: 1,
        blur: 0,
        brightness: 100,
      };
    }
    // Image/video including lofi:auto sentinel
    return {
      ...background,
      type: 'image' as const,
      value: styleValue,
      opacity: opacity / 100,
      blur: 0,
      brightness: brightness,
    };
  };

  const apply = () => {
    const next = buildBackground();
    // Persist atomically to avoid stale state overrides
    setBackground(next);
    toast.success(t('settings.background.toasts.saved'));
    onClose?.();
  };

  const reset = () => {
    // Reset to app default (System Color auto) to match provider's default
    setStyleValue('system:auto-color');
    setOpacity(100);
    setBrightness(100);
    toast.success(t('settings.background.toasts.resetInfo'));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">{t('settings.background.selectImage')}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t('settings.background.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            {t('settings.background.reset')}
          </Button>
          <Button size="sm" onClick={apply}>
            {t('settings.background.saveChanges')}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="ml-2" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden grid grid-cols-12">
        {/* Left Column: Presets (Scrollable) */}
        <div className="col-span-8 overflow-y-auto p-6 border-r space-y-8">
          {/* System Auto Color */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('settings.background.systemAuto')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presets
                .filter((p) => p.kind === 'system')
                .map((p) => {
                  const selected = styleValue === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                        }`}
                      onClick={() => setStyleValue(p.value)}
                      title={t(p.nameKey)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                        <div
                          className="w-10 h-10 rounded-full border-2 shadow-sm"
                          style={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                          }}
                        />
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[1px] text-white text-xs py-1.5 text-center font-medium">
                        {t(p.nameKey)}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Video Presets */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('settings.background.videoBackgrounds')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presets
                .filter((p) => p.kind === 'video' || p.kind === 'auto')
                .map((p) => {
                  const selected = styleValue === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                        }`}
                      onClick={() => setStyleValue(p.value)}
                      title={t(p.nameKey)}
                    >
                      {p.kind === 'auto' ? (
                        <div className="absolute inset-0 flex">
                          <video
                            className="w-1/2 h-full object-cover"
                            src="/backgrounds/day.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <video
                            className="w-1/2 h-full object-cover"
                            src="/backgrounds/night.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <video
                          className="absolute inset-0 w-full h-full object-cover"
                          src={p.value}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )}
                      {selected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[1px] text-white text-xs py-1.5 text-center font-medium">
                        {t(p.nameKey)}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Image Presets */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('settings.background.images')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presets
                .filter((p) => p.kind === 'image')
                .map((p) => {
                  const selected = styleValue === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                        }`}
                      onClick={() => setStyleValue(p.value)}
                      title={t(p.nameKey)}
                    >
                      <img
                        src={p.value}
                        alt={t(p.nameKey)}
                        className="h-full w-full object-cover"
                      />
                      {selected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[1px] text-white text-xs py-1.5 text-center font-medium">
                        {t(p.nameKey)}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Sliders (Fixed) */}
        <div className="col-span-4 p-6 bg-muted/10 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="bg-opacity" className="text-base">{t('settings.background.opacity')}</Label>
              <span className="text-sm font-mono text-muted-foreground">{opacity}%</span>
            </div>
            <Slider
              id="bg-opacity"
              min={10}
              max={100}
              step={5}
              value={[opacity]}
              disabled={styleValue.startsWith('system:')}
              onValueChange={(v) => {
                const vol = v[0];
                setOpacity(vol);
                if (!styleValue.startsWith('system:')) {
                  setBackgroundTemp({
                    ...background,
                    type: 'image',
                    value: styleValue,
                    opacity: vol / 100,
                    blur: 0,
                    brightness: brightness,
                  });
                }
              }}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.background.opacityDescription')}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="bg-brightness" className="text-base">{t('settings.background.brightness')}</Label>
              <span className="text-sm font-mono text-muted-foreground">{brightness}%</span>
            </div>
            <Slider
              id="bg-brightness"
              min={0}
              max={200}
              step={5}
              value={[brightness]}
              disabled={styleValue.startsWith('system:')}
              onValueChange={(v) => {
                const val = v[0];
                setBrightness(val);
                if (!styleValue.startsWith('system:')) {
                  setBackgroundTemp({
                    ...background,
                    type: 'image',
                    value: styleValue,
                    opacity: opacity / 100,
                    blur: 0,
                    brightness: val,
                  });
                }
              }}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.background.brightnessDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
