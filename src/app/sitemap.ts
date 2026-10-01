import { MetadataRoute } from 'next';

// Static generation at build time; lastModified = build time
export const dynamic = 'force-static';

// Indexable pages only (no login-only/app/auth pages, no retired /progress, /focus)
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pomodoro-focus.site';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/timer`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/guide`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
