export type GaConfig = { kind: 'gtag'; id: string } | { kind: 'gtm'; id: string };

/** `G-…` is a GA4 measurement ID (gtag.js); `GTM-…` is a Tag Manager container. Nothing else is rendered. */
const GA_ID_PATTERN = /^(G|GTM)-[A-Z0-9]+$/;

/**
 * Validates NEXT_PUBLIC_GA_ID before it reaches a script tag. A malformed value
 * (a typo, or two lines of an env file run together) must switch tracking off,
 * not be written into inline JavaScript.
 */
export function parseGaId(raw: string | undefined | null): GaConfig | null {
  const id = raw?.trim();
  if (!id || !GA_ID_PATTERN.test(id)) return null;
  return id.startsWith('GTM-') ? { kind: 'gtm', id } : { kind: 'gtag', id };
}
