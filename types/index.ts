export interface Token {
  token_address: string;
  symbol: string;
  name: string;
  logo_url?: string;
  created_at?: string;
  last_updated?: string;
}

export interface TokenHourlyStat {
  id?: number;
  token_address: string;
  hour: string;
  tx_count: number;
  tx_volume_usd: number;
  unique_buyers: number;
  holders: number;
  liquidity_usd: number;
}

export interface NetworkHourlyStat {
  hour: string;
  total_transactions: number;
  total_blocks: number;
  unique_wallets: number;
  avg_cu_per_block: number;
}

export interface TokenRanking {
  ranking_time: string;
  rank: number;
  token_address: string;
  score: number;
  reason?: Record<string, any>;
}

export interface WatchlistItem {
  id: number;
  user_id: string;
  token_address: string;
  created_at: string;
}

export interface MemeToken {
  rank: number;
  token_address: string;
  symbol: string;
  name: string;
  logo_url?: string;
  volume_24h_usd: number;
  unique_buyers_24h: number;
  holders: number;
  holders_growth: number;
  liquidity_usd: number;
  score: number;
  price_change_24h?: number;
}

export interface NetworkPulseData {
  hourly_stats: Array<{
    hour: string;
    total_transactions: number;
    total_blocks: number;
    unique_wallets: number;
    avg_cu_per_block: number;
  }>;
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

export interface TokenClockData {
  token_address: string;
  interval?: string;
  hourly_data: Array<{
    hour: string;
    hour_label: string;
    tx_count: number;
    tx_volume_usd: number;
    unique_buyers: number;
  }>;
  peak_hour: string;
  total_volume_24h: number;
  total_transactions_24h: number;
  total_unique_buyers_24h: number;
  data_source?: string;
  is_fallback?: boolean;
}

export interface TokenDetails {
  token: {
    address: string;
    symbol: string;
    name: string;
    logo_url?: string;
  };
  metrics: {
    volume_24h_usd: number;
    unique_buyers_24h: number;
    holders: number;
    liquidity_usd: number;
    total_transactions_24h: number;
  };
  whale_activity: Array<{
    type: 'buy' | 'sell';
    amount_usd: number;
    timestamp: string;
    wallet: string;
  }>;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

// Multi-API Service Types
export interface TokenData {
  symbol: string;
  name: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
  marketCap: number;
  priceUsd: number;
  isFallback: boolean;
}

export interface TokenMetadata {
  id: string;
  symbol: string;
  name: string;
  description: string;
  image: string;
  links: {
    website: string;
    twitter: string;
    discord: string;
    telegram: string;
  };
  market_data: {
    current_price: number;
    market_cap: number;
    volume_24h: number;
    price_change_24h: number;
  };
  isFallback: boolean;
}

export interface NetworkStats {
  timestamp: string;
  transactions_last_hour: number;
  blocks_last_hour: number;
  estimated_tps: number;
  avg_cu_per_block: number;
  unique_wallets: number;
  isFallback: boolean;
}

export interface TrendingToken {
  token_address: string;
  symbol: string;
  name: string;
  price: number;
  volume_24h: number;
  price_change_24h: number;
  liquidity: number;
  tx_count_24h: number;
  score: number;
  data_source: string;
  is_fallback: boolean;
}

export interface ChartDataPoint {
  timestamp: string;
  volume: number;
  tx_count: number;
  unique_buyers: number;
}

export interface TransactionVolumePoint {
  timestamp: string;
  total_transactions: number;
  total_volume: number;
  unique_wallets: number;
  avg_transaction_size: number;
  interval: string;
}
