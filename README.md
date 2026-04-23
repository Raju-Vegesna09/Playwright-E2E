# Enterprise Playwright Framework Blueprint for React Applications

This document defines a **FAANG-grade Playwright + TypeScript automation framework** optimized for reliability, speed, scale, and developer experience.

---

## 1) Architecture Design

### Recommended Pattern: **Hybrid (Fixtures + Page/Component Objects + Service Layer)**

For enterprise React apps, pure POM becomes too heavy and pure fixture-based tests can become hard to organize. A hybrid gives the best balance:

- **Playwright Fixtures** for lifecycle orchestration, dependency injection, environment wiring, authenticated contexts, API clients, and test data.
- **Page Objects** for route-level workflows and business actions.
- **Component Objects** for reusable UI blocks (header, table, modal, form controls).
- **Service/API Layer** for backend setup/cleanup and contract validation.

### Text Architecture Diagram

```text
                           +-------------------------+
                           |   CI Orchestrator       |
                           | (GitHub Actions/Jenkins)|
                           +-----------+-------------+
                                       |
                                       v
+-------------------+       +----------+-----------+      +----------------------+
| Test Spec Layer   | ----> | Fixture Composition  | ---> | Browser Context Pool |
| (*.spec.ts)       |       | base.extend(...)     |      | + storageState       |
+-------------------+       +----------+-----------+      +----------------------+
                                       |
             +-------------------------+--------------------------+
             |                         |                          |
             v                         v                          v
+---------------------+    +----------------------+    +------------------------+
| Page Objects        |    | Component Objects    |    | Service/API Clients    |
| user workflows      |    | reusable React UI    |    | APIRequestContext      |
+---------------------+    +----------------------+    +------------------------+
             |                         |                          |
             +-------------------------+--------------------------+
                                       |
                                       v
                           +-------------------------+
                           | Assertions + Reporting  |
                           | Playwright + Allure     |
                           +-------------------------+
```

---

## 2) Suggested Tech Stack

- **Language:** TypeScript (strict mode)
- **Runner:** `@playwright/test`
- **Assertions:** Built-in Playwright `expect`
- **Reporting:**
  - Playwright HTML report
  - Allure report (`allure-playwright`)
- **Quality tooling:** ESLint + Prettier + Husky + lint-staged
- **CI/CD:** GitHub Actions (primary), Jenkins (optional mirror)

---

## 3) Folder Structure (Scalable for 1000+ tests)

```text
repo-root/
├─ playwright.config.ts
├─ package.json
├─ tsconfig.json
├─ .env.dev
├─ .env.qa
├─ .env.staging
├─ .github/
│  └─ workflows/
│     └─ e2e.yml
├─ test-results/
├─ playwright-report/
├─ allure-results/
├─ src/
│  ├─ core/
│  │  ├─ fixtures/
│  │  │  ├─ base.fixture.ts
│  │  │  ├─ auth.fixture.ts
│  │  │  └─ data.fixture.ts
│  │  ├─ config/
│  │  │  ├─ env.ts
│  │  │  └─ projects.ts
│  │  ├─ logger/
│  │  │  └─ test-logger.ts
│  │  ├─ utils/
│  │  │  ├─ waits.ts
│  │  │  ├─ retry.ts
│  │  │  └─ selectors.ts
│  │  └─ accessibility/
│  │     └─ axe.ts
│  ├─ pages/
│  │  ├─ login.page.ts
│  │  ├─ dashboard.page.ts
│  │  └─ orders.page.ts
│  ├─ components/
│  │  ├─ navbar.component.ts
│  │  ├─ data-table.component.ts
│  │  └─ toast.component.ts
│  ├─ services/
│  │  ├─ auth.api.ts
│  │  ├─ users.api.ts
│  │  └─ orders.api.ts
│  ├─ data/
│  │  ├─ factories/
│  │  │  ├─ user.factory.ts
│  │  │  └─ order.factory.ts
│  │  └─ seeds/
│  │     └─ baseline.json
│  └─ tests/
│     ├─ smoke/
│     ├─ regression/
│     ├─ accessibility/
│     ├─ visual/
│     └─ api/
└─ README.md
```

### Separation of Concerns

- `tests/`: Intent and assertions only.
- `pages/` + `components/`: UI interactions only.
- `services/`: API-level operations.
- `fixtures/`: dependency graph + setup/teardown.
- `data/factories/`: deterministic test data generation.

---

## 4) Core Capabilities Design

## ✅ UI Testing

### Stable selector strategy

Priority order:
1. `getByTestId()` with **immutable** `data-testid`
2. `getByRole()` with accessible name
3. `getByLabel()` / `getByPlaceholder()` for form controls
4. CSS/XPath only as fallback

Selector governance:
- Enforce selector helper usage (`selectors.ts`)
- Ban brittle selectors in lint rules (e.g., dynamic CSS classes)

### Dynamic React handling

- Prefer assertions that synchronize naturally:
  - `await expect(locator).toBeVisible()`
  - `await expect(locator).toHaveText(...)`
- Use `locator` APIs (auto-retry) instead of raw `page.$`
- Wait for API effects with `waitForResponse` for critical state transitions
- Handle virtualized lists by scrolling/paging via component object

### Auto-waiting and retries

- Keep Playwright default auto-wait behavior
- Test-level retries only in CI (`retries: process.env.CI ? 2 : 0`)
- Add `expect` timeout tuning, not global sleeps

### Cross-browser matrix

- Playwright projects for Chromium/Firefox/WebKit
- Full matrix in nightly/regression; Chromium-only for PR smoke

## ✅ API Integration

- Use `APIRequestContext` for setup/teardown and backend assertions
- Network interception patterns:
  - `route.fulfill()` for deterministic UI test scenarios
  - `route.continue()` with mutation for edge-case simulation
- Validate UI + backend consistency in same test flow when meaningful

## ✅ Test Data Management

- Deterministic factories (faker seeded with test id)
- Per-test isolated data identifiers (UUID suffix)
- Environment-aware config via `.env.{env}` and typed loader
- Keep static baseline seed for contract-safe defaults

## ✅ Authentication Handling

- `storageState` generation in global setup for common roles
- Separate auth states per role (`admin.json`, `manager.json`, `viewer.json`)
- Rotate/recreate session state periodically in CI to avoid stale-token flakiness

---

## 5) Advanced Features

- **Parallel execution:** file-level + test-level where safe
- **Tagging strategy:** `@smoke`, `@regression`, `@a11y`, `@visual`, `@api`, `@flaky`
- **Visual testing (optional):** `toHaveScreenshot` with controlled baselines
- **Accessibility:** `@axe-core/playwright` integrated into dedicated a11y suite
- **Artifacts on failure:** trace, screenshot, video, console logs, network logs

---

## 6) Reliability Engineering

### Flaky-test controls

- Quarantine lane (`@flaky`) separated from merge gate
- Automatic retry in CI + flaky trend dashboard
- Fail build if flaky ratio exceeds threshold (e.g., >2%)

### Smart waits vs hard waits

**Do:** locator assertions, response waits, state-based waits

**Don’t:** `waitForTimeout` except temporary debug mode

### Logging strategy

Capture:
- browser console errors
- failed requests (status >= 400)
- uncaught page exceptions
- Playwright trace for failed retries

---

## 7) Developer Experience (DX)

- Single command bootstrap: `npm ci && npx playwright install --with-deps`
- NPM scripts:
  - `test:smoke`
  - `test:regression`
  - `test:headed`
  - `test:debug`
  - `test:report`
  - `test:allure`
- Strong contribution docs + coding standards
- Lint/format checks in pre-commit + CI

---

## 8) Sample Implementation

### `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '75%' : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

### Fixture setup (`src/core/fixtures/base.fixture.ts`)

```ts
import { test as base, expect, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';

type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  api: APIRequestContext;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  api: async ({ request }, use) => {
    await use(request);
  }
});

export { expect };
```

### Page + Component Object

```ts
// src/pages/orders.page.ts
import { expect, Locator, Page } from '@playwright/test';
import { DataTable } from '../components/data-table.component';

export class OrdersPage {
  private readonly heading: Locator;
  readonly table: DataTable;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Orders' });
    this.table = new DataTable(page.getByTestId('orders-table'));
  }

  async goto() {
    await this.page.goto('/orders');
    await expect(this.heading).toBeVisible();
  }
}
```

```ts
// src/components/data-table.component.ts
import { expect, Locator } from '@playwright/test';

export class DataTable {
  constructor(private readonly root: Locator) {}

  async expectRowCount(count: number) {
    await expect(this.root.getByRole('row')).toHaveCount(count + 1); // includes header row
  }

  rowByCellText(text: string): Locator {
    return this.root.getByRole('row').filter({ hasText: text });
  }
}
```

### Test file example

```ts
// src/tests/regression/orders.spec.ts
import { test, expect } from '../../core/fixtures/base.fixture';

test.describe('Orders @regression', () => {
  test('admin can view order row details @smoke', async ({ page }) => {
    await page.goto('/orders');

    const orderRow = page.getByRole('row', { name: /ORD-10001/i });
    await expect(orderRow).toBeVisible();
    await orderRow.getByRole('button', { name: 'View' }).click();

    await expect(page.getByRole('dialog', { name: 'Order Details' })).toBeVisible();
  });
});
```

---

## 9) CI/CD Design

### GitHub Actions example

```yaml
name: E2E

on:
  pull_request:
  push:
    branches: [main]

jobs:
  smoke:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: true
      matrix:
        browser: [chromium]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps ${{ matrix.browser }}
      - run: npx playwright test --project=${{ matrix.browser }} --grep @smoke
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-smoke
          path: playwright-report/

  regression:
    if: github.event_name == 'push'
    needs: smoke
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
        shard: [1/6, 2/6, 3/6, 4/6, 5/6, 6/6]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --project=${{ matrix.browser }} --shard=${{ matrix.shard }} --grep-invert @flaky
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.browser }}-${{ matrix.shard }}
          path: test-results/
```

### Jenkins (high-level)

- Use matrix axes: `BROWSER x SHARD`
- Stage 1: smoke gate (fail-fast true)
- Stage 2: regression shards (parallel)
- Stage 3: merge Allure reports + publish artifacts

---

## 10) Scaling Strategy: 10 → 1000+ Tests

### Phase model

- **10–100 tests:** single repo, simple domains, smoke + regression split
- **100–400 tests:** domain-based ownership (`orders`, `billing`, `identity`), strict fixture contracts
- **400–1000+ tests:**
  - aggressive sharding
  - flaky analytics and quarantine automation
  - environment pooling
  - selective test impact analysis (run tests by changed areas)

### Team collaboration model

- QA platform team owns core framework + CI standards
- Feature teams own domain tests and component objects
- PR template enforces test tags, data strategy, and selector quality

### Test distribution strategy

- Split by:
  - risk tier (smoke vs full)
  - feature domain
  - browser + shard
- Keep runtime targets:
  - PR smoke < 10 min
  - full regression < 45 min

---

## 11) Trade-offs & Key Decisions

### Why Playwright over Selenium/Cypress

- Better built-in auto-wait and locator model than Selenium (lower flake)
- Native multi-browser and parallelism with first-party runner
- Strong network mocking + APIRequest in same toolchain
- Cypress limitations in multi-tab, browser coverage depth, and architecture flexibility for very large enterprise suites

### POM vs Fixtures vs Hybrid

- **POM only:** good abstraction, but can become monolithic
- **Fixtures only:** great composition, but business intent can scatter
- **Hybrid (recommended):** clear boundaries + composability + maintainability

### React-specific challenges handled

- Re-renders and async state: locator-based assertions and semantic selectors
- Virtualized UI: component objects with scrolling/load strategies
- SPA routing/transitions: route-aware waits and response coupling

---

## 12) Best Practices and Anti-Patterns

### Best Practices

- Keep tests business-readable and short
- Assert outcomes, not implementation internals
- Use deterministic factories and idempotent cleanup
- Version control visual baselines intentionally

### Anti-Patterns

- Hard-coded sleeps (`waitForTimeout`)
- Cross-test state dependency
- Mega page objects with hundreds of methods
- Assertions hidden deep inside utility code

---

## 13) CLI Commands (Suggested)

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:debug": "PWDEBUG=1 playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report",
    "test:allure": "allure generate allure-results --clean && allure open"
  }
}
```

---

## 14) Onboarding Checklist

1. Install Node LTS and dependencies
2. Install Playwright browsers
3. Configure `.env.{env}`
4. Run smoke tests locally
5. Validate report generation
6. Follow selector and fixture contribution conventions

---

If you want, I can next provide a **production-ready starter repository skeleton** (actual files + minimal runnable tests + CI workflow) matching this blueprint.
