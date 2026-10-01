export type Feature = 'chat' | 'leaderboard' | 'history';

/**
 * Feature flags driven by NEXT_PUBLIC_* env vars.
 * Literal `process.env.NEXT_PUBLIC_*` accesses are required so Next.js can
 * inline them into client bundles; evaluated at call time (tests can toggle).
 *  - chat / leaderboard: opt-in (default OFF)
 *  - history: opt-out (default ON)
 */
export function isFeatureEnabled(feature: Feature): boolean {
  switch (feature) {
    case 'chat':
      return process.env.NEXT_PUBLIC_FEATURE_CHAT === 'true';
    case 'leaderboard':
      return process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD === 'true';
    case 'history':
      return process.env.NEXT_PUBLIC_FEATURE_HISTORY !== 'false';
    default:
      return false;
  }
}
