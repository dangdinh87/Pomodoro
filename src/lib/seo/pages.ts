/**
 * The indexable pages and the day each one's content last changed. The sitemap's <lastmod> and
 * the visible "Last updated" date of the page both read these, so they cannot drift.
 *
 * Bump the date when the page's content changes (copy, not styling), in the same commit.
 * Never use `new Date()`: a lastmod that changes on every build tells Google nothing, and it
 * learns to ignore the whole sitemap.
 */
export const PAGE_UPDATED = {
  home: '2026-10-05',
  guide: '2026-10-05',
  /** Privacy policy and terms of service are dated together. */
  legal: '2026-10-02',
} as const;

export interface IndexablePage {
  /** Page path without a language prefix. Every page exists in every supported language. */
  path: string;
  /** ISO date (YYYY-MM-DD) of the last content change. */
  lastModified: string;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

export const INDEXABLE_PAGES: readonly IndexablePage[] = [
  { path: '/', lastModified: PAGE_UPDATED.home, changeFrequency: 'weekly', priority: 1 },
  { path: '/guide', lastModified: PAGE_UPDATED.guide, changeFrequency: 'monthly', priority: 0.8 },
  { path: '/privacy', lastModified: PAGE_UPDATED.legal, changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', lastModified: PAGE_UPDATED.legal, changeFrequency: 'yearly', priority: 0.3 },
];
