import { type Lang, SUPPORTED_LANGS, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AboutContent from './AboutContent';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const titles: Record<string, string> = {
    fr: 'À propos — FootballPulse | Votre Source Football Premium',
    en: 'About — FootballPulse | Your Premium Football Source',
    ar: 'حول — FootballPulse | مصدرك المتميز لكرة القدم',
    es: 'Acerca de — FootballPulse | Tu Fuente Premium de Fútbol',
  };
  return {
    title: titles[params.lang] || titles.en,
    description:
      'Discover FootballPulse — your premier destination for football news, tactical analysis, and transfer updates from every major league worldwide.',
    openGraph: {
      title: titles[params.lang] || titles.en,
      description:
        'Your premier destination for football news, tactical analysis, and transfer updates worldwide.',
    },
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function AboutPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <AboutContent lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}