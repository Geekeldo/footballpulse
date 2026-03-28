import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Lang } from './i18n';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ============================================================
// 🛡️ RATE LIMIT : 5 RPM, 20 RPD
// ============================================================
let dailyRequestCount = 0;
let lastCallTimestamp = 0;
const DAILY_LIMIT = 18;
const MIN_DELAY = 13000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeGenerateContent(prompt: string): Promise<string> {
  if (dailyRequestCount >= DAILY_LIMIT) {
    throw new Error(
      `[Gemini] Daily limit reached (${dailyRequestCount}/${DAILY_LIMIT}). ` +
      `Wait for reset or enable billing.`
    );
  }

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const elapsed = Date.now() - lastCallTimestamp;
      if (elapsed < MIN_DELAY) {
        await sleep(MIN_DELAY - elapsed);
      }
      lastCallTimestamp = Date.now();

      console.log(
        `[Gemini] Request ${dailyRequestCount + 1}/${DAILY_LIMIT} ` +
        `(attempt ${attempt + 1}/${maxRetries})`
      );

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text?.trim()) throw new Error('Empty response');

      dailyRequestCount++;
      return text;

    } catch (error: any) {
      const msg = error?.message || '';
      const isRateLimit = msg.includes('429') || msg.includes('quota');

      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = 65000 * (attempt + 1);
        console.warn(`[Gemini] ⚠️ Rate limited. Waiting ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error('[Gemini] Max retries exceeded');
}

function parseGeminiJSON<T>(text: string): T {
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
// 📝 1 APPEL = 4 LANGUES
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

Each version must feel native. Adapt idioms and expressions.

Respond ONLY with valid JSON:
{
  "fr": { "title":"...", "meta_description":"...", "excerpt":"...", "content":"<h2>...</h2><p>...</p>", "category":"...", "tags":["..."], "keywords":["..."] },
  "en": { ... },
  "ar": { ... },
  "es": { ... }
}`;

  const text = await safeGenerateContent(prompt);
  const parsed = parseGeminiJSON<Record<string, any>>(text);
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
// 📱 SOCIAL CAPTIONS — Partial<Record> pour supporter 1 ou N langues
// ============================================================

export async function generateAllSocialCaptions(
  articles: Partial<Record<Lang, { title: string; excerpt: string }>>
): Promise<Partial<Record<Lang, Record<string, { text: string; hashtags: string[] }>>>> {

  const entries = Object.entries(articles).filter(([, v]) => v != null);

  if (entries.length === 0) {
    throw new Error('No articles provided for social caption generation');
  }

  const langs = entries.map(([l]) => l);

  const prompt = `Write social media posts for this football article.

Articles:
${entries.map(([l, a]) => `[${l}] ${a!.title} - ${a!.excerpt}`).join('\n')}

For each language (${langs.join(',')}) × platform (twitter, facebook, instagram):
- Twitter: max 250 chars, punchy, emojis
- Facebook: max 500 chars, conversational
- Instagram: storytelling + many hashtags

Respond ONLY with JSON:
{
${langs.map(l => `  "${l}": { "twitter": {"text":"...","hashtags":["..."]}, "facebook": {"text":"...","hashtags":["..."]}, "instagram": {"text":"...","hashtags":["..."]} }`).join(',\n')}
}`;

  const text = await safeGenerateContent(prompt);
  return parseGeminiJSON(text);
}