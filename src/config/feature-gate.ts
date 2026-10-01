import { NextResponse } from 'next/server';
import { isFeatureEnabled, type Feature } from './feature-flags';

/** Server-only: returns a 404 response when the feature is OFF, else null. */
export function featureGate(feature: Feature): NextResponse | null {
  return isFeatureEnabled(feature)
    ? null
    : NextResponse.json({ error: 'Not found' }, { status: 404 });
}
