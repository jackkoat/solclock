-- SolClock Supabase Database Schema
-- Based on current TypeScript interfaces

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 1. Tokens table - Basic token information
CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) UNIQUE NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Token Hourly Statistics - Time series data
CREATE TABLE token_hourly_stats (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) NOT NULL REFERENCES tokens(token_address) ON DELETE CASCADE,
    hour TIMESTAMPTZ NOT NULL,
    tx_count INTEGER DEFAULT 0,
    tx_volume_usd DECIMAL(20,2) DEFAULT 0,
    unique_buyers INTEGER DEFAULT 0,
    holders INTEGER DEFAULT 0,
    liquidity_usd DECIMAL(20,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(token_address, hour)
);

-- 3. Network Hourly Statistics - Network-wide metrics
CREATE TABLE network_hourly_stats (
    hour TIMESTAMPTZ PRIMARY KEY,
    total_transactions BIGINT DEFAULT 0,
    total_blocks INTEGER DEFAULT 0,
    unique_wallets INTEGER DEFAULT 0,
    avg_cu_per_block DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Token Rankings - Ranking data over time
CREATE TABLE token_rankings (
    id SERIAL PRIMARY KEY,
    ranking_time TIMESTAMPTZ NOT NULL,
    rank INTEGER NOT NULL,
    token_address VARCHAR(44) NOT NULL REFERENCES tokens(token_address) ON DELETE CASCADE,
    score DECIMAL(10,4) NOT NULL,
    reason JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ranking_time, token_address)
);

-- 5. Alerts - Alert management system
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    severity VARCHAR(10) CHECK (severity IN ('info', 'warning', 'error')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id)
);

-- 6. Watchlists - User saved tokens
CREATE TABLE watchlists (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_address VARCHAR(44) NOT NULL REFERENCES tokens(token_address) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token_address)
);

-- 7. Token Details Cache - For faster loading
CREATE TABLE token_details_cache (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) UNIQUE NOT NULL REFERENCES tokens(token_address) ON DELETE CASCADE,
    volume_24h_usd DECIMAL(20,2) DEFAULT 0,
    unique_buyers_24h INTEGER DEFAULT 0,
    holders INTEGER DEFAULT 0,
    liquidity_usd DECIMAL(20,2) DEFAULT 0,
    total_transactions_24h INTEGER DEFAULT 0,
    price_change_24h DECIMAL(10,4),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Whale Activity - Large transactions tracking
CREATE TABLE whale_activity (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(44) NOT NULL REFERENCES tokens(token_address) ON DELETE CASCADE,
    activity_type VARCHAR(4) CHECK (activity_type IN ('buy', 'sell')) NOT NULL,
    amount_usd DECIMAL(20,2) NOT NULL,
    wallet_address VARCHAR(44) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tokens_address ON tokens(token_address);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);
CREATE INDEX idx_token_hourly_stats_token_hour ON token_hourly_stats(token_address, hour);
CREATE INDEX idx_token_hourly_stats_hour ON token_hourly_stats(hour);
CREATE INDEX idx_network_hourly_stats_hour ON network_hourly_stats(hour);
CREATE INDEX idx_token_rankings_time_rank ON token_rankings(ranking_time, rank);
CREATE INDEX idx_token_rankings_token ON token_rankings(token_address);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_watchlists_user ON watchlists(user_id);
CREATE INDEX idx_watchlists_token ON watchlists(token_address);
CREATE INDEX idx_token_details_cache_volume ON token_details_cache(volume_24h_usd DESC);
CREATE INDEX idx_whale_activity_token ON whale_activity(token_address);
CREATE INDEX idx_whale_activity_timestamp ON whale_activity(timestamp DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_hourly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_hourly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_details_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE whale_activity ENABLE ROW LEVEL SECURITY;

-- Public read access for analytics data
CREATE POLICY "Public read access for tokens" ON tokens FOR SELECT USING (true);
CREATE POLICY "Public read access for token_hourly_stats" ON token_hourly_stats FOR SELECT USING (true);
CREATE POLICY "Public read access for network_hourly_stats" ON network_hourly_stats FOR SELECT USING (true);
CREATE POLICY "Public read access for token_rankings" ON token_rankings FOR SELECT USING (true);
CREATE POLICY "Public read access for token_details_cache" ON token_details_cache FOR SELECT USING (true);
CREATE POLICY "Public read access for whale_activity" ON whale_activity FOR SELECT USING (true);

-- User-specific access for alerts and watchlists
CREATE POLICY "Users can view their own alerts" ON alerts FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own alerts" ON alerts FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own alerts" ON alerts FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own watchlists" ON watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own watchlists" ON watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlists" ON watchlists FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tokens_last_updated BEFORE UPDATE ON tokens
    FOR EACH ROW EXECUTE FUNCTION update_last_updated();

CREATE TRIGGER update_token_details_cache_last_updated BEFORE UPDATE ON token_details_cache
    FOR EACH ROW EXECUTE FUNCTION update_last_updated();