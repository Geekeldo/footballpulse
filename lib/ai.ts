const GROQ_KEY = process.env.GROQ_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const COHERE_KEY = process.env.COHERE_API_KEY || '';
const HF_KEY = process.env.HF_API_KEY || '';

export type ArticleData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  category: string;
  tags: string[];
  keywords: string[];
  schema_json: any;
};

function slugify(text: string, lang: string): string {
  if (lang === 'ar') {
    return text.replace(/[^\u0600-\u06FF\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || `article-${Date.now()}`;
  }
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function buildSchema(title: string, excerpt: string, lang: string, slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site';
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: excerpt,
    datePublished: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'FootballPulse', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'FootballPulse', url: siteUrl },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/${lang}/${slug}` },
    inLanguage: lang,
  };
}

function parseJSON(text: string): any {
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1);
  return JSON.parse(clean);
}

function safeString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

// GROQ
async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  if (!GROQ_KEY) throw new Error('No GROQ_API_KEY');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// COHERE
async function callCohere(prompt: string, systemPrompt: string): Promise<string> {
  if (!COHERE_KEY) throw new Error('No COHERE_API_KEY');
  const res = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COHERE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'command-a-03-2025',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Cohere ${res.status}: ${errText.slice(0, 100)}`);
  }
  const data = await res.json();
  return data.message?.content?.[0]?.text || '';
}

// GEMINI
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error('No GEMINI_API_KEY');
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// HUGGINGFACE
async function callHF(prompt: string, systemPrompt: string): Promise<string> {
  if (!HF_KEY) throw new Error('No HF_API_KEY');
  const res = await fetch('https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`HF ${res.status}: ${errText.slice(0, 100)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ARTICLE PROMPT
function articlePrompt(title: string, description: string, source: string, lang: string): string {
  const langNames: Record<string, string> = { fr: 'French', en: 'English', ar: 'Arabic', es: 'Spanish' };
  return `Write a professional football news article in ${langNames[lang] || 'English'} based on:

Title: ${title}
Description: ${description}
Source: ${source}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "title": "catchy headline in ${langNames[lang]}",
  "excerpt": "2-3 sentence summary",
  "content": "full HTML article 400-600 words with <h2> <p> <strong> tags",
  "category": "one of: transfers, leagues, analysis, champions-league, premier-league, la-liga, serie-a, bundesliga, ligue-1, world-cup, africa, general",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2"]
}`;
}

const SYS = 'Professional football journalist. Valid JSON only. No markdown fences.';

// GENERATE ONE ARTICLE with fallback chain
async function generateOneArticle(
  title: string, description: string, source: string, lang: string,
  provider: 'groq' | 'cohere' | 'gemini' | 'hf'
): Promise<ArticleData> {
  const prompt = articlePrompt(title, description, source, lang);
  let text = '';

  try {
    if (provider === 'groq') text = await callGroq(prompt, SYS);
    else if (provider === 'cohere') text = await callCohere(prompt, SYS);
    else if (provider === 'gemini') text = await callGemini(prompt);
    else if (provider === 'hf') text = await callHF(prompt, SYS);
    console.log(`[AI] ${lang.toUpperCase()} OK (${provider})`);
  } catch (e: any) {
    console.log(`[AI] ${provider} failed for ${lang}: ${e.message.slice(0, 80)}`);
  }

  if (!text) {
    const fallbacks = ['groq', 'cohere', 'gemini', 'hf'].filter(p => p !== provider) as any[];
    for (const fb of fallbacks) {
      try {
        console.log(`[AI] Trying fallback ${fb} for ${lang}...`);
        await new Promise(r => setTimeout(r, 2000));
        if (fb === 'groq') text = await callGroq(prompt, SYS);
        else if (fb === 'cohere') text = await callCohere(prompt, SYS);
        else if (fb === 'gemini') text = await callGemini(prompt);
        else if (fb === 'hf') text = await callHF(prompt, SYS);
        if (text) {
          console.log(`[AI] ${lang.toUpperCase()} OK (fallback ${fb})`);
          break;
        }
      } catch (e: any) {
        console.log(`[AI] Fallback ${fb} failed: ${e.message.slice(0, 60)}`);
      }
    }
  }

  if (!text) throw new Error(`All providers failed for ${lang}`);

  const parsed = parseJSON(text);
  const articleTitle = safeString(parsed.title) || title;
  const slug = slugify(articleTitle, lang);

  return {
    title: articleTitle,
    slug,
    excerpt: safeString(parsed.excerpt) || description,
    content: safeString(parsed.content) || '',
    meta_description: safeString(parsed.excerpt || parsed.meta_description).slice(0, 160),
    category: safeString(parsed.category) || 'general',
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    schema_json: buildSchema(articleTitle, safeString(parsed.excerpt), lang, slug),
  };
}

// MAIN — Generate article in all 4 languages
// Groq: FR+EN | Cohere: AR+ES | 4s delay between each
export async function generateArticleAllLangs(
  newsTitle: string, newsDescription: string, newsSource: string
): Promise<Record<string, ArticleData>> {
  const results: Record<string, ArticleData> = {};
  const errors: string[] = [];

  try {
    results.fr = await generateOneArticle(newsTitle, newsDescription, newsSource, 'fr', 'groq');
  } catch (e: any) { errors.push(`FR: ${e.message}`); }

  await new Promise(r => setTimeout(r, 3000));

  try {
    results.en = await generateOneArticle(newsTitle, newsDescription, newsSource, 'en', 'groq');
  } catch (e: any) { errors.push(`EN: ${e.message}`); }

  await new Promise(r => setTimeout(r, 3000));

  try {
    results.ar = await generateOneArticle(newsTitle, newsDescription, newsSource, 'ar', 'cohere');
  } catch (e: any) { errors.push(`AR: ${e.message}`); }

  await new Promise(r => setTimeout(r, 3000));

  try {
    results.es = await generateOneArticle(newsTitle, newsDescription, newsSource, 'es', 'cohere');
  } catch (e: any) { errors.push(`ES: ${e.message}`); }

  if (errors.length > 0) console.log(`[AI] Errors: ${errors.join(', ')}`);
  return results;
}

// EXPORTS
export async function generateWithGemini(prompt: string): Promise<string> {
  return callGemini(prompt);
}

export async function generateWithGroq(prompt: string, system: string = SYS): Promise<string> {
  return callGroq(prompt, system);
}