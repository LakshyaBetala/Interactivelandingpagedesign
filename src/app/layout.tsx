import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0D0D0D',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://almmatix.com'),
  title: 'Almmatix — AI Voice Agents, WhatsApp Automation & Web Development',
  description:
    'Almmatix builds AI voice agents, WhatsApp automation bots, RAG systems, and custom web platforms for enterprises. Engineered to scale. Start your project today.',
  keywords: [
    'AI voice agents',
    'WhatsApp automation',
    'RAG systems',
    'web development agency',
    'AI automation India',
    'enterprise automation',
    'custom CRM',
    'Almmatix',
  ],
  authors: [{ name: 'Almmatix' }],
  creator: 'Almmatix',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://almmatix.com',
    siteName: 'Almmatix',
    title: 'Almmatix — AI Voice Agents, WhatsApp Automation & Web Development',
    description:
      'We build AI voice agents, WhatsApp bots, RAG systems & web platforms for enterprises that refuse to stay manual.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Almmatix — Deep-Tech Infrastructure Studio',
    description:
      'AI voice agents, WhatsApp automation, RAG systems & web platforms — engineered to scale.',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { OrganizationSchema, WebSiteSchema, ServicesSchema } from '@/components/SchemaMarkup';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        <OrganizationSchema />
        <WebSiteSchema />
        <ServicesSchema />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
