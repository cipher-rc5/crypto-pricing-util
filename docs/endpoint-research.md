# Cryptocurrency Pricing - API Calls External

## DefiLlama

api_base: https://coins.llama.fi/prices/current/{defiLlama_inputs}

documentation: https://defillama.com/docs/api

authentication: none

supports:

- prices/current
- prices/historical

Tokens are queried using {chain}:{address}, where chain is an identifier such as ethereum, bsc, polygon, avax... You can also get tokens by coingecko id by setting coingecko as the chain, eg: coingecko:ethereum, coingecko:bitcoin.

Examples `{defiLlama_inputs}`:
ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1
bsc:0x762539b45a1dcce3d36d080f74d1aed37844b878
coingecko:ethereum
arbitrum:0x4277f8f2c384827b5273592ff7cebd9f2c1ac258

### /prices/current/{defiLlama_inputs}

request

```bash
curl -X 'GET' \
  'https://coins.llama.fi/prices/current/ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1,coingecko:ethereum,bsc:0x762539b45a1dcce3d36d080f74d1aed37844b878,ethereum:0xdB25f211AB05b1c97D595516F45794528a807ad8?searchWidth=1h' \
  -H 'accept: application/json'
```

response

```json
{
  "coins": {
    "ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1": {
      "decimals": 8,
      "price": 0.022053735051098835,
      "symbol": "cDAI",
      "timestamp": 0.99
    }
  }
}
```

### /prices/historical/{defiLlamaTimestampInput}/{defiLlama_inputs}

request

```bash
curl -X 'GET' \
  'https://coins.llama.fi/prices/historical/1648680149/ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1,coingecko:ethereum,bsc:0x762539b45a1dcce3d36d080f74d1aed37844b878,ethereum:0xdB25f211AB05b1c97D595516F45794528a807ad8?searchWidth=1h' \
  -H 'accept: application/json'
```

response

```json
{
  "coins": {
    "bsc:0x762539b45a1dcce3d36d080f74d1aed37844b878": {
      "decimals": 18,
      "symbol": "lina",
      "price": 0.025644468757846508,
      "timestamp": 1648679991
    },
    "ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1": {
      "decimals": 8,
      "symbol": "HUSD",
      "price": 0.9982396994710859,
      "timestamp": 1648680136
    },
    "ethereum:0xdB25f211AB05b1c97D595516F45794528a807ad8": {
      "decimals": 2,
      "symbol": "EURS",
      "price": 1.112034360864863,
      "timestamp": 1648680027
    },
    "coingecko:ethereum": { "symbol": "ETH", "price": 3386.0253743841786, "timestamp": 1648680221 }
  }
}
```

## Coinpaprika

api_base: https://api.coinpaprika.com/v1/

documentation: https://api.coinpaprika.com/

authentication: none

supports:

- prices/current
- prices/historical

### list contract platforms

```bash
curl --request GET \
--url 'https://api.coinpaprika.com/v1/contracts'
```

### /contracts/{coinpaprika_platform_id}/{coinpaprika_inputs}

redirect to ticker by contract address

requires: string platform_id, string contract_address

documentation: https://api.coinpaprika.com/#tag/Contracts/operation/getTicker

request

```bash
curl --request GET \
--url 'https://api.coinpaprika.com/v1/contracts/eth-ethereum/0xd26114cd6ee289accf82350c8d8487fedb8a0c07'
```

response

```json
{
  "id": "omg-omg-network",
  "name": "OMG Network",
  "symbol": "OMG",
  "rank": 493,
  "total_supply": 140245398,
  "max_supply": 0,
  "beta_value": 1.26049,
  "first_data_at": "2017-07-14T00:00:00Z",
  "contract_start_at": "0001-01-01T00:00:00Z",
  "contract_end_at": "0001-01-01T00:00:00Z",
  "contract_active": true,
  "last_updated": "2024-12-08T22:02:35Z",
  "quotes": {
    "USD": {
      "price": 0.5840811745500313,
      "volume_24h": 11109469.181310238,
      "volume_24h_change_24h": 25.97,
      "market_cap": 81914697,
      "market_cap_change_24h": 2.91,
      "percent_change_15m": 0.84,
      "percent_change_30m": 0.35,
      "percent_change_1h": 0.7,
      "percent_change_6h": 0.49,
      "percent_change_12h": 5.36,
      "percent_change_24h": 2.91,
      "percent_change_7d": 19.24,
      "percent_change_30d": 127.26,
      "percent_change_1y": -22.05,
      "ath_price": 28.3519,
      "ath_date": "2018-01-08T03:09:00Z",
      "percent_from_price_ath": -97.96
    }
  }
}
```

### redirect to historical ticks by contract address

requires: string platform_id, string contract_address, string start: unixtimestamp, string end: unixtimestamp optional, integer limit max 5000 optional, string quote: usd or btc optional, string interval available values: 5m 10m 15m 30m 45m 1h 2h 3h 6h 12h 24h 1d 7d 14d 30d 90d 365d optional default: 5m

documentation: https://api.coinpaprika.com/#tag/Contracts/operation/getHistoricalTicker

request

```bash
curl --request GET \
--url 'https://api.coinpaprika.com/v1/contracts/eth-ethereum/0xd26114cd6ee289accf82350c8d8487fedb8a0c07/historical?start=1732084737&interval=5m'
```

response

```json
[
  { "timestamp": "2024-06-28T00:00:00Z", "price": 0.02174, "volume_24h": 150842483, "market_cap": 0 },
  { "timestamp": "2024-06-29T00:00:00Z", "price": 0.020861, "volume_24h": 112666073, "market_cap": 0 },
  { "timestamp": "2024-06-30T00:00:00Z", "price": 0.021573, "volume_24h": 88001567, "market_cap": 0 }
]
```

## Dexscreener

api_base: https://api.dexscreener.com/latest/dex/tokens/{tokenAddresses}

documentation: https://docs.dexscreener.com/api/reference#latest-dex-tokens-tokenaddresses

authentication: none

supports:

- prices/current

requires: string tokenAddresses max 30

### /latest/dex/tokens/{tokenAddresses}

request

```bash
curl -L \
  'https://api.dexscreener.com/latest/dex/tokens/{tokenAddresses}'
```

response

```json
{
  "schemaVersion": "text",
  "pairs": [
    {
      "chainId": "text",
      "dexId": "text",
      "url": "https://example.com",
      "pairAddress": "text",
      "labels": ["text"],
      "baseToken": { "address": "text", "name": "text", "symbol": "text" },
      "quoteToken": { "address": "text", "name": "text", "symbol": "text" },
      "priceNative": "text",
      "priceUsd": "text",
      "liquidity": { "usd": 0, "base": 0, "quote": 0 },
      "fdv": 0,
      "marketCap": 0,
      "pairCreatedAt": 0,
      "info": {
        "imageUrl": "https://example.com",
        "websites": [{ "url": "https://example.com" }],
        "socials": [{ "platform": "text", "handle": "text" }]
      },
      "boosts": { "active": 0 }
    }
  ]
}
```

## Coinmarketcap

documentation: https://coinmarketcap.com/api/documentation/v1/

authentication: none

## Parsec Finance

api_base: https://api.parsec.finance/api/rest/token

documentation: https://parsec.fi/api/token

authentication: apiKey

supports:

- token
- token delta
- token holders

/?address={address}&chain={parsec_supported_chain}&apiKey={PARSEC_KEY}

request

```bash
https://api.parsec.finance/api/rest/token?address=0x5283d291dbcf85356a21ba090e6db59121208b44&chain=eth&apiKey=YourApiKey
```

response

```json
{
  "assetByAddress": {
    "address": "0x5283d291dbcf85356a21ba090e6db59121208b44",
    "chain": "eth",
    "chainsExtended": [{ "address": "0x5283d291dbcf85356a21ba090e6db59121208b44", "chain": "eth" }],
    "circulatingSupply": "2058517918.093607",
    "decimals": 18,
    "fullyDilutedSupply": "3000000000",
    "imgSrc": "https://assets.coingecko.com/coins/images/28453/small/blur.png?1670745921",
    "liquidityPools": [
      {
        "address": "0x6f41040b9e098c2ac4b88e27b50d4e9ab486781b",
        "chain": "eth",
        "liquidityUsd": "134019.05909461726",
        "protocol": "uniswap-v3",
        "reserveUsd": "134019.05909461726",
        "tokens": [
          {
            "address": "0x5283d291dbcf85356a21ba090e6db59121208b44",
            "balance": "251655.64180376515",
            "decimals": "18",
            "symbol": "BLUR",
            "weight": 0.5
          },
          {
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "balance": "8.177349254308242",
            "decimals": "18",
            "symbol": "ETH",
            "weight": 0.5
          }
        ],
        "volumeUsd": "20748.119159859732"
      },
      {
        "address": "0x824a30f2984f9013f2c8d0a29c0a3cc5fd5c0673",
        "chain": "eth",
        "liquidityUsd": "239124.2141806556",
        "protocol": "uniswap-v3",
        "reserveUsd": "239124.2141806556",
        "tokens": [
          {
            "address": "0x5283d291dbcf85356a21ba090e6db59121208b44",
            "balance": "525006.7618055902",
            "decimals": "18",
            "symbol": "BLUR",
            "weight": 0.5
          },
          {
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "balance": "6.834089039015728",
            "decimals": "18",
            "symbol": "ETH",
            "weight": 0.5
          }
        ],
        "volumeUsd": "10183.03519153122"
      },
      {
        "address": "0xc7bc4d040bb13213e453c79bc4b5af569b49b885",
        "chain": "eth",
        "liquidityUsd": "25905.821078442044",
        "protocol": "uniswap-v2",
        "reserveUsd": "25905.821078442044",
        "tokens": [
          {
            "address": "0x5283d291dbcf85356a21ba090e6db59121208b44",
            "balance": "18727.417968520167",
            "decimals": "18",
            "symbol": "BLUR",
            "weight": 0.5
          },
          {
            "address": "0xceb67a66c2c8a90980da3a50a3f96c07525a26cb",
            "balance": "868487310.9751071",
            "decimals": "9",
            "symbol": "KABOSU",
            "weight": 0.5
          }
        ],
        "volumeUsd": "162.32543196283925"
      }
    ],
    "name": "Blur",
    "symbol": "BLUR",
    "totalSupply": "3000000000",
    "tradesStatsIntervals": {
      "interval_1d": {
        "buyVolumeUsd": 14329.998091643842,
        "buyersCount": 8,
        "buysCount": 9,
        "sellVolumeUsd": 46030.05921553786,
        "sellersCount": 18,
        "sellsCount": 23,
        "totalVolumeUsd": 60360.057307181705,
        "tradesCount": 32
      },
      "interval_1h": {
        "buyVolumeUsd": null,
        "buyersCount": 0,
        "buysCount": null,
        "sellVolumeUsd": null,
        "sellersCount": 0,
        "sellsCount": null,
        "totalVolumeUsd": null,
        "tradesCount": 0
      },
      "interval_4h": {
        "buyVolumeUsd": 615.7892100969667,
        "buyersCount": 1,
        "buysCount": 1,
        "sellVolumeUsd": 368.9584002507059,
        "sellersCount": 2,
        "sellsCount": 2,
        "totalVolumeUsd": 984.7476103476727,
        "tradesCount": 3
      },
      "interval_5m": {
        "buyVolumeUsd": null,
        "buyersCount": 0,
        "buysCount": null,
        "sellVolumeUsd": null,
        "sellersCount": 0,
        "sellsCount": null,
        "totalVolumeUsd": null,
        "tradesCount": 0
      }
    },
    "usdPrice": 0.40323953661071293,
    "usdPriceDelta1d": -0.03559104903926955,
    "volume1d": 31361.60768247978
  },
  "contract": {
    "address": "0x5283d291dbcf85356a21ba090e6db59121208b44",
    "chain": "eth",
    "deployment": {
      "deployer": "0x2ec1c79e71594373123d7b86d5847eef1ce0a475",
      "deployerAddressLabel": { "address": "0x2ec1c79e71594373123d7b86d5847eef1ce0a475", "label": null },
      "timestamp": 1675191035,
      "tx": "0xdb0c0f0ce449b615b98aca57675667937d2b96e0e7ff8c4fdaffb93aa9bb9309"
    }
  }
}
```

## Geckoterminal

api_base: https://api.geckoterminal.com/api/v2
documentation: https://www.geckoterminal.com/dex-api

authentication: none

supports:

- /networks
- prices/current
- prices/historical

Tokens are queried using {chain}:{address}, where chain is an identifier such as ethereum, bsc, polygon, avax... You can also get tokens by coingecko id by setting coingecko as the chain, eg: coingecko:ethereum, coingecko:bitcoin.

Examples `{defiLlama_inputs}`:
ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1
bsc:0x762539b45a1dcce3d36d080f74d1aed37844b878
coingecko:ethereum
arbitrum:0x4277f8f2c384827b5273592ff7cebd9f2c1ac258

### /networks

request

```bash
curl -X 'GET' \
  'https://api.geckoterminal.com/api/v2/networks?page=1' \
  -H 'accept: application/json'
```

response_schema

```json
{
  "data": [
    {
      "id": "string",
      "type": "string",
      "attributes": {
        "name": "string",
        "coingecko_asset_platform_id":"string"
      }
    }
  ]
}
```
