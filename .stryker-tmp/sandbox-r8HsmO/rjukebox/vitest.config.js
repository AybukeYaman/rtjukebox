// @ts-nocheck
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['kiosk-web/**/*.test.js'],
  },
});