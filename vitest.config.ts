import { defineConfig } from 'vitest/config';

// Workspace spec 091, decision 3: only pure rule modules are tested here.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
