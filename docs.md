# Setup and Deployment Guide

## Setting up secrets

# Set up your API keys as secrets (these will be encrypted and not visible in the dashboard)
wrangler secret put API_KEY
wrangler secret put CODEX_API
wrangler secret put BIRDEYE_API
wrangler secret put COINMARKETCAP_API

## Environment-specific deployments

# Deploy to development
wrangler deploy --env development

# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production

## Managing secrets for different environments

# Set secrets for specific environments
wrangler secret put API_KEY --env production
wrangler secret put CODEX_API --env production
wrangler secret put BIRDEYE_API --env production
wrangler secret put COINMARKETCAP_API --env production

# List secrets (this will only show names, not values)
wrangler secret list
wrangler secret list --env production

# Delete a secret if needed
wrangler secret delete API_KEY --env development

## Local development with secrets

# For local development, create a .dev.vars file (similar to .env)
# This file should contain the same variables as your secrets
echo "API_KEY=your_local_api_key" > .dev.vars
echo "CODEX_API=your_local_CODEX_API" >> .dev.vars
echo "BIRDEYE_API=your_local_birdeye_key" >> .dev.vars
echo "COINMARKETCAP_API=your_local_coinmarketcap_key" >> .dev.vars

# Run locally with wrangler
wrangler dev

## Viewing logs
wrangler tail
wrangler tail --env production

## Useful commands

# View current deployment info
wrangler whoami
wrangler deployments list

# Run tests locally
bun test

# Build the project
bun run build

# Type check
bun run type-check
