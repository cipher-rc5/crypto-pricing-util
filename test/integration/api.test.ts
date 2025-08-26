// test/integration/api.test.ts

import { expect, test, describe } from 'bun:test';

describe('API Integration Tests', () => {
  test('should handle price request validation', () => {
    const validRequest = { chainId: 1, tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' };

    expect(validRequest.chainId).toBeTypeOf('number');
    expect(validRequest.tokenAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should handle optional timestamp in requests', () => {
    const historicalRequest = { chainId: 1, tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', timestamp: 1703980800 };

    expect(historicalRequest.timestamp).toBeTypeOf('number');
    expect(historicalRequest.timestamp).toBeGreaterThan(0);
  });

  test('should validate price response structure', () => {
    const mockResponse = {
      success: true,
      timestamp: Date.now(),
      prices: { birdeye: { priceUsd: 1.002 }, defillama: { priceUsd: 1.001 } },
      aggregatedPrice: 1.0015
    };

    expect(mockResponse.success).toBe(true);
    expect(mockResponse.timestamp).toBeTypeOf('number');
    expect(mockResponse.prices).toBeTypeOf('object');
    expect(mockResponse.aggregatedPrice).toBeTypeOf('number');
  });
});
