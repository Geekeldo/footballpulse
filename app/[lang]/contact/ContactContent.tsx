'use client';

import { useState } from 'react';
import type { Lang } from '@/lib/i18n';
import AnimatedSection from '@/components/ui/AnimatedSection';
import FloatingOrb from '@/components/ui/FloatingOrb';
import GlassCard from '@/components/ui/GlassCard';
import ParallaxBg from '@/components/ui/ParallaxBg';

interface ContactData {
  hero: { title: string; subtitle: string };
  cards: {
    email: { title: string; desc: string };
    social: { title: string; desc: string };
    info: { title: string; desc: string };
    hours: { title: string; desc: string };
  };
  form: {
    title: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    success: string;
  };
}

const content: Record<Lang, ContactData> = {
  fr: {
    hero: {
      title: 'Contactez-nous',
      subtitle: 'Une question, une suggestion, un partenariat ? Notre équipe est à votre écoute.',
    },
    cards: {
      email: {
        title: 'Email',
        desc: 'Notre méthode de contact privilégiée. Réponse sous 24h.',
      },
      social: {
        title: 'Réseaux Sociaux',
        desc: 'Suivez-nous pour les dernières actualités et coulisses.',
      },
      info: {
        title: 'Informations',
        desc: 'FootballPulse — Plateforme indépendante d\'actualités football.',
      },
      hours: {
        title: 'Disponibilité',
        desc: 'Notre rédaction est active 24h/24, 7j/7. Temps de réponse moyen : 12h.',
      },
    },
    form: {
      title: 'Envoyez-nous un message',
      name: 'Votre nom',
      email: 'Votre email',
      subject: 'Sujet',
      message: 'Votre message',
      send: 'Envoyer le message',
      success: 'Message envoyé avec succès ! Nous vous répondrons rapidement.',
    },
  },
  en: {
    hero: {
      title: 'Contact Us',
      subtitle: 'Got a question, suggestion, or partnership idea? Our team is all ears.',
    },
    cards: {
      email: {
        title: 'Email',
        desc: 'Our preferred contact method. Response within 24 hours.',
      },
      social: {
        title: 'Social Media',
        desc: 'Follow us for the latest news and behind-the-scenes content.',
      },
      info: {
        title: 'Information',
        desc: 'FootballPulse — Independent Football News Platform.',
      },
      hours: {
        title: 'Availability',
        desc: 'Our newsroom runs 24/7. Average response time: 12 hours.',
      },
    },
    form: {
      title: 'Send us a message',
      name: 'Your name',
      email: 'Your email',
      subject: 'Subject',
      message: 'Your message',
      send: 'Send Message',
      success: 'Message sent successfully! We\'ll get back to you soon.',
    },
  },
  ar: {
    hero: {
      title: 'تواصل معنا',
      subtitle: 'لديك سؤال أو اقتراح أو فكرة شراكة؟ فريقنا مستعد للاستماع.',
    },
    cards: {
      email: { title: 'البريد الإلكتروني', desc: 'طريقتنا المفضلة للتواصل. الرد خلال 24 ساعة.' },
      social: { title: 'وسائل التواصل', desc: 'تابعنا لآخر الأخبار والكواليس.' },
      info: { title: 'معلومات', desc: 'FootballPulse — منصة أخبار كرة القدم المستقلة.' },
      hours: { title: 'التوفر', desc: 'فريقنا يعمل على مدار الساعة. متوسط وقت الرد: 12 ساعة.' },
    },
    form: {
      title: 'أرسل لنا رسالة',
      name: 'اسمك',
      email: 'بريدك الإلكتروني',
      subject: 'الموضوع',
      message: 'رسالتك',
      send: 'إرسال الرسالة',
      success: 'تم إرسال الرسالة بنجاح! سنرد عليك قريبًا.',
    },
  },
  es: {
    hero: {
      title: 'Contáctenos',
      subtitle: '¿Tiene una pregunta, sugerencia o idea de colaboración? Estamos aquí para usted.',
    },
    cards: {
      email: { title: 'Email', desc: 'Nuestro método de contacto preferido. Respuesta en 24 horas.' },
      social: { title: 'Redes Sociales', desc: 'Síguenos para las últimas noticias y contenido exclusivo.' },
      info: { title: 'Información', desc: 'FootballPulse — Plataforma independiente de noticias de fútbol.' },
      hours: { title: 'Disponibilidad', desc: 'Nuestra redacción trabaja 24/7. Tiempo de respuesta: 12 horas.' },
    },
    form: {
      title: 'Envíenos un mensaje',
      name: 'Su nombre',
      email: 'Su email',
      subject: 'Asunto',
      message: 'Su mensaje',
      send: 'Enviar mensaje',
      success: '¡Mensaje enviado! Le responderemos pronto.',
    },
  },
};

const contactCards = [
  {
    key: 'email' as const,
    icon: '✉️',
    link: 'mailto:contact@footballpulse.site',
    value: 'contact@footballpulse.site',
    color: '#3b82f6',
  },
  {
    key: 'social' as const,
    icon: '🌐',
    value: 'Twitter · Instagram · Facebook',
    color: '#8b5cf6',
  },
  {
    key: 'info' as const,
    icon: '📍',
    value: 'footballpulse.site',
    color: '#f97316',
  },
  {
    key: 'hours' as const,
    icon: '🕐',
    value: '24/7',
    color: '#10b981',
  },
];

export default function ContactContent({ lang }: { lang: Lang }) {
  const c = content[lang];
  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSent(true);
    }, 1500);
  };

  return (
    <main className="relative overflow-hidden">
      <ParallaxBg />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[45vh] flex items-center justify-center px-4 py-24">
        <FloatingOrb size={350} top="-80px" right="-80px" delay={0} />
        <FloatingOrb size={250} bottom="0" left="-60px" delay={3} color="#8b5cf6" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <AnimatedSection animation="blur" duration={1000}>
            <p
              className="text-sm uppercase tracking-[0.3em] mb-6 font-medium"
              style={{ color: 'var(--accent)' }}
            >
              ● Contact
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
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

      {/* ═══ CONTACT CARDS ═══ */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactCards.map((card, i) => (
            <AnimatedSection key={card.key} animation="fade-up" delay={i * 120}>
              <GlassCard className="text-center h-full group">
                <div
                  className="text-4xl mb-4 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: `${card.color}15` }}
                >
                  {card.icon}
                </div>
                <h3
                  className="font-display text-lg font-bold mb-2"
                  style={{ color: 'var(--ink)' }}
                >
                  {c.cards[card.key].title}
                </h3>
                <p className="text-sm opacity-60 mb-3 leading-relaxed" style={{ color: 'var(--ink)' }}>
                  {c.cards[card.key].desc}
                </p>
                {card.link ? (
                  <a
                    href={card.link}
                    className="text-sm font-semibold link-underline transition-colors duration-300"
                    style={{ color: 'var(--accent)' }}
                  >
                    {card.value}
                  </a>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    {card.value}
                  </p>
                )}
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT FORM ═══ */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection animation="fade-up">
            <GlassCard hover={false}>
              <h2
                className="font-display text-2xl md:text-3xl font-bold mb-8 text-center"
                style={{ color: 'var(--ink)' }}
              >
                {c.form.title}
              </h2>

              {formSent ? (
                <AnimatedSection animation="scale">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 animate-bounce">✅</div>
                    <p className="text-lg font-medium" style={{ color: 'var(--accent)' }}>
                      {c.form.success}
                    </p>
                  </div>
                </AnimatedSection>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2 opacity-70"
                        style={{ color: 'var(--ink)' }}
                      >
                        {c.form.name}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.01]"
                        style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--ink)',
                          // @ts-ignore
                          '--tw-ring-color': 'var(--accent)',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2 opacity-70"
                        style={{ color: 'var(--ink)' }}
                      >
                        {c.form.email}
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.01]"
                        style={{
                          background: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--ink)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2 opacity-70"
                      style={{ color: 'var(--ink)' }}
                    >
                      {c.form.subject}
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.01]"
                      style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--ink)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2 opacity-70"
                      style={{ color: 'var(--ink)' }}
                    >
                      {c.form.message}
                    </label>
                    <textarea
                      rows={5}
                      required
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.01] resize-none"
                      style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--ink)',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), #f97316)',
                      boxShadow: '0 4px 20px var(--accent)40',
                    }}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        ...
                      </span>
                    ) : (
                      c.form.send
                    )}
                  </button>
                </form>
              )}
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      <div className="h-8" />
    </main>
  );
}