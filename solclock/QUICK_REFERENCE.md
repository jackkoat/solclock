# SolClock - Quick Reference Card

## 🚀 Quick Start

### Docker (Recommended)
```bash
cd solclock
docker-compose up -d
docker-compose exec backend npm run init-db
docker-compose exec backend npm run generate-mock
```
**Access:** http://localhost:3000

### Manual Setup
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## 🔄 Switch Data Modes

### Use Mock Data (Development)
```bash
# backend/.env
USE_REAL_DATA=false
```
✅ No API keys needed  
✅ Full 24h historical data  
✅ Realistic patterns  

### Use Real Data (Production)
```bash
# backend/.env
USE_REAL_DATA=true
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
RPC_RATE_LIMIT=5
```
✅ Real Solana network stats  
✅ Live token data  
⚠️ Limited historical data (upgrade to Helius for more)  

## 📊 Check Status

```bash
# Health check
curl http://localhost:4000/health

# View logs
docker-compose logs -f backend

# Or (manual setup)
tail -f backend/logs/combined.log
```

## 🔧 Common Commands

```bash
# Regenerate data
docker-compose exec backend npm run generate-mock

# Reset database
docker-compose exec backend npm run init-db

# Restart services
docker-compose restart

# Stop all
docker-compose down
```

## 🌐 Endpoints

- **Dashboard:** http://localhost:3000
- **API:** http://localhost:4000
- **Health:** http://localhost:4000/health
- **Network Pulse:** http://localhost:4000/api/v1/network/pulse
- **Top Meme Coins:** http://localhost:4000/api/v1/top-meme?limit=50

## 📖 Documentation

| Guide | Purpose |
|-------|---------|
| `README.md` | Getting started |
| `DATA_SOURCE_GUIDE.md` | Configure data sources |
| `DEPLOYMENT_RENDER.md` | Deploy to Render.com |
| `DEPLOYMENT_AWS.md` | Deploy to AWS ECS |
| `INTEGRATION_SUMMARY.md` | Technical details |

## 🐛 Troubleshooting

### "RPC request failed: 429"
```bash
# Reduce rate limit
RPC_RATE_LIMIT=2
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
docker-compose ps postgres
docker-compose logs postgres
```

### "No data showing"
```bash
# Regenerate data
docker-compose exec backend npm run generate-mock
```

### Clear cache
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# In Redis CLI
FLUSHALL
```

## 🚀 Deploy to Production

### Render.com (Easiest)
```bash
# See DEPLOYMENT_RENDER.md
# Cost: $0-24/month
```

### AWS ECS (Scalable)
```bash
# See DEPLOYMENT_AWS.md
# Cost: $30-200/month
```

## ⚙️ Environment Variables

### Required
```bash
# Database
DB_HOST=localhost
DB_NAME=solclock
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
```

### Optional (Solana RPC)
```bash
USE_REAL_DATA=false                                    # false or true
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
RPC_RATE_LIMIT=5                                       # requests/second
LOG_LEVEL=info                                         # debug, info, warn, error
```

## 🎯 Data Mode Comparison

| Feature | Mock | Real (Free) | Real (Helius) |
|---------|------|-------------|---------------|
| Setup | Instant | 1 min | 5 min |
| Cost | Free | Free | $0-99/mo |
| Network Stats | Synthetic | Real-time | Real-time |
| Token Data | Full | Basic | Full |
| Rate Limits | None | 5/sec | 10-100/sec |
| Best For | Dev/Demo | Testing | Production |

## 💡 Pro Tips

1. **Development:** Always use mock mode first
2. **Testing:** Test real mode with free RPC
3. **Production:** Use Helius for reliability
4. **Monitoring:** Set up health check alerts
5. **Caching:** Keep Redis enabled (5min TTL)

## 📞 Get Help

- Check logs: `backend/logs/combined.log`
- Test health: `curl http://localhost:4000/health`
- Review config: `cat backend/.env`
- Documentation: Read `DATA_SOURCE_GUIDE.md`

---

**Version:** 1.0.0  
**Updated:** 2025-11-11  
**Status:** ✅ Production Ready
