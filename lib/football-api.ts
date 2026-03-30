// lib/football-api.ts
// ============================================================
// FOOTBALL-DATA.ORG v4 — Seule source API
// Free tier: 10 req/min
// Compétitions gratuites: PL, BL1, SA, PD, FL1, ELC, CL, EC, WC
// ============================================================

const API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';
const BASE_URL = 'https://api.football-data.org/v4';

async function fdFetch(endpoint: string, params?: Record<string, string>): Promise<any> {
  if (!API_KEY) {
    throw new Error('FOOTBALL_DATA_API_KEY not configured');
  }

  let url = BASE_URL + endpoint;

  if (params) {
    const parts: string[] = [];
    Object.keys(params).forEach(function (k) {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    });
    if (parts.length > 0) {
      url = url + '?' + parts.join('&');
    }
  }

  console.log('[FD] Fetching: ' + url);

  const res = await fetch(url, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 60 },
  });

  if (res.status === 429) {
    console.error('[FD] Rate limited!');
    throw new Error('football-data.org rate limited — wait 60s');
  }

  if (!res.ok) {
    const text = await res.text().catch(function () { return ''; });
    console.error('[FD] Error ' + res.status + ': ' + text.slice(0, 300));
    throw new Error('football-data.org error ' + res.status);
  }

  return res.json();
}

// ============================================================
// STATUS MAPPING
// football-data.org → unified short codes used by frontend
// ============================================================

function mapStatusShort(fdStatus: string): string {
  switch (fdStatus) {
    case 'SCHEDULED': return 'NS';
    case 'TIMED': return 'NS';
    case 'IN_PLAY': return 'LIVE';
    case 'PAUSED': return 'HT';
    case 'FINISHED': return 'FT';
    case 'SUSPENDED': return 'SUSP';
    case 'POSTPONED': return 'PST';
    case 'CANCELLED': return 'CANC';
    case 'AWARDED': return 'FT';
    case 'EXTRA_TIME': return 'ET';
    case 'PENALTY_SHOOTOUT': return 'PEN';
    default: return fdStatus;
  }
}

function mapStatusLong(fdStatus: string): string {
  switch (fdStatus) {
    case 'SCHEDULED': return 'Not Started';
    case 'TIMED': return 'Not Started';
    case 'IN_PLAY': return 'In Play';
    case 'PAUSED': return 'Halftime';
    case 'FINISHED': return 'Finished';
    case 'SUSPENDED': return 'Suspended';
    case 'POSTPONED': return 'Postponed';
    case 'CANCELLED': return 'Cancelled';
    case 'EXTRA_TIME': return 'Extra Time';
    case 'PENALTY_SHOOTOUT': return 'Penalties';
    default: return fdStatus;
  }
}

function isLiveStatus(fdStatus: string): boolean {
  return fdStatus === 'IN_PLAY' || fdStatus === 'PAUSED' ||
    fdStatus === 'EXTRA_TIME' || fdStatus === 'PENALTY_SHOOTOUT';
}

// Estimer la minute de jeu
function estimateMinute(match: any): number | null {
  if (!isLiveStatus(match.status)) return null;

  // football-data.org ne donne pas toujours la minute
  // On l'estime à partir de l'heure de début
  if (match.minute) return match.minute;

  const kickoff = new Date(match.utcDate).getTime();
  const now = Date.now();
  const elapsedMs = now - kickoff;
  const elapsedMin = Math.floor(elapsedMs / 60000);

  if (match.status === 'PAUSED') return 45; // Mi-temps
  if (match.status === 'EXTRA_TIME') return Math.min(120, Math.max(91, elapsedMin));
  if (elapsedMin < 0) return null;
  if (elapsedMin > 90) return 90; // Probablement temps additionnel
  return Math.min(90, elapsedMin);
}

// ============================================================
// LEAGUES CONFIG
// ============================================================

export type LeagueConfig = {
  id: number;
  code: string;
  name: string;
  slug: string;
  country: string;
  logo: string;
  flag: string;
};

export const LEAGUES: LeagueConfig[] = [
  { id: 2021, code: 'PL', name: 'Premier League', slug: 'premier-league', country: 'England', logo: '', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 2014, code: 'PD', name: 'La Liga', slug: 'la-liga', country: 'Spain', logo: '', flag: '🇪🇸' },
  { id: 2019, code: 'SA', name: 'Serie A', slug: 'serie-a', country: 'Italy', logo: '', flag: '🇮🇹' },
  { id: 2002, code: 'BL1', name: 'Bundesliga', slug: 'bundesliga', country: 'Germany', logo: '', flag: '🇩🇪' },
  { id: 2015, code: 'FL1', name: 'Ligue 1', slug: 'ligue-1', country: 'France', logo: '', flag: '🇫🇷' },
  { id: 2001, code: 'CL', name: 'Champions League', slug: 'champions-league', country: 'Europe', logo: '', flag: '🇪🇺' },
  { id: 2016, code: 'ELC', name: 'Championship', slug: 'championship', country: 'England', logo: '', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 2000, code: 'WC', name: 'World Cup', slug: 'world-cup', country: 'World', logo: '', flag: '🌍' },
  { id: 2018, code: 'EC', name: 'European Championship', slug: 'euro', country: 'Europe', logo: '', flag: '🇪🇺' },
];

export function getLeagueBySlug(slug: string): LeagueConfig | undefined {
  return LEAGUES.find(function (l) { return l.slug === slug; });
}

export function getLeagueByCode(code: string): LeagueConfig | undefined {
  return LEAGUES.find(function (l) { return l.code === code; });
}

// ============================================================
// LIVESCORES — Format compatible avec le frontend existant
// ============================================================

export type LiveMatch = {
  id: number;
  league: {
    id: number;
    name: string;
    logo: string;
    country: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
    venue: { name: string | null; city: string | null };
  };
};

export async function fetchLiveScores(): Promise<LiveMatch[]> {
  const today = new Date().toISOString().split('T')[0];

  const data = await fdFetch('/matches', {
    dateFrom: today,
    dateTo: today,
  });

  const rawMatches: any[] = data.matches || [];
  console.log('[LiveScore] Raw matches from football-data.org: ' + rawMatches.length);

  return rawMatches.map(function (m: any): LiveMatch {
    const statusShort = mapStatusShort(m.status);
    const statusLong = mapStatusLong(m.status);
    const elapsed = estimateMinute(m);

    // Scores — football-data.org structure
    const ftHome = m.score?.fullTime?.home;
    const ftAway = m.score?.fullTime?.away;
    const htHome = m.score?.halfTime?.home;
    const htAway = m.score?.halfTime?.away;

    // Pour les matchs en cours, utiliser le score actuel
    // football-data.org met le score courant dans fullTime même en cours
    var goalsHome: number | null = null;
    var goalsAway: number | null = null;

    if (ftHome !== null && ftHome !== undefined) {
      goalsHome = ftHome;
    }
    if (ftAway !== null && ftAway !== undefined) {
      goalsAway = ftAway;
    }

    // Déterminer le winner
    var homeWinner: boolean | null = null;
    var awayWinner: boolean | null = null;
    if (m.status === 'FINISHED' && goalsHome !== null && goalsAway !== null) {
      if (goalsHome > goalsAway) homeWinner = true;
      else if (goalsAway > goalsHome) awayWinner = true;
    }

    return {
      id: m.id,
      league: {
        id: m.competition?.id || 0,
        name: m.competition?.name || 'Unknown',
        logo: m.competition?.emblem || '',
        country: m.area?.name || '',
        round: m.matchday ? 'Matchday ' + m.matchday : (m.stage || ''),
      },
      teams: {
        home: {
          id: m.homeTeam?.id || 0,
          name: m.homeTeam?.shortName || m.homeTeam?.name || 'Home',
          logo: m.homeTeam?.crest || '',
          winner: homeWinner,
        },
        away: {
          id: m.awayTeam?.id || 0,
          name: m.awayTeam?.shortName || m.awayTeam?.name || 'Away',
          logo: m.awayTeam?.crest || '',
          winner: awayWinner,
        },
      },
      goals: {
        home: goalsHome,
        away: goalsAway,
      },
      score: {
        halftime: {
          home: htHome !== undefined ? htHome : null,
          away: htAway !== undefined ? htAway : null,
        },
        fulltime: {
          home: goalsHome,
          away: goalsAway,
        },
      },
      fixture: {
        id: m.id,
        date: m.utcDate,
        status: {
          short: statusShort,
          long: statusLong,
          elapsed: elapsed,
        },
        venue: {
          name: m.venue || null,
          city: null,
        },
      },
    };
  });
}

// ============================================================
// STANDINGS
// ============================================================

export type StandingTeam = {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
  form: string;
};

export async function fetchStandings(leagueInput: number | string): Promise<StandingTeam[]> {
  var code: string = '';

  if (typeof leagueInput === 'string') {
    // Could be a slug or a code
    var league = LEAGUES.find(function (l) { return l.slug === leagueInput || l.code === leagueInput; });
    if (league) {
      code = league.code;
    } else {
      code = leagueInput;
    }
  } else {
    // Numeric ID — find matching league
    var leagueById = LEAGUES.find(function (l) { return l.id === leagueInput; });
    if (leagueById) {
      code = leagueById.code;
    } else {
      console.log('[Standings] Unknown league ID: ' + leagueInput);
      return [];
    }
  }

  try {
    var data = await fdFetch('/competitions/' + code + '/standings');
    var standings = data.standings;

    if (!standings || !standings[0] || !standings[0].table) {
      console.log('[Standings] No table for ' + code);
      return [];
    }

    return standings[0].table.map(function (s: any): StandingTeam {
      return {
        rank: s.position,
        team: {
          id: s.team?.id || 0,
          name: s.team?.shortName || s.team?.name || 'Unknown',
          logo: s.team?.crest || '',
        },
        points: s.points || 0,
        played: s.playedGames || 0,
        win: s.won || 0,
        draw: s.draw || 0,
        lose: s.lost || 0,
        goalsFor: s.goalsFor || 0,
        goalsAgainst: s.goalsAgainst || 0,
        goalsDiff: s.goalDifference || 0,
        form: s.form || '',
      };
    });
  } catch (e: any) {
    console.error('[Standings] Error for ' + code + ': ' + e.message);
    return [];
  }
}

// ============================================================
// FIXTURES — Upcoming
// ============================================================

export type Fixture = {
  id: number;
  date: string;
  status: string;
  round: string;
  home: { name: string; logo: string };
  away: { name: string; logo: string };
  goals: { home: number | null; away: number | null };
  venue: string | null;
};

export async function fetchFixtures(leagueInput: number | string, limit?: number): Promise<Fixture[]> {
  var code = resolveLeagueCode(leagueInput);
  if (!code) return [];

  try {
    var data = await fdFetch('/competitions/' + code + '/matches', {
      status: 'SCHEDULED,TIMED',
    });

    var matches: any[] = data.matches || [];
    if (limit && limit > 0) {
      matches = matches.slice(0, limit);
    }

    return matches.map(function (m: any): Fixture {
      return {
        id: m.id,
        date: m.utcDate,
        status: mapStatusShort(m.status),
        round: m.matchday ? 'Matchday ' + m.matchday : (m.stage || ''),
        home: {
          name: m.homeTeam?.shortName || m.homeTeam?.name || 'TBD',
          logo: m.homeTeam?.crest || '',
        },
        away: {
          name: m.awayTeam?.shortName || m.awayTeam?.name || 'TBD',
          logo: m.awayTeam?.crest || '',
        },
        goals: { home: null, away: null },
        venue: m.venue || null,
      };
    });
  } catch (e: any) {
    console.error('[Fixtures] Error for ' + code + ': ' + e.message);
    return [];
  }
}

// ============================================================
// RESULTS — Past matches
// ============================================================

export async function fetchResults(leagueInput: number | string, limit?: number): Promise<Fixture[]> {
  var code = resolveLeagueCode(leagueInput);
  if (!code) return [];

  try {
    var data = await fdFetch('/competitions/' + code + '/matches', {
      status: 'FINISHED',
    });

    var matches: any[] = data.matches || [];
    // Prendre les derniers
    if (limit && limit > 0) {
      matches = matches.slice(-limit);
    }

    return matches.map(function (m: any): Fixture {
      return {
        id: m.id,
        date: m.utcDate,
        status: 'FT',
        round: m.matchday ? 'Matchday ' + m.matchday : (m.stage || ''),
        home: {
          name: m.homeTeam?.shortName || m.homeTeam?.name || 'Unknown',
          logo: m.homeTeam?.crest || '',
        },
        away: {
          name: m.awayTeam?.shortName || m.awayTeam?.name || 'Unknown',
          logo: m.awayTeam?.crest || '',
        },
        goals: {
          home: m.score?.fullTime?.home !== undefined ? m.score.fullTime.home : null,
          away: m.score?.fullTime?.away !== undefined ? m.score.fullTime.away : null,
        },
        venue: m.venue || null,
      };
    });
  } catch (e: any) {
    console.error('[Results] Error for ' + code + ': ' + e.message);
    return [];
  }
}

// ============================================================
// HELPERS
// ============================================================

function resolveLeagueCode(input: number | string): string | null {
  if (typeof input === 'string') {
    var bySlugOrCode = LEAGUES.find(function (l) {
      return l.slug === input || l.code === input;
    });
    return bySlugOrCode ? bySlugOrCode.code : input;
  }

  var byId = LEAGUES.find(function (l) { return l.id === input; });
  if (byId) return byId.code;

  console.log('[resolveLeague] Unknown: ' + input);
  return null;
}

// Pour les pronostics — tous les matchs à venir sur 7 jours
export async function fetchTodayMatches(): Promise<any[]> {
  var today = new Date().toISOString().split('T')[0];
  var in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  try {
    var data = await fdFetch('/matches', {
      dateFrom: today,
      dateTo: in7days,
    });
    return data.matches || [];
  } catch (e: any) {
    console.error('[TodayMatches] Error: ' + e.message);
    return [];
  }
}