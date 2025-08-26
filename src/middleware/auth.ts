// file: src/middleware/auth.ts
// description: Authentication middleware using secrets instead of KV storage
// docs_reference: https://developers.cloudflare.com/workers/configuration/secrets/

import { Context } from 'hono';

// Use the auto-generated Env type from wrangler types
export async function apiKeyAuth(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ error: 'Missing API key' }, 401);
  }

  // Compare against the secret stored in environment
  const validApiKey = c.env.API_KEY;

  if (!validApiKey) {
    return c.json({ error: 'API key not configured' }, 500);
  }

  if (apiKey !== validApiKey) {
    return c.json({ error: 'Invalid API key' }, 403);
  }

  await next();
}
