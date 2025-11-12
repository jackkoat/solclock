import { NextResponse } from 'next/server';
import { getRealDataService } from '@/lib/realDataService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    console.log('Manual refresh triggered - fetching real Solana blockchain data...');
    
    // Check if Solscan API key is configured
    const apiKey = process.env.SOLSCAN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Solscan API key not configured',
        hint: 'Please set SOLSCAN_API_KEY environment variable to enable real-time data'
      }, { status: 500 });
    }

    const realDataService = getRealDataService();
    await realDataService.refreshAllData();

    // Get API usage stats
    const stats = realDataService.getAPIStats();

    return NextResponse.json({
      success: true,
      message: 'Real Solana blockchain data refreshed successfully',
      timestamp: new Date().toISOString(),
      dataSource: 'solscan-api',
      stats: {
        cacheSize: stats.solscan.cache.size,
        rateLimit: stats.solscan.rateLimit
      }
    });
  } catch (error) {
    console.error('Manual refresh error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
