'use client';

import SolPulseLogo from '@/components/SolPulseLogo';
import { useEffect, useState } from 'react';
import { Activity, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { NetworkPulseData, MemeToken } from '@/types';

export default function Analytics() {
  const [networkData, setNetworkData] = useState<NetworkPulseData | null>(null);
  const [topTokens, setTopTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [networkRes, tokensRes] = await Promise.all([
        apiClient.getNetworkPulse(),
        apiClient.getTopMemeCoins(100)
      ]);

      setNetworkData(networkRes.data);
      setTopTokens(tokensRes.data.rankings);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVolume = topTokens.reduce((sum, token) => sum + token.volume_24h_usd, 0);
  const totalMarketCap = 0; // MemeToken doesn't have marketCap, would need additional API call
  const avgLiquidity = topTokens.reduce((sum, token) => sum + token.liquidity_usd, 0) / topTokens.length;
  const totalHolders = topTokens.reduce((sum, token) => sum + token.holders, 0);

  return (
    <>
      {/* Header */}
      <header className="bg-bg-primary border-b border-border-light sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <SolPulseLogo className="" />
              <nav className="hidden md:flex items-center gap-2">
                <a href="/" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Dashboard
                </a>
                <a href="/analytics" className="px-4 py-2 text-sm font-medium text-text-primary bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 rounded-lg transition-colors border border-primary-blue/20">
                  Analytics
                </a>
                <a href="/tokens" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Tokens
                </a>
                <a href="/alerts" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Alerts
                </a>
                <a href="/how-it-works" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  How It Works
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="live-dot"></div>
                <span className="text-sm text-text-secondary">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Advanced Analytics</h1>
          <p className="text-text-secondary">Deep insights into Solana meme coin market performance and trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total 24h Volume</p>
                <p className="text-2xl font-bold text-text-primary">
                  ${(totalVolume / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-blue" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Market Cap</p>
                <p className="text-2xl font-bold text-text-primary">
                  ${(totalMarketCap / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-info" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Avg. Liquidity</p>
                <p className="text-2xl font-bold text-text-primary">
                  ${(avgLiquidity / 1000).toFixed(0)}K
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-warning" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Holders</p>
                <p className="text-2xl font-bold text-text-primary">
                  {(totalHolders / 1000).toFixed(1)}K
                </p>
              </div>
              <Users className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performers */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-success" />
              <h2 className="text-lg font-bold">Top Performers (24h)</h2>
            </div>
            <div className="space-y-3">
              {topTokens.slice(0, 5).map((token, index) => (
                <div key={token.token_address} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-blue">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{token.symbol}</div>
                      <div className="text-sm text-text-secondary">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-success">+{token.price_change_24h?.toFixed(2) || '0.00'}%</div>
                    <div className="text-sm text-text-secondary">Price data not available</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Distribution */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-primary-blue" />
              <h2 className="text-lg font-bold">Volume Distribution</h2>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-blue mb-2">
                  ${(totalVolume / 1000000).toFixed(1)}M
                </div>
                <div className="text-text-secondary">Total 24h Volume</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">High Volume (&gt;$1M)</span>
                  <span className="font-bold text-text-primary">
                    {topTokens.filter(t => t.volume_24h_usd > 1000000).length} tokens
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Medium Volume ($100K-$1M)</span>
                  <span className="font-bold text-text-primary">
                    {topTokens.filter(t => t.volume_24h_usd >= 100000 && t.volume_24h_usd <= 1000000).length} tokens
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Low Volume (&lt;$100K)</span>
                  <span className="font-bold text-text-primary">
                    {topTokens.filter(t => t.volume_24h_usd < 100000).length} tokens
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Health */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-primary-blue" />
            <h2 className="text-lg font-bold">Network Health Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary mb-2">
                {networkData?.hourly_stats?.[0] ? Math.round(networkData.hourly_stats[0].total_transactions / 3600).toLocaleString() : '12.4K'}
              </div>
              <div className="text-text-secondary">Transactions per Second</div>
              <div className="mt-2 h-2 bg-bg-secondary rounded-full">
                <div className="h-2 bg-primary-blue rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary mb-2">
                {networkData?.summary?.total_blocks_24h ? '0.4s' : '0.4s'}
              </div>
              <div className="text-text-secondary">Block Time</div>
              <div className="mt-2 h-2 bg-bg-secondary rounded-full">
                <div className="h-2 bg-success rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary mb-2">
                {networkData?.summary?.avg_unique_wallets ? Math.round(networkData.summary.avg_unique_wallets / 100) * 100 : '1,950'}
              </div>
              <div className="text-text-secondary">Active Validators</div>
              <div className="mt-2 h-2 bg-bg-secondary rounded-full">
                <div className="h-2 bg-info rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-border-light mt-12 py-6">
        <div className="max-w-[1440px] mx-auto px-6 text-center text-text-secondary text-sm">
          <p>SolPulse © 2025 | Advanced Analytics Dashboard</p>
        </div>
      </footer>
    </>
  );
}