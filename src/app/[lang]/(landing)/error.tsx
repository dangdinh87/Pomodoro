'use client';

import { RouteError } from '@/components/shared/route-error';

export default function LandingError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError {...props} homeHref="/" homeLabelKey="errors.boundary.goHome" />
  );
}
