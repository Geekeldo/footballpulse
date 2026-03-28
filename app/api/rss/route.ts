import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Feed } from 'feed';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'fr';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://footballpulse.site';

  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('slug, title, excerpt, content, cover_image, published_at, category')
    .eq('lang', lang)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  const feed = new Feed({
    title: `FootballPulse - ${lang.toUpperCase()}`,
    description: 'Real-time football news',
    id: `${siteUrl}/${lang}`,
    link: `${siteUrl}/${lang}`,
    language: lang,
    image: `${siteUrl}/logo.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} FootballPulse`,
    feedLinks: {
      rss2: `${siteUrl}/rss/${lang}.xml`,
    },
    author: { name: 'FootballPulse', link: siteUrl },
  });

  (articles || []).forEach((article: any) => {
    feed.addItem({
      title: article.title,
      id: `${siteUrl}/${lang}/${article.slug}`,
      link: `${siteUrl}/${lang}/${article.slug}`,
      description: article.excerpt,
      content: article.content,
      date: new Date(article.published_at),
      image: article.cover_image || undefined,
      category: [{ name: article.category }],
    });
  });

  return new NextResponse(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
    },
  });
}
