# QA Automation Framework

> Production-quality Playwright + TypeScript automated testing framework

A comprehensive, maintainable test automation framework built with Playwright and TypeScript, following the Page Object Model architecture. This framework provides end-to-end testing capabilities for web applications with support for multiple browsers, parallel execution, and CI/CD integration.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Page Object Model](#page-object-model)
- [Test Data Management](#test-data-management)
- [CI/CD Integration](#cicd-integration)
- [Reporting](#reporting)
- [Debugging](#debugging)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Page Object Model** - Maintainable and reusable page objects
- ✅ **Multi-Browser** - Chromium, Firefox, WebKit, and mobile viewports
- ✅ **Parallel Execution** - Fast test execution with configurable workers
- ✅ **Fixtures** - Reusable test contexts including authenticated sessions
- ✅ **Smart Locators** - Semantic selectors using getByRole, getByLabel, getByText
- ✅ **Auto-Waiting** - Built-in Playwright auto-waiting, no brittle timeouts
- ✅ **Rich Reporting** - HTML reports with screenshots, videos, and traces
- ✅ **CI/CD Ready** - GitHub Actions workflow with parallel sharding
- ✅ **Environment Config** - Secure credential management with dotenv
- ✅ **90 Test Cases** - Comprehensive test coverage across authentication, navigation, forms, CRUD, and regression

## 📦 Requirements

- **Node.js** 18+ (recommended: Node.js 20)
- **npm** 9+ or **yarn** 1.22+
- **Git** (for version control)

## 🚀 Installation

### 1. Clone or Initialize the Repository

```bash
# If this is a new repository
git clone <your-repository-url>
cd Testpilot

# Or if starting fresh
npm init -y
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install --with-deps
```

This will download Chromium, Firefox, and WebKit browsers along with their system dependencies.

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your configuration
nano .env  # or use your preferred editor
```

**Important:** Update the following variables in `.env`:

```env
BASE_URL=https://your-application-url.com
TEST_USERNAME=your-test-user@example.com
TEST_EMAIL=your-test-user@example.com
TEST_PASSWORD=YourSecurePassword123!
```

## ⚙️ Configuration

### Environment Variables

The framework uses environment variables for configuration. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application URL | `http://localhost:3000` |
| `TEST_USERNAME` | Test user email/username | `test@example.com` |
| `TEST_EMAIL` | Test user email | `test@example.com` |
| `TEST_PASSWORD` | Test user password | `TestPassword123!` |

See `.env.example` for all available configuration options.

### Playwright Configuration

The main configuration is in `playwright.config.ts`. Key settings:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, Tablet
- **Parallel Execution**: Enabled by default
- **Retries**: 0 locally, 2 in CI
- **Screenshots**: On failure
- **Videos**: On failure/retry
- **Traces**: On first retry
- **Timeouts**: 30s test timeout, 10s action timeout

## 📁 Project Structure

```
qa-automation/
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI/CD workflow
├── fixtures/
│   └── testFixtures.ts             # Custom test fixtures
├── pages/
│   ├── BasePage.ts                 # Base page class
│   ├── LoginPage.ts                # Login page object
│   └── DashboardPage.ts            # Dashboard page object
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts           # Login tests (TC-001 to TC-011)
│   │   ├── logout.spec.ts          # Logout tests (TC-012 to TC-015)
│   │   └── protected-routes.spec.ts # Route protection (TC-016 to TC-023)
│   ├── navigation/
│   │   └── navigation.spec.ts      # Navigation tests (TC-024 to TC-040)
│   ├── forms/
│   │   └── form-validation.spec.ts # Form tests (TC-041 to TC-060)
│   ├── crud/
│   │   └── crud-operations.spec.ts # CRUD tests (TC-061 to TC-075)
│   └── regression/
│       └── critical-paths.spec.ts  # Regression tests (TC-076 to TC-090)
├── utils/
│   ├── helpers.ts                  # Utility functions
│   └── testData.ts                 # Test data and generators
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode

```bash
npm run test:headed
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Tests in UI Mode

```bash
npm run test:ui
```

### Run Specific Browser

```bash
# Chromium only
npm run test:chromium

# Firefox only
npm run test:firefox

# WebKit only
npm run test:webkit
```

### Run Specific Test Suite

```bash
# Authentication tests
npm run test:auth

# Navigation tests
npm run test:navigation

# Form validation tests
npm run test:forms

# CRUD tests
npm run test:crud

# Regression tests
npm run test:regression
```

### Run Single Test File

```bash
npx playwright test tests/auth/login.spec.ts
```

### Run Single Test by Name

```bash
npx playwright test -g "TC-001"
```

### Run Tests with Specific Tag

```bash
npx playwright test --grep @smoke
```

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../../fixtures/testFixtures';

test.describe('Feature Name', () => {
  test('TC-XXX: Test description', async ({ page, loginPage }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.login('user@example.com', 'password');

    // Assert
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### Using Fixtures

The framework provides custom fixtures:

```typescript
test('Test with authenticated user', async ({ authenticatedPage, dashboardPage }) => {
  // User is already logged in
  await dashboardPage.goto();
  expect(await dashboardPage.isLoggedIn()).toBeTruthy();
});
```

### Using Test Data

```typescript
import { testData, TestDataGenerator } from '../../utils/testData';

test('Test with data', async ({ loginPage }) => {
  // Use predefined test data
  await loginPage.login(testData.validUser.email, testData.validUser.password);

  // Generate random data
  const email = TestDataGenerator.randomEmail();
  const uniqueId = TestDataGenerator.uniqueId();
});
```

## 📄 Page Object Model

### Creating a New Page Object

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  readonly myButton: Locator;
  readonly myInput: Locator;

  constructor(page: Page) {
    super(page);
    
    // Use semantic locators
    this.myButton = page.getByRole('button', { name: /submit/i });
    this.myInput = page.getByLabel(/email/i);
  }

  async goto(): Promise<void> {
    await this.page.goto('/my-page');
  }

  async performAction(): Promise<void> {
    await this.myInput.fill('value');
    await this.myButton.click();
  }
}
```

### Locator Best Practices

**Preferred (in order):**
1. `getByRole()` - Most resilient to changes
2. `getByLabel()` - Great for form fields
3. `getByText()` - Good for unique text content
4. `getByPlaceholder()` - For inputs with placeholders
5. `locator()` - Only when above don't work

**Avoid:**
- CSS selectors like `.class` or `#id`
- XPath expressions
- Positional selectors that break easily

## 📊 Test Data Management

### Predefined Data

```typescript
import { testData } from '../../utils/testData';

// Valid user credentials
testData.validUser.email
testData.validUser.password

// Invalid credentials for negative tests
testData.invalidUser.email
testData.invalidUser.password

// Form validation data
testData.forms.validEmail
testData.forms.invalidEmails
testData.forms.strongPassword

// Error message patterns
testData.errorMessages.invalidCredentials
testData.errorMessages.requiredField
```

### Generated Data

```typescript
import { TestDataGenerator } from '../../utils/testData';

// Generate unique data
const email = TestDataGenerator.randomEmail();
const username = TestDataGenerator.randomUsername();
const phoneNumber = TestDataGenerator.randomPhoneNumber();
const uniqueId = TestDataGenerator.uniqueId();

// Generate test items
const item = TestDataGenerator.generateTestItem('Prefix');
```

## 🔄 CI/CD Integration

### GitHub Actions

The framework includes a GitHub Actions workflow (`.github/workflows/playwright.yml`) that:

1. ✅ Runs on push, pull request, and schedule
2. ✅ Executes tests in parallel across 4 shards
3. ✅ Uploads test reports and artifacts
4. ✅ Comments on PRs with test results
5. ✅ Sends notifications on failure

### Setting Up Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `BASE_URL` - Your application URL
   - `TEST_USERNAME` - Test user email
   - `TEST_EMAIL` - Test user email (same as username)
   - `TEST_PASSWORD` - Test user password

### Manual Workflow Trigger

You can manually trigger the workflow from the **Actions** tab in GitHub.

## 📈 Reporting

### View HTML Report

```bash
npm run test:report
```

This opens the Playwright HTML report in your browser showing:
- Test results (passed/failed/skipped)
- Test duration
- Screenshots on failure
- Video recordings
- Trace files for debugging

### Report Locations

- **HTML Report**: `playwright-report/index.html`
- **Test Results**: `test-results/`
- **Screenshots**: `screenshots/`
- **JSON Results**: `test-results/results.json`

## 🐛 Debugging

### Debug Mode

```bash
npm run test:debug
```

Opens Playwright Inspector for step-by-step debugging.

### UI Mode (Interactive)

```bash
npm run test:ui
```

Opens Playwright UI for interactive test development.

### View Traces

When tests fail, trace files are automatically captured. View them:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

### VS Code Debugging

Add this configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Playwright Tests",
  "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
  "args": ["test", "--debug"],
  "console": "integratedTerminal"
}
```

### Console Logging

```typescript
test('My test', async ({ page }) => {
  // Log to console
  console.log('Current URL:', page.url());
  
  // Capture browser console
  page.on('console', msg => console.log('Browser:', msg.text()));
});
```

## 📚 Best Practices

### ✅ Do

- Use semantic locators (getByRole, getByLabel, getByText)
- Keep tests independent and isolated
- Use Page Object Model for maintainability
- Leverage Playwright's auto-waiting
- Use fixtures for common setup
- Write descriptive test names with test case IDs
- Keep test data separate from test logic
- Use environment variables for credentials

### ❌ Don't

- Use `waitForTimeout()` (rely on auto-waiting instead)
- Hard-code passwords or secrets in tests
- Use brittle CSS/XPath selectors
- Make tests dependent on execution order
- Share state between tests
- Leave debug statements in committed code

## 🔧 Troubleshooting

### Tests Fail with "Target application not available"

**Solution:** Update `BASE_URL` in `.env` to point to your actual application.

### Tests Fail with "Authentication credentials not found"

**Solution:** Set `TEST_USERNAME` and `TEST_PASSWORD` in `.env` file.

### Browsers Not Installed

**Solution:** Run `npx playwright install --with-deps`

### Tests Are Flaky

**Causes:**
- Network issues (use `page.waitForLoadState('networkidle')`)
- Race conditions (use proper locator strategies)
- Timing issues (leverage auto-waiting, avoid arbitrary waits)

**Solution:** Check test logs and traces to identify the root cause.

### TypeScript Compilation Errors

**Solution:** Run `npm install` to ensure all dependencies are installed, then `npx tsc --noEmit` to check for errors.

### Tests Time Out

**Solutions:**
- Increase timeout in `playwright.config.ts`
- Check if application is running and accessible
- Verify network connectivity
- Check for blocking modals or overlays

### CI Tests Fail But Local Tests Pass

**Causes:**
- Different environment variables
- Missing secrets in GitHub
- Different browser versions
- Race conditions exposed by CI environment

**Solution:** Check CI logs and ensure environment variables are set correctly in GitHub Secrets.

## 🎯 Test Coverage

The framework includes **90 comprehensive test cases**:

- **Authentication** (23 tests): Login, logout, session management
- **Navigation** (17 tests): Links, routing, browser controls
- **Forms** (20 tests): Validation, input handling, security
- **CRUD** (15 tests): Create, read, update, delete operations
- **Regression** (15 tests): Critical user flows, smoke tests

## 🔐 Security

- **Never commit `.env`** - Contains sensitive credentials
- **Use environment variables** - For all secrets and credentials
- **Rotate test credentials** - Regularly update test user passwords
- **Separate test environment** - Use dedicated test accounts
- **Review test data** - Ensure no production data in tests

## 📝 Adapting to Your Application

This framework is designed to be adaptable. To customize for your application:

1. **Update Page Objects**: Modify selectors in `pages/` to match your application
2. **Update URLs**: Change route paths in test files to match your routes
3. **Update Test Data**: Modify `utils/testData.ts` with application-specific data
4. **Add New Tests**: Create new test files following the existing structure
5. **Configure Environment**: Update `.env` with your application settings

## 🤝 Contributing

When adding new tests or features:

1. Follow the existing project structure
2. Use TypeScript types and interfaces
3. Add JSDoc comments for complex functions
4. Update this README with new features
5. Ensure tests pass locally before committing

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Playwright Documentation](https://playwright.dev)
3. Check test traces and screenshots for failure details
4. Review CI/CD logs in GitHub Actions



# TestPilot
