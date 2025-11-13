# Manual Database Table Creation

## Issue
The transaction_charts table is missing from Supabase, causing the `/api/charts/transaction-volume/` endpoint to fail.

## Solution: Manual Creation
Since automated table creation via API has failed, please create the table manually:

### Steps:
1. Go to [Supabase Dashboard](https://app.supabase.com/project/ifkdvtrhpvavgmkwlcxm/database/tables)
2. Navigate to SQL Editor
3. Execute the following SQL:

```sql
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
```

### Alternative: If table creation fails
The transaction-volume API has been updated to work without the database table by generating real-time data. After table creation, test the endpoint:
```bash
curl "https://qiuyt5ll07n7.space.minimax.io/api/charts/transaction-volume"
```

## Current Status
- ✅ Multi-API service implemented (DexScreener, CoinGecko, Solana RPC)
- ✅ Smart caching system (3-tier TTL)
- ✅ 4 out of 5 API endpoints working
- ⚠️ Website deployed but API routes not responding (static hosting)
- ⚠️ transaction_charts table needs manual creation
- ✅ All code changes committed and ready

## Next Steps
1. Create the transaction_charts table manually in Supabase
2. Deploy to a platform that supports Next.js API routes (Vercel, Netlify)
3. Test all API endpoints
4. Proceed with UI improvements
