// src/types.ts

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

export interface coinpaprika_price_response {
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
