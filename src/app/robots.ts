import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://improcode.com';

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
