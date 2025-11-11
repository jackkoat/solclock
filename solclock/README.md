# SolClock - Solana Network Pulse & Meme Coin Dashboard

A professional full-stack crypto analytics dashboard for Solana traders to visualize network activity, track top 50 meme coins, and receive alerts for high-volatility windows and whale activity.

## Features

- **Network Pulse**: Real-time 24-hour visualization of Solana network activity
- **Top 50 Meme Coins**: Ranked leaderboard with weighted scoring algorithm
- **Meme Clock**: 24-hour activity histogram for individual tokens
- **Live Alerts**: Real-time notifications for degen hours, whale activity, and network events
- **Whale Tracking**: Monitor large wallet transactions
- **Watchlist**: Save and track favorite tokens
- **Responsive Design**: Solana-themed dark UI with teal/purple accents
- **Dual Data Modes**: Switch between mock data (development) and real Solana blockchain data (production)

## Tech Stack

### Backend
- **Node.js** + Express.js
- **PostgreSQL** for data storage
- **Redis** for caching (5-minute TTL)
- **@solana/web3.js** for blockchain integration
- RESTful API architecture
- Winston logger for monitoring

### Frontend
- **Next.js 14** (React framework)
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### Infrastructure
- **Docker** & Docker Compose for containerization
- Compatible with Render.com, AWS ECS, and similar platforms

## Project Structure

```
solclock/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── server.js          # Main server
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── db/                # Database setup
│   │   └── jobs/              # Data aggregation
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # Pages & layouts
│   │   ├── components/        # React components
│   │   ├── lib/               # API client
│   │   └── types/             # TypeScript types
│   ├── package.json
│   ├── Dockerfile
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (optional)

### Local Development (without Docker)

#### 1. Clone and Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

**Frontend (.env.local):**
```bash
cd frontend
cp .env.example .env.local
# Defaults should work for local development
```

#### 3. Initialize Database

```bash
cd backend
npm run init-db
```

#### 4. Generate Mock Data

```bash
cd backend
npm run generate-mock
```

This will populate the database with:
- 50 meme tokens
- 24 hours of network statistics
- 24 hours of token activity data
- Calculated Top 50 rankings

#### 5. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

#### 6. Access Dashboard

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

The easiest way to run the entire stack:

```bash
# Start all services
docker-compose up -d

# Wait for services to be healthy (check with)
docker-compose ps

# Initialize database (first time only)
docker-compose exec backend npm run init-db

# Generate mock data (first time only)
docker-compose exec backend npm run generate-mock

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the dashboard at [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Network
- `GET /api/v1/network/pulse` - 24-hour network activity
- `GET /api/v1/network/stats` - Current network statistics

### Tokens
- `GET /api/v1/top-meme?limit=50` - Top meme coins by score
- `GET /api/v1/token/:address/clock` - Token hourly histogram
- `GET /api/v1/token/:address/details` - Token details and metrics

### Watchlist
- `GET /api/v1/watchlist?user_id=X` - Get user watchlist
- `POST /api/v1/watchlist` - Add token to watchlist
- `DELETE /api/v1/watchlist/:id?user_id=X` - Remove from watchlist

### Alerts
- `GET /api/v1/alerts?user_id=X` - Get user alerts
- `GET /api/v1/alerts/recent-activity` - Recent network activity
- `POST /api/v1/alerts` - Create alert configuration
- `DELETE /api/v1/alerts/:id?user_id=X` - Delete alert

## Scoring Algorithm

Top 50 tokens are ranked using a weighted score:

```
score = 0.35 * volume + 0.20 * unique_buyers + 0.15 * holders_growth + 0.15 * liquidity + 0.10 * social_score
```

All components are normalized to 0-100 scale before weighting.

## Data Sources

SolClock supports two data modes:

### Mock Data Mode (Development)
Perfect for local development and testing without API keys. Generates realistic patterns:

- **Peak Hours** (14:00-22:00 UTC): 0.8-1.5x activity (US trading hours)
- **Morning** (08:00-14:00 UTC): 0.5-0.8x activity
- **Night** (02:00-08:00 UTC): 0.3-0.5x activity
- **Late Night** (22:00-02:00 UTC): 0.4-0.7x activity
- Random spikes to simulate whale activity and viral moments

**Enable:** Set `USE_REAL_DATA=false` in backend/.env

### Real Data Mode (Production)
Fetches live data from Solana blockchain via RPC:

- Real network statistics (transactions, blocks, slots)
- Actual token supply and on-chain metrics
- Recent transaction signatures and activity
- Current blockchain state

**Enable:** Set `USE_REAL_DATA=true` in backend/.env

**Supported RPC Providers:**
- **Free:** Public Solana RPC (5 req/s, limited historical data)
- **Recommended:** [Helius](https://helius.dev) (100k+ credits/month, enhanced features)
- **Enterprise:** [Solscan Pro](https://pro.solscan.io) (full historical data, volume tracking)

📖 **Detailed Guide:** See [DATA_SOURCE_GUIDE.md](DATA_SOURCE_GUIDE.md) for complete instructions on switching modes and API integration.

## Mock Data Patterns

*Deprecated - See "Data Sources" section above for current information.*

## Production Deployment

### Quick Links
- **Render.com Guide**: See [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md) - Easiest, managed services
- **AWS ECS Guide**: See [DEPLOYMENT_AWS.md](DEPLOYMENT_AWS.md) - Enterprise-grade, scalable
- **Data Configuration**: See [DATA_SOURCE_GUIDE.md](DATA_SOURCE_GUIDE.md) - Switch to real Solana data

### Render.com (Recommended for Getting Started)

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Note the connection details

2. **Create Redis Instance**
   - Go to Render Dashboard → New → Redis
   - Note the connection details

3. **Deploy Backend**
   - Go to Render Dashboard → New → Web Service
   - Connect your repository
   - Docker: Use Dockerfile in `/backend`
   - Set environment variables from database/Redis
   - Run init command: `npm run init-db && npm run generate-mock`

4. **Deploy Frontend**
   - Go to Render Dashboard → New → Web Service
   - Connect your repository
   - Docker: Use Dockerfile in `/frontend`
   - Set `NEXT_PUBLIC_API_URL` to backend URL

### AWS ECS

See detailed deployment guide in [DEPLOYMENT_AWS.md](DEPLOYMENT_AWS.md)

## Environment Variables

### Backend
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port (default: 6379)
- `CACHE_TTL_SECONDS` - Cache duration (default: 300)
- `CORS_ORIGIN` - Allowed frontend origin
- `USE_REAL_DATA` - Data mode: `false` (mock) or `true` (real blockchain)
- `SOLANA_RPC_ENDPOINT` - Solana RPC URL (default: public mainnet)
- `RPC_RATE_LIMIT` - Max requests per second (default: 5)
- `LOG_LEVEL` - Logging level: debug, info, warn, error

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_USER_ID` - Demo user ID (for watchlist/alerts)

## Development

### Refresh Mock Data

To regenerate mock data during development:

```bash
cd backend
npm run generate-mock
```

### Database Reset

To reset the database and start fresh:

```bash
cd backend
npm run init-db
npm run generate-mock
```

## Future Enhancements

- User authentication and personalized watchlists
- WebSocket support for real-time updates
- Advanced charting with technical indicators
- Mobile app (React Native)
- Push notifications for alerts
- Historical data analysis and backtesting
- Social sentiment tracking integration
- DEX volume monitoring (Helius/Solscan integration)
- Portfolio tracking and PnL calculation

## License

MIT

## Author

Built by MiniMax Agent

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Current Status**: Production-ready with both mock data (development) and real Solana blockchain integration (production).

📖 **Documentation**:
- [Data Source Configuration](DATA_SOURCE_GUIDE.md)
- [Render.com Deployment](DEPLOYMENT_RENDER.md)
- [AWS ECS Deployment](DEPLOYMENT_AWS.md)
