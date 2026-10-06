'use client';

import { useState, type KeyboardEventHandler, type ReactNode, type Ref } from 'react';
import { Check, CircleNotch, Timer } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { getSceneThumbnail } from '../lib/scene-thumbnails';
import type { SceneMeta } from '../lib/scene-registry';

interface GalleryCardProps {
  label: string;
  selected: boolean;
  loading?: boolean;
  /** Small pill top-left, e.g. "Follows timer". */
  badge?: string;
  onSelect: () => void;
  /** Extra classes for the preview box; it is 16:9 unless overridden (e.g. `aspect-auto h-28`). */
  previewClassName?: string;
  /** Anything laid over the preview besides the "follows timer" badge, e.g. a "3D" pill. */
  overlay?: ReactNode;
  /** Radio-group mode (clock picker): the card is `role="radio"` with roving focus instead of a pressed toggle. */
  radio?: { tabIndex: number; onKeyDown: KeyboardEventHandler<HTMLButtonElement>; buttonRef: Ref<HTMLButtonElement> };
  children: ReactNode;
}

/**
 * Shared sticker tile for scenes, photos, videos and clock styles: preview on top, name below.
 * The chosen card gets a thick accent frame and an "In use" label (text, not colour alone).
 */
export function GalleryCard({ label, selected, loading, badge, onSelect, previewClassName, overlay, radio, children }: GalleryCardProps) {
  const { t } = useI18n();
  return (
    <div className="relative">
      {selected && (
        <span
          aria-hidden="true"
          data-slot="selected-frame"
          className="pointer-events-none absolute -inset-2 rounded-[28px] border-4 border-primary"
        />
      )}
      <button
        ref={radio?.buttonRef}
        type="button"
        {...(radio
          ? { role: 'radio', 'aria-checked': selected, tabIndex: radio.tabIndex, onKeyDown: radio.onKeyDown }
          : { 'aria-pressed': selected })}
        title={label}
        aria-label={label}
        onClick={onSelect}
        className="sticker sticker-press focus-ring group relative flex w-full flex-col overflow-hidden text-left focus-visible:outline-offset-1"
      >
        <span className={cn('relative block aspect-video w-full overflow-hidden border-b-2 border-outline bg-surface-raised', previewClassName)}>
          {children}
          {overlay}
          {badge && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border-2 border-outline bg-candy-butter px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-on-accent">
              <Timer size={11} weight="bold" aria-hidden />
              {badge}
            </span>
          )}
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center bg-surface/70">
              <CircleNotch size={22} weight="bold" className="animate-spin text-ink" aria-hidden />
            </span>
          )}
        </span>
        <span className="flex min-h-11 flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2">
          <span className="min-w-0 max-w-full truncate font-heading text-[0.9375rem] font-bold leading-tight text-ink">{label}</span>
          {selected && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-outline bg-primary px-2 py-0.5 text-xs font-bold leading-none text-on-accent">
              <Check size={11} weight="bold" aria-hidden />
              {t('scenes.inUse')}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

interface SceneCardProps {
  scene: SceneMeta;
  label: string;
  followsLabel: string;
  selected: boolean;
  onSelect: (scene: SceneMeta) => void;
}

/**
 * Static preview from public/scenes (pre-rendered from each scene's own shader).
 * Rendering previews at runtime compiled a shader per card on the main thread and
 * stuttered the picker; the live render is kept only as a fallback.
 */
export function SceneCard({ scene, label, followsLabel, selected, onSelect }: SceneCardProps) {
  const [thumb, setThumb] = useState<string | null>(`/scenes/${scene.id}.webp`);

  const renderFallback = () => {
    setThumb(null);
    void getSceneThumbnail(scene).then(setThumb);
  };

  return (
    <GalleryCard
      label={label}
      selected={selected}
      badge={scene.followsMode ? followsLabel : undefined}
      onSelect={() => onSelect(scene)}
    >
      <span className="absolute inset-0" style={{ background: scene.swatch }} />
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element -- 480px webp (or a generated object URL); nothing for next/image to optimise
        <img
          src={thumb}
          alt=""
          decoding="async"
          onError={thumb.startsWith('/scenes/') ? renderFallback : undefined}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </GalleryCard>
  );
}

/**
 * The default scene, "Cream paper": the doodle paper of the page itself with the stage tint on top,
 * so its tile shows the live tint of the current timer mode.
 */
export function DefaultSceneCard({ label, followsLabel, selected, onSelect }: Omit<SceneCardProps, 'scene' | 'onSelect'> & { onSelect: () => void }) {
  return (
    <GalleryCard label={label} selected={selected} badge={followsLabel} onSelect={onSelect}>
      <span
        className={cn('paper-bg absolute inset-0 transition-colors duration-700')}
        style={{ backgroundColor: 'var(--stage-tint)', backgroundSize: '112px 112px' }}
      />
    </GalleryCard>
  );
}
