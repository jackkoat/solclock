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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card/95 backdrop-blur-xl rounded-xl border border-border-light/50 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light/50 bg-gradient-to-r from-bg-card/50 to-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-blue/20 to-primary-purple/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">AI Analytics</h2>
              <p className="text-sm text-text-secondary">
                {token.symbol} - {token.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-bg-secondary/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Token Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 rounded-lg p-4 border border-primary-blue/20">
              <div className="text-sm text-text-secondary mb-1">24h Volume</div>
              <div className="text-lg font-bold text-primary-blue">
                ${token.volume_24h_usd.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent-green/10 to-accent-green/5 rounded-lg p-4 border border-accent-green/20">
              <div className="text-sm text-text-secondary mb-1">Buyers</div>
              <div className="text-lg font-bold text-accent-green">
                {token.unique_buyers_24h.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent-orange/10 to-accent-orange/5 rounded-lg p-4 border border-accent-orange/20">
              <div className="text-sm text-text-secondary mb-1">Holders</div>
              <div className="text-lg font-bold text-accent-orange">
                {token.holders.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 rounded-lg p-4 border border-primary-purple/20">
              <div className="text-sm text-text-secondary mb-1">Score</div>
              <div className="text-lg font-bold text-primary-purple">
                {token.score}/100
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-purple" />
              <h3 className="text-lg font-semibold text-text-primary">AI Analysis</h3>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12 bg-bg-secondary/50 rounded-lg border border-border-light/30">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating AI analysis...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="text-red-400 font-medium mb-1">Analysis Error</div>
                <div className="text-red-300 text-sm">{error}</div>
              </div>
            )}

            {analytics && (
              <div className="bg-gradient-to-br from-bg-secondary/80 to-bg-card/60 rounded-lg p-6 border border-border-light/30 backdrop-blur-sm">
                {/* Summary */}
                <div className="mb-4 p-4 bg-primary-purple/10 rounded-lg border border-primary-purple/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      analytics.analysis.confidence === 'high' ? 'bg-accent-green' :
                      analytics.analysis.confidence === 'medium' ? 'bg-accent-orange' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                      {analytics.analysis.confidence} Confidence
                    </span>
                    {analytics.analysis.actionable && (
                      <span className="text-xs bg-accent-green/20 text-accent-green px-2 py-1 rounded">
                        Actionable
                      </span>
                    )}
                  </div>
                  <p className="text-text-primary font-semibold italic">
                    "{analytics.analysis.summary}"
                  </p>
                </div>

                {/* Detailed Analysis */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-text-primary whitespace-pre-wrap leading-relaxed text-sm">
                    {analytics.analysis.insight}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border-light/50">
                  <div className="text-xs text-text-secondary">
                    Generated at: {new Date(analytics.generated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border-light">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            Close
          </button>
          {!analytics && !loading && (
            <button
              onClick={generateAnalytics}
              className="btn-primary"
            >
              Generate Analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}