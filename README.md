# Playwright Test Automation Framework - Salesforce Products (India)

Senior-SDET-style, scalable Playwright + TypeScript framework focused on testing the Salesforce India website products journey.

- Target URL: `https://www.salesforce.com/in/`
- Target area: Products navigation and product destination pages

## Framework Highlights

- Hybrid design: fixtures + page objects + component objects
- Typed environment configuration (`BASE_URL`, timeouts)
- Smoke and regression test segregation with tags
- Multi-browser support: Chromium, Firefox, WebKit
- CI workflow for PR smoke and push regression suites

## Project Structure

```text
.
├── .github/workflows/e2e.yml
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── src
    ├── components
    │   └── header.component.ts
    ├── core
    │   ├── config/env.ts
    │   ├── fixtures/base.fixture.ts
    │   └── utils/tags.ts
    ├── pages
    │   └── products.page.ts
    └── tests
        ├── regression/products-content.spec.ts
        └── smoke/products-navigation.spec.ts
```

## Setup

### Local development

```bash
npm install
npx playwright install --with-deps
```

### CI / restricted environments

- A `package-lock.json` is committed so `npm ci` can run in deterministic environments.
- `.npmrc` pins the default registry and documents how to switch to an internal mirror when public npm access is blocked.
- If your network blocks `registry.npmjs.org`, configure your mirror before install:

```bash
npm config set registry https://<your-internal-registry>/
npm ci
```

## Run Tests

```bash
npm test
npm run test:smoke
npm run test:regression
npm run test:headed
npm run test:report
```

## Environment Variables

Create `.env` file if you want overrides:

```bash
BASE_URL=https://www.salesforce.com/in/
DEFAULT_TIMEOUT_MS=30000
EXPECT_TIMEOUT_MS=10000
```

## Test Coverage (current)

### Smoke
- Direct open of `/products/` and assert products experience loaded
- Home page → Products menu → Sales Cloud navigation

### Regression
- Verify key product links visible: Sales Cloud, Service Cloud, Marketing Cloud
- Open Service Cloud link and validate destination URL

## Notes

- Selectors intentionally prioritize role-based strategies for resilience.
- Product names and IA can evolve; tests use case-insensitive matching and first-visible strategy for stability.
