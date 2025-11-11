/**
 * Alerts Routes
 * Endpoints for managing user alerts
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/**
 * GET /api/v1/alerts
 * Get recent alerts (triggered)
 * Query params: user_id (optional), limit (default: 20)
 */
router.get('/', async (req, res) => {
  try {
    const { user_id, limit = 20 } = req.query;
    const maxLimit = Math.min(parseInt(limit), 100);

    let query;
    let params;

    if (user_id) {
      query = `
        SELECT 
          a.id,
          a.user_id,
          a.alert_type,
          a.token_address,
          a.threshold,
          a.triggered_at,
          a.created_at,
          t.symbol,
          t.name
        FROM alerts a
        LEFT JOIN tokens t ON a.token_address = t.token_address
        WHERE a.user_id = $1 AND a.triggered_at IS NOT NULL
        ORDER BY a.triggered_at DESC
        LIMIT $2
      `;
      params = [user_id, maxLimit];
    } else {
      query = `
        SELECT 
          a.id,
          a.user_id,
          a.alert_type,
          a.token_address,
          a.threshold,
          a.triggered_at,
          a.created_at,
          t.symbol,
          t.name
        FROM alerts a
        LEFT JOIN tokens t ON a.token_address = t.token_address
        WHERE a.triggered_at IS NOT NULL
        ORDER BY a.triggered_at DESC
        LIMIT $1
      `;
      params = [maxLimit];
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        alerts: result.rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          alert_type: row.alert_type,
          token_address: row.token_address,
          token_symbol: row.symbol,
          token_name: row.name,
          threshold: row.threshold ? parseFloat(row.threshold) : null,
          triggered_at: row.triggered_at,
          created_at: row.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

/**
 * GET /api/v1/alerts/recent-activity
 * Get recent network and whale activity alerts (for dashboard feed)
 */
router.get('/recent-activity', async (req, res) => {
  try {
    // Generate mock recent activity alerts
    const currentHour = new Date().getUTCHours();
    const alerts = [];

    // Degen hour detection (high network activity)
    if (currentHour >= 14 && currentHour < 22) {
      alerts.push({
        type: 'degen_hour',
        message: 'Degen Hour Detected',
        description: 'Network activity up 45% - Prime time for meme coin trading',
        severity: 'high',
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString()
      });
    }

    // Whale activity
    if (Math.random() > 0.5) {
      alerts.push({
        type: 'whale_activity',
        message: 'Whales Awake',
        description: 'Large wallet activity detected - 3 transactions over $100K in the last hour',
        severity: 'medium',
        timestamp: new Date(Date.now() - Math.random() * 2400000).toISOString()
      });
    }

    // Network calm
    if (currentHour >= 2 && currentHour < 8) {
      alerts.push({
        type: 'network_calm',
        message: 'Network Calm',
        description: 'Low congestion detected - Good time for swaps and transactions',
        severity: 'low',
        timestamp: new Date(Date.now() - Math.random() * 1200000).toISOString()
      });
    }

    // Top 50 entry
    if (Math.random() > 0.7) {
      const tokens = ['BONK', 'POPCAT', 'WEN', 'MEW'];
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      alerts.push({
        type: 'top50_entry',
        message: `${token} Entered Top 50`,
        description: `${token} has entered the top 50 meme coins with a score of ${(Math.random() * 20 + 80).toFixed(1)}`,
        severity: 'medium',
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
      });
    }

    // Sort by timestamp descending
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        alerts: alerts.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
});

/**
 * POST /api/v1/alerts
 * Create alert configuration
 * Body: { user_id, alert_type, token_address?, threshold?, webhook_url? }
 */
router.post('/', async (req, res) => {
  try {
    const { user_id, alert_type, token_address, threshold, webhook_url } = req.body;

    if (!user_id || !alert_type) {
      return res.status(400).json({
        success: false,
        error: 'user_id and alert_type are required'
      });
    }

    const validAlertTypes = ['volume_spike', 'whale_buy', 'top50_entry', 'network_congestion'];
    if (!validAlertTypes.includes(alert_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid alert_type. Must be one of: ${validAlertTypes.join(', ')}`
      });
    }

    const result = await pool.query(
      `INSERT INTO alerts (user_id, alert_type, token_address, threshold, webhook_url, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, user_id, alert_type, token_address, threshold, webhook_url, created_at`,
      [user_id, alert_type, token_address || null, threshold || null, webhook_url || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create alert'
    });
  }
});

/**
 * DELETE /api/v1/alerts/:id
 * Delete alert configuration
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    const result = await pool.query(
      'DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert'
    });
  }
});

module.exports = router;
