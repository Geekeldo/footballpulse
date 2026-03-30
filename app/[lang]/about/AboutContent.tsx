'use client';

import type { Lang } from '@/lib/i18n';
import AnimatedSection from '@/components/ui/AnimatedSection';
import FloatingOrb from '@/components/ui/FloatingOrb';
import GlassCard from '@/components/ui/GlassCard';
import CounterStat from '@/components/ui/CounterStat';
import ParallaxBg from '@/components/ui/ParallaxBg';

interface ContentData {
  hero: { title: string; subtitle: string; tagline: string };
  mission: { title: string; text: string };
  offer: { title: string; text: string };
  team: { title: string; text: string };
  contact: { title: string; text: string; email: string };
  values: {
    title: string;
    items: { icon: string; name: string; desc: string }[];
  };
  stats: { leagues: string; languages: string; articles: string; coverage: string };
}

const content: Record<Lang, ContentData> = {
  fr: {
    hero: {
      title: 'À propos de',
      subtitle: 'FootballPulse',
      tagline: 'Le pouls du football mondial, à portée de clic.',
    },
    mission: {
      title: 'Notre Mission',
      text: "FootballPulse est votre source premium d'actualités footballistiques mondiales. Nous couvrons les transferts, les analyses tactiques, les résultats et les dernières nouvelles de toutes les grandes ligues — de la Premier League à la Liga, de la Serie A à la Bundesliga, sans oublier la Ligue 1 et les compétitions internationales.",
    },
    offer: {
      title: 'Ce que nous proposons',
      text: "Notre plateforme offre une couverture complète du football mondial, disponible en quatre langues : français, anglais, arabe et espagnol. Nous nous engageons à fournir des informations vérifiées, des analyses approfondies signées par des experts, et un contenu éditorial de la plus haute qualité.",
    },
    team: {
      title: 'Notre Équipe',
      text: "FootballPulse est alimenté par une équipe de journalistes sportifs passionnés et d'analystes tactiques reconnus. Notre rédaction travaille sans relâche, 24 heures sur 24, pour vous offrir une couverture en temps réel des événements qui comptent.",
    },
    contact: {
      title: 'Contactez-nous',
      text: 'Pour toute question, suggestion ou opportunité de partenariat, notre équipe se tient à votre disposition.',
      email: 'contact@footballpulse.site',
    },
    values: {
      title: 'Nos Valeurs',
      items: [
        { icon: '🎯', name: 'Précision', desc: 'Chaque information est vérifiée auprès de sources fiables avant publication.' },
        { icon: '⚡', name: 'Rapidité', desc: "Les dernières nouvelles en temps réel, avant tout le monde." },
        { icon: '🌍', name: 'Accessibilité', desc: 'Un contenu de qualité disponible en 4 langues pour une audience mondiale.' },
        { icon: '❤️', name: 'Passion', desc: 'Le football au cœur de chaque mot, chaque analyse, chaque article.' },
      ],
    },
    stats: { leagues: 'Ligues couvertes', languages: 'Langues', articles: 'Articles publiés', coverage: 'Heures de couverture' },
  },
  en: {
    hero: {
      title: 'About',
      subtitle: 'FootballPulse',
      tagline: 'The heartbeat of world football, one click away.',
    },
    mission: {
      title: 'Our Mission',
      text: 'FootballPulse is your premium source for worldwide football news. We cover transfers, tactical analysis, match results, and breaking news from every major league — from the Premier League to La Liga, Serie A to the Bundesliga, Ligue 1, and international competitions.',
    },
    offer: {
      title: 'What We Offer',
      text: 'Our platform provides comprehensive coverage of world football, available in four languages: French, English, Arabic, and Spanish. We are committed to delivering verified information, expert-backed analysis, and the highest quality editorial content.',
    },
    team: {
      title: 'Our Team',
      text: 'FootballPulse is powered by a team of passionate sports journalists and acclaimed tactical analysts. Our newsroom operates around the clock to deliver real-time coverage of the events that matter.',
    },
    contact: {
      title: 'Get in Touch',
      text: 'Whether you have a question, a suggestion, or a partnership opportunity — our team is here for you.',
      email: 'contact@footballpulse.site',
    },
    values: {
      title: 'Our Values',
      items: [
        { icon: '🎯', name: 'Accuracy', desc: 'Every story is fact-checked against reliable sources before publication.' },
        { icon: '⚡', name: 'Speed', desc: 'Breaking news delivered in real time, before anyone else.' },
        { icon: '🌍', name: 'Accessibility', desc: 'Quality content in 4 languages for a truly global audience.' },
        { icon: '❤️', name: 'Passion', desc: 'Football at the heart of every word, every analysis, every article.' },
      ],
    },
    stats: { leagues: 'Leagues Covered', languages: 'Languages', articles: 'Articles Published', coverage: 'Coverage Hours' },
  },
  ar: {
    hero: {
      title: 'حول',
      subtitle: 'FootballPulse',
      tagline: 'نبض كرة القدم العالمية، بنقرة واحدة.',
    },
    mission: {
      title: 'مهمتنا',
      text: 'FootballPulse هو مصدرك المتميز لأخبار كرة القدم العالمية. نغطي الانتقالات والتحليلات التكتيكية والنتائج وآخر الأخبار من جميع الدوريات الكبرى — من الدوري الإنجليزي الممتاز إلى الليغا، من الدوري الإيطالي إلى البوندسليغا والمسابقات الدولية.',
    },
    offer: {
      title: 'ما نقدمه',
      text: 'توفر منصتنا تغطية شاملة لكرة القدم العالمية، متاحة بأربع لغات: الفرنسية والإنجليزية والعربية والإسبانية. نلتزم بتقديم معلومات موثوقة وتحليلات معمقة ومحتوى تحريري عالي الجودة.',
    },
    team: {
      title: 'فريقنا',
      text: 'يعمل فريق FootballPulse من صحفيين رياضيين شغوفين ومحللين تكتيكيين معترف بهم على مدار الساعة لتقديم تغطية فورية للأحداث المهمة.',
    },
    contact: {
      title: 'تواصل معنا',
      text: 'لأي استفسار أو اقتراح أو فرصة شراكة، فريقنا في خدمتكم.',
      email: 'contact@footballpulse.site',
    },
    values: {
      title: 'قيمنا',
      items: [
        { icon: '🎯', name: 'الدقة', desc: 'كل خبر يتم التحقق منه من مصادر موثوقة قبل النشر.' },
        { icon: '⚡', name: 'السرعة', desc: 'آخر الأخبار في الوقت الفعلي.' },
        { icon: '🌍', name: 'الوصول', desc: 'محتوى بـ 4 لغات لجمهور عالمي.' },
        { icon: '❤️', name: 'الشغف', desc: 'كرة القدم في قلب كل كلمة وكل تحليل.' },
      ],
    },
    stats: { leagues: 'دوريات مغطاة', languages: 'لغات', articles: 'مقالات منشورة', coverage: 'ساعات تغطية' },
  },
  es: {
    hero: {
      title: 'Acerca de',
      subtitle: 'FootballPulse',
      tagline: 'El pulso del fútbol mundial, a un clic de distancia.',
    },
    mission: {
      title: 'Nuestra Misión',
      text: 'FootballPulse es tu fuente premium de noticias de fútbol mundial. Cubrimos fichajes, análisis tácticos, resultados y las últimas noticias de todas las grandes ligas — desde la Premier League hasta La Liga, de la Serie A a la Bundesliga, la Ligue 1 y las competiciones internacionales.',
    },
    offer: {
      title: 'Lo que ofrecemos',
      text: 'Nuestra plataforma ofrece una cobertura integral del fútbol mundial, disponible en cuatro idiomas: francés, inglés, árabe y español. Nos comprometemos a ofrecer información verificada, análisis experto y contenido editorial de la más alta calidad.',
    },
    team: {
      title: 'Nuestro Equipo',
      text: 'FootballPulse está impulsado por un equipo de periodistas deportivos apasionados y analistas tácticos reconocidos. Nuestra redacción trabaja las 24 horas para ofrecerte cobertura en tiempo real.',
    },
    contact: {
      title: 'Contáctenos',
      text: 'Para cualquier pregunta, sugerencia u oportunidad de colaboración, nuestro equipo está a su disposición.',
      email: 'contact@footballpulse.site',
    },
    values: {
      title: 'Nuestros Valores',
      items: [
        { icon: '🎯', name: 'Precisión', desc: 'Cada noticia se verifica con fuentes confiables antes de su publicación.' },
        { icon: '⚡', name: 'Velocidad', desc: 'Noticias de última hora en tiempo real.' },
        { icon: '🌍', name: 'Accesibilidad', desc: 'Contenido de calidad en 4 idiomas para una audiencia global.' },
        { icon: '❤️', name: 'Pasión', desc: 'El fútbol en el corazón de cada palabra y cada análisis.' },
      ],
    },
    stats: { leagues: 'Ligas cubiertas', languages: 'Idiomas', articles: 'Artículos publicados', coverage: 'Horas de cobertura' },
  },
};

export default function AboutContent({ lang }: { lang: Lang }) {
  const c = content[lang];

  return (
    <main className="relative overflow-hidden">
      <ParallaxBg />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-24">
        <FloatingOrb size={400} top="-100px" left="-100px" delay={0} />
        <FloatingOrb size={300} top="100px" right="-80px" delay={2} color="#f97316" />
        <FloatingOrb size={200} bottom="-50px" left="30%" delay={4} />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <AnimatedSection animation="blur" duration={1000}>
            <p
              className="text-sm uppercase tracking-[0.3em] mb-6 font-medium"
              style={{ color: 'var(--accent)' }}
            >
              ● {c.hero.title}
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200} duration={1000}>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-[0.9]">
              <span className="text-gradient">{c.hero.subtitle}</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={500} duration={800}>
            <p
              className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed opacity-70"
              style={{ color: 'var(--ink)' }}
            >
              {c.hero.tagline}
            </p>
          </AnimatedSection>

          <AnimatedSection animation="scale" delay={800}>
            <div className="accent-separator mx-auto mt-10" />
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ STATS BAND ═══ */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <GlassCard hover={false}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              <AnimatedSection animation="scale" delay={0}>
                <CounterStat end={50} suffix="+" label={c.stats.leagues} />
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={150}>
                <CounterStat end={4} label={c.stats.languages} />
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={300}>
                <CounterStat end={1200} suffix="+" label={c.stats.articles} />
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={450}>
                <CounterStat end={24} suffix="/7" label={c.stats.coverage} />
              </AnimatedSection>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ═══ MISSION + OFFER (Two columns) ═══ */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <AnimatedSection animation="fade-right" delay={0}>
            <GlassCard className="h-full">
              <div
                className="text-4xl mb-4 w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)15' }}
              >
                🚀
              </div>
              <h2
                className="font-display text-2xl md:text-3xl font-bold mb-4"
                style={{ color: 'var(--ink)' }}
              >
                {c.mission.title}
              </h2>
              <p className="text-lg leading-relaxed opacity-80" style={{ color: 'var(--ink)' }}>
                {c.mission.text}
              </p>
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection animation="fade-left" delay={200}>
            <GlassCard className="h-full">
              <div
                className="text-4xl mb-4 w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)15' }}
              >
                📡
              </div>
              <h2
                className="font-display text-2xl md:text-3xl font-bold mb-4"
                style={{ color: 'var(--ink)' }}
              >
                {c.offer.title}
              </h2>
              <p className="text-lg leading-relaxed opacity-80" style={{ color: 'var(--ink)' }}>
                {c.offer.text}
              </p>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <div
              className="text-6xl mb-6 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'var(--accent)10' }}
            >
              👥
            </div>
            <h2
              className="font-display text-3xl md:text-4xl font-bold mb-6"
              style={{ color: 'var(--ink)' }}
            >
              {c.team.title}
            </h2>
            <p
              className="text-xl leading-relaxed opacity-80 max-w-2xl mx-auto"
              style={{ color: 'var(--ink)' }}
            >
              {c.team.text}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ VALUES ═══ */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2
              className="font-display text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--ink)' }}
            >
              {c.values.title}
            </h2>
            <div className="accent-separator mx-auto mt-4" />
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.values.items.map((item, i) => (
              <AnimatedSection key={item.name} animation="fade-up" delay={i * 150}>
                <GlassCard className="text-center h-full group">
                  <div
                    className="text-5xl mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                  >
                    {item.icon}
                  </div>
                  <h3
                    className="font-display text-xl font-bold mb-2"
                    style={{ color: 'var(--ink)' }}
                  >
                    {item.name}
                  </h3>
                  <p className="opacity-70 leading-relaxed" style={{ color: 'var(--ink)' }}>
                    {item.desc}
                  </p>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT CTA ═══ */}
      <section className="relative z-10 py-20 px-4">
        <AnimatedSection animation="scale">
          <div className="max-w-3xl mx-auto text-center">
            <GlassCard hover={false}>
              <div
                className="absolute inset-0 rounded-2xl opacity-40"
                style={{
                  background:
                    'linear-gradient(135deg, var(--accent)10 0%, transparent 50%, #f9731610 100%)',
                }}
              />
              <div className="relative z-10">
                <h2
                  className="font-display text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: 'var(--ink)' }}
                >
                  {c.contact.title}
                </h2>
                <p className="text-lg opacity-70 mb-8" style={{ color: 'var(--ink)' }}>
                  {c.contact.text}
                </p>
                <a
                  href={`mailto:${c.contact.email}`}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-500 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), #f97316)',
                    boxShadow: '0 4px 20px var(--accent)40',
                  }}
                >
                  <span>✉</span>
                  {c.contact.email}
                </a>
              </div>
            </GlassCard>
          </div>
        </AnimatedSection>
      </section>

      {/* Bottom spacer */}
      <div className="h-8" />
    </main>
  );
}