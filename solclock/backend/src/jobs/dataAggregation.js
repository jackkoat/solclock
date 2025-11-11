/**
 * Data Aggregation Job
 * Fetches and aggregates Solana network and token data
 * Can use either mock data or real Solana RPC based on configuration
 */

require('dotenv').config();
const HybridDataService = require('../services/hybridDataService');
const scoringService = require('../services/scoringService');
const logger = require('../utils/logger');

async function runDataAggregation() {
  console.log('=== SolClock Data Aggregation Job ===');
  console.log('Starting at:', new Date().toISOString());
  
  const dataService = new HybridDataService();
  
  try {
    // Show current mode
    const mode = dataService.getMode();
    console.log(`Data Source Mode: ${mode.description}`);
    
    // Health check (if using real data)
    if (mode.useRealData) {
      console.log('\nPerforming health check...');
      const health = await dataService.healthCheck();
      console.log('Health status:', health);
    }
    
    // Generate/fetch all data
    console.log('\nFetching network and token data...');
    await dataService.updateAll(24);
    
    // Calculate rankings
    console.log('\nCalculating Top 50 rankings...');
    const rankings = await scoringService.calculateTop50();
    console.log(`Top 50 rankings calculated. Leader: ${rankings[0].symbol} with score ${rankings[0].score}`);
    
    console.log('\n=== Data Aggregation Complete ===');
    console.log('Finished at:', new Date().toISOString());
    
    process.exit(0);
  } catch (error) {
    console.error('Data aggregation failed:', error);
    logger.error('Data aggregation failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runDataAggregation();
}

module.exports = runDataAggregation;
