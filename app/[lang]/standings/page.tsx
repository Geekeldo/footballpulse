import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { LEAGUES } from '@/lib/football-api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const titles: Record<string, string> = {
    fr: 'Classements Football — Toutes les ligues',
    en: 'Football Standings — All Leagues',
    ar: 'ترتيب الدوريات — كرة القدم',
    es: 'Clasificaciones de Fútbol — Todas las ligas',
  };
  return { title: titles[params.lang] || titles.en };
}

export default function StandingsIndexPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const titles: Record<string, string> = {
    fr: 'Classements', en: 'Standings', ar: 'الترتيب', es: 'Clasificaciones',
  };

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl md:text-5xl mb-2 anim-up" style={{ color: 'var(--ink)' }}>{titles[lang]}</h1>
        <div className="editorial-rule-thick mt-4 mb-8" style={{ maxWidth: '60px' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEAGUES.map((league, i) => (
            <Link key={league.slug} href={`/${lang}/standings/${league.slug}`}
              className={`flex items-center gap-4 p-5 hover-lift anim-up d${Math.min(i + 1, 8)}`}
              style={{ border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span className="text-2xl">{league.flag}</span>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{league.name}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{league.country}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}