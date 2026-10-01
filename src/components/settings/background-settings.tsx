'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, X, UploadSimple, Link, FolderStar, CircleNotch, Info } from '@phosphor-icons/react/dist/ssr';
import { useBackground } from '@/contexts/background-context';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/i18n-context';
import { useCustomBackgrounds } from '@/hooks/use-custom-backgrounds';
import { Input } from '@/components/ui/input';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';

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

  // Khi kéo slider: bật preview (ẩn modal) để xem nền; thả chuột thì tắt
  useEffect(() => {
    if (!isPreview) return;
    const endPreview = () => onPreviewChange?.(false);
    window.addEventListener('pointerup', endPreview);
    return () => window.removeEventListener('pointerup', endPreview);
  }, [isPreview, onPreviewChange]);

  const startPreview = () => {
    if (!styleValue.startsWith('system:')) onPreviewChange?.(true);
  };

  // Loading state for background image preload
  const [loadingValue, setLoadingValue] = useState<string | null>(null);

  // Custom images
  const { images: customImages, addImage, addImageByUrl, canAddMore } = useCustomBackgrounds();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  const [activeTab, setActiveTab] = useState<string>(() => findPackForValue(background.value));

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
        value: 'var(--surface-page)',
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

  /** Select an image and show preview with loading indicator */
  const selectImage = (value: string) => {
    setStyleValue(value);
    if (value.startsWith('system:')) {
      setLoadingValue(null);
      setBackgroundTemp({
        ...background,
        type: 'solid',
        value: 'var(--surface-page)',
        opacity: 1,
        blur: 0,
        brightness: 100,
      });
    } else {
      setLoadingValue(value);
      const img = findImageById(value);
      // Preload full-res image to track loading
      const fullSrc = img?.sources ? getBestImageUrl(img.sources) : value;
      const preloader = new window.Image();
      preloader.onload = () => setLoadingValue((prev) => prev === value ? null : prev);
      preloader.onerror = () => setLoadingValue((prev) => prev === value ? null : prev);
      preloader.src = fullSrc;
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

  const isSystem = styleValue.startsWith('system:');
  const dim = isPreview ? 'opacity-0 pointer-events-none' : '';
  const activePack = backgroundPacks.find((p) => p.id === activeTab);

  const updateTemp = (patch: { opacity?: number; brightness?: number; blur?: number }) => {
    if (isSystem) return;
    setBackgroundTemp({
      ...background,
      type: 'image',
      value: styleValue,
      opacity: opacity / 100,
      brightness,
      blur,
      ...patch,
    });
  };

  const saveButton = (
    <Button size="sm" onClick={apply}>
      {t('settings.background.saveChanges')}
    </Button>
  );

  return (
    <div className={onClose ? 'flex h-full flex-col' : 'flex flex-col gap-6'}>
      {onClose && (
        <div className={`flex shrink-0 items-center justify-between border-b border-border px-6 py-4 transition-opacity duration-150 ${dim}`}>
          <h2 className="font-heading text-lg font-semibold leading-none tracking-tight text-ink">{t('settings.background.selectImage')}</h2>
          <div className="flex items-center gap-2">
            {saveButton}
            <Button variant="ghost" size="icon" onClick={cancel}>
              <X size={16} />
              <span className="sr-only">{t('common.close')}</span>
            </Button>
          </div>
        </div>
      )}

      <div className={onClose ? 'flex-1 min-h-0 overflow-y-auto p-6' : ''}>
        <div className="flex flex-col gap-6">
          <FilterChipGroup
            label={t('settings.background.selectImage')}
            className={`-mx-1 px-1 py-1 transition-opacity duration-150 ${dim}`}
          >
            {backgroundPacks.map((pack) => (
              <FilterChip key={pack.id} active={activeTab === pack.id} onClick={() => setActiveTab(pack.id)}>
                {t(pack.nameKey)}
              </FilterChip>
            ))}
            <FilterChip active={activeTab === 'personal'} onClick={() => setActiveTab('personal')}>
              {t('settings.background.topTabs.myImages')}
            </FilterChip>
          </FilterChipGroup>

          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
            <div className={`min-w-0 transition-opacity duration-150 ${dim}`}>
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
                activePack && (
                  <div className="space-y-3">
                    {activePack.descriptionKey && (
                      <p className="text-[0.8125rem] text-ink-muted">{t(activePack.descriptionKey)}</p>
                    )}
                    <PackGrid
                      pack={activePack}
                      styleValue={styleValue}
                      loadingValue={loadingValue}
                      onSelect={selectImage}
                      t={t}
                    />
                  </div>
                )
              )}
            </div>

            <div
              className={`relative flex flex-col gap-5 rounded-lg border p-4 transition-colors duration-150 ${
                isPreview ? 'border-border-strong bg-surface shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]' : 'border-border bg-surface'
              }`}
            >
              <div className="space-y-1">
                <h3 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">{t('settingsUi.adjust')}</h3>
                <p className="text-xs text-ink-muted">{isSystem ? t('settings.background.sliderDisabledHint') : t('settings.background.sliderHint')}</p>
              </div>

              <SliderControl
                id="bg-opacity"
                label={t('settings.background.opacity')}
                value={opacity}
                min={10}
                max={100}
                disabled={isSystem}
                description={t('settings.background.opacityDescription')}
                onDragStart={startPreview}
                onChange={(val) => {
                  setOpacity(val);
                  updateTemp({ opacity: val / 100 });
                }}
              />
              <SliderControl
                id="bg-brightness"
                label={t('settings.background.brightness')}
                value={brightness}
                min={0}
                max={200}
                disabled={isSystem}
                description={t('settings.background.brightnessDescription')}
                onDragStart={startPreview}
                onChange={(val) => {
                  setBrightness(val);
                  updateTemp({ brightness: val });
                }}
              />
              <SliderControl
                id="bg-blur"
                label={t('settings.background.blur')}
                value={blur}
                min={0}
                max={20}
                disabled={isSystem}
                description={t('settings.background.blurDescription')}
                onDragStart={startPreview}
                onChange={(val) => {
                  setBlur(val);
                  updateTemp({ blur: val });
                }}
                suffix="px"
              />

              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                {t('settings.background.reset')}
              </Button>
            </div>
          </div>

          {!onClose && <div className="flex justify-end border-t border-border pt-4">{saveButton}</div>}
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
  loadingValue,
  onSelect,
  t,
}: {
  pack: BackgroundPack;
  styleValue: string;
  loadingValue: string | null;
  onSelect: (v: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {pack.items.map((item) => {
        const value = itemToStyleValue(item);
        const selected = styleValue === value || styleValue === item.id;
        const isLoading = loadingValue === value || loadingValue === item.id;

        return (
          <PackThumbnail
            key={item.id}
            item={item}
            value={value}
            selected={selected}
            isLoading={isLoading}
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
  isLoading,
  onSelect,
  t,
}: {
  item: BackgroundImage;
  value: string;
  selected: boolean;
  isLoading?: boolean;
  onSelect: (v: string) => void;
  t: (key: string) => string;
}) {
  const label = t(item.nameKey).replace(/[\u2600-\u27BF\uFE0F]|[\uD83C-\uD83E][\uDC00-\uDFFF]/g, '').trim();

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`relative aspect-video w-full overflow-hidden rounded-lg border transition-shadow duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand ${
        selected ? 'border-transparent ring-2 ring-brand' : 'border-border hover:border-border-strong'
      }`}
      onClick={() => onSelect(value)}
      title={label}
    >
      <ThumbnailContent item={item} label={label} />
      {selected && !isLoading && (
        <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5 text-white">
          <Check size={12} weight="bold" />
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <CircleNotch size={20} className="text-white animate-spin" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5 text-center text-xs font-medium text-white">
        {label}
      </div>
    </button>
  );
}

function ThumbnailContent({ item, label }: { item: BackgroundImage; label: string }) {
  switch (item.kind) {
    case 'system':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-raised">
          <div
            className="w-10 h-10 rounded-full border-2 shadow-xs"
            style={{
              backgroundColor: 'var(--surface-page)',
              borderColor: 'var(--border)',
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
      <div className="flex flex-col gap-3 p-4 rounded-lg border border-dashed border-border-strong bg-surface-raised">
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
            <Link size={16} />
          </Button>
        </div>

        {/* Divider with OR text */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-ink-muted">{t('settings.background.customImages.or')}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Upload File Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onUploadClick}
        >
          <UploadSimple size={16} className="mr-2" />
          {t('settings.background.customImages.uploadFile')}
        </Button>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="bg-surface-raised rounded-lg p-3 flex gap-3 items-start">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-ink-secondary">{t('settings.background.customImages.limit2MB')}</p>
        </div>
      </div>

      {/* Custom Image Preview */}
      {customImages.length > 0 ? (
        <div className="mt-4">
          <button
            type="button"
            className={`relative w-full aspect-video rounded-lg overflow-hidden border border-border transition-shadow duration-150 ${
              styleValue === customImages[0].dataUrl
                ? 'ring-2 ring-brand'
                : 'hover:border-border-strong'
            }`}
            onClick={() => setStyleValue(customImages[0].dataUrl)}
          >
            <img
              src={customImages[0].dataUrl}
              alt={customImages[0].name}
              className="h-full w-full object-cover"
            />
            {styleValue === customImages[0].dataUrl && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                <Check size={12} />
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {t('settings.background.customImages.current')}
            </div>
          </button>
          <p className="text-xs text-center mt-2 text-ink-muted">
            {t('settings.background.customImages.replaceNotice')}
          </p>
        </div>
      ) : (
        <div className="text-center py-12 text-ink-muted">
          <FolderStar size={48} className="mx-auto mb-3 opacity-50" />
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
        <span className="text-xs font-mono tabular-nums text-ink-muted">{value}{suffix}</span>
      </div>
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
        <p className="text-[11px] text-ink-muted">{description}</p>
      )}
    </div>
  );
}
