// test/services/birdeye.test.ts

import { expect, test, describe, mock, beforeEach } from 'bun:test';
import { fetchBirdeyePrice } from '../../src/services/birdeye';

// Mock fetch globally
global.fetch = mock(() => Promise.resolve()) as unknown as typeof fetch;

describe('Birdeye Service', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
  });

  test('should fetch price successfully', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true, data: { value: 1.0025, updateUnixTime: 1703980800 } }) };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const env = { BIRDEYE_API: 'test-key' };
    const result = await fetchBirdeyePrice('0xtest', 1, env as any);

    expect(result.price).toBe(1.0025);
    expect(result.error).toBeUndefined();
    expect(result.latency).toBeGreaterThan(0);
  });

  test('should handle API errors', async () => {
    const mockResponse = { ok: false, status: 429 };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const env = { BIRDEYE_API: 'test-key' };
    const result = await fetchBirdeyePrice('0xtest', 1, env as any);

    expect(result.price).toBeNull();
    expect(result.error).toBe('Birdeye API error: 429');
  });

  test('should handle unsupported chains', async () => {
    const env = { BIRDEYE_API: 'test-key' };
    const result = await fetchBirdeyePrice('0xtest', 999999, env as any);

    expect(result.price).toBeNull();
    expect(result.error).toContain('not supported by Birdeye');
  });

  test('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const env = { BIRDEYE_API: 'test-key' };
    const result = await fetchBirdeyePrice('0xtest', 1, env as any);

    expect(result.price).toBeNull();
    expect(result.error).toBe('Network error');
  });
});
