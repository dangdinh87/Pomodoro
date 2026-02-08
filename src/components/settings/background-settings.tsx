'use client';

import { useEffect, useState, useRef, useMemo, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, X, Upload, Link, FolderHeart } from 'lucide-react';
import { useBackground } from '@/contexts/background-context';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/i18n-context';
import { useCustomBackgrounds } from '@/hooks/use-custom-backgrounds';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import {
  backgroundPacks,
  findImageById,
  type BackgroundImage,
  type BackgroundPack,
} from '@/data/background-packs';
import { getBestImageUrl } from '@/lib/format-detection';
import Image from 'next/image';

interface BackgroundSettingsProps {
  onClose?: () => void;
  /** Whether the slider panel is in preview mode (dialog transparent) */
  isPreview?: boolean;
  onPreviewChange?: (preview: boolean) => void;
}

/** Resolve an image item to its display ID (for styleValue tracking) */
function itemToStyleValue(item: BackgroundImage): string {
  // system/auto/video use sentinel or path values
  if (item.value) return item.value;
  // images use their pack ID
  return item.id;
}

/** Find which pack contains the currently-selected background */
function findPackForValue(value: string): string {
  // System solid color stores CSS var after preview/save
  if (/var\(--background\)/.test(value)) return 'system';

  for (const pack of backgroundPacks) {
    for (const item of pack.items) {
      if (itemToStyleValue(item) === value) return pack.id;
      // Also match by ID directly
      if (item.id === value) return pack.id;
    }
  }
  return 'personal';
}

export function BackgroundSettings({ onClose, isPreview, onPreviewChange }: BackgroundSettingsProps) {
  const { t } = useI18n();
  const { background, setBackground, setBackgroundTemp } = useBackground();

  // Snapshot the persisted background on mount so we can revert on cancel
  const savedBackground = useRef(background);
  useEffect(() => { savedBackground.current = background; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [styleValue, setStyleValue] = useState<string>('system:auto-color');
  const [opacity, setOpacity] = useState<number>(
    Math.round((background.opacity ?? 1) * 100),
  );
  const [brightness, setBrightness] = useState<number>(
    background.brightness ?? 100,
  );
  const [blur, setBlur] = useState<number>(background.blur ?? 0);

  // End preview mode on global pointer release
  useEffect(() => {
    if (!isPreview) return;
    const endPreview = () => onPreviewChange?.(false);
    window.addEventListener('pointerup', endPreview);
    return () => window.removeEventListener('pointerup', endPreview);
  }, [isPreview, onPreviewChange]);

  const startPreview = () => {
    if (!styleValue.startsWith('system:')) onPreviewChange?.(true);
  };

  // Custom images
  const { images: customImages, addImage, addImageByUrl, canAddMore } = useCustomBackgrounds();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  // Active tab: set once on mount from persisted background, then only change via user clicks
  const [activeTab, setActiveTab] = useState<string>(() => findPackForValue(background.value));

  // Top-level tab: static (images only) | video (lofi only) | personal (no categories)
  const topTab = activeTab === 'lofi-video' ? 'video' : activeTab === 'personal' ? 'personal' : 'static';
  const setTopTab = (tab: 'static' | 'video' | 'personal') => {
    if (tab === 'static') setActiveTab('system');
    else if (tab === 'video') setActiveTab('lofi-video');
    else setActiveTab('personal');
  };

  // Left sidebar: only static packs (no video) when topTab=static; only lofi when topTab=video; none when personal
  const staticPacks = useMemo(
    () => backgroundPacks.filter((p) => p.id !== 'lofi-video'),
    [],
  );
  const videoPack = useMemo(
    () => backgroundPacks.find((p) => p.id === 'lofi-video'),
    [],
  );
  const leftNavPacks = topTab === 'static' ? staticPacks : topTab === 'video' && videoPack ? [videoPack] : [];
  const showLeftNav = topTab !== 'personal' && leftNavPacks.length > 0;

  useEffect(() => {
    // Normalize to sentinel values for UI so Save/apply paths work from first load
    if (
      background.type === 'solid' &&
      /var\(--background\)/.test(background.value)
    ) {
      setStyleValue('system:auto-color');
      setOpacity(100);
      setBrightness(100);
      setBlur(0);
    } else {
      setStyleValue(background.value || 'system:auto-color');
      setOpacity(Math.round((background.opacity ?? 1) * 100));
      setBrightness(background.brightness ?? 100);
      setBlur(background.blur ?? 0);
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
    // Check if this is a pack image by ID
    const image = findImageById(styleValue);
    if (image && image.kind === 'image') {
      return {
        ...background,
        type: 'image' as const,
        value: image.id,
        opacity: opacity / 100,
        blur,
        brightness,
      };
    }
    // Image/video by ID or path, or custom image data URL
    return {
      ...background,
      type: 'image' as const,
      value: styleValue,
      opacity: opacity / 100,
      blur,
      brightness,
    };
  };

  /** Show a live preview without persisting */
  const preview = () => {
    if (styleValue.startsWith('system:')) return;
    setBackgroundTemp(buildBackground());
  };

  const apply = () => {
    const next = buildBackground();
    setBackground(next);
    toast.success(t('settings.background.toasts.saved'));
    onClose?.();
  };

  /** Revert to saved background and close */
  const cancel = () => {
    setBackgroundTemp(savedBackground.current);
    onClose?.();
  };

  /** Select an image and show preview */
  const selectImage = (value: string) => {
    setStyleValue(value);
    if (value.startsWith('system:')) {
      setBackgroundTemp({
        ...background,
        type: 'solid',
        value: 'hsl(var(--background))',
        opacity: 1,
        blur: 0,
        brightness: 100,
      });
    } else {
      const img = findImageById(value);
      setBackgroundTemp({
        ...background,
        type: 'image',
        value: img ? img.id : value,
        opacity: opacity / 100,
        blur,
        brightness,
      });
    }
  };

  const reset = () => {
    setOpacity(80);
    setBrightness(100);
    setBlur(0);
    if (!styleValue.startsWith('system:')) {
      setBackgroundTemp({
        ...background,
        type: 'image',
        value: styleValue,
        opacity: 0.8,
        brightness: 100,
        blur: 0,
      });
    }
    toast.success(t('settings.background.toasts.resetInfo'));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header — hidden during slider preview */}
      <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 transition-opacity duration-150 ${isPreview ? 'opacity-0' : ''}`}>
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">{t('settings.background.selectImage')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={apply}>
            {t('settings.background.saveChanges')}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="ml-2" onClick={cancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Top: 3 main tabs — hidden during slider preview */}
      <div className={`shrink-0 border-b px-6 transition-opacity duration-150 ${isPreview ? 'opacity-0' : ''}`}>
        <div className="flex gap-0" role="tablist" aria-label={t('settings.background.selectImage')}>
          {(['static', 'video', 'personal'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={topTab === tab}
              onClick={() => setTopTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                topTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              }`}
            >
              {tab === 'personal' ? t('settings.background.topTabs.myImages') : t(`settings.background.topTabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: [Left categories when static/video] | Center content | Right sliders */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Vertical category list — only for Ảnh tĩnh (static packs) or Ảnh động (lofi only); Ảnh của tôi has no categories */}
        {showLeftNav && (
          <nav
            className={`shrink-0 w-36 border-r flex flex-col py-3 gap-0.5 transition-opacity duration-150 ${isPreview ? 'opacity-0' : ''}`}
            aria-label={t('settings.background.selectImage')}
          >
            {leftNavPacks.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => setActiveTab(pack.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-left text-sm rounded-r-md transition-colors ${
                  activeTab === pack.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="text-base">{pack.icon}</span>
                <span className="truncate">{t(pack.nameKey)}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Center: hidden during slider preview */}
        <div className={`flex-1 overflow-y-auto p-6 min-w-0 transition-opacity duration-150 ${isPreview ? 'opacity-0' : ''}`}>
          {activeTab === 'personal' ? (
            <>
              <PersonalTab
                customImages={customImages}
                canAddMore={canAddMore}
                addImageByUrl={addImageByUrl}
                onUploadClick={() => fileInputRef.current?.click()}
                urlInput={urlInput}
                setUrlInput={setUrlInput}
                styleValue={styleValue}
                setStyleValue={selectImage}
                t={t}
              />
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
                    if (result.image) selectImage(result.image.dataUrl);
                    toast.success(t('settings.background.customImages.uploadSuccess'));
                  } else {
                    const errorKey = `settings.background.customImages.${result.error}` as any;
                    toast.error(t(errorKey));
                  }
                  e.target.value = '';
                }}
              />
            </>
          ) : (
            <>
              {(() => {
                const pack = backgroundPacks.find((p) => p.id === activeTab);
                if (!pack) return null;
                return (
                  <div className="space-y-3">
                    {pack.descriptionKey && (
                      <p className="text-xs text-muted-foreground">
                        {t(pack.descriptionKey)}
                      </p>
                    )}
                    <PackGrid
                      pack={pack}
                      styleValue={styleValue}
                      onSelect={selectImage}
                      t={t}
                    />
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Right: Sliders — stays visible during preview with solid bg */}
        <div className={`shrink-0 w-56 p-4 flex flex-col gap-4 overflow-y-auto relative transition-all duration-150 ${
          isPreview
            ? 'bg-background/95 backdrop-blur-sm rounded-lg shadow-2xl border'
            : 'border-l bg-muted/10'
        }`}>
          {styleValue.startsWith('system:') && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[1px] flex items-center justify-center p-6">
              <p className="text-xs text-muted-foreground text-center">
                {t('settings.background.sliderDisabledHint')}
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {t('settings.background.sliderHint')}
          </p>

          <SliderControl
            id="bg-opacity"
            label={t('settings.background.opacity')}
            value={opacity}
            min={10}
            max={100}
            disabled={styleValue.startsWith('system:')}
            description={t('settings.background.opacityDescription')}
            onDragStart={startPreview}
            onChange={(val) => {
              setOpacity(val);
              if (!styleValue.startsWith('system:')) {
                setBackgroundTemp({
                  ...background,
                  type: 'image',
                  value: styleValue,
                  opacity: val / 100,
                  brightness,
                  blur,
                });
              }
            }}
          />

          <SliderControl
            id="bg-brightness"
            label={t('settings.background.brightness')}
            value={brightness}
            min={0}
            max={200}
            disabled={styleValue.startsWith('system:')}
            description={t('settings.background.brightnessDescription')}
            onDragStart={startPreview}
            onChange={(val) => {
              setBrightness(val);
              if (!styleValue.startsWith('system:')) {
                setBackgroundTemp({
                  ...background,
                  type: 'image',
                  value: styleValue,
                  opacity: opacity / 100,
                  brightness: val,
                  blur,
                });
              }
            }}
          />

          <SliderControl
            id="bg-blur"
            label={t('settings.background.blur')}
            value={blur}
            min={0}
            max={20}
            disabled={styleValue.startsWith('system:')}
            description={t('settings.background.blurDescription')}
            onDragStart={startPreview}
            onChange={(val) => {
              setBlur(val);
              if (!styleValue.startsWith('system:')) {
                setBackgroundTemp({
                  ...background,
                  type: 'image',
                  value: styleValue,
                  opacity: opacity / 100,
                  brightness,
                  blur: val,
                });
              }
            }}
            suffix="px"
          />

          <Button variant="outline" size="sm" className="w-full mt-auto" onClick={reset}>
            {t('settings.background.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------

function PackGrid({
  pack,
  styleValue,
  onSelect,
  t,
}: {
  pack: BackgroundPack;
  styleValue: string;
  onSelect: (v: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {pack.items.map((item) => {
        const value = itemToStyleValue(item);
        const selected = styleValue === value || styleValue === item.id;

        return (
          <PackThumbnail
            key={item.id}
            item={item}
            value={value}
            selected={selected}
            onSelect={onSelect}
            t={t}
          />
        );
      })}
    </div>
  );
}

function PackThumbnail({
  item,
  value,
  selected,
  onSelect,
  t,
}: {
  item: BackgroundImage;
  value: string;
  selected: boolean;
  onSelect: (v: string) => void;
  t: (key: string) => string;
}) {
  const label = t(item.nameKey);

  return (
    <button
      type="button"
      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
      onClick={() => onSelect(value)}
      title={label}
    >
      <ThumbnailContent item={item} label={label} />
      {selected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
          <Check className="h-3 w-3" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[1px] text-white text-xs py-1.5 text-center font-medium">
        {label}
      </div>
    </button>
  );
}

function ThumbnailContent({ item, label }: { item: BackgroundImage; label: string }) {
  switch (item.kind) {
    case 'system':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div
            className="w-10 h-10 rounded-full border-2 shadow-sm"
            style={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
            }}
          />
        </div>
      );
    case 'video':
      return (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={item.value}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      );
    case 'image': {
      // Use WebP thumbnail for picker (always available, small)
      const thumbSrc = item.thumb || (item.sources ? getBestImageUrl(item.sources) : '');
      return (
        <Image
          src={thumbSrc}
          alt={label}
          fill
          sizes="200px"
          className="object-cover"
          loading="lazy"
        />
      );
    }
  }
}

function PersonalTab({
  customImages,
  canAddMore,
  addImageByUrl,
  onUploadClick,
  urlInput,
  setUrlInput,
  styleValue,
  setStyleValue,
  t,
}: {
  customImages: { dataUrl: string; name: string }[];
  canAddMore: boolean;
  addImageByUrl: (url: string) => Promise<any>;
  onUploadClick: () => void;
  urlInput: string;
  setUrlInput: (v: string) => void;
  styleValue: string;
  setStyleValue: (v: string) => void;
  t: (key: string) => string;
}) {
  return (
    <>
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
          onClick={onUploadClick}
        >
          <Upload className="h-4 w-4 mr-2" />
          {t('settings.background.customImages.uploadFile')}
        </Button>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="bg-muted/50 border border-muted rounded-lg p-3 flex gap-3 items-start">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold">{t('settings.background.customImages.limit2MB')}</p>
        </div>
      </div>

      {/* Custom Image Preview */}
      {customImages.length > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            className={`relative w-full aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.02] ${
              styleValue === customImages[0].dataUrl
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border'
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
    </>
  );
}

function SliderControl({
  id,
  label,
  value,
  min,
  max,
  disabled,
  description,
  onChange,
  onDragStart,
  suffix = '%',
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  description?: string;
  onChange: (val: number) => void;
  onDragStart?: () => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        <span className="text-xs font-mono text-muted-foreground">{value}{suffix}</span>
      </div>
      {/* onPointerDown triggers preview mode; global pointerup ends it */}
      <div onPointerDown={disabled ? undefined : onDragStart}>
        <Slider
          id={id}
          min={min}
          max={max}
          step={1}
          value={[value]}
          disabled={disabled}
          onValueChange={(v) => onChange(v[0])}
          className="py-1"
        />
      </div>
      {description && (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
