import { getServiceRoleClient } from './supabase';
import type { Token } from '../types';

export class MockDataGenerator {
  private tokens: Token[] = [
    { token_address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', logo_url: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
    { token_address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', symbol: 'POPCAT', name: 'Popcat', logo_url: 'https://cf-ipfs.com/ipfs/QmPeJPKKwCtm5bBjXvQQc5fZ7RhSr3CQVUVQPBKpkYgPAf' },
    { token_address: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk', symbol: 'WEN', name: 'Wen', logo_url: 'https://shdw-drive.genesysgo.net/AzjHvXgqUJortnr5fXDG2aPkp2PfFMvu4Egr57fdiite/WEN' },
    { token_address: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5', symbol: 'MEW', name: 'Cat in a dogs world', logo_url: 'https://bafybeicj2kqyx5rb6yzmogmzmwjbzz3gf5l3vmdqefuqhg6gtdqvjc2toy.ipfs.nftstorage.link' },
    { token_address: 'GJtJuWD9qYcCkrwMBmtY1tpapV1sKfB2zUv9Q4aqpump', symbol: 'FARTCOIN', name: 'Fartcoin', logo_url: 'https://bafkreicxbvl7j6fxdwpz5vxtpf4kxhbxxmr6vxbqj5b2zmtqukdw5j7ebe.ipfs.nftstorage.link' },
    { token_address: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', symbol: 'HELP', name: 'Help', logo_url: 'https://bafkreibzuqsqzwmnq7dpmxz7xwx6v7qvxgqmecxsjrq6z7q7z5q7z5q7z5.ipfs.nftstorage.link' },
    { token_address: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', symbol: 'CHILLGUY', name: 'Just a chill guy', logo_url: 'https://bafkreih4i6kftb5anyv5d6ysn5pc5olzrqmv66cysq36x5b2dzdyqmqr2e.ipfs.nftstorage.link' },
    { token_address: 'Bqdb9e1QBBrFqBUCDGcWWq8fBj1hjCRYLPRPKT9Lpump', symbol: 'PNUT', name: 'Peanut the Squirrel', logo_url: 'https://bafkreic4u7yyqjxrfqgbx3i2aenq63bfqlb3qxewcmpz2w2bjw3r3w3dq4.ipfs.nftstorage.link' },
    { token_address: '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn', symbol: 'HARAMBE', name: 'Harambe on Solana', logo_url: 'https://bafkreigr3sjnogps4jvmvqkj6l4q6k7uvzrg6l4q6k7uvzrg6l4q6k7uvz.ipfs.nftstorage.link' },
    { token_address: 'GEoq9xWzypARbYX8oDKe8XoUFqAD4qdXFbD8FYo4pump', symbol: 'GOAT', name: 'Goatseus Maximus', logo_url: 'https://bafkreia7fy2sqpyikf3mtnscyqvxjzxfxm7zxzxfxm7zxzxfxm7zxzxfxm.ipfs.nftstorage.link' }
  ];

  constructor() {
    // Generate 40 more random meme tokens
    for (let i = 0; i < 40; i++) {
      const randomSymbols = ['DOGE', 'SHIB', 'PEPE', 'WOJAK', 'CHAD', 'MOON', 'ROCKET', 'DIAMOND', 'APE', 'WAGMI'];
      const randomNames = ['Moon', 'Diamond', 'Rocket', 'Ape', 'Chad', 'Wojak', 'Pepe', 'Doge', 'Shib', 'Lambo'];
      
      const symbol = randomSymbols[i % 10] + (i + 1);
      const name = randomNames[i % 10] + ' Token ' + (i + 1);
      const address = this.generateRandomAddress();
      
      this.tokens.push({
        token_address: address,
        symbol,
        name,
        logo_url: `https://via.placeholder.com/150?text=${symbol}`
      });
    }
  }

  private generateRandomAddress(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  // Generate activity multiplier based on hour (UTC)
  private getActivityMultiplier(hour: Date): number {
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
      return 0.8 + Math.random() * 0.7 + (Math.random() > 0.9 ? 0.5 : 0);
    }
    // Late night (22:00-02:00 UTC): 0.4-0.7x activity
    else {
      return 0.4 + Math.random() * 0.3;
    }
  }

  async insertTokens(): Promise<void> {
    const supabase = getServiceRoleClient();
    
    for (const token of this.tokens) {
      await supabase
        .from('tokens')
        .upsert({
          token_address: token.token_address,
          symbol: token.symbol,
          name: token.name,
          logo_url: token.logo_url,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'token_address'
        });
    }
    
    console.log(`Inserted/updated ${this.tokens.length} tokens`);
  }

  async generateNetworkStats(hours: number = 24): Promise<void> {
    const supabase = getServiceRoleClient();
    
    const now = new Date();
    now.setMinutes(0, 0, 0);
    
    const statsToInsert = [];
    
    for (let i = 0; i < hours; i++) {
      const hour = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const multiplier = this.getActivityMultiplier(hour);
      
      // Base Solana network stats
      const baseTransactions = 2500000;
      const baseBlocks = 1200;
      const baseWallets = 150000;
      const baseCU = 48000000;
      
      statsToInsert.push({
        hour: hour.toISOString(),
        total_transactions: Math.floor(baseTransactions * multiplier),
        total_blocks: Math.floor(baseBlocks * multiplier * 0.95),
        unique_wallets: Math.floor(baseWallets * multiplier),
        avg_cu_per_block: Math.floor(baseCU * (0.9 + multiplier * 0.2))
      });
    }
    
    await supabase
      .from('network_hourly_stats')
      .upsert(statsToInsert, {
        onConflict: 'hour'
      });
    
    console.log(`Generated network stats for ${hours} hours`);
  }

  async generateTokenStats(hours: number = 24): Promise<void> {
    const supabase = getServiceRoleClient();
    
    const now = new Date();
    now.setMinutes(0, 0, 0);
    
    const allStatsToInsert = [];
    
    for (const token of this.tokens) {
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
        
        allStatsToInsert.push({
          token_address: token.token_address,
          hour: hour.toISOString(),
          tx_count: Math.floor(baseTxCount * finalMultiplier * (0.8 + Math.random() * 0.4)),
          tx_volume_usd: Math.floor(baseVolume * finalMultiplier * (0.7 + Math.random() * 0.6)),
          unique_buyers: Math.floor(baseBuyers * finalMultiplier * (0.8 + Math.random() * 0.4)),
          holders: Math.floor(baseHolders * (1 + tokenRank * 0.1) * (0.98 + Math.random() * 0.04)),
          liquidity_usd: Math.floor(baseLiquidity * (1 + tokenRank * 0.15) * (0.95 + Math.random() * 0.1))
        });
      }
    }
    
    // Insert in batches of 100
    for (let i = 0; i < allStatsToInsert.length; i += 100) {
      const batch = allStatsToInsert.slice(i, i + 100);
      await supabase
        .from('token_hourly_stats')
        .upsert(batch, {
          onConflict: 'token_address,hour'
        });
    }
    
    console.log(`Generated token stats for ${this.tokens.length} tokens over ${hours} hours`);
  }

  async generateAll(): Promise<void> {
    console.log('Starting mock data generation...');
    await this.insertTokens();
    await this.generateNetworkStats(24);
    await this.generateTokenStats(24);
    console.log('Mock data generation complete!');
  }
}

export const mockDataGenerator = new MockDataGenerator();
