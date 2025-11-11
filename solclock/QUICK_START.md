# SolClock - Quick Start Guide

## Fastest Way to Run (Docker)

### Prerequisites
- Docker and Docker Compose installed
- 8GB RAM available
- Ports 3000, 4000, 5432, 6379 available

### Steps

1. **Navigate to project directory**
```bash
cd solclock
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Wait for services to be ready** (about 30-60 seconds)
```bash
docker-compose ps
```

4. **Initialize database** (first time only)
```bash
docker-compose exec backend npm run init-db
```

5. **Generate mock data** (first time only)
```bash
docker-compose exec backend npm run generate-mock
```

6. **Access the dashboard**
Open your browser to: **http://localhost:3000**

### Verify Everything Works

- Dashboard loads with network pulse chart
- Top 50 meme coins table displays
- Alert panel shows activity
- Click any token to see details
- Meme Clock displays 24-hour activity

### View Logs
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Troubleshooting

**Services won't start:**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :4000
lsof -i :5432
lsof -i :6379

# Remove and restart
docker-compose down -v
docker-compose up -d
```

**Database initialization fails:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Try manual initialization
docker-compose exec postgres psql -U postgres -d solclock -f /docker-entrypoint-initdb.d/init.sql
```

**No data showing:**
```bash
# Regenerate mock data
docker-compose exec backend npm run generate-mock

# Verify data was created
docker-compose exec postgres psql -U postgres -d solclock -c "SELECT COUNT(*) FROM tokens;"
```

## Local Development (without Docker)

### Prerequisites
- Node.js 16+
- PostgreSQL 14+ running locally
- Redis 6+ running locally

### Steps

1. **Run setup script**
```bash
./setup-local.sh
```

2. **Configure environment**
Edit `backend/.env` with your database credentials

3. **Initialize database**
```bash
cd backend
npm run init-db
npm run generate-mock
```

4. **Start backend** (Terminal 1)
```bash
cd backend
npm run dev
```

5. **Start frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```

6. **Open browser**
http://localhost:3000

## What to Expect

### Dashboard (Home)
- Real-time network statistics cards
- 24-hour network pulse chart
- Live alerts feed
- Top 50 meme coins leaderboard (sortable, searchable)

### Token Detail Page
- Click any token in the table
- View comprehensive metrics
- 24-hour activity histogram (Meme Clock)
- Whale activity tracker
- Add to watchlist

### API Explorer
Backend API available at: http://localhost:4000

Test endpoints:
- http://localhost:4000/health
- http://localhost:4000/api/v1/network/pulse
- http://localhost:4000/api/v1/top-meme?limit=10

## Next Steps

1. **Explore the UI** - Click around, sort tables, view token details
2. **Check the API** - Try endpoints directly in browser or Postman
3. **Read full documentation** - See README.md for detailed info
4. **Deploy to production** - Follow Render.com or AWS deployment guide

## Need Help?

- **Full documentation**: See README.md
- **Project summary**: See PROJECT_SUMMARY.md
- **API details**: See backend/README.md

Enjoy using SolClock!
