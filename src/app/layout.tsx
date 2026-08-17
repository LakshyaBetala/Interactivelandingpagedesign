import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale/userScalable — pinch-zoom must stay available (WCAG 1.4.4).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E6DFD5" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0D0D" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.almmatix.in"),

  title: {
    default: "Almmatix",
    template: "%s | Almmatix",
  },

  description:
    "Almmatix builds AI voice agents, WhatsApp automation, Tally & ERP integrations, RAG systems, and custom web platforms for enterprises. Makers of ASVA and DoItForMe.in.",


  authors: [{ name: "Almmatix" }],
  creator: "Almmatix",
  publisher: "Almmatix",

  icons: {
    icon: "/images/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },

  alternates: {
    canonical: "https://www.almmatix.in",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.almmatix.in",

    siteName: "Almmatix",

    title:
      "Almmatix — AI Voice Agents, WhatsApp Automation & Web Development",

    description:
      "We build AI voice agents, WhatsApp bots, RAG systems & web platforms for enterprises that refuse to stay manual.",

    images: [
      {
        url: "/images/og_logo.png",
        width: 1200,
        height: 630,
        alt: "Almmatix",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Almmatix — Deep-Tech Infrastructure Studio",

    description:
      "AI voice agents, WhatsApp automation, RAG systems & web platforms — engineered to scale.",

    images: ["/images/og_logo.png"],
  },
};

import {
  OrganizationSchema,
  WebSiteSchema,
  ServicesSchema,
  ProductsSchema,
  FAQSchema,
} from "@/components/SchemaMarkup";
import MotionProvider from "@/components/MotionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts are render-blocking third-party requests — warm the connections first. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        suppressHydrationWarning
        className="antialiased font-sans">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <OrganizationSchema />
        <WebSiteSchema />
        <ServicesSchema />
        <ProductsSchema />
        <FAQSchema />
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
