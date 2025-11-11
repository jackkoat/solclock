'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { NetworkPulseData } from '@/types';

interface Props {
  data: NetworkPulseData | null;
}

export default function NetworkPulseChart({ data }: Props) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data?.hourly_stats) {
      const formatted = data.hourly_stats.map((stat) => {
        const date = new Date(stat.hour);
        return {
          hour: date.getUTCHours() + ':00',
          transactions: Math.round(stat.total_transactions / 1000), // Show in thousands
          blocks: stat.total_blocks,
          wallets: Math.round(stat.unique_wallets / 1000), // Show in thousands
        };
      });
      setChartData(formatted);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="h-80 flex items-center justify-center text-solana-text-secondary">
        No network data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card p-4 shadow-lg">
          <p className="font-semibold text-solana-teal mb-2">{label}</p>
          <p className="text-sm text-solana-text-secondary">
            Transactions: <span className="text-white font-semibold">{payload[0].value}K</span>
          </p>
          <p className="text-sm text-solana-text-secondary">
            Blocks: <span className="text-white font-semibold">{payload[1].value}</span>
          </p>
          <p className="text-sm text-solana-text-secondary">
            Wallets: <span className="text-white font-semibold">{payload[2].value}K</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-solana-text-secondary mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-solana-teal">
            {(data.summary.total_transactions_24h / 1_000_000).toFixed(1)}M
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-solana-text-secondary mb-1">Total Blocks</p>
          <p className="text-2xl font-bold text-solana-purple">
            {(data.summary.total_blocks_24h / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-solana-text-secondary mb-1">Avg Wallets/Hour</p>
          <p className="text-2xl font-bold text-white">
            {(data.summary.avg_unique_wallets / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis 
            dataKey="hour" 
            stroke="#94A3B8"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#94A3B8"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#94A3B8' }}
          />
          <Bar 
            dataKey="transactions" 
            fill="#5EE7D8" 
            name="Transactions (K)"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="blocks" 
            fill="#A855F7" 
            name="Blocks"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Peak Hour Info */}
      {data.peak_hour && (
        <div className="mt-4 p-4 bg-solana-bg rounded-lg border border-solana-teal/30">
          <p className="text-sm text-solana-text-secondary mb-1">Peak Hour</p>
          <p className="text-lg font-semibold text-solana-teal">
            {new Date(data.peak_hour.hour).getUTCHours()}:00 UTC - {(data.peak_hour.total_transactions / 1_000_000).toFixed(2)}M transactions
          </p>
        </div>
      )}
    </div>
  );
}
