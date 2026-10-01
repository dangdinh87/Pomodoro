'use client';

import { useEffect, useState, type RefObject } from 'react';
import { parseCssColor, toHex } from '../clock-math';
import type { ScenePalette } from './scene-types';

const FALLBACK: ScenePalette = { accent: '#f0532d', ink: '#fafafa', card: '#26262b', edge: '#3f3f46', warn: null };

const TOKENS = {
  accent: '--accent',
  ink: '--ink',
  card: '--surface-raised',
  edge: '--border-strong',
  amber: '--amber-meter',
  rose: '--rose-solid',
} as const;

function readColor(el: HTMLElement, token: string, fallback: string): string {
  el.style.color = `var(${token})`;
  const rgb = parseCssColor(getComputedStyle(el).color);
  return rgb ? toHex(rgb) : fallback;
}

/**
 * Resolves the stage's CSS colour tokens to hex for three.js. Re-read on every
 * tick (`tick`) so a mode change or a colour-preset change is picked up without
 * observing the DOM; state only changes when a value really differs.
 */
export function useClockPalette(
  rootRef: RefObject<HTMLElement | null>,
  tick: unknown,
  warnLevel: 'none' | 'amber' | 'rose',
): ScenePalette {
  const [palette, setPalette] = useState<ScenePalette>(FALLBACK);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    // transition:none — the probe is re-coloured once per token, and a global colour
    // transition would make getComputedStyle report the previous token's value.
    probe.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none;transition:none';
    root.appendChild(probe);
    try {
      const next: ScenePalette = {
        accent: readColor(probe, TOKENS.accent, FALLBACK.accent),
        ink: readColor(probe, TOKENS.ink, FALLBACK.ink),
        card: readColor(probe, TOKENS.card, FALLBACK.card),
        edge: readColor(probe, TOKENS.edge, FALLBACK.edge),
        warn:
          warnLevel === 'none'
            ? null
            : readColor(probe, warnLevel === 'amber' ? TOKENS.amber : TOKENS.rose, FALLBACK.accent),
      };
      setPalette((prev) =>
        prev.accent === next.accent &&
        prev.ink === next.ink &&
        prev.card === next.card &&
        prev.edge === next.edge &&
        prev.warn === next.warn
          ? prev
          : next,
      );
    } finally {
      probe.remove();
    }
  }, [rootRef, tick, warnLevel]);

  return palette;
}

/** The page's heading font as a canvas-ready family string. */
export function readHeadingFont(root: HTMLElement | null): string {
  if (!root) return 'sans-serif';
  const probe = document.createElement('span');
  probe.className = 'font-heading';
  probe.style.cssText = 'position:absolute;visibility:hidden';
  root.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || 'sans-serif';
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
