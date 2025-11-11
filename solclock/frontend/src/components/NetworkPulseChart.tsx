'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
          wallets: Math.round(stat.unique_wallets / 1000), // Show in thousands
        };
      });
      setChartData(formatted);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="h-80 flex items-center justify-center text-text-secondary">
        No network data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-primary border border-border-light rounded-lg p-3 shadow-card">
          <p className="font-semibold text-primary-teal mb-2 text-sm">{label}</p>
          <p className="text-xs text-text-secondary">
            TPS: <span className="text-text-primary font-semibold">{payload[0]?.value || 0}K</span>
          </p>
          <p className="text-xs text-text-secondary">
            Wallets: <span className="text-text-primary font-semibold">{payload[1]?.value || 0}K</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F7F9FB" />
          <XAxis 
            dataKey="hour" 
            stroke="#9CA3AF"
            style={{ fontSize: '11px', fontFamily: 'Inter' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '11px', fontFamily: 'Inter' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#6B7280', fontSize: '12px', fontFamily: 'Inter', fontWeight: '500' }}
          />
          <Line 
            type="monotone"
            dataKey="transactions" 
            stroke="#14F195" 
            strokeWidth={2}
            dot={false}
            name="TPS (K)"
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone"
            dataKey="wallets" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            name="Active Wallets (K)"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
