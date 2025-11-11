# SolClock Backend

Node.js/Express backend for the SolClock Solana Network Pulse & Meme Coin Dashboard.

## Features

- RESTful API for network statistics and meme token data
- PostgreSQL database for persistent storage
- Redis caching for improved performance
- Mock data generation for development
- Weighted scoring algorithm for token rankings

## Prerequisites

- Node.js 16+ 
- PostgreSQL 14+
- Redis 6+

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and settings.

## Database Setup

Initialize the database schema:

```bash
npm run init-db
```

## Generate Mock Data

Populate the database with realistic test data:

```bash
npm run generate-mock
```

This will:
- Create 50 meme tokens
- Generate 24 hours of network statistics
- Generate 24 hours of token activity data
- Calculate Top 50 rankings

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## Production

Start the production server:

```bash
npm start
```

## API Endpoints

### Network

- `GET /api/v1/network/pulse` - 24-hour network activity data
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
- `GET /api/v1/alerts/recent-activity` - Recent network activity alerts
- `POST /api/v1/alerts` - Create alert configuration
- `DELETE /api/v1/alerts/:id?user_id=X` - Delete alert

## Scoring Algorithm

Top 50 tokens are ranked using a weighted score:

```
score = 0.35 * volume + 0.20 * unique_buyers + 0.15 * holders_growth + 0.15 * liquidity + 0.10 * social_score
```

All components are normalized to 0-100 scale.

## Cache Strategy

- Top 50 rankings: 5-minute TTL
- Token details: 5-minute TTL
- Network pulse: 5-minute TTL

## License

MIT
