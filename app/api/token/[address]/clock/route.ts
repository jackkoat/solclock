import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get 24-hour hourly data
    const { data, error } = await supabase
      .from('token_hourly_stats')
      .select('hour, tx_count, tx_volume_usd, unique_buyers')
      .eq('token_address', address)
      .gte('hour', oneDayAgo.toISOString())
      .order('hour', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Token not found or no data available'
      }, { status: 404 });
    }

    // Build hourly histogram
    const hourlyData = data.map(row => ({
      hour: row.hour,
      hour_label: new Date(row.hour).getUTCHours() + ':00',
      tx_count: Number(row.tx_count),
      tx_volume_usd: Number(row.tx_volume_usd),
      unique_buyers: Number(row.unique_buyers)
    }));

    // Find peak hour
    const peakHour = hourlyData.reduce((max, current) =>
      current.tx_volume_usd > max.tx_volume_usd ? current : max
    );

    const response = {
      token_address: address,
      hourly_data: hourlyData,
      peak_hour: peakHour.hour_label,
      total_volume_24h: hourlyData.reduce((sum, h) => sum + h.tx_volume_usd, 0),
      total_transactions_24h: hourlyData.reduce((sum, h) => sum + h.tx_count, 0),
      total_unique_buyers_24h: hourlyData.reduce((sum, h) => sum + h.unique_buyers, 0)
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
