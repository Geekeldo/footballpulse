import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { generateHomeMeta } from '@/lib/seo';
import { type Lang, SUPPORTED_LANGS, t, isRTL, CATEGORIES } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { AdUnit } from '@/components/AdUnit';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { lang: string }; searchParams: { cat?: string; page?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) return {};
  return generateHomeMeta(lang);
}

export const revalidate = 300;

export default async function LangHomePage({ params, searchParams }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) redirect('/fr');

  const tr = t(lang);
  const category = searchParams.cat;
  const page = parseInt(searchParams.page || '1');
  const limit = 13;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('articles')
    .select('id, slug, lang, title, excerpt, cover_image, category, tags, views, published_at', { count: 'exact' })
    .eq('lang', lang).eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== 'all') query = query.eq('category', category);

  const { data: articles, count } = await query;
  const totalPages = Math.ceil((count || 0) / limit);
  const featured = articles?.[0];
  const secondary = articles?.slice(1, 4) || [];
  const rest = articles?.slice(4) || [];

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />

      <main className="max-w-7xl mx-auto px-4">
        {/* Category pills */}
        <div className="flex items-center gap-3 py-6 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
          <Link href={`/${lang}`}
            className="shrink-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all"
            style={{
              background: !category ? 'var(--ink)' : 'transparent',
              color: !category ? 'var(--paper)' : 'var(--muted)',
              border: !category ? 'none' : '1px solid var(--border)',
              borderRadius: '2px',
            }}>
            {tr.allCategories}
          </Link>
          {CATEGORIES.map(cat => (
            <Link key={cat} href={`/${lang}?cat=${cat}`}
              className="shrink-0 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all"
              style={{
                background: category === cat ? 'var(--ink)' : 'transparent',
                color: category === cat ? 'var(--paper)' : 'var(--muted)',
                border: category === cat ? 'none' : '1px solid var(--border)',
                borderRadius: '2px',
              }}>
              {cat.replace('-', ' ')}
            </Link>
          ))}
        </div>

        {/* Section title */}
        <div className="py-8">
          <h1 className="font-display text-4xl md:text-5xl anim-up" style={{ color: 'var(--ink)' }}>
            {category ? category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : tr.latest}
          </h1>
          <div className="editorial-rule-thick mt-4" style={{ maxWidth: '60px' }} />
        </div>

        {/* Featured hero */}
        {featured && (
          <section className="mb-8">
            <ArticleCard {...featured} lang={lang} featured />
          </section>
        )}

        {/* 3-column secondary row */}
        {secondary.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8" style={{ borderTop: '1px solid var(--border)' }}>
            {secondary.map((a, i) => (
              <div key={a.id} className={`anim-up d${i + 2}`}>
                <ArticleCard {...a} lang={lang} />
              </div>
            ))}
          </section>
        )}

        {/* Ad placement */}
        <AdUnit className="my-4" />

        {/* Rest of articles — mixed layout */}
        {rest.length > 0 && (
          <section className="py-8" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
              {/* Main column */}
              <div className="space-y-0">
                {rest.slice(0, 6).map((a, i) => (
                  <div key={a.id} className={`anim-up d${i + 1}`}>
                    <ArticleCard {...a} lang={lang} variant="horizontal" />
                  </div>
                ))}
              </div>
              {/* Sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>
                    {tr.trending}
                  </h3>
                  <div className="editorial-rule-thick mb-4" style={{ maxWidth: '30px' }} />
                  {rest.slice(6).map((a, i) => (
                    <div key={a.id} className={`anim-up d${i + 4}`}>
                      <ArticleCard {...a} lang={lang} variant="minimal" />
                    </div>
                  ))}
                  <AdUnit className="mt-8" />
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-10" style={{ borderTop: '1px solid var(--border)' }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <Link key={p} href={`/${lang}?${category ? `cat=${category}&` : ''}page=${p}`}
                className="w-10 h-10 flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: p === page ? 'var(--ink)' : 'transparent',
                  color: p === page ? 'var(--paper)' : 'var(--ink)',
                  border: '1px solid var(--border)',
                  borderRadius: '2px',
                }}>
                {p}
              </Link>
            ))}
          </div>
        )}

        {articles?.length === 0 && (
          <div className="text-center py-32 anim-up">
            <div className="font-display text-6xl mb-4" style={{ color: 'var(--border-strong)' }}>FP</div>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>{tr.noResults}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Articles will appear here once the AI cron starts publishing.</p>
          </div>
        )}
      </main>

      <Footer lang={lang} />
    </div>
  );
}
