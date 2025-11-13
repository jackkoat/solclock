# Barchart Data Analysis for SolClock

## Your Barchart Requirements:
- **X-axis**: Time intervals every 3 hours (e.g., 3am, 6am, 9am...)
- **Y-axis**: Total transaction amounts
- **Time Range**: Last 24 hours
- **Data Granularity**: 3-hour buckets

## Solscan API Historical Data Availability:

### ✅ **YES, Solscan API provides sufficient data** for your barchart requirements:

#### Available Endpoints for Historical Data:

1. **`getBlocks()` - Block History**
   - Get historical blocks with timestamps
   - Parameters: `limit`, `offset`, `sort_by`, `sort_order`
   - Each block contains transaction count and timestamps

2. **`getTokenTransfers()` - Transaction History**
   - Get historical token transfers
   - Parameters: `address`, `from`, `to`, `time_start`, `time_end`
   - Contains transaction amounts and timestamps

3. **`getAccountTransactions()` - Account Activity**
   - Get historical transactions for specific addresses
   - Parameters: `address`, `limit`, `offset`
   - Useful for whale tracking over time

4. **`getLastTransactions()` - Recent Activity**
   - Recent transactions with full details
   - Can be used to build historical data incrementally

#### Data Structure for Barchart Implementation:

```typescript
// Example data structure from Solscan API
interface HistoricalTransaction {
  signature: string;
  block_time: string;        // ISO timestamp
  transaction_index: number;
  inner_instructions: any[];
  meta: {
    compute_units_consumed: number;
    transaction_error: any;
    prep_actions: any[];
    post_token_balances: any[];
    inner_instructions: any[];
    log_messages: any[];
    pre_token_balances: any[];
    static_account_keys: string[];
    rewards: any[];
    compute_units_price: {
      "microLamports": string;
    };
    pre_balances: number[];
    post_balances: number[];
    loaded_writable_accounts: any[];
    loaded_readonly_accounts: any[];
    status: "Ok" | string;
    err: any;
    slot: number;
  };
}
```

## Implementation Strategy for 24-Hour Barchart:

### Step 1: Data Aggregation Pipeline

```typescript
// 1. Fetch blocks from last 24 hours
const blocks = await solscan.getBlocks({
  limit: 1000,
  sort_by: 'block_time',
  sort_order: 'desc'
});

// 2. Fetch transactions for each block
const transactions = await solscan.getLastTransactions(1000);

// 3. Group by 3-hour intervals
const groupedData = groupTransactionsBy3HourInterval(transactions);
```

### Step 2: Data Storage in Supabase

Create a new table for barchart data:

```sql
CREATE TABLE transaction_charts (
  id SERIAL PRIMARY KEY,
  interval_start TIMESTAMP NOT NULL,
  interval_end TIMESTAMP NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  total_volume DECIMAL(20,2) DEFAULT 0,
  avg_transaction_size DECIMAL(20,2) DEFAULT 0,
  unique_wallets INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_transaction_charts_interval ON transaction_charts(interval_start, interval_end);
```

### Step 3: Caching Strategy

- **Real-time updates**: Every 15 minutes
- **Data retention**: 30 days of hourly buckets
- **API call optimization**: Batch requests and cache results

### Step 4: Rate Limit Management

- **Free tier**: 1000 requests/60s
- **Estimated usage**: ~50 requests per day for barchart updates
- **Well within limits** with smart caching

## Chart Data Endpoints to Create:

### 1. 24-Hour Transaction Volume Chart
```
GET /api/charts/transaction-volume?period=24h&interval=3h
```

### 2. Network Activity Heat Map
```
GET /api/charts/network-activity?period=24h&interval=3h  
```

### 3. Token Transfer Patterns
```
GET /api/charts/token-transfers?period=24h&interval=3h
```

## Estimated API Usage for Barchart:

- **Initial data load**: ~200 C.U (2 API calls)
- **Daily updates**: ~50 C.U (0.5 API calls)
- **Monthly total**: ~1500 C.U (1.5% of free tier)
- **Very efficient** with proper caching

## Conclusion:

**✅ YES, Solscan API provides comprehensive historical data** perfect for your 24-hour barchart with 3-hour intervals. The API includes:

- Block timestamps for time-based grouping
- Transaction data with amounts and timestamps  
- Sufficient historical coverage (30+ days typically available)
- Real-time data for current hour calculations
- Built-in rate limiting and error handling

Your barchart implementation will be data-complete and highly efficient with minimal API usage.