/**
 * Type Definitions for SolClock
 */

export interface HourlyNetworkStat {
  hour: string;
  total_transactions: number;
  total_blocks: number;
  unique_wallets: number;
  avg_cu_per_block: number;
}

export interface NetworkPulseData {
  hourly_stats: HourlyNetworkStat[];
  peak_hour: {
    hour: string;
    total_transactions: number;
  };
  summary: {
    total_transactions_24h: number;
    total_blocks_24h: number;
    avg_unique_wallets: number;
  };
}

export interface TokenMetrics {
  volume_24h_usd: number;
  unique_buyers_24h: number;
  holders: number;
  holders_growth_24h: number;
  liquidity_usd: number;
  social_score: number;
}

export interface MemeToken {
  rank: number;
  token_address: string;
  symbol: string;
  name: string;
  logo_url: string;
  score: number;
  metrics: TokenMetrics;
  peak_hour: string | null;
  meme_clock: number[];
}

export interface TokenDetails {
  token: {
    address: string;
    symbol: string;
    name: string;
    logo_url: string;
  };
  metrics: {
    volume_24h_usd: number;
    unique_buyers_24h: number;
    holders: number;
    liquidity_usd: number;
    total_transactions_24h: number;
  };
  whale_activity: WhaleActivity[];
}

export interface WhaleActivity {
  type: 'buy' | 'sell';
  amount_usd: number;
  timestamp: string;
  wallet: string;
}

export interface Alert {
  type: string;
  message: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface WatchlistItem {
  id: number;
  token_address: string;
  symbol: string;
  name: string;
  logo_url: string;
  volume_24h_usd: number;
  holders: number;
  added_at: string;
}

export interface HourlyData {
  hour: string;
  hour_label: string;
  tx_count: number;
  tx_volume_usd: number;
  unique_buyers: number;
}

export interface TokenClockData {
  token_address: string;
  hourly_data: HourlyData[];
  peak_hour: string;
  total_volume_24h: number;
  total_transactions_24h: number;
  total_unique_buyers_24h: number;
}
