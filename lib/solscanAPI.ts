/**
 * Solscan API Wrapper
 * Handles authentication, rate limiting, and error handling for Solscan API calls
 * 
 * Rate Limits (Free Tier):
 * - 1000 requests per 60 seconds
 * - 10M Credit Units per month
 * 
 * API Documentation: https://pro-api.solscan.io/pro-api-docs/v2.0
 */

interface SolscanConfig {
  apiKey: string;
  baseURL: string;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

class SolscanAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'SolscanAPIError';
  }
}

export class SolscanAPI {
  private config: SolscanConfig;
  private rateLimitState: RateLimitState;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 60000; // 1 minute default cache

  constructor(apiKey?: string) {
    this.config = {
      apiKey: apiKey || process.env.SOLSCAN_API_KEY || '',
      baseURL: 'https://pro-api.solscan.io/v2.0',
      rateLimit: {
        maxRequests: 1000,
        windowMs: 60000, // 60 seconds
      },
    };

    this.rateLimitState = {
      requests: [],
      lastReset: Date.now(),
    };

    this.cache = new Map();
  }

  /**
   * Check if we're within rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = now - this.config.rateLimit.windowMs;

    // Remove requests outside the current window
    this.rateLimitState.requests = this.rateLimitState.requests.filter(
      (timestamp) => timestamp > windowStart
    );

    return this.rateLimitState.requests.length < this.config.rateLimit.maxRequests;
  }

  /**
   * Wait for rate limit window to reset
   */
  private async waitForRateLimit(): Promise<void> {
    if (this.rateLimitState.requests.length === 0) return;

    const oldestRequest = Math.min(...this.rateLimitState.requests);
    const timeToWait = oldestRequest + this.config.rateLimit.windowMs - Date.now();

    if (timeToWait > 0) {
      console.log(`Rate limit reached, waiting ${timeToWait}ms`);
      await new Promise((resolve) => setTimeout(resolve, timeToWait + 100));
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached(key: string, ttl?: number): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    const maxAge = ttl || this.cacheTTL;

    if (age < maxAge) {
      return cached.data;
    }

    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Make API request with rate limiting and error handling
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, any> = {},
    cacheTTL?: number
  ): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

    // Check cache first
    const cached = this.getCached(cacheKey, cacheTTL);
    if (cached) {
      return cached;
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      await this.waitForRateLimit();
    }

    // Build URL with query params
    const url = new URL(`${this.config.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    // Record request timestamp
    this.rateLimitState.requests.push(Date.now());

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      // Add API key if available
      if (this.config.apiKey) {
        headers['token'] = this.config.apiKey;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new SolscanAPIError(
          `Solscan API error: ${response.statusText}`,
          response.status,
          await response.text()
        );
      }

      const data = await response.json();

      // Cache successful response
      this.setCache(cacheKey, data);

      return data;
    } catch (error) {
      if (error instanceof SolscanAPIError) {
        throw error;
      }
      throw new SolscanAPIError(
        `Failed to fetch from Solscan: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get last block information
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-block-last
   */
  async getLastBlock(limit: number = 1) {
    return this.request('/block/last', { limit }, 10000); // 10s cache
  }

  /**
   * Get block by slot or time
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-block-blocks
   */
  async getBlocks(params: {
    limit?: number;
    offset?: number;
    sort_by?: 'block_time' | 'block_height';
    sort_order?: 'asc' | 'desc';
    block_time_start?: number;
    block_time_end?: number;
  }) {
    return this.request('/block/blocks', params, 30000); // 30s cache
  }

  /**
   * Get latest transactions
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-transaction-last
   */
  async getLastTransactions(limit: number = 10, filter?: string[]) {
    return this.request('/transaction/last', { limit, filter }, 5000); // 5s cache
  }

  /**
   * Get transaction details
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-transaction-transaction
   */
  async getTransaction(signature: string) {
    return this.request(`/transaction/${signature}`, {}, 300000); // 5 min cache (historical data)
  }

  /**
   * Get trending tokens
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-trending
   */
  async getTrendingTokens(limit: number = 50, sort_by: string = 'volume') {
    return this.request('/token/trending', { limit, sort_by }, 60000); // 1 min cache
  }

  /**
   * Get token list
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-list
   */
  async getTokenList(params: {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    return this.request('/token/list', params, 300000); // 5 min cache
  }

  /**
   * Get token metadata
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-meta
   */
  async getTokenMeta(address: string) {
    return this.request(`/token/meta`, { address }, 3600000); // 1 hour cache (metadata doesn't change often)
  }

  /**
   * Get token price
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-price
   */
  async getTokenPrice(address: string) {
    return this.request(`/token/price`, { address }, 30000); // 30s cache
  }

  /**
   * Get token holders
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-holders
   */
  async getTokenHolders(address: string, limit: number = 10, offset: number = 0) {
    return this.request(`/token/holders`, { address, limit, offset }, 300000); // 5 min cache
  }

  /**
   * Get token transfers
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-transfer
   */
  async getTokenTransfers(params: {
    address?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
    amount_from?: number;
    amount_to?: number;
  }) {
    return this.request(`/token/transfer`, params, 10000); // 10s cache
  }

  /**
   * Get account transactions
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-account-transactions
   */
  async getAccountTransactions(params: {
    address: string;
    limit?: number;
    offset?: number;
    filter?: string[];
  }) {
    return this.request(`/account/transactions`, params, 10000); // 10s cache
  }

  /**
   * Get account token balance
   * https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-account-token-accounts
   */
  async getAccountTokenAccounts(params: {
    address: string;
    limit?: number;
    offset?: number;
  }) {
    return this.request(`/account/token-accounts`, params, 60000); // 1 min cache
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats(): { currentRequests: number; maxRequests: number; windowMs: number } {
    const now = Date.now();
    const windowStart = now - this.config.rateLimit.windowMs;
    const currentRequests = this.rateLimitState.requests.filter(
      (timestamp) => timestamp > windowStart
    ).length;

    return {
      currentRequests,
      maxRequests: this.config.rateLimit.maxRequests,
      windowMs: this.config.rateLimit.windowMs,
    };
  }
}

// Singleton instance
let solscanInstance: SolscanAPI | null = null;

export function getSolscanAPI(apiKey?: string): SolscanAPI {
  if (!solscanInstance) {
    solscanInstance = new SolscanAPI(apiKey);
  }
  return solscanInstance;
}

export default SolscanAPI;
