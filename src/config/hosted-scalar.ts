// file: src/config/hosted-scalar.ts
// description: openapi specification for api documentation
// docs_reference: https://github.com/scalar/scalar

import { OpenAPIObject } from 'openapi3-ts/oas31';

export const openApiSpec: OpenAPIObject = {
  openapi: '3.0.0',
  info: {
    title: 'Cryptocurrency Prices API',
    version: '0.0.2',
    description: `
      Fetch cryptocurrency prices across multiple chains and services.
      Supports current and historical price lookups from various sources including:
      Codex, DefiLlama, Birdeye, GeckoTerminal, and Dexscreener.
    `
  },
  servers: [{ url: 'https://crypto-pricing.ciphers.workers.dev', description: 'Production server' }, {
    url: 'http://localhost:8787',
    description: 'Development server'
  }],
  security: [{ ApiKeyAuth: [] }],
  components: {
    securitySchemes: { ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'API key for authentication' } },
    schemas: {
      PriceRequest: {
        type: 'object',
        required: ['chainId', 'tokenAddress'],
        properties: {
          chainId: { oneOf: [{ type: 'number' }, { type: 'string' }], description: 'Chain ID (e.g., 1 for Ethereum)' },
          tokenAddress: { type: 'string', description: 'Token contract address', example: '0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29' },
          timestamp: { type: 'number', description: 'Optional UNIX timestamp for historical prices' },
          searchWidth: { type: 'string', description: 'Optional search width for historical prices (e.g., "4h")' }
        }
      },
      PriceResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          timestamp: { type: 'number' },
          prices: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: { priceUsd: { type: ['number', 'null'] }, timestamp: { type: 'number' }, error: { type: 'string' } }
            }
          },
          aggregatedPrice: { type: ['number', 'null'] }
        }
      }
    }
  },
  paths: {
    '/api/prices': {
      post: {
        summary: 'Get token prices',
        description: 'Fetch token prices from multiple sources with optional historical data',
        operationId: 'getPrices',
        tags: ['Prices'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PriceRequest' },
              examples: {
                currentPrice: {
                  summary: 'Current price request',
                  value: { chainId: 1, tokenAddress: '0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29' }
                },
                historicalPrice: {
                  summary: 'Historical price request',
                  value: {
                    chainId: 1,
                    tokenAddress: '0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29',
                    timestamp: 1703980800,
                    searchWidth: '4h'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful response',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PriceResponse' } } }
          },
          '401': { description: 'Unauthorized - Invalid or missing API key' },
          '400': { description: 'Bad Request - Invalid input parameters' }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Check the health status of all price services',
        operationId: 'healthCheck',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Health status of all services',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthCheckResponse' } } }
          }
        }
      }
    }
  },
  tags: [{ name: 'Prices', description: 'Price-related endpoints' }, { name: 'System', description: 'System health and status endpoints' }]
};
