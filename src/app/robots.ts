import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.pomodoro-focus.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/timer/', '/tasks/', '/history/', '/chat/', '/settings/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
