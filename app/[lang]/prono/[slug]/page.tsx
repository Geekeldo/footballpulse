import { Metadata } from 'next';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { supabaseAdmin } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { lang: string; slug: string } };

function safeHtml(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.replace(/\n/g, '<br/>');
  if (Array.isArray(value)) return value.join('<br/>');
  return String(value);
}

function safeText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabaseAdmin
    .from('predictions').select('title, home_team, away_team, league_name')
    .eq('slug', params.slug).eq('lang', params.lang).single();
  if (!data) return {};
  return {
    title: `${data.title} | FootballPulse`,
    description: `${data.home_team} vs ${data.away_team} — ${data.league_name}. Expert prediction, stats, H2H and betting tips.`,
    alternates: {
      canonical: `https://footballpulse.site/${params.lang}/prono/${params.slug}`,
      languages: Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://footballpulse.site/${l}/prono/${params.slug}`])),
    },
  };
}

export const revalidate = 600;
export const dynamic = 'force-dynamic';

export default async function PredictionPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const { data: prono } = await supabaseAdmin
    .from('predictions').select('*').eq('slug', params.slug).eq('lang', lang).single();

  if (!prono) notFound();

  // Related articles
  const homeWord = prono.home_team.split(' ').slice(-1)[0];
  const awayWord = prono.away_team.split(' ').slice(-1)[0];
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, slug, lang, title, excerpt, cover_image, category, tags, views, published_at')
    .eq('lang', lang).eq('status', 'published')
    .or(`title.ilike.%${homeWord}%,title.ilike.%${awayWord}%`)
    .order('published_at', { ascending: false })
    .limit(4);

  // Other predictions
  const { data: otherPronos } = await supabaseAdmin
    .from('predictions')
    .select('slug, home_team, away_team, home_logo, away_logo, prediction, confidence, match_date, league_name')
    .eq('lang', lang)
    .neq('slug', params.slug)
    .order('match_date', { ascending: true })
    .limit(5);

  const AFFILIATE_LINK = 'https://refpa4293501.top/L?tag=d_3460339m_1573c_&site=3460339&ad=1573';

  const lb = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      analysis: { fr: 'Notre analyse', en: 'Our analysis', ar: 'تحليلنا', es: 'Nuestro análisis' },
      h2h: { fr: 'Face à face', en: 'Head to head', ar: 'مواجهات مباشرة', es: 'Cara a cara' },
      form: { fr: 'Forme récente', en: 'Recent form', ar: 'الشكل الأخير', es: 'Forma reciente' },
      prediction: { fr: 'Notre pronostic', en: 'Our prediction', ar: 'توقعنا', es: 'Nuestro pronóstico' },
      bet: { fr: 'Parier maintenant', en: 'Bet now', ar: 'راهن الآن', es: 'Apostar ahora' },
      recommended: { fr: 'Pari recommandé', en: 'Recommended bet', ar: 'الرهان الموصى به', es: 'Apuesta recomendada' },
      otherPronos: { fr: 'Autres pronostics', en: 'Other predictions', ar: 'توقعات أخرى', es: 'Otros pronósticos' },
      related: { fr: 'Articles liés', en: 'Related articles', ar: 'مقالات ذات صلة', es: 'Artículos relacionados' },
      bonus: { fr: 'Bonus jusqu\'à 100€ sur votre 1er pari', en: 'Up to €100 bonus on your first bet', ar: 'مكافأة حتى 100€ على رهانك الأول', es: 'Bono hasta 100€ en tu primera apuesta' },
      odds: { fr: 'Cotes estimées', en: 'Estimated odds', ar: 'الاحتمالات المقدرة', es: 'Cuotas estimadas' },
      home: { fr: 'Domicile', en: 'Home', ar: 'محلي', es: 'Local' },
      draw: { fr: 'Nul', en: 'Draw', ar: 'تعادل', es: 'Empate' },
      away: { fr: 'Extérieur', en: 'Away', ar: 'زائر', es: 'Visitante' },
      keyPlayers: { fr: 'Joueurs clés', en: 'Key players', ar: 'اللاعبون الرئيسيون', es: 'Jugadores clave' },
    };
    return labels[key]?.[lang] || labels[key]?.en || key;
  };

  const formBadge = (letter: string) => {
    if (letter === 'W') return { bg: 'var(--green-soft)', color: 'var(--green)', label: letter };
    if (letter === 'D') return { bg: 'var(--amber-soft)', color: 'var(--amber)', label: letter };
    if (letter === 'L') return { bg: 'var(--accent-soft)', color: 'var(--accent)', label: letter };
    return { bg: 'var(--paper-warm)', color: 'var(--muted)', label: letter };
  };

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--muted)' }}>
          <Link href={`/${lang}`} className="hover-underline">{t(lang).home}</Link>
          <span>/</span>
          <Link href={`/${lang}/prono`} className="hover-underline">{lang === 'fr' ? 'Pronostics' : 'Predictions'}</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)' }}>{prono.home_team} vs {prono.away_team}</span>
        </nav>

        {/* Match hero card */}
        <div className="card overflow-hidden mb-6 anim-up">
          {/* League bar */}
          <div className="flex items-center justify-center gap-2 py-3" style={{ background: 'var(--paper-warm)', borderBottom: '1px solid var(--border)' }}>
            {prono.league_logo && <img src={prono.league_logo} alt="" className="w-5 h-5" />}
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{prono.league_name}</span>
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>·</span>
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
              {new Date(prono.match_date).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}
              {new Date(prono.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Teams + Score */}
          <div className="flex items-center justify-between p-6 md:p-8">
            <div className="flex flex-col items-center gap-3 flex-1">
              {prono.home_logo ? (
                <img src={prono.home_logo} alt={prono.home_team} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                  {prono.home_team.slice(0, 2)}
                </div>
              )}
              <span className="text-sm md:text-base font-bold text-center" style={{ color: 'var(--ink)' }}>{prono.home_team}</span>
              {prono.home_form && (
                <div className="flex gap-1">
                  {prono.home_form.split(' ').filter(Boolean).map((f: string, i: number) => {
                    const c = formBadge(f.trim());
                    return <span key={i} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
                  })}
                </div>
              )}
            </div>

            <div className="text-center px-4 md:px-8">
              <div className="text-4xl md:text-5xl font-extrabold" style={{ color: 'var(--accent)' }}>{prono.prediction}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--muted)' }}>{lb('prediction')}</div>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <div className="w-28 h-2.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${prono.confidence}%`,
                    background: prono.confidence >= 75 ? 'var(--green)' : prono.confidence >= 60 ? 'var(--amber)' : 'var(--accent)',
                  }} />
                </div>
                <span className="text-sm font-bold" style={{
                  color: prono.confidence >= 75 ? 'var(--green)' : prono.confidence >= 60 ? 'var(--amber)' : 'var(--accent)',
                }}>{prono.confidence}%</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 flex-1">
              {prono.away_logo ? (
                <img src={prono.away_logo} alt={prono.away_team} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                  {prono.away_team.slice(0, 2)}
                </div>
              )}
              <span className="text-sm md:text-base font-bold text-center" style={{ color: 'var(--ink)' }}>{prono.away_team}</span>
              {prono.away_form && (
                <div className="flex gap-1">
                  {prono.away_form.split(' ').filter(Boolean).map((f: string, i: number) => {
                    const c = formBadge(f.trim());
                    return <span key={i} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Odds bar */}
          {(prono.odds_home || prono.odds_draw || prono.odds_away) && (
            <div className="flex items-center justify-center gap-4 py-3 px-6" style={{ background: 'var(--paper-warm)', borderTop: '1px solid var(--border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('odds')}</span>
              {prono.odds_home && (
                <span className="px-3 py-1 text-xs font-bold rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                  {lb('home')} {prono.odds_home}
                </span>
              )}
              {prono.odds_draw && (
                <span className="px-3 py-1 text-xs font-bold rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                  {lb('draw')} {prono.odds_draw}
                </span>
              )}
              {prono.odds_away && (
                <span className="px-3 py-1 text-xs font-bold rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                  {lb('away')} {prono.odds_away}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bookmaker CTA */}
        <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer"
          className="block card p-5 mb-6 anim-up d2 hover-lift text-center"
          style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)', border: 'none' }}>
          <div className="text-lg font-extrabold text-white">🎯 {lb('bet')}</div>
          <div className="text-xs text-white/70 mt-1">1xBet — {lb('bonus')}</div>
        </a>

        {/* Recommended bet */}
        {prono.recommended_bet && (
          <div className="card p-5 mb-6 anim-up d3" style={{ borderLeft: '3px solid var(--green)', borderRadius: '0 10px 10px 0' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--green)' }}>💡 {lb('recommended')}</div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink)', lineHeight: 1.8 }}>{safeText(prono.recommended_bet)}</p>
          </div>
        )}

        {/* H2H */}
        {prono.h2h_summary && (
          <section className="mb-6 anim-up d4">
            <div className="section-header"><h2>⚔️ {lb('h2h')}</h2></div>
            <div className="card p-5">
              <div className="text-sm" style={{ color: 'var(--ink)', lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: safeHtml(prono.h2h_summary) }} />
            </div>
          </section>
        )}

        {/* Analysis */}
        <section className="mb-6 anim-up d5">
          <div className="section-header"><h2>📊 {lb('analysis')}</h2></div>
          <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: safeHtml(prono.analysis) }} />
        </section>

        {/* Second CTA */}
        <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer"
          className="block card p-5 mb-8 hover-lift text-center"
          style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)', border: 'none' }}>
          <div className="text-lg font-extrabold text-white">🎯 {lb('bet')}</div>
          <div className="text-xs text-white/70 mt-1">1xBet — {lb('bonus')}</div>
        </a>

        {/* Related articles */}
        {articles && articles.length > 0 && (
          <section className="mb-8">
            <div className="section-header"><h2>{lb('related')}</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((a: any) => (
                <ArticleCard key={a.id} {...a} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Other predictions */}
        {otherPronos && otherPronos.length > 0 && (
          <section>
            <div className="section-header"><h2>{lb('otherPronos')}</h2></div>
            {otherPronos.map((p: any) => (
              <Link key={p.slug} href={`/${lang}/prono/${p.slug}`}
                className="flex items-center gap-3 py-3 px-3 hover:bg-[var(--paper-warm)] transition-colors rounded"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-[10px] w-14 shrink-0" style={{ color: 'var(--muted)' }}>
                  {new Date(p.match_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {p.home_logo && <img src={p.home_logo} alt="" className="w-5 h-5" />}
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{p.home_team}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>vs</span>
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{p.away_team}</span>
                  {p.away_logo && <img src={p.away_logo} alt="" className="w-5 h-5" />}
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{p.prediction}</span>
              </Link>
            ))}
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
}