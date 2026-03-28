import type { Lang } from './i18n';

// ============================================================
// 🤖 DUAL AI ENGINE — Groq (primary) + Gemini (fallback)
// Groq: 14,400 req/day, 30 req/min (FREE)
// Gemini: 20 req/day, 5 req/min (FREE backup)
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let lastCallTimestamp = 0;
const MIN_DELAY = 2500; // 2.5s between calls (safe for Groq 30 RPM)

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===== GROQ API =====
async function callGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert football journalist. Always respond with valid JSON only, no markdown, no backticks, no explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error('Groq: empty response');
  return text;
}

// ===== GEMINI API (fallback) =====
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text?.trim()) throw new Error('Gemini: empty response');
  return text;
}

// ===== UNIFIED CALLER: Groq first, Gemini fallback =====
async function generateText(prompt: string): Promise<string> {
  // Rate limit
  const elapsed = Date.now() - lastCallTimestamp;
  if (elapsed < MIN_DELAY) await sleep(MIN_DELAY - elapsed);
  lastCallTimestamp = Date.now();

  // Try Groq first
  if (GROQ_API_KEY) {
    try {
      console.log('[AI] Calling Groq...');
      const text = await callGroq(prompt);
      console.log('[AI] Groq success');
      return text;
    } catch (err: any) {
      console.warn(`[AI] Groq failed: ${err.message.slice(0, 100)}`);
    }
  }

  // Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      console.log('[AI] Falling back to Gemini...');
      const text = await callGemini(prompt);
      console.log('[AI] Gemini success');
      return text;
    } catch (err: any) {
      console.error(`[AI] Gemini also failed: ${err.message.slice(0, 100)}`);
      throw err;
    }
  }

  throw new Error('[AI] No API keys configured (GROQ_API_KEY or GEMINI_API_KEY)');
}

// ===== JSON PARSER =====
function parseJSON<T>(text: string): T {
  let cleaned = text
    .replace(/```json\s*/g, '').replace(/```\s*/g, '')
    .replace(/^\uFEFF/, '').trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);

  return JSON.parse(cleaned);
}

function slugify(text: string): string {
  return text
    .toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ============================================================
// 📝 ARTICLE GENERATION — 1 call = 4 languages
// ============================================================

export type GeneratedArticle = {
  title: string;
  slug: string;
  meta_description: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  schema_json: Record<string, unknown>;
};

export async function generateAllLanguages(
  newsTitle: string,
  newsDescription: string,
  newsSource: string
): Promise<Record<Lang, GeneratedArticle>> {

  const prompt = `You are an expert football journalist for FootballPulse.
Write a complete SEO-optimized article in 4 languages based on this news:

HEADLINE: ${newsTitle}
SUMMARY: ${newsDescription}
SOURCE: ${newsSource}

For EACH language (fr, en, ar, es), provide:
- title: 50-65 chars, SEO-optimized, catchy
- meta_description: 150-160 chars
- excerpt: 2 sentences
- content: 800-1200 words HTML (<h2>, <h3>, <p>, <strong>, <blockquote>). NO <h1>.
- category: one of [transfers, leagues, analysis, champions-league, premier-league, la-liga, serie-a, bundesliga, ligue-1, world-cup, africa, general]
- tags: 5-8 tags
- keywords: 5-10 SEO keywords

Each version must feel native, not translated. Adapt idioms and expressions.

Respond ONLY with valid JSON:
{
  "fr": { "title":"...", "meta_description":"...", "excerpt":"...", "content":"<h2>...</h2><p>...</p>", "category":"...", "tags":["..."], "keywords":["..."] },
  "en": { ... },
  "ar": { ... },
  "es": { ... }
}`;

  const text = await generateText(prompt);
  const parsed = parseJSON<Record<string, any>>(text);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site';
  const result: Record<string, GeneratedArticle> = {};

  for (const lang of ['fr', 'en', 'ar', 'es'] as Lang[]) {
    const data = parsed[lang];
    if (!data) continue;

    const slug = slugify(data.title);
    result[lang] = {
      title: data.title,
      slug,
      meta_description: data.meta_description,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category || 'general',
      tags: data.tags || [],
      keywords: data.keywords || [],
      schema_json: {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: data.title,
        description: data.meta_description,
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        author: { '@type': 'Organization', name: 'FootballPulse', url: siteUrl },
        publisher: {
          '@type': 'Organization', name: 'FootballPulse', url: siteUrl,
          logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/${lang}/${slug}` },
        inLanguage: lang,
        keywords: data.keywords?.join(', ') || '',
        articleSection: data.category || 'general',
      },
    };
  }
  return result as Record<Lang, GeneratedArticle>;
}

// ============================================================
// 📱 SOCIAL CAPTIONS
// ============================================================

export async function generateAllSocialCaptions(
  articles: Partial<Record<Lang, { title: string; excerpt: string }>>
): Promise<Partial<Record<Lang, Record<string, { text: string; hashtags: string[] }>>>> {

  const entries = Object.entries(articles).filter(([, v]) => v != null);
  if (entries.length === 0) throw new Error('No articles provided');

  const langs = entries.map(([l]) => l);

  const prompt = `Write social media posts for this football article.

Articles:
${entries.map(([l, a]) => `[${l}] ${a!.title} - ${a!.excerpt}`).join('\n')}

For each language (${langs.join(',')}) x platform (twitter, facebook, instagram):
- Twitter: max 250 chars, punchy, emojis
- Facebook: max 500 chars, conversational
- Instagram: storytelling + many hashtags

Respond ONLY with JSON:
{
${langs.map(l => `  "${l}": { "twitter": {"text":"...","hashtags":["..."]}, "facebook": {"text":"...","hashtags":["..."]}, "instagram": {"text":"...","hashtags":["..."]} }`).join(',\n')}
}`;

  const text = await generateText(prompt);
  return parseJSON(text);
}