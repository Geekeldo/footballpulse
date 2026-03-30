// app/api/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

function hashIP(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + (process.env.ANALYTICS_SALT || 'fp-salt'))
    .digest('hex')
    .substring(0, 16);
}

function cleanupRateLimitCache(now: number) {
  if (rateLimitCache.size <= 10000) return;
  const keysToDelete: string[] = [];
  rateLimitCache.forEach((val, key) => {
    if (now > val.resetAt) keysToDelete.push(key);
  });
  keysToDelete.forEach(key => rateLimitCache.delete(key));
}

const countryNames: Record<string, string> = {
  FR: 'France', GB: 'United Kingdom', US: 'United States', DE: 'Germany',
  ES: 'Spain', IT: 'Italy', PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium',
  MA: 'Morocco', DZ: 'Algeria', TN: 'Tunisia', EG: 'Egypt', SA: 'Saudi Arabia',
  AE: 'UAE', QA: 'Qatar', BR: 'Brazil', AR: 'Argentina', MX: 'Mexico',
  JP: 'Japan', KR: 'South Korea', CN: 'China', IN: 'India', AU: 'Australia',
  CA: 'Canada', TR: 'Turkey', PL: 'Poland', SE: 'Sweden', NO: 'Norway',
};

const countryCoords: Record<string, { lat: number; lng: number }> = {
  FR: { lat: 46.2, lng: 2.2 }, GB: { lat: 55.4, lng: -3.4 }, US: { lat: 37.1, lng: -95.7 },
  DE: { lat: 51.2, lng: 10.5 }, ES: { lat: 40.5, lng: -3.7 }, IT: { lat: 41.9, lng: 12.6 },
  MA: { lat: 31.8, lng: -7.1 }, DZ: { lat: 28.0, lng: 1.7 }, TN: { lat: 33.9, lng: 9.5 },
  EG: { lat: 26.8, lng: 30.8 }, BR: { lat: -14.2, lng: -51.9 }, BE: { lat: 50.5, lng: 4.5 },
};

export async function POST(req: NextRequest) {
  try {
    // IP + rate limit
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const ipHash = hashIP(ip);
    const now = Date.now();

    const rateEntry = rateLimitCache.get(ipHash);
    if (rateEntry && now < rateEntry.resetAt && rateEntry.count > 200) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }
    rateLimitCache.set(ipHash, {
      count: (rateEntry && now < rateEntry.resetAt) ? (rateEntry.count + 1) : 1,
      resetAt: (rateEntry && now < rateEntry.resetAt) ? rateEntry.resetAt : now + 60000,
    });
    cleanupRateLimitCache(now);

    // Parse body — supporte application/json ET text/plain (sendBeacon)
    let body: any;
    try {
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('json')) {
        body = await req.json();
      } else {
        const raw = await req.text();
        body = JSON.parse(raw);
      }
    } catch (e: any) {
      console.error('[Track] Parse error:', e.message);
      return NextResponse.json({ error: 'Bad body' }, { status: 400 });
    }

    const { type, session_id } = body;
    if (!session_id || !type) {
      console.error('[Track] Missing fields:', { type, session_id: !!session_id });
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // === GEO ===
    // En production Vercel fournit ces headers. En local tout sera "Unknown"
    const countryCode = req.headers.get('x-vercel-ip-country') || 'UN';
    const city = req.headers.get('x-vercel-ip-city') || null;

    let latitude: number | null = null;
    let longitude: number | null = null;

    // Essayer geo de Vercel
    if (req.geo?.latitude) {
      latitude = parseFloat(req.geo.latitude);
      longitude = parseFloat(req.geo.longitude || '0');
    }
    // Fallback : coordonnées par pays
    else if (countryCode !== 'UN' && countryCoords[countryCode]) {
      latitude = countryCoords[countryCode].lat + (Math.random() - 0.5) * 2;
      longitude = countryCoords[countryCode].lng + (Math.random() - 0.5) * 2;
    }

    const countryName = countryNames[countryCode] || (countryCode === 'UN' ? 'Unknown' : countryCode);

    // === PAGEVIEW ===
    if (type === 'pageview') {
      console.log('[Track] pageview:', body.page_url, '| country:', countryName, '| device:', body.device_type);

      // Insérer événement
      const { error: evtErr } = await supabase.from('analytics_events').insert({
        session_id,
        page_url: body.page_url || '/',
        page_title: body.page_title || null,
        referrer: body.referrer || null,
        country: countryName,
        country_code: countryCode,
        city: city ? decodeURIComponent(city) : null,
        latitude,
        longitude,
        device_type: body.device_type || 'desktop',
        browser: body.browser || null,
        os: body.os || null,
        screen_width: body.screen_width || null,
        screen_height: body.screen_height || null,
        language: body.language || null,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        ip_hash: ipHash,
      });

      if (evtErr) {
        console.error('[Track] Event insert FAILED:', evtErr.message, evtErr.code, evtErr.details);
        return NextResponse.json({ error: evtErr.message }, { status: 500 });
      }

      // Upsert session
      const { data: existing } = await supabase
        .from('analytics_sessions')
        .select('id, pages_viewed')
        .eq('id', session_id)
        .maybeSingle();

      if (existing) {
        const { error: updErr } = await supabase
          .from('analytics_sessions')
          .update({
            pages_viewed: (existing.pages_viewed || 1) + 1,
            is_bounce: false,
            last_seen: new Date().toISOString(),
          })
          .eq('id', session_id);

        if (updErr) console.error('[Track] Session update error:', updErr.message);
      } else {
        const { error: insErr } = await supabase
          .from('analytics_sessions')
          .insert({
            id: session_id,
            first_page: body.page_url || '/',
            entry_referrer: body.referrer || null,
            country: countryName,
            country_code: countryCode,
            city: city ? decodeURIComponent(city) : null,
            latitude,
            longitude,
            device_type: body.device_type || 'desktop',
            browser: body.browser || null,
            os: body.os || null,
            language: body.language || null,
            pages_viewed: 1,
            is_bounce: true,
            last_seen: new Date().toISOString(),
          });

        if (insErr) console.error('[Track] Session insert error:', insErr.message);
      }

      return NextResponse.json({ ok: true, tracked: body.page_url });
    }

    // === HEARTBEAT ===
    if (type === 'heartbeat') {
      await supabase
        .from('analytics_sessions')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', session_id);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[Track] FATAL:', e.message, e.stack);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}