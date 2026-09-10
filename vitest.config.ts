import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
      // Mirrors the tsconfig path of the same name.
      '@payload-config': path.resolve(process.cwd(), 'payload.config.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['tests/setup.ts'],
    // Payload + SQLite tests share one database file; running them in parallel
    // processes causes lock contention rather than useful speed.
    fileParallelism: false,
    testTimeout: 30_000,
    // `server-only` throws if imported outside a React Server Component context.
    // Under test we stub it out — the guard is a build-time concern, not a test one.
    alias: {
      'server-only': path.resolve(process.cwd(), 'tests/stubs/server-only.ts'),
    },
  },
})
