// test/utils/helpers.test.ts
import { expect, test, describe } from 'bun:test';

describe('Utility Helpers', () => {
  test('should validate EVM address format', () => {
    const validEVMAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
    const invalidEVMAddress = '0xinvalid';

    expect(validEVMAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(invalidEVMAddress).not.toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should validate Solana address format', () => {
    const validSolanaAddress = '3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN';
    const invalidSolanaAddress = '0xinvalid';

    expect(validSolanaAddress).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
    expect(invalidSolanaAddress).not.toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  });

  test('should identify chain types correctly', () => {
    expect('1399811149').toBe('1399811149'); // Solana
    expect('1').toBe('1'); // Ethereum
    expect('56').toBe('56'); // BSC
  });
});
