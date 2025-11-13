'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle, Menu, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NetworkPulseChart from '@/components/NetworkPulseChart';
import NetworkActivityChart from '@/components/NetworkActivityChart';
import TransactionVolumeChart from '@/components/TransactionVolumeChart';
import TopMemeTable from '@/components/TopMemeTable';
import AlertPanel from '@/components/AlertPanel';
import NetworkStatsCard from '@/components/NetworkStatsCard';
import SolPulseLogo from '@/components/SolPulseLogo';
import { apiClient } from '@/lib/api';
import type { NetworkPulseData, MemeToken, Alert } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Pulse Background */}
      <div className="absolute inset-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30" />
        
        {/* Animated Pulse Rings */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Activity className="w-8 h-8 text-primary-blue animate-pulse-dot" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
                SOLPULSE
              </h1>
              <nav className="hidden md:flex items-center gap-2">
                <a href="/dashboard" className="px-4 py-2 text-sm font-medium text-text-primary bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 rounded-lg transition-colors border border-primary-blue/20">
                  Dashboard
                </a>
                <a href="/how-it-works" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  How It Works
                </a>
                <a href="/analytics" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Analytics
                </a>
                <a href="/tokens" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Tokens
                </a>
                <a href="/alerts" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
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

      <main className="relative z-10 max-w-[1440px] mx-auto px-6 py-8 pb-20">
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

        {/* NEW: Network Stats Barchart Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Network Activity Barchart */}
          <NetworkActivityChart
            period="24h"
            metric="tps"
            height={350}
          />

          {/* Transaction Volume Barchart */}
          <TransactionVolumeChart
            period="24h"
            interval="3h"
            metric="total_transactions"
            height={350}
          />
        </div>

        {/* Network Pulse Chart (Original) */}
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
                <h2 className="text-lg font-bold">Top 10 Meme Coins</h2>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-text-secondary" />
                <span className="text-sm text-text-secondary">Live Rankings</span>
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
      <footer className="relative z-10 bg-slate-900/80 backdrop-blur-md border-t border-white/10 mt-12 py-6">
        <div className="max-w-[1440px] mx-auto px-6 text-center text-white/60 text-sm">
          <p>SolPulse © 2025 | Solana Network Analytics Dashboard</p>
          <p className="mt-2">Powered by Solana Blockchain</p>
        </div>
      </footer>
    </div>
  );
}