'use client';

import type { MutableRefObject, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

/**
 * Eases a group toward a small tilt that follows the pointer, plus a fixed
 * resting tilt so the depth reads even when nothing moves. Keeps requesting
 * frames only until it has settled (the canvas renders on demand).
 */
export function usePointerTilt(
  group: RefObject<Group | null>,
  pointer: MutableRefObject<{ x: number; y: number }>,
  { strength, restX = 0, restY = 0, enabled }: { strength: number; restX?: number; restY?: number; enabled: boolean },
) {
  // three.js objects are mutable by design; this is the render-loop callback, not render.
  /* eslint-disable react-hooks/immutability */
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const targetY = restY + (enabled ? pointer.current.x * strength : 0);
    const targetX = restX + (enabled ? pointer.current.y * strength : 0);
    const dx = targetX - g.rotation.x;
    const dy = targetY - g.rotation.y;
    if (Math.abs(dx) < 0.0004 && Math.abs(dy) < 0.0004) {
      g.rotation.x = targetX;
      g.rotation.y = targetY;
      return;
    }
    g.rotation.x += dx * 0.14;
    g.rotation.y += dy * 0.14;
    state.invalidate();
  });
  /* eslint-enable react-hooks/immutability */
}
