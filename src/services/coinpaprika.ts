// src/services/coinpaprika.ts

import { getChainNameByService, isChainSupportedByService, service_api_url } from '../config/chains';
import type { coinpaprika_price_response, PriceResult } from '../types';

export async function fetchCoinpaprikaPrice(tokenAddress: string, chainId: string | number, env: Env): Promise<PriceResult> {
  const start = Date.now();
  try {
    if (!isChainSupportedByService(chainId, 'coinpaprika')) {
      return { price: null, error: `Chain ${chainId} not supported by Coinpaprika`, latency: Date.now() - start };
    }
    const platformId = getChainNameByService(chainId, 'coinpaprika');
    if (!platformId) {
      return { price: null, error: 'Invalid platform ID', latency: Date.now() - start };
    }
    const url = `${service_api_url.coinpaprika}/contracts/${platformId}/${tokenAddress}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const latency = Date.now() - start;
    if (!response.ok) {
      return { price: null, error: `Coinpaprika API error: ${response.status}`, latency };
    }
    const data = await response.json() as coinpaprika_price_response;
    return { price: data.price_usd, timestamp: Date.now(), latency };
  } catch (error) {
    return { price: null, error: error instanceof Error ? error.message : 'Unknown error', latency: Date.now() - start };
  }
}
