/**
 * Real Data Service
 * Fetches real-time Solana blockchain data from Solscan API
 * Replaces mockDataGenerator.ts with actual blockchain data
 */

import { getSolscanAPI } from './solscanAPI';
import { getServiceRoleClient } from './supabase';
import type { Token } from '../types';

export class RealDataService {
  private solscan = getSolscanAPI();
  private supabase = getServiceRoleClient();

  /**
   * Fetch and store real trending tokens from Solana
   */
  async fetchAndStoreTrendingTokens(limit: number = 50): Promise<void> {
    try {
      console.log(`Fetching top ${limit} trending tokens from Solscan...`);
      
      const response = await this.solscan.getTrendingTokens(limit, 'volume');
      
      if (!response || !Array.isArray(response)) {
        throw new Error('No trending tokens data received');
      }

      const tokens = response;
      const tokensToInsert: Token[] = [];

      for (const token of tokens) {
        // Get token metadata for additional info
        try {
          const meta = await this.solscan.getTokenMeta(token.address);
          
          tokensToInsert.push({
            token_address: token.address,
            symbol: meta?.data?.symbol || token.symbol || 'UNKNOWN',
            name: meta?.data?.name || token.name || 'Unknown Token',
            logo_url: meta?.data?.icon || token.icon || null,
          });
        } catch (error) {
          console.error(`Error fetching metadata for ${token.address}:`, error);
          // Use basic token info if metadata fetch fails
          tokensToInsert.push({
            token_address: token.address,
            symbol: token.symbol || 'UNKNOWN',
            name: token.name || 'Unknown Token',
            logo_url: token.icon || null,
          });
        }
      }

      // Upsert tokens to database
      await this.supabase
        .from('tokens')
        .upsert(
          tokensToInsert.map(t => ({
            ...t,
            last_updated: new Date().toISOString(),
          })),
          { onConflict: 'token_address' }
        );

      console.log(`Successfully stored ${tokensToInsert.length} trending tokens`);
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      throw error;
    }
  }

  /**
   * Fetch and store real-time network statistics
   */
  async fetchAndStoreNetworkStats(): Promise<void> {
    try {
      console.log('Fetching real-time network statistics...');

      // Get recent blocks to calculate network stats
      const blocksResponse = await this.solscan.getBlocks({
        limit: 100,
        sort_by: 'block_time',
        sort_order: 'desc',
      });

      if (!blocksResponse || !blocksResponse.data) {
        throw new Error('No blocks data received');
      }

      const blocks = blocksResponse.data;
      
      // Get recent transactions
      const txResponse = await this.solscan.getLastTransactions(100);
      const transactions = txResponse?.data || [];

      // Calculate hourly statistics
      const now = new Date();
      const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);

      // Group blocks by hour
      const hourlyBlocks = blocks.filter((block: any) => {
        const blockTime = new Date(block.block_time * 1000);
        return blockTime >= currentHour;
      });

      // Calculate stats
      const totalTransactions = hourlyBlocks.reduce((sum: number, block: any) => 
        sum + (block.transactions || 0), 0
      );
      
      const uniqueWallets = new Set(
        transactions.flatMap((tx: any) => [
          tx.signer || '',
          ...(tx.parsedInstructions?.map((i: any) => i.programId) || [])
        ]).filter(Boolean)
      ).size;

      const avgCuPerBlock = hourlyBlocks.length > 0
        ? hourlyBlocks.reduce((sum: number, block: any) => sum + (block.total_compute_units || 0), 0) / hourlyBlocks.length
        : 0;

      // Store network stats
      await this.supabase
        .from('network_hourly_stats')
        .upsert(
          {
            hour: currentHour.toISOString(),
            total_transactions: totalTransactions,
            total_blocks: hourlyBlocks.length,
            unique_wallets: uniqueWallets,
            avg_cu_per_block: Math.round(avgCuPerBlock),
          },
          { onConflict: 'hour' }
        );

      console.log(`Stored network stats for ${currentHour.toISOString()}: ${totalTransactions} tx, ${hourlyBlocks.length} blocks`);
    } catch (error) {
      console.error('Error fetching network stats:', error);
      throw error;
    }
  }

  /**
   * Fetch and store token hourly statistics
   */
  async fetchAndStoreTokenStats(tokenAddresses: string[]): Promise<void> {
    try {
      console.log(`Fetching stats for ${tokenAddresses.length} tokens...`);

      const now = new Date();
      const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
      const oneHourAgo = new Date(currentHour.getTime() - 60 * 60 * 1000);

      const statsToInsert = [];

      for (const tokenAddress of tokenAddresses) {
        try {
          // Get token transfers for the last hour
          const transfers = await this.solscan.getTokenTransfers({
            address: tokenAddress,
            limit: 1000, // Max reasonable limit
          });

          if (!transfers || !transfers.data) continue;

          // Filter transfers from last hour
          const hourlyTransfers = transfers.data.filter((transfer: any) => {
            const transferTime = new Date(transfer.block_time * 1000);
            return transferTime >= oneHourAgo && transferTime < currentHour;
          });

          // Calculate statistics
          const txCount = hourlyTransfers.length;
          const txVolume = hourlyTransfers.reduce((sum: number, t: any) => 
            sum + (parseFloat(t.amount) || 0), 0
          );

          const uniqueBuyers = new Set(
            hourlyTransfers
              .filter((t: any) => t.from_address)
              .map((t: any) => t.to_address)
          ).size;

          // Get current holders count
          const holdersResponse = await this.solscan.getTokenHolders(tokenAddress, 1);
          const holders = holdersResponse?.data?.total || 0;

          // Get current price to calculate USD volume
          let volumeUSD = 0;
          try {
            const priceResponse = await this.solscan.getTokenPrice(tokenAddress);
            const price = priceResponse?.data?.price || 0;
            volumeUSD = txVolume * price;
          } catch (error) {
            console.error(`Error getting price for ${tokenAddress}:`, error);
          }

          statsToInsert.push({
            token_address: tokenAddress,
            hour: currentHour.toISOString(),
            tx_count: txCount,
            tx_volume_usd: Math.round(volumeUSD),
            unique_buyers: uniqueBuyers,
            holders: holders,
            liquidity_usd: 0, // Would need DEX data for this
          });
        } catch (error) {
          console.error(`Error fetching stats for token ${tokenAddress}:`, error);
        }
      }

      if (statsToInsert.length > 0) {
        // Insert in batches
        for (let i = 0; i < statsToInsert.length; i += 50) {
          const batch = statsToInsert.slice(i, i + 50);
          await this.supabase
            .from('token_hourly_stats')
            .upsert(batch, { onConflict: 'token_address,hour' });
        }

        console.log(`Stored stats for ${statsToInsert.length} tokens`);
      }
    } catch (error) {
      console.error('Error fetching token stats:', error);
      throw error;
    }
  }

  /**
   * Monitor and store whale activity (large transactions)
   */
  async monitorWhaleActivity(thresholdUSD: number = 10000): Promise<void> {
    try {
      console.log(`Monitoring whale activity (threshold: $${thresholdUSD})...`);

      // Get recent transactions
      const txResponse = await this.solscan.getLastTransactions(200);
      
      if (!txResponse || !txResponse.data) {
        throw new Error('No transactions data received');
      }

      const transactions = txResponse.data;
      const whaleActivities = [];

      for (const tx of transactions) {
        try {
          // Parse transaction to find token transfers
          const parsedInstructions = tx.parsedInstructions || [];
          
          for (const instruction of parsedInstructions) {
            if (instruction.type === 'transfer' || instruction.type === 'transferChecked') {
              const amount = parseFloat(instruction.params?.amount || '0');
              const tokenAddress = instruction.params?.mint || instruction.params?.tokenAddress;

              if (!tokenAddress || amount === 0) continue;

              // Get token price to calculate USD value
              try {
                const priceResponse = await this.solscan.getTokenPrice(tokenAddress);
                const price = priceResponse?.data?.price || 0;
                const amountUSD = amount * price;

                if (amountUSD >= thresholdUSD) {
                  whaleActivities.push({
                    token_address: tokenAddress,
                    activity_type: instruction.params?.source ? 'sell' : 'buy',
                    amount_usd: Math.round(amountUSD),
                    wallet_address: tx.signer || 'unknown',
                    timestamp: new Date(tx.block_time * 1000).toISOString(),
                  });
                }
              } catch (error) {
                // Skip if we can't get price
                continue;
              }
            }
          }
        } catch (error) {
          console.error(`Error parsing transaction ${tx.signature}:`, error);
        }
      }

      if (whaleActivities.length > 0) {
        // Remove duplicates and insert
        const uniqueActivities = Array.from(
          new Map(whaleActivities.map(item => [
            `${item.token_address}-${item.wallet_address}-${item.timestamp}`, 
            item
          ])).values()
        );

        await this.supabase
          .from('whale_activity')
          .insert(uniqueActivities);

        console.log(`Stored ${uniqueActivities.length} whale activities`);
      } else {
        console.log('No whale activities detected in recent transactions');
      }
    } catch (error) {
      console.error('Error monitoring whale activity:', error);
      throw error;
    }
  }

  /**
   * Update token details cache with real data
   */
  async updateTokenDetailsCache(): Promise<void> {
    try {
      console.log('Updating token details cache with real data...');

      // Get all tokens from database
      const { data: tokens, error } = await this.supabase
        .from('tokens')
        .select('token_address')
        .limit(100);

      if (error || !tokens) {
        throw new Error('Failed to fetch tokens from database');
      }

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const cacheRecords = [];

      for (const token of tokens) {
        try {
          // Get 24h stats from database
          const { data: stats } = await this.supabase
            .from('token_hourly_stats')
            .select('*')
            .eq('token_address', token.token_address)
            .gte('hour', oneDayAgo.toISOString());

          if (!stats || stats.length === 0) continue;

          const volume24h = stats.reduce((sum, s) => sum + Number(s.tx_volume_usd), 0);
          const buyers24h = stats.reduce((sum, s) => sum + Number(s.unique_buyers), 0);
          const totalTransactions = stats.reduce((sum, s) => sum + Number(s.tx_count), 0);
          const currentHolders = Math.max(...stats.map(s => Number(s.holders)));
          const avgLiquidity = stats.reduce((sum, s) => sum + Number(s.liquidity_usd), 0) / stats.length;

          // Calculate price change using real price data
          let priceChange = 0;
          try {
            const priceResponse = await this.solscan.getTokenPrice(token.token_address);
            priceChange = priceResponse?.data?.price_change_24h || 0;
          } catch (error) {
            // Use volume-based estimate if price data unavailable
            const firstHalfVolume = stats.slice(0, Math.floor(stats.length / 2))
              .reduce((sum, s) => sum + Number(s.tx_volume_usd), 0);
            const secondHalfVolume = stats.slice(Math.floor(stats.length / 2))
              .reduce((sum, s) => sum + Number(s.tx_volume_usd), 0);
            priceChange = firstHalfVolume > 0 
              ? ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100 
              : 0;
          }

          cacheRecords.push({
            token_address: token.token_address,
            volume_24h_usd: Math.round(volume24h),
            unique_buyers_24h: buyers24h,
            holders: currentHolders,
            liquidity_usd: Math.round(avgLiquidity),
            total_transactions_24h: totalTransactions,
            price_change_24h: Number(priceChange.toFixed(2)),
            last_updated: now.toISOString(),
          });
        } catch (error) {
          console.error(`Error updating cache for token ${token.token_address}:`, error);
        }
      }

      // Insert cache records in batches
      for (let i = 0; i < cacheRecords.length; i += 50) {
        const batch = cacheRecords.slice(i, i + 50);
        await this.supabase
          .from('token_details_cache')
          .upsert(batch, { onConflict: 'token_address' });
      }

      console.log(`Updated cache for ${cacheRecords.length} tokens`);
    } catch (error) {
      console.error('Error updating token details cache:', error);
      throw error;
    }
  }

  /**
   * Full data refresh - fetch all real data
   */
  async refreshAllData(): Promise<void> {
    try {
      console.log('Starting full data refresh with real Solana blockchain data...');

      // 1. Fetch and store trending tokens
      await this.fetchAndStoreTrendingTokens(50);

      // 2. Fetch and store network statistics
      await this.fetchAndStoreNetworkStats();

      // 3. Get token addresses for detailed stats
      const { data: tokens } = await this.supabase
        .from('tokens')
        .select('token_address')
        .limit(50);

      if (tokens && tokens.length > 0) {
        const tokenAddresses = tokens.map(t => t.token_address);

        // 4. Fetch and store token statistics
        await this.fetchAndStoreTokenStats(tokenAddresses);
      }

      // 5. Monitor whale activity
      await this.monitorWhaleActivity(10000);

      // 6. Update token details cache
      await this.updateTokenDetailsCache();

      console.log('Full data refresh completed successfully!');
    } catch (error) {
      console.error('Error during full data refresh:', error);
      throw error;
    }
  }

  /**
   * Get current network statistics (returns data instead of storing)
   */
  async fetchNetworkStats() {
    try {
      // Get recent blocks to calculate network stats
      const blocksResponse = await this.solscan.getBlocks({
        limit: 100,
        sort_by: 'block_time',
        sort_order: 'desc',
      });

      if (!blocksResponse || !blocksResponse.data) {
        throw new Error('No blocks data received');
      }

      const blocks = blocksResponse.data;
      
      // Get recent transactions
      const txResponse = await this.solscan.getLastTransactions(100);
      const transactions = txResponse?.data || [];

      // Calculate current statistics
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const recentBlocks = blocks.filter(block => 
        new Date(block.block_time) > oneHourAgo
      );
      
      const recentTransactions = transactions.filter(tx => 
        new Date(tx.block_time) > oneHourAgo
      );

      const totalTransactions = recentTransactions.length;
      const totalBlocks = recentBlocks.length;
      const avgCUPerBlock = recentBlocks.reduce((sum, block) => {
        const cuConsumed = block.meta?.compute_units_consumed || 0;
        return sum + cuConsumed;
      }, 0) / Math.max(totalBlocks, 1);

      return {
        timestamp: now.toISOString(),
        transactions_last_hour: totalTransactions,
        blocks_last_hour: totalBlocks,
        estimated_tps: Math.round(totalTransactions / 3600),
        avg_cu_per_block: Math.round(avgCUPerBlock),
        unique_wallets: new Set([
          ...recentTransactions.flatMap(tx => [
            ...tx.meta.pre_balances.map(() => 'sender'),
            ...tx.meta.post_balances.map(() => 'receiver')
          ])
        ]).size
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      throw error;
    }
  }

  /**
   * Get API usage statistics
   */
  getAPIStats() {
    return {
      solscan: {
        cache: this.solscan.getCacheStats(),
        rateLimit: this.solscan.getRateLimitStats(),
      },
    };
  }
}

// Singleton instance
let realDataServiceInstance: RealDataService | null = null;

export function getRealDataService(): RealDataService {
  if (!realDataServiceInstance) {
    realDataServiceInstance = new RealDataService();
  }
  return realDataServiceInstance;
}

export const realDataService = new RealDataService();
