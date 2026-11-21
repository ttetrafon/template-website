import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  resolve: {
    // the same alias as in vite.config.ts
    alias: {
      'library': resolve(import.meta.dirname, './library')
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
  },
})
