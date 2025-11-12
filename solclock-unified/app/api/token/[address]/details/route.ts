import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;

    // Get token metadata
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('token_address, symbol, name, logo_url')
      .eq('token_address', address)
      .maybeSingle();

    if (tokenError || !token) {
      return NextResponse.json({
        success: false,
        error: 'Token not found'
      }, { status: 404 });
    }

    // Get 24h aggregated stats
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: stats, error: statsError } = await supabase
      .from('token_hourly_stats')
      .select('tx_volume_usd, unique_buyers, holders, liquidity_usd, tx_count')
      .eq('token_address', address)
      .gte('hour', oneDayAgo.toISOString());

    if (statsError || !stats || stats.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No stats available for token'
      }, { status: 404 });
    }

    const volume24h = stats.reduce((sum, s) => sum + Number(s.tx_volume_usd), 0);
    const buyers24h = stats.reduce((sum, s) => sum + Number(s.unique_buyers), 0);
    const currentHolders = Math.max(...stats.map(s => Number(s.holders)));
    const avgLiquidity = stats.reduce((sum, s) => sum + Number(s.liquidity_usd), 0) / stats.length;
    const totalTransactions = stats.reduce((sum, s) => sum + Number(s.tx_count), 0);

    // Simulate whale activity (mock data)
    const whaleActivity = [
      {
        type: 'buy' as const,
        amount_usd: Math.floor(Math.random() * 50000) + 10000,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        wallet: address.substring(0, 8) + '...' + address.substring(address.length - 4)
      },
      {
        type: 'sell' as const,
        amount_usd: Math.floor(Math.random() * 30000) + 5000,
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        wallet: address.substring(0, 8) + '...' + address.substring(address.length - 4)
      }
    ];

    const response = {
      token: {
        address: token.token_address,
        symbol: token.symbol,
        name: token.name,
        logo_url: token.logo_url
      },
      metrics: {
        volume_24h_usd: Math.round(volume24h),
        unique_buyers_24h: buyers24h,
        holders: currentHolders,
        liquidity_usd: Math.round(avgLiquidity),
        total_transactions_24h: totalTransactions
      },
      whale_activity: whaleActivity
    };

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token details'
    }, { status: 500 });
  }
}
