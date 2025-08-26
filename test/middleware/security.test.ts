// test/middleware/security.test.ts

import { expect, test, describe, mock } from 'bun:test';
import { SecurityMiddleware } from '../../src/middleware/security';

describe('Security Middleware', () => {
  const mockNext = mock(() => Promise.resolve());

  test('should create security middleware with default options', () => {
    const security = new SecurityMiddleware();
    expect(security).toBeDefined();
  });

  test('should create security middleware with custom options', () => {
    const options = {
      rateLimit: { requests: 50, windowMs: 30000 },
      botProtection: false,
      securityHeaders: true,
      clientVerification: false
    };
    const security = new SecurityMiddleware(options);
    expect(security).toBeDefined();
  });

  test('should add security headers when enabled', async () => {
    const security = new SecurityMiddleware({ securityHeaders: true });
    const mockContext = {
      req: {
        header: mock((key: string) => {
          switch (key) {
            case 'cf-connecting-ip':
              return '192.168.1.1';
            case 'user-agent':
              return 'Mozilla/5.0';
            default:
              return undefined;
          }
        })
      },
      header: mock((name, value) => {})
    };

    await security.middleware(mockContext as any, mockNext);

    expect(mockContext.header).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(mockContext.header).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should detect bot user agents when protection enabled', async () => {
    const security = new SecurityMiddleware({ botProtection: true, clientVerification: false });

    const mockContext = {
      req: {
        header: mock((key: string) => {
          switch (key) {
            case 'cf-connecting-ip':
              return '192.168.1.1';
            case 'user-agent':
              return 'curl/7.68.0';
            default:
              return undefined;
          }
        })
      },
      header: mock(() => {})
    };

    await expect(security.middleware(mockContext as any, mockNext)).rejects.toThrow();
  });
});
