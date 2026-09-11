import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/reports', '/about', '/safety'],
        disallow: [
          '/admin',
          '/admin/*',
          '/manage',
          '/manage/*',
          '/api',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://redflaggers.vercel.app/sitemap.xml',
  };
}
