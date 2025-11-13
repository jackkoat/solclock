'use client';

import { Activity, TrendingUp, AlertCircle, Menu, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function HowItWorks() {
  const router = useRouter();

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
                <a href="/dashboard" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors">
                  Dashboard
                </a>
                <a href="/how-it-works" className="px-4 py-2 text-sm font-medium text-text-primary bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 rounded-lg transition-colors border border-primary-blue/20">
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
        {/* How It Works Section */}
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-3">How SolPulse Works</h1>
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

          {/* CTA Section */}
          <div className="border-t border-border-light pt-8 mt-8 text-center">
            <h3 className="text-xl font-bold text-text-primary mb-4">Ready to Get Started?</h3>
            <p className="text-text-secondary mb-6">Experience the power of real-time Solana analytics</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Launch Dashboard
            </button>
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