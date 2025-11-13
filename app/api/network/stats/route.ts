import { NextResponse } from 'next/server';
import { multiAPIService } from '@/lib/multiAPIService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get fresh network data from multi-API service (Solana RPC)
    const networkStats = await multiAPIService.getNetworkStats();

    return NextResponse.json({
      success: true,
      data: {
        ...networkStats,
        dataSource: networkStats.isFallback ? 'fallback (real-time unavailable)' : 'real-time (solana-rpc)'
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
