export type Feature = 'history';

/**
 * Feature flags driven by NEXT_PUBLIC_* env vars.
 * Literal `process.env.NEXT_PUBLIC_*` accesses are required so Next.js can
 * inline them into client bundles; evaluated at call time (tests can toggle).
 *  - history: opt-out (default ON)
 */
export function isFeatureEnabled(feature: Feature): boolean {
  switch (feature) {
    case 'history':
      return process.env.NEXT_PUBLIC_FEATURE_HISTORY !== 'false';
    default:
      return false;
  }
}
