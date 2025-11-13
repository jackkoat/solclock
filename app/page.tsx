'use client';

import { useRouter } from 'next/navigation';
import { Activity, TrendingUp, BarChart3, Zap, Shield, Users, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
      {/* Navigation */}
      <nav className="bg-bg-primary/95 backdrop-blur-sm border-b border-border-light sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary-teal" />
              <h1 className="text-2xl font-bold text-primary-teal uppercase tracking-tight">
                SOLCLOCK
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-text-secondary hover:text-primary-teal transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-text-secondary hover:text-primary-teal transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-text-secondary hover:text-primary-teal transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary"
              >
                Launch Dashboard
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border-light pt-4">
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-left text-text-secondary hover:text-primary-teal transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left text-text-secondary hover:text-primary-teal transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-left text-text-secondary hover:text-primary-teal transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary w-full text-center"
                >
                  Launch Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary-teal/10 text-primary-teal px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Live Solana Network Analytics
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
              Monitor Solana&apos;s
              <span className="text-primary-teal block">Meme Coin Ecosystem</span>
            </h1>

            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Real-time analytics, intelligent alerts, and automated tracking for the fastest-moving
              cryptocurrency market. Stay ahead of the curve with professional-grade tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group"
              >
                Launch Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-text-secondary hover:text-primary-teal transition-colors text-lg font-medium"
              >
                Learn More ↓
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-bg-secondary/50 backdrop-blur-sm rounded-lg p-6 border border-border-light">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="text-sm text-text-secondary">Active Tokens</span>
                </div>
                <div className="text-2xl font-bold text-text-primary">50+</div>
              </div>
              <div className="bg-bg-secondary/50 backdrop-blur-sm rounded-lg p-6 border border-border-light">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-primary-teal" />
                  <span className="text-sm text-text-secondary">Network TPS</span>
                </div>
                <div className="text-2xl font-bold text-text-primary">3,000+</div>
              </div>
              <div className="bg-bg-secondary/50 backdrop-blur-sm rounded-lg p-6 border border-border-light">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-info" />
                  <span className="text-sm text-text-secondary">24h Volume</span>
                </div>
                <div className="text-2xl font-bold text-text-primary">$2.5M+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-teal rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-bg-secondary/30">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Powerful Features for Serious Traders
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Everything you need to stay ahead in the fast-moving Solana ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card group hover:border-primary-teal/50 transition-colors">
              <div className="w-12 h-12 bg-primary-teal/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-teal/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary-teal" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Real-Time Rankings</h3>
              <p className="text-text-secondary">
                Live rankings of top 50 meme coins with intelligent scoring based on volume, liquidity, and social signals.
              </p>
            </div>

            <div className="card group hover:border-info/50 transition-colors">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                <Activity className="w-6 h-6 text-info" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Network Analytics</h3>
              <p className="text-text-secondary">
                Monitor Solana network performance with TPS charts, transaction volumes, and activity patterns.
              </p>
            </div>

            <div className="card group hover:border-warning/50 transition-colors">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Smart Alerts</h3>
              <p className="text-text-secondary">
                Get notified about whale activity, price breakouts, and trending tokens before the crowd.
              </p>
            </div>

            <div className="card group hover:border-success/50 transition-colors">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Risk Assessment</h3>
              <p className="text-text-secondary">
                Advanced scoring algorithms help identify genuine opportunities from pump-and-dump schemes.
              </p>
            </div>

            <div className="card group hover:border-error/50 transition-colors">
              <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-error/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-error" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Historical Data</h3>
              <p className="text-text-secondary">
                Access 24-hour historical data with interactive charts and detailed token performance metrics.
              </p>
            </div>

            <div className="card group hover:border-primary-teal/50 transition-colors">
              <div className="w-12 h-12 bg-primary-teal/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-teal/20 transition-colors">
                <Users className="w-6 h-6 text-primary-teal" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Community Insights</h3>
              <p className="text-text-secondary">
                Stay connected with the Solana community and get insights from fellow traders and analysts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              How SolClock Works
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              From data collection to actionable insights in real-time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Data Collection</h3>
              <p className="text-text-secondary">
                We continuously monitor Solana blockchain and DexScreener API for real-time token data,
                network metrics, and trading activity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Smart Processing</h3>
              <p className="text-text-secondary">
                Our algorithms analyze volume patterns, holder growth, liquidity changes, and social signals
                to score tokens intelligently.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Real-Time Insights</h3>
              <p className="text-text-secondary">
                Get instant access to rankings, charts, and alerts through our professional dashboard,
                updated every 5 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-teal/10 to-info/10">
        <div className="max-w-[1440px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Ready to Master the Solana Market?
          </h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust SolClock for their Solana analytics needs.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto group"
          >
            Launch Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-border-light py-12">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary-teal" />
              <span className="font-bold text-primary-teal">SOLCLOCK</span>
            </div>
            <div className="text-center md:text-right text-text-secondary text-sm">
              <p>SolClock © 2025 | Solana Network Analytics Dashboard</p>
              <p className="mt-1">Powered by Solana Blockchain</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}