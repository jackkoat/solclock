/**
 * Network Routes
 * Endpoints for Solana network statistics
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const cacheService = require('../services/cacheService');

/**
 * GET /api/v1/network/pulse
 * Returns 24-hour rolling network data
 */
router.get('/pulse', async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'network:pulse';
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Query last 24 hours of network stats
    const result = await pool.query(`
      SELECT 
        hour,
        total_transactions,
        total_blocks,
        unique_wallets,
        avg_cu_per_block
      FROM network_hourly_stats
      WHERE hour >= NOW() - INTERVAL '24 hours'
      ORDER BY hour ASC
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No network data available'
      });
    }

    // Find peak hour
    const peakHour = result.rows.reduce((max, current) => 
      current.total_transactions > max.total_transactions ? current : max
    );

    const response = {
      hourly_stats: result.rows.map(row => ({
        hour: row.hour,
        total_transactions: parseInt(row.total_transactions),
        total_blocks: parseInt(row.total_blocks),
        unique_wallets: parseInt(row.unique_wallets),
        avg_cu_per_block: parseFloat(row.avg_cu_per_block)
      })),
      peak_hour: {
        hour: peakHour.hour,
        total_transactions: parseInt(peakHour.total_transactions)
      },
      summary: {
        total_transactions_24h: result.rows.reduce((sum, row) => sum + parseInt(row.total_transactions), 0),
        total_blocks_24h: result.rows.reduce((sum, row) => sum + parseInt(row.total_blocks), 0),
        avg_unique_wallets: Math.round(
          result.rows.reduce((sum, row) => sum + parseInt(row.unique_wallets), 0) / result.rows.length
        )
      }
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching network pulse:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch network data'
    });
  }
});

/**
 * GET /api/v1/network/stats
 * Returns current network statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        hour,
        total_transactions,
        total_blocks,
        unique_wallets,
        avg_cu_per_block
      FROM network_hourly_stats
      ORDER BY hour DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No network data available'
      });
    }

    const latest = result.rows[0];
    const tps = Math.round(latest.total_transactions / 3600); // Approximate TPS

    res.json({
      success: true,
      data: {
        timestamp: latest.hour,
        transactions_last_hour: parseInt(latest.total_transactions),
        blocks_last_hour: parseInt(latest.total_blocks),
        unique_wallets: parseInt(latest.unique_wallets),
        avg_cu_per_block: parseFloat(latest.avg_cu_per_block),
        estimated_tps: tps
      }
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch network statistics'
    });
  }
});

module.exports = router;
