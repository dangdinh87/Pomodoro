export type Feature = 'leaderboard' | 'history';

/**
 * Feature flags driven by NEXT_PUBLIC_* env vars.
 * Literal `process.env.NEXT_PUBLIC_*` accesses are required so Next.js can
 * inline them into client bundles; evaluated at call time (tests can toggle).
 *  - leaderboard: opt-in (default OFF)
 *  - history: opt-out (default ON)
 */
export function isFeatureEnabled(feature: Feature): boolean {
  switch (feature) {
    case 'leaderboard':
      return process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD === 'true';
    case 'history':
      return process.env.NEXT_PUBLIC_FEATURE_HISTORY !== 'false';
    default:
      return false;
  }
}
