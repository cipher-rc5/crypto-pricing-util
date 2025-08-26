// test/services/codex.test.ts
import { expect, test, describe, beforeEach } from 'bun:test';
import { fetchCodexPrice } from '../../src/services/codex';

describe('Codex Service', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
  });

  test('should fetch current price successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({ data: { getTokenPrices: [{ address: '0xtest', networkId: 1, priceUsd: 1.001, timestamp: 1703980800 }] } })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const env = { CODEX_API: 'Bearer test-token' };
    const result = await fetchCodexPrice('0xtest', 1, env as any);

    expect(result.price).toBe(1.001);
    expect(result.timestamp).toBe(1703980800);
  });

  test('should fetch historical price with timestamp', async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({ data: { getTokenPrices: [{ address: '0xtest', networkId: 1, priceUsd: 1.005, timestamp: 1703977200 }] } })
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const env = { CODEX_API: 'Bearer test-token' };
    const result = await fetchCodexPrice('0xtest', 1, env as any, 1703977200);

    expect(result.price).toBe(1.005);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('graphql'),
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('timestamp: 1703977200') })
    );
  });

  test('should handle API errors', async () => {
    const mockResponse = { ok: false, status: 401, text: () => Promise.resolve('Unauthorized') };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const env = { CODEX_API: 'Bearer invalid-token' };
    const result = await fetchCodexPrice('0xtest', 1, env as any);

    expect(result.price).toBeNull();
    expect(result.error).toContain('401 - Unauthorized');
  });
});
