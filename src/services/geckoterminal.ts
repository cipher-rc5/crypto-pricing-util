// file: src/services/geckoterminal.ts
// GeckoTerminal API service for fetching cryptocurrency prices
// docs_reference: https://www.geckoterminal.com/dex-api

import { getChainNameByService, isChainSupportedByService, service_api_url } from '../config/chains';
import { type GeckoTerminalResponse, PriceResult } from '../types';

export async function fetchGeckoTerminalPrice(tokenAddress: string, chainId: string | number): Promise<PriceResult> {
  const start = Date.now();
  try {
    if (!isChainSupportedByService(chainId, 'geckoterminal')) {
      return { price: null, error: `Chain ${chainId} not supported by GeckoTerminal`, latency: Date.now() - start };
    }

    const chainName = getChainNameByService(chainId, 'geckoterminal');
    if (!chainName) {
      return { price: null, error: `Chain mapping not found for ${chainId}`, latency: Date.now() - start };
    }

    const response = await fetch(`${service_api_url.geckoterminal}/simple/networks/${chainName}/token_price/${tokenAddress}`, {
      headers: { 'accept': 'application/json' }
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      return { price: null, error: `GeckoTerminal API error: ${response.status}`, latency };
    }

    const data = await response.json() as GeckoTerminalResponse;
    const price = data.data?.attributes?.token_prices[tokenAddress.toLowerCase()];

    return { price: price ? parseFloat(price) : null, latency };
  } catch (error) {
    return { price: null, error: error instanceof Error ? error.message : 'Unknown error', latency: Date.now() - start };
  }
}
