'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TokenClockData } from '@/types';

interface Props {
  data: TokenClockData | null;
  loading: boolean;
}

export default function MemeClock({ data, loading }: Props) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [peakIndex, setPeakIndex] = useState<number>(-1);

  useEffect(() => {
    if (data?.hourly_data) {
      const formatted = data.hourly_data.map((hour, index) => ({
        hour: hour.hour_label,
        volume: Math.round(hour.tx_volume_usd),
        transactions: hour.tx_count,
        buyers: hour.unique_buyers,
      }));
      
      setChartData(formatted);
      
      // Find peak hour index
      const maxVolume = Math.max(...formatted.map(h => h.volume));
      const peakIdx = formatted.findIndex(h => h.volume === maxVolume);
      setPeakIndex(peakIdx);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-solana-teal border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-solana-text-secondary">
        No clock data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card p-4 shadow-lg">
          <p className="font-semibold text-solana-teal mb-2">{label}</p>
          <p className="text-sm text-solana-text-secondary">
            Volume: <span className="text-white font-semibold">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-solana-text-secondary">
            Transactions: <span className="text-white font-semibold">{payload[0].payload.transactions.toLocaleString()}</span>
          </p>
          <p className="text-sm text-solana-text-secondary">
            Buyers: <span className="text-white font-semibold">{payload[0].payload.buyers.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-sm text-solana-text-secondary mb-1">Total Volume</p>
          <p className="text-xl font-bold text-solana-teal">
            ${(data.total_volume_24h / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-solana-text-secondary mb-1">Total Transactions</p>
          <p className="text-xl font-bold text-solana-purple">
            {data.total_transactions_24h.toLocaleString()}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-solana-text-secondary mb-1">Unique Buyers</p>
          <p className="text-xl font-bold text-white">
            {data.total_unique_buyers_24h.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Peak Hour Badge */}
      {data.peak_hour && (
        <div className="mb-4 p-3 bg-solana-purple/10 border border-solana-purple/30 rounded-lg text-center">
          <p className="text-sm text-solana-text-secondary">Peak Activity Hour</p>
          <p className="text-lg font-bold text-solana-purple">{data.peak_hour}</p>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis 
            dataKey="hour" 
            stroke="#94A3B8"
            style={{ fontSize: '11px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#94A3B8"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="volume" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === peakIndex ? '#A855F7' : '#5EE7D8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
