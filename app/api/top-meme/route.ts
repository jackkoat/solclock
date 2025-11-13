import { NextResponse } from 'next/server';
import { scoringService } from '@/lib/scoringService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const rankings = await scoringService.calculateTop50();
    const limitedRankings = rankings.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        rankings: limitedRankings,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching top meme coins:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch top meme coins'
    }, { status: 500 });
  }
}