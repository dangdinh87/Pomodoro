import { describe, expect, it } from 'vitest';
import {
  elapsedFraction,
  formatClock,
  fractionToAngle,
  getClockVisualState,
  parseCssColor,
  remainingFraction,
  segmentsForDigit,
  splitTime,
  stageWidth,
  toHex,
  wedgeScales,
} from './clock-math';
import { CLOCK_STYLES, isThreeDClock, resolveClockType } from './clock-registry';

describe('fractions and angles', () => {
  it('maps time left to remaining/elapsed share, clamped', () => {
    expect(remainingFraction(750, 1500)).toBe(0.5);
    expect(elapsedFraction(750, 1500)).toBe(0.5);
    expect(remainingFraction(2000, 1500)).toBe(1);
    expect(remainingFraction(-5, 1500)).toBe(0);
    expect(remainingFraction(10, 0)).toBe(0);
  });

  it('converts a fraction to radians', () => {
    expect(fractionToAngle(0.25)).toBeCloseTo(Math.PI / 2);
    expect(fractionToAngle(2)).toBeCloseTo(Math.PI * 2);
    expect(fractionToAngle(-1)).toBe(0);
  });
});

describe('time formatting', () => {
  it('splits into digits', () => {
    expect(splitTime(25 * 60).digits).toEqual([2, 5, 0, 0]);
    expect(splitTime(61).digits).toEqual([0, 1, 0, 1]);
    expect(splitTime(-3).digits).toEqual([0, 0, 0, 0]);
    expect(splitTime(120 * 60).digits).toEqual([9, 9, 0, 0]);
  });

  it('formats mm:ss', () => {
    expect(formatClock(5)).toBe('00:05');
    expect(formatClock(90 * 60)).toBe('90:00');
  });
});

describe('low-time warning state', () => {
  it('escalates in the last minute and last 10 seconds', () => {
    expect(getClockVisualState(300, true)).toBe('running');
    expect(getClockVisualState(60, true)).toBe('urgent');
    expect(getClockVisualState(10, true)).toBe('critical');
    expect(getClockVisualState(0, true)).toBe('complete');
  });

  it('stays calm while paused or when the warning is off', () => {
    expect(getClockVisualState(5, false)).toBe('idle');
    expect(getClockVisualState(5, true, false)).toBe('running');
  });
});

describe('tomato wedges', () => {
  it('keeps every wedge whole at the start and none at the end', () => {
    expect(wedgeScales(1, 12).every((s) => s === 1)).toBe(true);
    expect(wedgeScales(0, 12).every((s) => s === 0)).toBe(true);
  });

  it('shrinks a single wedge at a time', () => {
    const s = wedgeScales(0.5 + 0.5 / 12, 12);
    expect(s.slice(0, 6).every((v) => v === 1)).toBe(true);
    expect(s[6]).toBeCloseTo(0.5);
    expect(s.slice(7).every((v) => v === 0)).toBe(true);
  });
});

describe('seven-segment digits', () => {
  it('lights the expected segments', () => {
    expect(segmentsForDigit(8).every(Boolean)).toBe(true);
    expect(segmentsForDigit(1).filter(Boolean)).toHaveLength(2);
    expect(segmentsForDigit(0)[6]).toBe(false);
    expect(segmentsForDigit(7).filter(Boolean)).toHaveLength(3);
  });
});

describe('stage width', () => {
  it('is capped by viewport width, rem and height budget', () => {
    expect(stageWidth('medium', 3)).toBe('min(92vw, 34rem, 96vh)');
    expect(stageWidth('small', 1)).toBe('min(92vw, 24rem, 24vh)');
  });
});

describe('css colour parsing', () => {
  it('reads rgb, srgb and hex', () => {
    expect(parseCssColor('rgb(240, 83, 45)')).toEqual([240, 83, 45]);
    expect(parseCssColor('rgb(240 83 45 / 0.5)')).toEqual([240, 83, 45]);
    expect(parseCssColor('color(srgb 1 0 0.5)')).toEqual([255, 0, 127.5]);
    expect(parseCssColor('#0f0')).toEqual([0, 255, 0]);
    expect(parseCssColor('nonsense')).toBeNull();
  });

  it('writes hex', () => {
    expect(toHex([240, 83, 45])).toBe('#f0532d');
    expect(toHex([300, -4, 127.5])).toBe('#ff0080');
  });
});

describe('clock registry', () => {
  it('has unique ids and 3D flags', () => {
    const ids = CLOCK_STYLES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CLOCK_STYLES.filter((c) => c.is3d).map((c) => c.id)).toEqual(['flip3d', 'tomato', 'orbit', 'solid']);
    expect(isThreeDClock('tomato')).toBe(true);
    expect(isThreeDClock('digital')).toBe(false);
  });

  it('maps retired or unknown persisted types to digital', () => {
    expect(resolveClockType('progress')).toBe('digital');
    expect(resolveClockType('animated')).toBe('digital');
    expect(resolveClockType(undefined)).toBe('digital');
    expect(resolveClockType('orbit')).toBe('orbit');
  });
});
