# Switching Between Mock and Real Solana Data

SolClock supports two data modes: **Mock Data** (for development/testing) and **Real Data** (from Solana blockchain).

## Quick Switch

Change one environment variable in `/workspace/solclock/backend/.env`:

```bash
# Mock Data Mode (Default)
USE_REAL_DATA=false

# Real Data Mode
USE_REAL_DATA=true
```

Restart the backend:
```bash
cd backend
npm run dev
```

## Understanding Data Modes

### Mock Data Mode (`USE_REAL_DATA=false`)

**✅ Best for:**
- Local development
- Testing features
- Demo presentations
- When you don't have API keys

**What you get:**
- Realistic Solana network patterns
- 50 meme tokens with hourly activity
- Time-of-day activity variations (higher during US trading hours)
- Random whale activity spikes
- Full 24-hour historical data

**Limitations:**
- Not real-time
- Data doesn't reflect actual market conditions

### Real Data Mode (`USE_REAL_DATA=true`)

**✅ Best for:**
- Production deployment
- Live trading analysis
- Real market monitoring

**What you get:**
- Real Solana network statistics from blockchain
- Actual block production and transaction counts
- Real token supply and transaction signatures
- Current network state

**Limitations with free Solana RPC:**
- Limited historical data (only recent)
- Rate limiting (5 requests/second)
- Hourly token stats still use approximations
- No volume/liquidity data (requires indexer)

## Configuration Options

### Basic Configuration (Free)

```bash
# .env
USE_REAL_DATA=true
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
RPC_RATE_LIMIT=5
```

**Capabilities:**
- ✅ Real network stats (transactions, blocks)
- ✅ Token supply information
- ✅ Recent transaction signatures
- ⚠️ Limited historical data
- ⚠️ No volume/liquidity tracking

### Advanced Configuration (Helius)

For production-grade data with full features:

1. **Sign up for [Helius](https://helius.dev)**
   - Free tier: 100k credits/month
   - Pro tier: $99/month (1M credits)

2. **Update configuration:**
```bash
# .env
USE_REAL_DATA=true
SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
RPC_RATE_LIMIT=10
```

3. **Capabilities:**
   - ✅ All basic features
   - ✅ Enhanced WebSocket streams
   - ✅ Historical transaction data
   - ✅ Better rate limits
   - ✅ More reliable uptime

### Enterprise Configuration (Solscan Pro)

For comprehensive meme coin analytics:

1. **Sign up for [Solscan Pro](https://pro.solscan.io)**
   - Pricing: Contact sales

2. **Integration required** (code changes needed):
   - Implement Solscan API client
   - Add volume tracking
   - Add liquidity pool monitoring
   - Add holder analytics

3. **Capabilities:**
   - ✅ All Helius features
   - ✅ DEX volume tracking
   - ✅ Liquidity monitoring
   - ✅ Holder growth metrics
   - ✅ Social sentiment scores

## Hybrid Mode (Recommended for Production)

The system automatically uses hybrid mode:

```
Network Stats → Real from Solana RPC
Token Supply → Real from blockchain
Hourly History → Mock (fallback for missing data)
Volume/Liquidity → Mock (requires Solscan/Helius subscription)
```

This provides:
- Real-time network monitoring
- Stable performance
- No API subscription required
- Graceful degradation

## Testing Your Setup

### 1. Check Health Endpoint

```bash
curl http://localhost:4000/health
```

**Mock Mode Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "cache": "connected",
    "dataSource": "mock",
    "solanaRpc": { "status": "not_used" }
  }
}
```

**Real Mode Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "cache": "connected",
    "dataSource": "real",
    "solanaRpc": {
      "healthy": true,
      "version": "1.17.15",
      "currentSlot": 245678901,
      "endpoint": "https://api.mainnet-beta.solana.com"
    }
  }
}
```

### 2. Generate Data

```bash
cd backend
npm run generate-mock
```

**Output (Mock Mode):**
```
Data Source Mode: Using mock data generator
Generated network stats for 24 hours
Generated token stats for 50 tokens over 24 hours
```

**Output (Real Mode):**
```
Data Source Mode: Fetching data from Solana RPC
Health status: { healthy: true, version: '1.17.15' }
Fetching real network stats from Solana RPC...
Stored network stats for 6 hours
Fetching real token stats from Solana RPC...
```

### 3. Check Data Quality

Visit dashboard: `http://localhost:3000`

**Mock Mode:**
- Network pulse shows smooth patterns
- Peak hours during 14:00-22:00 UTC
- Random spikes for whale activity

**Real Mode:**
- Network pulse reflects actual Solana activity
- Data matches Solscan/Solana Explorer
- May have gaps for hours without enough samples

## Troubleshooting

### "RPC request failed: 429 Too Many Requests"

**Solution:**
```bash
# Reduce rate limit
RPC_RATE_LIMIT=2
```

### "No performance samples available"

**Solution:**
- Check Solana RPC endpoint is accessible
- Verify network connectivity
- Try alternative RPC endpoint
- Fallback to mock mode temporarily

### "Data looks incorrect/unusual"

**Checklist:**
1. Verify `USE_REAL_DATA` setting
2. Check logs: `tail -f backend/logs/combined.log`
3. Test health endpoint
4. Clear Redis cache: `redis-cli FLUSHALL`
5. Regenerate data: `npm run generate-mock`

### "Token stats are all zero"

This is expected with free Solana RPC because:
- Volume data requires DEX monitoring (needs Helius/Solscan)
- Liquidity tracking requires pool indexing
- Historical hourly data requires time-series database

**Options:**
1. Keep mock data for token stats
2. Upgrade to Helius/Solscan subscription
3. Build custom indexer

## Migration Path

### Phase 1: Start with Mock (Development)
```bash
USE_REAL_DATA=false
```
- Build features
- Test UI/UX
- Demo to stakeholders

### Phase 2: Add Real Network Data (Beta)
```bash
USE_REAL_DATA=true
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```
- Monitor real Solana network
- Keep mock data for tokens
- Verify accuracy

### Phase 3: Full Production (Subscription)
```bash
USE_REAL_DATA=true
SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```
- Real-time everything
- Historical data available
- Production-ready

### Phase 4: Enterprise Features (Custom)
- Integrate Solscan Pro API
- Add DEX volume tracking
- Implement holder analytics
- Build social sentiment tracking

## Performance Comparison

| Feature | Mock Mode | Real Mode (Free RPC) | Real Mode (Helius) |
|---------|-----------|---------------------|-------------------|
| Network Stats | ✅ Fast | ✅ Real-time | ✅ Real-time |
| Token Supply | ❌ Fake | ✅ Real | ✅ Real |
| Historical Data | ✅ Full 24h | ⚠️ Limited | ✅ Full |
| Volume Tracking | ✅ Mock | ❌ Not available | ✅ Real |
| Rate Limits | ∞ Unlimited | 5 req/s | 10-100 req/s |
| Cost | Free | Free | $0-99/month |
| Reliability | 100% | ~95% | ~99.9% |

## Best Practices

1. **Development:** Always use mock mode
2. **Staging:** Use real mode with free RPC
3. **Production:** Use Helius or Solscan subscription
4. **Monitoring:** Set up CloudWatch alarms for RPC failures
5. **Fallback:** Implement graceful degradation to mock data
6. **Caching:** Keep Redis cache enabled (5-min TTL)

## Environment Variables Reference

```bash
# Data Source Control
USE_REAL_DATA=false              # false = mock, true = real

# Solana RPC Configuration
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
RPC_RATE_LIMIT=5                 # Requests per second

# Alternative Endpoints
# Free public: https://api.mainnet-beta.solana.com
# Helius: https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
# QuickNode: https://YOUR_ENDPOINT.quiknode.pro/YOUR_KEY
# Triton: https://YOUR_ENDPOINT.rpcpool.com/YOUR_KEY

# Logging (helps debug RPC issues)
LOG_LEVEL=info                   # debug, info, warn, error
```

## Getting Help

- Check logs: `backend/logs/combined.log`
- Test health: `curl http://localhost:4000/health`
- Verify config: `cat backend/.env`
- Review docs:
  - [Solana RPC Documentation](https://docs.solana.com/api)
  - [Helius Documentation](https://docs.helius.dev)
  - [Solscan API Docs](https://docs.solscan.io)

---

**Questions?** Check main README or deployment guides.
