import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publishToSocial } from '@/lib/social';
import { generateAllSocialCaptions } from '@/lib/ai';
import type { Article } from '@/lib/supabase';
import type { Lang } from '@/lib/i18n';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleId, platforms } = body as {
      articleId: string;
      platforms: ('twitter' | 'facebook' | 'instagram')[];
    };

    if (!articleId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'articleId and platforms[] required' },
        { status: 400 }
      );
    }

    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const lang = article.lang as Lang;

    // ONE call = all captions
    const allCaptions = await generateAllSocialCaptions({
      [lang]: { title: article.title, excerpt: article.excerpt },
    });

    const langCaptions = allCaptions[lang];
    if (!langCaptions) {
      return NextResponse.json({ error: 'Failed to generate captions' }, { status: 500 });
    }

    const results = [];
    for (const platform of platforms) {
      const caption = langCaptions[platform];
      if (!caption) continue;

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