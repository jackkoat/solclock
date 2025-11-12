import { getServiceRoleClient } from './supabase';
import type { MemeToken } from '../types';

class ScoringService {
  private weights = {
    volume: 0.35,
    uniqueBuyers: 0.20,
    holdersGrowth: 0.15,
    liquidity: 0.15,
    socialScore: 0.10
  };

  private normalize(value: number, min: number, max: number): number {
    if (max === min) return 50;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }

  private calculateSocialScore(volume: number, buyers: number): number {
    const volumeScore = Math.log10(volume + 1) * 10;
    const buyersScore = Math.log10(buyers + 1) * 15;
    return Math.min(100, volumeScore + buyersScore);
  }

  async calculateTop50(): Promise<MemeToken[]> {
    const supabase = getServiceRoleClient();
    
    try {
      // Try to use the token_details_cache for better performance
      const { data: cachedData, error: cacheError } = await supabase
        .from('token_details_cache')
        .select(`
          token_address,
          volume_24h_usd,
          unique_buyers_24h,
          holders,
          liquidity_usd,
          total_transactions_24h,
          price_change_24h,
          tokens!inner(symbol, name, logo_url)
        `)
        .order('volume_24h_usd', { ascending: false })
        .limit(100);
      
      if (!cacheError && cachedData && cachedData.length > 0) {
        // Use cached data
        const scoredTokens: MemeToken[] = cachedData.map((item: any) => ({
          rank: 0,
          token_address: item.token_address,
          symbol: item.tokens.symbol,
          name: item.tokens.name,
          logo_url: item.tokens.logo_url,
          volume_24h_usd: Number(item.volume_24h_usd),
          unique_buyers_24h: Number(item.unique_buyers_24h),
          holders: Number(item.holders),
          liquidity_usd: Number(item.liquidity_usd),
          score: 0,
          price_change_24h: Number(item.price_change_24h)
        }));
        
        if (scoredTokens.length === 0) return [];
        
        // Calculate scores
        const volumes = scoredTokens.map(t => t.volume_24h_usd);
        const buyers = scoredTokens.map(t => t.unique_buyers_24h);
        const liquidity = scoredTokens.map(t => t.liquidity_usd);
        
        const minVolume = Math.min(...volumes);
        const maxVolume = Math.max(...volumes);
        const minBuyers = Math.min(...buyers);
        const maxBuyers = Math.max(...buyers);
        const minLiquidity = Math.min(...liquidity);
        const maxLiquidity = Math.max(...liquidity);
        
        scoredTokens.forEach(token => {
          const volumeNorm = this.normalize(token.volume_24h_usd, minVolume, maxVolume);
          const buyersNorm = this.normalize(token.unique_buyers_24h, minBuyers, maxBuyers);
          const liquidityNorm = this.normalize(token.liquidity_usd, minLiquidity, maxLiquidity);
          const socialScore = this.calculateSocialScore(token.volume_24h_usd, token.unique_buyers_24h);
          
          token.score = (
            this.weights.volume * volumeNorm +
            this.weights.uniqueBuyers * buyersNorm +
            this.weights.liquidity * liquidityNorm +
            this.weights.socialScore * socialScore
          );
        });
        
        // Sort and rank
        scoredTokens.sort((a, b) => b.score - a.score);
        const top50 = scoredTokens.slice(0, 50);
        top50.forEach((token, index) => {
          token.rank = index + 1;
        });
        
        return top50;
      }
    } catch (error) {
      console.error('Error using token_details_cache:', error);
    }
    
    // Fallback: Manual aggregation from hourly stats
    const { data: tokens, error: tokensError } = await supabase
      .from('tokens')
      .select('*')
      .limit(100);
    
    if (tokensError || !tokens || tokens.length === 0) {
      return [];
    }
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const scoredTokens: MemeToken[] = [];
    
    for (const token of tokens) {
      const { data: stats } = await supabase
        .from('token_hourly_stats')
        .select('*')
        .eq('token_address', token.token_address)
        .gte('hour', oneDayAgo.toISOString())
        .order('hour', { ascending: true });
      
      if (!stats || stats.length === 0) continue;
      
      const volume24h = stats.reduce((sum, s) => sum + Number(s.tx_volume_usd), 0);
      const buyers24h = stats.reduce((sum, s) => sum + Number(s.unique_buyers), 0);
      const currentHolders = Math.max(...stats.map(s => Number(s.holders)));
      const holdersStart = stats[0] ? Number(stats[0].holders) : currentHolders;
      const avgLiquidity = stats.reduce((sum, s) => sum + Number(s.liquidity_usd), 0) / stats.length;
      
      const holdersGrowth = holdersStart > 0 
        ? ((currentHolders - holdersStart) / holdersStart) * 100 
        : 0;
      
      scoredTokens.push({
        rank: 0,
        token_address: token.token_address,
        symbol: token.symbol,
        name: token.name,
        logo_url: token.logo_url,
        volume_24h_usd: volume24h,
        unique_buyers_24h: buyers24h,
        holders: currentHolders,
        liquidity_usd: avgLiquidity,
        score: 0
      });
    }
    
    if (scoredTokens.length === 0) return [];
    
    // Calculate scores
    const volumes = scoredTokens.map(t => t.volume_24h_usd);
    const buyers = scoredTokens.map(t => t.unique_buyers_24h);
    const liquidity = scoredTokens.map(t => t.liquidity_usd);
    
    const minVolume = Math.min(...volumes);
    const maxVolume = Math.max(...volumes);
    const minBuyers = Math.min(...buyers);
    const maxBuyers = Math.max(...buyers);
    const minLiquidity = Math.min(...liquidity);
    const maxLiquidity = Math.max(...liquidity);
    
    scoredTokens.forEach(token => {
      const volumeNorm = this.normalize(token.volume_24h_usd, minVolume, maxVolume);
      const buyersNorm = this.normalize(token.unique_buyers_24h, minBuyers, maxBuyers);
      const liquidityNorm = this.normalize(token.liquidity_usd, minLiquidity, maxLiquidity);
      const socialScore = this.calculateSocialScore(token.volume_24h_usd, token.unique_buyers_24h);
      
      token.score = (
        this.weights.volume * volumeNorm +
        this.weights.uniqueBuyers * buyersNorm +
        this.weights.liquidity * liquidityNorm +
        this.weights.socialScore * socialScore
      );
    });
    
    // Sort and rank
    scoredTokens.sort((a, b) => b.score - a.score);
    const top50 = scoredTokens.slice(0, 50);
    top50.forEach((token, index) => {
      token.rank = index + 1;
    });
    
    return top50;
  }
}

export const scoringService = new ScoringService();
