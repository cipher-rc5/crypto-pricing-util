// test/middleware/auth.test.ts

import { expect, test, describe, mock } from 'bun:test';
import { apiKeyAuth } from '../../src/middleware/auth';

describe('Authentication Middleware', () => {
  const mockNext = mock(() => Promise.resolve());

  test('should reject requests without API key', async () => {
    const mockContext = { req: { header: mock(() => undefined) }, json: mock((data, status) => ({ data, status })) };

    const result = await apiKeyAuth(mockContext as any, mockNext);
    expect(mockContext.json).toHaveBeenCalledWith({ error: 'Missing API key' }, 401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should reject requests with invalid API key', async () => {
    const mockContext = {
      req: { header: mock((key: string) => key === 'X-API-Key' ? 'invalid-key' : undefined) },
      env: { API_KEY: 'valid-key' },
      json: mock((data, status) => ({ data, status }))
    };

    const result = await apiKeyAuth(mockContext as any, mockNext);
    expect(mockContext.json).toHaveBeenCalledWith({ error: 'Invalid API key' }, 403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should accept requests with valid API key', async () => {
    const mockContext = {
      req: { header: mock((key: string) => key === 'X-API-Key' ? 'valid-key' : undefined) },
      env: { API_KEY: 'valid-key' },
      json: mock((data, status) => ({ data, status }))
    };

    await apiKeyAuth(mockContext as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  test('should handle missing environment API key', async () => {
    const mockContext = { req: { header: mock(() => 'some-key') }, env: {}, json: mock((data, status) => ({ data, status })) };

    await apiKeyAuth(mockContext as any, mockNext);
    expect(mockContext.json).toHaveBeenCalledWith({ error: 'API key not configured' }, 500);
  });
});
