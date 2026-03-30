'use client';

import type { Lang } from '@/lib/i18n';
import AnimatedSection from '@/components/ui/AnimatedSection';
import FloatingOrb from '@/components/ui/FloatingOrb';
import GlassCard from '@/components/ui/GlassCard';
import ParallaxBg from '@/components/ui/ParallaxBg';

interface SectionBlock {
  icon: string;
  title: string;
  content: string;
}

interface PrivacyData {
  hero: { title: string; subtitle: string; updated: string };
  sections: SectionBlock[];
  contactCta: { title: string; text: string };
}

const content: Record<Lang, PrivacyData> = {
  fr: {
    hero: {
      title: 'Politique de Confidentialité',
      subtitle: 'Votre vie privée est notre priorité. Découvrez comment nous protégeons vos données.',
      updated: `Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}`,
    },
    sections: [
      {
        icon: '🔐',
        title: '1. Introduction',
        content:
          '<p>FootballPulse ("nous", "notre") s\'engage à protéger votre vie privée avec la plus grande rigueur. Cette politique explique en toute transparence comment nous collectons, utilisons et protégeons vos informations lorsque vous visitez <strong>footballpulse.site</strong>.</p>',
      },
      {
        icon: '📊',
        title: '2. Données collectées',
        content: `
          <p>Nous collectons les données suivantes de manière transparente :</p>
          <ul>
            <li><strong>Données de navigation</strong> — Pages visitées, durée de visite, type de navigateur, adresse IP anonymisée</li>
            <li><strong>Cookies</strong> — Cookies techniques nécessaires au fonctionnement du site et cookies publicitaires (Google AdSense)</li>
            <li><strong>Données analytiques</strong> — Via Vercel Analytics, de manière entièrement anonyme</li>
          </ul>
        `,
      },
      {
        icon: '⚙️',
        title: '3. Utilisation des données',
        content: `
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Améliorer l'expérience utilisateur et la qualité du contenu éditorial</li>
            <li>Analyser les tendances de trafic pour mieux vous servir</li>
            <li>Afficher des publicités pertinentes via Google AdSense</li>
          </ul>
        `,
      },
      {
        icon: '📢',
        title: '4. Google AdSense',
        content:
          '<p>Nous utilisons Google AdSense pour afficher des publicités qui financent notre contenu gratuit. Google peut utiliser des cookies pour diffuser des annonces basées sur vos visites précédentes. Vous pouvez désactiver la publicité personnalisée en visitant les <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Paramètres des annonces Google</a>.</p>',
      },
      {
        icon: '🍪',
        title: '5. Cookies',
        content: `
          <p>Notre site utilise des cookies pour :</p>
          <ul>
            <li>Le fonctionnement technique optimal du site</li>
            <li>L'analyse du trafic (Vercel Analytics)</li>
            <li>La diffusion de publicités ciblées (Google AdSense)</li>
          </ul>
          <p>Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur à tout moment.</p>
        `,
      },
      {
        icon: '🤝',
        title: '6. Partage des données',
        content: `
          <p>Nous ne vendons <strong>jamais</strong> vos données personnelles. Les données peuvent être partagées uniquement avec :</p>
          <ul>
            <li><strong>Google</strong> — Pour les services AdSense et Analytics</li>
            <li><strong>Vercel</strong> — Pour l'hébergement et les analytics</li>
          </ul>
        `,
      },
      {
        icon: '🛡️',
        title: '7. Vos droits (RGPD)',
        content: `
          <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès</strong> — Obtenez une copie de vos données personnelles</li>
            <li><strong>Droit de rectification</strong> — Corrigez les informations inexactes</li>
            <li><strong>Droit à l'effacement</strong> — Demandez la suppression de vos données</li>
            <li><strong>Droit à la portabilité</strong> — Transférez vos données vers un autre service</li>
            <li><strong>Droit d'opposition</strong> — Refusez le traitement de vos données</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à : <strong>contact@footballpulse.site</strong></p>
        `,
      },
      {
        icon: '📬',
        title: '8. Contact',
        content:
          '<p>Pour toute question relative à cette politique de confidentialité, notre Délégué à la Protection des Données se tient à votre disposition : <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: 'Des questions sur vos données ?',
      text: 'Notre équipe est disponible pour répondre à toutes vos interrogations concernant la protection de vos données personnelles.',
    },
  },
  en: {
    hero: {
      title: 'Privacy Policy',
      subtitle: 'Your privacy matters. Learn how we safeguard your data with full transparency.',
      updated: `Last updated: ${new Date().toLocaleDateString('en-US')}`,
    },
    sections: [
      {
        icon: '🔐',
        title: '1. Introduction',
        content:
          '<p>FootballPulse ("we", "our") is firmly committed to protecting your privacy. This policy explains in full transparency how we collect, use, and protect your information when you visit <strong>footballpulse.site</strong>.</p>',
      },
      {
        icon: '📊',
        title: '2. Data Collected',
        content: `
          <ul>
            <li><strong>Browsing data</strong> — Pages visited, visit duration, browser type, anonymized IP address</li>
            <li><strong>Cookies</strong> — Essential technical cookies and advertising cookies (Google AdSense)</li>
            <li><strong>Analytics data</strong> — Via Vercel Analytics, collected entirely anonymously</li>
          </ul>
        `,
      },
      {
        icon: '⚙️',
        title: '3. Use of Data',
        content: `
          <p>Your data is used exclusively to:</p>
          <ul>
            <li>Enhance user experience and editorial content quality</li>
            <li>Analyze traffic trends to better serve our readers</li>
            <li>Display relevant advertisements via Google AdSense</li>
          </ul>
        `,
      },
      {
        icon: '📢',
        title: '4. Google AdSense',
        content:
          '<p>We use Google AdSense to display advertisements that fund our free content. Google may use cookies to serve ads based on your prior visits. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>',
      },
      {
        icon: '🍪',
        title: '5. Cookies',
        content: `
          <p>Our site uses cookies for:</p>
          <ul>
            <li>Core technical site functionality</li>
            <li>Traffic analysis (Vercel Analytics)</li>
            <li>Targeted ad delivery (Google AdSense)</li>
          </ul>
          <p>You can manage your cookie preferences in your browser settings at any time.</p>
        `,
      },
      {
        icon: '🤝',
        title: '6. Data Sharing',
        content: `
          <p>We <strong>never</strong> sell your personal data. Data may only be shared with:</p>
          <ul>
            <li><strong>Google</strong> — For AdSense and Analytics services</li>
            <li><strong>Vercel</strong> — For hosting and analytics infrastructure</li>
          </ul>
        `,
      },
      {
        icon: '🛡️',
        title: '7. Your Rights (GDPR)',
        content: `
          <p>Under the General Data Protection Regulation, you have the following rights:</p>
          <ul>
            <li><strong>Right of access</strong> — Obtain a copy of your personal data</li>
            <li><strong>Right to rectification</strong> — Correct any inaccurate information</li>
            <li><strong>Right to erasure</strong> — Request deletion of your data</li>
            <li><strong>Right to portability</strong> — Transfer your data to another service</li>
            <li><strong>Right to object</strong> — Refuse the processing of your data</li>
          </ul>
          <p>To exercise these rights, contact us at: <strong>contact@footballpulse.site</strong></p>
        `,
      },
      {
        icon: '📬',
        title: '8. Contact',
        content:
          '<p>For any questions regarding this privacy policy, our Data Protection Officer is available at: <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: 'Questions about your data?',
      text: 'Our team is available to answer all your questions regarding the protection of your personal data.',
    },
  },
  ar: {
    hero: {
      title: 'سياسة الخصوصية',
      subtitle: 'خصوصيتك تهمنا. تعرّف على كيفية حماية بياناتك بكل شفافية.',
      updated: `آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}`,
    },
    sections: [
      {
        icon: '🔐',
        title: '1. مقدمة',
        content:
          '<p>يلتزم FootballPulse بحماية خصوصيتك بأعلى مستويات الشفافية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند زيارة <strong>footballpulse.site</strong>.</p>',
      },
      {
        icon: '📊',
        title: '2. البيانات المجمعة',
        content: `
          <ul>
            <li><strong>بيانات التصفح</strong> — الصفحات التي تمت زيارتها، مدة الزيارة، نوع المتصفح، عنوان IP مجهول الهوية</li>
            <li><strong>ملفات تعريف الارتباط</strong> — ملفات تعريف الارتباط التقنية والإعلانية (Google AdSense)</li>
            <li><strong>بيانات تحليلية</strong> — عبر Vercel Analytics بشكل مجهول تمامًا</li>
          </ul>
        `,
      },
      {
        icon: '⚙️',
        title: '3. استخدام البيانات',
        content: `
          <ul>
            <li>تحسين تجربة المستخدم وجودة المحتوى</li>
            <li>تحليل اتجاهات حركة المرور</li>
            <li>عرض إعلانات ملائمة عبر Google AdSense</li>
          </ul>
        `,
      },
      {
        icon: '📢',
        title: '4. Google AdSense',
        content:
          '<p>نستخدم Google AdSense لعرض الإعلانات التي تمول محتوانا المجاني. يمكنك إلغاء الإعلانات المخصصة من <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">إعدادات إعلانات Google</a>.</p>',
      },
      {
        icon: '🛡️',
        title: '5. حقوقك (GDPR)',
        content: `
          <ul>
            <li><strong>حق الوصول</strong> — الحصول على نسخة من بياناتك</li>
            <li><strong>حق التصحيح</strong> — تصحيح المعلومات غير الدقيقة</li>
            <li><strong>حق الحذف</strong> — طلب حذف بياناتك</li>
            <li><strong>حق الاعتراض</strong> — رفض معالجة بياناتك</li>
          </ul>
          <p>للتواصل: <strong>contact@footballpulse.site</strong></p>
        `,
      },
      {
        icon: '📬',
        title: '6. اتصل بنا',
        content: '<p>لأي استفسار حول هذه السياسة: <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: 'أسئلة حول بياناتك؟',
      text: 'فريقنا متاح للإجابة على جميع استفساراتكم.',
    },
  },
  es: {
    hero: {
      title: 'Política de Privacidad',
      subtitle: 'Su privacidad es nuestra prioridad. Descubra cómo protegemos sus datos con total transparencia.',
      updated: `Última actualización: ${new Date().toLocaleDateString('es-ES')}`,
    },
    sections: [
      {
        icon: '🔐',
        title: '1. Introducción',
        content:
          '<p>FootballPulse se compromete firmemente a proteger su privacidad. Esta política explica con total transparencia cómo recopilamos, usamos y protegemos su información al visitar <strong>footballpulse.site</strong>.</p>',
      },
      {
        icon: '📊',
        title: '2. Datos recopilados',
        content: `
          <ul>
            <li><strong>Datos de navegación</strong> — Páginas visitadas, duración, tipo de navegador, IP anonimizada</li>
            <li><strong>Cookies</strong> — Cookies técnicas esenciales y cookies publicitarias (Google AdSense)</li>
            <li><strong>Datos analíticos</strong> — A través de Vercel Analytics, de forma completamente anónima</li>
          </ul>
        `,
      },
      {
        icon: '⚙️',
        title: '3. Uso de datos',
        content: `
          <ul>
            <li>Mejorar la experiencia del usuario y la calidad del contenido</li>
            <li>Analizar tendencias de tráfico</li>
            <li>Mostrar anuncios relevantes vía Google AdSense</li>
          </ul>
        `,
      },
      {
        icon: '📢',
        title: '4. Google AdSense',
        content:
          '<p>Utilizamos Google AdSense para mostrar anuncios que financian nuestro contenido gratuito. Puede desactivar la publicidad personalizada en <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Configuración de anuncios de Google</a>.</p>',
      },
      {
        icon: '🛡️',
        title: '5. Sus derechos (RGPD)',
        content: `
          <ul>
            <li><strong>Derecho de acceso</strong> — Obtenga una copia de sus datos</li>
            <li><strong>Derecho de rectificación</strong> — Corrija información inexacta</li>
            <li><strong>Derecho de supresión</strong> — Solicite la eliminación de sus datos</li>
            <li><strong>Derecho a la portabilidad</strong> — Transfiera sus datos</li>
            <li><strong>Derecho de oposición</strong> — Rechace el tratamiento de sus datos</li>
          </ul>
          <p>Para ejercer estos derechos: <strong>contact@footballpulse.site</strong></p>
        `,
      },
      {
        icon: '📬',
        title: '6. Contacto',
        content: '<p>Para cualquier consulta sobre esta política: <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: '¿Preguntas sobre sus datos?',
      text: 'Nuestro equipo está disponible para resolver todas sus dudas sobre la protección de sus datos personales.',
    },
  },
};

export default function PrivacyContent({ lang }: { lang: Lang }) {
  const c = content[lang];

  return (
    <main className="relative overflow-hidden">
      <ParallaxBg />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 py-24">
        <FloatingOrb size={400} top="-120px" left="-80px" delay={0} color="#8b5cf6" />
        <FloatingOrb size={300} bottom="-60px" right="-100px" delay={2} />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <AnimatedSection animation="blur" duration={1000}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{
                background: 'var(--accent)10',
                border: '1px solid var(--accent)30',
                color: 'var(--accent)',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              {c.hero.updated}
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">{c.hero.title}</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={400}>
            <p className="text-xl md:text-2xl opacity-70 leading-relaxed" style={{ color: 'var(--ink)' }}>
              {c.hero.subtitle}
            </p>
          </AnimatedSection>

          <AnimatedSection animation="scale" delay={600}>
            <div className="accent-separator mx-auto mt-8" />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ QUICK NAV / TABLE OF CONTENTS ═══ */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <GlassCard hover={false}>
              <div className="flex flex-wrap gap-3 justify-center">
                {c.sections.map((section, i) => (
                  <a
                    key={i}
                    href={`#privacy-section-${i}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <span>{section.icon}</span>
                    <span className="opacity-70">{section.title}</span>
                  </a>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ CONTENT SECTIONS ═══ */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {c.sections.map((section, i) => (
            <AnimatedSection
              key={i}
              animation={i % 2 === 0 ? 'fade-right' : 'fade-left'}
              delay={i * 80}
            >
              <div id={`privacy-section-${i}`} className="scroll-mt-24">
                <GlassCard>
                  <div className="flex items-start gap-5">
                    <div
                      className="text-3xl flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-500 hover:scale-110 hover:rotate-6"
                      style={{ background: 'var(--accent)10' }}
                    >
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="font-display text-xl md:text-2xl font-bold mb-4"
                        style={{ color: 'var(--ink)' }}
                      >
                        {section.title}
                      </h2>
                      <div
                        className="prose prose-lg prose-enhanced max-w-none"
                        style={{ color: 'var(--ink)' }}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  </div>
                </GlassCard>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT CTA ═══ */}
      <section className="relative z-10 py-20 px-4">
        <AnimatedSection animation="scale">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard hover={false}>
              <div
                className="absolute inset-0 rounded-2xl opacity-30"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf620 0%, transparent 50%, var(--accent)20 100%)',
                }}
              />
              <div className="relative z-10">
                <div className="text-5xl mb-4">🔒</div>
                <h2
                  className="font-display text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: 'var(--ink)' }}
                >
                  {c.contactCta.title}
                </h2>
                <p className="text-lg opacity-70 mb-8" style={{ color: 'var(--ink)' }}>
                  {c.contactCta.text}
                </p>
                <a
                  href="mailto:contact@footballpulse.site"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-500 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                    boxShadow: '0 4px 20px var(--accent)40',
                  }}
                >
                  <span>✉</span>
                  contact@footballpulse.site
                </a>
              </div>
            </GlassCard>
          </div>
        </AnimatedSection>
      </section>

      <div className="h-8" />
    </main>
  );
}