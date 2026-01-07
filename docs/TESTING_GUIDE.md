# Testing Infrastructure Guide

## Overview

Comprehensive testing strategy for Admin Pro HVAC covering unit tests, integration tests, and end-to-end testing.

---

## Setup

### 1. Install Testing Dependencies

```bash
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  happy-dom \
  @firebase/rules-unit-testing
```

### 2. Configure Vitest

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData'
      ]
    }
  }
});
```

### 3. Test Setup File

**File:** `src/test/setup.ts`

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Firebase
vi.mock('./firebaseConfig', () => ({
  db: {},
  auth: {},
  storage: {}
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});
```

---

## Unit Tests

### Testing Services

**File:** `src/services/__tests__/claimService.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { claimService } from '../claimService';
import { Claim } from '../../types/claim';

// Mock Firestore
vi.mock('../firebaseConfig', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn()
  }
}));

describe('ClaimService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClaim', () => {
    it('should create a new claim with auto-generated claim number', async () => {
      const mockClaim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'> = {
        claimNumber: '',
        customerId: 'user123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        type: 'warranty',
        category: 'parts',
        amount: 5000000,
        description: 'Test claim',
        attachments: [],
        status: 'draft',
        priority: 'medium',
        tags: []
      };

      const result = await claimService.createClaim(mockClaim);

      expect(result.claimNumber).toMatch(/^CLM-\d+$/);
      expect(result.createdAt).toBeDefined();
      expect(result.status).toBe('draft');
    });
  });

  describe('updateClaimStatus', () => {
    it('should update status and set appropriate timestamp', async () => {
      const claimId = 'claim123';
      
      await claimService.updateClaimStatus(claimId, 'approved');

      // Verify updateDoc was called with correct data
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'approved',
          approvedAt: expect.any(String)
        })
      );
    });
  });
});
```

### Testing React Components

**File:** `src/components/__tests__/ClaimsList.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClaimsList from '../ClaimsList';

// Mock service
vi.mock('../../services/claimService', () => ({
  claimService: {
    getClaims: vi.fn(() => Promise.resolve([
      {
        id: '1',
        claimNumber: 'CLM-001',
        customerName: 'John Doe',
        amount: 5000000,
        status: 'pending_approval'
      }
    ])),
    updateClaimStatus: vi.fn()
  }
}));

describe('ClaimsList Component', () => {
  it('renders claims list', async () => {
    render(<ClaimsList />);

    await waitFor(() => {
      expect(screen.getByText('CLM-001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('filters claims by status', async () => {
    const user = userEvent.setup();
    render(<ClaimsList />);

    const statusFilter = screen.getByRole('combobox');
    await user.selectOptions(statusFilter, 'approved');

    await waitFor(() => {
      expect(claimService.getClaims).toHaveBeenCalledWith({
        status: 'approved'
      });
    });
  });

  it('handles claim approval', async () => {
    const user = userEvent.setup();
    render(<ClaimsList />);

    await waitFor(() => {
      expect(screen.getByText('CLM-001')).toBeInTheDocument();
    });

    const approveButton = screen.getByTitle('Phê duyệt');
    await user.click(approveButton);

    expect(claimService.updateClaimStatus).toHaveBeenCalledWith(
      '1',
      'approved'
    );
  });
});
```

### Testing Custom Hooks

**File:** `src/hooks/__tests__/useAsync.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsync } from '../useCustomHooks';

describe('useAsync Hook', () => {
  it('should handle successful async operation', async () => {
    const mockFn = vi.fn(() => Promise.resolve('success'));
    
    const { result } = renderHook(() => useAsync(mockFn, true));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('success');
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle async errors', async () => {
    const mockError = new Error('Test error');
    const mockFn = vi.fn(() => Promise.reject(mockError));
    
    const { result } = renderHook(() => useAsync(mockFn, true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeNull();
    });
  });
});
```

---

## Integration Tests

### Testing Firestore Rules

**File:** `firestore.tests.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeEach(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: readFileSync('./firestore.rules', 'utf8')
    }
  });
});

afterEach(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules', () => {
  it('allows admins to read/write users collection', async () => {
    const adminDb = testEnv.authenticatedContext('admin', {
      admin: true
    }).firestore();

    await assertSucceeds(
      adminDb.collection('users').doc('user123').get()
    );

    await assertSucceeds(
      adminDb.collection('users').doc('user123').set({
        email: 'test@example.com'
      })
    );
  });

  it('denies non-admins from writing users collection', async () => {
    const userDb = testEnv.authenticatedContext('user123').firestore();

    await assertFails(
      userDb.collection('users').doc('user456').set({
        email: 'hacker@example.com'
      })
    );
  });

  it('allows authenticated users to read error codes', async () => {
    const userDb = testEnv.authenticatedContext('user123').firestore();

    await assertSucceeds(
      userDb.collection('errorCodes').get()
    );
  });
});
```

---

## E2E Tests (Optional - Playwright)

### Setup Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**File:** `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true
  }
});
```

**File:** `e2e/claims.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Claims Flow', () => {
  test('should create and approve a claim', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to claims
    await page.click('text=Claims');
    await expect(page).toHaveURL(/\/claims/);

    // Create new claim
    await page.click('text=Tạo claim mới');
    await page.fill('[name="customerName"]', 'Test Customer');
    await page.fill('[name="amount"]', '5000000');
    await page.fill('[name="description"]', 'Test claim');
    await page.click('text=Tạo');

    // Verify claim appears in list
    await expect(page.locator('text=Test Customer')).toBeVisible();

    // Approve claim
    await page.click('[title="Phê duyệt"]');
    await expect(page.locator('text=Đã duyệt')).toBeVisible();
  });
});
```

---

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run UI mode
npm run test:ui
```

### Integration Tests

```bash
# Run Firestore rules tests
npm run test:rules
```

### E2E Tests

```bash
# Run Playwright tests
npx playwright test

# Run in headed mode
npx playwright test --headed

# Run specific test
npx playwright test e2e/claims.spec.ts
```

---

## CI/CD Integration

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Best Practices

1. **Test Coverage:** Aim for >80% coverage on critical paths
2. **Isolation:** Mock external dependencies (Firebase, APIs)
3. **Fast Tests:** Unit tests should run in < 100ms each
4. **Descriptive Names:** `it('should create claim with auto-generated number')`
5. **AAA Pattern:** Arrange → Act → Assert
6. **Clean Up:** Always cleanup after tests

---

## Summary

This testing infrastructure provides:
- ✅ Unit tests for services & components
- ✅ Integration tests for Firestore rules
- ✅ E2E tests with Playwright (optional)
- ✅ CI/CD integration ready
- ✅ Coverage reporting

**Test Quality Metrics:**
- Coverage target: 80%+
- Test execution time: < 30s for unit tests
- Flaky test rate: < 1%
