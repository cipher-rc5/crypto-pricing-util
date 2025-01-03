# Crypto Pricing Utility

A Cloudflare Worker service that aggregates cryptocurrency pricing data from multiple sources.

## Project Structure

```
├── config
│   ├── chains.ts
│   └── hosted-scalar.ts
├── index.ts
├── middleware
│   ├── auth.ts
│   └── security.ts
├── prices.ts
├── services
│   ├── birdeye.ts
│   ├── codex.ts
│   ├── coinpaprika.ts
│   ├── defillama.ts
│   ├── dexscreener.ts
│   └── geckoterminal.ts
└── types.ts
```

## Features

- Multi-source price aggregation
- Chain-agnostic design
- Historical price lookups
- API key authentication
- Request rate limiting

## Integrated Price Sources

Currently supported:

- Birdeye (requires API key)
- Codex (requires API key)
- GeckoTerminal [CoinGecko] (30 address limit per request)
- Dexscreener (30 address limit per request)
- DeFiLlama

Coming soon:

- Dexview
- Coinpaprika
- Coinmarketcap

## Setup

### Dependencies

1. Install required packages:

```sh
bun add zod hono openapi3-ts @scalar/hono-api-reference @hono/zod-validator @types/bun
```

2. (Optional) Configure dprint for code formatting:

```sh
bun add dprint && touch dprint.json && dprint config add typescript
```

For more information about dprint, visit the [official documentation](https://dprint.dev).

### Configuration

1. Set up Cloudflare secrets:

```sh
bunx wrangler secret put BIRDEYE_API
bunx wrangler secret put CODEX_API
bunx wrangler secret put COINMARKETCAP_API
```

2. Create KV Namespace for API key authentication:

```sh
bunx wrangler kv:namespace create "API_KEYS"
```

confirm output and annotate namespace for future reference later, if ever needed

> **Note:** (Not as secure as using Cloudflare Secrets, which should be implemented for actual production usage)

3. Add the generated namespace ID to your `wrangler.toml`

4. Add an API key to the KV store:

```sh
bunx wrangler kv:key put --binding=API_KEYS "your-api-key-here" "true"
```

## API Usage

### Health Check

```sh
curl -H "X-API-Key: {YOUR_API_KEY}" https://{YOUR_WORKER_DOMAIN}/health
```

### Price Lookup

Basic price lookup:

```sh
curl -X POST \
  -H "X-API-Key: {YOUR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"chainId": 1, "tokenAddress": "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29"}' \
  https://{YOUR_WORKER_DOMAIN}/api/prices
```

Historical price lookup:

```sh
curl -X POST \
  -H "X-API-Key: {YOUR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "chainId": 1,
    "tokenAddress": "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29",
    "timestamp": 1732084737
  }' \
  https://{YOUR_WORKER_DOMAIN}/api/prices
```

## Response Format

```typescript
interface PriceResponse {
  price: number;
  timestamp: number;
  source: string;
}
```

## Development

1. Clone the repository
2. Install dependencies with `bun install`
3. Create a `.dev.vars` file for local development:

```env
BIRDEYE_API=your_birdeye_api_key
CODEX_API=your_codex_api_key
COINMARKETCAP_API=your_coinmarketcap_api_key
```

4. Run locally with `bun run dev`
5. Deploy with `bun run deploy`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details
