# Testing Guide

## Overview
This document explains how to run tests for the Countries3 IAM application.

---

## Backend Testing (Jest)

### Setup

**1. Stop Docker containers first:**
```bash
docker compose -f docker-compose.dev.yml down
```

**2. Install test dependencies:**
```bash
cd apps/backend
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
```

**3. Create jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

**4. Add test script to package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Test Files Created

- `src/auth/auth.service.spec.ts` - Auth service unit tests
- `src/auth/token.service.spec.ts` - Token service unit tests

### Test Coverage

**Priority areas:**
- ✅ Auth service (login, register, password reset)
- ✅ Token service (generate, validate, revoke)
- 🔄 Users service (create, update, profile)
- 🔄 Geography service (CRUD operations)

---

## Frontend Testing (Playwright)

### Setup

**1. Install Playwright:**
```bash
cd apps/frontend
npm install --save-dev @playwright/test
npx playwright install
```

**2. Create playwright.config.ts:**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**3. Create e2e test directory:**
```bash
mkdir apps/frontend/e2e
```

### Example E2E Test

**e2e/auth.spec.ts:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', 'ajabadia@gmail.com');
    await page.fill('input[type="password"]', '111111');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

### Running E2E Tests

```bash
# Run tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test e2e/auth.spec.ts
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd apps/backend
          npm ci
      
      - name: Run tests
        run: |
          cd apps/backend
          npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: apps/backend/coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Start services
        run: docker compose -f docker-compose.dev.yml up -d
      
      - name: Wait for services
        run: sleep 10
      
      - name: Install Playwright
        run: |
          cd apps/frontend
          npm ci
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd apps/frontend
          npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

---

## Test Best Practices

### Unit Tests
- ✅ Mock external dependencies
- ✅ Test edge cases
- ✅ Use descriptive test names
- ✅ One assertion per test (when possible)
- ✅ Clean up after tests

### E2E Tests
- ✅ Test critical user flows
- ✅ Use data-testid attributes
- ✅ Clean up test data
- ✅ Run against test database
- ✅ Keep tests independent

---

## Current Test Status

### Backend
- ✅ Auth service tests (example created)
- ✅ Token service tests (example created)
- ⏳ Users service tests (pending)
- ⏳ Geography service tests (pending)

### Frontend
- ⏳ Login flow (pending)
- ⏳ Password reset flow (pending)
- ⏳ User profile (pending)

---

## Next Steps

1. **Stop Docker containers**
2. **Install test dependencies**
3. **Run existing tests**
4. **Add more test coverage**
5. **Setup CI/CD pipeline**
6. **Monitor coverage reports**

---

## Notes

> [!IMPORTANT]
> - Always stop Docker before installing npm packages
> - Use test database for integration tests
> - Keep test data isolated
> - Run tests before committing

> [!TIP]
> - Use `--watch` mode during development
> - Focus on critical paths first
> - Aim for 70%+ coverage
> - Mock external services (email, etc.)
