'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface NetworkStats {
  estimated_tps?: number;
  unique_wallets?: number;
}

export default function NetworkStatsCard() {
  const [stats, setStats] = useState<NetworkStats | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await apiClient.getNetworkStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load network stats:', error);
    }
  };

  if (!stats) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-3 bg-bg-secondary rounded w-20 mb-3"></div>
            <div className="h-8 bg-bg-secondary rounded w-28"></div>
          </div>
        ))}
      </>
    );
  }

  const cards = [
    {
      label: 'Network TPS',
      value: stats.estimated_tps?.toLocaleString() || '0',
      change: '+12.3%',
      isPositive: true,
    },
    {
      label: 'Active Wallets',
      value: `${Math.round((stats.unique_wallets || 0) / 1000)}K`,
      change: '+8.7%',
      isPositive: true,
    },
    {
      label: 'Tracked Tokens',
      value: '50',
      change: '—',
      isPositive: null,
    },
    {
      label: '24h Volume',
      value: '$52.3M',
      change: '-3.2%',
      isPositive: false,
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div key={index} className="stat-card">
          <div className="stat-label">{card.label}</div>
          <div className="stat-value">{card.value}</div>
          <div className={`stat-change ${card.isPositive === true ? 'positive' : card.isPositive === false ? 'negative' : ''}`}>
            {card.change}
          </div>
        </div>
      ))}
    </>
  );
}
