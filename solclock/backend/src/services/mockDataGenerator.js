/**
 * Mock Data Generator
 * Generates realistic Solana network and meme token data
 */

const pool = require('../db/pool');

class MockDataGenerator {
  constructor() {
    // Top meme coins with realistic metadata
    this.tokens = [
      { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', logo: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
      { address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', symbol: 'POPCAT', name: 'Popcat', logo: 'https://cf-ipfs.com/ipfs/QmPeJPKKwCtm5bBjXvQQc5fZ7RhSr3CQVUVQPBKpkYgPAf' },
      { address: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk', symbol: 'WEN', name: 'Wen', logo: 'https://shdw-drive.genesysgo.net/AzjHvXgqUJortnr5fXDG2aPkp2PfFMvu4Egr57fdiite/WEN' },
      { address: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5', symbol: 'MEW', name: 'Cat in a dogs world', logo: 'https://bafybeicj2kqyx5rb6yzmogmzmwjbzz3gf5l3vmdqefuqhg6gtdqvjc2toy.ipfs.nftstorage.link' },
      { address: 'GJtJuWD9qYcCkrwMBmtY1tpapV1sKfB2zUv9Q4aqpump', symbol: 'FARTCOIN', name: 'Fartcoin', logo: 'https://bafkreicxbvl7j6fxdwpz5vxtpf4kxhbxxmr6vxbqj5b2zmtqukdw5j7ebe.ipfs.nftstorage.link' },
      { address: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', symbol: 'HELP', name: 'Help', logo: 'https://bafkreibzuqsqzwmnq7dpmxz7xwx6v7qvxgqmecxsjrq6z7q7z5q7z5q7z5.ipfs.nftstorage.link' },
      { address: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', symbol: 'CHILLGUY', name: 'Just a chill guy', logo: 'https://bafkreih4i6kftb5anyv5d6ysn5pc5olzrqmv66cysq36x5b2dzdyqmqr2e.ipfs.nftstorage.link' },
      { address: 'Bqdb9e1QBBrFqBUCDGcWWq8fBj1hjCRYLPRPKT9Lpump', symbol: 'PNUT', name: 'Peanut the Squirrel', logo: 'https://bafkreic4u7yyqjxrfqgbx3i2aenq63bfqlb3qxewcmpz2w2bjw3r3w3dq4.ipfs.nftstorage.link' },
      { address: '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn', symbol: 'HARAMBE', name: 'Harambe on Solana', logo: 'https://bafkreigr3sjnogps4jvmvqkj6l4q6k7uvzrg6l4q6k7uvzrg6l4q6k7uvz.ipfs.nftstorage.link' },
      { address: 'GEoq9xWzypARbYX8oDKe8XoUFqAD4qdXFbD8FYo4pump', symbol: 'GOAT', name: 'Goatseus Maximus', logo: 'https://bafkreia7fy2sqpyikf3mtnscyqvxjzxfxm7zxzxfxm7zxzxfxm7zxzxfxm.ipfs.nftstorage.link' }
    ];

    // Generate 40 more random meme tokens
    for (let i = 0; i < 40; i++) {
      const randomSymbols = ['DOGE', 'SHIB', 'PEPE', 'WOJAK', 'CHAD', 'MOON', 'ROCKET', 'DIAMOND', 'APE', 'WAGMI'];
      const randomNames = ['Moon', 'Diamond', 'Rocket', 'Ape', 'Chad', 'Wojak', 'Pepe', 'Doge', 'Shib', 'Lambo'];
      
      const symbol = randomSymbols[i % 10] + (i + 1);
      const name = randomNames[i % 10] + ' Token ' + (i + 1);
      const address = this.generateRandomAddress();
      
      this.tokens.push({
        address,
        symbol,
        name,
        logo: `https://via.placeholder.com/150?text=${symbol}`
      });
    }
  }

  generateRandomAddress() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  // Generate activity multiplier based on hour (UTC)
  // Higher activity during US trading hours (14:00-22:00 UTC)
  getActivityMultiplier(hour) {
    const h = hour.getUTCHours();
    
    // Night hours (02:00-08:00 UTC): 0.3-0.5x activity
    if (h >= 2 && h < 8) {
      return 0.3 + Math.random() * 0.2;
    }
    // Morning (08:00-14:00 UTC): 0.5-0.8x activity
    else if (h >= 8 && h < 14) {
      return 0.5 + Math.random() * 0.3;
    }
    // Peak hours (14:00-22:00 UTC): 0.8-1.5x activity
    else if (h >= 14 && h < 22) {
      return 0.8 + Math.random() * 0.7 + (Math.random() > 0.9 ? 0.5 : 0); // Random spikes
    }
    // Late night (22:00-02:00 UTC): 0.4-0.7x activity
    else {
      return 0.4 + Math.random() * 0.3;
    }
  }

  async insertTokens() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const token of this.tokens) {
        await client.query(
          `INSERT INTO tokens (token_address, symbol, name, logo_url, created_at, last_updated)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (token_address) DO UPDATE
           SET symbol = $2, name = $3, logo_url = $4, last_updated = NOW()`,
          [token.address, token.symbol, token.name, token.logo]
        );
      }
      
      await client.query('COMMIT');
      console.log(`Inserted/updated ${this.tokens.length} tokens`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error inserting tokens:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async generateNetworkStats(hours = 24) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const now = new Date();
      now.setMinutes(0, 0, 0); // Round to hour
      
      for (let i = 0; i < hours; i++) {
        const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
        const multiplier = this.getActivityMultiplier(hour);
        
        // Base Solana network stats
        const baseTransactions = 2500000;
        const baseBlocks = 1200;
        const baseWallets = 150000;
        const baseCU = 48000000;
        
        const stats = {
          hour,
          totalTransactions: Math.floor(baseTransactions * multiplier),
          totalBlocks: Math.floor(baseBlocks * multiplier * 0.95), // Slightly less variance
          uniqueWallets: Math.floor(baseWallets * multiplier),
          avgCuPerBlock: Math.floor(baseCU * (0.9 + multiplier * 0.2))
        };
        
        await client.query(
          `INSERT INTO network_hourly_stats (hour, total_transactions, total_blocks, unique_wallets, avg_cu_per_block)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (hour) DO UPDATE
           SET total_transactions = $2, total_blocks = $3, unique_wallets = $4, avg_cu_per_block = $5`,
          [stats.hour, stats.totalTransactions, stats.totalBlocks, stats.uniqueWallets, stats.avgCuPerBlock]
        );
      }
      
      await client.query('COMMIT');
      console.log(`Generated network stats for ${hours} hours`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error generating network stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async generateTokenStats(hours = 24) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const now = new Date();
      now.setMinutes(0, 0, 0);
      
      for (const token of this.tokens) {
        // Each token has a base activity level (top tokens have higher base)
        const tokenRank = this.tokens.indexOf(token);
        const baseActivity = tokenRank < 10 ? 1.0 : tokenRank < 30 ? 0.6 : 0.3;
        
        for (let i = 0; i < hours; i++) {
          const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
          const hourMultiplier = this.getActivityMultiplier(hour);
          const finalMultiplier = baseActivity * hourMultiplier;
          
          // Base token stats
          const baseTxCount = 500;
          const baseVolume = 100000;
          const baseBuyers = 200;
          const baseHolders = 10000;
          const baseLiquidity = 500000;
          
          const stats = {
            txCount: Math.floor(baseTxCount * finalMultiplier * (0.8 + Math.random() * 0.4)),
            txVolumeUsd: Math.floor(baseVolume * finalMultiplier * (0.7 + Math.random() * 0.6)),
            uniqueBuyers: Math.floor(baseBuyers * finalMultiplier * (0.8 + Math.random() * 0.4)),
            holders: Math.floor(baseHolders * (1 + tokenRank * 0.1) * (0.98 + Math.random() * 0.04)),
            liquidityUsd: Math.floor(baseLiquidity * (1 + tokenRank * 0.15) * (0.95 + Math.random() * 0.1))
          };
          
          await client.query(
            `INSERT INTO token_hourly_stats (token_address, hour, tx_count, tx_volume_usd, unique_buyers, holders, liquidity_usd)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (token_address, hour) DO UPDATE
             SET tx_count = $3, tx_volume_usd = $4, unique_buyers = $5, holders = $6, liquidity_usd = $7`,
            [token.address, hour, stats.txCount, stats.txVolumeUsd, stats.uniqueBuyers, stats.holders, stats.liquidityUsd]
          );
        }
      }
      
      await client.query('COMMIT');
      console.log(`Generated token stats for ${this.tokens.length} tokens over ${hours} hours`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error generating token stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async generateAll() {
    console.log('Starting mock data generation...');
    await this.insertTokens();
    await this.generateNetworkStats(24);
    await this.generateTokenStats(24);
    console.log('Mock data generation complete!');
  }
}

module.exports = MockDataGenerator;
