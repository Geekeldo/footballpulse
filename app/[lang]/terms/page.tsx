import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Terms of Use',
    description: 'FootballPulse terms of use and conditions.',
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default function TermsPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const content: Record<Lang, { title: string; body: string }> = {
    fr: {
      title: 'Conditions d\'Utilisation',
      body: `
        <p><em>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}</em></p>
        
        <h2>1. Acceptation des conditions</h2>
        <p>En accédant à footballpulse.site, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.</p>
        
        <h2>2. Description du service</h2>
        <p>FootballPulse est un site d'information sportive dédié au football. Nous publions des articles, analyses et actualités sur le football mondial en quatre langues.</p>
        
        <h2>3. Propriété intellectuelle</h2>
        <p>Tout le contenu publié sur FootballPulse (textes, images, logos, design) est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p>
        
        <h2>4. Utilisation du contenu</h2>
        <p>Vous pouvez :</p>
        <ul>
          <li>Lire et partager nos articles via les liens de partage prévus</li>
          <li>Citer des extraits courts avec attribution à FootballPulse</li>
        </ul>
        <p>Vous ne pouvez pas :</p>
        <ul>
          <li>Copier intégralement nos articles</li>
          <li>Utiliser notre contenu à des fins commerciales sans autorisation</li>
          <li>Modifier ou dénaturer notre contenu</li>
        </ul>
        
        <h2>5. Publicités</h2>
        <p>Ce site affiche des publicités via Google AdSense. Ces publicités nous permettent de financer le fonctionnement du site et de continuer à produire du contenu gratuit.</p>
        
        <h2>6. Limitation de responsabilité</h2>
        <p>Les informations publiées sur FootballPulse sont fournies à titre informatif. Nous nous efforçons d'assurer l'exactitude des informations mais ne pouvons garantir l'absence d'erreurs.</p>
        
        <h2>7. Liens externes</h2>
        <p>Notre site peut contenir des liens vers des sites tiers. Nous ne sommes pas responsables du contenu de ces sites externes.</p>
        
        <h2>8. Modifications</h2>
        <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur cette page.</p>
        
        <h2>9. Contact</h2>
        <p>Pour toute question : <strong>contact@footballpulse.site</strong></p>
      `,
    },
    en: {
      title: 'Terms of Use',
      body: `
        <p><em>Last updated: ${new Date().toLocaleDateString('en-US')}</em></p>
        
        <h2>1. Acceptance</h2>
        <p>By accessing footballpulse.site, you agree to be bound by these terms of use.</p>
        
        <h2>2. Service Description</h2>
        <p>FootballPulse is a sports news website dedicated to football, publishing articles and analysis in four languages.</p>
        
        <h2>3. Intellectual Property</h2>
        <p>All content published on FootballPulse is protected by copyright. Reproduction without authorization is prohibited.</p>
        
        <h2>4. Advertising</h2>
        <p>This site displays advertisements via Google AdSense to fund free content production.</p>
        
        <h2>5. Limitation of Liability</h2>
        <p>Information is provided for informational purposes only. We strive for accuracy but cannot guarantee error-free content.</p>
        
        <h2>6. Contact</h2>
        <p>For any questions: <strong>contact@footballpulse.site</strong></p>
      `,
    },
    ar: {
      title: 'شروط الاستخدام',
      body: `
        <h2>1. القبول</h2>
        <p>بالوصول إلى footballpulse.site، فإنك توافق على الالتزام بشروط الاستخدام هذه.</p>
        
        <h2>2. الملكية الفكرية</h2>
        <p>جميع المحتويات المنشورة محمية بموجب حقوق النشر.</p>
        
        <h2>3. اتصل بنا</h2>
        <p><strong>contact@footballpulse.site</strong></p>
      `,
    },
    es: {
      title: 'Términos de Uso',
      body: `
        <h2>1. Aceptación</h2>
        <p>Al acceder a footballpulse.site, acepta estar sujeto a estos términos de uso.</p>
        
        <h2>2. Propiedad Intelectual</h2>
        <p>Todo el contenido publicado está protegido por derechos de autor.</p>
        
        <h2>3. Contacto</h2>
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