import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:5174', headless: true },
  webServer: {
    command: 'npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174/tests/layout.html',
    reuseExistingServer: false,
  },
})
