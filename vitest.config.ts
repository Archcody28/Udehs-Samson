import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Test-only Vite config. Mirrors the aliasing of vite.config.ts without
// pulling the dev-only/preview-only plugins (source-tags, tailwind browser
// tooling) into the test graph.
export default defineConfig({
  root: rootDir,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/src/**/*.{test,spec}.js'],
    setupFiles: ['./src/__tests__/setup.ts'],
    restoreMocks: true,
    // jsdom browser APIs are threaded through the small setup file so every
    // smoke test gets a consistent DOM before any component code runs.
  },
});
