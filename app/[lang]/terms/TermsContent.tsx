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

interface TermsData {
  hero: { title: string; subtitle: string; updated: string };
  sections: SectionBlock[];
  contactCta: { title: string; text: string };
}

const content: Record<Lang, TermsData> = {
  fr: {
    hero: {
      title: "Conditions d'Utilisation",
      subtitle: 'Les règles qui encadrent votre utilisation de FootballPulse. Lisez-les attentivement.',
      updated: `Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}`,
    },
    sections: [
      {
        icon: '✅',
        title: '1. Acceptation des conditions',
        content:
          "<p>En accédant à <strong>footballpulse.site</strong>, vous acceptez d'être lié par les présentes conditions d'utilisation dans leur intégralité. Si vous n'acceptez pas ces conditions, nous vous invitons à ne pas utiliser ce site. Votre utilisation continue du site constitue votre acceptation de ces termes et de toute modification ultérieure.</p>",
      },
      {
        icon: '📰',
        title: '2. Description du service',
        content:
          "<p>FootballPulse est une plateforme d'information sportive premium dédiée au football mondial. Nous publions des articles, analyses tactiques approfondies, résultats en direct et actualités de dernière minute couvrant l'ensemble des grandes ligues et compétitions internationales, le tout disponible en quatre langues : français, anglais, arabe et espagnol.</p>",
      },
      {
        icon: '©️',
        title: '3. Propriété intellectuelle',
        content:
          "<p>L'intégralité du contenu publié sur FootballPulse — incluant mais ne se limitant pas aux textes, images, photographies, logos, graphiques, mise en page et design — est protégée par le droit d'auteur et les lois relatives à la propriété intellectuelle. Toute reproduction, distribution ou utilisation non autorisée est <strong>strictement interdite</strong> et peut faire l'objet de poursuites judiciaires.</p>",
      },
      {
        icon: '📋',
        title: '4. Utilisation du contenu',
        content: `
          <p><strong>✓ Usages autorisés :</strong></p>
          <ul>
            <li>Lire et consulter nos articles à titre personnel</li>
            <li>Partager nos articles via les fonctionnalités de partage intégrées</li>
            <li>Citer des extraits courts avec attribution claire à FootballPulse et lien vers l'article source</li>
          </ul>
          <p><strong>✗ Usages interdits :</strong></p>
          <ul>
            <li>Reproduire intégralement ou partiellement nos articles sans autorisation écrite</li>
            <li>Utiliser notre contenu à des fins commerciales sans accord préalable</li>
            <li>Modifier, altérer ou dénaturer notre contenu éditorial</li>
            <li>Utiliser des robots ou scripts pour extraire automatiquement notre contenu</li>
          </ul>
        `,
      },
      {
        icon: '💰',
        title: '5. Publicités',
        content:
          "<p>Ce site affiche des publicités via <strong>Google AdSense</strong>. Ces publicités constituent notre principale source de revenus et nous permettent de financer le fonctionnement de la plateforme, la rémunération de nos journalistes, et de continuer à produire un contenu de qualité entièrement gratuit pour nos lecteurs. En utilisant ce site, vous acceptez la présence de ces publicités.</p>",
      },
      {
        icon: '⚖️',
        title: '6. Limitation de responsabilité',
        content:
          "<p>Les informations publiées sur FootballPulse sont fournies à titre purement informatif. Bien que nous nous efforcions d'assurer l'exactitude et l'actualité de toutes les informations, nous ne pouvons garantir l'absence totale d'erreurs ou d'omissions. FootballPulse décline toute responsabilité quant aux décisions prises sur la base des informations publiées sur le site, notamment en matière de paris sportifs.</p>",
      },
      {
        icon: '🔗',
        title: '7. Liens externes',
        content:
          "<p>Notre site peut contenir des liens hypertextes vers des sites tiers. Ces liens sont fournis uniquement à titre de commodité et d'information. FootballPulse n'exerce aucun contrôle sur le contenu de ces sites externes et décline toute responsabilité quant à leur contenu, leurs pratiques de confidentialité ou leur disponibilité.</p>",
      },
      {
        icon: '🔄',
        title: '8. Modifications',
        content:
          '<p>FootballPulse se réserve le droit de modifier, compléter ou mettre à jour les présentes conditions à tout moment et sans préavis. Les modifications prennent effet dès leur publication sur cette page. Il vous appartient de consulter régulièrement cette page pour prendre connaissance des éventuelles mises à jour.</p>',
      },
      {
        icon: '📬',
        title: '9. Contact',
        content:
          '<p>Pour toute question, réclamation ou demande relative aux présentes conditions d\'utilisation, vous pouvez nous contacter à l\'adresse suivante : <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: 'Des questions sur nos conditions ?',
      text: "Notre équipe juridique est à votre disposition pour clarifier tout point de ces conditions d'utilisation.",
    },
  },
  en: {
    hero: {
      title: 'Terms of Use',
      subtitle: 'The rules governing your use of FootballPulse. Please read them carefully.',
      updated: `Last updated: ${new Date().toLocaleDateString('en-US')}`,
    },
    sections: [
      {
        icon: '✅',
        title: '1. Acceptance of Terms',
        content:
          '<p>By accessing <strong>footballpulse.site</strong>, you agree to be bound by these terms of use in their entirety. If you do not agree, please refrain from using this site. Your continued use constitutes acceptance of these terms and any subsequent modifications.</p>',
      },
      {
        icon: '📰',
        title: '2. Service Description',
        content:
          '<p>FootballPulse is a premium sports information platform dedicated to world football. We publish articles, in-depth tactical analyses, live results, and breaking news covering all major leagues and international competitions — available in four languages: French, English, Arabic, and Spanish.</p>',
      },
      {
        icon: '©️',
        title: '3. Intellectual Property',
        content:
          '<p>All content published on FootballPulse — including but not limited to text, images, photographs, logos, graphics, layout, and design — is protected by copyright and intellectual property laws. Any unauthorized reproduction, distribution, or use is <strong>strictly prohibited</strong> and may result in legal action.</p>',
      },
      {
        icon: '📋',
        title: '4. Content Usage',
        content: `
          <p><strong>✓ Permitted uses:</strong></p>
          <ul>
            <li>Read and browse our articles for personal use</li>
            <li>Share articles using built-in sharing features</li>
            <li>Quote short excerpts with clear attribution and a link to the source article</li>
          </ul>
          <p><strong>✗ Prohibited uses:</strong></p>
          <ul>
            <li>Reproduce our articles in whole or in part without written permission</li>
            <li>Use our content for commercial purposes without prior agreement</li>
            <li>Modify, alter, or distort our editorial content</li>
            <li>Use bots or scripts to automatically scrape our content</li>
          </ul>
        `,
      },
      {
        icon: '💰',
        title: '5. Advertising',
        content:
          '<p>This site displays advertisements via <strong>Google AdSense</strong>. These ads are our primary revenue source, enabling us to fund platform operations, compensate our journalists, and continue producing quality content entirely free of charge for our readers.</p>',
      },
      {
        icon: '⚖️',
        title: '6. Limitation of Liability',
        content:
          '<p>Information published on FootballPulse is provided for informational purposes only. While we strive for accuracy and timeliness, we cannot guarantee the complete absence of errors or omissions. FootballPulse disclaims all liability for decisions made based on information published on this site, particularly regarding sports betting.</p>',
      },
      {
        icon: '🔗',
        title: '7. External Links',
        content:
          '<p>Our site may contain hyperlinks to third-party websites. These links are provided for convenience and information only. FootballPulse exercises no control over external site content and disclaims all responsibility for their content, privacy practices, or availability.</p>',
      },
      {
        icon: '🔄',
        title: '8. Modifications',
        content:
          '<p>FootballPulse reserves the right to modify, supplement, or update these terms at any time without prior notice. Changes take effect upon publication on this page. We encourage you to review this page regularly.</p>',
      },
      {
        icon: '📬',
        title: '9. Contact',
        content:
          '<p>For any questions, complaints, or requests regarding these terms: <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: 'Questions about our terms?',
      text: 'Our team is available to clarify any aspect of these terms of use.',
    },
  },
  ar: {
    hero: {
      title: 'شروط الاستخدام',
      subtitle: 'القواعد التي تحكم استخدامك لـ FootballPulse. يرجى قراءتها بعناية.',
      updated: `آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}`,
    },
    sections: [
      {
        icon: '✅',
        title: '1. قبول الشروط',
        content:
          '<p>بالوصول إلى <strong>footballpulse.site</strong>، فإنك توافق على الالتزام بشروط الاستخدام هذه بالكامل. إذا كنت لا توافق، يرجى الامتناع عن استخدام هذا الموقع.</p>',
      },
      {
        icon: '📰',
        title: '2. وصف الخدمة',
        content:
          '<p>FootballPulse هي منصة إخبارية رياضية متميزة مخصصة لكرة القدم العالمية. ننشر المقالات والتحليلات التكتيكية والنتائج المباشرة وآخر الأخبار بأربع لغات.</p>',
      },
      {
        icon: '©️',
        title: '3. الملكية الفكرية',
        content:
          '<p>جميع المحتويات المنشورة على FootballPulse محمية بموجب حقوق النشر وقوانين الملكية الفكرية. يحظر أي إعادة إنتاج أو توزيع أو استخدام غير مصرح به <strong>حظرًا صارمًا</strong>.</p>',
      },
      {
        icon: '💰',
        title: '4. الإعلانات',
        content:
          '<p>يعرض هذا الموقع إعلانات عبر <strong>Google AdSense</strong>. تمكننا هذه الإعلانات من تمويل المنصة والاستمرار في إنتاج محتوى مجاني عالي الجودة.</p>',
      },
      {
        icon: '⚖️',
        title: '5. تحديد المسؤولية',
        content:
          '<p>المعلومات المنشورة مقدمة لأغراض إعلامية فقط. رغم سعينا للدقة، لا يمكننا ضمان خلو المحتوى تمامًا من الأخطاء.</p>',
      },
      {
        icon: '📬',
        title: '6. اتصل بنا',
        content: '<p>لأي استفسار: <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: 'أسئلة حول شروطنا؟',
      text: 'فريقنا متاح لتوضيح أي نقطة من شروط الاستخدام.',
    },
  },
  es: {
    hero: {
      title: 'Términos de Uso',
      subtitle: 'Las reglas que rigen su uso de FootballPulse. Léalas detenidamente.',
      updated: `Última actualización: ${new Date().toLocaleDateString('es-ES')}`,
    },
    sections: [
      {
        icon: '✅',
        title: '1. Aceptación de los términos',
        content:
          '<p>Al acceder a <strong>footballpulse.site</strong>, usted acepta quedar vinculado por estos términos de uso en su totalidad. Si no está de acuerdo, le rogamos que no utilice este sitio.</p>',
      },
      {
        icon: '📰',
        title: '2. Descripción del servicio',
        content:
          '<p>FootballPulse es una plataforma de información deportiva premium dedicada al fútbol mundial. Publicamos artículos, análisis tácticos, resultados en vivo y noticias de última hora en cuatro idiomas.</p>',
      },
      {
        icon: '©️',
        title: '3. Propiedad intelectual',
        content:
          '<p>Todo el contenido publicado en FootballPulse está protegido por derechos de autor y leyes de propiedad intelectual. Cualquier reproducción, distribución o uso no autorizado está <strong>estrictamente prohibido</strong>.</p>',
      },
      {
        icon: '📋',
        title: '4. Uso del contenido',
        content: `
          <p><strong>✓ Usos permitidos:</strong></p>
          <ul>
            <li>Leer y compartir artículos mediante las funciones integradas</li>
            <li>Citar extractos breves con atribución clara a FootballPulse</li>
          </ul>
          <p><strong>✗ Usos prohibidos:</strong></p>
          <ul>
            <li>Reproducir artículos sin autorización escrita</li>
            <li>Usar contenido con fines comerciales sin acuerdo previo</li>
            <li>Modificar o distorsionar contenido editorial</li>
          </ul>
        `,
      },
      {
        icon: '💰',
        title: '5. Publicidad',
        content:
          '<p>Este sitio muestra anuncios a través de <strong>Google AdSense</strong> para financiar la producción de contenido gratuito y de calidad.</p>',
      },
      {
        icon: '⚖️',
        title: '6. Limitación de responsabilidad',
        content:
          '<p>La información se proporciona con fines informativos. Nos esforzamos por la precisión pero no podemos garantizar la ausencia total de errores.</p>',
      },
      {
        icon: '📬',
        title: '7. Contacto',
        content: '<p>Para cualquier consulta: <strong>contact@footballpulse.site</strong></p>',
      },
    ],
    contactCta: {
      title: '¿Preguntas sobre nuestros términos?',
      text: 'Nuestro equipo está disponible para aclarar cualquier aspecto de estos términos de uso.',
    },
  },
};

export default function TermsContent({ lang }: { lang: Lang }) {
  const c = content[lang];

  return (
    <main className="relative overflow-hidden">
      <ParallaxBg />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 py-24">
        <FloatingOrb size={380} top="-100px" right="-60px" delay={0} color="#f97316" />
        <FloatingOrb size={280} bottom="-80px" left="-80px" delay={3} color="#3b82f6" />

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
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--accent)' }}
              />
              {c.hero.updated}
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">{c.hero.title}</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={400}>
            <p
              className="text-xl md:text-2xl opacity-70 leading-relaxed"
              style={{ color: 'var(--ink)' }}
            >
              {c.hero.subtitle}
            </p>
          </AnimatedSection>

          <AnimatedSection animation="scale" delay={600}>
            <div className="accent-separator mx-auto mt-8" />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ PROGRESS INDICATOR ═══ */}
      <section className="relative z-10 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <GlassCard hover={false}>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {c.sections.map((section, i) => (
                  <a
                    key={i}
                    href={`#terms-section-${i}`}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                    }}
                  >
                    <span>{section.icon}</span>
                    <span className="opacity-60 hidden sm:inline">{section.title.split('. ')[1] || section.title}</span>
                    <span className="opacity-60 sm:hidden">{i + 1}</span>
                  </a>
                ))}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ CONTENT SECTIONS ═══ */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Visual timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute top-0 bottom-0 w-px hidden md:block"
              style={{
                left: '28px',
                background: 'linear-gradient(180deg, var(--accent)40 0%, var(--border) 50%, var(--accent)40 100%)',
              }}
            />

            <div className="space-y-8">
              {c.sections.map((section, i) => (
                <AnimatedSection
                  key={i}
                  animation="fade-up"
                  delay={i * 60}
                >
                  <div
                    id={`terms-section-${i}`}
                    className="scroll-mt-24 relative md:pl-16"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-5 top-8 w-7 h-7 rounded-full hidden md:flex items-center justify-center text-xs z-10 transition-all duration-500"
                      style={{
                        background: 'var(--surface)',
                        border: '2px solid var(--accent)',
                        color: 'var(--accent)',
                        boxShadow: '0 0 15px var(--accent)20',
                      }}
                    >
                      {i + 1}
                    </div>

                    <GlassCard>
                      <div className="flex items-start gap-4">
                        <div
                          className="text-3xl flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center md:hidden"
                          style={{ background: 'var(--accent)10' }}
                        >
                          {section.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="text-2xl hidden md:block"
                            >
                              {section.icon}
                            </div>
                            <h2
                              className="font-display text-xl md:text-2xl font-bold"
                              style={{ color: 'var(--ink)' }}
                            >
                              {section.title}
                            </h2>
                          </div>
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
          </div>
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
                  background: 'linear-gradient(135deg, #f9731620 0%, transparent 50%, var(--accent)20 100%)',
                }}
              />
              <div className="relative z-10">
                <div className="text-5xl mb-4">⚖️</div>
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
                    background: 'linear-gradient(135deg, var(--accent), #f97316)',
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