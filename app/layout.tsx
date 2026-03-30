// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { generateWebsiteSchema } from '@/lib/seo';
import FPAnalytics from '@/components/Analytics';  // ← AJOUTER

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site'),
  title: { default: 'FootballPulse — The Pulse of World Football', template: '%s — FootballPulse' },
  description: 'Breaking football news, transfers, tactical analysis and results from every major league worldwide.',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = generateWebsiteSchema();
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {adsenseId && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`} crossOrigin="anonymous" />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body>
        {children}
        <VercelAnalytics />    {/* Vercel Analytics — garde-le */}
        <SpeedInsights />      {/* Vercel Speed — garde-le */}
        <FPAnalytics />        {/* ← NOTRE tracking custom pour l'admin */}
      </body>
    </html>
  );
}