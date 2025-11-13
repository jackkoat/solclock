class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use internal API routes
    this.baseUrl = '';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Network endpoints
  async getNetworkPulse() {
    return this.request<any>('/api/network/pulse');
  }

  async getNetworkStats() {
    return this.request<any>('/api/network/stats');
  }

  // Chart endpoints
  async getNetworkActivity(params: { period?: string; metric?: string }) {
    const query = new URLSearchParams({
      period: params.period || '24h',
      metric: params.metric || 'tps'
    }).toString();
    return this.request<any>(`/api/charts/network-activity?${query}`);
  }

  async getTransactionVolume(params: { period?: string; interval?: string }) {
    const query = new URLSearchParams({
      period: params.period || '24h',
      interval: params.interval || '3h'
    }).toString();
    return this.request<any>(`/api/charts/transaction-volume?${query}`);
  }

  // Token endpoints
  async getTopMemeCoins(limit: number = 50) {
    return this.request<any>(`/api/top-meme?limit=${limit}`);
  }

  async getTokenClock(address: string) {
    return this.request<any>(`/api/token/${address}/clock`);
  }

  async getTokenDetails(address: string) {
    return this.request<any>(`/api/token/${address}/details`);
  }

  // Watchlist endpoints
  async getWatchlist(userId: string) {
    return this.request<any>(`/api/watchlist?user_id=${userId}`);
  }

  async addToWatchlist(userId: string, tokenAddress: string) {
    return this.request<any>('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, token_address: tokenAddress }),
    });
  }

  async removeFromWatchlist(id: number, userId: string) {
    return this.request<any>(`/api/watchlist?id=${id}&user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  // Alert endpoints
  async getRecentActivity() {
    return this.request<any>('/api/alerts/recent-activity');
  }
}

export const apiClient = new ApiClient();