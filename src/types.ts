// file: src/types.ts
// description: typeScript type definitions for crypto pricing api
// docs_reference: https://developers.cloudflare.com/workers/runtime-apis/

export interface PriceRequest {
  chainId: number | string;
  tokenAddress: string;
  timestamp?: number;
}

export interface PriceResponse {
  success: boolean;
  timestamp: number;
  prices: { [source: string]: { priceUsd: number | null, error?: string } };
  aggregatedPrice: number | null;
}

export interface PriceResult {
  price: number | null;
  error?: string;
  latency?: number;
  timestamp?: number;
}

export interface HealthCheckResponse {
  success: boolean;
  timestamp: number;
  services: { [service: string]: { status: 'operational' | 'degraded' | 'down', latency: number, error?: string } };
}

export interface Env {
  // Secrets (managed via wrangler secret put)
  API_KEY: string;
  CODEX_API: string;
  BIRDEYE_API: string;
  COINMARKETCAP_API: string;
  COINGECKO_API: string;
  OPENAI_API_KEY: string;

  // Environment variables
  ENVIRONMENT: 'development' | 'staging' | 'production';
  LOG_LEVEL: 'debug' | 'info' | 'warn';

  // KV namespaces
  // CACHE?: KVNamespace;
}

// prices - request types, utilized for price endpoints

export interface BirdeyeResponse {
  data: { value: number, updateUnixTime: number, updateHumanTime: string, priceChange24h: number };
  success: boolean;
}

export interface CodexPriceInput {
  address: string;
  networkId: number;
  poolAddress?: string;
  timestamp?: number;
}

export interface CodexResponse {
  data: { getTokenPrices: Array<{ address: string, networkId: number, priceUsd: number, timestamp?: number }> };
}

export interface CoinPaprikaPriceResponse {
  id: string;
  name: string;
  symbol: string;
  platform: string;
  contract_address: string;
  price_usd: number;
  price_btc: number;
  volume_24h_usd: number;
}

export interface DexscreenerResponse {
  pairs: Array<{ priceUsd: number, [key: string]: unknown }>;
}

export interface DefiLlamaResponse {
  coins: { [key: string]: { decimals: number, price: number, symbol: string, timestamp: number, confidence: number } };
}

export interface GeckoTerminalResponse {
  data: { id: string, type: string, attributes: { token_prices: { [address: string]: string } } };
}
