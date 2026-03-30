import { type Lang, SUPPORTED_LANGS, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Privacy Policy — FootballPulse',
    description:
      'Learn how FootballPulse collects, uses, and protects your data. Full GDPR compliance.',
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function PrivacyPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <PrivacyContent lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}