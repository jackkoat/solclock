'use client';

import { Flame, Droplet, Bell, TrendingUp } from 'lucide-react';
import type { Alert } from '@/types';

interface Props {
  alerts: Alert[];
  loading: boolean;
}

export default function AlertPanel({ alerts, loading }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-500/10';
      case 'medium':
        return 'border-solana-purple bg-solana-purple/10';
      case 'low':
        return 'border-solana-teal bg-solana-teal/10';
      default:
        return 'border-solana-border bg-solana-card';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'degen_hour':
        return <Flame className="w-5 h-5 text-red-400" />;
      case 'whale_activity':
        return <TrendingUp className="w-5 h-5 text-solana-purple" />;
      case 'network_calm':
        return <Droplet className="w-5 h-5 text-solana-teal" />;
      case 'top50_entry':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-6 h-6 text-solana-teal" />
        <h2 className="text-2xl font-bold">Live Alerts</h2>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-solana-teal border-t-transparent"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-solana-text-secondary">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No alerts at the moment</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getSeverityColor(
                alert.severity
              )} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-white">{alert.message}</h3>
                    <span className="text-xs text-solana-text-secondary">
                      {getTimeAgo(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-solana-text-secondary">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
