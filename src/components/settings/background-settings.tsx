'use client';

import { useEffect, useImperativeHandle, useRef, useState, type ChangeEvent, type Ref } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { X, UploadSimple, Link, FolderStar, Info } from '@phosphor-icons/react/dist/ssr';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
import { useBackground, type BackgroundSettings as BackgroundConfig } from '@/contexts/background-context';
import { DEFAULT_BACKGROUND } from '@/data/background-migration';
import { backgroundPacks, findImageById, type BackgroundImage, type BackgroundPack } from '@/data/background-packs';
import { useI18n } from '@/contexts/i18n-context';
import { useCustomBackgrounds, type CustomImage, type CustomImageError } from '@/hooks/use-custom-backgrounds';
import { parseCustomImageValue } from '@/lib/custom-background/image-store';
import { getBestImageUrl } from '@/lib/format-detection';
import { DefaultSceneCard, GalleryCard, SceneCard } from '@/features/scenes/components/scene-card';
import {
  findSceneById,
  SCENE_CATEGORIES,
  scenesInCategory,
  type SceneCategory,
  type SceneMeta,
} from '@/features/scenes/lib/scene-registry';

export interface BackgroundSettingsHandle {
  /** Undo any unsaved preview and close, exactly like the Close button. */
  cancel: () => void;
}

interface BackgroundSettingsProps {
  onClose?: () => void;
  isPreview?: boolean;
  onPreviewChange?: (preview: boolean) => void;
  ref?: Ref<BackgroundSettingsHandle>;
}

type Group = 'scenes' | 'photos' | 'mine';
type Translate = (key: string) => string;

const PHOTO_DEFAULTS = { opacity: 0.8, blur: 0, brightness: 100 };

function isPhotoValue(value: string, item: BackgroundImage): boolean {
  return value === item.id || (!!item.value && value === item.value);
}

/** Which tab (and photo pack) holds the saved background, so the picker opens where the user left off. */
function locate(bg: BackgroundConfig): { group: Group; packId: string } {
  const firstPack = backgroundPacks[0].id;
  if (bg.type === 'image') {
    for (const pack of backgroundPacks) {
      if (pack.items.some((item) => isPhotoValue(bg.value, item))) return { group: 'photos', packId: pack.id };
    }
    return { group: 'mine', packId: firstPack };
  }
  return { group: 'scenes', packId: firstPack };
}

export function BackgroundSettings({ onClose, isPreview, onPreviewChange, ref }: BackgroundSettingsProps) {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const { background, setBackground, setBackgroundTemp } = useBackground();

  // Snapshot the persisted background on mount so we can revert on cancel.
  const savedBackground = useRef(background);
  // Set once the session ended on purpose (saved or cancelled)
  const settled = useRef(false);
  const setTempRef = useRef(setBackgroundTemp);
  useEffect(() => {
    setTempRef.current = setBackgroundTemp;
  });
  // Whatever closes the picker without Save (Esc, overlay, browser Back, leaving the
  // panel) must not leave the preview on screen while localStorage still holds the saved look.
  useEffect(
    () => () => {
      if (!settled.current) setTempRef.current(savedBackground.current);
    },
    [],
  );
  const [draft, setDraft] = useState<BackgroundConfig>(background);
  const [initial] = useState(() => locate(background));
  const [group, setGroup] = useState<Group>(initial.group);
  const [packId, setPackId] = useState(initial.packId);
  const [category, setCategory] = useState<SceneCategory | 'all'>('all');
  const [loadingValue, setLoadingValue] = useState<string | null>(null);

  const { images: customImages, addImage, addImageByUrl, canAddMore } = useCustomBackgrounds();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  // While a slider is dragged the dialog hides so the real background is visible; release ends it.
  useEffect(() => {
    if (!isPreview) return;
    const endPreview = () => onPreviewChange?.(false);
    window.addEventListener('pointerup', endPreview);
    return () => window.removeEventListener('pointerup', endPreview);
  }, [isPreview, onPreviewChange]);

  const isDefault = draft.type !== 'scene' && draft.type !== 'image';
  const isScene = draft.type === 'scene';
  const activeScene = isScene ? findSceneById(draft.value) : undefined;
  const dim = isPreview ? 'pointer-events-none opacity-0' : '';

  const commit = (next: BackgroundConfig) => {
    setDraft(next);
    setBackgroundTemp(next);
  };

  const selectDefault = () => {
    setLoadingValue(null);
    commit({ ...DEFAULT_BACKGROUND });
  };

  const selectScene = (scene: SceneMeta) => {
    setLoadingValue(null);
    commit({
      type: 'scene',
      value: scene.id,
      opacity: 1,
      blur: 0,
      brightness: scene.defaultBrightness,
      motion: draft.motion,
      followMode: draft.followMode,
    });
  };

  const selectImage = (id: string) => {
    const base = draft.type === 'image' ? draft : PHOTO_DEFAULTS;
    commit({ type: 'image', value: id, opacity: base.opacity, blur: base.blur, brightness: base.brightness });
    setLoadingValue(id);
    const photo = findImageById(id);
    const preloader = new window.Image();
    const done = () => setLoadingValue((prev) => (prev === id ? null : prev));
    preloader.onload = done;
    preloader.onerror = done;
    // Videos have no still to preload (the renderer fades them in on canplay), and a stored
    // upload is read from IndexedDB by the renderer, not fetched.
    if (photo?.kind === 'video' || parseCustomImageValue(id) !== null) done();
    else preloader.src = photo?.sources ? getBestImageUrl(photo.sources) : id;
  };

  const patch = (change: Partial<BackgroundConfig>) => commit({ ...draft, ...change });

  const reset = () => {
    if (isScene && activeScene) {
      patch({ brightness: activeScene.defaultBrightness, motion: true, followMode: true });
    } else if (draft.type === 'image') {
      patch(PHOTO_DEFAULTS);
    }
    toast.success(t('settings.background.toasts.resetInfo'));
  };

  const apply = () => {
    settled.current = true;
    setBackground(draft);
    toast.success(t('settings.background.toasts.saved'));
    onClose?.();
  };

  const cancel = () => {
    settled.current = true;
    setBackgroundTemp(savedBackground.current);
    onClose?.();
  };
  useImperativeHandle(ref, () => ({ cancel }));

  const startPreview = () => {
    if (!isDefault) onPreviewChange?.(true);
  };

  const label = (key: string) => t(key).replace(/[☀-➿️]|[\uD83C-\uD83E][\uDC00-\uDFFF]/g, '').trim();
  const activePack = backgroundPacks.find((p) => p.id === packId);
  const followsLabel = t('scenes.followsTimer');

  const saveButton = (
    <Button size="sm" onClick={apply}>
      {t('settings.background.saveChanges')}
    </Button>
  );

  return (
    <div className={onClose ? 'flex h-full flex-col' : 'flex flex-col gap-6'}>
      {onClose && (
        <div className={`flex shrink-0 items-center justify-between border-b border-border px-6 py-4 transition-opacity duration-150 ${dim}`}>
          <h2 className="font-heading text-lg font-semibold leading-none tracking-tight text-ink">{t('scenes.title')}</h2>
          <div className="flex items-center gap-2">
            {saveButton}
            <Button variant="ghost" size="icon" onClick={cancel}>
              <X size={16} />
              <span className="sr-only">{t('common.close')}</span>
            </Button>
          </div>
        </div>
      )}

      <div className={onClose ? 'min-h-0 flex-1 overflow-y-auto p-4 sm:p-6' : ''}>
        <Tabs value={group} onValueChange={(v) => setGroup(v as Group)} className="flex flex-col gap-5">
          <TabsList className={`transition-opacity duration-150 ${dim}`}>
            <TabsTrigger value="scenes">{t('scenes.tabs.scenes')}</TabsTrigger>
            <TabsTrigger value="photos">{t('scenes.tabs.photos')}</TabsTrigger>
            <TabsTrigger value="mine">{t('settings.background.topTabs.myImages')}</TabsTrigger>
          </TabsList>

          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_15rem]">
            <div className={`min-w-0 transition-opacity duration-150 ${dim}`}>
              <TabsContent value="scenes" className="mt-0 space-y-4">
                <FilterChipGroup label={t('scenes.categories.label')} className="-mx-1 px-1 py-1">
                  {(['all', ...SCENE_CATEGORIES] as const).map((c) => (
                    <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                      {t(`scenes.categories.${c}`)}
                    </FilterChip>
                  ))}
                </FilterChipGroup>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(category === 'all' || category === 'minimal') && (
                    <DefaultSceneCard
                      label={t('scenes.names.pomodoro')}
                      followsLabel={followsLabel}
                      selected={isDefault}
                      onSelect={selectDefault}
                    />
                  )}
                  {scenesInCategory(category).map((scene) => (
                    <SceneCard
                      key={scene.id}
                      scene={scene}
                      label={t(scene.nameKey)}
                      followsLabel={followsLabel}
                      selected={isScene && draft.value === scene.id}
                      onSelect={selectScene}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="mt-0 space-y-4">
                <FilterChipGroup label={t('scenes.tabs.photos')} className="-mx-1 px-1 py-1">
                  {backgroundPacks.map((pack) => (
                    <FilterChip key={pack.id} active={packId === pack.id} onClick={() => setPackId(pack.id)}>
                      {t(pack.nameKey)}
                    </FilterChip>
                  ))}
                </FilterChipGroup>
                {activePack && (
                  <PackGrid
                    pack={activePack}
                    value={draft.type === 'image' ? draft.value : ''}
                    loadingValue={loadingValue}
                    onSelect={selectImage}
                    label={label}
                    t={t}
                  />
                )}
              </TabsContent>

              <TabsContent value="mine" className="mt-0">
                <PersonalTab
                  customImages={customImages}
                  canAddMore={canAddMore}
                  addImageByUrl={addImageByUrl}
                  onUploadClick={() => fileInputRef.current?.click()}
                  urlInput={urlInput}
                  setUrlInput={setUrlInput}
                  value={draft.type === 'image' ? draft.value : ''}
                  onSelect={selectImage}
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
                      selectImage(result.image.value);
                      toast.success(t('settings.background.customImages.uploadSuccess'));
                    } else {
                      toast.error(t(`settings.background.customImages.${result.error}`));
                    }
                    e.target.value = '';
                  }}
                />
              </TabsContent>
            </div>

            <div
              className={`relative flex flex-col gap-5 rounded-lg border p-4 transition-colors duration-150 ${
                isPreview ? 'border-border-strong bg-surface shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]' : 'border-border bg-surface'
              }`}
            >
              <div className="space-y-1">
                <h3 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">{t('settingsUi.adjust')}</h3>
                <p className="text-xs text-ink-muted">
                  {isDefault ? t('scenes.defaultHint') : t('settings.background.sliderHint')}
                </p>
              </div>

              <SliderControl
                id="bg-brightness"
                label={t('settings.background.brightness')}
                value={draft.brightness ?? 100}
                min={isScene ? 20 : 0}
                max={isScene ? 130 : 200}
                disabled={isDefault}
                description={isScene ? t('scenes.brightnessHint') : t('settings.background.brightnessDescription')}
                onDragStart={startPreview}
                onChange={(brightness) => patch({ brightness })}
              />

              {draft.type === 'image' && (
                <>
                  <SliderControl
                    id="bg-opacity"
                    label={t('settings.background.opacity')}
                    value={Math.round((draft.opacity ?? 1) * 100)}
                    min={10}
                    max={100}
                    description={t('settings.background.opacityDescription')}
                    onDragStart={startPreview}
                    onChange={(v) => patch({ opacity: v / 100 })}
                  />
                  <SliderControl
                    id="bg-blur"
                    label={t('settings.background.blur')}
                    value={draft.blur ?? 0}
                    min={0}
                    max={20}
                    description={t('settings.background.blurDescription')}
                    onDragStart={startPreview}
                    onChange={(blur) => patch({ blur })}
                    suffix="px"
                  />
                </>
              )}

              {isScene && (
                <>
                  <SwitchRow
                    id="scene-motion"
                    label={t('scenes.animate')}
                    description={reducedMotion ? t('scenes.reducedMotionNote') : t('scenes.animateHint')}
                    checked={draft.motion !== false && !reducedMotion}
                    disabled={!!reducedMotion}
                    onChange={(motion) => patch({ motion })}
                  />
                  <SwitchRow
                    id="scene-follow"
                    label={t('scenes.followMode')}
                    description={activeScene?.followsMode ? t('scenes.followModeHint') : t('scenes.followModeUnsupported')}
                    checked={draft.followMode !== false && !!activeScene?.followsMode}
                    disabled={!activeScene?.followsMode}
                    onChange={(followMode) => patch({ followMode })}
                  />
                </>
              )}

              <Button variant="outline" size="sm" className="w-full" onClick={reset} disabled={isDefault}>
                {t('settings.background.reset')}
              </Button>
            </div>
          </div>
        </Tabs>

        {!onClose && <div className="mt-6 flex justify-end border-t border-border pt-4">{saveButton}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------

function PackGrid({
  pack,
  value,
  loadingValue,
  onSelect,
  label,
  t,
}: {
  pack: BackgroundPack;
  value: string;
  loadingValue: string | null;
  onSelect: (id: string) => void;
  label: (key: string) => string;
  t: Translate;
}) {
  return (
    <div className="space-y-3">
      {pack.descriptionKey && <p className="text-[0.8125rem] text-ink-muted">{t(pack.descriptionKey)}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {pack.items.map((item) => {
          const name = label(item.nameKey);
          return (
            <GalleryCard
              key={item.id}
              label={name}
              selected={isPhotoValue(value, item)}
              loading={loadingValue === item.id}
              onSelect={() => onSelect(item.id)}
            >
              <PhotoThumbnail item={item} label={name} />
            </GalleryCard>
          );
        })}
      </div>
    </div>
  );
}

function PhotoThumbnail({ item, label }: { item: BackgroundImage; label: string }) {
  if (item.kind === 'video') {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={item.value}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  const thumbSrc = item.thumb || (item.sources ? getBestImageUrl(item.sources) : '');
  return <Image src={thumbSrc} alt={label} fill sizes="200px" className="object-cover" loading="lazy" />;
}

function PersonalTab({
  customImages,
  canAddMore,
  addImageByUrl,
  onUploadClick,
  urlInput,
  setUrlInput,
  value,
  onSelect,
  t,
}: {
  customImages: CustomImage[];
  canAddMore: boolean;
  addImageByUrl: (url: string) => Promise<{ success: true; image: CustomImage } | { success: false; error: CustomImageError }>;
  onUploadClick: () => void;
  urlInput: string;
  setUrlInput: (v: string) => void;
  value: string;
  onSelect: (v: string) => void;
  t: Translate;
}) {
  const addFromUrl = async () => {
    const result = await addImageByUrl(urlInput.trim());
    if (result.success) {
      onSelect(result.image.value);
      toast.success(t('settings.background.customImages.uploadSuccess'));
      setUrlInput('');
    } else {
      toast.error(t(`settings.background.customImages.${result.error}`));
    }
  };
  const current = customImages[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border-strong bg-surface-raised p-4">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder={t('settings.background.customImages.urlPlaceholder')}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && urlInput.trim() && canAddMore) void addFromUrl();
            }}
            className="flex-1"
            disabled={!canAddMore}
          />
          <Button
            variant="outline"
            size="icon"
            disabled={!urlInput.trim()}
            onClick={() => void addFromUrl()}
            title={t('settings.background.customImages.addUrl')}
          >
            <Link size={16} />
            <span className="sr-only">{t('settings.background.customImages.addUrl')}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-ink-muted">{t('settings.background.customImages.or')}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={onUploadClick}>
          <UploadSimple size={16} className="mr-2" />
          {t('settings.background.customImages.uploadFile')}
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-surface-raised p-3">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p className="text-xs font-medium text-ink-secondary">{t('settings.background.customImages.limit2MB')}</p>
      </div>

      {current ? (
        <div>
          <GalleryCard
            label={t('settings.background.customImages.current')}
            selected={value === current.value}
            onSelect={() => onSelect(current.value)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied blob or link */}
            <img src={current.previewUrl} alt={current.name} className="absolute inset-0 h-full w-full object-cover" />
          </GalleryCard>
          <p className="mt-2 text-center text-xs text-ink-muted">{t('settings.background.customImages.replaceNotice')}</p>
        </div>
      ) : (
        <div className="py-12 text-center text-ink-muted">
          <FolderStar size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('settings.background.customImages.empty')}</p>
        </div>
      )}
    </div>
  );
}

function SwitchRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <p className="text-[11px] text-ink-muted">{description}</p>
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
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
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <span className="font-mono text-xs tabular-nums text-ink-muted">
          {value}
          {suffix}
        </span>
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
      {description && <p className="text-[11px] text-ink-muted">{description}</p>}
    </div>
  );
}
