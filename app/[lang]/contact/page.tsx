import { type Lang, SUPPORTED_LANGS, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Contact',
    description: 'Contact the FootballPulse team.',
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function ContactPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const titles: Record<Lang, string> = {
    fr: 'Contactez-nous', en: 'Contact Us', ar: 'اتصل بنا', es: 'Contáctenos',
  };

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl md:text-5xl mb-8" style={{ color: 'var(--ink)' }}>{titles[lang]}</h1>
        <div className="prose prose-lg" style={{ color: 'var(--ink)' }}>
          <div className="p-8 mb-8" style={{ border: '1px solid var(--border)', borderRadius: '8px' }}>
            <h2>📧 Email</h2>
            <p><a href="mailto:contact@footballpulse.site" style={{ color: 'var(--accent)' }}>contact@footballpulse.site</a></p>
            <h2>🌐 Social Media</h2>
            <p>Twitter · Instagram · Facebook</p>
            <h2>📍 Information</h2>
            <p>FootballPulse — Independent Football News Platform</p>
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}