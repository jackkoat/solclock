'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import MemeClock from '@/components/MemeClock';
import { apiClient } from '@/lib/api';
import type { TokenDetails, TokenClockData } from '@/types';

export default function TokenDetailPage({ params }: { params: { address: string } }) {
  const router = useRouter();
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [clockData, setClockData] = useState<TokenClockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadTokenData();
  }, [params.address]);

  const loadTokenData = async () => {
    try {
      const [detailsRes, clockRes] = await Promise.all([
        apiClient.getTokenDetails(params.address),
        apiClient.getTokenClock(params.address)
      ]);

      setTokenDetails(detailsRes.data);
      setClockData(clockRes.data);
    } catch (error) {
      console.error('Failed to load token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      const userId = process.env.NEXT_PUBLIC_USER_ID || 'demo_user_1';
      await apiClient.addToWatchlist(userId, params.address);
      setInWatchlist(true);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-solana-teal border-t-transparent"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!tokenDetails) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Token not found</h2>
            <button onClick={() => router.push('/')} className="btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-solana-text-secondary hover:text-solana-teal transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Token Header */}
        <div className="card p-6 mb-6 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={tokenDetails.token.logo_url}
                alt={tokenDetails.token.symbol}
                className="w-20 h-20 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/80?text=' + tokenDetails.token.symbol.charAt(0);
                }}
              />
              <div>
                <h1 className="text-3xl font-bold mb-1">{tokenDetails.token.symbol}</h1>
                <p className="text-solana-text-secondary text-lg">{tokenDetails.token.name}</p>
                <p className="text-solana-text-muted text-sm mt-1 font-mono">
                  {tokenDetails.token.address.substring(0, 8)}...{tokenDetails.token.address.substring(tokenDetails.token.address.length - 6)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddToWatchlist}
                disabled={inWatchlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  inWatchlist
                    ? 'bg-solana-teal/20 text-solana-teal cursor-not-allowed'
                    : 'btn-secondary'
                }`}
              >
                <Star className={`w-5 h-5 ${inWatchlist ? 'fill-current' : ''}`} />
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
              <a
                href={`https://solscan.io/token/${tokenDetails.token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 btn-secondary"
              >
                <ExternalLink className="w-5 h-5" />
                Solscan
              </a>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-up">
          <div className="card p-5">
            <p className="text-solana-text-secondary text-sm mb-2">24h Volume</p>
            <p className="text-2xl font-bold text-solana-teal">
              {formatNumber(tokenDetails.metrics.volume_24h_usd)}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-solana-text-secondary text-sm mb-2">Unique Buyers</p>
            <p className="text-2xl font-bold text-solana-purple">
              {tokenDetails.metrics.unique_buyers_24h.toLocaleString()}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-solana-text-secondary text-sm mb-2">Holders</p>
            <p className="text-2xl font-bold text-white">
              {tokenDetails.metrics.holders.toLocaleString()}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-solana-text-secondary text-sm mb-2">Liquidity</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(tokenDetails.metrics.liquidity_usd)}
            </p>
          </div>
        </div>

        {/* Meme Clock */}
        <div className="card p-6 mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold mb-6">Meme Clock - 24 Hour Activity</h2>
          <MemeClock data={clockData} loading={false} />
        </div>

        {/* Whale Activity */}
        <div className="card p-6 animate-slide-up">
          <h2 className="text-2xl font-bold mb-6">Recent Whale Activity</h2>
          {tokenDetails.whale_activity && tokenDetails.whale_activity.length > 0 ? (
            <div className="space-y-3">
              {tokenDetails.whale_activity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-solana-bg rounded-lg border border-solana-border"
                >
                  <div className="flex items-center gap-4">
                    {activity.type === 'buy' ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        <span className={activity.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                          {activity.type === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                        {' - '}
                        {formatNumber(activity.amount_usd)}
                      </p>
                      <p className="text-sm text-solana-text-secondary">
                        Wallet: <span className="font-mono">{activity.wallet}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-solana-text-secondary">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-solana-text-secondary">
              No whale activity detected in the last 24 hours
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
