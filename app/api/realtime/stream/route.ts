// app/api/realtime/stream/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: any) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Stream fermé
        }
      }

      // Envoyer les données toutes les 5 secondes
      const interval = setInterval(async () => {
        try {
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

          // Utilisateurs actifs
          const { count } = await supabase
            .from('analytics_sessions')
            .select('*', { count: 'exact', head: true })
            .gte('last_seen', fiveMinAgo);

          // Dernier événement
          const { data: lastEvent } = await supabase
            .from('analytics_events')
            .select('page_url, country_code, device_type, created_at')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Connexions par pays
          const { data: countryData } = await supabase
            .from('analytics_sessions')
            .select('country, country_code, latitude, longitude')
            .gte('last_seen', fiveMinAgo);

          const countryMap = new Map<string, any>();
          (countryData || []).forEach(s => {
            const key = s.country_code || 'UN';
            if (!countryMap.has(key)) {
              countryMap.set(key, {
                country: s.country,
                code: s.country_code,
                lat: s.latitude,
                lng: s.longitude,
                count: 0,
              });
            }
            countryMap.get(key)!.count++;
          });

          send({
            activeUsers: count || 0,
            connections: Array.from(countryMap.values()).sort((a: any, b: any) => b.count - a.count),
            lastEvent: lastEvent ? {
              page: lastEvent.page_url,
              country: lastEvent.country_code,
              device: lastEvent.device_type,
              time: new Date(lastEvent.created_at).toLocaleTimeString(),
            } : null,
            timestamp: Date.now(),
          });
        } catch (e) {
          console.error('SSE error:', e);
        }
      }, 5000);

      // Nettoyer quand le client se déconnecte
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}