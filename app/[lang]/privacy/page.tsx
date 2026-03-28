import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Privacy Policy',
    description: 'FootballPulse privacy policy. Learn how we collect, use and protect your data.',
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function PrivacyPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const content: Record<Lang, { title: string; body: string }> = {
    fr: {
      title: 'Politique de Confidentialité',
      body: `
        <p><em>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}</em></p>
        
        <h2>1. Introduction</h2>
        <p>FootballPulse ("nous", "notre") s'engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos informations lorsque vous visitez notre site footballpulse.site.</p>
        
        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>
        <ul>
          <li><strong>Données de navigation</strong> — Pages visitées, durée de visite, type de navigateur, adresse IP anonymisée</li>
          <li><strong>Cookies</strong> — Cookies techniques nécessaires au fonctionnement du site et cookies publicitaires (Google AdSense)</li>
          <li><strong>Données analytiques</strong> — Via Vercel Analytics, de manière anonyme</li>
        </ul>
        
        <h2>3. Utilisation des données</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Améliorer l'expérience utilisateur et le contenu du site</li>
          <li>Analyser les tendances de trafic</li>
          <li>Afficher des publicités pertinentes via Google AdSense</li>
        </ul>
        
        <h2>4. Google AdSense</h2>
        <p>Nous utilisons Google AdSense pour afficher des publicités. Google peut utiliser des cookies pour diffuser des annonces basées sur vos visites précédentes. Vous pouvez désactiver la publicité personnalisée en visitant les <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Paramètres des annonces Google</a>.</p>
        
        <h2>5. Cookies</h2>
        <p>Notre site utilise des cookies pour :</p>
        <ul>
          <li>Le fonctionnement technique du site</li>
          <li>L'analyse du trafic (Vercel Analytics)</li>
          <li>La diffusion de publicités (Google AdSense)</li>
        </ul>
        <p>Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.</p>
        
        <h2>6. Partage des données</h2>
        <p>Nous ne vendons pas vos données personnelles. Les données peuvent être partagées avec :</p>
        <ul>
          <li><strong>Google</strong> — Pour le service AdSense et Analytics</li>
          <li><strong>Vercel</strong> — Pour l'hébergement et les analytics</li>
        </ul>
        
        <h2>7. Vos droits (RGPD)</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>Pour exercer ces droits, contactez-nous à : <strong>contact@footballpulse.site</strong></p>
        
        <h2>8. Contact</h2>
        <p>Pour toute question relative à cette politique : <strong>contact@footballpulse.site</strong></p>
      `,
    },
    en: {
      title: 'Privacy Policy',
      body: `
        <p><em>Last updated: ${new Date().toLocaleDateString('en-US')}</em></p>
        
        <h2>1. Introduction</h2>
        <p>FootballPulse ("we", "our") is committed to protecting your privacy. This policy explains how we collect, use, and protect your information when you visit footballpulse.site.</p>
        
        <h2>2. Data Collected</h2>
        <ul>
          <li><strong>Browsing data</strong> — Pages visited, visit duration, browser type, anonymized IP address</li>
          <li><strong>Cookies</strong> — Technical cookies and advertising cookies (Google AdSense)</li>
          <li><strong>Analytics data</strong> — Via Vercel Analytics, anonymously</li>
        </ul>
        
        <h2>3. Use of Data</h2>
        <ul>
          <li>Improve user experience and site content</li>
          <li>Analyze traffic trends</li>
          <li>Display relevant ads via Google AdSense</li>
        </ul>
        
        <h2>4. Google AdSense</h2>
        <p>We use Google AdSense to display ads. Google may use cookies to serve ads based on your prior visits. You can opt out at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
        
        <h2>5. Your Rights (GDPR)</h2>
        <p>You have the right to access, rectify, delete, and port your data. Contact us at: <strong>contact@footballpulse.site</strong></p>
        
        <h2>6. Contact</h2>
        <p>For any questions: <strong>contact@footballpulse.site</strong></p>
      `,
    },
    ar: {
      title: 'سياسة الخصوصية',
      body: `
        <h2>1. مقدمة</h2>
        <p>يلتزم FootballPulse بحماية خصوصيتك. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.</p>
        
        <h2>2. البيانات المجمعة</h2>
        <ul>
          <li>بيانات التصفح — الصفحات التي تمت زيارتها، مدة الزيارة</li>
          <li>ملفات تعريف الارتباط — ملفات تعريف الارتباط التقنية والإعلانية</li>
        </ul>
        
        <h2>3. Google AdSense</h2>
        <p>نستخدم Google AdSense لعرض الإعلانات.</p>
        
        <h2>4. اتصل بنا</h2>
        <p><strong>contact@footballpulse.site</strong></p>
      `,
    },
    es: {
      title: 'Política de Privacidad',
      body: `
        <h2>1. Introducción</h2>
        <p>FootballPulse se compromete a proteger su privacidad. Esta política explica cómo recopilamos, usamos y protegemos su información.</p>
        
        <h2>2. Datos recopilados</h2>
        <ul>
          <li>Datos de navegación — Páginas visitadas, duración de la visita</li>
          <li>Cookies — Cookies técnicas y publicitarias</li>
        </ul>
        
        <h2>3. Google AdSense</h2>
        <p>Utilizamos Google AdSense para mostrar anuncios.</p>
        
        <h2>4. Contacto</h2>
        <p><strong>contact@footballpulse.site</strong></p>
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