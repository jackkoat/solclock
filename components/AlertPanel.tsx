'use client';

import type { Alert } from '@/types';

interface Props {
  alerts: Alert[];
  loading: boolean;
}

export default function AlertPanel({ alerts, loading }: Props) {
  const getAlertClass = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'alert-error';
      case 'medium':
        return 'alert-warning';
      case 'low':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  const getIcon = () => {
    return '🔔';
  };

  const getTitleColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-info';
      default:
        return 'text-text-primary';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-blue border-t-transparent"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>No alerts at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`alert ${getAlertClass(alert.severity)}`}
        >
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <div className={`alert-title ${getTitleColor(alert.severity)}`}>
              {alert.title}
            </div>
            <div className="alert-desc">
              {alert.message}
            </div>
            <div className="alert-time">
              {getTimeAgo(alert.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
