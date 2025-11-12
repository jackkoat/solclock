'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle, Menu } from 'lucide-react';
import NetworkPulseChart from '@/components/NetworkPulseChart';
import TopMemeTable from '@/components/TopMemeTable';
import AlertPanel from '@/components/AlertPanel';
import NetworkStatsCard from '@/components/NetworkStatsCard';
import { apiClient } from '@/lib/api';
import type { NetworkPulseData, MemeToken, Alert } from '@/types';

export default function Home() {
  const [networkData, setNetworkData] = useState<NetworkPulseData | null>(null);
  const [topMemeCoins, setTopMemeCoins] = useState<MemeToken[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    loadData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [networkRes, topMemeRes, alertsRes] = await Promise.all([
        apiClient.getNetworkPulse(),
        apiClient.getTopMemeCoins(50),
        apiClient.getRecentActivity()
      ]);

      setNetworkData(networkRes.data);
      setTopMemeCoins(topMemeRes.data.rankings);
      setAlerts(alertsRes.data.alerts);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeData = async () => {
    setInitializing(true);
    try {
      await fetch('/api/init', { method: 'POST' });
      await loadData();
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-bg-primary border-b border-border-light sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary-teal uppercase tracking-tight">
                SOLCLOCK
              </h1>
              <nav className="hidden md:flex items-center gap-2">
                <a href="#" className="px-4 py-2 text-sm font-medium text-text-primary bg-primary-teal/10 rounded-lg transition-colors">
                  Dashboard
                </a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Analytics
                </a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Tokens
                </a>
                <a href="#" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Alerts
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="live-dot"></div>
                <span className="text-sm text-text-secondary">Live</span>
              </div>
              <button className="md:hidden p-2 text-text-secondary hover:text-text-primary">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8 pb-20">
        {/* Initialize Data Button (only show if no data) */}
        {!loading && topMemeCoins.length === 0 && (
          <div className="card mb-6 text-center py-12">
            <h3 className="text-lg font-bold mb-4">Initialize Mock Data</h3>
            <p className="text-text-secondary mb-6">No data found. Click below to generate mock data for the dashboard.</p>
            <button 
              onClick={initializeData}
              disabled={initializing}
              className="btn-primary"
            >
              {initializing ? 'Generating Data...' : 'Initialize Data'}
            </button>
          </div>
        )}

        {/* Network Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <NetworkStatsCard />
        </div>

        {/* Network Pulse Chart */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-primary-teal" />
            <h2 className="text-lg font-bold">Network Pulse - Last 24 Hours</h2>
          </div>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-teal border-t-transparent"></div>
            </div>
          ) : (
            <NetworkPulseChart data={networkData} />
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Top Meme Coins Table */}
          <div className="xl:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-teal" />
                <h2 className="text-lg font-bold">Top 50 Meme Coins</h2>
              </div>
            </div>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-teal border-t-transparent"></div>
              </div>
            ) : (
              <TopMemeTable tokens={topMemeCoins} />
            )}
          </div>

          {/* Alerts Panel */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <AlertCircle className="w-5 h-5 text-error" />
              <h2 className="text-lg font-bold">Live Alerts</h2>
            </div>
            <AlertPanel alerts={alerts} loading={loading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-border-light mt-12 py-6">
        <div className="max-w-[1440px] mx-auto px-6 text-center text-text-secondary text-sm">
          <p>SolClock © 2025 | Solana Network Analytics Dashboard</p>
          <p className="mt-2">Powered by Solana Blockchain</p>
        </div>
      </footer>
    </>
  );
}
