// test/prices.test.ts
import { expect, test, describe, beforeEach } from 'bun:test';
import { fetchPrices } from '../src/prices';

describe('Price Fetching', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
  });

  test('should validate EVM addresses', async () => {
    const env = { BIRDEYE_API: 'test', CODEX_API: 'test' };

    // Invalid EVM address
    const result = await fetchPrices('invalid-address', 1, env as any);
    expect(result.success).toBe(false);
    expect(result.prices.error.error).toContain('Invalid EVM address format');
  });

  test('should validate Solana addresses', async () => {
    const env = { BIRDEYE_API: 'test', CODEX_API: 'test' };

    // Invalid Solana address
    const result = await fetchPrices('0xinvalid', '1399811149', env as any);
    expect(result.success).toBe(false);
    expect(result.prices.error.error).toContain('Invalid Solana address format');
  });

  test('should fetch prices from multiple services', async () => {
    // Mock successful responses for multiple services
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true, data: { value: 1.0 } }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const env = { BIRDEYE_API: 'test', CODEX_API: 'test' };
    const result = await fetchPrices('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1, env as any);

    expect(result.success).toBe(true);
    expect(Object.keys(result.prices)).toContain('birdeye');
    expect(result.aggregatedPrice).toBeDefined();
  });

  test('should calculate median aggregated price', async () => {
    // Mock responses with different prices
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      const prices = [1.0, 1.1, 0.9, 1.05, 0.95];
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { value: prices[callCount % prices.length] } })
      });
    });

    const env = { BIRDEYE_API: 'test', CODEX_API: 'test' };
    const result = await fetchPrices('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 1, env as any);

    expect(result.aggregatedPrice).toBeTypeOf('number');
  });

  test('should handle Solana-specific logic', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true, data: { value: 1.0 } }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const env = { BIRDEYE_API: 'test' };
    const result = await fetchPrices('3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN', '1399811149', env as any);

    expect(result.success).toBe(true);
    // Should only include Solana-compatible services
    expect(Object.keys(result.prices)).not.toContain('codex');
  });
});
