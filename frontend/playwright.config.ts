import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/global-setup.ts',
    },
    {
      name: 'employee',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/employee.json',
      },
      testMatch: ['**/login.spec.ts', '**/dashboard.spec.ts', '**/new-request.spec.ts', '**/request-detail.spec.ts'],
      dependencies: ['setup'],
    },
    {
      name: 'finance',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/finance.json',
      },
      testMatch: '**/finance.spec.ts',
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NUXT_PUBLIC_API_BASE: 'http://localhost:8000',
    },
  },
})
