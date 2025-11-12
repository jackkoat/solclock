import { NextResponse } from 'next/server';
import { getRealDataService } from '@/lib/realDataService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.SOLSCAN_API_KEY;
    const hasApiKey = !!apiKey;
    
    let apiStats = null;
    if (hasApiKey) {
      try {
        const realDataService = getRealDataService();
        apiStats = realDataService.getAPIStats();
      } catch (error) {
        console.error('Error getting API stats:', error);
      }
    }

    return NextResponse.json({
      success: true,
      configuration: {
        solscanApiKey: hasApiKey ? 'configured' : 'missing',
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      },
      dataSource: hasApiKey ? 'real-time (solscan)' : 'mock data',
      status: hasApiKey ? 'ready' : 'api-key-required',
      stats: apiStats,
      timestamp: new Date().toISOString(),
      instructions: {
        initWithMockData: 'POST /api/init',
        initWithRealData: 'POST /api/init with {"useRealData": true}',
        refreshRealData: 'POST /api/refresh',
        requirement: !hasApiKey ? 'Set SOLSCAN_API_KEY environment variable to enable real-time data' : null
      }
    });
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
