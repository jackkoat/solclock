'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import type { MemeToken } from '@/types';

interface Props {
  tokens: MemeToken[];
}

type SortKey = 'rank' | 'score' | 'volume' | 'buyers' | 'holders' | 'liquidity';
type SortOrder = 'asc' | 'desc';

export default function TopMemeTable({ tokens }: Props) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedAndFilteredTokens = useMemo(() => {
    let filtered = tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortKey) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'score':
          aVal = a.score;
          bVal = b.score;
          break;
        case 'volume':
          aVal = a.metrics.volume_24h_usd;
          bVal = b.metrics.volume_24h_usd;
          break;
        case 'buyers':
          aVal = a.metrics.unique_buyers_24h;
          bVal = b.metrics.unique_buyers_24h;
          break;
        case 'holders':
          aVal = a.metrics.holders;
          bVal = b.metrics.holders;
          break;
        case 'liquidity':
          aVal = a.metrics.liquidity_usd;
          bVal = b.metrics.liquidity_usd;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [tokens, sortKey, sortOrder, searchTerm]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 inline ml-1" />
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatCount = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-solana-text-secondary" />
        <input
          type="text"
          placeholder="Search tokens by symbol or name..."
          className="w-full pl-10 pr-4 py-3 bg-solana-bg border border-solana-border rounded-lg text-white focus:outline-none focus:border-solana-teal transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-solana-border text-left">
              <th
                className="p-3 cursor-pointer hover:text-solana-teal transition-colors"
                onClick={() => handleSort('rank')}
              >
                Rank <SortIcon columnKey="rank" />
              </th>
              <th className="p-3">Token</th>
              <th
                className="p-3 cursor-pointer hover:text-solana-teal transition-colors"
                onClick={() => handleSort('score')}
              >
                Score <SortIcon columnKey="score" />
              </th>
              <th
                className="p-3 cursor-pointer hover:text-solana-teal transition-colors"
                onClick={() => handleSort('volume')}
              >
                Volume 24h <SortIcon columnKey="volume" />
              </th>
              <th
                className="p-3 cursor-pointer hover:text-solana-teal transition-colors"
                onClick={() => handleSort('buyers')}
              >
                Buyers <SortIcon columnKey="buyers" />
              </th>
              <th
                className="p-3 cursor-pointer hover:text-solana-teal transition-colors"
                onClick={() => handleSort('holders')}
              >
                Holders <SortIcon columnKey="holders" />
              </th>
              <th
                className="p-3 cursor-pointer hover:text-solana-teal transition-colors"
                onClick={() => handleSort('liquidity')}
              >
                Liquidity <SortIcon columnKey="liquidity" />
              </th>
              <th className="p-3">Peak Hour</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredTokens.map((token) => (
              <tr
                key={token.token_address}
                className="border-b border-solana-border hover:bg-solana-bg cursor-pointer transition-colors"
                onClick={() => router.push(`/token/${token.token_address}`)}
              >
                <td className="p-3">
                  <span
                    className={`font-bold ${
                      token.rank <= 3
                        ? 'text-solana-teal text-xl'
                        : token.rank <= 10
                        ? 'text-solana-purple'
                        : 'text-white'
                    }`}
                  >
                    #{token.rank}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={token.logo_url}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/32?text=' + token.symbol.charAt(0);
                      }}
                    />
                    <div>
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-sm text-solana-text-secondary">{token.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="font-bold text-solana-teal">{token.score}</span>
                </td>
                <td className="p-3 font-mono">{formatNumber(token.metrics.volume_24h_usd)}</td>
                <td className="p-3">{formatCount(token.metrics.unique_buyers_24h)}</td>
                <td className="p-3">
                  <div>
                    <p>{formatCount(token.metrics.holders)}</p>
                    <p
                      className={`text-xs ${
                        token.metrics.holders_growth_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {token.metrics.holders_growth_24h >= 0 ? '+' : ''}
                      {token.metrics.holders_growth_24h.toFixed(2)}%
                    </p>
                  </div>
                </td>
                <td className="p-3 font-mono">{formatNumber(token.metrics.liquidity_usd)}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-solana-purple/20 text-solana-purple rounded text-sm">
                    {token.peak_hour || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredTokens.length === 0 && (
        <div className="text-center py-12 text-solana-text-secondary">
          No tokens found matching your search
        </div>
      )}
    </div>
  );
}
