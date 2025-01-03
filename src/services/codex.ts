// src/services/codex.ts

import { isChainSupportedByService, service_api_url } from '../config/chains';
import type { CodexResponse, PriceResult } from '../types';

export async function fetchCodexPrice(
  tokenAddress: string,
  chainId: string | number,
  env: Env,
  timestamp?: number
): Promise<PriceResult> {
  const start = Date.now();
  try {
    if (!isChainSupportedByService(chainId, 'codex')) {
      return { price: null, error: `Chain ${chainId} not supported by Codex`, latency: Date.now() - start };
    }

    let inputStr = `{ address: "${tokenAddress}", networkId: ${chainId}`;
    if (timestamp) {
      inputStr += `, timestamp: ${timestamp}`;
    }
    inputStr += ' }';

    const query = `{
      getTokenPrices(
        inputs: [${inputStr}]
      ) {
        address
        networkId
        priceUsd
        timestamp
      }
    }`;

    const response = await fetch(`${service_api_url.codex}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': env.CODEX_API },
      body: JSON.stringify({ query })
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      return { price: null, error: `Codex API error: ${response.status} - ${errorText}`, latency };
    }

    const data = await response.json() as CodexResponse;
    return {
      price: data.data?.getTokenPrices[0]?.priceUsd || null,
      timestamp: data.data?.getTokenPrices[0]?.timestamp,
      latency
    };
  } catch (error) {
    return {
      price: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start
    };
  }
}
