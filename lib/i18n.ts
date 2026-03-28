export const SUPPORTED_LANGS = ['fr', 'en', 'ar', 'es'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = 'fr';
export const RTL_LANGS: Lang[] = ['ar'];

export function isRTL(lang: Lang): boolean {
  return RTL_LANGS.includes(lang);
}

export function getLangName(lang: Lang): string {
  const names: Record<Lang, string> = {
    fr: 'Français',
    en: 'English',
    ar: 'العربية',
    es: 'Español',
  };
  return names[lang];
}

export function getLangFlag(lang: Lang): string {
  const flags: Record<Lang, string> = { fr: '🇫🇷', en: '🇬🇧', ar: '🇸🇦', es: '🇪🇸' };
  return flags[lang];
}

type TranslationKeys = {
  siteName: string;
  siteDescription: string;
  home: string;
  latest: string;
  trending: string;
  transfers: string;
  leagues: string;
  analysis: string;
  readMore: string;
  readTime: string;
  minutes: string;
  shareOn: string;
  relatedArticles: string;
  loadMore: string;
  search: string;
  noResults: string;
  categories: string;
  allCategories: string;
  publishedOn: string;
  by: string;
  views: string;
  footer: {
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    followUs: string;
    newsletter: string;
    copyright: string;
  };
  admin: {
    dashboard: string;
    articles: string;
    analytics: string;
    revenue: string;
    social: string;
    settings: string;
    publish: string;
    draft: string;
    totalViews: string;
    totalArticles: string;
    todayRevenue: string;
    topArticles: string;
  };
};

export const translations: Record<Lang, TranslationKeys> = {
  fr: {
    siteName: 'FootballPulse',
    siteDescription: 'L\'actualité football en temps réel - Transferts, analyses et résultats',
    home: 'Accueil',
    latest: 'Dernières News',
    trending: 'Tendances',
    transfers: 'Transferts',
    leagues: 'Championnats',
    analysis: 'Analyses',
    readMore: 'Lire la suite',
    readTime: 'min de lecture',
    minutes: 'min',
    shareOn: 'Partager sur',
    relatedArticles: 'Articles similaires',
    loadMore: 'Charger plus',
    search: 'Rechercher...',
    noResults: 'Aucun résultat trouvé',
    categories: 'Catégories',
    allCategories: 'Toutes',
    publishedOn: 'Publié le',
    by: 'par',
    views: 'vues',
    footer: {
      about: 'À propos',
      contact: 'Contact',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions d\'utilisation',
      followUs: 'Suivez-nous',
      newsletter: 'Newsletter',
      copyright: '© 2026 FootballPulse. Tous droits réservés.',
    },
    admin: {
      dashboard: 'Tableau de bord',
      articles: 'Articles',
      analytics: 'Analytiques',
      revenue: 'Revenus',
      social: 'Réseaux sociaux',
      settings: 'Paramètres',
      publish: 'Publier',
      draft: 'Brouillon',
      totalViews: 'Vues totales',
      totalArticles: 'Articles publiés',
      todayRevenue: 'Revenus du jour',
      topArticles: 'Top articles',
    },
  },
  en: {
    siteName: 'FootballPulse',
    siteDescription: 'Real-time football news - Transfers, analysis and results',
    home: 'Home',
    latest: 'Latest News',
    trending: 'Trending',
    transfers: 'Transfers',
    leagues: 'Leagues',
    analysis: 'Analysis',
    readMore: 'Read more',
    readTime: 'min read',
    minutes: 'min',
    shareOn: 'Share on',
    relatedArticles: 'Related articles',
    loadMore: 'Load more',
    search: 'Search...',
    noResults: 'No results found',
    categories: 'Categories',
    allCategories: 'All',
    publishedOn: 'Published on',
    by: 'by',
    views: 'views',
    footer: {
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      followUs: 'Follow us',
      newsletter: 'Newsletter',
      copyright: '© 2026 FootballPulse. All rights reserved.',
    },
    admin: {
      dashboard: 'Dashboard',
      articles: 'Articles',
      analytics: 'Analytics',
      revenue: 'Revenue',
      social: 'Social Media',
      settings: 'Settings',
      publish: 'Publish',
      draft: 'Draft',
      totalViews: 'Total Views',
      totalArticles: 'Published Articles',
      todayRevenue: 'Today\'s Revenue',
      topArticles: 'Top Articles',
    },
  },
  ar: {
    siteName: 'فوتبول بالس',
    siteDescription: 'أخبار كرة القدم في الوقت الفعلي - الانتقالات والتحليلات والنتائج',
    home: 'الرئيسية',
    latest: 'آخر الأخبار',
    trending: 'الأكثر رواجاً',
    transfers: 'الانتقالات',
    leagues: 'الدوريات',
    analysis: 'التحليلات',
    readMore: 'اقرأ المزيد',
    readTime: 'دقائق للقراءة',
    minutes: 'دقيقة',
    shareOn: 'شارك على',
    relatedArticles: 'مقالات ذات صلة',
    loadMore: 'تحميل المزيد',
    search: 'بحث...',
    noResults: 'لم يتم العثور على نتائج',
    categories: 'التصنيفات',
    allCategories: 'الكل',
    publishedOn: 'نُشر في',
    by: 'بواسطة',
    views: 'مشاهدات',
    footer: {
      about: 'عن الموقع',
      contact: 'اتصل بنا',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
      followUs: 'تابعنا',
      newsletter: 'النشرة الإخبارية',
      copyright: '© 2026 فوتبول بالس. جميع الحقوق محفوظة.',
    },
    admin: {
      dashboard: 'لوحة التحكم',
      articles: 'المقالات',
      analytics: 'التحليلات',
      revenue: 'الإيرادات',
      social: 'وسائل التواصل',
      settings: 'الإعدادات',
      publish: 'نشر',
      draft: 'مسودة',
      totalViews: 'إجمالي المشاهدات',
      totalArticles: 'المقالات المنشورة',
      todayRevenue: 'إيرادات اليوم',
      topArticles: 'أفضل المقالات',
    },
  },
  es: {
    siteName: 'FootballPulse',
    siteDescription: 'Noticias de fútbol en tiempo real - Fichajes, análisis y resultados',
    home: 'Inicio',
    latest: 'Últimas Noticias',
    trending: 'Tendencias',
    transfers: 'Fichajes',
    leagues: 'Ligas',
    analysis: 'Análisis',
    readMore: 'Leer más',
    readTime: 'min de lectura',
    minutes: 'min',
    shareOn: 'Compartir en',
    relatedArticles: 'Artículos relacionados',
    loadMore: 'Cargar más',
    search: 'Buscar...',
    noResults: 'No se encontraron resultados',
    categories: 'Categorías',
    allCategories: 'Todas',
    publishedOn: 'Publicado el',
    by: 'por',
    views: 'vistas',
    footer: {
      about: 'Acerca de',
      contact: 'Contacto',
      privacy: 'Política de privacidad',
      terms: 'Términos de servicio',
      followUs: 'Síguenos',
      newsletter: 'Boletín',
      copyright: '© 2026 FootballPulse. Todos los derechos reservados.',
    },
    admin: {
      dashboard: 'Panel',
      articles: 'Artículos',
      analytics: 'Analíticas',
      revenue: 'Ingresos',
      social: 'Redes sociales',
      settings: 'Configuración',
      publish: 'Publicar',
      draft: 'Borrador',
      totalViews: 'Vistas totales',
      totalArticles: 'Artículos publicados',
      todayRevenue: 'Ingresos de hoy',
      topArticles: 'Artículos top',
    },
  },
};

export function t(lang: Lang): TranslationKeys {
  return translations[lang] || translations[DEFAULT_LANG];
}

export const CATEGORIES = [
  'transfers', 'leagues', 'analysis', 'champions-league',
  'premier-league', 'la-liga', 'serie-a', 'bundesliga',
  'ligue-1', 'world-cup', 'africa', 'general',
] as const;
