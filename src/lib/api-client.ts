/**
 * Generated API Client SDK
 * HTTP REST API endpoints with full TypeScript types
 * 
 * Generated at: 2026-02-06T14:16:55.574Z
 */

// ═══════════════════════════════════════════════════════════════
// BASE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
  requestId?: string;
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINT-SPECIFIC TYPES
// ═══════════════════════════════════════════════════════════════

// System health check
export type HealthRequest = void;
export type HealthResponse = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  uptime: number;
  services: {
  tarobase: {
  status: 'connected' | 'disconnected' | 'error';
  latency?: number | undefined;
};
  partyserver: {
  status: 'running' | 'starting' | 'error';
  activeConnections: number;
};
};
};

// Register as a fund manager
export type RegisterManagerRequest = {
  walletAddress: string;
  twitterHandle?: string | undefined;
  feePercentageBps: number;
  strategyDescription: string;
};
export type RegisterManagerResponse = {
  managerId: string;
  walletAddress: string;
  twitterHandle?: string | undefined;
  feePercentageBps: number;
  strategyDescription: string;
  poolId: string;
  status: 'registered';
};

// Deposit SOL to a fund
export type DepositRequest = {
  userAddress: string;
  poolId: string;
  amountLamports: number;
};
export type DepositResponse = {
  depositId: string;
  userAddress: string;
  poolId: string;
  amountLamports: number;
  fundTokensMinted: number;
  newFundTokenBalance: number;
  timestamp: number;
};

// Withdraw from a fund
export type WithdrawRequest = {
  userAddress: string;
  fundId: string;
  fundTokenAmount: number;
};
export type WithdrawResponse = {
  withdrawalId: string;
  userAddress: string;
  fundId: string;
  fundTokensBurned: number;
  grossAmountLamports: number;
  managerFeeLamports: number;
  netAmountLamports: number;
  remainingFundTokens: number;
  timestamp: number;
};

// Get user portfolio
export type PortfolioRequest = void;
export type PortfolioResponse = {
  userAddress: string;
  totalValueLamports: number;
  allocations: {
  fundId: string;
  fundTokenAmount: number;
  valueLamports: number;
  managerAddress: string;
}[];
  recentTransactions: {
  txId: string;
  fundPoolId: string;
  txType: string;
  amountLamports: number;
  fundTokenChange: number;
  timestamp: number;
}[];
};

// Get fund manager performance
export type PerformanceRequest = void;
export type PerformanceResponse = {
  managerId: string;
  managerAddress: string;
  twitterHandle?: string | undefined;
  feePercentageBps: number;
  strategyDescription: string;
  totalDepositsLamports: number;
  currentTvlLamports: number;
  performancePercent: number;
  depositorCount: number;
  reputationScore: number;
};

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  adminAuth?: {
    token: string;
    walletAddress: string;
  };
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP API CLIENT
// ═══════════════════════════════════════════════════════════════

export class ApiClient {
  constructor(private config: ApiClientConfig) {}

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    isAdminRoute?: boolean
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers
    };

    // Add admin headers if this is an admin route and we have admin auth
    if (isAdminRoute && this.config.adminAuth) {
      headers['Authorization'] = `Bearer ${this.config.adminAuth.token}`;
      headers['X-Wallet-Address'] = this.config.adminAuth.walletAddress;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.config.timeout || 300000)
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new ApiError(
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unknown error occurred',
        data.error?.details,
        response
      );
    }

    return data.data!;
  }

  /**
   * System health check
   * 
   * Retrieves comprehensive system health information including service status, uptime, and connectivity to external services like Tarobase. Use this endpoint to monitor system availability and diagnose potential issues before they affect users.
   * 
   * @auth Not required - No authentication required - publicly accessible for monitoring tools
   * @rateLimit 100 requests per 60 seconds
   * @usage Call this endpoint regularly (every 30-60 seconds) to monitor system health. A healthy system returns status="healthy" with all services showing positive status. Use this for health checks in load balancers and monitoring systems.
   * 
   * @tags system, monitoring
   * 
   */
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('GET', `/health`, false);
  }

  /**
   * Register as a fund manager
   * 
   * Register as a fund manager with Twitter verification and strategy details. Creates both the manager profile and their fund pool with fund token minting capability.
   * 
   * @auth Required - Requires wallet authentication via Tarobase
   * @rateLimit 5 requests per 3600 seconds
   * 
   * 
   * @tags fund-manager, registration
   * @example
   * ```typescript
   * const result = await api.registerManager({
  "walletAddress": "Hf6xkSiiPTwt51hi6X3YfQgQZu6S521z51uTUX7buKTS",
  "twitterHandle": "@wizardfund",
  "feePercentageBps": 1000,
  "strategyDescription": "Conservative DeFi strategy focusing on blue-chip tokens and stablecoin yields"
});
   * ```
   */
  async registerManager(request: RegisterManagerRequest): Promise<RegisterManagerResponse> {
    return this.request<RegisterManagerResponse>('POST', `/fund-managers/register`, request, false);
  }

  /**
   * Deposit SOL to a fund
   * 
   * Deposit SOL to a fund pool and receive fund tokens representing your share. Fund tokens are minted proportionally based on current TVL. If the pool is empty, tokens are minted 1:1 with lamports.
   * 
   * @auth Required - Requires wallet authentication via Tarobase
   * @rateLimit 20 requests per 60 seconds
   * 
   * 
   * @tags fund, deposit
   * @example
   * ```typescript
   * const result = await api.deposit({
  "userAddress": "Hf6xkSiiPTwt51hi6X3YfQgQZu6S521z51uTUX7buKTS",
  "poolId": "Hf6xkSiiPTwt51hi6X3YfQgQZu6S521z51uTUX7buKTS",
  "amountLamports": 1000000000
});
   * ```
   */
  async deposit(request: DepositRequest): Promise<DepositResponse> {
    return this.request<DepositResponse>('POST', `/funds/deposit`, request, false);
  }

  /**
   * Withdraw from a fund
   * 
   * Withdraw from a fund pool by burning fund tokens. Respects the 24-hour cooldown period. Performance fees are deducted and sent to the fund manager.
   * 
   * @auth Required - Requires wallet authentication via Tarobase
   * @rateLimit 20 requests per 60 seconds
   * 
   * 
   * @tags fund, withdrawal
   * @example
   * ```typescript
   * const result = await api.withdraw({
  "userAddress": "Hf6xkSiiPTwt51hi6X3YfQgQZu6S521z51uTUX7buKTS",
  "fundId": "Hf6xkSiiPTwt51hi6X3YfQgQZu6S521z51uTUX7buKTS",
  "fundTokenAmount": 500000000
});
   * ```
   */
  async withdraw(request: WithdrawRequest): Promise<WithdrawResponse> {
    return this.request<WithdrawResponse>('POST', `/funds/withdraw`, request, false);
  }

  /**
   * Get user portfolio
   * 
   * Retrieve complete portfolio information for a user including total value, allocations across funds, and recent transaction history.
   * 
   * @auth Not required - Public endpoint - no authentication required
   * @rateLimit 60 requests per 60 seconds
   * 
   * 
   * @tags user, portfolio
   * 
   */
  async portfolio(address: string): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>('GET', `/users/${address}/portfolio`, false);
  }

  /**
   * Get fund manager performance
   * 
   * Retrieve comprehensive performance metrics for a fund manager including TVL, returns, depositor count, and reputation score.
   * 
   * @auth Not required - Public endpoint - no authentication required
   * @rateLimit 100 requests per 60 seconds
   * 
   * 
   * @tags fund-manager, performance
   * 
   */
  async performance(id: string): Promise<PerformanceResponse> {
    return this.request<PerformanceResponse>('GET', `/fund-managers/${id}/performance`, false);
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY AND EXPORTS
// ═══════════════════════════════════════════════════════════════

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

import { PARTYSERVER_URL } from '@/lib/config';

/**
 * Default API client instance
 */
export const api = createApiClient({
  baseUrl: `https://${PARTYSERVER_URL}`
});

/**
 * Create API client with admin authentication
 * This client automatically detects admin routes and adds auth headers
 * 
 * @example
 * ```typescript
 * import { useAuth } from '@tarobase/js-sdk';
 * 
 * const { user } = useAuth();
 * const authenticatedApi = createAuthenticatedApiClient({
 *   token: user?.idToken,
 *   walletAddress: user?.address
 * });
 * 
 * // Public routes work normally
 * const health = await authenticatedApi.health();
 * 
 * // Admin routes automatically include auth headers
 * const adminResult = await authenticatedApi.adminRoute();
 * ```
 */
export function createAuthenticatedApiClient(auth: { token: string; walletAddress: string }) {
  return createApiClient({
    baseUrl: `https://${PARTYSERVER_URL}`,
    adminAuth: {
      token: auth.token,
      walletAddress: auth.walletAddress
    }
  });
  }

// Named exports
export { createAuthenticatedApiClient as createAdminApiClient };

// Default export
export default api;
