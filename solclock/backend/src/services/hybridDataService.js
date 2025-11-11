/**
 * Hybrid Data Service
 * Switches between mock data and real Solana RPC based on configuration
 */

const MockDataGenerator = require('./mockDataGenerator');
const SolanaRpcService = require('./solanaRpcService');
const logger = require('../utils/logger');

class HybridDataService {
  constructor() {
    this.useRealData = process.env.USE_REAL_DATA === 'true';
    this.mockGenerator = new MockDataGenerator();
    this.rpcService = new SolanaRpcService();
    
    logger.info(`Hybrid Data Service initialized. Mode: ${this.useRealData ? 'REAL DATA' : 'MOCK DATA'}`);
  }

  /**
   * Generate/fetch network statistics
   */
  async updateNetworkStats(hours = 24) {
    try {
      if (this.useRealData) {
        logger.info('Fetching real network stats from Solana RPC...');
        await this.rpcService.aggregateNetworkStats(hours);
      } else {
        logger.info('Generating mock network stats...');
        await this.mockGenerator.generateNetworkStats(hours);
      }
    } catch (error) {
      logger.error('Error updating network stats:', error);
      
      // Fallback to mock data if real data fails
      if (this.useRealData) {
        logger.warn('Falling back to mock data for network stats');
        await this.mockGenerator.generateNetworkStats(hours);
      }
      
      throw error;
    }
  }

  /**
   * Generate/fetch token statistics
   */
  async updateTokenStats(hours = 24) {
    try {
      // Always ensure tokens are inserted first
      await this.mockGenerator.insertTokens();
      
      if (this.useRealData) {
        logger.info('Fetching real token stats from Solana RPC...');
        
        // Get token addresses from database
        const tokenAddresses = this.mockGenerator.tokens.map(t => t.address);
        
        // Update with real data (limited by RPC capabilities)
        await this.rpcService.updateTokenStats(tokenAddresses);
        
        // For historical data, still use mock for hours > 1
        // Real-time indexing requires Helius/Solscan subscription
        if (hours > 1) {
          logger.info('Using mock data for historical token stats (hours > 1)');
          await this.mockGenerator.generateTokenStats(hours);
        }
      } else {
        logger.info('Generating mock token stats...');
        await this.mockGenerator.generateTokenStats(hours);
      }
    } catch (error) {
      logger.error('Error updating token stats:', error);
      
      // Fallback to mock data
      if (this.useRealData) {
        logger.warn('Falling back to mock data for token stats');
        await this.mockGenerator.generateTokenStats(hours);
      }
      
      throw error;
    }
  }

  /**
   * Full data update pipeline
   */
  async updateAll(hours = 24) {
    logger.info('Starting data update pipeline...');
    
    try {
      await this.updateNetworkStats(hours);
      await this.updateTokenStats(hours);
      logger.info('Data update pipeline complete!');
    } catch (error) {
      logger.error('Data update pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (this.useRealData) {
      return await this.rpcService.healthCheck();
    }
    return {
      healthy: true,
      mode: 'mock',
      message: 'Mock data mode - no RPC connection'
    };
  }

  /**
   * Get data source mode
   */
  getMode() {
    return {
      useRealData: this.useRealData,
      mode: this.useRealData ? 'real' : 'mock',
      description: this.useRealData 
        ? 'Fetching data from Solana RPC' 
        : 'Using mock data generator'
    };
  }
}

module.exports = HybridDataService;
