'use client';

import { useEffect, useState } from 'react';
import { Activity, Zap, Users } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function NetworkStatsCard() {
  const [stats, setStats] = useState<any>(null);

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
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-solana-border rounded w-20 mb-4"></div>
            <div className="h-8 bg-solana-border rounded w-32"></div>
          </div>
        ))}
      </>
    );
  }

  const cards = [
    {
      title: 'Network TPS',
      value: stats.estimated_tps?.toLocaleString() || '0',
      icon: <Zap className="w-6 h-6 text-solana-teal" />,
      color: 'text-solana-teal',
    },
    {
      title: 'Blocks/Hour',
      value: stats.blocks_last_hour?.toLocaleString() || '0',
      icon: <Activity className="w-6 h-6 text-solana-purple" />,
      color: 'text-solana-purple',
    },
    {
      title: 'Active Wallets',
      value: `${Math.round((stats.unique_wallets || 0) / 1000)}K`,
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'text-white',
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div
          key={index}
          className="card p-6 hover:border-solana-teal/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-solana-text-secondary text-sm font-medium">
              {card.title}
            </p>
            {card.icon}
          </div>
          <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </>
  );
}
