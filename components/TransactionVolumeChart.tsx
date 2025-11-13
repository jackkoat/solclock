'use client';

import { useEffect, useState } from 'react';
import BarChart, { BarChartSkeleton } from './BarChart';
import { apiClient } from '@/lib/api';

interface TransactionVolumeData {
  timestamp: string;
  total_transactions: number;
  total_volume: number;
  unique_wallets: number;
  avg_transaction_size: number;
  interval: string;
}

interface TransactionVolumeChartProps {
  period?: '24h' | '7d' | '30d';
  interval?: '1h' | '3h' | '6h' | '12h' | '24h';
  metric?: 'total_transactions' | 'total_volume' | 'unique_wallets';
  height?: number;
}

export default function TransactionVolumeChart({ 
  period = '24h', 
  interval = '3h',
  metric = 'total_transactions',
  height = 400 
}: TransactionVolumeChartProps) {
  const [data, setData] = useState<TransactionVolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactionVolumeData();
  }, [period, interval, metric]);

  const fetchTransactionVolumeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getTransactionVolume({
        period,
        interval
      });

      if (response.success) {
        setData(response.data.points);
      } else {
        setError(response.error || 'Failed to fetch transaction volume data');
      }
    } catch (err) {
      setError('Network error while fetching data');
      console.error('Error fetching transaction volume:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BarChartSkeleton height={height} title={`Transaction ${metric.replace('_', ' ')} - ${period}`} />;
  }

  if (error) {
    return (
      <div className="bg-bg-secondary rounded-lg p-6" style={{ height: `${height + 80}px` }}>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">{`Transaction ${metric.replace('_', ' ')} - ${period}`}</h3>
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-error mb-2">Failed to load chart data</p>
            <p className="text-text-secondary text-sm">{error}</p>
            <button 
              onClick={fetchTransactionVolumeData}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-lg hover:from-primary-blue-dark hover:to-primary-purple-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-lg p-6" style={{ height: `${height + 80}px` }}>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">{`Transaction ${metric.replace('_', ' ')} - ${period}`}</h3>
        <div className="flex items-center justify-center h-full text-text-secondary">
          No data available for the selected period
        </div>
      </div>
    );
  }

  // Format data for chart
  const labels = data.map(point => {
    const date = new Date(point.timestamp);
    if (period === '24h') {
      return date.getHours().toString().padStart(2, '0') + ':00';
    } else if (period === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  });

  const values = data.map(point => point[metric as keyof typeof point] as number);
  
  // Calculate max value for better scaling
  const maxValue = Math.max(...values) * 1.1;

  const chartData = {
    labels,
    datasets: [
      {
        label: metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        data: values,
        backgroundColor: 'rgba(138, 43, 226, 0.8)', // Purple color
        borderColor: 'rgba(138, 43, 226, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Format numbers based on metric type
  const formatValue = (value: number) => {
    switch (metric) {
      case 'total_transactions':
        if (value >= 1000000) {
          return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'K';
        }
        return value.toLocaleString();
      case 'total_volume':
        if (value >= 1000000000) {
          return '$' + (value / 1000000000).toFixed(1) + 'B';
        } else if (value >= 1000000) {
          return '$' + (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
          return '$' + (value / 1000).toFixed(1) + 'K';
        }
        return '$' + value.toLocaleString();
      case 'unique_wallets':
        if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'K';
        }
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
  };

  const latest = data[data.length - 1];
  const average = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  const total = values.reduce((sum, val) => sum + val, 0);

  // Metric display names
  const metricDisplayName = {
    total_transactions: 'Transactions',
    total_volume: 'Volume (USD)',
    unique_wallets: 'Unique Wallets'
  }[metric] || metric.replace('_', ' ');

  return (
    <div className="bg-bg-secondary rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{`Transaction ${metricDisplayName} - ${period}`}</h3>
        <div className="flex gap-2">
          {/* Period selectors */}
          <select 
            value={period} 
            onChange={(e) => {
              // Update URL hash for period
              window.location.hash = `period=${e.target.value}`;
            }}
            className="px-3 py-1 text-sm border border-border-light rounded bg-bg-primary text-text-primary"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
          
          {/* Interval selectors for transaction volume */}
          <select 
            value={interval} 
            onChange={(e) => {
              // Update URL hash for interval
              const hash = window.location.hash.replace(/interval=\w+/, `interval=${e.target.value}`);
              window.location.hash = hash || `interval=${e.target.value}`;
            }}
            className="px-3 py-1 text-sm border border-border-light rounded bg-bg-primary text-text-primary"
          >
            <option value="1h">1h</option>
            <option value="3h">3h</option>
            <option value="6h">6h</option>
            <option value="12h">12h</option>
            <option value="24h">24h</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-2 bg-bg-primary rounded">
          <div className="text-xs text-text-secondary mb-1">Current</div>
          <div className="text-lg font-bold text-text-primary">{formatValue(latest[metric as keyof typeof latest] as number)}</div>
        </div>
        <div className="text-center p-2 bg-bg-primary rounded">
          <div className="text-xs text-text-secondary mb-1">Average</div>
          <div className="text-lg font-bold text-text-primary">{formatValue(average)}</div>
        </div>
        <div className="text-center p-2 bg-bg-primary rounded">
          <div className="text-xs text-text-secondary mb-1">Total {period}</div>
          <div className="text-lg font-bold text-text-primary">{formatValue(total)}</div>
        </div>
      </div>

      <BarChart 
        data={chartData} 
        height={height}
        maxValue={maxValue}
        showGrid={true}
      />
    </div>
  );
}