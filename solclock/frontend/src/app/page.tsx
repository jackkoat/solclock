'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Clock } from 'lucide-react';
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

  return (
    <main className="min-h-screen p-6 pb-20">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-10 h-10 text-solana-teal" />
          <h1 className="text-4xl font-bold gradient-text">
            SolClock
          </h1>
        </div>
        <p className="text-solana-text-secondary text-lg">
          Track Solana&apos;s Degen Hours in Real Time
        </p>
      </header>

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
        <NetworkStatsCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Left Section: Network Pulse */}
        <div className="xl:col-span-2 card p-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-solana-teal" />
            <h2 className="text-2xl font-bold">Network Pulse</h2>
          </div>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-solana-teal border-t-transparent"></div>
            </div>
          ) : (
            <NetworkPulseChart data={networkData} />
          )}
        </div>

        {/* Right Section: Alerts */}
        <div className="card p-6 animate-slide-up">
          <AlertPanel alerts={alerts} loading={loading} />
        </div>
      </div>

      {/* Top Meme Coins Table */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-solana-purple" />
          <h2 className="text-2xl font-bold">Top 50 Meme Coins</h2>
        </div>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-solana-purple border-t-transparent"></div>
          </div>
        ) : (
          <TopMemeTable tokens={topMemeCoins} />
        )}
      </div>
    </main>
  );
}
