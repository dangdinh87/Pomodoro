import { isFeatureEnabled } from './feature-flags';

describe('isFeatureEnabled', () => {
  const saved = process.env.NEXT_PUBLIC_FEATURE_HISTORY;
  afterEach(() => {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_FEATURE_HISTORY;
    else process.env.NEXT_PUBLIC_FEATURE_HISTORY = saved;
  });

  it('history defaults ON, disabled only by "false"', () => {
    delete process.env.NEXT_PUBLIC_FEATURE_HISTORY;
    expect(isFeatureEnabled('history')).toBe(true);
    process.env.NEXT_PUBLIC_FEATURE_HISTORY = 'false';
    expect(isFeatureEnabled('history')).toBe(false);
  });
});
