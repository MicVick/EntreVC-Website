import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    // `server-only` throws if imported outside a React Server Component context.
    // Under test we stub it out — the guard is a build-time concern, not a test one.
    alias: {
      'server-only': path.resolve(process.cwd(), 'tests/stubs/server-only.ts'),
    },
  },
})
