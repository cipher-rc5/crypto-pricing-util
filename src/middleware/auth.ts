// src/middleware/auth.ts

import { Context } from 'hono';

export async function apiKeyAuth(c: Context, next: () => Promise<void>) {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ error: 'Missing API key' }, 401);
  }

  const isValidKey = await c.env.API_KEYS.get(apiKey);
  if (!isValidKey) {
    return c.json({ error: 'Invalid API key' }, 403);
  }

  await next();
}
