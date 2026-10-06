/** A block's extent along one axis: centre and size. */
export interface Slab {
  c: number;
  s: number;
}

export type PlaceResult =
  | { kind: 'miss' }
  | { kind: 'hit'; kept: Slab; cut: Slab | null; perfect: boolean };

/** Within this offset (world units) a drop snaps onto the block below. */
export const PERFECT_TOLERANCE = 0.08;

/** Lands the sliding block on the one below along a single axis, trimming any overhang. */
export function placeSlab(prev: Slab, cur: Slab, tolerance = PERFECT_TOLERANCE): PlaceResult {
  const prevL = prev.c - prev.s / 2;
  const prevR = prev.c + prev.s / 2;
  const curL = cur.c - cur.s / 2;
  const curR = cur.c + cur.s / 2;
  const lo = Math.max(prevL, curL);
  const hi = Math.min(prevR, curR);
  if (hi - lo <= 0) return { kind: 'miss' };

  if (Math.abs(cur.c - prev.c) <= tolerance) {
    return { kind: 'hit', kept: { c: prev.c, s: Math.min(prev.s, cur.s) }, cut: null, perfect: true };
  }

  const kept: Slab = { c: (lo + hi) / 2, s: hi - lo };
  const cut: Slab | null =
    curL < prevL
      ? { c: (curL + prevL) / 2, s: prevL - curL }
      : curR > prevR
        ? { c: (prevR + curR) / 2, s: curR - prevR }
        : null;
  return { kind: 'hit', kept, cut, perfect: false };
}

/** Slide speed in world units per second; ramps with height and caps so it stays humanly playable. */
export function slideSpeed(layer: number): number {
  return Math.min(6.2, 2.4 + layer * 0.08);
}
