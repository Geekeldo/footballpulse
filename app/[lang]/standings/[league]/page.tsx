import { Metadata } from 'next';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { fetchStandings, fetchFixtures, fetchResults, getLeagueBySlug, LEAGUES } from '@/lib/football-api';
import { supabaseAdmin } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { lang: string; league: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const league = getLeagueBySlug(params.league);
  if (!league) return {};
  const titles: Record<string, string> = {
    fr: `Classement ${league.name} 2025/2026 — FootballPulse`,
    en: `${league.name} Standings 2025/2026 — FootballPulse`,
    ar: `ترتيب ${league.name} 2025/2026 — FootballPulse`,
    es: `Clasificación ${league.name} 2025/2026 — FootballPulse`,
  };
  const descs: Record<string, string> = {
    fr: `Classement complet de ${league.name} saison 2025/2026. Points, victoires, buts, forme des équipes. Mis à jour en temps réel.`,
    en: `Complete ${league.name} standings for 2025/2026 season. Points, wins, goals, team form. Updated in real-time.`,
    ar: `ترتيب ${league.name} الكامل لموسم 2025/2026. النقاط، الانتصارات، الأهداف.`,
    es: `Clasificación completa de ${league.name} temporada 2025/2026. Puntos, victorias, goles, forma de los equipos.`,
  };
  return {
    title: titles[params.lang] || titles.en,
    description: descs[params.lang] || descs.en,
    alternates: {
      canonical: `https://footballpulse.site/${params.lang}/standings/${params.league}`,
      languages: Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://footballpulse.site/${l}/standings/${params.league}`])),
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 min

export default async function LeagueStandingsPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const league = getLeagueBySlug(params.league);
  if (!league) notFound();

  let standings: any[] = [];
  let fixtures: any[] = [];
  let results: any[] = [];

  try {
    [standings, fixtures, results] = await Promise.all([
      fetchStandings(league.id),
      fetchFixtures(league.id, 10),
      fetchResults(league.id, 10),
    ]);
  } catch (e) {
    console.error('[Standings] fetch failed:', e);
  }

  // Fetch related articles
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, slug, lang, title, excerpt, cover_image, category, tags, views, published_at')
    .eq('lang', lang)
    .eq('status', 'published')
    .or(`category.eq.${league.slug},tags.cs.{${league.name.toLowerCase()}}`)
    .order('published_at', { ascending: false })
    .limit(4);

  const labels: Record<string, Record<string, string>> = {
    standings: { fr: 'Classement', en: 'Standings', ar: 'الترتيب', es: 'Clasificación' },
    team: { fr: 'Équipe', en: 'Team', ar: 'الفريق', es: 'Equipo' },
    pts: { fr: 'Pts', en: 'Pts', ar: 'نقاط', es: 'Pts' },
    played: { fr: 'J', en: 'P', ar: 'لعب', es: 'PJ' },
    won: { fr: 'V', en: 'W', ar: 'فوز', es: 'G' },
    drawn: { fr: 'N', en: 'D', ar: 'تعادل', es: 'E' },
    lost: { fr: 'D', en: 'L', ar: 'خسارة', es: 'P' },
    gd: { fr: 'DB', en: 'GD', ar: 'فارق', es: 'DG' },
    fixtures: { fr: 'Prochains matchs', en: 'Upcoming', ar: 'القادمة', es: 'Próximos' },
    results: { fr: 'Derniers résultats', en: 'Results', ar: 'النتائج', es: 'Resultados' },
    related: { fr: 'Articles liés', en: 'Related articles', ar: 'مقالات ذات صلة', es: 'Artículos relacionados' },
  };

  const lb = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--muted)' }}>
          <Link href={`/${lang}`} className="hover-underline">{t(lang).home}</Link>
          <span>/</span>
          <Link href={`/${lang}/standings`} className="hover-underline">{lb('standings')}</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)' }}>{league.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 anim-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{league.flag}</span>
            <div>
              <h1 className="font-display text-3xl md:text-4xl" style={{ color: 'var(--ink)' }}>
                {lb('standings')} {league.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {lang === 'fr' ? 'Saison' : lang === 'ar' ? 'موسم' : lang === 'es' ? 'Temporada' : 'Season'} 2025/2026
              </p>
            </div>
          </div>
          <div className="editorial-rule-thick" style={{ maxWidth: '60px' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {/* Standings table */}
            {standings.length > 0 ? (
              <div className="overflow-x-auto anim-up d1">
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--ink)' }}>
                      <th className="py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)', width: '30px' }}>#</th>
                      <th className="py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('team')}</th>
                      <th className="py-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)', width: '35px' }}>{lb('played')}</th>
                      <th className="py-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)', width: '30px' }}>{lb('won')}</th>
                      <th className="py-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)', width: '30px' }}>{lb('drawn')}</th>
                      <th className="py-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)', width: '30px' }}>{lb('lost')}</th>
                      <th className="py-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)', width: '35px' }}>{lb('gd')}</th>
                      <th className="py-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink)', width: '40px' }}>{lb('pts')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, i) => (
                      <tr key={team.team.id}
                        className="hover:bg-[var(--paper-warm)] transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2.5 text-sm font-bold" style={{ color: i < 4 ? 'var(--accent)' : 'var(--muted)' }}>{team.rank}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            {team.team.logo && <img src={team.team.logo} alt="" className="w-5 h-5" />}
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{team.team.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center text-sm" style={{ color: 'var(--muted)' }}>{team.played}</td>
                        <td className="py-2.5 text-center text-sm" style={{ color: 'var(--ink)' }}>{team.win}</td>
                        <td className="py-2.5 text-center text-sm" style={{ color: 'var(--muted)' }}>{team.draw}</td>
                        <td className="py-2.5 text-center text-sm" style={{ color: 'var(--muted)' }}>{team.lose}</td>
                        <td className="py-2.5 text-center text-sm" style={{ color: team.goalsDiff > 0 ? '#0F6E56' : team.goalsDiff < 0 ? 'var(--accent)' : 'var(--muted)' }}>
                          {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                        </td>
                        <td className="py-2.5 text-center text-sm font-bold" style={{ color: 'var(--ink)' }}>{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm py-10 text-center" style={{ color: 'var(--muted)' }}>
                {lang === 'fr' ? 'Classement non disponible' : 'Standings not available'}
              </p>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-10 anim-up d3">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>{lb('results')}</h2>
                <div className="editorial-rule-thick mb-4" style={{ maxWidth: '30px' }} />
                {results.slice(0, 8).map(match => (
                  <div key={match.id} className="flex items-center py-2.5 px-2 -mx-2 hover:bg-[var(--paper-warm)]" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--muted)' }}>
                      {new Date(match.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 flex items-center justify-center gap-2 text-sm">
                      <span className="text-right flex-1 truncate" style={{ color: 'var(--ink)', fontWeight: (match.goals.home ?? 0) > (match.goals.away ?? 0) ? 700 : 400 }}>{match.home.name}</span>
                      <span className="font-bold px-2 py-0.5 text-xs" style={{ background: 'var(--paper-warm)', borderRadius: '2px', color: 'var(--ink)' }}>
                        {match.goals.home ?? '-'} - {match.goals.away ?? '-'}
                      </span>
                      <span className="text-left flex-1 truncate" style={{ color: 'var(--ink)', fontWeight: (match.goals.away ?? 0) > (match.goals.home ?? 0) ? 700 : 400 }}>{match.away.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fixtures */}
            {fixtures.length > 0 && (
              <div className="mt-10 anim-up d4">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>{lb('fixtures')}</h2>
                <div className="editorial-rule-thick mb-4" style={{ maxWidth: '30px' }} />
                {fixtures.slice(0, 8).map(match => (
                  <div key={match.id} className="flex items-center py-2.5 px-2 -mx-2 hover:bg-[var(--paper-warm)]" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-[10px] w-20 shrink-0" style={{ color: 'var(--muted)' }}>
                      {new Date(match.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 flex items-center justify-center gap-2 text-sm">
                      <span className="text-right flex-1 truncate" style={{ color: 'var(--ink)' }}>{match.home.name}</span>
                      <span className="text-xs px-2 py-0.5" style={{ background: 'var(--paper-warm)', borderRadius: '2px', color: 'var(--muted)' }}>
                        {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-left flex-1 truncate" style={{ color: 'var(--ink)' }}>{match.away.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              {/* Other leagues */}
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>
                {lang === 'fr' ? 'Autres ligues' : lang === 'ar' ? 'دوريات أخرى' : lang === 'es' ? 'Otras ligas' : 'Other leagues'}
              </h3>
              <div className="space-y-1 mb-8">
                {LEAGUES.filter(l => l.slug !== league.slug).slice(0, 8).map(l => (
                  <Link key={l.slug} href={`/${lang}/standings/${l.slug}`}
                    className="flex items-center gap-2 py-2 text-sm hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--ink)', borderBottom: '1px solid var(--border)' }}>
                    <span>{l.flag}</span> {l.name}
                  </Link>
                ))}
              </div>

              {/* Live scores link */}
              <Link href={`/${lang}/livescore`}
                className="block p-4 text-center text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity mb-8"
                style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: '6px' }}>
                {lang === 'fr' ? 'Scores en direct' : lang === 'ar' ? 'النتائج المباشرة' : lang === 'es' ? 'En vivo' : 'Live scores'}
              </Link>

              {/* Related articles */}
              {articles && articles.length > 0 && (
                <>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>{lb('related')}</h3>
                  {articles.slice(0, 3).map((a: any) => (
                    <ArticleCard key={a.id} {...a} lang={lang} variant="minimal" />
                  ))}
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}