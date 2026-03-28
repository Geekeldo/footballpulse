import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'About Us',
    description: 'Learn about FootballPulse, your premier source for football news worldwide.',
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function AboutPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const content: Record<Lang, { title: string; body: string }> = {
    fr: {
      title: 'À propos de FootballPulse',
      body: `
        <h2>Notre Mission</h2>
        <p>FootballPulse est votre source premium d'actualités footballistiques mondiales. Nous couvrons les transferts, les analyses tactiques, les résultats et les dernières nouvelles de toutes les grandes ligues.</p>
        
        <h2>Ce que nous proposons</h2>
        <p>Notre plateforme offre une couverture complète du football mondial, disponible en quatre langues : français, anglais, arabe et espagnol. Nous nous engageons à fournir des informations précises, des analyses approfondies et un contenu de qualité.</p>
        
        <h2>Notre Équipe</h2>
        <p>FootballPulse est alimenté par une équipe de journalistes sportifs passionnés et d'experts en analyse tactique. Notre rédaction travaille 24h/24 pour vous apporter les dernières nouvelles du monde du football.</p>
        
        <h2>Contactez-nous</h2>
        <p>Pour toute question, suggestion ou partenariat, n'hésitez pas à nous contacter à l'adresse : <strong>contact@footballpulse.site</strong></p>
        
        <h2>Nos Valeurs</h2>
        <ul>
          <li><strong>Précision</strong> — Nous vérifions nos sources et nos informations</li>
          <li><strong>Rapidité</strong> — Les dernières nouvelles en temps réel</li>
          <li><strong>Accessibilité</strong> — Du contenu disponible en 4 langues</li>
          <li><strong>Passion</strong> — Le football au cœur de tout ce que nous faisons</li>
        </ul>
      `,
    },
    en: {
      title: 'About FootballPulse',
      body: `
        <h2>Our Mission</h2>
        <p>FootballPulse is your premium source for worldwide football news. We cover transfers, tactical analysis, results and breaking news from every major league.</p>
        
        <h2>What We Offer</h2>
        <p>Our platform provides comprehensive coverage of world football, available in four languages: French, English, Arabic and Spanish. We are committed to delivering accurate information, in-depth analysis and quality content.</p>
        
        <h2>Our Team</h2>
        <p>FootballPulse is powered by a team of passionate sports journalists and tactical analysis experts. Our newsroom works around the clock to bring you the latest football news.</p>
        
        <h2>Contact Us</h2>
        <p>For any questions, suggestions or partnerships, feel free to reach out at: <strong>contact@footballpulse.site</strong></p>
        
        <h2>Our Values</h2>
        <ul>
          <li><strong>Accuracy</strong> — We verify our sources and information</li>
          <li><strong>Speed</strong> — Breaking news in real time</li>
          <li><strong>Accessibility</strong> — Content available in 4 languages</li>
          <li><strong>Passion</strong> — Football at the heart of everything we do</li>
        </ul>
      `,
    },
    ar: {
      title: 'حول FootballPulse',
      body: `
        <h2>مهمتنا</h2>
        <p>FootballPulse هو مصدرك المتميز لأخبار كرة القدم العالمية. نغطي الانتقالات والتحليلات التكتيكية والنتائج وآخر الأخبار من جميع الدوريات الكبرى.</p>
        
        <h2>ما نقدمه</h2>
        <p>توفر منصتنا تغطية شاملة لكرة القدم العالمية، متاحة بأربع لغات: الفرنسية والإنجليزية والعربية والإسبانية.</p>
        
        <h2>اتصل بنا</h2>
        <p>لأي استفسارات أو اقتراحات: <strong>contact@footballpulse.site</strong></p>
      `,
    },
    es: {
      title: 'Acerca de FootballPulse',
      body: `
        <h2>Nuestra Misión</h2>
        <p>FootballPulse es tu fuente premium de noticias de fútbol mundial. Cubrimos fichajes, análisis tácticos, resultados y las últimas noticias de todas las grandes ligas.</p>
        
        <h2>Lo que ofrecemos</h2>
        <p>Nuestra plataforma ofrece una cobertura completa del fútbol mundial, disponible en cuatro idiomas: francés, inglés, árabe y español.</p>
        
        <h2>Contáctenos</h2>
        <p>Para cualquier pregunta o sugerencia: <strong>contact@footballpulse.site</strong></p>
      `,
    },
  };

  const c = content[lang];

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl md:text-5xl mb-8" style={{ color: 'var(--ink)' }}>{c.title}</h1>
        <div className="prose prose-lg" style={{ color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: c.body }} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}