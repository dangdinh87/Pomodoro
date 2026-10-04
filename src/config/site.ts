/**
 * Canonical public origin (no trailing slash, no www). One place to change the
 * domain: metadata, sitemap, robots, JSON-LD and the default email sender all
 * read it. Override per environment with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://studywithbro.com').replace(/\/+$/, '');

export const SITE_HOST = new URL(SITE_URL).host;
