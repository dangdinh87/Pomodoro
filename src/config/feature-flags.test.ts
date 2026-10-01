import { isFeatureEnabled } from './feature-flags';

const KEYS = [
  'NEXT_PUBLIC_FEATURE_LEADERBOARD',
  'NEXT_PUBLIC_FEATURE_HISTORY',
] as const;

describe('isFeatureEnabled', () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    KEYS.forEach((k) => {
      saved[k] = process.env[k];
      delete process.env[k];
    });
  });
  afterEach(() => {
    KEYS.forEach((k) => {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    });
  });

  it('leaderboard defaults OFF, enabled only by "true"', () => {
    expect(isFeatureEnabled('leaderboard')).toBe(false);
    process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD = 'true';
    expect(isFeatureEnabled('leaderboard')).toBe(true);
    process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD = '1';
    expect(isFeatureEnabled('leaderboard')).toBe(false);
  });

  it('history defaults ON, disabled only by "false"', () => {
    expect(isFeatureEnabled('history')).toBe(true);
    process.env.NEXT_PUBLIC_FEATURE_HISTORY = 'false';
    expect(isFeatureEnabled('history')).toBe(false);
  });
});
