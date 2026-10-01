import { describe, expect, it } from 'vitest';
import { lerpRgb, MODE_TINTS, parseTimerMode } from './mode-tint';
import { resolveRenderProfile } from './render-profile';

describe('mode tint', () => {
  it('parses timer modes and defaults to focus', () => {
    expect(parseTimerMode('shortBreak')).toBe('shortBreak');
    expect(parseTimerMode('longBreak')).toBe('longBreak');
    expect(parseTimerMode('focus')).toBe('focus');
    expect(parseTimerMode(undefined)).toBe('focus');
    expect(parseTimerMode('garbage')).toBe('focus');
  });

  it('lerps between tints', () => {
    expect(lerpRgb(MODE_TINTS.focus, MODE_TINTS.longBreak, 0)).toEqual(MODE_TINTS.focus);
    expect(lerpRgb(MODE_TINTS.focus, MODE_TINTS.longBreak, 1)).toEqual(MODE_TINTS.longBreak);
    expect(lerpRgb([0, 0, 0], [1, 1, 1], 0.5)).toEqual([0.5, 0.5, 0.5]);
  });
});

describe('render profile', () => {
  it('uses the full profile on capable desktops', () => {
    expect(resolveRenderProfile({ deviceMemory: 8, hardwareConcurrency: 10, coarsePointer: false })).toEqual({
      lowPower: false,
      dprCap: 1.5,
      frameInterval: 1000 / 30,
    });
  });

  it('drops to 1x and 24 fps for data-saver, low memory, few cores or touch', () => {
    for (const hints of [{ saveData: true }, { deviceMemory: 4 }, { hardwareConcurrency: 4 }, { coarsePointer: true }]) {
      const p = resolveRenderProfile(hints);
      expect(p.lowPower).toBe(true);
      expect(p.dprCap).toBe(1);
      expect(p.frameInterval).toBeGreaterThan(1000 / 30);
    }
  });
});
