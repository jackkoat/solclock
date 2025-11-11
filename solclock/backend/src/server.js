/**
 * SolClock Backend Server
 * Express API for Solana Network Pulse & Meme Coin Dashboard
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
require('dotenv').config();

const pool = require('./db/pool');
const cacheService = require('./services/cacheService');

// Import routes
const networkRoutes = require('./routes/network');
const tokenRoutes = require('./routes/tokens');
const watchlistRoutes = require('./routes/watchlist');
const alertRoutes = require('./routes/alerts');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        cache: cacheService.isConnected ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes
app.use('/api/v1/network', networkRoutes);
app.use('/api/v1', tokenRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/alerts', alertRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SolClock API',
    version: '1.0.0',
    description: 'Solana Network Pulse & Meme Coin Dashboard API',
    endpoints: {
      health: '/health',
      network_pulse: '/api/v1/network/pulse',
      network_stats: '/api/v1/network/stats',
      top_meme: '/api/v1/top-meme',
      token_clock: '/api/v1/token/:address/clock',
      token_details: '/api/v1/token/:address/details',
      watchlist: '/api/v1/watchlist',
      alerts: '/api/v1/alerts'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize services and start server
async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    await pool.query('SELECT NOW()');
    logger.info('Database connected successfully');

    // Connect to Redis
    logger.info('Connecting to Redis...');
    await cacheService.connect();
    if (cacheService.isConnected) {
      logger.info('Redis connected successfully');
    } else {
      logger.warn('Redis connection failed - caching disabled');
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`=================================`);
      logger.info(`SolClock API Server`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API: http://localhost:${PORT}`);
      logger.info(`=================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await cacheService.disconnect();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await cacheService.disconnect();
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
