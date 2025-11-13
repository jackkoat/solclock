'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle, Menu, BarChart3 } from 'lucide-react';
import NetworkPulseChart from '@/components/NetworkPulseChart';
import NetworkActivityChart from '@/components/NetworkActivityChart';
import TransactionVolumeChart from '@/components/TransactionVolumeChart';
import TopMemeTable from '@/components/TopMemeTable';
import AlertPanel from '@/components/AlertPanel';
import NetworkStatsCard from '@/components/NetworkStatsCard';
import DataModeIndicator from '@/components/DataModeIndicator';
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
      {/* Data Mode Indicator */}
      <DataModeIndicator />
      
      {/* Header */}
      <header className="bg-bg-primary border-b border-border-light sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary-teal uppercase tracking-tight">
                SOLCLOCK
              </h1>
              <nav className="hidden md:flex items-center gap-2">
                <a href="/" className="px-4 py-2 text-sm font-medium text-text-primary bg-primary-teal/10 rounded-lg transition-colors">
                  Dashboard
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
                <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  How It Works
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
                <h2 className="text-lg font-bold">Top 50 Meme Coins</h2>
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

        {/* How It Works Section */}
        <div id="how-it-works" className="card">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-3">How SolClock Works</h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">SolClock solves the challenge of monitoring Solana&apos;s fast-moving meme coin ecosystem by providing real-time analytics, intelligent alerts, and automated tracking - all in one professional dashboard.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Problem Statement */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4">The Challenge</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-error text-sm">⚡</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Fast-Moving Market</div>
                    <div className="text-sm text-text-secondary">Meme coins can pump or dump within minutes, making manual monitoring impossible</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-warning text-sm">📊</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Information Overload</div>
                    <div className="text-sm text-text-secondary">Thousands of tokens create noise; hard to identify genuine opportunities</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-info/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-info text-sm">🔍</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Lack of Intelligence</div>
                    <div className="text-sm text-text-secondary">Basic price tracking misses whale activity, social sentiment, and liquidity metrics</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-error text-sm">⏰</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Time-Sensitive Decisions</div>
                    <div className="text-sm text-text-secondary">Every second counts in crypto; delayed information means missed opportunities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SolClock Solution */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Our Solution</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm">✅</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Real-Time Data Streams</div>
                    <div className="text-sm text-text-secondary">Live Solana network metrics and DexScreener API integration for instant data</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm">🧠</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Smart Scoring Algorithm</div>
                    <div className="text-sm text-text-secondary">Weighted analysis of volume, liquidity, buyers, holders, and social signals</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm">🚨</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Intelligent Alerts</div>
                    <div className="text-sm text-text-secondary">Whale activity detection, price breakouts, and trend momentum notifications</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-success text-sm">⚙️</span>
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary">Automated Updates</div>
                    <div className="text-sm text-text-secondary">Hourly data refresh with Supabase cron jobs - zero maintenance required</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className="border-t border-border-light pt-8">
            <h3 className="text-xl font-bold text-text-primary mb-6 text-center">Technical Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </div>
                <h4 className="font-bold text-text-primary mb-2">Data Sources</h4>
                <p className="text-sm text-text-secondary">
                  <strong>Solana RPC</strong> - Network performance metrics<br />
                  <strong>DexScreener API</strong> - Real-time token data<br />
                  <strong>Price Feeds</strong> - Market data aggregation
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 className="font-bold text-text-primary mb-2">Processing</h4>
                <p className="text-sm text-text-secondary">
                  <strong>Supabase Edge Functions</strong> - Serverless processing<br />
                  <strong>Smart Algorithms</strong> - Weighted scoring system<br />
                  <strong>Automated Updates</strong> - Hourly cron jobs
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h4 className="font-bold text-text-primary mb-2">Visualization</h4>
                <p className="text-sm text-text-secondary">
                  <strong>Next.js Frontend</strong> - Modern React app<br />
                  <strong>Real-Time Charts</strong> - Interactive data visualization<br />
                  <strong>Responsive Design</strong> - Works on all devices
                </p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="border-t border-border-light pt-8 mt-8">
            <h3 className="text-xl font-bold text-text-primary mb-6 text-center">Who Benefits from SolClock?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-teal/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🚀</span>
                </div>
                <h4 className="font-bold text-text-primary mb-2">DeFi Traders</h4>
                <p className="text-sm text-text-secondary">Spot trending tokens early and make informed trading decisions</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">💼</span>
                </div>
                <h4 className="font-bold text-text-primary mb-2">Hedge Funds</h4>
                <p className="text-sm text-text-secondary">Comprehensive market intelligence for risk assessment</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📊</span>
                </div>
                <h4 className="font-bold text-text-primary mb-2">Analysts</h4>
                <p className="text-sm text-text-secondary">Deep insights into network activity and token performance</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">👥</span>
                </div>
                <h4 className="font-bold text-text-primary mb-2">Community</h4>
                <p className="text-sm text-text-secondary">Stay informed about the Solana ecosystem and meme coin trends</p>
              </div>
            </div>
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