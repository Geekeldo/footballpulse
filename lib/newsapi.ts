export type NewsItem = {
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
};

// ===== RSS FEEDS — FREE, UNLIMITED, ALWAYS FRESH =====
const RSS_FEEDS = [
  { url: 'https://www.espn.com/espn/rss/soccer/news', name: 'ESPN FC' },
  { url: 'https://www.goal.com/feeds/en/news', name: 'GOAL' },
  { url: 'https://www.football365.com/feed', name: 'Football365' },
  { url: 'https://sportstar.thehindu.com/rss/football/feeder/default.rss', name: 'Sportstar' },
  { url: 'https://www.marca.com/en/rss/football.xml', name: 'Marca' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', name: 'BBC Sport' },
  { url: 'https://www.skysports.com/rss/12040', name: 'Sky Sports' },
  { url: 'https://www.football-italia.net/feed', name: 'Football Italia' },
  { url: 'https://onefootball.com/en/feeds/rss', name: 'OneFootball' },
  { url: 'https://theathletic.com/rss/news/', name: 'The Athletic' },
];

// Simple XML parser for RSS (no dependencies needed)
function parseRSSItems(xml: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || block.match(/<description>(.*?)<\/description>/)?.[1] || '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const image = block.match(/<media:content[^>]*url="([^"]+)"/)?.[1]
      || block.match(/<enclosure[^>]*url="([^"]+)"/)?.[1]
      || block.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
      || null;

    if (title && title.length > 10) {
      // Strip HTML tags from description
      const cleanDesc = desc.replace(/<[^>]+>/g, '').trim().slice(0, 300);
      items.push({
        title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim(),
        description: cleanDesc || title,
        source: sourceName,
        url: link.trim(),
        imageUrl: image,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }
  return items;
}

// Filter out non-soccer content
function isSoccer(title: string, desc: string): boolean {
  const text = `${title} ${desc}`.toLowerCase();
  const nflTerms = ['nfl', 'touchdown', 'quarterback', 'super bowl', 'nba', 'nhl', 'mlb', 'baseball', 'basketball', 'hockey', 'american football', 'patriots', 'cowboys', '49ers', 'chiefs', 'packers', 'steelers', 'eagles philadelphia', 'tennis', 'cricket', 'rugby', 'f1', 'formula 1', 'golf'];
  if (nflTerms.some(t => text.includes(t))) return false;

  // Must contain at least one soccer term
  const soccerTerms = ['football', 'soccer', 'premier league', 'champions league', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'transfer', 'goal', 'match', 'striker', 'midfielder', 'defender', 'manager', 'coach', 'uefa', 'fifa', 'world cup', 'penalty', 'red card', 'offside', 'fc ', ' fc', 'united', 'city', 'arsenal', 'liverpool', 'chelsea', 'barcelona', 'real madrid', 'psg', 'bayern', 'juventus', 'inter', 'milan', 'dortmund', 'atletico'];
  return soccerTerms.some(t => text.includes(t));
}

// ===== STRATEGY 1: RSS FEEDS (unlimited, free) =====
async function tryRSS(count: number): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  // Pick 4 random feeds each run for variety
  const shuffled = [...RSS_FEEDS].sort(() => Math.random() - 0.5).slice(0, 4);

  for (const feed of shuffled) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'FootballPulse/1.0' },
        signal: AbortSignal.timeout(5000), // 5s timeout per feed
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const items = parseRSSItems(xml, feed.name);
      const filtered = items.filter(i => isSoccer(i.title, i.description));
      allItems.push(...filtered);
      console.log(`[RSS] ${feed.name}: ${filtered.length} soccer articles`);
    } catch (e: any) {
      console.log(`[RSS] ${feed.name} failed: ${e.message.slice(0, 50)}`);
    }
  }

  // Sort by date descending, deduplicate by similar titles
  allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Deduplicate by similar title (first 40 chars)
  const seen = new Set<string>();
  const unique = allItems.filter(item => {
    const key = item.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[RSS] Total unique soccer articles: ${unique.length}`);
  return unique.slice(0, count);
}

// ===== STRATEGY 2: GNews (100 req/day, use sparingly) =====
async function tryGNews(count: number): Promise<NewsItem[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  // Simple rotating queries
  const queries = [
    'football transfer', 'Champions League', 'Premier League',
    'La Liga', 'Serie A', 'Bundesliga', 'World Cup 2026',
  ];
  const qi = Math.floor(Date.now() / 3600000) % queries.length; // Rotate hourly (not every 10 min!)
  const query = queries[qi];

  try {
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q', query);
    url.searchParams.set('lang', 'en');
    url.searchParams.set('max', String(Math.min(count, 10)));
    url.searchParams.set('sortby', 'publishedAt');
    url.searchParams.set('apikey', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.log(`[GNews] ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.articles || [])
      .filter((a: any) => a.title && a.description && isSoccer(a.title, a.description))
      .map((a: any) => ({
        title: a.title,
        description: a.description,
        source: a.source?.name || 'Unknown',
        url: a.url,
        imageUrl: a.image || null,
        publishedAt: a.publishedAt,
      }));
  } catch (e: any) {
    console.log(`[GNews] ${e.message}`);
    return [];
  }
}

// ===== MAIN: RSS first (unlimited), GNews backup =====
export async function fetchTrendingNews(count: number = 10): Promise<NewsItem[]> {
  console.log('[News] Fetching trending football news...');

  // RSS is unlimited and always fresh
  let items = await tryRSS(count);
  if (items.length >= 3) {
    console.log(`[News] RSS: ${items.length} items`);
    return items;
  }

  // GNews as supplement (save the 100 req/day quota)
  const gnewsItems = await tryGNews(count);
  if (gnewsItems.length > 0) {
    console.log(`[News] GNews supplement: ${gnewsItems.length} items`);
    // Merge and deduplicate
    const merged = [...items, ...gnewsItems];
    const seen = new Set<string>();
    const unique = merged.filter(i => {
      const key = i.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, count);
  }

  if (items.length > 0) return items;

  console.log('[News] No news found');
  return [];
}

export async function fetchTopHeadlines(count: number = 10): Promise<NewsItem[]> {
  return fetchTrendingNews(count);
}