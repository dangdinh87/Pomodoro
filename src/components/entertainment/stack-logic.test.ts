import { describe, expect, it } from 'vitest';
import { placeSlab, slideSpeed } from './stack-logic';

describe('stack placement', () => {
  it('snaps a near-perfect drop onto the block below', () => {
    const res = placeSlab({ c: 0, s: 3 }, { c: 0.05, s: 3 });
    expect(res).toEqual({ kind: 'hit', kept: { c: 0, s: 3 }, cut: null, perfect: true });
  });

  it('trims the overhang on the right', () => {
    const res = placeSlab({ c: 0, s: 3 }, { c: 1, s: 3 });
    expect(res.kind).toBe('hit');
    if (res.kind !== 'hit') return;
    expect(res.perfect).toBe(false);
    expect(res.kept).toEqual({ c: 0.5, s: 2 });
    expect(res.cut).toEqual({ c: 2, s: 1 });
  });

  it('trims the overhang on the left', () => {
    const res = placeSlab({ c: 0, s: 3 }, { c: -1.5, s: 3 });
    if (res.kind !== 'hit') throw new Error('expected a hit');
    expect(res.kept).toEqual({ c: -0.75, s: 1.5 });
    expect(res.cut).toEqual({ c: -2.25, s: 1.5 });
  });

  it('misses when there is no overlap', () => {
    expect(placeSlab({ c: 0, s: 3 }, { c: 3, s: 3 }).kind).toBe('miss');
    expect(placeSlab({ c: 0, s: 3 }, { c: -5, s: 3 }).kind).toBe('miss');
  });

  it('keeps kept + cut equal to the sliding block width', () => {
    const res = placeSlab({ c: 0.4, s: 2.2 }, { c: 1.3, s: 2.2 });
    if (res.kind !== 'hit' || !res.cut) throw new Error('expected a trimmed hit');
    expect(res.kept.s + res.cut.s).toBeCloseTo(2.2);
  });

  it('ramps speed and caps it', () => {
    expect(slideSpeed(10)).toBeGreaterThan(slideSpeed(0));
    expect(slideSpeed(1000)).toBe(6.2);
  });
});
