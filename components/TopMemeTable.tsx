'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown } from 'lucide-react';
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
    const filtered = tokens.filter(
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
          aVal = a.volume_24h_usd;
          bVal = b.volume_24h_usd;
          break;
        case 'buyers':
          aVal = a.unique_buyers_24h;
          bVal = b.unique_buyers_24h;
          break;
        case 'holders':
          aVal = a.holders;
          bVal = b.holders;
          break;
        case 'liquidity':
          aVal = a.liquidity_usd;
          bVal = b.liquidity_usd;
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
      <ArrowUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 inline ml-1" />
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
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search tokens..."
          className="input w-full md:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {sortedAndFilteredTokens.map((token) => (
          <div
            key={token.token_address}
            className="card cursor-pointer hover:bg-bg-secondary/50 transition-colors"
            onClick={() => router.push(`/token/${token.token_address}`)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`rank-badge ${token.rank <= 3 ? 'top-3' : ''}`}>
                  {token.rank}
                </div>
                <img
                  src={token.logo_url}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-teal to-info"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/32?text=' + token.symbol.charAt(0);
                  }}
                />
                <div>
                  <div className="font-semibold text-text-primary">{token.symbol}</div>
                  <div className="text-sm text-text-secondary">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary-teal">
                  {formatNumber(token.volume_24h_usd)}
                </div>
                <div className="text-sm text-text-secondary">24h Volume</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-text-secondary">Buyers</div>
                <div className="font-semibold text-text-primary">
                  {formatCount(token.unique_buyers_24h)}
                </div>
              </div>
              <div>
                <div className="text-text-secondary">Holders</div>
                <div className="font-semibold text-text-primary">
                  {formatCount(token.holders)}
                </div>
              </div>
              <div>
                <div className="text-text-secondary">Score</div>
                <div className="flex items-center gap-2">
                  <div className="progress-bar w-12">
                    <div className="progress-fill" style={{ width: `${token.score}%` }}></div>
                  </div>
                  <span className="font-semibold text-text-primary">{token.score}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th 
                  className="cursor-pointer hover:text-primary-teal transition-colors"
                  onClick={() => handleSort('rank')}
                >
                  # <SortIcon columnKey="rank" />
                </th>
                <th>Token</th>
                <th 
                  className="cursor-pointer hover:text-primary-teal transition-colors"
                  onClick={() => handleSort('volume')}
                >
                  24h Volume <SortIcon columnKey="volume" />
                </th>
                <th 
                  className="cursor-pointer hover:text-primary-teal transition-colors"
                  onClick={() => handleSort('buyers')}
                >
                  Buyers <SortIcon columnKey="buyers" />
                </th>
                <th 
                  className="cursor-pointer hover:text-primary-teal transition-colors"
                  onClick={() => handleSort('holders')}
                >
                  Holders <SortIcon columnKey="holders" />
                </th>
                <th 
                  className="cursor-pointer hover:text-primary-teal transition-colors"
                  onClick={() => handleSort('score')}
                >
                  Score <SortIcon columnKey="score" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredTokens.map((token) => (
                <tr
                  key={token.token_address}
                  className="cursor-pointer"
                  onClick={() => router.push(`/token/${token.token_address}`)}
                >
                  <td>
                    <div className={`rank-badge ${token.rank <= 3 ? 'top-3' : ''}`}>
                      {token.rank}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={token.logo_url}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-teal to-info"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/32?text=' + token.symbol.charAt(0);
                        }}
                      />
                      <span className="font-semibold">{token.symbol}</span>
                    </div>
                  </td>
                  <td className="font-semibold text-primary-teal">
                    {formatNumber(token.volume_24h_usd)}
                  </td>
                  <td className="text-text-primary">
                    {formatCount(token.unique_buyers_24h)}
                  </td>
                  <td className="text-text-primary">
                    {formatCount(token.holders)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20">
                        <div className="progress-fill" style={{ width: `${token.score}%` }}></div>
                      </div>
                      <span className="text-sm font-semibold">{token.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedAndFilteredTokens.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No tokens found matching your search
        </div>
      )}
    </div>
  );
}
