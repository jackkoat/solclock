import { NextResponse } from 'next/server';
import { multiAPIService } from '@/lib/multiAPIService';
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

    // Get chart data from multi-API service
    const chartData = await multiAPIService.getTokenChartData(address, interval);

    // Process chart data for the response
    const hourlyData = chartData.map((item: ChartDataPoint) => ({
      hour: item.timestamp,
      hour_label: new Date(item.timestamp).getUTCHours() + ':00',
      tx_count: item.tx_count,
      tx_volume_usd: item.volume,
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
      data_source: 'multi-api (dexscreener + calculated)',
      is_fallback: hourlyData.length > 0 && hourlyData[0].tx_count === 0
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
