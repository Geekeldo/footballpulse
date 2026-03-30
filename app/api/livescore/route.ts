// app/api/livescore/route.ts
import { NextResponse } from 'next/server';
import { fetchLiveScores } from '@/lib/football-api';

export const dynamic = 'force-dynamic';

// Cache mémoire
var liveCache: { data: any; timestamp: number } | null = null;
var CACHE_TTL = 60 * 1000;

export async function GET() {
  try {
    // Servir le cache s'il a moins de 60s
    if (liveCache && Date.now() - liveCache.timestamp < CACHE_TTL) {
      return NextResponse.json(liveCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'HIT',
        },
      });
    }

    var matches = await fetchLiveScores();

    // Grouper par ligue
    var grouped: Record<string, any[]> = {};
    matches.forEach(function (m) {
      var key = m.league.name;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });

    // Trier les ligues par priorité
    var leaguePriority: Record<string, number> = {
      'UEFA Champions League': 100,
      'Champions League': 100,
      'FIFA World Cup': 100,
      'European Championship': 95,
      'Premier League': 95,
      'Primera Division': 90,
      'La Liga': 90,
      'Serie A': 85,
      'Bundesliga': 80,
      'Ligue 1': 75,
      'Championship': 60,
      'Eredivisie': 55,
      'Primeira Liga': 55,
    };

    var sortedKeys = Object.keys(grouped).sort(function (a, b) {
      return (leaguePriority[b] || 50) - (leaguePriority[a] || 50);
    });

    var sortedGrouped: Record<string, any[]> = {};
    sortedKeys.forEach(function (key) {
      sortedGrouped[key] = grouped[key];
    });

    var result = {
      grouped: sortedGrouped,
      total: matches.length,
      source: 'football-data.org',
      timestamp: new Date().toISOString(),
    };

    liveCache = { data: result, timestamp: Date.now() };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('[Livescore API] Error:', error.message);

    if (liveCache) {
      return NextResponse.json(
        Object.assign({}, liveCache.data, { stale: true }),
        { headers: { 'X-Cache': 'STALE' } }
      );
    }

    return NextResponse.json(
      { error: error.message, grouped: {}, total: 0 },
      { status: 500 }
    );
  }
}