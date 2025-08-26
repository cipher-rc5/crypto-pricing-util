// file: src/services/defillama.ts
// DefiLlama API service for fetching cryptocurrency prices
// docs_reference: https://defillama.com/docs/api

import { getChainNameByService, isChainSupportedByService, service_api_url } from '../config/chains';
import { DefiLlamaResponse, PriceResult } from '../types';

export async function fetchDefiLlamaPrice(tokenAddress: string, chainId: string | number): Promise<PriceResult> {
  const start = Date.now();
  try {
    if (!isChainSupportedByService(chainId, 'defillama')) {
      return { price: null, error: `Chain ${chainId} not supported by DefiLlama`, latency: Date.now() - start };
    }

    const chainName = getChainNameByService(chainId, 'defillama');
    if (!chainName) {
      return { price: null, error: `Chain mapping not found for ${chainId}`, latency: Date.now() - start };
    }

    const coinKey = `${chainName}:${tokenAddress}`;
    const response = await fetch(`${service_api_url.defillama}/prices/current/${coinKey}`, { headers: { 'accept': 'application/json' } });

    const latency = Date.now() - start;

    if (!response.ok) {
      return { price: null, error: `DefiLlama API error: ${response.status}`, latency };
    }

    const data = await response.json() as DefiLlamaResponse;
    const priceData = data.coins[coinKey];

    return {
      price: priceData?.price || null,
      latency,
      timestamp: priceData?.timestamp,
      ...(priceData?.confidence && { confidence: priceData.confidence })
    };
  } catch (error) {
    return { price: null, error: error instanceof Error ? error.message : 'Unknown error', latency: Date.now() - start };
  }
}
