# 🎭 TestPilot

> **Automated QA Testing Platform for Websites**

TestPilot is a web-based automated QA testing platform that allows users to test their deployed websites by simply entering a URL. The platform runs comprehensive Playwright tests on the backend and displays results in a modern, real-time dashboard.

**✨ No local Playwright installation required for users - everything runs on the TestPilot server!**

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running TestPilot](#running-testpilot)
- [Using TestPilot](#using-testpilot)
- [What Gets Tested](#what-gets-tested)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### For Users
- 🌐 **Simple URL Input** - Just enter your website URL and click "Start Testing"
- ⚡ **Real-Time Results** - Live progress updates via WebSocket
- 📊 **Beautiful Dashboard** - Modern, intuitive UI built with React + TailwindCSS
- 📱 **Responsive Testing** - Automatic testing across Desktop, Tablet, and Mobile viewports
- 🔍 **9 Automated Tests** - Availability, links, forms, buttons, responsive design, console errors, network errors, accessibility, and screenshots
- 📸 **Screenshot Capture** - Visual evidence of page state
- 📜 **Test History** - View and manage past test runs

### For Developers
- 🔒 **SSRF Protection** - Built-in security to prevent testing private networks
- 🚦 **Rate Limiting** - Protect against abuse
- 💾 **SQLite Database** - Simple, file-based storage for test runs and results
- 🔌 **WebSocket Updates** - Real-time test status via Socket.IO
- 🎯 **RESTful API** - Clean API for test management
- 🐳 **Easy Deployment** - Single backend + frontend deployment
- 🧪 **Playwright Engine** - Industry-standard browser automation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│              (React + TailwindCSS)                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP + WebSocket
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Express Backend API                        │
│         (REST + Socket.IO + SQLite)                     │
│  • URL Validation & SSRF Protection                     │
│  • Job Queue Management                                 │
│  • Test Orchestration                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Playwright Worker                             │
│     (Browser Automation Engine)                         │
│  • Website Availability Testing                         │
│  • Link Testing (Broken Links)                          │
│  • Form & Button Discovery                              │
│  • Responsive Layout Testing                            │
│  • Console & Network Error Detection                    │
│  • Accessibility Testing (axe-core)                     │
│  • Screenshot Capture                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
              Target Website
```

## 📦 Requirements

- **Node.js** 18+ (recommended: Node.js 20)
- **npm** 9+
- **Playwright Browsers** (automatically installed)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Testpilot
```

### 2. Install All Dependencies

This will install dependencies for the root, backend, and frontend:

```bash
npm run install:all
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 4. Configure Backend Environment (Optional)

The backend will work with default settings. To customize:

```bash
cd backend
cp .env.example .env
# Edit .env if needed
```

Default configuration:
- Backend Port: `3001`
- Frontend Port: `5173`
- Database: SQLite (auto-created in `backend/storage/`)
- Max concurrent tests: `3`

## 🎮 Running TestPilot

### Quick Start (Run Everything)

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 5173) concurrently.

### Run Backend Only

```bash
npm run dev:backend
# or
cd backend && npm run dev
```

Backend will be available at `http://localhost:3001`

### Run Frontend Only

```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

Frontend will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm start
```

## 🧪 Using TestPilot

### 1. Open the Dashboard

Navigate to `http://localhost:5173` in your browser.

### 2. Enter a Website URL

Enter the URL of the website you want to test (must be publicly accessible):

```
https://example.com
```

### 3. Start Testing

Click "Start Testing" and watch the progress in real-time!

### 4. View Results

- See live test execution status
- View passed/failed/warning tests
- Click on individual tests for detailed information
- View screenshots captured during testing

### 5. Manage Tests

- **Cancel** running tests
- **Delete** completed tests
- **View history** of past test runs

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


## 🧪 What Gets Tested

TestPilot automatically performs the following tests on your website:

### 1. **Website Availability** ✅
- Checks if the URL is reachable
- Verifies HTTP response status
- Ensures page loads successfully
- Detects immediate crashes

### 2. **Page Load Testing** 📄
- Validates page title exists
- Checks for visible content
- Measures load time
- Detects navigation failures

### 3. **Link Testing** 🔗
- Discovers all links on the page
- Tests links for broken destinations
- Reports working vs. broken links
- Filters to same-domain only (configurable)

### 4. **Button Testing** 🔘
- Discovers visible buttons
- Tests safe button actions only
- **Avoids destructive actions**: Delete, Logout, Purchase, Payment, Cancel
- Reports button availability and accessibility

### 5. **Form Testing** 📝
- Discovers forms and input fields
- Tests basic validation behavior
- Checks required field validation
- **Safe testing only** - no actual form submissions

### 6. **Responsive Design Testing** 📱
- Tests at multiple viewport sizes:
  - Desktop (1280x720)
  - Tablet (768x1024)
  - Mobile (375x667)
- Detects horizontal scroll/overflow issues
- Reports layout problems

### 7. **Console Error Detection** 🐛
- Captures browser console errors
- Detects uncaught JavaScript exceptions
- Reports error count and details

### 8. **Network Error Detection** 🌐
- Monitors failed HTTP requests
- Detects 4xx and 5xx errors
- Reports broken resource loading

### 9. **Accessibility Testing** ♿
- Runs axe-core accessibility audit
- Detects common WCAG violations
- Reports accessibility score

### 10. **Screenshot Evidence** 📸
- Captures full-page screenshots
- Provides visual evidence of test state
- Stored as artifacts for review

---

## 📁 Project Structure

```
testpilot/
├── backend/                      # Express API + Playwright Worker
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.ts      # Configuration constants
│   │   │   └── database.ts       # SQLite initialization
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts   # Error handling
│   │   │   ├── rateLimiter.ts    # Rate limiting
│   │   │   └── validation.ts     # URL validation & SSRF protection
│   │   ├── models/
│   │   │   ├── TestRun.ts        # Test run model
│   │   │   ├── TestResult.ts     # Test result model
│   │   │   └── TestArtifact.ts   # Screenshot/trace model
│   │   ├── routes/
│   │   │   └── tests.ts          # API routes
│   │   ├── services/
│   │   │   ├── jobQueue.ts       # Job queue management
│   │   │   └── testRunner.ts     # Test orchestration
│   │   ├── workers/
│   │   │   ├── playwrightWorker.ts  # Main test executor
│   │   │   ├── tests/
│   │   │   │   ├── availabilityTest.ts
│   │   │   │   ├── linkTest.ts
│   │   │   │   ├── buttonTest.ts
│   │   │   │   ├── formTest.ts
│   │   │   │   ├── responsiveTest.ts
│   │   │   │   ├── consoleTest.ts
│   │   │   │   └── accessibilityTest.ts
│   │   │   └── utils/
│   │   │       ├── discovery.ts   # Element discovery
│   │   │       └── safety.ts      # Safety checks
│   │   └── server.ts              # Express server
│   ├── storage/                   # SQLite DB & artifacts
│   └── package.json
│
├── frontend/                      # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── StatusBadge.tsx    # Status indicators
│   │   │   ├── TestCard.tsx       # Test result card
│   │   │   ├── TestDetailModal.tsx # Detailed test view
│   │   │   ├── TestProgress.tsx   # Live progress
│   │   │   ├── TestResultsPanel.tsx # Results display
│   │   │   └── UrlInput.tsx       # URL input form
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Main dashboard
│   │   │   └── TestRunPage.tsx    # Test detail page
│   │   ├── services/
│   │   │   ├── api.ts             # REST API client
│   │   │   └── socket.ts          # WebSocket client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.ts             # Vite configuration
│   ├── tailwind.config.js         # TailwindCSS config
│   └── package.json
│
├── ARCHITECTURE.md                # Detailed architecture docs
├── IMPLEMENTATION_STATUS.md       # Implementation status
├── package.json                   # Root package.json
└── README.md                      # This file
```

---

## 🔌 API Documentation

### REST API Endpoints

**Base URL**: `http://localhost:3001/api`

#### `POST /tests`
Create a new test run.

**Request Body**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "testRun": {
      "id": 1,
      "url": "https://example.com",
      "status": "QUEUED",
      "created_at": "2026-08-16T10:30:00.000Z"
    }
  }
}
```

#### `GET /tests/:id`
Get test run status and summary.

**Response**:
```json
{
  "status": "success",
  "data": {
    "testRun": {
      "id": 1,
      "url": "https://example.com",
      "status": "COMPLETED",
      "total_tests": 9,
      "passed_tests": 7,
      "failed_tests": 1,
      "warning_tests": 1,
      "duration_ms": 12500
    }
  }
}
```

#### `GET /tests/:id/results`
Get detailed test results.

#### `GET /tests/:id/artifacts`
Get screenshots and traces.

#### `POST /tests/:id/cancel`
Cancel a running test.

#### `DELETE /tests/:id`
Delete a test run.

#### `GET /tests`
List recent test runs (limit: 50).

### WebSocket Events

**Connect to**: `http://localhost:3001`

**Subscribe to test updates**:
```javascript
socket.emit('subscribe', testRunId);
```

**Receive updates**:
```javascript
socket.on('test-status', (data) => {
  // data: { runId, status, message }
});
```

---

## 🔒 Security Features

### SSRF Protection

TestPilot blocks testing of:
- ✋ **Private IP ranges**: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
- ✋ **Localhost**: 127.0.0.1, ::1, localhost
- ✋ **Link-local addresses**: 169.254.0.0/16
- ✋ **Cloud metadata endpoints**: 169.254.169.254, metadata.google.internal
- ✋ **Restricted ports**: 22 (SSH), 3306 (MySQL), 5432 (PostgreSQL), etc.

### Rate Limiting

- **Standard**: 100 requests per 15 minutes
- **Test creation**: 10 tests per minute
- **Concurrent tests**: Maximum 3 simultaneous tests

### Safe Testing

- **No destructive actions**: Avoids clicking Delete, Logout, Purchase, Payment buttons
- **No form submissions**: Only tests validation, doesn't submit data
- **Domain-restricted crawling**: Only follows same-domain links by default
- **Timeout limits**: Tests auto-cancel after 5 minutes

---

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev
```

The backend uses `tsx watch` for hot-reloading during development.

### Frontend Development

```bash
cd frontend
npm run dev
```

Vite provides instant hot-module replacement (HMR).

### Database Management

The SQLite database is automatically created at `backend/storage/database.sqlite`.

**Reinitialize database**:
```bash
rm backend/storage/database.sqlite
# Database will be recreated on next server start
```

### Adding New Tests

1. Create a new test file in `backend/src/workers/tests/`
2. Export a test function that returns `TestResultData`
3. Import and call it in `playwrightWorker.ts`

Example:
```typescript
// backend/src/workers/tests/myTest.ts
export async function runMyTest(page: Page): Promise<TestResultData> {
  const startTime = Date.now();
  try {
    // Your test logic
    return {
      status: TEST_RESULT_STATUS.PASSED,
      details: { /* test details */ },
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: TEST_RESULT_STATUS.FAILED,
      error_message: error.message,
      details: {},
      duration_ms: Date.now() - startTime,
    };
  }
}
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `Port 3001 already in use`

**Solution**:
```bash
# Find and kill the process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Frontend can't connect to backend

**Error**: `Failed to fetch` or `Network error`

**Check**:
1. Backend is running on port 3001
2. Check browser console for CORS errors
3. Verify `vite.config.ts` proxy configuration

### Playwright browser not found

**Error**: `Executable doesn't exist at ...`

**Solution**:
```bash
npx playwright install chromium
```

### Tests timeout

**Cause**: Website is slow or unresponsive

**Solution**: Tests have a 5-minute timeout by default. Very slow websites may need longer timeouts (configurable in `backend/src/config/constants.ts`).

### Database locked error

**Cause**: Multiple backend instances accessing same database

**Solution**: Ensure only one backend instance is running.

### WebSocket connection failed

**Check**:
1. Backend is running
2. No firewall blocking WebSocket connections
3. Browser console for connection errors

---

## 📝 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./storage/database.sqlite
ARTIFACTS_PATH=./storage/artifacts

# Test Limits
MAX_CONCURRENT_TESTS=3
MAX_TEST_DURATION_MS=300000
MAX_PAGES_TO_CRAWL=50

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🚢 Deployment

### Option 1: Single Server Deployment

```bash
# Build everything
npm run build

# Start in production mode
npm start
```

### Option 2: Docker (Coming Soon)

```bash
docker-compose up
```

### Requirements for Production

- Node.js 18+ installed
- Chromium browser dependencies
- 2GB RAM minimum (4GB recommended)
- 10GB disk space for database and screenshots

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC License

---

## 🙏 Acknowledgments

- **Playwright** - Browser automation framework
- **React** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **Express** - Backend framework
- **Socket.IO** - Real-time communication
- **better-sqlite3** - SQLite database driver
- **axe-core** - Accessibility testing engine

---

## 📞 Support

For issues, questions, or feature requests:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
3. Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for current status
4. Open an issue on GitHub

---

**Built with ❤️ by the TestPilot Team**

**🎭 TestPilot** • Automated QA Testing Made Simple
