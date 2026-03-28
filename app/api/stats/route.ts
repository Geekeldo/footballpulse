import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '7d';

    const daysMap: Record<string, number> = {
      '1d': 1, '7d': 7, '30d': 30, '90d': 90,
    };
    const days = daysMap[period] || 7;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // Total articles by lang
    const { data: articlesByLang } = await supabaseAdmin
      .from('articles')
      .select('lang')
      .eq('status', 'published');

    const langCounts: Record<string, number> = {};
    (articlesByLang || []).forEach((a: any) => {
      langCounts[a.lang] = (langCounts[a.lang] || 0) + 1;
    });

    // Total views
    const { data: totalViewsData } = await supabaseAdmin
      .from('articles')
      .select('views')
      .eq('status', 'published');

    const totalViews = (totalViewsData || []).reduce((s: number, a: any) => s + (a.views || 0), 0);

    // Recent articles count
    const { count: recentCount } = await supabaseAdmin
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .gte('published_at', since);

    // Top articles by views
    const { data: topArticles } = await supabaseAdmin
      .from('articles')
      .select('id, slug, lang, title, views, category, published_at')
      .eq('status', 'published')
      .order('views', { ascending: false })
      .limit(10);

    // Analytics over time
    const { data: dailyAnalytics } = await supabaseAdmin
      .from('analytics')
      .select('date, page_views')
      .gte('date', since.split('T')[0])
      .order('date', { ascending: true });

    // Aggregate daily analytics
    const dailyMap: Record<string, number> = {};
    (dailyAnalytics || []).forEach((a: any) => {
      dailyMap[a.date] = (dailyMap[a.date] || 0) + a.page_views;
    });
    const chartData = Object.entries(dailyMap).map(([date, views]) => ({
      date, views,
    }));

    // Articles by category
    const { data: byCategoryRaw } = await supabaseAdmin
      .from('articles')
      .select('category')
      .eq('status', 'published');

    const categoryCounts: Record<string, number> = {};
    (byCategoryRaw || []).forEach((a: any) => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    // Revenue data
    const { data: revenueData } = await supabaseAdmin
      .from('ad_revenue')
      .select('*')
      .gte('date', since.split('T')[0])
      .order('date', { ascending: true });

    const totalRevenue = (revenueData || []).reduce(
      (s: number, r: any) => s + parseFloat(r.revenue_usd || '0'), 0
    );

    // Social posts stats
    const { data: socialStats } = await supabaseAdmin
      .from('social_posts')
      .select('platform, status')
      .gte('created_at', since);

    const socialCounts: Record<string, { posted: number; failed: number }> = {};
    (socialStats || []).forEach((s: any) => {
      if (!socialCounts[s.platform]) socialCounts[s.platform] = { posted: 0, failed: 0 };
      if (s.status === 'posted') socialCounts[s.platform].posted++;
      else if (s.status === 'failed') socialCounts[s.platform].failed++;
    });

    // Cron logs
    const { data: cronLogs } = await supabaseAdmin
      .from('cron_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      overview: {
        totalArticles: (articlesByLang || []).length,
        totalViews,
        recentArticles: recentCount || 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        articlesByLang: langCounts,
        articlesByCategory: categoryCounts,
      },
      topArticles: topArticles || [],
      chartData,
      revenueData: revenueData || [],
      socialStats: socialCounts,
      cronLogs: cronLogs || [],
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
