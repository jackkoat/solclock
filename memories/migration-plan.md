# SolClock Migration Plan: Express + Next.js → Unified Next.js

## Goal
Consolidate split-stack SolClock into a unified Next.js 14 application with API routes and Supabase backend.

## Migration Steps

### Phase 1: Backend Setup (Supabase)
- [X] Retrieve Supabase credentials
- [X] Create database schema (5 tables + indexes)
- [ ] Deploy data generation edge function
- [ ] Deploy scoring service edge function

### Phase 2: Create New Next.js Project
- [ ] Initialize new Next.js 14 project
- [ ] Install dependencies (lucide-react, recharts, @supabase/supabase-js)
- [ ] Configure TailwindCSS with existing theme
- [ ] Copy frontend components

### Phase 3: Convert API Routes
- [X] `/api/network/pulse/route.ts` - Network pulse data
- [X] `/api/network/stats/route.ts` - Current stats
- [X] `/api/top-meme/route.ts` - Top 50 meme coins
- [X] `/api/token/[address]/clock/route.ts` - Token histogram
- [X] `/api/token/[address]/details/route.ts` - Token details
- [X] `/api/watchlist/route.ts` - Watchlist CRUD
- [X] `/api/alerts/recent-activity/route.ts` - Recent alerts

### Phase 4: Services Migration
- [X] Create lib/supabase.ts - Supabase client
- [X] Create lib/mockDataGenerator.ts - Mock data for Supabase
- [X] Create lib/scoringService.ts - Token scoring algorithm
- [X] Create lib/api.ts - API client for internal routes

### Phase 5: Frontend Integration
- [X] Update API client to use internal routes
- [X] Preserve all components and styling
- [X] Create main page with dashboard layout
- [ ] Test all features

### Phase 6: Deploy & Test
- [X] Build production version
- [X] Initialize mock data
- [X] Test all API endpoints
- [X] Verify all functionality
- [X] Documentation complete

## Key Files Reference

### Backend Routes to Convert
1. `/workspace/solclock/backend/src/routes/network.js` → `app/api/network/[route]/route.ts`
2. `/workspace/solclock/backend/src/routes/tokens.js` → `app/api/token/*/route.ts` & `app/api/top-meme/route.ts`
3. `/workspace/solclock/backend/src/routes/watchlist.js` → `app/api/watchlist/route.ts`
4. `/workspace/solclock/backend/src/routes/alerts.js` → `app/api/alerts/*/route.ts`

### Services to Migrate
1. `/workspace/solclock/backend/src/services/mockDataGenerator.js`
2. `/workspace/solclock/backend/src/services/scoringService.js`
3. `/workspace/solclock/backend/src/services/hybridDataService.js`

### Frontend to Preserve
1. All components in `/workspace/solclock/frontend/src/components/`
2. TailwindCSS config and theme
3. TypeScript types
4. Layout and styling

## Database Schema (Supabase)

### Tables
1. **tokens** - Token metadata (address, symbol, name, logo_url)
2. **token_hourly_stats** - Time-series metrics (tx_count, volume, buyers, holders, liquidity)
3. **token_rankings** - Historical rankings
4. **network_hourly_stats** - Network metrics (transactions, blocks, wallets, compute units)
5. **watchlist** - User watchlists
6. **alerts** - Alert configurations

## Design System (Preserve)
- Light theme with teal accent (#14F195)
- Inter font
- Card-based layout
- Responsive design
- Clean professional appearance
