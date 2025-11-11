/**
 * Solana RPC Service
 * Fetches real data from Solana blockchain
 */

const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const pool = require('../db/pool');
const logger = require('../utils/logger');

class SolanaRpcService {
  constructor() {
    // Use custom RPC endpoint or default to public endpoint
    const rpcEndpoint = process.env.SOLANA_RPC_ENDPOINT || clusterApiUrl('mainnet-beta');
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    
    // Rate limiting config
    this.requestCount = 0;
    this.requestLimit = parseInt(process.env.RPC_RATE_LIMIT || 5); // requests per second
    this.requestWindow = 1000; // 1 second
    this.lastReset = Date.now();
    
    logger.info(`Solana RPC Service initialized with endpoint: ${rpcEndpoint}`);
  }

  /**
   * Simple rate limiter
   */
  async rateLimit() {
    const now = Date.now();
    
    // Reset counter if window expired
    if (now - this.lastReset >= this.requestWindow) {
      this.requestCount = 0;
      this.lastReset = now;
    }
    
    // Wait if limit reached
    if (this.requestCount >= this.requestLimit) {
      const waitTime = this.requestWindow - (now - this.lastReset);
      logger.debug(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastReset = Date.now();
    }
    
    this.requestCount++;
  }

  /**
   * Fetch recent block performance
   */
  async getRecentBlockPerformance(limit = 150) {
    try {
      await this.rateLimit();
      const perfSamples = await this.connection.getRecentPerformanceSamples(limit);
      return perfSamples;
    } catch (error) {
      logger.error('Error fetching block performance:', error);
      throw error;
    }
  }

  /**
   * Get network transaction count
   */
  async getTransactionCount() {
    try {
      await this.rateLimit();
      const txCount = await this.connection.getTransactionCount();
      return txCount;
    } catch (error) {
      logger.error('Error fetching transaction count:', error);
      throw error;
    }
  }

  /**
   * Get current slot information
   */
  async getSlotInfo() {
    try {
      await this.rateLimit();
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);
      return { slot, blockTime };
    } catch (error) {
      logger.error('Error fetching slot info:', error);
      throw error;
    }
  }

  /**
   * Aggregate network stats from performance samples
   * Groups by hour for storage
   */
  async aggregateNetworkStats(hours = 24) {
    try {
      logger.info(`Aggregating network stats for last ${hours} hours...`);
      
      // Fetch performance samples (each sample covers ~60 seconds)
      const samplesNeeded = hours * 60; // Approximate: 60 samples per hour
      const perfSamples = await this.getRecentBlockPerformance(Math.min(samplesNeeded, 720));
      
      if (!perfSamples || perfSamples.length === 0) {
        logger.warn('No performance samples available');
        return;
      }

      // Group samples by hour
      const hourlyData = new Map();
      
      perfSamples.forEach(sample => {
        const sampleTime = new Date(sample.samplePeriodSecs * 1000);
        const hourKey = new Date(sampleTime);
        hourKey.setMinutes(0, 0, 0);
        const hourKeyStr = hourKey.toISOString();
        
        if (!hourlyData.has(hourKeyStr)) {
          hourlyData.set(hourKeyStr, {
            hour: hourKey,
            transactions: [],
            blocks: [],
            slots: []
          });
        }
        
        const data = hourlyData.get(hourKeyStr);
        data.transactions.push(sample.numTransactions || 0);
        data.blocks.push(sample.numSlots || 0);
        data.slots.push(sample.numSlots || 0);
      });

      // Calculate averages and store
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        for (const [_, data] of hourlyData) {
          const avgTransactions = Math.floor(
            data.transactions.reduce((a, b) => a + b, 0) / data.transactions.length
          );
          const totalBlocks = data.blocks.reduce((a, b) => a + b, 0);
          
          // Estimate unique wallets based on transaction volume
          // This is an approximation since RPC doesn't provide this directly
          const estimatedWallets = Math.floor(avgTransactions * 0.15);
          
          // Average compute units per block (estimated)
          const avgCuPerBlock = 48000000;
          
          await client.query(
            `INSERT INTO network_hourly_stats (hour, total_transactions, total_blocks, unique_wallets, avg_cu_per_block)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (hour) DO UPDATE
             SET total_transactions = $2, total_blocks = $3, unique_wallets = $4, avg_cu_per_block = $5`,
            [data.hour, avgTransactions, totalBlocks, estimatedWallets, avgCuPerBlock]
          );
        }
        
        await client.query('COMMIT');
        logger.info(`Stored network stats for ${hourlyData.size} hours`);
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error storing network stats:', error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error aggregating network stats:', error);
      throw error;
    }
  }

  /**
   * Fetch token account info (for meme coins)
   * Note: This requires token addresses to be provided
   */
  async getTokenAccountInfo(tokenMintAddress) {
    try {
      await this.rateLimit();
      const mintPubkey = new PublicKey(tokenMintAddress);
      const accountInfo = await this.connection.getParsedAccountInfo(mintPubkey);
      
      if (accountInfo && accountInfo.value) {
        return accountInfo.value;
      }
      return null;
    } catch (error) {
      logger.error(`Error fetching token account info for ${tokenMintAddress}:`, error);
      return null;
    }
  }

  /**
   * Get token supply (for tracking holders)
   */
  async getTokenSupply(tokenMintAddress) {
    try {
      await this.rateLimit();
      const mintPubkey = new PublicKey(tokenMintAddress);
      const supply = await this.connection.getTokenSupply(mintPubkey);
      return supply.value;
    } catch (error) {
      logger.error(`Error fetching token supply for ${tokenMintAddress}:`, error);
      return null;
    }
  }

  /**
   * Fetch signatures for a token account (to analyze activity)
   * Limited to recent transactions due to RPC constraints
   */
  async getTokenTransactionSignatures(tokenAddress, limit = 1000) {
    try {
      await this.rateLimit();
      const pubkey = new PublicKey(tokenAddress);
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit });
      return signatures;
    } catch (error) {
      logger.error(`Error fetching signatures for ${tokenAddress}:`, error);
      return [];
    }
  }

  /**
   * Aggregate token stats from on-chain data
   * Note: Full historical data requires indexing services (Helius/Solscan)
   * This provides basic current state information
   */
  async updateTokenStats(tokenAddresses) {
    logger.info(`Updating stats for ${tokenAddresses.length} tokens...`);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const tokenAddress of tokenAddresses) {
        try {
          // Get token supply
          const supply = await this.getTokenSupply(tokenAddress);
          
          // Get recent signatures to estimate activity
          const signatures = await this.getTokenTransactionSignatures(tokenAddress, 100);
          
          // Simple aggregation for current hour
          const now = new Date();
          now.setMinutes(0, 0, 0);
          
          const txCount = signatures.length;
          const uniqueBuyers = Math.floor(txCount * 0.6); // Approximation
          const holders = supply ? parseInt(supply.amount) : 10000;
          
          // Store basic stats
          await client.query(
            `INSERT INTO token_hourly_stats (token_address, hour, tx_count, tx_volume_usd, unique_buyers, holders, liquidity_usd)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (token_address, hour) DO UPDATE
             SET tx_count = $3, unique_buyers = $5, holders = $6`,
            [tokenAddress, now, txCount, 0, uniqueBuyers, holders, 0]
          );
          
          logger.debug(`Updated stats for token ${tokenAddress}`);
        } catch (error) {
          logger.error(`Error processing token ${tokenAddress}:`, error);
          // Continue with other tokens
        }
      }
      
      await client.query('COMMIT');
      logger.info('Token stats update complete');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating token stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.rateLimit();
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      return {
        healthy: true,
        version: version['solana-core'],
        currentSlot: slot,
        endpoint: this.connection.rpcEndpoint
      };
    } catch (error) {
      logger.error('RPC health check failed:', error);
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = SolanaRpcService;
