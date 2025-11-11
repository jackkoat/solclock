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

      {/* Table */}
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
                  {formatNumber(token.metrics.volume_24h_usd)}
                </td>
                <td className="text-text-primary">
                  {formatCount(token.metrics.unique_buyers_24h)}
                </td>
                <td className="text-text-primary">
                  {formatCount(token.metrics.holders)}
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

      {sortedAndFilteredTokens.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No tokens found matching your search
        </div>
      )}
    </div>
  );
}
