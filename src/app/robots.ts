import { MetadataRoute } from 'next';

const SITE = 'https://www.almmatix.in';

/** Never crawl: the CRM portal, and a stale duplicate-content debug page. */
const DISALLOW = ['/portal', '/portal/', '/debug-html'];

/**
 * AI crawlers are opt-in by convention — several of them (Google-Extended,
 * Applebot-Extended, Claude-User) treat an absent rule as permission to skip,
 * and site owners commonly block them wholesale. We want the opposite: these
 * agents are how ASVA and DoItForMe get cited in AI answers, so every one of
 * them is named and allowed explicitly.
 */
const AI_CRAWLERS = [
  // OpenAI — training, search index, and user-triggered fetches
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  // Google Gemini / Vertex grounding (separate from Googlebot)
  'Google-Extended',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Apple Intelligence
  'Applebot',
  'Applebot-Extended',
  // Meta AI
  'meta-externalagent',
  'FacebookBot',
  // Microsoft Copilot
  'bingbot',
  // Others that feed retrieval and training corpora
  'Amazonbot',
  'CCBot',
  'cohere-ai',
  'MistralAI-User',
  'DuckAssistBot',
  'Bytespider',
  'Diffbot',
  'omgilibot',
  'Timpibot',
  'YouBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
