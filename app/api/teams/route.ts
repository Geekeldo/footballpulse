import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const API_KEY = process.env.API_FOOTBALL_KEY || '';

const TOP_TEAMS = [
  { apiId: 33, name: 'Manchester United', country: 'England' },
  { apiId: 34, name: 'Newcastle', country: 'England' },
  { apiId: 40, name: 'Liverpool', country: 'England' },
  { apiId: 42, name: 'Arsenal', country: 'England' },
  { apiId: 49, name: 'Chelsea', country: 'England' },
  { apiId: 47, name: 'Tottenham', country: 'England' },
  { apiId: 50, name: 'Manchester City', country: 'England' },
  { apiId: 66, name: 'Aston Villa', country: 'England' },
  { apiId: 529, name: 'Barcelona', country: 'Spain' },
  { apiId: 541, name: 'Real Madrid', country: 'Spain' },
  { apiId: 530, name: 'Atletico Madrid', country: 'Spain' },
  { apiId: 548, name: 'Real Sociedad', country: 'Spain' },
  { apiId: 489, name: 'AC Milan', country: 'Italy' },
  { apiId: 496, name: 'Juventus', country: 'Italy' },
  { apiId: 505, name: 'Inter Milan', country: 'Italy' },
  { apiId: 492, name: 'Napoli', country: 'Italy' },
  { apiId: 499, name: 'Atalanta', country: 'Italy' },
  { apiId: 157, name: 'Bayern Munich', country: 'Germany' },
  { apiId: 165, name: 'Borussia Dortmund', country: 'Germany' },
  { apiId: 168, name: 'Bayer Leverkusen', country: 'Germany' },
  { apiId: 85, name: 'Paris Saint-Germain', country: 'France' },
  { apiId: 81, name: 'Marseille', country: 'France' },
  { apiId: 80, name: 'Lyon', country: 'France' },
  { apiId: 91, name: 'Monaco', country: 'France' },
  { apiId: 211, name: 'Benfica', country: 'Portugal' },
  { apiId: 212, name: 'Porto', country: 'Portugal' },
  { apiId: 194, name: 'Ajax', country: 'Netherlands' },
  { apiId: 2939, name: 'Al Ahly', country: 'Egypt' },
  { apiId: 2935, name: 'Zamalek', country: 'Egypt' },
  { apiId: 2949, name: 'Wydad AC', country: 'Morocco' },
  { apiId: 2948, name: 'Raja CA', country: 'Morocco' },
  { apiId: 2932, name: 'Al Hilal', country: 'Saudi Arabia' },
  { apiId: 2934, name: 'Al Nassr', country: 'Saudi Arabia' },
  { apiId: 2930, name: 'Al Ittihad', country: 'Saudi Arabia' },
];

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('teams')
    .select('*')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teams: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.adminPassword || body.adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const batchSize = body.batchSize || 5;
  const offset = body.offset || 0;
  const batch = TOP_TEAMS.slice(offset, offset + batchSize);

  if (batch.length === 0) {
    return NextResponse.json({ message: 'All teams done', total: TOP_TEAMS.length });
  }

  let created = 0;
  const errors: string[] = [];

  for (const team of batch) {
    try {
      const { data: existing } = await supabaseAdmin
        .from('teams')
        .select('id')
        .eq('api_id', team.apiId)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`[Teams] Skipping ${team.name} — already exists`);
        continue;
      }

      let teamInfo: any = {};
      try {
        const res = await fetch(`https://v3.football.api-sports.io/teams?id=${team.apiId}`, {
          headers: { 'x-apisports-key': API_KEY },
        });
        const data = await res.json();
        if (data.response?.[0]) {
          const t = data.response[0].team;
          const v = data.response[0].venue;
          teamInfo = {
            logo: t.logo || '',
            founded: t.founded || null,
            venue_name: v?.name || null,
            venue_capacity: v?.capacity || null,
          };
        }
      } catch (e) {
        console.log(`[Teams] API-Football failed for ${team.name}`);
      }

      console.log(`[Teams] Generating bio for ${team.name}...`);
      const bio = await generateTeamBio(team.name, team.country);
      const slug = slugify(team.name);

      const { error: insertError } = await supabaseAdmin.from('teams').insert({
        api_id: team.apiId,
        name: team.name,
        slug,
        country: team.country,
        logo: teamInfo.logo || null,
        founded: teamInfo.founded || null,
        venue_name: teamInfo.venue_name || null,
        venue_capacity: teamInfo.venue_capacity || null,
        bio,
      });

      if (insertError) {
        errors.push(`${team.name}: ${insertError.message}`);
      } else {
        created++;
        console.log(`[Teams] Created ${team.name}`);
      }

      await new Promise(r => setTimeout(r, 3000));

    } catch (e: any) {
      errors.push(`${team.name}: ${e.message}`);
      console.error(`[Teams] Failed ${team.name}:`, e.message);
    }
  }

  return NextResponse.json({
    created,
    errors: errors.length > 0 ? errors : undefined,
    nextOffset: offset + batchSize,
    remaining: Math.max(0, TOP_TEAMS.length - (offset + batchSize)),
  });
}

async function generateTeamBio(teamName: string, country: string): Promise<Record<string, any>> {
  const prompt = `Write a comprehensive profile for the football team "${teamName}" from ${country}.

For EACH language (fr, en, ar, es), provide:
- description: 2-3 sentences introducing the team
- history: 3-4 paragraphs about the team's history, key moments, legendary players (300-400 words)
- honours: list of major trophies with years
- style: 1-2 sentences about playing style
- rivals: main rivals

Respond ONLY with valid JSON:
{
  "fr": { "description": "...", "history": "...", "honours": "...", "style": "...", "rivals": "..." },
  "en": { ... }, "ar": { ... }, "es": { ... }
}`;

  const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
  const GROQ_KEY = process.env.GROQ_API_KEY || '';

  // Try Gemini first (separate quota)
  if (GEMINI_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
      console.log(`[Teams] Gemini OK for ${teamName}`);
      return JSON.parse(text);
    } catch (e: any) {
      console.log(`[Teams] Gemini failed: ${e.message}, trying Groq...`);
    }
  }

  // Fallback to Groq
  if (!GROQ_KEY) throw new Error('No AI API key available');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a football encyclopedia. Respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    }),
  });

  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || '';
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
  console.log(`[Teams] Groq OK for ${teamName}`);
  return JSON.parse(text);
}