/**
 * Browser image format detection for AVIF/WebP.
 * Uses 1x1 pixel data URI tests — no network requests.
 * Call detectFormatSupport() once at app init, then use getBestImageUrl().
 */

// 1x1 pixel test images encoded as data URIs
const AVIF_TEST =
  'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAEOAAEAAAAAAAABGAAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAATmVwcm9wAAAAMGlwY28AAAAUaXNwZQAAAAAAAAACAAAAAgAAABBwaXhpAAAAAAMICAgAAAAJaXBtYQAAAAAAAAABAAEEAQKDBAAAABltZGF0EgAKBzgABokSJGfC8EBQ2A==';
const WEBP_TEST =
  'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

let _avif: boolean | null = null;
let _webp: boolean | null = null;

function testFormat(dataUri: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(false);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = dataUri;
  });
}

/** Detect AVIF + WebP support. Safe to call multiple times (no-op after first). */
export async function detectFormatSupport(): Promise<void> {
  if (_avif !== null) return;
  [_avif, _webp] = await Promise.all([
    testFormat(AVIF_TEST),
    testFormat(WEBP_TEST),
  ]);
}

export function isAvifSupported(): boolean {
  return _avif ?? false;
}

export function isWebpSupported(): boolean {
  return _webp ?? false;
}

/** Pick best URL from available sources based on detected browser support. */
export function getBestImageUrl(sources: {
  avif: string;
  webp: string;
}): string {
  if (_avif) return sources.avif;
  return sources.webp;
}
