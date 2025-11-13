-- Create transaction charts table for barchart data
CREATE TABLE IF NOT EXISTS transaction_charts (
  id SERIAL PRIMARY KEY,
  interval_start TIMESTAMP NOT NULL,
  interval_end TIMESTAMP NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  total_volume DECIMAL(20,2) DEFAULT 0,
  avg_transaction_size DECIMAL(20,2) DEFAULT 0,
  unique_wallets INTEGER DEFAULT 0,
  data_source VARCHAR(50) DEFAULT 'solscan-api',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_transaction_charts_interval ON transaction_charts(interval_start, interval_end);
CREATE INDEX IF NOT EXISTS idx_transaction_charts_created ON transaction_charts(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_transaction_charts_updated_at ON transaction_charts;
CREATE TRIGGER update_transaction_charts_updated_at
    BEFORE UPDATE ON transaction_charts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();