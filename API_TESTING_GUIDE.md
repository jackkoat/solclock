# SolClock API Testing Guide

## Quick Fix for HTTP 308 Redirects

The HTTP 308 redirects you're seeing are due to incorrect endpoint usage. Here are the correct commands:

### ✅ CORRECT Commands:

```bash
# Test configuration (GET request, note the trailing slash)
curl https://solclock-omega.vercel.app/api/status/

# Initialize with REAL data (POST with JSON body)
curl -X POST https://solclock-omega.vercel.app/api/init \
  -H "Content-Type: application/json" \
  -d '{"useRealData": true}'

# Refresh real-time data (POST)
curl -X POST https://solclock-omega.vercel.app/api/refresh
```

### ❌ INCORRECT Commands (causing 308 redirects):

```bash
# No trailing slash
curl https://solclock-omega.vercel.app/api/init

# Using GET instead of POST
curl https://solclock-omega.vercel.app/api/init
```

## Testing the Integration

### Step 1: Check Configuration
```bash
curl https://solclock-omega.vercel.app/api/status/
```

**Expected Response:**
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

If `solscanApiKey` shows "missing", double-check your Vercel environment variables.

### Step 2: Initialize Real Data
```bash
curl -X POST https://solclock-omega.vercel.app/api/init \
  -H "Content-Type: application/json" \
  -d '{"useRealData": true}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Real Solana blockchain data loaded successfully",
  "dataSource": "solscan-api"
}
```

### Step 3: Test Network Data
```bash
curl https://solclock-omega.vercel.app/api/network/stats/
```

This should now return real Solana blockchain statistics instead of mock data.

## Vercel Environment Variables Checklist

Ensure these are set in your Vercel dashboard:

- `SOLSCAN_API_KEY` = your_api_key_here
- `NEXT_PUBLIC_SUPABASE_URL` = https://ifkdvtrhpvavgmkwlcxm.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## Common Issues & Solutions

1. **308 Redirect**: Use POST method and include trailing slash
2. **Mock data still showing**: Check environment variables are properly set
3. **API key not found**: Verify SOLSCAN_API_KEY is in Vercel environment variables
4. **Database errors**: Check Supabase credentials are correct