'use client';

import { useEffect, useState } from 'react';
import { Search, TrendingUp, TrendingDown, Star, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { MemeToken } from '@/types';

export default function Tokens() {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'volume' | 'change' | 'liquidity'>('rank');
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers' | 'highVolume'>('all');

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const response = await apiClient.getTopMemeCoins(100);
      setTokens(response.data.rankings);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTokens = tokens
    .filter(token => {
      // Search filter
      if (searchTerm) {
        return token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
               token.token_address.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .filter(token => {
      // Category filter
      switch (filterBy) {
        case 'gainers':
          return (token.price_change_24h || 0) > 0;
        case 'losers':
          return (token.price_change_24h || 0) < 0;
        case 'highVolume':
          return token.volume_24h_usd > 1000000;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sort
      switch (sortBy) {
        case 'volume':
          return b.volume_24h_usd - a.volume_24h_usd;
        case 'change':
          return (b.price_change_24h || 0) - (a.price_change_24h || 0);
        case 'liquidity':
          return b.liquidity_usd - a.liquidity_usd;
        default:
          return a.rank - b.rank;
      }
    });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <>
      {/* Header */}
      <header className="bg-bg-primary border-b border-border-light sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary-teal uppercase tracking-tight">
                SOLCLOCK
              </h1>
              <nav className="hidden md:flex items-center gap-2">
                <a href="/" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Dashboard
                </a>
                <a href="/analytics" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Analytics
                </a>
                <a href="/tokens" className="px-4 py-2 text-sm font-medium text-text-primary bg-primary-teal/10 rounded-lg transition-colors">
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Token Explorer</h1>
          <p className="text-text-secondary">Discover and analyze the latest Solana meme coins</p>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search tokens by name, symbol, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-colors"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-colors"
            >
              <option value="rank">Sort by Rank</option>
              <option value="volume">Sort by Volume</option>
              <option value="change">Sort by 24h Change</option>
              <option value="liquidity">Sort by Liquidity</option>
            </select>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
              className="px-4 py-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-colors"
            >
              <option value="all">All Tokens</option>
              <option value="gainers">24h Gainers</option>
              <option value="losers">24h Losers</option>
              <option value="highVolume">High Volume (&gt;$1M)</option>
            </select>
          </div>
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{tokens.length}</div>
              <div className="text-sm text-text-secondary">Total Tokens</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {tokens.filter(t => (t.price_change_24h || 0) > 0).length}
              </div>
              <div className="text-sm text-text-secondary">24h Gainers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-error">
                {tokens.filter(t => (t.price_change_24h || 0) < 0).length}
              </div>
              <div className="text-sm text-text-secondary">24h Losers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {tokens.filter(t => t.volume_24h_usd > 1000000).length}
              </div>
              <div className="text-sm text-text-secondary">High Volume</div>
            </div>
          </div>
        </div>

        {/* Token Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Token</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">24h Change</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Volume</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Market Cap</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Liquidity</th>
                  <th className="text-center py-3 px-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-teal border-t-transparent mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredAndSortedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-text-secondary">
                      No tokens found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedTokens.map((token) => (
                    <tr key={token.token_address} className="border-b border-border-light hover:bg-bg-secondary transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary">#{token.rank}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-teal/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-teal">
                              {token.symbol.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{token.symbol}</div>
                            <div className="text-sm text-text-secondary">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-text-primary">Price data N/A</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className={`flex items-center justify-end gap-1 ${
                          (token.price_change_24h || 0) >= 0 ? 'text-success' : 'text-error'
                        }`}>
                          {(token.price_change_24h || 0) >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-medium">
                            {(token.price_change_24h || 0) >= 0 ? '+' : ''}{(token.price_change_24h || 0).toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-text-primary">{formatNumber(token.volume_24h_usd)}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-text-primary">N/A</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-medium text-text-primary">{formatNumber(token.liquidity_usd)}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-1 text-text-secondary hover:text-primary-teal transition-colors"
                            title="Add to Watchlist"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-text-secondary hover:text-primary-teal transition-colors"
                            title="View on Explorer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-border-light mt-12 py-6">
        <div className="max-w-[1440px] mx-auto px-6 text-center text-text-secondary text-sm">
          <p>SolClock © 2025 | Token Explorer</p>
        </div>
      </footer>
    </>
  );
}