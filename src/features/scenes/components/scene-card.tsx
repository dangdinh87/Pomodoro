'use client';

import { useState, type ReactNode } from 'react';
import { Check, CircleNotch, Timer } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { getSceneThumbnail } from '../lib/scene-thumbnails';
import type { SceneMeta } from '../lib/scene-registry';

interface GalleryCardProps {
  label: string;
  selected: boolean;
  loading?: boolean;
  /** Small pill top-left, e.g. "Follows timer". */
  badge?: string;
  onSelect: () => void;
  children: ReactNode;
}

/** Shared tile for scenes, photos and videos so the whole gallery reads as one grid. */
export function GalleryCard({ label, selected, loading, badge, onSelect, children }: GalleryCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title={label}
      onClick={onSelect}
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg border transition-shadow duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        selected ? 'border-transparent ring-2 ring-brand' : 'border-border hover:border-border-strong',
      )}
    >
      {children}
      {badge && (
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
          <Timer size={10} weight="bold" aria-hidden />
          {badge}
        </span>
      )}
      {selected && !loading && (
        <span className="absolute right-2 top-2 rounded-full bg-primary p-0.5 text-white">
          <Check size={12} weight="bold" aria-hidden />
        </span>
      )}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
          <CircleNotch size={20} className="animate-spin text-white" aria-hidden />
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5 text-center text-xs font-medium text-white">
        {label}
      </span>
    </button>
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

/** The default scene: a solid tint that follows the timer mode, so its tile shows the live stage tint. */
export function DefaultSceneCard({ label, followsLabel, selected, onSelect }: Omit<SceneCardProps, 'scene' | 'onSelect'> & { onSelect: () => void }) {
  return (
    <GalleryCard label={label} selected={selected} badge={followsLabel} onSelect={onSelect}>
      <span className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: 'var(--stage-tint)' }} />
    </GalleryCard>
  );
}
