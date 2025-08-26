// test/setup.ts

import { beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting crypto pricing API tests');
});

afterAll(() => {
  console.log('✅ All tests completed');
});

// Clean up between tests
beforeEach(() => {
  // Reset any global state if needed
});

afterEach(() => {
  // Clean up after each test
});
