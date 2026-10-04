import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    // Each DB test file boots its own in-memory Postgres (PGlite) and runs the migrations.
    hookTimeout: 60_000,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}', 'src/test-utils/**'],
      // Ratchet: set just below the measured coverage; raise it as tests are added.
      // Measured 2026-10-05 on a clean checkout: 51.3 statements / 45.6 branches / 51.3 functions / 51.8 lines.
      thresholds: { statements: 50, branches: 44, functions: 50, lines: 50 },
    },
  },
});
