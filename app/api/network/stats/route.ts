import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
        estimated_tps: tps
      }
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch network statistics'
    }, { status: 500 });
  }
}
