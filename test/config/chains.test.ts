// test/config/chains.test.ts

import { expect, test, describe } from 'bun:test';
import { supported_chains, chainIdToName, isChainSupportedByService, getChainNameByService } from '../../src/config/chains';

describe('Chain Configuration', () => {
  test('should have valid supported chains structure', () => {
    expect(supported_chains).toBeDefined();
    expect(supported_chains.birdeye).toContain('ethereum');
    expect(supported_chains.birdeye).toContain('solana');
    expect(supported_chains.defillama).toContain('ethereum');
  });

  test('should validate chain support correctly', () => {
    // Test Ethereum support
    expect(isChainSupportedByService(1, 'birdeye')).toBe(true);
    expect(isChainSupportedByService('1', 'defillama')).toBe(true);

    // Test Solana support
    expect(isChainSupportedByService('1399811149', 'birdeye')).toBe(true);
    expect(isChainSupportedByService(1399811149, 'geckoterminal')).toBe(true);

    // Test unsupported chains
    expect(isChainSupportedByService(999999, 'birdeye')).toBe(false);
  });

  test('should return correct chain names for services', () => {
    expect(getChainNameByService(1, 'birdeye')).toBe('ethereum');
    expect(getChainNameByService('56', 'birdeye')).toBe('bsc');
    expect(getChainNameByService('1399811149', 'geckoterminal')).toBe('solana');
    expect(getChainNameByService(999999, 'birdeye')).toBeNull();
  });

  test('should have valid chainId mappings', () => {
    expect(chainIdToName['1']).toBeDefined();
    expect(chainIdToName['1'].defillama).toBe('ethereum');
    expect(chainIdToName['56'].birdeye).toBe('bsc');
    expect(chainIdToName['1399811149'].birdeye).toBe('solana');
  });
});
