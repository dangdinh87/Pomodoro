'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useBackground } from '@/contexts/background-context';
import { DottedMap } from '@/components/ui/dotted-map';
import { useTheme } from 'next-themes';

export function BackgroundRenderer() {
  const { background, isLoading } = useBackground();
  const { theme: currentTheme } = useTheme();

  // Hooks must be called consistently; loading check moved below hooks to avoid hook order issues.
  // Predeclare refs used for auto day/night videos to keep hook order stable
  const dayRef = useRef<HTMLVideoElement | null>(null);
  const nightRef = useRef<HTMLVideoElement | null>(null);

  // Resolve theme (light/dark) for automatic media choice
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

  // Resolve media src:
  // - Special sentinel "lofi:auto" picks day/night from /public/backgrounds by theme
  // - Otherwise return the provided value
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
  const isAutoLofi = background.value === 'lofi:auto';
  useEffect(() => {
    if (!(background.type === 'image' && isAutoLofi)) return;
    const day = dayRef.current;
    const night = nightRef.current;
    if (!day || !night) return;
    const showNight = resolvedTheme === 'dark';
    if (showNight) {
      try { day.pause(); } catch {}
      try { night.play(); } catch {}
    } else {
      try { night.pause(); } catch {}
      try { day.play(); } catch {}
    }
  }, [resolvedTheme, isAutoLofi, background.type]);

  if (isLoading) {
    return null;
  }



  // Special handling for auto day/night video to avoid remount jank on theme switch
  if (background.type === 'image' && isAutoLofi) {
    const showNight = resolvedTheme === 'dark';

    return (
      <>
        <video
          ref={dayRef}
          className="fixed inset-0 w-full h-full object-cover -z-10"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          src="/backgrounds/day.mp4"
          style={{
            opacity: showNight ? 0 : background.opacity,
            filter: `blur(${background.blur}px)`,
            // Inline transition overrides global 'video { transition: none }'
            transition: 'opacity 180ms ease',
            willChange: 'opacity',
          }}
        />
        <video
          ref={nightRef}
          className="fixed inset-0 w-full h-full object-cover -z-10"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          src="/backgrounds/night.mp4"
          style={{
            opacity: showNight ? background.opacity : 0,
            filter: `blur(${background.blur}px)`,
            transition: 'opacity 180ms ease',
            willChange: 'opacity',
          }}
        />
        {background.showDottedMap && (
          <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
            <DottedMap
              className="w-full h-full"
              width={1920}
              height={1080}
              dotColor="currentColor"
              markerColor="#FF6900"
              dotRadius={0.5}
            />
          </div>
        )}
      </>
    );
  }

  // Render based on background type and resolved media
  if (background.type === 'image' && isVideo) {
    // Video background (single source)
    return (
      <>
        <video
          key={resolvedSrc}
          className="fixed inset-0 w-full h-full object-cover -z-10"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          src={resolvedSrc}
          style={{
            opacity: background.opacity,
            filter: `blur(${background.blur}px)`,
            willChange: 'opacity',
          }}
        />
        {background.showDottedMap && (
          <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
            <DottedMap
              className="w-full h-full"
              width={1920}
              height={1080}
              dotColor="currentColor"
              markerColor="#FF6900"
              dotRadius={0.5}
            />
          </div>
        )}
      </>
    );
  }

  // Solid, Gradient or Image (static) backgrounds
  const style = (() => {
    switch (background.type) {
      case 'solid':
        return {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: background.value,
          zIndex: -10,
        };
      case 'gradient':
        return {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: background.value,
          opacity: background.opacity,
          zIndex: -10,
        };
      case 'image':
        return {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${resolvedSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: background.opacity,
          filter: `blur(${background.blur}px)`,
          zIndex: -10,
        };
      case 'none':
      default:
        return {
          display: 'none',
        };
    }
  })();
  
  return (
    <>
      <div style={style} />
      {background.showDottedMap && (
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
          <DottedMap
            className="w-full h-full"
            width={1920}
            height={1080}
            dotColor="currentColor"
            markerColor="#FF6900"
            dotRadius={0.5}
          />
        </div>
      )}
    </>
  );
}
