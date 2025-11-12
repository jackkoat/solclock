# SolClock - Getting Your Solscan API Key

## Why You Need a Solscan API Key

To enable real-time Solana blockchain data in SolClock, you need a Solscan API key. This allows the dashboard to fetch:
- Live network statistics (blocks, transactions, compute units)
- Real trending Solana tokens with actual trading volumes
- Whale activity monitoring (transactions >$10k)
- Accurate holder counts and price data

## Step-by-Step Guide

### 1. Visit Solscan Pro API

Go to: **https://pro-api.solscan.io/**

### 2. Sign Up for Free Account

- Click "Sign Up" or "Get API Key"
- Create an account with your email
- Verify your email address

### 3. Get Your API Key

After logging in:
- Go to your Dashboard
- Find the "API Keys" section
- Copy your API key (it looks like: `eyJhbGc...`)

### 4. Free Tier Limits

The free tier includes:
- **10M Credit Units per month**
- **1000 requests per 60 seconds**
- Full API access
- **Cost: $0/month**

This is more than enough for SolClock's needs (estimated 5.2M C.U/month).

## Configure API Key

### Option A: Vercel Deployment (Production)

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Navigate to "Environment Variables"
4. Click "Add"
5. Set:
   - **Key**: `SOLSCAN_API_KEY`
   - **Value**: Your API key from Solscan
   - **Environment**: Production (or all environments)
6. Click "Save"
7. Redeploy your application

### Option B: Local Development

1. Open or create `.env.local` in your project root:
```bash
SOLSCAN_API_KEY=your_api_key_here
```

2. Restart your development server:
```bash
npm run dev
```

## Verify Configuration

After adding the API key, check if it's working:

```bash
# Check status
curl https://your-app.vercel.app/api/status | jq .
```

Expected response:
```json
{
  "success": true,
  "configuration": {
    "solscanApiKey": "configured",
    "supabaseUrl": "configured",
    "supabaseServiceKey": "configured"
  },
  "dataSource": "real-time (solscan)",
  "status": "ready"
}
```

## Initialize with Real Data

Once configured, load real Solana blockchain data:

```bash
curl -X POST https://your-app.vercel.app/api/init \
  -H "Content-Type: application/json" \
  -d '{"useRealData": true}'
```

## Test Real-Time Data

Visit your dashboard and verify:
- Network stats show real Solana data
- Token rankings reflect actual trading volumes
- Whale activity displays real transactions
- Data updates automatically

## Troubleshooting

### "API key not configured" error

**Solution**: 
- Double-check environment variable name: `SOLSCAN_API_KEY`
- Verify no extra spaces in the API key
- Redeploy after adding environment variable

### Rate limit errors

**Solution**:
- Free tier allows 1000 requests/60s
- SolClock uses caching to stay under limits
- Check usage: `GET /api/status`

### Old data showing

**Solution**:
- Manually refresh: `POST /api/refresh`
- Set up automatic refresh (see REALTIME_DATA_INTEGRATION.md)

## Upgrade Options (If Needed)

If you exceed free tier limits:

**Basic Plan**: $99/month
- 50M Credit Units/month
- Higher rate limits
- Priority support

**Pro Plan**: $499/month
- 500M Credit Units/month
- Maximum rate limits
- Dedicated support

**Note**: Free tier is sufficient for most use cases.

## Security Best Practices

1. **Never commit API keys to Git**
   - Keep in environment variables only
   - Add `.env.local` to `.gitignore`

2. **Use different keys for dev/prod**
   - Create separate API keys for testing
   - Easier to revoke if compromised

3. **Monitor usage**
   - Check `/api/status` regularly
   - Watch for unusual API call patterns

4. **Rotate keys periodically**
   - Generate new keys every 3-6 months
   - Update environment variables

## Support

- **Solscan Documentation**: https://docs.solscan.io/
- **Solscan API Reference**: https://pro-api.solscan.io/pro-api-docs/v2.0
- **Get Help**: support@solscan.io

## What Happens Without API Key?

Without a Solscan API key:
- SolClock continues to work
- Uses mock data instead of real blockchain data
- All features remain functional
- No errors or crashes

To enable real-time data, simply add the API key and redeploy.
