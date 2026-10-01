import type { MutableRefObject } from 'react';

/** Hex colours resolved from the stage's CSS tokens (they follow the timer mode). */
export interface ScenePalette {
  accent: string;
  ink: string;
  card: string;
  edge: string;
  /** Amber / rose while the low-time warning is active, otherwise null */
  warn: string | null;
}

export interface SceneProps {
  timeLeft: number;
  total: number;
  running: boolean;
  palette: ScenePalette;
  fontFamily: string;
  /** Normalised pointer position over the canvas, -1..1 */
  pointer: MutableRefObject<{ x: number; y: number }>;
  reduceMotion: boolean;
}

export type SceneId = 'flip3d' | 'tomato' | 'orbit' | 'solid';
