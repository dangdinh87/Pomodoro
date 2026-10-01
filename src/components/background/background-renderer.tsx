'use client';

import { useBackground } from '@/contexts/background-context';
import { findImageById } from '@/data/background-packs';
import { getBestImageUrl } from '@/lib/format-detection';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// Scene shaders only download once a scene is actually selected.
const SceneCanvas = dynamic(() => import('@/features/scenes/components/scene-canvas'), { ssr: false });

/** Resolve background value (ID, sentinel, path, or data URL) to a displayable URL. */
function resolveBackgroundUrl(value: string): string {
  // System sentinel stays as-is (handled as solid in parent)
  if (value.startsWith('system:')) return value;

  // Video paths pass through
  if (value.endsWith('.mp4')) return value;

  // Custom images (data URLs or http URLs) pass through
  if (value.startsWith('data:') || value.startsWith('http')) return value;

  // Old-style paths (safety fallback if migration missed something)
  if (value.startsWith('/backgrounds/')) return value;

  // ID-based resolution → image URL or video path
  const image = findImageById(value);
  if (image?.kind === 'video' && image.value) return image.value;
  if (image?.sources) return getBestImageUrl(image.sources);

  return value;
}

export function BackgroundRenderer() {
  const { background, isLoading } = useBackground();
  const [loaded, setLoaded] = useState(false);

  const pathname = usePathname();
  // The timer stage lives on `/`; content pages keep the plain theme background.
  const isTimerPage = pathname === '/';

  // Resolve media src (ID → best format URL)
  const resolvedSrc = useMemo(
    () => resolveBackgroundUrl(background.value),
    [background.value],
  );

  const isVideo =
    typeof resolvedSrc === 'string' &&
    resolvedSrc.toLowerCase().endsWith('.mp4');

  // Preload active background image in <head>
  useEffect(() => {
    if (!resolvedSrc || background.type !== 'image' || isVideo) return;
    if (!resolvedSrc.startsWith('/backgrounds/')) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = resolvedSrc;
    if (resolvedSrc.endsWith('.avif')) link.type = 'image/avif';
    else if (resolvedSrc.endsWith('.webp')) link.type = 'image/webp';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [resolvedSrc, background.type, isVideo]);

  // Image preload for fade-in timing
  useEffect(() => {
    setLoaded(false);

    if (background.type !== 'image') {
      setLoaded(true);
      return;
    }

    if (isVideo) {
      return;
    }

    if (typeof resolvedSrc !== 'string') {
      setLoaded(true);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.src = resolvedSrc;
    const handleComplete = () => {
      if (isMounted) setLoaded(true);
    };

    img.addEventListener('load', handleComplete);
    img.addEventListener('error', handleComplete);

    return () => {
      isMounted = false;
      img.removeEventListener('load', handleComplete);
      img.removeEventListener('error', handleComplete);
    };
  }, [background.type, isVideo, resolvedSrc]);

  if (isLoading) return null;

  // If not on timer page, render nothing (or let default theme background show)
  if (!isTimerPage) {
    return null;
  }

  if (background.type === 'scene') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
        <SceneCanvas
          key={background.value}
          sceneId={background.value}
          brightness={background.brightness ?? 100}
          animate={background.motion !== false}
          followMode={background.followMode !== false}
        />
      </div>
    );
  }

  const imageFilter = `blur(${background.blur}px) brightness(${background.brightness ?? 100}%)`;

  // --- VIDEO BACKGROUND ---
  if (background.type === 'image' && isVideo) {
    return (
      <div className="fixed inset-0 -z-10 bg-black">
        <video
          key={resolvedSrc}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          loop
          src={resolvedSrc}
          onCanPlay={() => setLoaded(true)}
          style={{
            opacity: loaded ? background.opacity : 0,
            filter: imageFilter,
            transition: 'opacity 800ms ease',
          }}
        />
      </div>
    );
  }

  // --- IMAGE BACKGROUND (two-layer: black backdrop + image with opacity) ---
  if (background.type === 'image') {
    return (
      <div className="fixed inset-0 -z-10 bg-black">
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: loaded ? background.opacity : 0,
            transition: 'opacity 800ms ease',
            backgroundImage: `url(${resolvedSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: imageFilter,
          }}
        />
      </div>
    );
  }

  // --- SOLID / GRADIENT / NONE ---
  const base: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: loaded ? background.opacity : 0,
    transition: 'opacity 800ms ease',
    zIndex: -10,
  };

  let style: React.CSSProperties;

  switch (background.type) {
    case 'solid':
      // The default scene follows the timer mode (see --stage-tint in globals.css).
      style =
        background.value === 'var(--surface-page)'
          ? { ...base, backgroundColor: 'var(--stage-tint)', transition: 'opacity 800ms ease, background-color 700ms ease' }
          : { ...base, backgroundColor: background.value };
      break;
    case 'gradient':
      style = { ...base, background: background.value };
      break;
    case 'none':
    default:
      style = { display: 'none' };
      break;
  }

  return <div style={style} />;
}
