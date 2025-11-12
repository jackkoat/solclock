import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Alert } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get recent network activity to generate alerts
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const { data: recentStats, error } = await supabase
      .from('network_hourly_stats')
      .select('hour, total_transactions, unique_wallets')
      .gte('hour', twoHoursAgo.toISOString())
      .order('hour', { ascending: false })
      .limit(2);

    if (error || !recentStats || recentStats.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          alerts: []
        }
      });
    }

    const alerts: Alert[] = [];
    const [latest, previous] = recentStats;

    const txChange = ((Number(latest.total_transactions) - Number(previous.total_transactions)) / Number(previous.total_transactions)) * 100;
    const walletChange = ((Number(latest.unique_wallets) - Number(previous.unique_wallets)) / Number(previous.unique_wallets)) * 100;

    // Degen hour detection
    if (txChange > 20) {
      alerts.push({
        id: `degen-${latest.hour}`,
        severity: 'warning',
        title: 'Degen Hour Detected',
        message: `Network activity surged ${txChange.toFixed(1)}% in the last hour`,
        timestamp: latest.hour
      });
    }

    // High activity alert
    if (Number(latest.total_transactions) > 3000000) {
      alerts.push({
        id: `high-activity-${latest.hour}`,
        severity: 'info',
        title: 'High Network Activity',
        message: `${(Number(latest.total_transactions) / 1000000).toFixed(1)}M transactions in the last hour`,
        timestamp: latest.hour
      });
    }

    // Wallet surge
    if (walletChange > 15) {
      alerts.push({
        id: `wallet-surge-${latest.hour}`,
        severity: 'info',
        title: 'Wallet Activity Surge',
        message: `${walletChange.toFixed(1)}% more active wallets than last hour`,
        timestamp: latest.hour
      });
    }

    // Network calm
    if (Number(latest.total_transactions) < 1000000) {
      alerts.push({
        id: `calm-${latest.hour}`,
        severity: 'info',
        title: 'Network Calm',
        message: 'Low activity detected - opportunity for cheaper transactions',
        timestamp: latest.hour
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts: alerts.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch alerts'
    }, { status: 500 });
  }
}
