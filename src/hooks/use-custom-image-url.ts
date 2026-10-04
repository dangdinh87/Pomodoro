'use client';

import { useEffect, useState } from 'react';
import { loadImage, parseCustomImageValue } from '@/lib/custom-background/image-store';

interface CustomImageUrl {
  /** Object URL to draw, once the stored file has been read. */
  url: string | null;
  /** The database works but no longer holds this image (site data cleared). */
  missing: boolean;
}

/**
 * Resolves a `custom:<id>` background value to something the page can draw.
 * Any other value yields nothing: the caller handles those itself.
 */
export function useCustomImageUrl(value: string): CustomImageUrl {
  const id = parseCustomImageValue(value);
  const [state, setState] = useState<(CustomImageUrl & { id: string }) | null>(null);

  useEffect(() => {
    if (!id) return;
    let live = true;
    let objectUrl: string | null = null;
    void loadImage(id).then((result) => {
      if (!live || !result.ok) return;
      if (!result.value) {
        setState({ id, url: null, missing: true });
        return;
      }
      objectUrl = URL.createObjectURL(result.value.blob);
      setState({ id, url: objectUrl, missing: false });
    });
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setState(null); // the URL above is gone: never hand it out again
    };
  }, [id]);

  if (!id || state?.id !== id) return { url: null, missing: false };
  return { url: state.url, missing: state.missing };
}
