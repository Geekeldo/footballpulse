import type { Article } from './supabase';
import type { Lang } from './i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site';
const SITE_NAME = 'FootballPulse';

export function generateArticleMeta(article: Article) {
  const url = `${SITE_URL}/${article.lang}/${article.slug}`;
  return {
    title: `${article.title} | ${SITE_NAME}`,
    description: article.meta_description,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.meta_description,
      url,
      siteName: SITE_NAME,
      images: article.cover_image
        ? [{ url: article.cover_image, width: 1200, height: 630, alt: article.title }]
        : [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
      locale: article.lang === 'ar' ? 'ar_SA' : article.lang === 'es' ? 'es_ES' : article.lang === 'en' ? 'en_US' : 'fr_FR',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      section: article.category,
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.meta_description,
      images: article.cover_image ? [article.cover_image] : [`${SITE_URL}/og-default.png`],
    },
    alternates: {
      canonical: url,
      languages: {
        'fr': `${SITE_URL}/fr/${article.slug}`,
        'en': `${SITE_URL}/en/${article.slug}`,
        'ar': `${SITE_URL}/ar/${article.slug}`,
        'es': `${SITE_URL}/es/${article.slug}`,
        'x-default': `${SITE_URL}/fr/${article.slug}`,
      },
    },
  };
}

export function generateHomeMeta(lang: Lang) {
  const descriptions: Record<Lang, string> = {
    fr: 'FootballPulse - L\'actualité football en temps réel. Transferts, analyses tactiques, résultats et classements des plus grands championnats.',
    en: 'FootballPulse - Real-time football news. Transfers, tactical analysis, results and standings from the biggest leagues worldwide.',
    ar: 'فوتبول بالس - أخبار كرة القدم في الوقت الفعلي. الانتقالات والتحليلات التكتيكية والنتائج من أكبر الدوريات.',
    es: 'FootballPulse - Noticias de fútbol en tiempo real. Fichajes, análisis táctico, resultados y clasificaciones de las mejores ligas.',
  };

  return {
    title: `${SITE_NAME} - ${lang === 'fr' ? 'Actualité Football' : lang === 'en' ? 'Football News' : lang === 'ar' ? 'أخبار كرة القدم' : 'Noticias de Fútbol'}`,
    description: descriptions[lang],
    openGraph: {
      type: 'website',
      title: SITE_NAME,
      description: descriptions[lang],
      url: `${SITE_URL}/${lang}`,
      siteName: SITE_NAME,
      images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: descriptions[lang],
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        'fr': `${SITE_URL}/fr`,
        'en': `${SITE_URL}/en`,
        'ar': `${SITE_URL}/ar`,
        'es': `${SITE_URL}/es`,
        'x-default': `${SITE_URL}/fr`,
      },
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
      sameAs: [
        'https://twitter.com/footballpulse',
        'https://facebook.com/footballpulse',
        'https://instagram.com/footballpulse',
      ],
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
