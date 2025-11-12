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
