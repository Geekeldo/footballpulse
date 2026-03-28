/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'hourly',
  priority: 0.8,
  exclude: ['/admin', '/admin/*', '/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://footballpulse.site/sitemap.xml',
    ],
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
      { userAgent: 'Googlebot', allow: '/' },
    ],
  },
  alternateRefs: [
    { href: 'https://footballpulse.site/fr', hreflang: 'fr' },
    { href: 'https://footballpulse.site/en', hreflang: 'en' },
    { href: 'https://footballpulse.site/ar', hreflang: 'ar' },
    { href: 'https://footballpulse.site/es', hreflang: 'es' },
  ],
};
