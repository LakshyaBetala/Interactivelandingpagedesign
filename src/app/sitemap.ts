import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://almmatix.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://almmatix.com/debug-html',
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.1,
    },
  ];
}
