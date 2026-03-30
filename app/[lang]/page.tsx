import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { generateHomeMeta } from '@/lib/seo';
import { type Lang, SUPPORTED_LANGS, t, isRTL, CATEGORIES } from '@/lib/i18n';
import { fetchLiveScores, fetchStandings, LEAGUES } from '@/lib/football-api';
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

  // Fetch sidebar data (scores + standings) — don't fail if API is down
  let todayMatches: any[] = [];
  let topStandings: any[] = [];
  try {
    [todayMatches, topStandings] = await Promise.all([
      fetchLiveScores().catch(() => []),
      fetchStandings(39).catch(() => []), // Premier League by default
    ]);
  } catch {}

  const liveCount = todayMatches.filter((m: any) => ['1H', '2H', 'HT', 'ET', 'PEN'].includes(m.fixture?.status?.short)).length;

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />

      <main className="max-w-7xl mx-auto px-4 py-5">
        {/* Category pills */}
        <div className="flex items-center gap-2 pb-4 overflow-x-auto scrollbar-hide">
          <Link href={`/${lang}`}
            className="badge shrink-0 transition-all"
            style={{
              background: !category ? 'var(--ink)' : 'var(--paper-warm)',
              color: !category ? 'white' : 'var(--muted)',
            }}>
            {tr.allCategories}
          </Link>
          {CATEGORIES.map(cat => (
            <Link key={cat} href={`/${lang}?cat=${cat}`}
              className="badge shrink-0 transition-all capitalize"
              style={{
                background: category === cat ? 'var(--ink)' : 'var(--paper-warm)',
                color: category === cat ? 'white' : 'var(--muted)',
              }}>
              {cat.replace('-', ' ')}
            </Link>
          ))}
        </div>

        {/* Main grid: content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* LEFT: Main content */}
          <div>
            {/* Featured hero */}
            {featured && (
              <section className="mb-5 anim-up">
                <ArticleCard {...featured} lang={lang} featured />
              </section>
            )}

            {/* 3 secondary cards */}
            {secondary.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {secondary.map((a, i) => (
                  <div key={a.id} className={`anim-up d${i + 2}`}>
                    <ArticleCard {...a} lang={lang} />
                  </div>
                ))}
              </section>
            )}

            <AdUnit className="mb-5" />

            {/* Section header */}
            <div className="section-header">
              <h2>{category ? category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : tr.latest}</h2>
            </div>

            {/* Rest of articles — list style */}
            {rest.length > 0 ? (
              <div className="space-y-0">
                {rest.map((a, i) => (
                  <div key={a.id} className={`anim-up d${Math.min(i + 1, 8)}`}>
                    <ArticleCard {...a} lang={lang} variant="horizontal" />
                  </div>
                ))}
              </div>
            ) : articles?.length === 0 && (
              <div className="text-center py-20 anim-up">
                <p className="text-4xl font-extrabold mb-2" style={{ color: 'var(--border)' }}>FP</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{tr.noResults}</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1 pt-8">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={`/${lang}?${category ? `cat=${category}&` : ''}page=${p}`}
                    className="w-9 h-9 flex items-center justify-center text-xs font-bold rounded transition-all"
                    style={{
                      background: p === page ? 'var(--ink)' : 'var(--paper-warm)',
                      color: p === page ? 'white' : 'var(--ink)',
                    }}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="hidden lg:block space-y-5">
            <div className="sticky top-4 space-y-5">

              {/* Live scores widget */}
              <div className="card">
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    {liveCount > 0 && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'pulseDot 1.5s ease infinite' }} />}
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                      {lang === 'fr' ? 'Scores du jour' : lang === 'ar' ? 'نتائج اليوم' : lang === 'es' ? 'Marcadores' : "Today's scores"}
                    </span>
                  </div>
                  <Link href={`/${lang}/livescore`} className="text-[10px] font-bold uppercase" style={{ color: 'var(--accent)' }}>
                    {lang === 'fr' ? 'Tout voir' : 'See all'}
                  </Link>
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {todayMatches.slice(0, 8).map((m: any) => {
                    const live = ['1H', '2H', 'HT', 'ET', 'PEN'].includes(m.fixture?.status?.short);
                    return (
                      <div key={m.id} className="flex items-center px-4 py-2 hover:bg-[var(--paper-warm)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="w-10 shrink-0 text-center">
                          {live ? (
                            <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>{m.fixture.status.elapsed}'</span>
                          ) : m.fixture?.status?.short === 'FT' ? (
                            <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>FT</span>
                          ) : (
                            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                              {new Date(m.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-[12px]">
                          <div className="flex justify-between">
                            <span className="truncate" style={{ color: 'var(--ink)', fontWeight: m.teams?.home?.winner ? 700 : 400 }}>{m.teams?.home?.name}</span>
                            <span className="font-bold ml-2" style={{ color: live ? 'var(--accent)' : 'var(--ink)' }}>{m.goals?.home ?? '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="truncate" style={{ color: 'var(--ink)', fontWeight: m.teams?.away?.winner ? 700 : 400 }}>{m.teams?.away?.name}</span>
                            <span className="font-bold ml-2" style={{ color: live ? 'var(--accent)' : 'var(--ink)' }}>{m.goals?.away ?? '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {todayMatches.length === 0 && (
                    <p className="px-4 py-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
                      {lang === 'fr' ? 'Aucun match aujourd\'hui' : 'No matches today'}
                    </p>
                  )}
                </div>
              </div>

              {/* Standings widget */}
              <div className="card">
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>Premier League</span>
                  <Link href={`/${lang}/standings/premier-league`} className="text-[10px] font-bold uppercase" style={{ color: 'var(--accent)' }}>
                    {lang === 'fr' ? 'Complet' : 'Full'}
                  </Link>
                </div>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="py-2 px-3 text-left font-semibold" style={{ color: 'var(--muted)', width: '24px' }}>#</th>
                      <th className="py-2 text-left font-semibold" style={{ color: 'var(--muted)' }}>Team</th>
                      <th className="py-2 px-2 text-center font-semibold" style={{ color: 'var(--muted)', width: '28px' }}>P</th>
                      <th className="py-2 px-2 text-center font-semibold" style={{ color: 'var(--muted)', width: '28px' }}>GD</th>
                      <th className="py-2 px-3 text-center font-semibold" style={{ color: 'var(--ink)', width: '32px' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStandings.slice(0, 8).map((team: any) => (
                      <tr key={team.team.id} className="hover:bg-[var(--paper-warm)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-1.5 px-3 font-bold" style={{ color: team.rank <= 4 ? 'var(--accent)' : 'var(--muted)' }}>{team.rank}</td>
                        <td className="py-1.5">
                          <div className="flex items-center gap-1.5">
                            {team.team.logo && <img src={team.team.logo} alt="" className="w-4 h-4" />}
                            <span className="truncate font-medium" style={{ color: 'var(--ink)' }}>{team.team.name}</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-center" style={{ color: 'var(--muted)' }}>{team.played}</td>
                        <td className="py-1.5 px-2 text-center" style={{ color: team.goalsDiff > 0 ? 'var(--green)' : team.goalsDiff < 0 ? 'var(--accent)' : 'var(--muted)' }}>
                          {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                        </td>
                        <td className="py-1.5 px-3 text-center font-bold" style={{ color: 'var(--ink)' }}>{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {topStandings.length === 0 && (
                  <p className="px-4 py-6 text-center text-xs" style={{ color: 'var(--muted)' }}>Loading...</p>
                )}
              </div>

              {/* Quick league links */}
              <div className="card px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--muted)' }}>
                  {lang === 'fr' ? 'Classements' : 'Standings'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LEAGUES.slice(0, 8).map(league => (
                    <Link key={league.slug} href={`/${lang}/standings/${league.slug}`}
                      className="text-[11px] font-medium px-2 py-1 rounded hover:bg-[var(--paper-warm)] transition-colors"
                      style={{ color: 'var(--ink)', background: 'var(--paper-warm)' }}>
                      {league.name}
                    </Link>
                  ))}
                </div>
              </div>

              <AdUnit />
            </div>
          </aside>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
}