// app/api/debug-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    },
    tests: {},
  };

  // Vérifier la connexion Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test 1: Table analytics_events existe ?
    const { data: eventsCheck, error: eventsErr } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);
    results.tests.events_table = eventsErr 
      ? { error: eventsErr.message, code: eventsErr.code, hint: eventsErr.hint }
      : { ok: true, rows: eventsCheck?.length || 0 };

    // Test 2: Table analytics_sessions existe ?
    const { data: sessionsCheck, error: sessionsErr } = await supabase
      .from('analytics_sessions')
      .select('id')
      .limit(1);
    results.tests.sessions_table = sessionsErr
      ? { error: sessionsErr.message, code: sessionsErr.code, hint: sessionsErr.hint }
      : { ok: true, rows: sessionsCheck?.length || 0 };

    // Test 3: Peut-on insérer ?
    const testSessionId = 'debug_test_' + Date.now();
    const { error: insertEventErr } = await supabase
      .from('analytics_events')
      .insert({
        session_id: testSessionId,
        page_url: '/debug-test',
        country: 'Test',
        country_code: 'XX',
        device_type: 'desktop',
      });
    results.tests.insert_event = insertEventErr
      ? { error: insertEventErr.message, code: insertEventErr.code, hint: insertEventErr.hint }
      : { ok: true };

    const { error: insertSessionErr } = await supabase
      .from('analytics_sessions')
      .insert({
        id: testSessionId,
        first_page: '/debug-test',
        country: 'Test',
        country_code: 'XX',
        device_type: 'desktop',
        last_seen: new Date().toISOString(),
      });
    results.tests.insert_session = insertSessionErr
      ? { error: insertSessionErr.message, code: insertSessionErr.code, hint: insertSessionErr.hint }
      : { ok: true };

    // Test 4: Peut-on lire les sessions actives ?
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count, error: countErr } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', fiveMinAgo);
    results.tests.active_sessions = countErr
      ? { error: countErr.message }
      : { ok: true, count };

    // Test 5: Compter tout
    const { count: totalEvents } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });
    const { count: totalSessions } = await supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true });
    results.tests.totals = {
      total_events: totalEvents || 0,
      total_sessions: totalSessions || 0,
    };

    // Nettoyer le test
    await supabase.from('analytics_events').delete().eq('session_id', testSessionId);
    await supabase.from('analytics_sessions').delete().eq('id', testSessionId);
    results.tests.cleanup = { ok: true };

  } catch (e: any) {
    results.tests.connection = { error: e.message };
  }

  // Géo headers disponibles ?
  results.geo = {
    'x-vercel-ip-country': req.headers.get('x-vercel-ip-country'),
    'x-vercel-ip-city': req.headers.get('x-vercel-ip-city'),
    'x-forwarded-for': req.headers.get('x-forwarded-for'),
    'req.geo': req.geo || 'undefined (normal en dev)',
  };

  return NextResponse.json(results, { status: 200 });
}