import { NextRequest, NextResponse } from 'next/server';
import { fetchTrendingNews, fetchTopHeadlines } from '@/lib/newsapi';
import { generateArticleAllLangs } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// POST — admin dashboard
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.adminPassword || body.adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCron();
}

// GET — GitHub Actions / cron-job.org
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCron();
}

async function runCron() {
  const { data: cronLog } = await supabaseAdmin
    .from('cron_logs')
    .insert({ status: 'running' })
    .select()
    .single();

  const cronId = cronLog?.id;
  let articlesCreated = 0;
  const errors: string[] = [];

  try {
    // 1. Fetch news (12 items, use up to 10)
    let newsItems = await fetchTrendingNews(12);
    if (newsItems.length === 0) {
      newsItems = await fetchTopHeadlines(12);
    }
    if (newsItems.length === 0) {
      throw new Error('No news items found from any source');
    }

    console.log(`[Cron] Got ${newsItems.length} news items, processing up to 10...`);

    // 2. Process each news item
    for (const news of newsItems.slice(0, 10)) {
      try {
        // Check duplicate by source URL
        const { data: existing } = await supabaseAdmin
          .from('articles')
          .select('id')
          .eq('source_url', news.url)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`[Cron] Skip duplicate: ${news.title.slice(0, 50)}`);
          continue;
        }

        const translationGroup = crypto.randomUUID();

        // Generate in all 4 languages (Groq FR+EN, Cohere AR+ES, fallbacks)
        console.log(`[Cron] Generating: ${news.title.slice(0, 60)}...`);
        const allArticles = await generateArticleAllLangs(
          news.title,
          news.description,
          news.source
        );

        // Save each language
        for (const lang of ['fr', 'en', 'ar', 'es']) {
          try {
            const article = allArticles[lang];
            if (!article) {
              errors.push(`No ${lang} for: ${news.title.slice(0, 30)}`);
              continue;
            }

            // Check slug duplicate
            const { data: slugExists } = await supabaseAdmin
              .from('articles')
              .select('id')
              .eq('slug', article.slug)
              .eq('lang', lang)
              .limit(1);

            if (slugExists && slugExists.length > 0) {
              console.log(`[Cron] Slug exists: ${article.slug} (${lang})`);
              continue;
            }

            const { error: insertError } = await supabaseAdmin
              .from('articles')
              .insert({
                ...article,
                lang,
                cover_image: news.imageUrl,
                source_url: news.url,
                source_name: news.source,
                translation_group: translationGroup,
                status: 'published',
                published_at: new Date().toISOString(),
              });

            if (insertError) {
              errors.push(`Insert ${lang}: ${insertError.message}`);
            } else {
              articlesCreated++;
            }
          } catch (langErr: any) {
            errors.push(`Save ${lang}: ${langErr.message}`);
          }
        }

        // Delay between articles to respect all rate limits
        await new Promise(r => setTimeout(r, 4000));

      } catch (articleError: any) {
        errors.push(`"${news.title.slice(0, 30)}": ${articleError.message.slice(0, 80)}`);
        console.error(`[Cron] Failed:`, articleError.message.slice(0, 100));
      }
    }

    // Update cron log
    await supabaseAdmin
      .from('cron_logs')
      .update({
        finished_at: new Date().toISOString(),
        articles_created: articlesCreated,
        status: errors.length > 0 ? 'partial' : 'success',
        details: { errors, newsCount: newsItems.length },
      })
      .eq('id', cronId);

    console.log(`[Cron] Done: ${articlesCreated} articles, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      articlesCreated,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    await supabaseAdmin
      .from('cron_logs')
      .update({
        finished_at: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        details: { errors },
      })
      .eq('id', cronId);

    return NextResponse.json(
      { error: error.message, articlesCreated },
      { status: 500 }
    );
  }
}