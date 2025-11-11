/**
 * Scoring Service
 * Calculates weighted scores for meme token rankings
 * Formula: score = 0.35*volume + 0.20*unique_buyers + 0.15*holders_growth + 0.15*liquidity + 0.10*social_score
 */

const pool = require('../db/pool');

class ScoringService {
  constructor() {
    // Weights for scoring algorithm
    this.weights = {
      volume: 0.35,
      uniqueBuyers: 0.20,
      holdersGrowth: 0.15,
      liquidity: 0.15,
      socialScore: 0.10
    };
  }

  // Normalize a value to 0-100 scale using min-max normalization
  normalize(value, min, max) {
    if (max === min) return 50;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }

  // Calculate social score (simulated based on volume and buyers)
  calculateSocialScore(volume, buyers) {
    // Higher volume and more buyers = higher social engagement
    const volumeScore = Math.log10(volume + 1) * 10;
    const buyersScore = Math.log10(buyers + 1) * 15;
    return Math.min(100, volumeScore + buyersScore);
  }

  async calculateTop50() {
    const client = await pool.connect();
    try {
      // Get 24h aggregated stats for all tokens
      const result = await client.query(`
        SELECT 
          t.token_address,
          t.symbol,
          t.name,
          t.logo_url,
          SUM(ths.tx_volume_usd) as volume_24h_usd,
          SUM(ths.unique_buyers) as unique_buyers_24h,
          MAX(ths.holders) as current_holders,
          MIN(ths.holders) as holders_24h_ago,
          AVG(ths.liquidity_usd) as avg_liquidity_usd,
          json_agg(
            json_build_object(
              'hour', ths.hour,
              'tx_volume_usd', ths.tx_volume_usd
            )
            ORDER BY ths.hour
          ) as hourly_data
        FROM tokens t
        JOIN token_hourly_stats ths ON t.token_address = ths.token_address
        WHERE ths.hour >= NOW() - INTERVAL '24 hours'
        GROUP BY t.token_address, t.symbol, t.name, t.logo_url
      `);

      const tokens = result.rows;

      if (tokens.length === 0) {
        return [];
      }

      // Calculate min/max for normalization
      const volumes = tokens.map(t => parseFloat(t.volume_24h_usd || 0));
      const buyers = tokens.map(t => parseInt(t.unique_buyers_24h || 0));
      const liquidity = tokens.map(t => parseFloat(t.avg_liquidity_usd || 0));

      const minVolume = Math.min(...volumes);
      const maxVolume = Math.max(...volumes);
      const minBuyers = Math.min(...buyers);
      const maxBuyers = Math.max(...buyers);
      const minLiquidity = Math.min(...liquidity);
      const maxLiquidity = Math.max(...liquidity);

      // Calculate scores for each token
      const scoredTokens = tokens.map(token => {
        const volume = parseFloat(token.volume_24h_usd || 0);
        const uniqueBuyers = parseInt(token.unique_buyers_24h || 0);
        const currentHolders = parseInt(token.current_holders || 0);
        const holdersStart = parseInt(token.holders_24h_ago || currentHolders);
        const liquidityUsd = parseFloat(token.avg_liquidity_usd || 0);

        // Calculate holders growth percentage
        const holdersGrowth = holdersStart > 0 
          ? ((currentHolders - holdersStart) / holdersStart) * 100 
          : 0;

        // Normalize components
        const volumeNorm = this.normalize(volume, minVolume, maxVolume);
        const buyersNorm = this.normalize(uniqueBuyers, minBuyers, maxBuyers);
        const liquidityNorm = this.normalize(liquidityUsd, minLiquidity, maxLiquidity);
        const holdersGrowthNorm = Math.min(100, Math.max(0, holdersGrowth * 10)); // 10% growth = 100 score
        const socialScore = this.calculateSocialScore(volume, uniqueBuyers);

        // Calculate weighted score
        const score = (
          this.weights.volume * volumeNorm +
          this.weights.uniqueBuyers * buyersNorm +
          this.weights.holdersGrowth * holdersGrowthNorm +
          this.weights.liquidity * liquidityNorm +
          this.weights.socialScore * socialScore
        );

        // Find peak hour
        const hourlyData = token.hourly_data || [];
        let peakHour = null;
        let maxHourVolume = 0;
        
        hourlyData.forEach(h => {
          if (h.tx_volume_usd > maxHourVolume) {
            maxHourVolume = h.tx_volume_usd;
            peakHour = new Date(h.hour).getUTCHours();
          }
        });

        // Generate meme clock data (24 bars normalized 0-100)
        const memeClock = hourlyData.map(h => {
          const hourVolume = parseFloat(h.tx_volume_usd || 0);
          return Math.round(this.normalize(hourVolume, 0, maxHourVolume));
        });

        // Pad memeClock to 24 hours if needed
        while (memeClock.length < 24) {
          memeClock.unshift(0);
        }

        return {
          token_address: token.token_address,
          symbol: token.symbol,
          name: token.name,
          logo_url: token.logo_url,
          score: Math.round(score * 100) / 100,
          metrics: {
            volume_24h_usd: Math.round(volume),
            unique_buyers_24h: uniqueBuyers,
            holders: currentHolders,
            holders_growth_24h: Math.round(holdersGrowth * 100) / 100,
            liquidity_usd: Math.round(liquidityUsd),
            social_score: Math.round(socialScore)
          },
          peak_hour: peakHour !== null ? `${String(peakHour).padStart(2, '0')}:00` : null,
          meme_clock: memeClock.slice(-24) // Last 24 hours
        };
      });

      // Sort by score descending and take top 50
      scoredTokens.sort((a, b) => b.score - a.score);
      const top50 = scoredTokens.slice(0, 50);

      // Add rank
      top50.forEach((token, index) => {
        token.rank = index + 1;
      });

      // Store rankings in database
      await this.storeRankings(client, top50);

      return top50;
    } finally {
      client.release();
    }
  }

  async storeRankings(client, rankings) {
    const rankingTime = new Date();
    
    await client.query('BEGIN');
    try {
      for (const ranking of rankings) {
        await client.query(
          `INSERT INTO token_rankings (ranking_time, rank, token_address, score, reason)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            rankingTime,
            ranking.rank,
            ranking.token_address,
            ranking.score,
            JSON.stringify({
              volume: ranking.metrics.volume_24h_usd,
              buyers: ranking.metrics.unique_buyers_24h,
              growth: ranking.metrics.holders_growth_24h
            })
          ]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = new ScoringService();
