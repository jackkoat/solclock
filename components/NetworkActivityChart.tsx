'use client';

import { useEffect, useState } from 'react';
import BarChart, { BarChartSkeleton } from './BarChart';
import { apiClient } from '@/lib/api';

interface NetworkActivityData {
  timestamp: string;
  tps: number;
  blocks: number;
  cu_consumed: number;
  interval_minutes: number;
}

interface NetworkActivityChartProps {
  period?: '24h' | '7d' | '30d';
  metric?: 'tps' | 'blocks' | 'cu_consumed';
  height?: number;
}

export default function NetworkActivityChart({ 
  period = '24h', 
  metric = 'tps', 
  height = 400 
}: NetworkActivityChartProps) {
  const [data, setData] = useState<NetworkActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNetworkActivityData();
  }, [period, metric]);

  const fetchNetworkActivityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getNetworkActivity({
        period,
        metric
      });

      if (response.success) {
        setData(response.data.points);
      } else {
        setError(response.error || 'Failed to fetch network activity data');
      }
    } catch (err) {
      setError('Network error while fetching data');
      console.error('Error fetching network activity:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BarChartSkeleton height={height} title={`Network ${metric.toUpperCase()} - ${period}`} />;
  }

  if (error) {
    return (
      <div className="bg-bg-secondary rounded-lg p-6" style={{ height: `${height + 80}px` }}>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">{`Network ${metric.toUpperCase()} - ${period}`}</h3>
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-error mb-2">Failed to load chart data</p>
            <p className="text-text-secondary text-sm">{error}</p>
            <button 
              onClick={fetchNetworkActivityData}
              className="mt-4 px-4 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-colors"
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
        <h3 className="text-lg font-semibold mb-4 text-text-primary">{`Network ${metric.toUpperCase()} - ${period}`}</h3>
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        label: `Network ${metric.replace('_', ' ').toUpperCase()}`,
        data: values,
        backgroundColor: 'rgba(20, 241, 149, 0.8)',
        borderColor: 'rgba(20, 241, 149, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Format numbers based on metric type
  const formatValue = (value: number) => {
    switch (metric) {
      case 'tps':
        return value.toLocaleString();
      case 'blocks':
        return value.toLocaleString();
      case 'cu_consumed':
        if (value >= 1000000) {
          return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'K';
        }
        return value.toLocaleString();
      default:
        return value.toLocaleString();
    }
  };

  const latest = data[data.length - 1];
  const average = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);

  return (
    <div className="bg-bg-secondary rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{`Network ${metric.toUpperCase()} - ${period}`}</h3>
        <div className="flex gap-2">
          {/* Period selectors */}
          <select 
            value={period} 
            onChange={(e) => window.location.hash = `period=${e.target.value}`}
            className="px-3 py-1 text-sm border border-border-light rounded bg-bg-primary text-text-primary"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
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
          <div className="text-xs text-text-secondary mb-1">Peak</div>
          <div className="text-lg font-bold text-text-primary">{formatValue(Math.max(...values))}</div>
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