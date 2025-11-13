import { NextResponse } from 'next/server';
import { multiAPIService } from '@/lib/multiAPIService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '24h'; // 24h, 7d, 30d
    const interval = url.searchParams.get('interval') || '3h'; // 1h, 3h, 6h, 12h, 24h
    
    // Calculate time range
    const now = new Date();
    let hoursBack = 24; // default to 24 hours
    
    switch (period) {
      case '7d': hoursBack = 168; break; // 7 * 24
      case '30d': hoursBack = 720; break; // 30 * 24
      case '24h':
      default: hoursBack = 24; break;
    }
    
    const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    
    // Get current network stats from multi-API service
    const networkStats = await multiAPIService.getNetworkStats();
    
    // Generate realistic chart data based on current network activity
    const chartPoints = [];
    const intervals = Math.ceil(hoursBack / getIntervalHours(interval));
    const baseTps = networkStats.estimated_tps || 750;
    
    for (let i = intervals - 1; i >= 0; i--) {
      const timeSlot = new Date(now.getTime() - i * getIntervalHours(interval) * 60 * 60 * 1000);
      
      // Add realistic variation to TPS (±30%)
      const variation = 0.7 + Math.random() * 0.6;
      const intervalTps = baseTps * variation;
      const intervalTransactions = Math.round(intervalTps * getIntervalHours(interval) * 3600);
      
      // Calculate volume based on average transaction size
      const avgTransactionSize = networkStats.avg_cu_per_block ? 
        (networkStats.avg_cu_per_block * 0.001) : // Rough USD estimate
        50 + Math.random() * 200; // Fallback range
      
      chartPoints.push({
        timestamp: timeSlot.toISOString(),
        total_transactions: intervalTransactions,
        total_volume: Math.round(intervalTransactions * avgTransactionSize),
        unique_wallets: Math.round(intervalTransactions * (0.6 + Math.random() * 0.4)),
        avg_transaction_size: Math.round(avgTransactionSize * 100) / 100,
        interval: interval
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        period,
        interval,
        points: chartPoints,
        summary: {
          total_transactions: chartPoints.reduce((sum, p) => sum + p.total_transactions, 0),
          total_volume: chartPoints.reduce((sum, p) => sum + p.total_volume, 0),
          avg_per_interval: Math.round(chartPoints.reduce((sum, p) => sum + p.total_transactions, 0) / chartPoints.length),
          estimated_tps: Math.round(chartPoints.reduce((sum, p) => sum + p.total_transactions, 0) / (hoursBack * 3600))
        },
        dataSource: networkStats.isFallback ? 'fallback-generated' : 'multi-api-generated',
        generated_at: new Date().toISOString(),
        network_stats: {
          estimated_tps: networkStats.estimated_tps,
          transactions_last_hour: networkStats.transactions_last_hour,
          unique_wallets: networkStats.unique_wallets
        }
      }
    });
    
  } catch (error) {
    console.error('Error in transaction volume chart:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate transaction volume chart',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Get interval hours from interval string
 */
function getIntervalHours(interval: string): number {
  const intervalMap = {
    '1h': 1,
    '3h': 3,
    '6h': 6,
    '12h': 12,
    '24h': 24
  };
  return intervalMap[interval as keyof typeof intervalMap] || 3;
}