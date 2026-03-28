export type NewsItem = {
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
};

const FOOTBALL_QUERIES = [
  'football transfer news',
  'Champions League',
  'Premier League results',
  'La Liga football',
  'World Cup football',
  'Bundesliga news',
  'Serie A football',
  'African football',
  'Ligue 1 football',
  'football tactics analysis',
];

// ===== STRATEGY 1: NewsAPI (localhost only on free plan) =====
async function tryNewsAPI(count: number): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  const qi = Math.floor(Date.now() / 1800000) % FOOTBALL_QUERIES.length;
  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', FOOTBALL_QUERIES[qi]);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', String(count));
    url.searchParams.set('apiKey', apiKey);

    const res = await fetch(url.toString(), { headers: { 'User-Agent': 'FootballPulse/1.0' } });
    if (!res.ok) { console.log(`[NewsAPI] ${res.status}`); return []; }

    const data = await res.json();
    return (data.articles || [])
      .filter((a: any) => a.title && a.description && a.title !== '[Removed]')
      .map((a: any) => ({
        title: a.title, description: a.description,
        source: a.source?.name || 'Unknown', url: a.url,
        imageUrl: a.urlToImage || null, publishedAt: a.publishedAt,
      }));
  } catch (e: any) { console.log(`[NewsAPI] ${e.message}`); return []; }
}

// ===== STRATEGY 2: GNews.io (free, works in production) =====
// Sign up at https://gnews.io — 100 req/day free, works on deployed servers
// Add GNEWS_API_KEY to your env variables
async function tryGNews(count: number): Promise<NewsItem[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

    const qi = Math.floor(Date.now() / 1800000) % FOOTBALL_QUERIES.length;
  try {
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q', FOOTBALL_QUERIES[qi]);
    url.searchParams.set('lang', 'en');
    url.searchParams.set('max', String(count));
    url.searchParams.set('sortby', 'publishedAt');
    url.searchParams.set('apikey', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) { console.log(`[GNews] ${res.status}`); return []; }

    const data = await res.json();
    return (data.articles || [])
      .filter((a: any) => a.title && a.description)
      .map((a: any) => ({
        title: a.title, description: a.description,
        source: a.source?.name || 'Unknown', url: a.url,
        imageUrl: a.image || null, publishedAt: a.publishedAt,
      }));
  } catch (e: any) { console.log(`[GNews] ${e.message}`); return []; }
}

// ===== STRATEGY 3: Gemini generates trending topics (zero API cost) =====
// Ultimate fallback — AI creates realistic trending topics based on current date
async function tryGeminiTopics(count: number): Promise<NewsItem[]> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const today = new Date().toISOString().split('T')[0];
    const prompt = `You are a football news editor. Generate ${count} realistic trending football news headlines for today (${today}).
Cover CURRENT events: transfers, match results, injuries, tactical changes, manager news.
Mix leagues: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, African football.
Make headlines realistic, specific (use real team/player names), and timely.

Respond ONLY with a JSON array (no markdown):
[{"title":"...","description":"2-3 sentence summary","source":"realistic source name like BBC Sport or Marca"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(text);

    return parsed.slice(0, count).map((item: any, i: number) => ({
      title: item.title,
      description: item.description,
      source: item.source || 'FootballPulse AI',
      url: `https://footballpulse.site/generated-${Date.now()}-${i}`,
      imageUrl: null,
      publishedAt: new Date().toISOString(),
    }));
  } catch (e: any) { console.log(`[Gemini Topics] ${e.message}`); return []; }
}

// ===== MAIN: tries all strategies in order =====
export async function fetchTrendingNews(count: number = 3): Promise<NewsItem[]> {
  console.log('[News] Fetching trending football news...');

  let items = await tryNewsAPI(count);
  if (items.length > 0) { console.log(`[News] NewsAPI: ${items.length} items`); return items; }

  items = await tryGNews(count);
  if (items.length > 0) { console.log(`[News] GNews: ${items.length} items`); return items; }

  items = await tryGeminiTopics(count);
  if (items.length > 0) { console.log(`[News] Gemini fallback: ${items.length} items`); return items; }

  console.log('[News] All sources failed');
  return [];
}

export async function fetchTopHeadlines(count: number = 3): Promise<NewsItem[]> {
  return fetchTrendingNews(count);
}
