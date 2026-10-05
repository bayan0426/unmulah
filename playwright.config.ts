import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    channel: 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm.cmd run dev -- --port 4173',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
