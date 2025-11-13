import { NextResponse } from 'next/server';
import { getRealDataService } from '@/lib/realDataService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get fresh network data from realDataService (Solana RPC)
    const realDataService = getRealDataService();
    const networkStats = await realDataService.fetchNetworkStats();

    return NextResponse.json({
      success: true,
      data: {
        ...networkStats,
        dataSource: (networkStats as any).isFallback ? 'fallback (solana-rpc)' : 'real-time (solana-rpc)'
      }
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch network statistics',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}