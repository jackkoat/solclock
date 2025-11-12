import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Query last 24 hours of network stats
    const { data, error } = await supabase
      .from('network_hourly_stats')
      .select('hour, total_transactions, total_blocks, unique_wallets, avg_cu_per_block')
      .gte('hour', oneDayAgo.toISOString())
      .order('hour', { ascending: true });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch network data'
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No network data available'
      }, { status: 404 });
    }

    // Find peak hour
    const peakHour = data.reduce((max, current) =>
      Number(current.total_transactions) > Number(max.total_transactions) ? current : max
    );

    const response = {
      hourly_stats: data.map(row => ({
        hour: row.hour,
        total_transactions: Number(row.total_transactions),
        total_blocks: Number(row.total_blocks),
        unique_wallets: Number(row.unique_wallets),
        avg_cu_per_block: Number(row.avg_cu_per_block)
      })),
      peak_hour: {
        hour: peakHour.hour,
        total_transactions: Number(peakHour.total_transactions)
      },
      summary: {
        total_transactions_24h: data.reduce((sum, row) => sum + Number(row.total_transactions), 0),
        total_blocks_24h: data.reduce((sum, row) => sum + Number(row.total_blocks), 0),
        avg_unique_wallets: Math.round(
          data.reduce((sum, row) => sum + Number(row.unique_wallets), 0) / data.length
        )
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching network pulse:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch network data'
    }, { status: 500 });
  }
}
