import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, excerpt, content, category, lang, cover_image } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    const slug = slugify(title);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site';

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: title,
      description: excerpt || title,
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: { '@type': 'Organization', name: 'FootballPulse', url: siteUrl },
      publisher: { '@type': 'Organization', name: 'FootballPulse', url: siteUrl },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/${lang}/${slug}` },
      inLanguage: lang || 'fr',
    };

    const { data, error } = await supabaseAdmin.from('articles').insert({
      slug,
      lang: lang || 'fr',
      title,
      meta_description: (excerpt || title).slice(0, 160),
      excerpt: excerpt || title,
      content,
      cover_image: cover_image || null,
      category: category || 'general',
      tags: [],
      keywords: [],
      schema_json: schema,
      status: 'published',
      published_at: new Date().toISOString(),
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, article: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const admin = searchParams.get('admin') === '1';
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('articles')
    .select('id, slug, lang, title, excerpt, cover_image, category, tags, views, status, published_at, created_at', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Admin sees everything, public only sees published
  if (!admin) {
    query = query.eq('status', 'published');
  } else if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (lang && lang !== 'all') query = query.eq('lang', lang);
  if (category && category !== 'all') query = query.eq('category', category);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}