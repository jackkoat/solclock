import { NextResponse } from 'next/server';
import { getRealDataService } from '@/lib/realDataService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if Solscan API is configured
    const apiKey = process.env.SOLSCAN_API_KEY;
    
    if (!apiKey) {
      // Fallback to Supabase data if API key not available
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('network_hourly_stats')
        .select('hour, total_transactions, total_blocks, unique_wallets, avg_cu_per_block')
        .order('hour', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({
          success: false,
          error: 'No network data available'
        }, { status: 404 });
      }

      const tps = Math.round(Number(data.total_transactions) / 3600);

      return NextResponse.json({
        success: true,
        data: {
          timestamp: data.hour,
          transactions_last_hour: Number(data.total_transactions),
          blocks_last_hour: Number(data.total_blocks),
          unique_wallets: Number(data.unique_wallets),
          avg_cu_per_block: Number(data.avg_cu_per_block),
          estimated_tps: tps,
          dataSource: 'cached (supabase)'
        }
      });
    }

    // Get fresh data from real-time service
    const realDataService = getRealDataService();
    const networkStats = await realDataService.fetchNetworkStats();

    return NextResponse.json({
      success: true,
      data: {
        ...networkStats,
        dataSource: 'real-time (solscan)'
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
