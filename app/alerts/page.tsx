'use client';

import SolPulseLogo from '@/components/SolPulseLogo';
import { useEffect, useState } from 'react';
import { Bell, TrendingUp, TrendingDown, AlertCircle, Clock, Plus, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { Alert } from '@/types';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recent' | 'watchlist' | 'settings'>('recent');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await apiClient.getRecentActivity();
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Bell className="w-4 h-4 text-info" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'error':
        return <TrendingDown className="w-4 h-4 text-error" />;
      default:
        return <Bell className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'border-info bg-info/5';
      case 'warning':
        return 'border-warning bg-warning/5';
      case 'error':
        return 'border-error bg-error/5';
      default:
        return 'border-border-light bg-bg-secondary';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const mockWatchlist = [
    { symbol: 'DOGE', address: 'DpL...xyz1', currentPrice: 0.08234, change24h: 15.6, alertPrice: 0.085 },
    { symbol: 'PEPE', address: 'ABC...xyz2', currentPrice: 0.001234, change24h: -3.2, alertPrice: 0.0012 },
    { symbol: 'SHIB', address: 'DEF...xyz3', currentPrice: 0.0000234, change24h: 8.7, alertPrice: 0.000025 },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-bg-primary border-b border-border-light sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Activity className="w-8 h-8 text-primary-blue animate-pulse-dot" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
                SOLPULSE
              </h1>
              <nav className="hidden md:flex items-center gap-2">
                <a href="/dashboard" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Dashboard
                </a>
                <a href="/analytics" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Analytics
                </a>
                <a href="/tokens" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Tokens
                </a>
                <a href="/alerts" className="px-4 py-2 text-sm font-medium text-text-primary bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 rounded-lg transition-colors border border-primary-blue/20">
                  Alerts
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="live-dot"></div>
                <span className="text-sm text-text-secondary">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Smart Alerts</h1>
          <p className="text-text-secondary">Monitor market movements and receive intelligent notifications</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-gradient-to-r from-primary-blue to-primary-purple text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            Recent Alerts
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-gradient-to-r from-primary-blue to-primary-purple text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            Watchlist Alerts
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-primary-blue to-primary-purple text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            Alert Settings
          </button>
        </div>

        {/* Recent Alerts Tab */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {/* Alert Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="stat-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">{alerts.length}</div>
                  <div className="text-sm text-text-secondary">Total Alerts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {alerts.filter(a => a.severity === 'info').length}
                  </div>
                  <div className="text-sm text-text-secondary">Info Alerts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-error">
                    {alerts.filter(a => a.severity === 'error').length}
                  </div>
                  <div className="text-sm text-text-secondary">Error Alerts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {alerts.filter(a => a.severity === 'warning').length}
                  </div>
                  <div className="text-sm text-text-secondary">Warning Alerts</div>
                </div>
              </div>
            </div>

            {/* Alert List */}
            <div className="card">
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent mx-auto"></div>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-secondary">No alerts yet</p>
                    <p className="text-sm text-text-secondary mt-2">Alerts will appear here when significant market movements are detected</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getAlertColor(alert.severity)} transition-all hover:shadow-sm`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getAlertIcon(alert.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-text-primary">{alert.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-text-secondary">
                              <Clock className="w-3 h-3" />
                              {formatTime(alert.timestamp)}
                            </div>
                          </div>
                          <p className="text-sm text-text-secondary mb-2">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary">Your Watchlist</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-purple text-white rounded-lg hover:from-primary-blue-dark hover:to-primary-purple-dark transition-colors">
                <Plus className="w-4 h-4" />
                Add Token
              </button>
            </div>

            <div className="space-y-3">
              {mockWatchlist.map((item, index) => (
                <div key={index} className="p-4 bg-bg-secondary rounded-lg border border-border-light">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-blue">
                          {item.symbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{item.symbol}</div>
                        <div className="text-sm text-text-secondary">{item.address}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-text-primary">${item.currentPrice.toFixed(6)}</div>
                      <div className={`text-sm ${item.change24h >= 0 ? 'text-success' : 'text-error'}`}>
                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border-light">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Alert Price: ${item.alertPrice.toFixed(6)}</span>
                      <button className="text-primary-blue hover:text-primary-blue/80 transition-colors">
                        Edit Alert
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Alert Types */}
            <div className="card">
              <h2 className="text-lg font-bold text-text-primary mb-4">Alert Types</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <div>
                      <div className="font-medium text-text-primary">Price Pump Alerts</div>
                      <div className="text-sm text-text-secondary">Notify when tokens increase by 10%+ in 1h</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-blue/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-error" />
                    <div>
                      <div className="font-medium text-text-primary">Price Dump Alerts</div>
                      <div className="text-sm text-text-secondary">Notify when tokens decrease by 15%+ in 1h</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-blue/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <div>
                      <div className="font-medium text-text-primary">Whale Activity</div>
                      <div className="text-sm text-text-secondary">Notify on large transactions ($50K+)</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-blue/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-info" />
                    <div>
                      <div className="font-medium text-text-primary">Volume Spike Alerts</div>
                      <div className="text-sm text-text-secondary">Notify when volume increases 5x normal</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-blue/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="card">
              <h2 className="text-lg font-bold text-text-primary mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Minimum Market Cap</label>
                  <select className="w-full p-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary">
                    <option>Any</option>
                    <option>$100K+</option>
                    <option>$500K+</option>
                    <option>$1M+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Alert Frequency</label>
                  <select className="w-full p-2 bg-bg-secondary border border-border-light rounded-lg text-text-primary">
                    <option>Immediate</option>
                    <option>Every 5 minutes</option>
                    <option>Every 15 minutes</option>
                    <option>Hourly digest</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-border-light mt-12 py-6">
        <div className="max-w-[1440px] mx-auto px-6 text-center text-text-secondary text-sm">
            <p>SolPulse © 2025 | Smart Alerts System</p>
        </div>
      </footer>
    </>
  );
}