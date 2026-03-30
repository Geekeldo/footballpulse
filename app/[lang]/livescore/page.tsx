import { Metadata } from 'next';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { fetchLiveScores, LEAGUES } from '@/lib/football-api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import LiveScoreClient from './LiveScoreClient';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = params.lang as Lang;
  const titles: Record<string, string> = {
    fr: 'Scores en direct — Football en temps réel',
    en: 'Live Scores — Real-time Football Results',
    ar: 'النتائج المباشرة — كرة القدم في الوقت الفعلي',
    es: 'Marcadores en vivo — Fútbol en tiempo real',
  };
  const descs: Record<string, string> = {
    fr: 'Suivez tous les scores de football en direct. Résultats en temps réel de la Premier League, La Liga, Ligue 1, Champions League et plus.',
    en: 'Follow all live football scores. Real-time results from Premier League, La Liga, Ligue 1, Champions League and more.',
    ar: 'تابع جميع نتائج كرة القدم المباشرة. نتائج في الوقت الفعلي من الدوري الإنجليزي والإسباني والفرنسي ودوري الأبطال.',
    es: 'Sigue todos los marcadores de fútbol en vivo. Resultados en tiempo real de la Premier League, La Liga, Ligue 1, Champions League y más.',
  };
  return {
    title: titles[lang] || titles.en,
    description: descs[lang] || descs.en,
    alternates: {
      canonical: `https://footballpulse.site/${lang}/livescore`,
      languages: Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://footballpulse.site/${l}/livescore`])),
    },
  };
}

export const revalidate = 60;

export default async function LiveScorePage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

    let matches: any[] = [];
  try {
    matches = await fetchLiveScores();
  } catch (e) {
    console.error('[LiveScore] fetch failed:', e);
  }

  const tr = t(lang);

  // Group by league
  const grouped: Record<string, any[]> = {};
  matches.forEach((m: any) => {
    const key = m.league.name;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  const titles: Record<string, string> = {
    fr: 'Scores en direct', en: 'Live scores', ar: 'النتائج المباشرة', es: 'Marcadores en vivo',
  };

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl anim-up" style={{ color: 'var(--ink)' }}>
            {titles[lang]}
          </h1>
          <div className="editorial-rule-thick mt-4" style={{ maxWidth: '60px' }} />
          <p className="text-sm mt-3" style={{ color: 'var(--muted)' }}>
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <LiveScoreClient initialMatches={grouped} lang={lang} />

        {/* SEO: League links */}
        <section className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>
            {lang === 'fr' ? 'Classements' : lang === 'ar' ? 'الترتيب' : lang === 'es' ? 'Clasificaciones' : 'Standings'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {LEAGUES.slice(0, 8).map(league => (
              <a key={league.slug} href={`/${lang}/standings/${league.slug}`}
                className="px-3 py-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
                style={{ border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--ink)' }}>
                {league.flag} {league.name}
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}