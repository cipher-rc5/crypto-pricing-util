// src/prices.ts

import { isChainSupportedByService, supported_chains } from './config/chains';
import { fetchBirdeyePrice } from './services/birdeye';
import { fetchCodexPrice } from './services/codex';
import { fetchDefiLlamaPrice } from './services/defillama';
import { fetchDexscreenerPrice } from './services/dexscreener';
import { fetchGeckoTerminalPrice } from './services/geckoterminal';
import { PriceResult } from './types';

export enum ChainType {
  EVM = 'EVM',
  SVM = 'SVM'
}

function getChainType(chainId: string | number): ChainType {
  return chainId.toString() === '1399811149' ? ChainType.SVM : ChainType.EVM;
}

function validateAddress(address: string, chainType: ChainType): void {
  switch (chainType) {
    case ChainType.EVM:
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid EVM address format');
      }
      break;
    case ChainType.SVM:
      if (!address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        throw new Error('Invalid Solana address format');
      }
      break;
    default:
      throw new Error(`Unsupported chain type: ${chainType}`);
  }
}

interface FetchPricesOptions {
  searchWidth?: string;
}

// type definitions
type ServiceFetchFunction = { (tokenAddress: string, chainId: string | number, env: Env, timestamp?: number): Promise<PriceResult> } | {
  (tokenAddress: string, chainId: string | number): Promise<PriceResult>
};
interface ServiceFetcher {
  fetcher: ServiceFetchFunction;
  requiresEnv: boolean;
  supportsHistorical: boolean;
}

// service fetchers configuration
const SERVICE_FETCHERS: Record<string, ServiceFetcher> = {
  birdeye: {
    fetcher: async (tokenAddress: string, chainId: string | number, env: any) => {
      try {
        const result = await fetchBirdeyePrice(tokenAddress, chainId, env);
        return { ...result, latency: result.latency || 0 };
      } catch (error) {
        console.error('Birdeye fetch error:', error);
        return { price: null, error: error instanceof Error ? error.message : 'Unknown error', latency: 0 };
      }
    },
    requiresEnv: true,
    supportsHistorical: false
  },
  codex: { fetcher: fetchCodexPrice as ServiceFetchFunction, requiresEnv: true, supportsHistorical: true },
  defillama: { fetcher: fetchDefiLlamaPrice, requiresEnv: false, supportsHistorical: true },
  dexscreener: { fetcher: fetchDexscreenerPrice, requiresEnv: false, supportsHistorical: false },
  geckoterminal: { fetcher: fetchGeckoTerminalPrice, requiresEnv: false, supportsHistorical: false }
};

export async function fetchPrices(
  tokenAddress: string,
  chainId: string | number,
  env: Env,
  timestamp?: number,
  options: FetchPricesOptions = {}
): Promise<{ success: boolean, prices: Record<string, PriceResult>, aggregatedPrice: number | null }> {
  try {
    const chainType = getChainType(chainId);
    validateAddress(tokenAddress, chainType);

    const pricePromises: Array<Promise<[string, PriceResult]>> = [];

    // Process each service
    for (const [serviceName, service] of Object.entries(SERVICE_FETCHERS)) {
      if (!isChainSupportedByService(chainId, serviceName as keyof typeof supported_chains)) {
        continue;
      }

      // Skip if historical data requested but not supported
      if (timestamp && !service.supportsHistorical) {
        continue;
      }

      // Skip if Solana chain but not Birdeye
      if (chainType === ChainType.SVM && serviceName !== 'birdeye') {
        continue;
      }

      try {
        const fetchPromise = async (): Promise<[string, PriceResult]> => {
          const result = service.requiresEnv ?
            await (service.fetcher as (t: string, c: string | number, e: Env) => Promise<PriceResult>)(tokenAddress, chainId, env) :
            await (service.fetcher as (t: string, c: string | number) => Promise<PriceResult>)(tokenAddress, chainId);
          return [serviceName, result];
        };

        pricePromises.push(fetchPromise());
      } catch (err) {
        const error = err as Error;
        pricePromises.push(Promise.resolve([serviceName, { price: null, error: `Service error: ${error.message}`, latency: 0 }]));
      }
    }

    if (pricePromises.length === 0) {
      throw new Error(`No supported services found for chain ${chainId}`);
    }

    const results = await Promise.allSettled(pricePromises);
    const prices: Record<string, PriceResult> = {};

    results.forEach((result, index) => {
      const serviceName = Object.keys(SERVICE_FETCHERS)[index];
      if (result.status === 'fulfilled') {
        prices[result.value[0]] = result.value[1];
      } else {
        prices[serviceName] = { price: null, error: `Service failed: ${result.reason?.message || 'Unknown error'}`, latency: 0 };
      }
    });

    const validPrices = Object.values(prices).map(r => r.price).filter((price): price is number => price !== null);

    const aggregatedPrice = validPrices.length > 0 ? validPrices.sort((a, b) => a - b)[Math.floor(validPrices.length / 2)] : null;

    return { success: true, prices, aggregatedPrice };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      prices: { error: { price: null, error: error.message || 'Unknown error', latency: 0 } },
      aggregatedPrice: null
    };
  }
}

export { fetchBirdeyePrice } from './services/birdeye';
export { fetchCodexPrice } from './services/codex';
export { fetchDefiLlamaPrice } from './services/defillama';
export { fetchDexscreenerPrice } from './services/dexscreener';
export { fetchGeckoTerminalPrice } from './services/geckoterminal';
