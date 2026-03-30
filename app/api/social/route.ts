import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publishToSocial } from '@/lib/social';
import { generateWithGroq } from '@/lib/ai';
import type { Article } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, platforms } = body as {
      articleId: string;
      platforms: ('twitter' | 'facebook' | 'instagram')[];
    };

    if (!articleId || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'articleId and platforms[] required' }, { status: 400 });
    }

    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Generate caption with Groq
    const captionPrompt = `Write a short social media caption for this football article:
Title: ${article.title}
Excerpt: ${article.excerpt}
Language: ${article.lang}

Respond with JSON only: { "text": "the caption", "hashtags": ["tag1", "tag2"] }`;

    let caption = { text: article.title, hashtags: ['football'] };
    try {
      const raw = await generateWithGroq(captionPrompt, 'Social media expert. JSON only.');
      const parsed = JSON.parse(raw.replace(/```json\s*/g, '').replace(/```/g, '').trim());
      if (parsed.text) caption = parsed;
    } catch {}

    const results = [];
    for (const platform of platforms) {
      const postResults = await publishToSocial(
        article as Article,
        [platform],
        caption
      );
      results.push(...postResults);
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get('articleId');

  if (!articleId) {
    return NextResponse.json({ error: 'articleId required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('social_posts')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data || [] });
}