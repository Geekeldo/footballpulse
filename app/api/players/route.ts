import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const API_KEY = process.env.API_FOOTBALL_KEY || '';

const TOP_PLAYERS = [
  // Premier League
  { name: 'Erling Haaland', teamId: 50 },
  { name: 'Mohamed Salah', teamId: 40 },
  { name: 'Bukayo Saka', teamId: 42 },
  { name: 'Cole Palmer', teamId: 49 },
  { name: 'Bruno Fernandes', teamId: 33 },
  { name: 'Martin Odegaard', teamId: 42 },
  { name: 'Son Heung-Min', teamId: 47 },
  { name: 'Alexander Isak', teamId: 34 },
  { name: 'Declan Rice', teamId: 42 },
  { name: 'Phil Foden', teamId: 50 },
  // La Liga
  { name: 'Kylian Mbappe', teamId: 541 },
  { name: 'Vinicius Junior', teamId: 541 },
  { name: 'Jude Bellingham', teamId: 541 },
  { name: 'Lamine Yamal', teamId: 529 },
  { name: 'Robert Lewandowski', teamId: 529 },
  { name: 'Pedri', teamId: 529 },
  { name: 'Antoine Griezmann', teamId: 530 },
  { name: 'Raphinha', teamId: 529 },
  // Serie A
  { name: 'Lautaro Martinez', teamId: 505 },
  { name: 'Victor Osimhen', teamId: 492 },
  { name: 'Rafael Leao', teamId: 489 },
  { name: 'Dusan Vlahovic', teamId: 496 },
  { name: 'Ademola Lookman', teamId: 499 },
  // Bundesliga
  { name: 'Harry Kane', teamId: 157 },
  { name: 'Florian Wirtz', teamId: 168 },
  { name: 'Jamal Musiala', teamId: 157 },
  // Ligue 1
  { name: 'Ousmane Dembele', teamId: 85 },
  { name: 'Bradley Barcola', teamId: 85 },
  // International stars
  { name: 'Lionel Messi', teamId: 285 },
  { name: 'Cristiano Ronaldo', teamId: 2934 },
  { name: 'Neymar Jr', teamId: 2932 },
  { name: 'Achraf Hakimi', teamId: 85 },
  { name: 'Hakim Ziyech', teamId: 2930 },
];

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

// GET — list all players
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ players: data || [] });
}

// POST — generate players
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.adminPassword || body.adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const batchSize = body.batchSize || 5;
  const offset = body.offset || 0;
  const batch = TOP_PLAYERS.slice(offset, offset + batchSize);

  if (batch.length === 0) {
    return NextResponse.json({ message: 'All players done', total: TOP_PLAYERS.length });
  }

  let created = 0;
  const errors: string[] = [];

  for (const player of batch) {
    try {
      // Check existing
      const { data: existing } = await supabaseAdmin
        .from('players')
        .select('id')
        .eq('slug', slugify(player.name))
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`[Players] Skipping ${player.name} — exists`);
        continue;
      }

      // Fetch player from API-Football (search by name + team)
      let playerInfo: any = null;
      try {
        const searchRes = await fetch(
          `https://v3.football.api-sports.io/players?search=${encodeURIComponent(player.name)}&team=${player.teamId}&season=2024`,
          { headers: { 'x-apisports-key': API_KEY } }
        );
        const searchData = await searchRes.json();

        if (searchData.response?.[0]) {
          const p = searchData.response[0].player;
          const s = searchData.response[0].statistics?.[0];
          playerInfo = {
            apiId: p.id,
            photo: p.photo || null,
            nationality: p.nationality || null,
            age: p.age || null,
            position: s?.games?.position || null,
            teamName: s?.team?.name || null,
            teamLogo: s?.team?.logo || null,
            teamId: s?.team?.id || player.teamId,
          };
        }
      } catch (e) {
        console.log(`[Players] API search failed for ${player.name}`);
      }

      // If API didn't find, try season 2025
      if (!playerInfo) {
        try {
          const searchRes = await fetch(
            `https://v3.football.api-sports.io/players?search=${encodeURIComponent(player.name)}&team=${player.teamId}&season=2025`,
            { headers: { 'x-apisports-key': API_KEY } }
          );
          const searchData = await searchRes.json();
          if (searchData.response?.[0]) {
            const p = searchData.response[0].player;
            const s = searchData.response[0].statistics?.[0];
            playerInfo = {
              apiId: p.id,
              photo: p.photo || null,
              nationality: p.nationality || null,
              age: p.age || null,
              position: s?.games?.position || null,
              teamName: s?.team?.name || null,
              teamLogo: s?.team?.logo || null,
              teamId: s?.team?.id || player.teamId,
            };
          }
        } catch {}
      }

      // Generate bio with AI
      console.log(`[Players] Generating bio for ${player.name}...`);
      const bio = await generatePlayerBio(
        player.name,
        playerInfo?.nationality || '',
        playerInfo?.position || '',
        playerInfo?.teamName || ''
      );

      const slug = slugify(player.name);

      const { error: insertError } = await supabaseAdmin.from('players').insert({
        api_id: playerInfo?.apiId || null,
        name: player.name,
        slug,
        photo: playerInfo?.photo || null,
        nationality: playerInfo?.nationality || null,
        age: playerInfo?.age || null,
        position: playerInfo?.position || null,
        team_name: playerInfo?.teamName || null,
        team_logo: playerInfo?.teamLogo || null,
        team_id: playerInfo?.teamId || player.teamId,
        bio,
      });

      if (insertError) {
        errors.push(`${player.name}: ${insertError.message}`);
      } else {
        created++;
        console.log(`[Players] Created ${player.name} (photo: ${playerInfo?.photo ? 'yes' : 'no'})`);
      }

      await new Promise(r => setTimeout(r, 3000));

    } catch (e: any) {
      errors.push(`${player.name}: ${e.message}`);
      console.error(`[Players] Failed ${player.name}:`, e.message);
    }
  }

  return NextResponse.json({
    created,
    errors: errors.length > 0 ? errors : undefined,
    nextOffset: offset + batchSize,
    remaining: Math.max(0, TOP_PLAYERS.length - (offset + batchSize)),
  });
}

async function generatePlayerBio(name: string, nationality: string, position: string, team: string): Promise<Record<string, any>> {
  const prompt = `Write a profile for football player "${name}" (${position}, ${nationality}, plays for ${team}).

For EACH language (fr, en, ar, es), provide:
- description: 2-3 sentences about the player
- career: 3-4 paragraphs about career highlights, style, achievements (300-400 words)
- stats_summary: key career stats in text form (goals, assists, trophies)
- playing_style: 2-3 sentences about how they play
- fun_fact: one interesting fact about the player

Respond ONLY with valid JSON:
{
  "fr": { "description": "...", "career": "...", "stats_summary": "...", "playing_style": "...", "fun_fact": "..." },
  "en": { ... }, "ar": { ... }, "es": { ... }
}`;

  const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
  const GROQ_KEY = process.env.GROQ_API_KEY || '';

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
      return JSON.parse(text);
    } catch (e: any) {
      console.log(`[Players] Gemini failed: ${e.message}, trying Groq...`);
    }
  }

  if (!GROQ_KEY) throw new Error('No AI API key available');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Football expert. Valid JSON only.' },
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
  return JSON.parse(text);
}