import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase';
import type { ChartDataPoint } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    const { searchParams } = new URL(request.url);
    const interval = (searchParams.get('interval') as '3h' | '24h') || '24h';

    const supabase = getServiceRoleClient();
    
    // Query token_hourly_stats from database
    const hours = interval === '24h' ? 24 : 72; // 24h or 3h interval over 72 hours
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    const { data: hourlyStats, error } = await supabase
      .from('token_hourly_stats')
      .select('*')
      .eq('token_address', address)
      .gte('hour', cutoff.toISOString())
      .order('hour', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Process chart data for the response
    const hourlyData = (hourlyStats || []).map((item: any) => ({
      hour: item.hour,
      hour_label: new Date(item.hour).getUTCHours() + ':00',
      tx_count: item.tx_count,
      tx_volume_usd: item.tx_volume_usd,
      unique_buyers: item.unique_buyers
    }));

    // Find peak hour
    const peakHour = hourlyData.reduce((max: any, current: any) =>
      current.tx_volume_usd > max.tx_volume_usd ? current : max
    , { tx_volume_usd: 0 });

    const response = {
      token_address: address,
      interval: interval,
      hourly_data: hourlyData,
      peak_hour: peakHour?.hour_label || 'N/A',
      total_volume_24h: hourlyData.reduce((sum: number, h: any) => sum + h.tx_volume_usd, 0),
      total_transactions_24h: hourlyData.reduce((sum: number, h: any) => sum + h.tx_count, 0),
      total_unique_buyers_24h: hourlyData.reduce((sum: number, h: any) => sum + h.unique_buyers, 0),
      data_source: 'database (token_hourly_stats)',
      is_fallback: hourlyData.length === 0
    };

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching token clock:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token clock data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}