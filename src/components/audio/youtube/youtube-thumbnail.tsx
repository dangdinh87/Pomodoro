'use client';

import { useState, type ReactNode } from 'react';

/**
 * A video thumbnail that falls back to `fallback` when the image fails (YouTube answers 404 for a removed video and
 * for a live stream, which has no still), instead of leaving a broken-image icon in the list.
 */
export function YouTubeThumbnail({
  src,
  className,
  fallback,
}: {
  src?: string | null;
  className?: string;
  fallback: ReactNode;
}) {
  // Remember which address failed, not just "failed": a different video gets its own try
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} onError={() => setFailedSrc(src)} />
  );
}
