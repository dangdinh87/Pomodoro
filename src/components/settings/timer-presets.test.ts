import { describe, expect, it } from 'vitest';
import { DURATION_PRESETS, clampDuration, cycleMinutes, matchPreset, parseDuration } from './timer-presets';

describe('timer presets', () => {
  it('offers the four standard rhythms', () => {
    expect(DURATION_PRESETS.map((p) => `${p.workDuration}/${p.shortBreakDuration}`)).toEqual(['25/5', '50/10', '52/17', '90/20']);
  });

  it('matches a preset by focus + short break only', () => {
    expect(matchPreset(25, 5)).toBe(0);
    expect(matchPreset(90, 20)).toBe(3);
    expect(matchPreset(30, 5)).toBe(-1);
  });

  it('clamps to per-field limits', () => {
    expect(clampDuration('workDuration', 0)).toBe(1);
    expect(clampDuration('workDuration', 500)).toBe(120);
    expect(clampDuration('shortBreakDuration', 45)).toBe(30);
    expect(clampDuration('longBreakInterval', 1)).toBe(2);
  });

  it('falls back on unparsable input', () => {
    expect(parseDuration('workDuration', '', 25)).toBe(25);
    expect(parseDuration('workDuration', '40', 25)).toBe(40);
  });

  it('computes a full cycle length', () => {
    expect(cycleMinutes({ workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, longBreakInterval: 4 })).toBe(130);
  });
});
