# SolClock - Render.com Deployment Guide

This guide walks you through deploying SolClock to Render.com with PostgreSQL, Redis, and Node.js backend.

## Prerequisites

1. [Render.com account](https://render.com) (free tier available)
2. GitHub repository with your SolClock code
3. Basic understanding of environment variables

## Architecture on Render

```
Frontend (Static Site)  ←→  Backend (Web Service)  ←→  PostgreSQL  + Redis
```

## Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → New → PostgreSQL
2. Configure:
   - **Name:** `solclock-db`
   - **Database:** `solclock`
   - **User:** `solclock_user`
   - **Region:** Choose closest to your users
   - **Instance Type:** Free tier (for testing) or Starter ($7/month)
3. Click **Create Database**
4. Save the **Internal Database URL** (starts with `postgres://`)

## Step 2: Create Redis Instance

1. Dashboard → New → Redis
2. Configure:
   - **Name:** `solclock-redis`
   - **Region:** Same as PostgreSQL
   - **Plan:** Free (25MB) or Starter ($10/month)
3. Click **Create Redis**
4. Save the **Internal Redis URL** (starts with `redis://`)

## Step 3: Deploy Backend

1. Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name:** `solclock-backend`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter for production)

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

```bash
# Server
PORT=4000
NODE_ENV=production

# Database (use Internal Database URL from Step 1)
DATABASE_URL=<YOUR_INTERNAL_POSTGRES_URL>

# Redis (use Internal Redis URL from Step 2)
REDIS_URL=<YOUR_INTERNAL_REDIS_URL>

# Cache
CACHE_TTL_SECONDS=300

# CORS (will update after frontend deployment)
CORS_ORIGIN=*

# Solana RPC
USE_REAL_DATA=true
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
RPC_RATE_LIMIT=5

# Logging
LOG_LEVEL=info
```

5. Click **Create Web Service**

6. **Post-Deployment:** After service is running, run these commands in the Shell tab:
```bash
# Initialize database
npm run init-db

# Generate initial data
npm run generate-mock
```

## Step 4: Deploy Frontend

1. Dashboard → New → Static Site
2. Connect your GitHub repository
3. Configure:
   - **Name:** `solclock-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `out` (for Next.js static export)

4. **Environment Variables**:
```bash
NEXT_PUBLIC_API_URL=<YOUR_BACKEND_URL>
```
Replace `<YOUR_BACKEND_URL>` with the URL from Step 3 (e.g., `https://solclock-backend.onrender.com`)

5. Click **Create Static Site**

## Step 5: Update CORS

1. Go back to Backend service → Environment
2. Update `CORS_ORIGIN` with your frontend URL:
```bash
CORS_ORIGIN=https://solclock-frontend.onrender.com
```
3. Save changes (service will auto-redeploy)

## Step 6: Setup Cron Job (Optional)

To keep data fresh, set up a cron job to run data aggregation:

1. Backend service → Settings → Add Cron Job
2. Configure:
   - **Name:** `Data Aggregation`
   - **Command:** `npm run generate-mock`
   - **Schedule:** `0 * * * *` (every hour)

## Switching from Mock to Real Data

Your backend is already configured with `USE_REAL_DATA=true`. The system will:

- ✅ Fetch real network stats from Solana RPC
- ✅ Get basic token info from blockchain
- ⚠️ Use mock data for historical hourly stats (requires Helius/Solscan subscription)

### To Use Full Real Data (Helius/Solscan):

1. Sign up for [Helius](https://helius.dev) or [Solscan Pro](https://pro.solscan.io)
2. Get API key
3. Update `SOLANA_RPC_ENDPOINT`:
```bash
# Helius
SOLANA_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Or use Solscan API (requires code updates)
```

## Monitoring

### Health Check
Visit: `https://solclock-backend.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "cache": "connected",
    "dataSource": "real",
    "solanaRpc": { "healthy": true }
  }
}
```

### Logs
- Backend: Service → Logs tab
- View real-time logs and errors

## Costs (Monthly)

**Free Tier:**
- Frontend: $0
- Backend: $0 (sleeps after 15min inactivity)
- PostgreSQL: $0 (1GB storage)
- Redis: $0 (25MB)
**Total: $0/month**

**Production (Starter):**
- Frontend: $0
- Backend: $7/month
- PostgreSQL: $7/month
- Redis: $10/month
**Total: $24/month**

## Troubleshooting

### Backend not connecting to database
- Verify `DATABASE_URL` is the **Internal** URL (not External)
- Check database is in same region as backend

### Frontend can't reach API
- Check `CORS_ORIGIN` includes frontend URL
- Verify `NEXT_PUBLIC_API_URL` is correct

### Data not updating
- Check cron job is running
- View logs for errors
- Verify Solana RPC endpoint is accessible

### Rate Limiting Issues
- Reduce `RPC_RATE_LIMIT` to 2-3 requests/second
- Consider upgrading to Helius for higher limits

## Next Steps

1. ✅ Monitor health endpoint
2. ✅ Check logs for errors
3. ✅ Test all features in production
4. ✅ Set up custom domain (optional)
5. ✅ Enable analytics (optional)

---

**Need Help?** Check Render docs: https://render.com/docs
