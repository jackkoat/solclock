'use client';

import { useState } from 'react';
import { X, Brain, Loader2 } from 'lucide-react';
import type { MemeToken } from '@/types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: MemeToken | null;
}

interface AnalyticsData {
  token: MemeToken;
  analysis: {
    insight: string;
    confidence: 'high' | 'medium' | 'low';
    summary: string;
    actionable: boolean;
  };
  generated_at: string;
}

export default function AnalyticsModal({ isOpen, onClose, token }: AnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalytics = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/token/${token.token_address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_address: token.token_address }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to generate analytics');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (token && !analytics) {
      generateAnalytics();
    }
  };

  const handleClose = () => {
    setAnalytics(null);
    setError(null);
    onClose();
  };

  if (!isOpen || !token) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Full Screen Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Container - Full Screen */}
      <div className="relative w-full h-full max-w-none mx-0 bg-bg-card/95 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-light/50 bg-gradient-to-r from-primary-blue/10 to-primary-purple/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-blue/20 to-primary-purple/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-blue" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-blue to-primary-purple bg-clip-text text-transparent">
                AI Analytics
              </h2>
              <p className="text-sm text-text-secondary">
                {token.symbol} - {token.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-bg-secondary/80 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Token Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-primary-blue/20 to-primary-blue/10 rounded-xl p-6 border border-primary-blue/30 backdrop-blur-sm">
              <div className="text-sm text-text-secondary mb-2">24h Volume</div>
              <div className="text-2xl font-bold text-primary-blue">
                ${token.volume_24h_usd.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent-green/20 to-accent-green/10 rounded-xl p-6 border border-accent-green/30 backdrop-blur-sm">
              <div className="text-sm text-text-secondary mb-2">Buyers</div>
              <div className="text-2xl font-bold text-accent-green">
                {token.unique_buyers_24h.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent-orange/20 to-accent-orange/10 rounded-xl p-6 border border-accent-orange/30 backdrop-blur-sm">
              <div className="text-sm text-text-secondary mb-2">Holders</div>
              <div className="text-2xl font-bold text-accent-orange">
                {token.holders.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-purple/20 to-primary-purple/10 rounded-xl p-6 border border-primary-purple/30 backdrop-blur-sm">
              <div className="text-sm text-text-secondary mb-2">Score</div>
              <div className="text-2xl font-bold text-primary-purple">
                {token.score}/100
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-primary-purple" />
              <h3 className="text-2xl font-bold text-text-primary">AI Analysis</h3>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16 bg-gradient-to-br from-bg-secondary/50 to-bg-card/30 rounded-xl border border-border-light/30 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-text-secondary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-lg">Generating AI analysis...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-red-400 font-medium mb-2 text-lg">Analysis Error</div>
                <div className="text-red-300 text-sm">{error}</div>
              </div>
            )}

            {analytics && (
              <div className="bg-gradient-to-br from-bg-secondary/60 to-bg-card/40 rounded-xl p-6 sm:p-8 border border-border-light/30 backdrop-blur-sm">
                {/* Summary */}
                <div className="mb-6 p-6 bg-gradient-to-r from-primary-purple/20 to-primary-blue/20 rounded-xl border border-primary-purple/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-4 h-4 rounded-full ${
                      analytics.analysis.confidence === 'high' ? 'bg-accent-green shadow-lg shadow-accent-green/50' :
                      analytics.analysis.confidence === 'medium' ? 'bg-accent-orange shadow-lg shadow-accent-orange/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                    }`}></div>
                    <span className="text-lg font-semibold text-text-primary uppercase tracking-wide">
                      {analytics.analysis.confidence} Confidence
                    </span>
                    {analytics.analysis.actionable && (
                      <span className="text-sm bg-accent-green/20 text-accent-green px-3 py-1 rounded-full border border-accent-green/30">
                        Actionable Signal
                      </span>
                    )}
                  </div>
                  <p className="text-text-primary font-bold text-lg italic leading-relaxed">
                    &quot;{analytics.analysis.summary}&quot;
                  </p>
                </div>

                {/* Detailed Analysis */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-text-primary whitespace-pre-wrap leading-relaxed text-base">
                    {analytics.analysis.insight}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border-light/50">
                  <div className="text-sm text-text-secondary">
                    Generated at: {new Date(analytics.generated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-4 sm:p-6 border-t border-border-light/50 bg-gradient-to-r from-bg-secondary/50 to-bg-card/30 backdrop-blur-sm">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors font-medium"
          >
            Close
          </button>
          {!analytics && !loading && (
            <button
              onClick={generateAnalytics}
              className="btn-primary px-6 py-3 text-lg"
            >
              Generate Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}