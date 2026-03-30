import { type Lang, SUPPORTED_LANGS, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ContactContent from './ContactContent';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const titles: Record<string, string> = {
    fr: 'Contact — FootballPulse',
    en: 'Contact — FootballPulse',
    ar: 'اتصل بنا — FootballPulse',
    es: 'Contacto — FootballPulse',
  };
  return {
    title: titles[params.lang] || titles.en,
    description: 'Get in touch with the FootballPulse team. We\'d love to hear from you.',
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function ContactPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <ContactContent lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}