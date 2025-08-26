# Test Cases

## unit status monitors

general unit status

request

```nu
http get 'https://crypto-pricing.ciphers.workers.dev'
| to json
```

response

```json
{
  "message": "Cryptocurrency Prices API",
  "status": "operational",
  "documentation": "/docs",
  "health": { "evm": "/health_check_evm", "svm": "/health_check_svm", "combined": "/health" },
  "version": "0.0.2",
  "services": ["birdeye", "codex", "defillama", "dexscreener", "geckoterminal"],
  "historicalPriceSupport": {
    "codex": "Supports historical prices via timestamp",
    "defillama": "Supports historical prices via timestamp with optional searchWidth parameter"
  },
  "contact": "@Cipher0091"
}
```

### /health_check_evm

request

```nu
http get --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/health_check_evm'
| to json
```

response

```json
{
  "success": true,
  "timestamp": 1733882648690,
  "services": {
    "birdeye": { "status": "operational", "latency": 242 },
    "codex": { "status": "down", "latency": 10, "error": "Codex API error: 530 - error code: 1016" },
    "defillama": { "status": "operational", "latency": 47 },
    "dexscreener": { "status": "operational", "latency": 48 },
    "geckoterminal": { "status": "operational", "latency": 123 }
  }
}
```

### /health_check_svm

request

```nu
http get --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/health_check_svm'
| to json
```

response

```json
{ "success": true, "timestamp": 1733883073728, "services": { "birdeye": { "status": "operational", "latency": 216 } } }
```

request

```nu
http get --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/health_check_svm'
| to json
```

response

```json
{
  "success": true,
  "timestamp": 1733882648690,
  "services": {
    "birdeye": { "status": "operational", "latency": 242 },
    "codex": { "status": "down", "latency": 10, "error": "Codex API error: 530 - error code: 1016" },
    "defillama": { "status": "operational", "latency": 47 },
    "dexscreener": { "status": "operational", "latency": 48 },
    "geckoterminal": { "status": "operational", "latency": 123 }
  }
}
```

```nu
http post -t application/json --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { chainId: 1, tokenAddress: "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29"}
| get prices
| to json
```

```nu
http post -t application/json --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { tokenAddress: "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29"}
```

## evm

### evm - single lookup

request

```nu
http post -t application/json --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { chainId: 1, tokenAddress: "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29"} | get prices | to json
```

response

```json
{
  "birdeye": {
    "priceUsd": 0.15268473265420143
  },
  "codex": {
    "priceUsd": null,
    "error": "Codex API error: 530 - error code: 1016"
  },
  "defillama": {
    "priceUsd": 0.151877,
    "timestamp": 1733781534
  },
  "dexscreener": {
    "priceUsd": "0.1535"
  },
  "geckoterminal": {
    "priceUsd": 0.152180607358793
  }
}
```

### evm - historical lookup

iteration 1

```nu
http post -t application/json --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { chainId: 1, tokenAddress: "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29", timestamp: 1732084737 }
| get prices
| to json
```

```json
{
  "codex": { "priceUsd": null, "error": "Codex API error: 530 - error code: 1016" },
  "defillama": { "priceUsd": 0.153989, "timestamp": 1733785133 }
}
```

### svm

### svm - single lookup

request

```nu
http post -t application/json --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { chainId: 1399811149, tokenAddress: '3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN'}
| to json
```

response

```json
{
  "success": true,
  "timestamp": 1733883417644,
  "prices": { "birdeye": { "priceUsd": 0.05623870198932229 } },
  "aggregatedPrice": 0.05623870198932229
}
```

### svm - historical lookup

request

```nu
http post -t application/json --headers { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { chainId: 1399811149, tokenAddress: '3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN' , timestamp: 1732084737}
| to json
```

response

```json
{
  "success": false,
  "timestamp": 1732084737,
  "prices": { "error": { "priceUsd": null, "error": "No supported services found for chain 1399811149" } },
  "aggregatedPrice": null
}
```


### misc

```nu
http post -t application/json -H { 'X-API-Key': $env.CIPHER_CRYPTO_PRICES } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { chainId: 1399811149, tokenAddress: '3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN'}
```
