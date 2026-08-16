# TestPilot Architecture

## Overview

TestPilot is a web-based automated QA testing platform that allows users to test their deployed websites by simply entering a URL. The platform runs Playwright tests on the backend and displays results in a modern dashboard.

## System Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│  Express API    │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Database│ │ Job Queue    │
│(SQLite)│ │ (In-Memory)  │
└────────┘ └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐
           │  Playwright  │
           │   Worker     │
           └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐
           │ Target Site  │
           │  (Testing)   │
           └──────────────┘
```

## Components

### 1. Frontend (React + TypeScript)

**Location**: `frontend/`

**Responsibilities**:
- URL input and validation
- Test configuration
- Start/cancel tests
- Real-time progress updates
- Display test results
- View test details
- Screenshot/artifact viewer

**Tech Stack**:
- React 18
- TypeScript
- TailwindCSS
- React Router
- Socket.io-client (for real-time updates)

### 2. Backend API (Express + TypeScript)

**Location**: `backend/`

**Responsibilities**:
- REST API endpoints
- URL validation and SSRF protection
- Test job management
- Database operations
- File storage management
- WebSocket connections

**Tech Stack**:
- Express.js
- TypeScript
- SQLite (better-sqlite3)
- Socket.io
- Express-validator

**API Endpoints**:

```
POST   /api/tests              - Create test run
GET    /api/tests/:id          - Get test run status
GET    /api/tests/:id/results  - Get test results
GET    /api/tests/:id/artifacts - Get screenshots/traces
POST   /api/tests/:id/cancel   - Cancel test run
GET    /api/tests              - List all test runs
DELETE /api/tests/:id          - Delete test run
```

### 3. Playwright Worker Service

**Location**: `backend/workers/`

**Responsibilities**:
- Execute Playwright tests
- Website discovery
- Link testing
- Button testing
- Form testing
- Responsive testing
- Console/network monitoring
- Screenshot capture
- Accessibility checks

**Test Types**:
1. Website Availability
2. Page Load
3. Link Testing
4. Button Testing (safe actions only)
5. Form Validation Testing
6. Responsive Testing (desktop/tablet/mobile)
7. Console Error Detection
8. Network Error Detection
9. Accessibility Checks (axe-core)
10. Screenshot Evidence

### 4. Database Schema

**Technology**: SQLite with better-sqlite3

**Tables**:

```sql
-- Users (future authentication)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Test Projects
CREATE TABLE test_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  base_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Test Runs
CREATE TABLE test_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  url TEXT NOT NULL,
  status TEXT NOT NULL, -- QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
  started_at DATETIME,
  completed_at DATETIME,
  duration_ms INTEGER,
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  warning_tests INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES test_projects(id)
);

-- Test Results
CREATE TABLE test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status TEXT NOT NULL, -- PASSED, FAILED, WARNING, SKIPPED
  error_message TEXT,
  details TEXT, -- JSON string
  duration_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES test_runs(id)
);

-- Test Artifacts
CREATE TABLE test_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id INTEGER NOT NULL,
  artifact_type TEXT NOT NULL, -- SCREENSHOT, TRACE, LOG
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (result_id) REFERENCES test_results(id)
);
```

### 5. Security Features

**SSRF Protection**:
```typescript
// Block private IP ranges
- 127.0.0.0/8 (localhost)
- 10.0.0.0/8 (private)
- 172.16.0.0/12 (private)
- 192.168.0.0/16 (private)
- 169.254.0.0/16 (link-local)
- Cloud metadata endpoints
```

**Rate Limiting**:
- Max 10 concurrent tests per user
- Max 100 tests per day per IP
- Max test duration: 5 minutes
- Max pages to crawl: 50

**Input Validation**:
- URL format validation
- Domain whitelist/blacklist
- Protocol validation (http/https only)

## Data Flow

### Test Execution Flow

```
1. User submits URL
   ↓
2. Frontend validates URL format
   ↓
3. POST /api/tests
   ↓
4. Backend validates URL (SSRF check)
   ↓
5. Create test_run record (status: QUEUED)
   ↓
6. Add to job queue
   ↓
7. Worker picks up job
   ↓
8. Update status to RUNNING
   ↓
9. Execute Playwright tests
   ↓
10. Save test_results
    ↓
11. Save test_artifacts (screenshots)
    ↓
12. Update test_run (status: COMPLETED)
    ↓
13. Emit WebSocket event
    ↓
14. Frontend updates UI
```

## File Structure

```
testpilot/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express server entry
│   │   ├── config/
│   │   │   ├── database.ts        # Database connection
│   │   │   └── constants.ts       # Configuration constants
│   │   ├── models/
│   │   │   ├── TestRun.ts         # TestRun model
│   │   │   ├── TestResult.ts      # TestResult model
│   │   │   └── TestArtifact.ts    # TestArtifact model
│   │   ├── routes/
│   │   │   └── tests.ts           # Test API routes
│   │   ├── middleware/
│   │   │   ├── validation.ts      # URL validation
│   │   │   ├── ssrf.ts            # SSRF protection
│   │   │   └── rateLimiter.ts     # Rate limiting
│   │   ├── services/
│   │   │   ├── testRunner.ts      # Test orchestration
│   │   │   └── jobQueue.ts        # Job queue manager
│   │   └── workers/
│   │       ├── playwrightWorker.ts    # Playwright executor
│   │       ├── tests/
│   │       │   ├── availabilityTest.ts
│   │       │   ├── linkTest.ts
│   │       │   ├── buttonTest.ts
│   │       │   ├── formTest.ts
│   │       │   ├── responsiveTest.ts
│   │       │   ├── consoleTest.ts
│   │       │   └── accessibilityTest.ts
│   │       └── utils/
│   │           ├── discovery.ts    # Element discovery
│   │           └── safety.ts       # Safety checks
│   ├── storage/
│   │   ├── database.sqlite         # SQLite database
│   │   └── artifacts/              # Screenshots, traces
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Main dashboard
│   │   │   ├── TestDetails.tsx     # Test detail view
│   │   │   └── TestHistory.tsx     # Test history
│   │   ├── components/
│   │   │   ├── UrlInput.tsx        # URL input form
│   │   │   ├── TestProgress.tsx    # Progress indicator
│   │   │   ├── TestResults.tsx     # Results summary
│   │   │   ├── TestCard.tsx        # Individual test card
│   │   │   └── Screenshot.tsx      # Screenshot viewer
│   │   ├── services/
│   │   │   └── api.ts              # API client
│   │   └── types/
│   │       └── index.ts            # TypeScript types
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── utils/                           # Shared utilities (reused)
├── playwright.config.ts             # Playwright config (reused)
├── package.json                     # Root package.json
└── README.md
```

## Reusable Components

From the existing framework, we'll reuse:

1. **Playwright Configuration** - `playwright.config.ts`
2. **Base Utilities** - `utils/helpers.ts` (HTTP helpers, wait functions)
3. **Test Data Utilities** - `utils/testData.ts` (data generators)
4. **BasePage** - `pages/BasePage.ts` (navigation, interaction helpers)

## Technology Decisions

### Why SQLite?
- Simple setup (no separate database server)
- File-based (easy backup/restore)
- Perfect for MVP
- Can migrate to PostgreSQL later

### Why In-Memory Job Queue?
- Simple for MVP
- Can migrate to Redis/Bull later
- Sufficient for single-server deployment

### Why WebSocket?
- Real-time progress updates
- Better UX than polling
- Efficient for status updates

### Why React?
- Component-based architecture
- Strong TypeScript support
- Large ecosystem
- Modern developer experience

## Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Serve frontend from backend
cd backend && npm start
```

## Environment Variables

```env
# Backend
PORT=3001
NODE_ENV=development
DATABASE_PATH=./storage/database.sqlite
ARTIFACTS_PATH=./storage/artifacts
MAX_CONCURRENT_TESTS=10
MAX_TEST_DURATION_MS=300000
MAX_PAGES_TO_CRAWL=50

# Frontend (for production build)
REACT_APP_API_URL=http://localhost:3001
```

## Security Considerations

1. **URL Validation**: Strict validation to prevent SSRF
2. **Rate Limiting**: Prevent abuse
3. **Timeouts**: Prevent long-running tests
4. **Domain Restrictions**: Only crawl target domain
5. **Safe Actions**: Avoid destructive button clicks
6. **Input Sanitization**: Prevent injection attacks
7. **File Storage**: Secure artifact storage with access control

## Future Enhancements

1. User authentication
2. Project management
3. Scheduled tests
4. Test history and trends
5. Email notifications
6. Custom test configuration
7. API webhooks
8. Team collaboration
9. Advanced accessibility testing
10. Performance metrics
