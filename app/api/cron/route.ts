import { NextRequest, NextResponse } from 'next/server';
import { fetchTrendingNews, fetchTopHeadlines } from '@/lib/newsapi';
import { generateAllLanguages } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';
import type { Lang } from '@/lib/i18n';

export const maxDuration = 300; // 5 min — needed for 10 articles
export const dynamic = 'force-dynamic';

// POST — called from admin dashboard
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.adminPassword || body.adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCron();
}

// GET — called by cron-job.org or Vercel cron
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
    // 1. Fetch trending news (ask for 12, use up to 10)
    let newsItems = await fetchTrendingNews(12);
    if (newsItems.length === 0) {
      newsItems = await fetchTopHeadlines(12);
    }
    if (newsItems.length === 0) {
      throw new Error('No news items found from any source');
    }

    console.log(`[Cron] Got ${newsItems.length} news items, processing up to 10...`);

    // 2. Process each news item (up to 10)
    for (const news of newsItems.slice(0, 10)) {
      try {
        // Check for duplicate
        const { data: existing } = await supabaseAdmin
          .from('articles')
          .select('id')
          .eq('source_url', news.url)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`[Cron] Skipping duplicate: ${news.title.slice(0, 50)}`);
          continue;
        }

        const translationGroup = crypto.randomUUID();

        // 3. ONE call = 4 languages via Groq/Gemini
        console.log(`[Cron] Generating: ${news.title.slice(0, 60)}...`);
        const allArticles = await generateAllLanguages(
          news.title,
          news.description,
          news.source
        );

        // 4. Save all languages
        for (const lang of ['fr', 'en', 'ar', 'es'] as Lang[]) {
          try {
            const article = allArticles[lang];
            if (!article) {
              errors.push(`Missing ${lang} for: ${news.title.slice(0, 40)}`);
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

        // Small delay between articles (respect rate limits)
        await new Promise(r => setTimeout(r, 3000));

      } catch (articleError: any) {
        errors.push(`"${news.title.slice(0, 40)}": ${articleError.message.slice(0, 100)}`);
        console.error(`[Cron] Failed:`, articleError.message.slice(0, 150));
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