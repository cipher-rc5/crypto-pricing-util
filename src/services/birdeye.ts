// file: src/services/birdeye.ts
// description: birdeye api service for fetching cryptocurrency prices
// docs_reference: https://docs.birdeye.so

import { getChainNameByService, isChainSupportedByService, service_api_url } from '../config/chains';
import { BirdeyeResponse, PriceResult, Env } from '../types';

export async function fetchBirdeyePrice(tokenAddress: string, chainId: string | number, env: Env): Promise<PriceResult> {
  const start = Date.now();
  try {
    if (!isChainSupportedByService(chainId, 'birdeye')) {
      return { price: null, error: `Chain ${chainId} not supported by Birdeye`, latency: Date.now() - start };
    }

    const chainName = getChainNameByService(chainId, 'birdeye')?.toLowerCase();
    if (!chainName) {
      return { price: null, error: `Chain mapping not found for ${chainId}`, latency: Date.now() - start };
    }

    const response = await fetch(`${service_api_url.birdeye}/defi/price?address=${tokenAddress}`, {
      headers: { 'X-API-KEY': env.BIRDEYE_API, 'x-chain': chainName, 'accept': 'application/json' }
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      return { price: null, error: `Birdeye API error: ${response.status}`, latency };
    }

    const data = await response.json() as BirdeyeResponse;
    return { price: data.success ? data.data.value : null, latency };
  } catch (error) {
    return { price: null, error: error instanceof Error ? error.message : 'Unknown error', latency: Date.now() - start };
  }
}
