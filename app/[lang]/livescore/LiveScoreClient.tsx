// app/[lang]/livescore/LiveScoreClient.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Lang } from '@/lib/i18n';

type MatchGroup = Record<string, any[]>;

// ═══ STATUTS UNIFIÉS ═══
// football-data.org mapped: NS, LIVE, HT, FT, ET, PEN, PST, CANC, SUSP
const STATUS_LABELS: Record<string, Record<string, string>> = {
  LIVE: { fr: 'En cours', en: 'Live', ar: 'مباشر', es: 'En juego' },
  '1H': { fr: '1ère MT', en: '1st half', ar: 'الشوط الأول', es: '1er tiempo' },
  '2H': { fr: '2ème MT', en: '2nd half', ar: 'الشوط الثاني', es: '2do tiempo' },
  HT: { fr: 'Mi-temps', en: 'Half-time', ar: 'استراحة', es: 'Descanso' },
  FT: { fr: 'Terminé', en: 'Full-time', ar: 'انتهت', es: 'Final' },
  AET: { fr: 'Après prol.', en: 'After ET', ar: 'بعد الإضافي', es: 'Después prórroga' },
  NS: { fr: 'À venir', en: 'Upcoming', ar: 'قادمة', es: 'Por jugar' },
  PST: { fr: 'Reporté', en: 'Postponed', ar: 'مؤجلة', es: 'Aplazado' },
  CANC: { fr: 'Annulé', en: 'Cancelled', ar: 'ملغاة', es: 'Cancelado' },
  SUSP: { fr: 'Suspendu', en: 'Suspended', ar: 'موقوفة', es: 'Suspendido' },
  ET: { fr: 'Prolongations', en: 'Extra time', ar: 'وقت إضافي', es: 'Prórroga' },
  PEN: { fr: 'Tirs au but', en: 'Penalties', ar: 'ركلات ترجيح', es: 'Penales' },
};

function isLive(status: string): boolean {
  return status === 'LIVE' || status === '1H' || status === '2H' ||
    status === 'HT' || status === 'ET' || status === 'PEN';
}

function isFinished(status: string): boolean {
  return status === 'FT' || status === 'AET' || status === 'PEN';
}

export default function LiveScoreClient({ initialMatches, lang }: { initialMatches: MatchGroup; lang: Lang }) {
  const [matches, setMatches] = useState<MatchGroup>(initialMatches);
  const [filter, setFilter] = useState<'all' | 'live' | 'finished' | 'upcoming'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Auto-refresh every 60 seconds
  useEffect(function () {
    var interval = setInterval(async function () {
      try {
        setLoading(true);
        var res = await fetch('/api/livescore');
        if (res.ok) {
          var data = await res.json();
          setMatches(data.grouped || {});
          setLastUpdate(new Date());
        }
      } catch (e) {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 60000);

    return function () { clearInterval(interval); };
  }, []);

  // Filter matches
  var filteredGroups: MatchGroup = {};
  Object.entries(matches).forEach(function ([league, games]) {
    var filtered = games.filter(function (m) {
      var s = m.fixture.status.short;
      if (filter === 'live') return isLive(s);
      if (filter === 'finished') return isFinished(s);
      if (filter === 'upcoming') return s === 'NS';
      return true;
    });
    if (filtered.length > 0) filteredGroups[league] = filtered;
  });

  var allGames = Object.values(matches).reduce(function (acc, games) {
    return acc.concat(games);
  }, [] as any[]);

  var totalMatches = allGames.length;
  var liveCount = allGames.filter(function (m) { return isLive(m.fixture.status.short); }).length;

  var filterLabels: Record<string, Record<string, string>> = {
    all: { fr: 'Tous', en: 'All', ar: 'الكل', es: 'Todos' },
    live: { fr: 'En direct', en: 'Live', ar: 'مباشر', es: 'En vivo' },
    finished: { fr: 'Terminés', en: 'Finished', ar: 'انتهت', es: 'Finalizados' },
    upcoming: { fr: 'À venir', en: 'Upcoming', ar: 'قادمة', es: 'Próximos' },
  };

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--accent)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'pulseDot 1.5s ease infinite' }} />
              {liveCount} {lang === 'fr' ? 'en direct' : lang === 'ar' ? 'مباشر' : lang === 'es' ? 'en vivo' : 'live'}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {totalMatches} {lang === 'fr' ? 'matchs' : lang === 'ar' ? 'مباريات' : lang === 'es' ? 'partidos' : 'matches'}
          </span>
          {loading && (
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>⟳</span>
          )}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
          {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'live', 'finished', 'upcoming'] as const).map(function (f) {
          return (
            <button key={f} onClick={function () { setFilter(f); }}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-all"
              style={{
                background: filter === f ? 'var(--ink)' : 'transparent',
                color: filter === f ? 'var(--paper)' : 'var(--muted)',
                border: filter === f ? 'none' : '1px solid var(--border)',
                borderRadius: '2px',
              }}>
              {filterLabels[f][lang]}
              {f === 'live' && liveCount > 0 ? ' (' + liveCount + ')' : ''}
            </button>
          );
        })}
      </div>

      {/* Matches grouped by league */}
      {Object.keys(filteredGroups).length === 0 ? (
        <div className="text-center py-16">
          <div className="font-display text-5xl mb-4" style={{ color: 'var(--border)' }}>⚽</div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {filter === 'live'
              ? (lang === 'fr' ? 'Aucun match en direct actuellement' : lang === 'ar' ? 'لا توجد مباريات مباشرة حالياً' : lang === 'es' ? 'No hay partidos en vivo' : 'No live matches right now')
              : (lang === 'fr' ? 'Aucun match trouvé' : lang === 'ar' ? 'لم يتم العثور على مباريات' : lang === 'es' ? 'No se encontraron partidos' : 'No matches found')
            }
          </p>
        </div>
      ) : (
        Object.entries(filteredGroups).map(function ([league, games]) {
          return (
            <div key={league} className="mb-6 anim-up">
              {/* League header */}
              <div className="flex items-center gap-2 py-2 mb-1" style={{ borderBottom: '2px solid var(--ink)' }}>
                {games[0]?.league?.logo && (
                  <img src={games[0].league.logo} alt="" className="w-5 h-5" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                  {league}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {games[0]?.league?.country}
                  {games[0]?.league?.round ? ' · ' + games[0].league.round : ''}
                </span>
              </div>

              {/* Matches */}
              {games.map(function (match) {
                var status = match.fixture.status.short;
                var live = isLive(status);
                var finished = isFinished(status);
                var time = new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={match.id} className="flex items-center py-3 hover:bg-[var(--paper-warm)] transition-colors px-2 -mx-2"
                    style={{ borderBottom: '1px solid var(--border)' }}>

                    {/* Time / Status */}
                    <div className="w-16 shrink-0 text-center">
                      {live ? (
                        <div>
                          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                            {match.fixture.status.elapsed ? match.fixture.status.elapsed + "'" : (STATUS_LABELS[status]?.[lang] || status)}
                          </span>
                        </div>
                      ) : finished ? (
                        <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted)' }}>
                          {STATUS_LABELS[status]?.[lang] || STATUS_LABELS['FT']?.[lang] || 'FT'}
                        </span>
                      ) : status === 'NS' ? (
                        <span className="text-xs" style={{ color: 'var(--ink)' }}>{time}</span>
                      ) : (
                        <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                          {STATUS_LABELS[status]?.[lang] || status}
                        </span>
                      )}
                    </div>

                    {/* Teams + Score */}
                    <div className="flex-1 min-w-0">
                      {/* Home */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {match.teams.home.logo && (
                            <img src={match.teams.home.logo} alt="" className="w-4 h-4 shrink-0" />
                          )}
                          <span className="text-sm truncate" style={{
                            color: 'var(--ink)',
                            fontWeight: match.teams.home.winner ? 700 : 400,
                          }}>
                            {match.teams.home.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold ml-2 w-6 text-center" style={{
                          color: live ? 'var(--accent)' : 'var(--ink)',
                        }}>
                          {match.goals.home !== null ? match.goals.home : '-'}
                        </span>
                      </div>
                      {/* Away */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {match.teams.away.logo && (
                            <img src={match.teams.away.logo} alt="" className="w-4 h-4 shrink-0" />
                          )}
                          <span className="text-sm truncate" style={{
                            color: 'var(--ink)',
                            fontWeight: match.teams.away.winner ? 700 : 400,
                          }}>
                            {match.teams.away.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold ml-2 w-6 text-center" style={{
                          color: live ? 'var(--accent)' : 'var(--ink)',
                        }}>
                          {match.goals.away !== null ? match.goals.away : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Live indicator */}
                    {live && (
                      <div className="w-2 h-2 rounded-full ml-3 shrink-0"
                        style={{ background: 'var(--accent)', animation: 'pulseDot 1.5s ease infinite' }} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}