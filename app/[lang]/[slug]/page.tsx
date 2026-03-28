import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { generateArticleMeta, generateBreadcrumbSchema, estimateReadTime } from '@/lib/seo';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { AdUnit, ArticleWithAds, ShareButtons } from '@/components/AdUnit';
import { format } from 'date-fns';
import { fr, enUS, ar, es } from 'date-fns/locale';
import Link from 'next/link';

const localeMap = { fr, en: enUS, ar, es };
type Props = { params: { lang: string; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabaseAdmin.from('articles').select('*')
    .eq('slug', params.slug).eq('lang', params.lang).eq('status', 'published').single();
  if (!data) return {};
  return generateArticleMeta(data);
}

export const revalidate = 600;

export default async function ArticlePage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();
  const tr = t(lang);
  const locale = localeMap[lang] || enUS;

  const { data: article } = await supabaseAdmin.from('articles').select('*')
    .eq('slug', params.slug).eq('lang', lang).eq('status', 'published').single();
  if (!article) notFound();

  // ✅ CORRIGÉ : fire-and-forget avec .then() au lieu de .catch()
  supabaseAdmin
    .rpc('increment_views', { article_slug: params.slug, article_lang: lang })
    .then(({ error }) => {
      if (error) console.error('[Views] increment failed:', error.message);
    });

  const { data: related } = await supabaseAdmin.from('articles')
    .select('id, slug, lang, title, excerpt, cover_image, category, tags, views, published_at')
    .eq('lang', lang).eq('status', 'published').eq('category', article.category)
    .neq('id', article.id).order('published_at', { ascending: false }).limit(3);

  const { data: translations } = article.translation_group
    ? await supabaseAdmin.from('articles').select('slug, lang').eq('translation_group', article.translation_group).neq('lang', lang)
    : { data: [] };

  const readTime = estimateReadTime(article.content);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site';
  const articleUrl = `${siteUrl}/${lang}/${article.slug}`;
  const breadcrumb = generateBreadcrumbSchema([
    { name: tr.home, url: `${siteUrl}/${lang}` },
    { name: article.category, url: `${siteUrl}/${lang}?cat=${article.category}` },
    { name: article.title, url: articleUrl },
  ]);

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article.schema_json) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header lang={lang} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8 anim-up" style={{ color: 'var(--muted)' }}>
          <Link href={`/${lang}`} className="hover-underline">{tr.home}</Link>
          <span>/</span>
          <Link href={`/${lang}?cat=${article.category}`} className="hover-underline capitalize">{article.category.replace('-', ' ')}</Link>
        </nav>

        {/* Article header */}
        <header className="mb-10 anim-up d2">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white mb-5"
            style={{ background: 'var(--accent)', borderRadius: '2px' }}>
            {article.category.replace('-', ' ')}
          </span>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-6" style={{ color: 'var(--ink)' }}>
            {article.title}
          </h1>

          <p className="text-lg md:text-xl leading-relaxed mb-6" style={{ color: 'var(--muted)' }}>
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-4 text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              <span>{format(new Date(article.published_at), 'PPP', { locale })}</span>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
              <span>{readTime} {tr.readTime}</span>
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
              <span>{article.views.toLocaleString()} {tr.views}</span>
            </div>
            <div className="ml-auto"><ShareButtons title={article.title} url={articleUrl} lang={lang} /></div>
          </div>

          {/* Translation links */}
          {translations && translations.length > 0 && (
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span style={{ color: 'var(--muted)' }}>Also in:</span>
              {translations.map((tr: any) => (
                <Link key={tr.lang} href={`/${tr.lang}/${tr.slug}`}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-70"
                  style={{ border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--ink)' }}>
                  {tr.lang}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Cover image */}
        {article.cover_image && (
          <figure className="mb-10 anim-scale d3" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img src={article.cover_image} alt={article.title} className="w-full aspect-[16/9] object-cover" />
            {article.source_name && (
              <figcaption className="text-xs mt-3 italic" style={{ color: 'var(--muted)' }}>
                Source: {article.source_name}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article body */}
        <div className="anim-up d4">
          <ArticleWithAds content={article.content} lang={lang} />
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            {article.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 text-xs"
                style={{ border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--muted)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom share */}
        <div className="mt-8 pt-6 flex items-center justify-between" style={{ borderTop: '3px solid var(--ink)' }}>
          <span className="font-display text-lg italic" style={{ color: 'var(--muted)' }}>Share this story</span>
          <ShareButtons title={article.title} url={articleUrl} lang={lang} />
        </div>
      </main>

      {/* Related articles */}
      {related && related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12" style={{ borderTop: '1px solid var(--border)' }}>
          <h2 className="font-display text-3xl mb-2" style={{ color: 'var(--ink)' }}>{tr.relatedArticles}</h2>
          <div className="editorial-rule-thick mb-8" style={{ maxWidth: '40px' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((a: any, i: number) => (
              <div key={a.id} className={`anim-up d${i + 1}`}>
                <ArticleCard {...a} lang={lang} />
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer lang={lang} />
    </div>
  );
}