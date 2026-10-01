import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.pomodoro-focus.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only non-page paths are disallowed. App/auth pages carry
        // `robots: { index: false }` metadata, which crawlers must be able to
        // fetch to see.
        disallow: ['/api/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
