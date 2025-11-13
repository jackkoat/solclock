import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TokenAnalytics {
  token_address: string;
  symbol: string;
  name: string;
  volume_24h_usd: number;
  unique_buyers_24h: number;
  holders: number;
  liquidity_usd: number;
  score: number;
}

interface AIAnalysis {
  insight: string;
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  actionable: boolean;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// System prompt themed for crypto analysis
const systemPrompt = `
You are "SolPulse AI", a specialized crypto analyst for Solana meme coins.
Your job is to analyze a single meme coin and give sharp, actionable insights.

RULES:
1. Analyze the token data: volume, buyers, holders, liquidity, and score.
2. Your analysis must be 1-2 paragraphs with numerical data.
3. Your "summary" must be a single, punchy one-liner.
4. You MUST output only a valid JSON object in this exact format:
{
  "insight": "Your 1-2 paragraph analysis with numerical data here.",
  "confidence": "Your confidence (high, medium, or low).",
  "summary": "Your 1-sentence summary/taunt.",
  "actionable": "A boolean (true/false) on whether this is actionable."
}
`;

async function getMistralAnalysis(tokenData: TokenAnalytics): Promise<AIAnalysis> {
  const apiKey = process.env.OPENROUTER_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_KEY environment variable is not set');
  }

  const userPrompt = `
Analyze this Solana meme coin. Is it a good opportunity or a risky play?
Give me the alpha with numerical analysis.

Token Data:
${JSON.stringify(tokenData, null, 2)}
`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'SolClock Analytics'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: "json_object" } // Enforce JSON output
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${err}`);
    }

    const jsonResponse = await response.json();
    const aiResponseContent = jsonResponse.choices[0].message.content;

    // Parse the JSON string from the AI
    const analysis: AIAnalysis = JSON.parse(aiResponseContent);
    return analysis;

  } catch (error) {
    console.error('Error in getMistralAnalysis:', error);
    throw new Error('Failed to get AI analysis. Check your API key and try again.');
  }
}

export async function POST(request: Request) {
  try {
    const { token_address } = await request.json();

    if (!token_address) {
      return NextResponse.json({
        success: false,
        error: 'Token address is required'
      }, { status: 400 });
    }

    // Get token data from your existing service
    const { scoringService } = await import('@/lib/scoringService');
    const rankings = await scoringService.calculateTop50();
    const tokenData = rankings.find(token => token.token_address === token_address);

    if (!tokenData) {
      return NextResponse.json({
        success: false,
        error: 'Token not found in rankings'
      }, { status: 404 });
    }

    // Generate AI analysis
    const analysis = await getMistralAnalysis(tokenData);

    return NextResponse.json({
      success: true,
      data: {
        token: tokenData,
        analysis: analysis,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating AI analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI analytics'
    }, { status: 500 });
  }
}