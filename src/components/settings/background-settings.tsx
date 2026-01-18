'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Upload, Trash2, Link, ImageIcon, FolderHeart } from 'lucide-react';
import { useBackground } from '@/contexts/background-context';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/i18n-context';
import { useCustomBackgrounds } from '@/hooks/use-custom-backgrounds';
import { Input } from '@/components/ui/input';
import { Info, AlertTriangle } from 'lucide-react';
import { backgroundPresets } from '@/data/background-presets';

interface BackgroundSettingsProps {
  onClose?: () => void;
  onDragChange?: (isDragging: boolean) => void;
}

export function BackgroundSettings({ onClose, onDragChange }: BackgroundSettingsProps) {
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

  // Custom images
  const { images: customImages, addImage, addImageByUrl, removeImage, canAddMore } = useCustomBackgrounds();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [draggedSlider, setDraggedSlider] = useState<'opacity' | 'brightness' | 'blur' | null>(null);

  useEffect(() => {
    onDragChange?.(!!draggedSlider);
  }, [draggedSlider, onDragChange]);

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
    <div className={`flex flex-col h-full transition-colors duration-200 ${draggedSlider ? 'cursor-move' : ''}`}>
      {/* Fixed Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 transition-all duration-200 ${draggedSlider ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
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
        {/* Left Column: Tabs (Scrollable) */}
        <div className={`col-span-8 overflow-y-auto p-6 border-r transition-all duration-200 ${draggedSlider ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
          <Tabs defaultValue="system" className="w-full">
            <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="system" className="flex-1 flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
                <ImageIcon className="h-4 w-4" />
                {t('settings.background.tabs.system')}
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex-1 flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
                <FolderHeart className="h-4 w-4" />
                {t('settings.background.tabs.personal')}
              </TabsTrigger>
            </TabsList>

            {/* System Images Tab */}
            <TabsContent value="system" className="space-y-8 mt-4">
              {/* System Auto Color */}
              <div className="space-y-3">
                <Label className="text-base font-medium">{t('settings.background.systemAuto')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {backgroundPresets
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
                  {backgroundPresets
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
                  {backgroundPresets
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
            </TabsContent>

            {/* Personal Images Tab */}
            <TabsContent value="personal" className="space-y-6 mt-0">
              {/* Upload Controls */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-dashed bg-muted/30">
                {/* URL Input Row */}
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder={t('settings.background.customImages.urlPlaceholder')}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && urlInput.trim() && canAddMore) {
                        const result = await addImageByUrl(urlInput.trim());
                        if (result.success) {
                          toast.success(t('settings.background.customImages.uploadSuccess'));
                          setUrlInput('');
                        } else {
                          const errorKey = `settings.background.customImages.${result.error}` as any;
                          toast.error(t(errorKey));
                        }
                      }
                    }}
                    className="flex-1"
                    disabled={!canAddMore}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!urlInput.trim()}
                    onClick={async () => {
                      const result = await addImageByUrl(urlInput.trim());
                      if (result.success) {
                        if (result.image) setStyleValue(result.image.dataUrl);
                        toast.success(t('settings.background.customImages.uploadSuccess'));
                        setUrlInput('');
                      } else {
                        const errorKey = `settings.background.customImages.${result.error}` as any;
                        toast.error(t(errorKey));
                      }
                    }}
                    title={t('settings.background.customImages.addUrl')}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>

                {/* Divider with OR text */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase">{t('settings.background.customImages.or')}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Upload File Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t('settings.background.customImages.uploadFile')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const result = await addImage(file);
                    if (result.success) {
                      if (result.image) setStyleValue(result.image.dataUrl);
                      toast.success(t('settings.background.customImages.uploadSuccess'));
                    } else {
                      const errorKey = `settings.background.customImages.${result.error}` as any;
                      toast.error(t(errorKey));
                    }
                    // Reset input
                    e.target.value = '';
                  }}
                />

                {/* Limit info removed */}
              </div>

              {/* Info & Warnings */}
              <div className="space-y-3">
                <div className="bg-muted/50 border border-muted rounded-lg p-3 flex gap-3 items-start">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-semibold">{t('settings.background.customImages.limit2MB')}</p>
                </div>
              </div>

              {/* Images Grid */}
              {/* Single Image Preview */}
              {customImages.length > 0 ? (
                <div className="mt-4">
                  <button
                    type="button"
                    className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] ${styleValue === customImages[0].dataUrl ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    onClick={() => setStyleValue(customImages[0].dataUrl)}
                  >
                    <img
                      src={customImages[0].dataUrl}
                      alt={customImages[0].name}
                      className="h-full w-full object-cover"
                    />
                    {styleValue === customImages[0].dataUrl && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {t('settings.background.customImages.current')}
                    </div>
                  </button>
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    {t('settings.background.customImages.replaceNotice')}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderHeart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t('settings.background.customImages.empty')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sliders (Fixed) */}
        <div className={`col-span-4 p-6 space-y-8 transition-colors duration-200 ${draggedSlider ? 'bg-transparent' : 'bg-muted/10'}`}>
          <div className={`space-y-3 transition-opacity duration-200 ${draggedSlider && draggedSlider !== 'opacity' ? 'opacity-0 invisible' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <Label htmlFor="bg-opacity" className="text-base">{t('settings.background.opacity')}</Label>
              <span className="text-sm font-mono text-muted-foreground">{opacity}%</span>
            </div>
            <Slider
              id="bg-opacity"
              min={10}
              max={100}
              step={1}
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
                    brightness: brightness,
                    blur: background.blur
                  });
                }
              }}
              onPointerDown={() => setDraggedSlider('opacity')}
              onPointerUp={() => setDraggedSlider(null)}
              onValueCommit={() => setDraggedSlider(null)}
              className={`py-2 ${draggedSlider === 'opacity' ? 'cursor-move' : ''}`}
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.background.opacityDescription')}
            </p>
          </div>

          <div className={`space-y-3 transition-opacity duration-200 ${draggedSlider && draggedSlider !== 'brightness' ? 'opacity-0 invisible' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <Label htmlFor="bg-brightness" className="text-base">{t('settings.background.brightness')}</Label>
              <span className="text-sm font-mono text-muted-foreground">{brightness}%</span>
            </div>
            <Slider
              id="bg-brightness"
              min={0}
              max={200}
              step={1}
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
                    brightness: val,
                    blur: background.blur
                  });
                }
              }}
              onPointerDown={() => setDraggedSlider('brightness')}
              onPointerUp={() => setDraggedSlider(null)}
              className={`py-2 ${draggedSlider === 'brightness' ? 'cursor-move' : ''}`}
            />
            {/* Description hidden as per request */}
            {/* <p className="text-xs text-muted-foreground">
              {t('settings.background.brightnessDescription')}
            </p> */}
          </div>

          <div className={`space-y-3 transition-opacity duration-200 ${draggedSlider && draggedSlider !== 'blur' ? 'opacity-0 invisible' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <Label htmlFor="bg-blur" className="text-base">{t('settings.background.blur')}</Label>
              <span className="text-sm font-mono text-muted-foreground">{background.blur}px</span>
            </div>
            <Slider
              id="bg-blur"
              min={0}
              max={20}
              step={1}
              value={[background.blur]}
              disabled={styleValue.startsWith('system:')}
              onValueChange={(v) => {
                const val = v[0];
                if (!styleValue.startsWith('system:')) {
                  setBackgroundTemp({
                    ...background,
                    type: 'image',
                    value: styleValue,
                    opacity: opacity / 100,
                    brightness: brightness,
                    blur: val
                  });
                }
              }}
              onPointerDown={() => setDraggedSlider('blur')}
              onPointerUp={() => setDraggedSlider(null)}
              onValueCommit={() => setDraggedSlider(null)}
              className={`py-2 ${draggedSlider === 'blur' ? 'cursor-move' : ''}`}
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.background.blurDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
