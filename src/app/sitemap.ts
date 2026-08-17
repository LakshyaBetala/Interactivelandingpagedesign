import { MetadataRoute } from 'next';

const SITE = 'https://www.almmatix.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      // Plain-text product and metrics summary for LLM retrieval.
      url: `${SITE}/llms.txt`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
