async function generatePremiumPrediction(match: any): Promise<Record<string, any>> {
  const prompt = `You are an elite football analyst. Generate a DETAILED prediction for:

${match.home} vs ${match.away}
${match.league} — ${match.date}

For EACH language (fr, en, ar, es), provide:
- title: Catchy professional headline
- prediction: Exact score (e.g. "2-1")
- confidence: 50-95 (realistic)
- analysis: MINIMUM 800 words with sections:
  OVERVIEW (stakes, league position)
  FORM GUIDE (last 5 with specific results and dates)
  KEY PLAYERS (2-3 per team with season goals/assists)
  TACTICAL BREAKDOWN (formations, matchups)
  HEAD TO HEAD (last 5 meetings with scores)
  KEY STATS (goals/game, clean sheets, possession %)
  VERDICT (prediction with reasoning)
- h2h_summary: Last 5 H2H "Team A 2-1 Team B (Jan 2026), ..."
- home_form: "W W D L W"
- away_form: "L W W D W"
- odds_home: realistic decimal odds (e.g. 1.85)
- odds_draw: (e.g. 3.40)
- odds_away: (e.g. 4.20)
- recommended_bet: Best value bet with specific reasoning

Use REAL 2025/2026 stats. Premium sports journalist tone.

Respond ONLY with valid JSON:
{
  "fr": { "title":"...", "prediction":"2-1", "confidence":72, "analysis":"...(800+ words)...", "h2h_summary":"...", "home_form":"W W D L W", "away_form":"L W W D W", "odds_home":1.85, "odds_draw":3.40, "odds_away":4.20, "recommended_bet":"..." },
  "en": { ... }, "ar": { ... }, "es": { ... }
}`;

  // Try Gemini 2.0-flash first (better quality for long content)
  const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
  if (GEMINI_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
      console.log(`[Prono] Gemini 2.0-flash OK for ${match.home} vs ${match.away}`);
      return JSON.parse(text);
    } catch (e: any) {
      console.log(`[Prono] Gemini failed: ${e.message.slice(0, 80)}, trying Groq...`);
    }
  }

  // Fallback to Groq
  const GROQ_KEY = process.env.GROQ_API_KEY || '';
  if (!GROQ_KEY) throw new Error('No AI key available');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Elite football analyst. Valid JSON only. No markdown fences.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  let text = data.choices?.[0]?.message?.content || '';
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
  console.log(`[Prono] Groq OK for ${match.home} vs ${match.away}`);
  return JSON.parse(text);
}