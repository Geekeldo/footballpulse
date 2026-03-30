import { supabaseAdmin } from '@/lib/supabase';
import { LEAGUES } from '@/lib/football-api';

const SITE_URL = 'https://www.footballpulse.site';
const LANGS = ['fr', 'en', 'ar', 'es'];

export default async function sitemap() {
  const entries: any[] = [];

  // Static pages
  LANGS.forEach(lang => {
    entries.push(
      { url: `${SITE_URL}/${lang}`, changeFrequency: 'hourly', priority: 1.0 },
      { url: `${SITE_URL}/${lang}/livescore`, changeFrequency: 'always', priority: 0.9 },
      { url: `${SITE_URL}/${lang}/standings`, changeFrequency: 'daily', priority: 0.8 },
      { url: `${SITE_URL}/${lang}/about`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${SITE_URL}/${lang}/contact`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${SITE_URL}/${lang}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${SITE_URL}/${lang}/terms`, changeFrequency: 'monthly', priority: 0.3 },
    );

    // Standings per league
    LEAGUES.forEach(league => {
      entries.push({
        url: `${SITE_URL}/${lang}/standings/${league.slug}`,
        changeFrequency: 'daily',
        priority: 0.8,
      });
      entries.push({
        url: `${SITE_URL}/${lang}/fixtures/${league.slug}`,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });
  });

  // All published articles
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('slug, lang, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5000);

  (articles || []).forEach((a: any) => {
    entries.push({
      url: `${SITE_URL}/${a.lang}/${a.slug}`,
      lastModified: a.published_at,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // All teams
  const { data: teams } = await supabaseAdmin
    .from('teams')
    .select('slug')
    .limit(500);

  (teams || []).forEach((t: any) => {
    LANGS.forEach(lang => {
      entries.push({
        url: `${SITE_URL}/${lang}/team/${t.slug}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  });

  // All players
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('slug')
    .limit(500);

  (players || []).forEach((p: any) => {
    LANGS.forEach(lang => {
      entries.push({
        url: `${SITE_URL}/${lang}/player/${p.slug}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  });

  return entries;
}