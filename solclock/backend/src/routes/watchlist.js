/**
 * Watchlist Routes
 * Endpoints for managing user watchlists
 */

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/**
 * GET /api/v1/watchlist
 * Get user's watchlist
 * Query params: user_id (required)
 */
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    const result = await pool.query(`
      SELECT 
        w.id,
        w.token_address,
        w.created_at,
        t.symbol,
        t.name,
        t.logo_url,
        COALESCE(SUM(ths.tx_volume_usd), 0) as volume_24h_usd,
        COALESCE(MAX(ths.holders), 0) as holders
      FROM watchlist w
      JOIN tokens t ON w.token_address = t.token_address
      LEFT JOIN token_hourly_stats ths ON t.token_address = ths.token_address
        AND ths.hour >= NOW() - INTERVAL '24 hours'
      WHERE w.user_id = $1
      GROUP BY w.id, w.token_address, w.created_at, t.symbol, t.name, t.logo_url
      ORDER BY w.created_at DESC
    `, [user_id]);

    res.json({
      success: true,
      data: {
        watchlist: result.rows.map(row => ({
          id: row.id,
          token_address: row.token_address,
          symbol: row.symbol,
          name: row.name,
          logo_url: row.logo_url,
          volume_24h_usd: parseFloat(row.volume_24h_usd),
          holders: parseInt(row.holders),
          added_at: row.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch watchlist'
    });
  }
});

/**
 * POST /api/v1/watchlist
 * Add token to watchlist
 * Body: { user_id, token_address }
 */
router.post('/', async (req, res) => {
  try {
    const { user_id, token_address } = req.body;

    if (!user_id || !token_address) {
      return res.status(400).json({
        success: false,
        error: 'user_id and token_address are required'
      });
    }

    // Check if token exists
    const tokenCheck = await pool.query(
      'SELECT token_address FROM tokens WHERE token_address = $1',
      [token_address]
    );

    if (tokenCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }

    // Check if already in watchlist
    const existingCheck = await pool.query(
      'SELECT id FROM watchlist WHERE user_id = $1 AND token_address = $2',
      [user_id, token_address]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Token already in watchlist'
      });
    }

    // Add to watchlist
    const result = await pool.query(
      `INSERT INTO watchlist (user_id, token_address, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, token_address, created_at`,
      [user_id, token_address]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        token_address: result.rows[0].token_address,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to watchlist'
    });
  }
});

/**
 * DELETE /api/v1/watchlist/:id
 * Remove token from watchlist
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
      'DELETE FROM watchlist WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Watchlist item not found'
      });
    }

    res.json({
      success: true,
      message: 'Token removed from watchlist'
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from watchlist'
    });
  }
});

module.exports = router;
