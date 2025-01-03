// src/index.ts
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { supported_chains } from './config/chains';
import { fetchPrices } from './prices';
import { HealthCheckResponse, PriceResponse } from './types';

import { apiReference } from '@scalar/hono-api-reference';
import { openApiSpec } from './config/hosted-scalar';

import { apiKeyAuth } from './middleware/auth';
import { SecurityMiddleware } from './middleware/security';

interface Env {
  CODEX_API: string;
  BIRDEYE_API: string;
  COINMARKETCAP_API: string;
  API_KEYS: KVNamespace;
}

// Initialize security middleware with custom options
const security = new SecurityMiddleware({
  rateLimit: { requests: 100, windowMs: 60 * 1000 },
  botProtection: true,
  securityHeaders: true
});

const priceRequestSchema = z.object({
  chainId: z.union([z.number(), z.string()]),
  tokenAddress: z.string().min(1),
  timestamp: z.number().optional(),
  searchWidth: z.string().optional()
});

function hasChainIds(chains: readonly any[]): chains is readonly { id: number, name: string }[] {
  if (!Array.isArray(chains) || chains.length === 0) return false;
  const firstItem = chains[0];
  return typeof firstItem === 'object' && firstItem !== null && 'id' in firstItem && 'name' in firstItem;
}

type PriceRequest = z.infer<typeof priceRequestSchema>;

const app = new Hono<{ Bindings: Env }>();

app.use(
  '/*',
  // security.middleware,
  cors({
    origin: ['http://localhost:8787', 'https://crypto-pricing.ciphers.workers.dev'],
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['X-API-Key', 'Content-Type', 'Origin', 'Accept'],
    exposeHeaders: ['Content-Length', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  })
);

app.get('/', (c) => {
  const supportedChains = Object.fromEntries(
    Object.entries(supported_chains).map(([service, chains]) => {
      return [service, hasChainIds(chains) ? chains.map(chain => ({ id: chain.id, name: chain.name })) : chains];
    })
  );

  return c.json({
    message: 'Cryptocurrency Prices API',
    status: 'operational',
    documentation: '/docs',
    health: { evm: '/health_check_evm', svm: '/health_check_svm', combined: '/health' },
    version: '0.0.2',
    services: ['birdeye', 'codex', 'defillama', 'dexscreener', 'geckoterminal'],
    // services: ['birdeye', 'codex', 'coinpaprika', 'defillama', 'dexscreener', 'geckoterminal', 'parsecfi', 'transpose' ],
    // supportedChains,
    historicalPriceSupport: {
      codex: 'Supports historical prices via timestamp',
      defillama: 'Supports historical prices via timestamp with optional searchWidth parameter'
    },
    contact: '@Cipher0091'
  });
});

// Health check
app.get('/health', apiKeyAuth, async (c) => {
  // Create parallel health checks for both EVM and SVM
  const [evmHealth, svmHealth] = await Promise.all([
    // USDC on Ethereum
    fetchPrices('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1, c.env as Env),
    // USDC on Solana
    fetchPrices('3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN', '1399811149', c.env as Env)
  ]);

  // Combine results from both checks
  const services = {
    ...Object.entries(evmHealth.prices).reduce((acc, [key, value]) => {
      acc[`${key}_evm`] = {
        status: value.error ? 'down' : (value.price === null ? 'degraded' : 'operational'),
        latency: value.latency || 0,
        ...(value.error && { error: value.error })
      };
      return acc;
    }, {} as Record<string, any>),
    ...Object.entries(svmHealth.prices).reduce((acc, [key, value]) => {
      acc[`${key}_svm`] = {
        status: value.error ? 'down' : (value.price === null ? 'degraded' : 'operational'),
        latency: value.latency || 0,
        ...(value.error && { error: value.error })
      };
      return acc;
    }, {} as Record<string, any>)
  };

  const response: HealthCheckResponse = {
    success: evmHealth.success || svmHealth.success,
    timestamp: Date.now(),
    services
  };

  return c.json(response);
});

app.get('/health_check_evm', apiKeyAuth, async (c) => {
  // USDC on Ethereum
  const healthCheckAddr = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  const healthCheckChainId = 1;

  const result = await fetchPrices(healthCheckAddr, healthCheckChainId, c.env as Env);

  const services = Object.entries(result.prices).reduce((acc, [key, value]) => {
    acc[key] = {
      status: value.error ? 'down' : (value.price === null ? 'degraded' : 'operational'),
      latency: value.latency || 0,
      ...(value.error && { error: value.error })
    };
    return acc;
  }, {} as Record<string, any>);

  const response: HealthCheckResponse = { success: result.success, timestamp: Date.now(), services };

  return c.json(response);
});

app.get('/health_check_svm', apiKeyAuth, async (c) => {
  const healthCheckAddr = '3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN';
  const healthCheckChainId = '1399811149';

  const result = await fetchPrices(healthCheckAddr, healthCheckChainId, c.env as Env);

  const services = Object.entries(result.prices).filter(([key]) =>
    ['birdeye', 'geckoterminal', 'defillama'].includes(key)
  ) // Only include supported services
    .reduce((acc, [key, value]) => {
      acc[key] = {
        status: value.error ? 'down' : (value.price === null ? 'degraded' : 'operational'),
        latency: value.latency || 0,
        ...(value.error && { error: value.error })
      };
      return acc;
    }, {} as Record<string, any>);

  const response: HealthCheckResponse = {
    success: Object.values(services).some(s => s.status === 'operational'),
    timestamp: Date.now(),
    services
  };

  return c.json(response);
});

// Prices endpoint
app.post('/api/prices', apiKeyAuth, zValidator('json', priceRequestSchema), async (c) => {
  const data = await c.req.json<PriceRequest>();
  const env = c.env as Env;

  const result = await fetchPrices(data.tokenAddress, data.chainId, env, data.timestamp, {
    searchWidth: data.searchWidth
  });

  const response: PriceResponse = {
    success: result.success,
    timestamp: data.timestamp || Date.now(),
    prices: Object.entries(result.prices).reduce((acc, [key, value]) => {
      acc[key] = { priceUsd: value.price, timestamp: value.timestamp, ...(value.error && { error: value.error }) };
      return acc;
    }, {} as Record<string, { priceUsd: number | null, timestamp?: number, error?: string }>),
    aggregatedPrice: result.aggregatedPrice
  };

  return c.json(response);
});

app.get('/openapi.json', (c) => {
  return c.json(openApiSpec);
});

app.get(
  '/docs',
  apiReference({
    theme: 'purple',
    spec: { url: '/openapi.json' },
    pageTitle: 'Cryptocurrency Prices - API Documentation'
  })
);

export default app;
