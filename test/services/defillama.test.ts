// test/services/defillama.test.ts

import { expect, test, describe, beforeEach } from 'bun:test';
import { fetchDefiLlamaPrice } from '../../src/services/defillama';

describe('DefiLlama Service', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
  });

  test('should fetch price successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          coins: { 'ethereum:0xtest': { price: 1.002, timestamp: 1703980800, confidence: 0.99, decimals: 6, symbol: 'USDC' } }
        })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await fetchDefiLlamaPrice('0xtest', 1);

    expect(result.price).toBe(1.002);
    expect(result.timestamp).toBe(1703980800);
    expect(result.confidence).toBe(0.99);
  });

  test('should handle missing price data', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ coins: {} }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const result = await fetchDefiLlamaPrice('0xtest', 1);

    expect(result.price).toBeNull();
  });

  test('should handle unsupported chains', async () => {
    const result = await fetchDefiLlamaPrice('0xtest', 999999);

    expect(result.price).toBeNull();
    expect(result.error).toContain('not supported by DefiLlama');
  });
});
