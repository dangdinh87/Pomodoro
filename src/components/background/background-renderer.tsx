'use client';

import { useBackground } from '@/contexts/background-context';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export function BackgroundRenderer() {
  const { background, isLoading } = useBackground();
  const { theme: currentTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);

  const pathname = usePathname();
  const isTimerPage = pathname === '/timer';


  // Resolve theme (light/dark)
  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (currentTheme === 'dark') return 'dark';
    if (currentTheme === 'light') return 'light';
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  }, [currentTheme]);

  // Resolve media src
  const resolvedSrc = useMemo(() => {
    if (background.value === 'lofi:auto') {
      return resolvedTheme === 'dark'
        ? '/backgrounds/night.mp4'
        : '/backgrounds/day.mp4';
    }
    return background.value;
  }, [background.value, resolvedTheme]);

  const isVideo =
    typeof resolvedSrc === 'string' &&
    resolvedSrc.toLowerCase().endsWith('.mp4');

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

  // --- VIDEO BACKGROUND ---
  if (background.type === 'image' && isVideo) {
    return (
      <video
        key={resolvedSrc}
        className="fixed inset-0 w-full h-full object-cover -z-10"
        autoPlay
        muted
        playsInline
        loop
        src={resolvedSrc}
        onCanPlay={() => setLoaded(true)}
        style={{
          opacity: loaded ? background.opacity : 0,
          filter: `blur(${background.blur}px) brightness(${background.brightness ?? 100}%)`,
          transition: 'opacity 800ms ease',
        }}
      />
    );
  }

  // --- STATIC BACKGROUND ---
  const base = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: loaded ? background.opacity : 0,
    transition: 'opacity 800ms ease',
    zIndex: -10,
  };

  let style: React.CSSProperties = {};

  switch (background.type) {
    case 'solid':
      style = {
        ...base,
        backgroundColor: background.value,
      };
      break;
    case 'gradient':
      style = {
        ...base,
        background: background.value,
      };
      break;
    case 'image':
      style = {
        ...base,
        backgroundImage: `url(${resolvedSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: `blur(${background.blur}px) brightness(${background.brightness ?? 100}%)`,
      };
      break;
    case 'none':
    default:
      style = { display: 'none' };
      break;
  }

  return (
    <div style={style} />
  );
}
