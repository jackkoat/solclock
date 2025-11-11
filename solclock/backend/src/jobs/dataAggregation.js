/**
 * Data Aggregation Job
 * Generates mock data and calculates rankings
 * Run this script to populate the database with test data
 */

const MockDataGenerator = require('../services/mockDataGenerator');
const scoringService = require('../services/scoringService');

async function runDataAggregation() {
  console.log('=== SolClock Data Aggregation Job ===');
  console.log('Starting at:', new Date().toISOString());
  
  try {
    // Initialize mock data generator
    const generator = new MockDataGenerator();
    
    // Generate all mock data
    await generator.generateAll();
    
    // Calculate rankings
    console.log('\nCalculating Top 50 rankings...');
    const rankings = await scoringService.calculateTop50();
    console.log(`Top 50 rankings calculated. Leader: ${rankings[0].symbol} with score ${rankings[0].score}`);
    
    console.log('\n=== Data Aggregation Complete ===');
    console.log('Finished at:', new Date().toISOString());
    
    process.exit(0);
  } catch (error) {
    console.error('Data aggregation failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runDataAggregation();
}

module.exports = runDataAggregation;
