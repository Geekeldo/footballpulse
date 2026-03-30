import { Metadata } from 'next';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { supabaseAdmin } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { lang: string; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: team } = await supabaseAdmin
    .from('teams').select('name, bio, country').eq('slug', params.slug).single();

  if (!team) return {};
  const bio = (team.bio as any)?.[params.lang] || (team.bio as any)?.en || {};
  return {
    title: `${team.name} — ${bio.description?.slice(0, 60) || 'Football Club'}`,
    description: bio.description || `${team.name} football team profile, stats and news.`,
  };
}

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

function safeHtml(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.replace(/\n/g, '<br/>');
  if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('<br/>');
  return String(value);
}

export default async function TeamPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const { data: team } = await supabaseAdmin
    .from('teams').select('*').eq('slug', params.slug).single();

  if (!team) notFound();

  const bio = (team.bio as any)?.[lang] || (team.bio as any)?.en || {};
  const tr = t(lang);

  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, slug, lang, title, excerpt, cover_image, category, tags, views, published_at')
    .eq('lang', lang)
    .eq('status', 'published')
    .ilike('title', `%${team.name.split(' ').slice(-1)[0]}%`)
    .order('published_at', { ascending: false })
    .limit(6);

  const { data: allTeams } = await supabaseAdmin
    .from('teams')
    .select('name, slug, logo, country')
    .neq('slug', params.slug)
    .order('name')
    .limit(12);

  const lb = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      history: { fr: 'Histoire', en: 'History', ar: 'التاريخ', es: 'Historia' },
      honours: { fr: 'Palmarès', en: 'Honours', ar: 'الإنجازات', es: 'Palmarés' },
      style: { fr: 'Style de jeu', en: 'Playing style', ar: 'أسلوب اللعب', es: 'Estilo de juego' },
      rivals: { fr: 'Rivaux', en: 'Rivals', ar: 'المنافسون', es: 'Rivales' },
      news: { fr: 'Actualités', en: 'Latest news', ar: 'آخر الأخبار', es: 'Noticias' },
      teams: { fr: 'Autres équipes', en: 'Other teams', ar: 'فرق أخرى', es: 'Otros equipos' },
      founded: { fr: 'Fondé en', en: 'Founded', ar: 'تأسس', es: 'Fundado' },
      stadium: { fr: 'Stade', en: 'Stadium', ar: 'الملعب', es: 'Estadio' },
      capacity: { fr: 'Capacité', en: 'Capacity', ar: 'السعة', es: 'Capacidad' },
    };
    return labels[key]?.[lang] || labels[key]?.en || key;
  };

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--muted)' }}>
          <Link href={`/${lang}`} className="hover-underline">{tr.home}</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)' }}>{team.name}</span>
        </nav>

        <div className="flex items-center gap-5 mb-8 anim-up">
          {team.logo && (
            <img src={team.logo} alt={team.name} className="w-20 h-20 md:w-24 md:h-24 object-contain" />
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: 'var(--ink)' }}>
              {team.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{team.country}</p>
            {bio.description && (
              <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                {typeof bio.description === 'string' ? bio.description : String(bio.description)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <div className="grid grid-cols-3 gap-3 mb-8 anim-up d2">
              {team.founded && (
                <div className="card px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('founded')}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: 'var(--ink)' }}>{team.founded}</div>
                </div>
              )}
              {team.venue_name && (
                <div className="card px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('stadium')}</div>
                  <div className="text-sm font-bold mt-1 truncate" style={{ color: 'var(--ink)' }}>{team.venue_name}</div>
                </div>
              )}
              {team.venue_capacity && (
                <div className="card px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('capacity')}</div>
                  <div className="text-xl font-bold mt-1" style={{ color: 'var(--ink)' }}>{team.venue_capacity?.toLocaleString()}</div>
                </div>
              )}
            </div>

            {bio.history && (
              <section className="mb-8 anim-up d3">
                <div className="section-header"><h2>{lb('history')}</h2></div>
                <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: safeHtml(bio.history) }} />
              </section>
            )}

            {bio.honours && (
              <section className="mb-8 anim-up d4">
                <div className="section-header"><h2>{lb('honours')}</h2></div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}
                  dangerouslySetInnerHTML={{ __html: safeHtml(bio.honours) }} />
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 anim-up d5">
              {bio.style && (
                <div className="card px-5 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{lb('style')}</h3>
                  <p className="text-sm" style={{ color: 'var(--ink)', lineHeight: 1.7 }}>
                    {typeof bio.style === 'string' ? bio.style : String(bio.style)}
                  </p>
                </div>
              )}
              {bio.rivals && (
                <div className="card px-5 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{lb('rivals')}</h3>
                  <p className="text-sm" style={{ color: 'var(--ink)', lineHeight: 1.7 }}>
                    {typeof bio.rivals === 'string' ? bio.rivals : Array.isArray(bio.rivals) ? bio.rivals.join(', ') : String(bio.rivals)}
                  </p>
                </div>
              )}
            </div>

            {articles && articles.length > 0 && (
              <section className="anim-up d6">
                <div className="section-header"><h2>{lb('news')} — {team.name}</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((a: any) => (
                    <ArticleCard key={a.id} {...a} lang={lang} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="card">
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>{lb('teams')}</span>
                </div>
                <div>
                  {(allTeams || []).map((t: any) => (
                    <Link key={t.slug} href={`/${lang}/team/${t.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--paper-warm)] transition-colors text-sm"
                      style={{ borderBottom: '1px solid var(--border)', color: 'var(--ink)' }}>
                      {t.logo && <img src={t.logo} alt="" className="w-5 h-5" />}
                      <span className="truncate font-medium">{t.name}</span>
                      <span className="text-[10px] ml-auto" style={{ color: 'var(--muted)' }}>{t.country}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link href={`/${lang}/livescore`}
                className="block card px-4 py-3 text-center text-sm font-bold uppercase tracking-wider hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>
                {lang === 'fr' ? 'Scores en direct' : 'Live scores'}
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}