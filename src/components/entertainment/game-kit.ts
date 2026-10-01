'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'over';

/** Props every game receives from the arcade panel. */
export interface GameProps {
  best: number;
  onGameEnd: (score: number) => void;
  onClose: () => void;
}

interface SessionOptions extends GameProps {
  /** Turn-based games skip the "ready" overlay and start straight away. */
  initial?: GameStatus;
  /** Typing games need the P key for letters. */
  pauseKey?: boolean;
}

/**
 * Owns the start -> play -> pause -> game over lifecycle shared by every game:
 * Esc/P toggles pause, a hidden tab pauses, and Esc outside a run backs out of the game
 * (captured on window so the surrounding dialog does not close underneath us).
 */
export function useGameSession({ best, onGameEnd, onClose, initial = 'ready', pauseKey = true }: SessionOptions) {
  const [status, setStatusState] = useState<GameStatus>(initial);
  const statusRef = useRef<GameStatus>(initial);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [initialBest] = useState(best);
  const callbacks = useRef({ onGameEnd, onClose });

  useEffect(() => {
    callbacks.current = { onGameEnd, onClose };
  });

  const setStatus = useCallback((next: GameStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const start = useCallback(() => setStatus('playing'), [setStatus]);
  const toReady = useCallback(() => setStatus('ready'), [setStatus]);
  const pause = useCallback(() => {
    if (statusRef.current === 'playing') setStatus('paused');
  }, [setStatus]);
  const resume = useCallback(() => {
    if (statusRef.current === 'paused') setStatus('playing');
  }, [setStatus]);
  const finish = useCallback(
    (final: number) => {
      if (statusRef.current === 'over') return;
      const safe = Math.max(0, Math.floor(final));
      setFinalScore(safe);
      setStatus('over');
      callbacks.current.onGameEnd(safe);
    },
    [setStatus],
  );
  /** Report progress for games that never really end (2048). */
  const report = useCallback((value: number) => callbacks.current.onGameEnd(Math.max(0, Math.floor(value))), []);
  const close = useCallback(() => callbacks.current.onClose(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isEsc = e.key === 'Escape';
      const isP = pauseKey && (e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!isEsc && !isP) return;
      const current = statusRef.current;
      if (isP && current !== 'playing' && current !== 'paused') return;
      if (isEsc) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (current === 'playing') setStatus('paused');
      else if (current === 'paused') setStatus('playing');
      else if (isEsc) callbacks.current.onClose();
    };
    const onVisibility = () => {
      if (document.hidden && statusRef.current === 'playing') setStatus('paused');
    };
    window.addEventListener('keydown', onKey, true);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pauseKey, setStatus]);

  return { status, statusRef, score, setScore, finalScore, initialBest, start, toReady, pause, resume, finish, report, close };
}

export type GameSession = ReturnType<typeof useGameSession>;

/** requestAnimationFrame loop with a capped delta, paused while the tab is hidden, cleaned up on unmount. */
export function useRafLoop(callback: (dt: number) => void, active = true) {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    if (!active) return;
    let id = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      cbRef.current(dt);
      id = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(id);
        id = 0;
      } else if (!id) {
        last = 0;
        id = requestAnimationFrame(tick);
      }
    };
    if (!document.hidden) id = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);
}

/**
 * Fits a fixed logical canvas (lw x lh) into its container, backed by a devicePixelRatio-aware
 * bitmap. Draw in logical units after calling getCtx().
 */
export function useCanvasStage(lw: number, lh: number, maxScale = 2) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;
    const fit = () => {
      const aw = el.clientWidth - 16;
      const ah = el.clientHeight - 16;
      if (aw <= 0 || ah <= 0) return;
      const scale = Math.min(aw / lw, ah / lh, maxScale);
      const cssW = Math.floor(lw * scale);
      const cssH = Math.floor(lh * scale);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.style.width = `${cssW}px`;
      cv.style.height = `${cssH}px`;
      const bw = Math.round(cssW * dpr);
      const bh = Math.round(cssH * dpr);
      if (cv.width !== bw) cv.width = bw;
      if (cv.height !== bh) cv.height = bh;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lw, lh, maxScale]);

  const getCtx = useCallback(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return null;
    ctx.setTransform(cv.width / lw, 0, 0, cv.height / lh, 0, 0);
    return ctx;
  }, [lw, lh]);

  const toLogical = useCallback(
    (clientX: number, clientY: number) => {
      const cv = canvasRef.current;
      if (!cv) return { x: 0, y: 0 };
      const r = cv.getBoundingClientRect();
      return { x: ((clientX - r.left) / r.width) * lw, y: ((clientY - r.top) / r.height) * lh };
    },
    [lw, lh],
  );

  return { containerRef, canvasRef, getCtx, toLogical };
}

export type CanvasStage = ReturnType<typeof useCanvasStage>;

export interface GamePalette {
  page: string;
  surface: string;
  raised: string;
  hover: string;
  border: string;
  borderStrong: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  inkFaint: string;
  accent: string;
  accentSolid: string;
  blue: string;
  green: string;
  purple: string;
  amber: string;
  rose: string;
  cyan: string;
  pink: string;
  gold: string;
}

const PALETTE_VARS: Record<keyof GamePalette, string> = {
  page: '--surface-page',
  surface: '--surface',
  raised: '--surface-raised',
  hover: '--surface-hover',
  border: '--border',
  borderStrong: '--border-strong',
  ink: '--ink',
  inkSecondary: '--ink-secondary',
  inkMuted: '--ink-muted',
  inkFaint: '--ink-faint',
  accent: '--accent',
  accentSolid: '--accent-solid',
  blue: '--blue-solid',
  green: '--green-solid',
  purple: '--purple-solid',
  amber: '--amber-solid',
  rose: '--rose-solid',
  cyan: '--cyan-solid',
  pink: '--pink-solid',
  gold: '--gold',
};

const FALLBACK_PALETTE: GamePalette = {
  page: '#F9FAFB',
  surface: '#FFFFFF',
  raised: '#F2F4F5',
  hover: '#E7EBEE',
  border: '#DADEE2',
  borderStrong: '#B2BBC2',
  ink: '#111418',
  inkSecondary: '#3b4752',
  inkMuted: '#647380',
  inkFaint: '#8A95A0',
  accent: '#E2441F',
  accentSolid: '#D93A16',
  blue: '#1D4ED8',
  green: '#047857',
  purple: '#6D28D9',
  amber: '#B45309',
  rose: '#BE123C',
  cyan: '#0E7490',
  pink: '#DB2777',
  gold: '#E08A00',
};

function readPalette(): GamePalette {
  const style = getComputedStyle(document.documentElement);
  const out = { ...FALLBACK_PALETTE };
  (Object.keys(PALETTE_VARS) as (keyof GamePalette)[]).forEach((key) => {
    const value = style.getPropertyValue(PALETTE_VARS[key]).trim();
    if (value) out[key] = value;
  });
  return out;
}

/** Live design-token colours for canvas drawing; follows the light/dark theme and colour presets. */
export function useGamePalette(): RefObject<GamePalette> {
  const ref = useRef<GamePalette>(FALLBACK_PALETTE);
  useEffect(() => {
    ref.current = readPalette();
    const observer = new MutationObserver(() => {
      ref.current = readPalette();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
    return () => observer.disconnect();
  }, []);
  return ref;
}

export type SwipeDir = 'up' | 'down' | 'left' | 'right';

/** Fires onSwipe as soon as a finger/pointer travels `threshold` px, then re-arms so one drag can chain turns. */
export function useSwipe(ref: RefObject<HTMLElement | null>, onSwipe: (dir: SwipeDir) => void, threshold = 24) {
  const cbRef = useRef(onSwipe);
  useEffect(() => {
    cbRef.current = onSwipe;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let sx = 0;
    let sy = 0;
    let tracking = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      tracking = true;
      sx = e.clientX;
      sy = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!tracking) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
      cbRef.current(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
      sx = e.clientX;
      sy = e.clientY;
    };
    const up = () => {
      tracking = false;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [ref, threshold]);
}

/** Pause-aware countdown. Time only drains while status is "playing". */
export function useCountdown(totalMs: number, status: GameStatus, onEnd: () => void) {
  const [left, setLeft] = useState(totalMs);
  const leftRef = useRef(totalMs);
  const endRef = useRef(onEnd);

  useEffect(() => {
    endRef.current = onEnd;
  });

  useEffect(() => {
    if (status !== 'playing') return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      leftRef.current = Math.max(0, leftRef.current - (now - last));
      last = now;
      setLeft(leftRef.current);
      if (leftRef.current <= 0) {
        clearInterval(id);
        endRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [status]);

  const reset = useCallback(() => {
    leftRef.current = totalMs;
    setLeft(totalMs);
  }, [totalMs]);

  return { left, leftRef, reset };
}

/** Held-key tracker that clears itself on blur/hidden so keys never get stuck. */
export function useHeldKeys(map: Record<string, string>) {
  const held = useRef(new Set<string>());
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const action = map[e.key] ?? map[e.key.toLowerCase()];
      if (!action) return;
      e.preventDefault();
      held.current.add(action);
    };
    const up = (e: KeyboardEvent) => {
      const action = map[e.key] ?? map[e.key.toLowerCase()];
      if (action) held.current.delete(action);
    };
    const clear = () => held.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', clear);
    };
  }, [map]);
  return held;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
