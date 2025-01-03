// src/services/dexscreener.ts
import { isChainSupportedByService, service_api_url } from '../config/chains';
import type { DexscreenerResponse, PriceResult } from '../types';

export async function fetchDexscreenerPrice(tokenAddress: string, chainId: string | number): Promise<PriceResult> {
  const start = Date.now();
  try {
    if (!isChainSupportedByService(chainId, 'dexscreener')) {
      return { price: null, error: `Chain ${chainId} not supported by Dexscreener`, latency: Date.now() - start };
    }

    const response = await fetch(`${service_api_url.dexscreener}/tokens/${tokenAddress}`);
    const latency = Date.now() - start;

    if (!response.ok) {
      return { price: null, error: `Dexscreener API error: ${response.status}`, latency };
    }

    const data = await response.json() as DexscreenerResponse;
    return { price: data.pairs?.[0]?.priceUsd || null, latency };
  } catch (error) {
    return {
      price: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start
    };
  }
}
