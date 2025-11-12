# Solscan API Integration Setup Guide

## 🎯 Quick Start Summary

**Goal**: Replace mock data with real Solana blockchain data, especially the pulse feature
**Timeline**: Start with free tier, upgrade as needed
**Focus**: Real-time token data, network statistics, and whale activity

## 📋 Step-by-Step Setup

### Step 1: Create Solscan Account & Get API Key

1. **Create Account**: Go to [solscan.io](https://solscan.io) and create an account
2. **Access API Plans**: Navigate to "Resources" → "API Plans" 
3. **Choose Plan**: 
   - **Start with FREE** (10M C.U/month, 1000 requests/60s)
   - Upgrade later if needed
4. **Generate API Key**:
   - Go to "API Management" in your account
   - Click "Generate Key"
   - Copy the key (you'll need to store it securely)

**API Key Format**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)

### Step 2: Set Up Environment Variables

Add these to your Vercel environment variables:

```env
# Solscan API Configuration
SOLSCAN_API_KEY=your_generated_api_key_here
SOLSCAN_API_BASE_URL=https://pro-api.solscan.io

# Update frequency settings (in minutes)
PULSE_UPDATE_INTERVAL=1
TOKEN_DATA_UPDATE_INTERVAL=5
WHALE_MONITOR_INTERVAL=2
```

### Step 3: Key Endpoints for Your Use Case

Based on your current mock data, here are the essential Solscan endpoints:

#### **Network Pulse Data** (Replace `/api/network/pulse`)
```typescript
// Real network statistics
GET /v2.0/block/last           // Latest block info
GET /v2.0/block/transactions   // Block transactions
GET /v2.0/transaction/last     // Recent transactions
```

#### **Token Data** (Replace `/api/top-meme`)
```typescript
// Token rankings and trending
GET /v2.0/token/list          // All tokens
GET /v2.0/token/trending      // Trending tokens
GET /v2.0/token/price         // Token prices
GET /v2.0/token/meta          // Token metadata
```

#### **Whale Activity** (Replace whale_activity table)
```typescript
// Large transactions
GET /v2.0/account/transactions    // Transaction history
GET /v2.0/transaction/details     // Transaction details
```

#### **Network Statistics** (Replace `/api/network/stats`)
```typescript
// Network health
GET /v2.0/monitor/usage           // Network usage
GET /v2.0/block/detail            // Block details
```

### Step 4: API Rate Limits & Optimization

**Free Tier Limits**:
- 10,000,000 C.U/month
- 1,000 requests/60 seconds
- Each endpoint = 100 C.U

**Cost Calculation**:
- Pulse update (1/min): 1,440 calls/day × 100 C.U = 144,000 C.U/day
- Token data (5/min): 288 calls/day × 100 C.U = 28,800 C.U/day
- Total: ~173,000 C.U/day = ~5.2M C.U/month ✅ (within free limit)

### Step 5: Implementation Strategy

#### Phase 1: Start with Free Tier (This Week)
```typescript
// lib/solscanAPI.ts - Basic wrapper
class SolscanAPI {
  private apiKey: string;
  private baseURL = 'https://pro-api.solscan.io';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async getNetworkStats() {
    const response = await fetch(`${this.baseURL}/v2.0/block/last`, {
      headers: {
        'token': this.apiKey,
        'accept': 'application/json'
      }
    });
    return response.json();
  }
  
  async getTrendingTokens() {
    const response = await fetch(`${this.baseURL}/v2.0/token/trending`, {
      headers: {
        'token': this.apiKey,
        'accept': 'application/json'
      }
    });
    return response.json();
  }
}
```

#### Phase 2: Replace Mock Data Generator (Week 2)
```typescript
// lib/realDataService.ts
export class RealDataService {
  async initializeWithRealData() {
    // 1. Fetch trending tokens from Solscan
    const trendingTokens = await this.solscan.getTrendingTokens();
    
    // 2. Update tokens table with real data
    await this.updateTokensTable(trendingTokens);
    
    // 3. Fetch network stats for pulse
    const networkStats = await this.solscan.getNetworkStats();
    await this.updateNetworkStats(networkStats);
    
    // 4. Set up real-time monitoring
    this.startRealTimeMonitoring();
  }
}
```

### Step 6: Real-Time Data Pipeline

#### **Pulse Feature Enhancement**
```typescript
// Real-time pulse data (every 1 minute)
async function updateNetworkPulse() {
  const latestBlock = await solscanAPI.getLatestBlock();
  const recentTxs = await solscanAPI.getRecentTransactions(10);
  
  // Update network_hourly_stats table
  await supabase.from('network_hourly_stats').upsert({
    hour: new Date(),
    total_transactions: recentTxs.length,
    avg_cu_per_block: latestBlock.computeUnitsConsumed,
    // ... other metrics
  });
}
```

#### **Whale Activity Monitoring**
```typescript
// Monitor large transactions (every 2 minutes)
async function monitorWhaleActivity() {
  const largeTxs = await solscanAPI.getLargeTransactions({
    minAmount: 10000, // $10k threshold
    limit: 20
  });
  
  // Store in whale_activity table
  for (const tx of largeTxs) {
    await supabase.from('whale_activity').insert({
      token_address: tx.tokenAddress,
      activity_type: tx.type,
      amount_usd: tx.amountUSD,
      wallet_address: tx.fromAddress,
      timestamp: tx.blockTime
    });
  }
}
```

### Step 7: Error Handling & Fallback

```typescript
// Robust error handling
export class SolscanService {
  async fetchWithFallback(endpoint: string, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.solscanAPI.call(endpoint);
      } catch (error) {
        if (i === maxRetries - 1) {
          // Fallback to cached data
          return await this.getCachedData(endpoint);
        }
        await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  async getCachedData(endpoint: string) {
    // Return last known good data from Supabase
    return await supabase.from('api_cache')
      .select('*')
      .eq('endpoint', endpoint)
      .order('created_at', { ascending: false })
      .limit(1);
  }
}
```

## 🚀 Deployment Checklist

### Before Going Live:
- [ ] Create Solscan account
- [ ] Generate API key (start with free tier)
- [ ] Set environment variables in Vercel
- [ ] Test API key with sample requests
- [ ] Implement rate limiting
- [ ] Add error handling and fallbacks
- [ ] Set up monitoring for API usage

### Testing Your Integration:
```bash
# Test API key
curl -X GET 'https://pro-api.solscan.io/v2.0/block/last' \
  -H 'token: YOUR_API_KEY' \
  -H 'accept: application/json'

# Test your endpoint
curl https://your-app.vercel.app/api/network/stats
```

## 💡 Pro Tips

### **Free Tier Optimization**:
- Cache data in Supabase to reduce API calls
- Update pulse data every 2-3 minutes instead of 1
- Batch token updates (every 10 minutes)
- Monitor your C.U usage in Solscan dashboard

### **When to Upgrade**:
- If you hit 80% of free tier limit consistently
- Need faster update frequencies
- Require more endpoints/features
- Current limits: ~5M C.U/month usage

### **Cost Management**:
- **Free**: Perfect for development and testing
- **Level 2 ($199/month)**: 150M C.U - suitable for production
- **Level 3 ($399/month)**: 500M C.U - high-traffic applications

## 📊 Expected Data Flow

```
Solscan API → Data Transform → Supabase Cache → Frontend
     ↓              ↓              ↓             ↓
Real-time    Match Schema    Fast Queries   Live UI
Blockchain   Our Tables      (< 100ms)      Updates
```

## ⚠️ Important Notes

1. **API Migration**: Solscan is migrating from V1.0 to V2.0 (December 1st)
2. **Attribution Required**: Free tier requires attribution to Solscan
3. **Rate Limiting**: Implement client-side rate limiting to avoid 429 errors
4. **Backup Data**: Always maintain fallback to cached/mock data
5. **Monitoring**: Track API usage and costs in Solscan dashboard

## 🎯 Next Steps

1. **Set up your Solscan account and get the free API key**
2. **I'll help you implement the integration code**
3. **Test with real Solana blockchain data**
4. **Monitor usage and upgrade plan as needed**

Ready to start? Get your Solscan account created and API key, then I can help you implement the real-time data integration!