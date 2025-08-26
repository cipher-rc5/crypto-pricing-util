#!/usr/bin/env nu

let start = (date now | format date "%s.%3f" | into float)
let response = (http post -t application/json --headers { 'X-API-Key': 'DEPLOYMENT-API-KEY' } 'https://crypto-pricing.ciphers.workers.dev/api/prices' { chainId: 1, tokenAddress: "0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29" })
let end = (date now | format date "%s.%3f" | into float)
let duration = ($end - $start) * 1000
echo $"Request took: ($duration | into int) ms"
