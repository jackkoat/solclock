import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    // Get chart data from database
    const hoursBack = interval === '24h' ? 24 : 72; // 24h or 3 days for 3h interval
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const { data: chartData, error } = await supabase
      .from('token_hourly_stats')
      .select('*')
      .eq('token_address', address)
      .gte('hour', startTime.toISOString())
      .order('hour', { ascending: true });

    if (error) {
      console.error('Error fetching token chart data:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch token chart data'
      }, { status: 500 });
    }

    const chartDataFormatted = chartData || [];

    // Process chart data for the response
    const hourlyData = chartDataFormatted.map((item: any) => ({
      hour: item.hour,
      hour_label: new Date(item.hour).getUTCHours() + ':00',
      tx_count: item.tx_count,
      tx_volume_usd: item.tx_volume_usd,
      unique_buyers: item.unique_buyers
    }));

    // Find peak hour
    const peakHour = hourlyData.reduce((max: any, current: any) =>
      current.tx_volume_usd > max.tx_volume_usd ? current : max
    );

    const response = {
      token_address: address,
      interval: interval,
      hourly_data: hourlyData,
      peak_hour: peakHour.hour_label,
      total_volume_24h: hourlyData.reduce((sum: number, h: any) => sum + h.tx_volume_usd, 0),
      total_transactions_24h: hourlyData.reduce((sum: number, h: any) => sum + h.tx_count, 0),
      total_unique_buyers_24h: hourlyData.reduce((sum: number, h: any) => sum + h.unique_buyers, 0),
      data_source: 'database (cached stats)',
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
      error: 'Failed to fetch token clock data'
    }, { status: 500 });
  }
}
