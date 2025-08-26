// file: src/middleware/security.ts
// description: Security middleware with configurable bot protection and rate limiting
// docs_reference: https://developers.cloudflare.com/workers/runtime-apis/request/

import { Context, Next } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';

interface RateLimitInfo {
  count: number;
  timestamp: number;
}

interface SecurityOptions {
  rateLimit: { requests: number, windowMs: number };
  botProtection: boolean;
  securityHeaders: boolean;
  clientVerification: boolean; // New option to disable client verification
}

const DEFAULT_OPTIONS: SecurityOptions = {
  rateLimit: {
    requests: 100, // requests per window
    windowMs: 60 * 1000 // 1 minute
  },
  botProtection: true, // Disabled by default to avoid issues
  securityHeaders: true,
  clientVerification: true // Disabled by default
};

class SecurityMiddleware {
  private options: SecurityOptions;
  private rateLimitStore: Map<string, RateLimitInfo>;

  constructor (options: Partial<SecurityOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.rateLimitStore = new Map();
  }

  private isBotUserAgent(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /crawling/i,
      /headless/i,
      /puppet/i,
      /playwright/i,
      /selenium/i,
      /wget/i,
      /curl/i,
      /postman/i,
      /insomnia/i,
      /chatgpt/i,
      /openai/i,
      /anthropic/i
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  private generateNonce(): string {
    return crypto.getRandomValues(new Uint8Array(16)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  }

  private async validateClientIntegrity(c: Context): Promise<boolean> {
    // If client verification is disabled, always return true
    if (!this.options.clientVerification) {
      return true;
    }

    const nonce = getCookie(c, 'client_nonce');
    const expectedNonce = getCookie(c, 'expected_nonce');

    // Generate new nonce for next request
    const newNonce = this.generateNonce();
    setCookie(c, 'expected_nonce', newNonce, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });

    // For first time visitors, set up the verification system
    if (!expectedNonce) {
      setCookie(c, 'client_nonce', newNonce, {
        httpOnly: false, // Client needs to read this
        secure: true,
        sameSite: 'Strict',
        path: '/'
      });
      return true; // Allow first request
    }

    return nonce === expectedNonce;
  }

  private getRateLimitInfo(identifier: string): RateLimitInfo {
    const now = Date.now();
    const info = this.rateLimitStore.get(identifier);

    if (!info || now - info.timestamp > this.options.rateLimit.windowMs) {
      return { count: 0, timestamp: now };
    }

    return info;
  }

  private updateRateLimit(identifier: string): void {
    const info = this.getRateLimitInfo(identifier);
    this.rateLimitStore.set(identifier, { count: info.count + 1, timestamp: info.timestamp });
  }

  private isRateLimited(identifier: string): boolean {
    const info = this.getRateLimitInfo(identifier);
    return info.count >= this.options.rateLimit.requests;
  }

  public middleware = async (c: Context, next: Next) => {
    try {
      // Rate limiting - use CF-Connecting-IP or fallback to x-forwarded-for
      const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

      if (this.isRateLimited(clientIP)) {
        throw new HTTPException(429, { message: 'Too many requests' });
      }

      this.updateRateLimit(clientIP);

      // Bot protection (only basic user agent check)
      if (this.options.botProtection) {
        const userAgent = c.req.header('user-agent') || '';
        if (this.isBotUserAgent(userAgent)) {
          throw new HTTPException(403, { message: 'Access denied' });
        }

        // Client integrity validation (optional)
        if (!(await this.validateClientIntegrity(c))) {
          throw new HTTPException(403, { message: 'Invalid client verification' });
        }
      }

      // Security headers
      if (this.options.securityHeaders) {
        c.header('X-Content-Type-Options', 'nosniff');
        c.header('X-Frame-Options', 'DENY');
        c.header('X-XSS-Protection', '1; mode=block');
        c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        c.header('Content-Security-Policy', "default-src 'self'");
        c.header('Permissions-Policy', 'interest-cohort=()');
        c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
        c.header('X-Robots-Tag', 'noindex, nofollow');
      }

      await next();
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Internal server error' });
    }
  };

  // Clean up old rate limit entries periodically
  public cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, info] of this.rateLimitStore.entries()) {
      if (now - info.timestamp > this.options.rateLimit.windowMs) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

export { type SecurityOptions, SecurityMiddleware };
