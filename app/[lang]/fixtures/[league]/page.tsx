import { Metadata } from 'next';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { fetchFixtures, fetchResults, getLeagueBySlug, LEAGUES } from '@/lib/football-api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { lang: string; league: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const league = getLeagueBySlug(params.league);
  if (!league) return {};
  const titles: Record<string, string> = {
    fr: `Calendrier ${league.name} 2025/2026 — Matchs et résultats`,
    en: `${league.name} Fixtures 2025/2026 — Matches and Results`,
    ar: `جدول مباريات ${league.name} 2025/2026`,
    es: `Calendario ${league.name} 2025/2026 — Partidos y resultados`,
  };
  return {
    title: titles[params.lang] || titles.en,
    description: `${league.name} fixtures, schedule and results for 2025/2026 season. All upcoming matches and past results.`,
    alternates: {
      canonical: `https://footballpulse.site/${params.lang}/fixtures/${params.league}`,
      languages: Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://footballpulse.site/${l}/fixtures/${params.league}`])),
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 1800;

export default async function FixturesPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();
  const league = getLeagueBySlug(params.league);
  if (!league) notFound();

  let fixtures: any[] = [];
  let results: any[] = [];

  try {
    [fixtures, results] = await Promise.all([
      fetchFixtures(league.id, 30),
      fetchResults(league.id, 30),
    ]);
  } catch (e) {
    console.error('[Fixtures]', e);
  }

  // Group results by round
  const resultsByRound: Record<string, any[]> = {};
  results.forEach(m => {
    const round = m.round || 'Other';
    if (!resultsByRound[round]) resultsByRound[round] = [];
    resultsByRound[round].push(m);
  });

  const fixturesByRound: Record<string, any[]> = {};
  fixtures.forEach(m => {
    const round = m.round || 'Upcoming';
    if (!fixturesByRound[round]) fixturesByRound[round] = [];
    fixturesByRound[round].push(m);
  });

  const labels: Record<string, Record<string, string>> = {
    fixtures: { fr: 'Matchs à venir', en: 'Upcoming matches', ar: 'المباريات القادمة', es: 'Próximos partidos' },
    results: { fr: 'Derniers résultats', en: 'Latest results', ar: 'آخر النتائج', es: 'Últimos resultados' },
    calendar: { fr: 'Calendrier', en: 'Fixtures', ar: 'الجدول', es: 'Calendario' },
    standings: { fr: 'Voir le classement', en: 'View standings', ar: 'عرض الترتيب', es: 'Ver clasificación' },
  };
  const lb = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--muted)' }}>
          <Link href={`/${lang}`} className="hover-underline">{t(lang).home}</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)' }}>{lb('calendar')} {league.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 anim-up">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{league.flag}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--ink)' }}>
                {lb('calendar')} {league.name}
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                {lang === 'fr' ? 'Saison' : 'Season'} 2025/2026
              </p>
            </div>
          </div>
          <Link href={`/${lang}/standings/${league.slug}`}
            className="text-xs font-bold uppercase px-3 py-2 rounded hover:opacity-80 transition-opacity hidden md:block"
            style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
            {lb('standings')}
          </Link>
        </div>

        {/* Upcoming fixtures */}
        {Object.keys(fixturesByRound).length > 0 && (
          <section className="mb-10 anim-up d2">
            <div className="section-header">
              <h2>{lb('fixtures')}</h2>
            </div>
            {Object.entries(fixturesByRound).map(([round, matches]) => (
              <div key={round} className="mb-6">
                <div className="text-[10px] font-bold uppercase tracking-wider py-2 px-3 mb-1 rounded"
                  style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                  {round}
                </div>
                {matches.map(match => (
                  <div key={match.id} className="flex items-center py-3 px-3 hover:bg-[var(--paper-warm)] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="w-24 shrink-0">
                      <div className="text-xs font-medium" style={{ color: 'var(--ink)' }}>
                        {new Date(match.date).toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{match.home.name}</span>
                      </div>
                      <div className="w-16 text-center">
                        <span className="text-xs font-bold px-3 py-1 rounded" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                          vs
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{match.away.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {/* Results */}
        {Object.keys(resultsByRound).length > 0 && (
          <section className="anim-up d4">
            <div className="section-header">
              <h2>{lb('results')}</h2>
            </div>
            {Object.entries(resultsByRound).reverse().map(([round, matches]) => (
              <div key={round} className="mb-6">
                <div className="text-[10px] font-bold uppercase tracking-wider py-2 px-3 mb-1 rounded"
                  style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                  {round}
                </div>
                {matches.map(match => (
                  <div key={match.id} className="flex items-center py-3 px-3 hover:bg-[var(--paper-warm)] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="w-24 shrink-0">
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        {new Date(match.date).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <span className="text-sm" style={{
                          color: 'var(--ink)',
                          fontWeight: (match.goals.home ?? 0) > (match.goals.away ?? 0) ? 700 : 400,
                        }}>{match.home.name}</span>
                      </div>
                      <div className="w-16 text-center">
                        <span className="text-sm font-bold px-3 py-1 rounded" style={{
                          background: 'var(--ink)', color: 'var(--paper)',
                        }}>
                          {match.goals.home ?? 0} - {match.goals.away ?? 0}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm" style={{
                          color: 'var(--ink)',
                          fontWeight: (match.goals.away ?? 0) > (match.goals.home ?? 0) ? 700 : 400,
                        }}>{match.away.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {/* League nav */}
        <section className="mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-wrap gap-2">
            {LEAGUES.slice(0, 8).map(l => (
              <Link key={l.slug} href={`/${lang}/fixtures/${l.slug}`}
                className="badge transition-all"
                style={{
                  background: l.slug === league.slug ? 'var(--ink)' : 'var(--paper-warm)',
                  color: l.slug === league.slug ? 'white' : 'var(--muted)',
                }}>
                {l.flag} {l.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}