import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/student/', '/api/'],
    },
    sitemap: 'https://www.onestopbeautyschool.org/sitemap.xml',
  };
}
