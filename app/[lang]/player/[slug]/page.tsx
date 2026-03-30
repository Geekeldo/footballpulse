import { Metadata } from 'next';
import { type Lang, SUPPORTED_LANGS, t, isRTL } from '@/lib/i18n';
import { supabaseAdmin } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type Props = { params: { lang: string; slug: string } };

function safeText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function safeHtml(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.replace(/\n/g, '<br/>');
  if (Array.isArray(value)) return value.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('<br/>');
  return String(value);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: player } = await supabaseAdmin
    .from('players').select('name, bio, team_name, nationality').eq('slug', params.slug).single();

  if (!player) return {};
  const bio = (player.bio as any)?.[params.lang] || (player.bio as any)?.en || {};
  return {
    title: `${player.name} — ${player.team_name || 'Football'} | FootballPulse`,
    description: bio.description || `${player.name} player profile, career stats and news.`,
    alternates: {
      canonical: `https://footballpulse.site/${params.lang}/player/${params.slug}`,
      languages: Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://footballpulse.site/${l}/player/${params.slug}`])),
    },
  };
}

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function PlayerPage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!SUPPORTED_LANGS.includes(lang)) notFound();

  const { data: player } = await supabaseAdmin
    .from('players').select('*').eq('slug', params.slug).single();

  if (!player) notFound();

  const bio = (player.bio as any)?.[lang] || (player.bio as any)?.en || {};
  const tr = t(lang);

  // Related articles
  const lastName = player.name.split(' ').slice(-1)[0];
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, slug, lang, title, excerpt, cover_image, category, tags, views, published_at')
    .eq('lang', lang).eq('status', 'published')
    .ilike('title', `%${lastName}%`)
    .order('published_at', { ascending: false })
    .limit(4);

  // Other players from same team
  const { data: teammates } = await supabaseAdmin
    .from('players')
    .select('name, slug, photo, position, team_name')
    .eq('team_id', player.team_id)
    .neq('slug', params.slug)
    .limit(6);

  // Top players from other teams
  const { data: otherPlayers } = await supabaseAdmin
    .from('players')
    .select('name, slug, photo, position, team_name, team_logo')
    .neq('team_id', player.team_id)
    .order('name')
    .limit(8);

  const lb = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      career: { fr: 'Carrière', en: 'Career', ar: 'المسيرة', es: 'Carrera' },
      stats: { fr: 'Statistiques', en: 'Stats', ar: 'الإحصائيات', es: 'Estadísticas' },
      style: { fr: 'Style de jeu', en: 'Playing style', ar: 'أسلوب اللعب', es: 'Estilo de juego' },
      fact: { fr: 'Le saviez-vous ?', en: 'Did you know?', ar: 'هل تعلم؟', es: '¿Sabías que?' },
      news: { fr: 'Actualités', en: 'Latest news', ar: 'آخر الأخبار', es: 'Noticias' },
      teammates: { fr: 'Coéquipiers', en: 'Teammates', ar: 'زملاء الفريق', es: 'Compañeros' },
      otherPlayers: { fr: 'Autres joueurs', en: 'Other players', ar: 'لاعبون آخرون', es: 'Otros jugadores' },
      nationality: { fr: 'Nationalité', en: 'Nationality', ar: 'الجنسية', es: 'Nacionalidad' },
      position: { fr: 'Poste', en: 'Position', ar: 'المركز', es: 'Posición' },
      age: { fr: 'Âge', en: 'Age', ar: 'العمر', es: 'Edad' },
      club: { fr: 'Club', en: 'Club', ar: 'النادي', es: 'Club' },
    };
    return labels[key]?.[lang] || labels[key]?.en || key;
  };

  const positionLabels: Record<string, Record<string, string>> = {
    Goalkeeper: { fr: 'Gardien', en: 'Goalkeeper', ar: 'حارس مرمى', es: 'Portero' },
    Defender: { fr: 'Défenseur', en: 'Defender', ar: 'مدافع', es: 'Defensa' },
    Midfielder: { fr: 'Milieu', en: 'Midfielder', ar: 'لاعب وسط', es: 'Centrocampista' },
    Attacker: { fr: 'Attaquant', en: 'Forward', ar: 'مهاجم', es: 'Delantero' },
  };

  return (
    <div dir={isRTL(lang) ? 'rtl' : 'ltr'}>
      <Header lang={lang} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--muted)' }}>
          <Link href={`/${lang}`} className="hover-underline">{tr.home}</Link>
          <span>/</span>
          {player.team_name && player.team_id && (
            <>
              <Link href={`/${lang}/team/${player.team_name.toLowerCase().replace(/\s+/g, '-')}`} className="hover-underline">{player.team_name}</Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--ink)' }}>{player.name}</span>
        </nav>

        {/* Player header — hero card */}
        <div className="card overflow-hidden mb-8 anim-up">
          <div className="flex flex-col md:flex-row">
            {/* Photo */}
            <div className="md:w-64 shrink-0 flex items-center justify-center p-8" style={{ background: 'var(--paper-warm)' }}>
              {player.photo ? (
                <img src={player.photo} alt={player.name} className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-full"
                  style={{ border: '4px solid var(--border)' }} />
              ) : (
                <div className="w-48 h-48 rounded-full flex items-center justify-center text-4xl font-extrabold"
                  style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                  {player.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  {player.position && (
                    <span className="badge badge-accent mb-3">
                      {positionLabels[player.position]?.[lang] || player.position}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: 'var(--ink)' }}>
                    {player.name}
                  </h1>
                </div>
                {player.team_logo && (
                  <img src={player.team_logo} alt={player.team_name || ''} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                )}
              </div>

              {bio.description && (
                <p className="text-sm mt-3 max-w-xl" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                  {safeText(bio.description)}
                </p>
              )}

              {/* Quick info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {player.nationality && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('nationality')}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>{player.nationality}</div>
                  </div>
                )}
                {player.age && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('age')}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>{player.age} ans</div>
                  </div>
                )}
                {player.position && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('position')}</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--ink)' }}>{positionLabels[player.position]?.[lang] || player.position}</div>
                  </div>
                )}
                {player.team_name && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{lb('club')}</div>
                    <div className="text-sm font-semibold mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                      {player.team_logo && <img src={player.team_logo} alt="" className="w-4 h-4" />}
                      {player.team_name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main content */}
          <div>
            {bio.career && (
              <section className="mb-8 anim-up d2">
                <div className="section-header"><h2>{lb('career')}</h2></div>
                <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: safeHtml(bio.career) }} />
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 anim-up d3">
              {bio.playing_style && (
                <div className="card px-5 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{lb('style')}</h3>
                  <p className="text-sm" style={{ color: 'var(--ink)', lineHeight: 1.7 }}>{safeText(bio.playing_style)}</p>
                </div>
              )}
              {bio.fun_fact && (
                <div className="card px-5 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{lb('fact')}</h3>
                  <p className="text-sm" style={{ color: 'var(--ink)', lineHeight: 1.7 }}>{safeText(bio.fun_fact)}</p>
                </div>
              )}
            </div>

            {bio.stats_summary && (
              <section className="mb-8 anim-up d4">
                <div className="section-header"><h2>{lb('stats')}</h2></div>
                <div className="card px-5 py-4">
                  <div className="text-sm" style={{ color: 'var(--ink)', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: safeHtml(bio.stats_summary) }} />
                </div>
              </section>
            )}

            {articles && articles.length > 0 && (
              <section className="anim-up d5">
                <div className="section-header"><h2>{lb('news')} — {player.name}</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map((a: any) => (
                    <ArticleCard key={a.id} {...a} lang={lang} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              {/* Teammates */}
              {teammates && teammates.length > 0 && (
                <div className="card">
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                      {lb('teammates')} — {player.team_name}
                    </span>
                  </div>
                  {teammates.map((t: any) => (
                    <Link key={t.slug} href={`/${lang}/player/${t.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--paper-warm)] transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      {t.photo ? (
                        <img src={t.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                          {t.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{t.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{t.position}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Other players */}
              <div className="card">
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>{lb('otherPlayers')}</span>
                </div>
                {(otherPlayers || []).map((p: any) => (
                  <Link key={p.slug} href={`/${lang}/player/${p.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--paper-warm)] transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    {p.photo ? (
                      <img src={p.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--paper-warm)', color: 'var(--muted)' }}>
                        {p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{p.name}</p>
                      <p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                        {p.team_logo && <img src={p.team_logo} alt="" className="w-3 h-3" />}
                        {p.team_name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link href={`/${lang}/livescore`}
                className="block card px-4 py-3 text-center text-sm font-bold uppercase tracking-wider hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>
                {lang === 'fr' ? 'Scores en direct' : 'Live scores'}
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}