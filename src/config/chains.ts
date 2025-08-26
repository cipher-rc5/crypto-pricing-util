// file: src/config/chains.ts
// description: chain configuration and service mappings for supported blockchains
// docs_reference: https://chainlist.org/

type SupportedChains = typeof supported_chains;
type ServiceName = keyof SupportedChains;

// Define supported chains per service
export const supported_chains = {
  birdeye: ['solana', 'ethereum', 'arbitrum', 'avalanche', 'bsc', 'optimism', 'polygon', 'base', 'zksync'] as const,
  codex: [{ id: 1088, name: 'Metis' }, { id: 5000, name: 'Mantle' }, { id: 1, name: 'Ethereum' }] as const,
  coinpaprika: [
    'btc-bitcoin',
    'eos-eos',
    'eth-ethereum',
    'xrp-xrp',
    'bch-bitcoin-cash',
    'ada-cardano',
    'xem-nem',
    'neo-neo',
    'xlm-stellar',
    'etc-ethereum-classic',
    'qtum-qtum'
  ],
  defillama: ['ethereum', 'arbitrum', 'avalanche', 'bsc', 'optimism', 'polygon', 'base', 'zksync'] as const,
  dexscreener: [{ id: 1, name: 'Ethereum' }, { id: 42161, name: 'Arbitrum' }, { id: 43114, name: 'Avalanche' }, { id: 56, name: 'BSC' }, {
    id: 10,
    name: 'Optimism'
  }, { id: 137, name: 'Polygon' }] as const,
  geckoterminal: [
    { id: 1, name: 'eth' },
    { id: 42161, name: 'arbitrum' },
    { id: 43114, name: 'avalanche' },
    { id: 56, name: 'bsc' },
    { id: 10, name: 'optimism' },
    { id: 137, name: 'polygon' },
    { id: 1399811149, name: 'solana' }
  ] as const,
  parsec: ['eth', 'arb', 'bsc', 'opt', 'polygon', 'base', 'blast', 'mode', 'mantle', 'sanko'] as const
};

// Chain ID to service-specific name mapping
export const chainIdToName: Record<string, Record<string, string>> = {
  '1': { defillama: 'ethereum', birdeye: 'ethereum', geckoterminal: 'eth' },
  '56': { defillama: 'binance', birdeye: 'bsc', geckoterminal: 'bsc' },
  '1399811149': { defillama: 'solana', birdeye: 'solana', geckoterminal: 'solana' }
};

// URLs for API services
export const service_api_url = {
  birdeye: 'https://public-api.birdeye.so',
  codex: 'https://graph.codex.io',
  coinpaprika: 'https://api.coinpaprika.com/v1',
  defillama: 'https://coins.llama.fi',
  dexscreener: 'https://api.dexscreener.com/latest/dex',
  geckoterminal: 'https://api.geckoterminal.com/api/v2',
  parsec: 'https://api.parsec.finance/v1'
} as const;

// Helper functions
function hasChainIds(chains: readonly any[]): chains is readonly { id: number, name: string }[] {
  if (!Array.isArray(chains)) return false;
  if (chains.length === 0) return false;
  if (typeof chains[0] === 'string') return false;
  return typeof chains[0] === 'object' && chains[0] !== null && 'id' in chains[0];
}

export function isChainSupportedByService(chainId: string | number, service: ServiceName): boolean {
  const chains = supported_chains[service];
  if (hasChainIds(chains)) return chains.some(chain => chain.id.toString() === chainId.toString());
  const chainName = chainIdToName[chainId.toString()]?.[service];
  return chainName ? (chains as readonly string[]).includes(chainName) : false;
}

export function getChainNameByService(chainId: string | number, service: ServiceName): string | null {
  const chains = supported_chains[service];
  if (hasChainIds(chains)) return chains.find(chain => chain.id.toString() === chainId.toString())?.name ?? null;
  return chainIdToName[chainId.toString()]?.[service] ?? null;
}
