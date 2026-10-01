'use client';

import { useEffect, useRef, useState } from 'react';
import { lerpRgb, MODE_TINTS, parseTimerMode, type Rgb } from '../lib/mode-tint';
import { readRenderProfile } from '../lib/render-profile';
import { findSceneById } from '../lib/scene-registry';
import { SceneRenderer } from '../lib/webgl-scene';

interface SceneCanvasProps {
  sceneId: string;
  /** Percent; 100 = scene as authored. */
  brightness: number;
  animate: boolean;
  followMode: boolean;
}

type Status = 'loading' | 'ready' | 'fallback';

/**
 * Fullscreen procedural scene. Mount with `key={sceneId}`: a scene change remounts and cross-fades in.
 * Animates at ~30 fps (24 on low-power devices), pauses while the tab is hidden, and draws a single
 * still frame under prefers-reduced-motion or when animation is switched off.
 */
export default function SceneCanvas({ sceneId, brightness, animate, followMode }: SceneCanvasProps) {
  const meta = findSceneById(sceneId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [body, setBody] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(meta ? 'loading' : 'fallback');
  const live = useRef({ brightness, animate, followMode });
  const refresh = useRef<() => void>(() => {});

  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    meta
      .load()
      .then((mod) => !cancelled && setBody(mod.default))
      .catch(() => !cancelled && setStatus('fallback'));
    return () => {
      cancelled = true;
    };
  }, [meta]);

  useEffect(() => {
    live.current = { brightness, animate, followMode };
    refresh.current();
  }, [brightness, animate, followMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !body || !meta) return;
    const renderer = SceneRenderer.create(canvas, body);
    if (!renderer) {
      setStatus('fallback');
      return;
    }

    const profile = readRenderProfile();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    const readTarget = (): Rgb => MODE_TINTS[parseTimerMode(root.dataset.timerMode)];

    let time = meta.stillTime;
    let target = readTarget();
    let tint = target;
    let raf = 0;
    let last = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap) * meta.renderScale;
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = () => {
      const { brightness: b, followMode: f } = live.current;
      renderer.draw(canvas.width, canvas.height, {
        time,
        tint,
        follow: f && meta.followsMode ? 1 : 0,
        brightness: b / 100,
      });
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const elapsed = now - last;
      if (elapsed < profile.frameInterval) return;
      last = now;
      const dt = Math.min(elapsed, 100) / 1000;
      time += dt;
      tint = lerpRgb(tint, target, 1 - Math.exp(-dt * 3));
      draw();
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const start = () => {
      stop();
      fit();
      draw();
      if (live.current.animate && !reducedMotion.matches && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onModeChange = () => {
      target = readTarget();
      if (!raf) {
        tint = target;
        draw();
      }
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      stop();
      setStatus('fallback');
    };

    refresh.current = start;
    start();
    setStatus('ready');

    const resize = new ResizeObserver(() => {
      fit();
      if (!raf) draw();
    });
    resize.observe(canvas);
    const mode = new MutationObserver(onModeChange);
    mode.observe(root, { attributes: true, attributeFilter: ['data-timer-mode'] });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      stop();
      refresh.current = () => {};
      resize.disconnect();
      mode.disconnect();
      document.removeEventListener('visibilitychange', start);
      reducedMotion.removeEventListener('change', start);
      canvas.removeEventListener('webglcontextlost', onLost);
      renderer.dispose();
    };
  }, [body, meta]);

  return (
    <>
      <div className="absolute inset-0" style={{ background: meta?.swatch }} />
      {status !== 'fallback' && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full transition-opacity duration-700"
          style={{ opacity: status === 'ready' ? 1 : 0 }}
        />
      )}
    </>
  );
}
