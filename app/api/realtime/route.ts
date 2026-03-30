// app/api/realtime/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'overview';

    const now = Date.now();
    const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
    const thirtyMinAgo = new Date(now - 30 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    // ========================================
    // OVERVIEW — données temps réel
    // ========================================
    if (type === 'overview') {
      // Utilisateurs actifs
      const { count: activeUsers } = await supabase
        .from('analytics_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', fiveMinAgo);

      // Sessions actives avec détails
      const { data: activeSessions } = await supabase
        .from('analytics_sessions')
        .select('country, country_code, latitude, longitude, device_type, browser')
        .gte('last_seen', fiveMinAgo);

      // Agréger par pays
      const countryMap = new Map<string, any>();
      (activeSessions || []).forEach(s => {
        const key = s.country_code || 'UN';
        if (!countryMap.has(key)) {
          countryMap.set(key, {
            country: s.country || 'Unknown',
            code: key,
            lat: s.latitude,
            lng: s.longitude,
            count: 0,
          });
        }
        countryMap.get(key)!.count++;
      });
      const connections: any[] = [];
      countryMap.forEach(val => connections.push(val));
      connections.sort((a, b) => b.count - a.count);

      // Devices
      const devices = { desktop: 0, mobile: 0, tablet: 0 };
      (activeSessions || []).forEach(s => {
        const dt = (s.device_type || 'desktop') as keyof typeof devices;
        if (dt in devices) devices[dt]++;
      });

      // Browsers
      const browserMap = new Map<string, number>();
      (activeSessions || []).forEach(s => {
        const b = s.browser || 'Other';
        browserMap.set(b, (browserMap.get(b) || 0) + 1);
      });
      const browsers: any[] = [];
      browserMap.forEach((count, name) => browsers.push({ name, count }));
      browsers.sort((a, b) => b.count - a.count);

      // Pages actives
      const { data: recentPageEvents } = await supabase
        .from('analytics_events')
        .select('page_url, session_id')
        .gte('created_at', fiveMinAgo);

      const pageMap = new Map<string, Set<string>>();
      (recentPageEvents || []).forEach(e => {
        if (!pageMap.has(e.page_url)) pageMap.set(e.page_url, new Set());
        pageMap.get(e.page_url)!.add(e.session_id);
      });
      const topPages: any[] = [];
      pageMap.forEach((sessions, page) => topPages.push({ page, users: sessions.size }));
      topPages.sort((a, b) => b.users - a.users);

      // Événements récents
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('page_url, country_code, device_type, browser, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      // Timeline vues/min
      const { data: timelineData } = await supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', thirtyMinAgo)
        .order('created_at', { ascending: true });

      const minuteMap = new Map<string, number>();
      (timelineData || []).forEach(e => {
        const d = new Date(e.created_at);
        const key = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        minuteMap.set(key, (minuteMap.get(key) || 0) + 1);
      });
      const pageViewsTimeline: any[] = [];
      minuteMap.forEach((count, time) => pageViewsTimeline.push({ time, count }));
      pageViewsTimeline.sort((a, b) => a.time.localeCompare(b.time));

      // Sources de trafic
      const { data: referrerData } = await supabase
        .from('analytics_sessions')
        .select('entry_referrer')
        .gte('first_seen', oneDayAgo);

      const sources = { direct: 0, google: 0, social: 0, referral: 0, other: 0 };
      (referrerData || []).forEach(s => {
        const ref = (s.entry_referrer || '').toLowerCase();
        if (!ref) sources.direct++;
        else if (ref.includes('google')) sources.google++;
        else if (ref.includes('facebook') || ref.includes('twitter') || ref.includes('instagram') || ref.includes('tiktok') || ref.includes('t.co')) sources.social++;
        else sources.referral++;
      });

      // Bounce rate
      const { data: bounceData } = await supabase
        .from('analytics_sessions')
        .select('is_bounce, pages_viewed')
        .gte('first_seen', oneDayAgo);

      const bounceCount = bounceData?.filter(s => s.is_bounce).length || 0;
      const bounceRate = (bounceData?.length || 0) > 0
        ? Math.round((bounceCount / bounceData!.length) * 100) : 0;
      const avgPages = (bounceData?.length || 0) > 0
        ? Math.round((bounceData!.reduce((s, d) => s + (d.pages_viewed || 1), 0) / bounceData!.length) * 10) / 10 : 0;

      return NextResponse.json({
        activeUsers: activeUsers || 0,
        connections,
        devices,
        browsers,
        topPages: topPages.slice(0, 10),
        recentEvents: (recentEvents || []).map(e => ({
          page: e.page_url,
          country: e.country_code,
          device: e.device_type,
          browser: e.browser,
          time: new Date(e.created_at).toLocaleTimeString('fr-FR'),
          id: e.created_at + e.page_url,
        })),
        pageViewsTimeline,
        sources,
        bounceRate,
        avgPagesPerSession: avgPages,
      });
    }

    // ========================================
    // HEATMAP — 7 jours
    // ========================================
    if (type === 'heatmap') {
      const { data } = await supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
      (data || []).forEach(e => {
        const d = new Date(e.created_at);
        const day = d.getDay();
        const hour = d.getHours();
        const adjustedDay = day === 0 ? 6 : day - 1;
        heatmap[adjustedDay][hour]++;
      });

      return NextResponse.json({ heatmap });
    }

    // ========================================
    // HISTORY — 30 jours
    // ========================================
    if (type === 'history') {
      // Vues par jour
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      const dayMap = new Map<string, number>();
      (eventsData || []).forEach(e => {
        const day = new Date(e.created_at).toISOString().split('T')[0];
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      });
      const dailyViews: any[] = [];
      dayMap.forEach((views, date) => dailyViews.push({ date, views }));
      dailyViews.sort((a, b) => a.date.localeCompare(b.date));

      // Sessions stats
      const { data: sessionData } = await supabase
        .from('analytics_sessions')
        .select('is_bounce, pages_viewed')
        .gte('first_seen', thirtyDaysAgo);

      const totalSessions = sessionData?.length || 0;
      const bounceRate = totalSessions > 0
        ? Math.round((sessionData!.filter(s => s.is_bounce).length / totalSessions) * 100) : 0;
      const avgPages = totalSessions > 0
        ? Math.round((sessionData!.reduce((s, d) => s + (d.pages_viewed || 1), 0) / totalSessions) * 10) / 10 : 0;

      // Total vues aujourd'hui
      const { count: todayViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

      // Total vues cette semaine
      const { count: weekViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);

      return NextResponse.json({
        dailyViews,
        totalSessions,
        bounceRate,
        avgPagesPerSession: avgPages,
        todayViews: todayViews || 0,
        weekViews: weekViews || 0,
      });
    }

    // ========================================
    // TYPE INCONNU — retourner du vide au lieu de 400
    // ========================================
    return NextResponse.json({
      activeUsers: 0,
      connections: [],
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      browsers: [],
      topPages: [],
      recentEvents: [],
      pageViewsTimeline: [],
      sources: { direct: 0, google: 0, social: 0, referral: 0, other: 0 },
      bounceRate: 0,
      avgPagesPerSession: 0,
    });

  } catch (e: any) {
    console.error('[Realtime] Error:', e.message);
    // Retourner des données vides au lieu d'une erreur
    return NextResponse.json({
      activeUsers: 0,
      connections: [],
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      browsers: [],
      topPages: [],
      recentEvents: [],
      pageViewsTimeline: [],
      sources: { direct: 0, google: 0, social: 0, referral: 0, other: 0 },
      bounceRate: 0,
      avgPagesPerSession: 0,
      error: e.message,
    });
  }
}