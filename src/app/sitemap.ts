import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.almmatix.in',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.almmatix.in/debug-html',
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.1,
    },
  ];
}
