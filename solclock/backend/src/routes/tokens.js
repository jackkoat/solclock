/**
 * Token Routes
 * Endpoints for meme token data and rankings
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const cacheService = require('../services/cacheService');
const scoringService = require('../services/scoringService');

/**
 * GET /api/v1/top-meme
 * Returns top meme coins ranked by weighted score
 * Query params: limit (default: 50)
 */
router.get('/top-meme', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    // Check cache first
    const cacheKey = `top-meme:${limit}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: {
          rankings: cached,
          last_updated: new Date().toISOString(),
          cached: true
        }
      });
    }

    // Calculate rankings
    const rankings = await scoringService.calculateTop50();
    const limitedRankings = rankings.slice(0, limit);

    // Cache for 5 minutes
    await cacheService.set(cacheKey, limitedRankings, 300);

    res.json({
      success: true,
      data: {
        rankings: limitedRankings,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching top meme coins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top meme coins'
    });
  }
});

/**
 * GET /api/v1/token/:address/clock
 * Returns token hourly histogram (24 bars)
 */
router.get('/token/:address/clock', async (req, res) => {
  try {
    const { address } = req.params;

    // Check cache
    const cacheKey = `token:clock:${address}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Get 24-hour hourly data
    const result = await pool.query(`
      SELECT 
        hour,
        tx_count,
        tx_volume_usd,
        unique_buyers
      FROM token_hourly_stats
      WHERE token_address = $1
        AND hour >= NOW() - INTERVAL '24 hours'
      ORDER BY hour ASC
    `, [address]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Token not found or no data available'
      });
    }

    // Build hourly histogram
    const hourlyData = result.rows.map(row => ({
      hour: row.hour,
      hour_label: new Date(row.hour).getUTCHours() + ':00',
      tx_count: parseInt(row.tx_count),
      tx_volume_usd: parseFloat(row.tx_volume_usd),
      unique_buyers: parseInt(row.unique_buyers)
    }));

    // Find peak hour
    const peakHour = hourlyData.reduce((max, current) => 
      current.tx_volume_usd > max.tx_volume_usd ? current : max
    );

    const response = {
      token_address: address,
      hourly_data: hourlyData,
      peak_hour: peakHour.hour_label,
      total_volume_24h: hourlyData.reduce((sum, h) => sum + h.tx_volume_usd, 0),
      total_transactions_24h: hourlyData.reduce((sum, h) => sum + h.tx_count, 0),
      total_unique_buyers_24h: hourlyData.reduce((sum, h) => sum + h.unique_buyers, 0)
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching token clock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token clock data'
    });
  }
});

/**
 * GET /api/v1/token/:address/details
 * Returns token metrics and whale activity
 */
router.get('/token/:address/details', async (req, res) => {
  try {
    const { address } = req.params;

    // Check cache
    const cacheKey = `token:details:${address}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Get token metadata
    const tokenResult = await pool.query(`
      SELECT token_address, symbol, name, logo_url
      FROM tokens
      WHERE token_address = $1
    `, [address]);

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    const token = tokenResult.rows[0];

    // Get 24h aggregated stats
    const statsResult = await pool.query(`
      SELECT 
        SUM(tx_volume_usd) as volume_24h_usd,
        SUM(unique_buyers) as unique_buyers_24h,
        MAX(holders) as current_holders,
        AVG(liquidity_usd) as avg_liquidity_usd,
        SUM(tx_count) as total_transactions
      FROM token_hourly_stats
      WHERE token_address = $1
        AND hour >= NOW() - INTERVAL '24 hours'
    `, [address]);

    const stats = statsResult.rows[0];

    // Simulate whale activity (mock data)
    const whaleActivity = [
      {
        type: 'buy',
        amount_usd: Math.floor(Math.random() * 50000) + 10000,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        wallet: address.substring(0, 8) + '...' + address.substring(address.length - 4)
      },
      {
        type: 'sell',
        amount_usd: Math.floor(Math.random() * 30000) + 5000,
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        wallet: address.substring(0, 8) + '...' + address.substring(address.length - 4)
      }
    ];

    const response = {
      token: {
        address: token.token_address,
        symbol: token.symbol,
        name: token.name,
        logo_url: token.logo_url
      },
      metrics: {
        volume_24h_usd: parseFloat(stats.volume_24h_usd || 0),
        unique_buyers_24h: parseInt(stats.unique_buyers_24h || 0),
        holders: parseInt(stats.current_holders || 0),
        liquidity_usd: parseFloat(stats.avg_liquidity_usd || 0),
        total_transactions_24h: parseInt(stats.total_transactions || 0)
      },
      whale_activity: whaleActivity
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch token details'
    });
  }
});

module.exports = router;
