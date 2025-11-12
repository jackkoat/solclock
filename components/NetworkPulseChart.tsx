'use client';

import type { NetworkPulseData } from '@/types';

interface Props {
  data: NetworkPulseData | null;
}

export default function NetworkPulseChart({ data }: Props) {
  if (!data) {
    return (
      <div className="h-80 flex items-center justify-center text-text-secondary">
        No network data available
      </div>
    );
  }

  const latest = data.hourly_stats[data.hourly_stats.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="text-text-secondary text-sm mb-1">24h Transactions</div>
          <div className="text-2xl font-bold text-text-primary">
            {(data.summary.total_transactions_24h / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="text-text-secondary text-sm mb-1">24h Blocks</div>
          <div className="text-2xl font-bold text-text-primary">
            {(data.summary.total_blocks_24h / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="p-4 bg-bg-secondary rounded-lg">
          <div className="text-text-secondary text-sm mb-1">Avg Active Wallets</div>
          <div className="text-2xl font-bold text-text-primary">
            {(data.summary.avg_unique_wallets / 1000).toFixed(1)}K
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-bg-secondary rounded-lg">
        <div className="text-text-secondary text-sm mb-2">Latest Hour Metrics</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-text-tertiary">Transactions</div>
            <div className="text-lg font-semibold text-text-primary">
              {latest?.total_transactions.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-tertiary">Blocks</div>
            <div className="text-lg font-semibold text-text-primary">
              {latest?.total_blocks.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-tertiary">Wallets</div>
            <div className="text-lg font-semibold text-text-primary">
              {latest?.unique_wallets.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-tertiary">Avg CU/Block</div>
            <div className="text-lg font-semibold text-text-primary">
              {latest?.avg_cu_per_block.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-text-tertiary text-center">
        Peak hour: {new Date(data.peak_hour.hour).toLocaleString()} with {(data.peak_hour.total_transactions / 1000000).toFixed(2)}M transactions
      </div>
    </div>
  );
}
