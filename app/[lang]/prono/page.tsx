import { Metadata } from 'next';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { supabaseAdmin } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const titles: Record<string, string> = {
    fr: 'Pronostics Football — Analyses et Paris du Jour | FootballPulse',
    en: 'Football Predictions — Daily Analysis & Tips | FootballPulse',
    ar: 'توقعات كرة القدم — تحليلات يومية | FootballPulse',
    es: 'Pronósticos de Fútbol — Análisis y Apuestas del Día | FootballPulse',
  };
  return {
    title: titles[params.lang] || titles.en,
    description: 'Daily football predictions with detailed analysis, head-to-head stats, and expert tips.',
  };
}

export const revalidate = 300;

export default async function PronoIndexPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const now = new Date().toISOString();

  const { data: upcoming } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('lang', lang)
    .gte('match_date', now)
    .order('match_date', { ascending: true })
    .limit(10);

  const { data: past } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('lang', lang)
    .lt('match_date', now)
    .order('match_date', { ascending: false })
    .limit(10);

  const lb = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      title: { fr: 'Pronostics du jour', en: 'Today\'s predictions', ar: 'توقعات اليوم', es: 'Pronósticos del día' },
      upcoming: { fr: 'Matchs à venir', en: 'Upcoming matches', ar: 'المباريات القادمة', es: 'Próximos partidos' },
      past: { fr: 'Pronos passés', en: 'Past predictions', ar: 'توقعات سابقة', es: 'Pronósticos pasados' },
      confidence: { fr: 'Confiance', en: 'Confidence', ar: 'الثقة', es: 'Confianza' },
      correct: { fr: 'Correct', en: 'Correct', ar: 'صحيح', es: 'Correcto' },
      wrong: { fr: 'Raté', en: 'Wrong', ar: 'خاطئ', es: 'Fallido' },
      noMatches: { fr: 'Aucun pronostic disponible pour le moment', en: 'No predictions available yet', ar: 'لا توجد توقعات متاحة حاليا', es: 'No hay pronósticos disponibles' },
      readMore: { fr: 'Voir l\'analyse complète', en: 'Read full analysis', ar: 'قراءة التحليل الكامل', es: 'Ver análisis completo' },
      bet: { fr: 'Parier sur ce match', en: 'Bet on this match', ar: 'راهن على هذه المباراة', es: 'Apostar en este partido' },
    };
    return labels[key]?.[lang] || labels[key]?.en || key;
  };

  const AFFILIATE_LINK = 'https://refpa4293501.top/L?tag=d_3460339m_1573c_&site=3460339&ad=1573';

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8 anim-up">
          <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: 'var(--ink)' }}>{lb('title')}</h1>
          <div className="editorial-rule-thick mt-3" />
        </div>

        {/* Upcoming predictions */}
        {upcoming && upcoming.length > 0 ? (
          <section className="mb-10">
            <div className="section-header"><h2>{lb('upcoming')}</h2></div>
            <div className="space-y-4">
              {upcoming.map((p: any, i: number) => (
                <Link key={p.id} href={`/${lang}/prono/${p.slug}`}
                  className={`card block p-5 hover-lift anim-up d${Math.min(i + 1, 8)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {p.league_logo && <img src={p.league_logo} alt="" className="w-5 h-5" />}
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{p.league_name}</span>
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
                      {new Date(p.match_date).toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' · '}
                      {new Date(p.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {p.home_logo && <img src={p.home_logo} alt="" className="w-10 h-10 object-contain" />}
                      <span className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{p.home_team}</span>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{p.prediction}</div>
                      <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>prono</div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="text-lg font-bold text-right" style={{ color: 'var(--ink)' }}>{p.away_team}</span>
                      {p.away_logo && <img src={p.away_logo} alt="" className="w-10 h-10 object-contain" />}
                    </div>
                  </div>

                  {/* Confidence + recommended bet */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${p.confidence}%`,
                            background: p.confidence >= 75 ? 'var(--green)' : p.confidence >= 60 ? 'var(--amber)' : 'var(--accent)',
                          }} />
                        </div>
                        <span className="text-[10px] font-bold" style={{
                          color: p.confidence >= 75 ? 'var(--green)' : p.confidence >= 60 ? 'var(--amber)' : 'var(--accent)',
                        }}>{p.confidence}%</span>
                      </div>
                      {p.recommended_bet && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>
                          {p.recommended_bet.slice(0, 40)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>{lb('readMore')} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16 anim-up">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{lb('noMatches')}</p>
          </div>
        )}

        {/* CTA bookmaker */}
        <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer"
          className="block card p-6 text-center mb-10 anim-up hover-lift"
          style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)', border: 'none' }}>
          <div className="text-xl font-extrabold text-white mb-1">{lb('bet')}</div>
          <div className="text-sm text-white/70">1xBet — Bonus jusqu'à 100€ sur votre premier pari</div>
        </a>

        {/* Past predictions */}
        {past && past.length > 0 && (
          <section>
            <div className="section-header"><h2>{lb('past')}</h2></div>
            <div className="space-y-2">
              {past.map((p: any) => (
                <Link key={p.id} href={`/${lang}/prono/${p.slug}`}
                  className="flex items-center gap-4 py-3 px-3 hover:bg-[var(--paper-warm)] transition-colors rounded"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-[10px] w-16 shrink-0" style={{ color: 'var(--muted)' }}>
                    {new Date(p.match_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {p.home_team} vs {p.away_team}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{p.prediction}</span>
                  {p.was_correct !== null && (
                    <span className="badge" style={{
                      background: p.was_correct ? 'var(--green-soft)' : 'var(--accent-soft)',
                      color: p.was_correct ? 'var(--green)' : 'var(--accent)',
                    }}>
                      {p.was_correct ? '✓' : '✗'}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}