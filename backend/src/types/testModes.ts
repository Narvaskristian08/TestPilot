import { TEST_MODES } from '../config/constants';

// ═══════════════════════════════════════════════════════════
// Test Mode Type Definitions
// ═══════════════════════════════════════════════════════════

export type TestMode = (typeof TEST_MODES)[keyof typeof TEST_MODES];

// ───────────────────────────────────────────────────────────
// Functional / E2E Test Configuration
// ───────────────────────────────────────────────────────────
export interface FunctionalTestConfig {
  url: string;
  browser?: 'chromium' | 'firefox' | 'webkit';
  viewport?: {
    width: number;
    height: number;
  };
  scenario?: string;
  steps?: Array<{
    action: string;
    selector?: string;
    value?: string;
    expected?: string;
  }>;
  assertions?: Array<{
    type: string;
    target: string;
    expected: any;
  }>;
}

// ───────────────────────────────────────────────────────────
// API Test Configuration
// ───────────────────────────────────────────────────────────
export interface ApiTestConfig {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  assertions?: Array<{
    type: 'status' | 'header' | 'body' | 'response-time';
    field?: string;
    operator?: '==' | '!=' | '>' | '<' | 'contains' | 'matches';
    expected: any;
  }>;
  timeout?: number;
}

// ───────────────────────────────────────────────────────────
// Performance Test Configuration
// ───────────────────────────────────────────────────────────
export interface PerformanceTestConfig {
  target: string; // URL or API endpoint
  type: 'load' | 'stress' | 'spike';
  virtualUsers: number;
  duration: number; // seconds
  rampUpTime?: number; // seconds
  requestsPerUser?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  thresholds?: {
    maxResponseTime?: number;
    maxErrorRate?: number;
    minRPS?: number;
  };
}

// ───────────────────────────────────────────────────────────
// Visual Regression Test Configuration
// ───────────────────────────────────────────────────────────
export interface VisualRegressionConfig {
  url: string;
  browser?: 'chromium' | 'firefox' | 'webkit';
  baselineId?: number; // Reference to baseline_screenshots
  viewports?: Array<{
    width: number;
    height: number;
    name?: string;
  }>;
  fullPage?: boolean;
  ignoreRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  threshold?: number; // Similarity threshold (0-1)
}

// ───────────────────────────────────────────────────────────
// Browser Compatibility Test Configuration
// ───────────────────────────────────────────────────────────
export interface BrowserCompatibilityConfig {
  url: string;
  browsers: Array<'chromium' | 'firefox' | 'webkit'>;
  viewports?: Array<{
    width: number;
    height: number;
    name?: string;
  }>;
  tests: Array<'layout' | 'functionality' | 'console' | 'performance'>;
}

// ───────────────────────────────────────────────────────────
// Mobile Test Configuration
// ───────────────────────────────────────────────────────────
export interface MobileTestConfig {
  url: string;
  devices: Array<{
    name: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
  }>;
  tests?: Array<'responsive' | 'touch' | 'orientation' | 'performance'>;
}

// ───────────────────────────────────────────────────────────
// Regression Suite Configuration
// ───────────────────────────────────────────────────────────
export interface RegressionSuiteConfig {
  suiteId: number;
  parallel?: boolean;
  continueOnFailure?: boolean;
}

// ───────────────────────────────────────────────────────────
// Security Test Configuration
// ───────────────────────────────────────────────────────────
export interface SecurityTestConfig {
  url: string;
  tests: Array<'owasp' | 'headers' | 'ssl' | 'cookies' | 'xss' | 'sql-injection'>;
  depth?: 'quick' | 'standard' | 'deep';
}

// ───────────────────────────────────────────────────────────
// Union type for all test configs
// ───────────────────────────────────────────────────────────
export type TestConfig =
  | FunctionalTestConfig
  | ApiTestConfig
  | PerformanceTestConfig
  | VisualRegressionConfig
  | BrowserCompatibilityConfig
  | MobileTestConfig
  | RegressionSuiteConfig
  | SecurityTestConfig;

// ───────────────────────────────────────────────────────────
// Test Result Interfaces
// ───────────────────────────────────────────────────────────
export interface PerformanceMetrics {
  id?: number;
  run_id: number;
  metric_type: 'load' | 'stress' | 'spike';
  virtual_users: number;
  duration_seconds: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  requests_per_second: number;
  avg_response_time: number;
  min_response_time: number;
  max_response_time: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  error_rate: number;
  throughput: number;
  created_at?: string;
}

export interface ApiTestResult {
  id?: number;
  run_id: number;
  test_name: string;
  method: string;
  url: string;
  status_code?: number;
  response_time?: number;
  request_headers?: string; // JSON
  request_body?: string;
  response_headers?: string; // JSON
  response_body?: string;
  assertions_passed: number;
  assertions_failed: number;
  assertion_details?: string; // JSON
  error_message?: string;
  created_at?: string;
}

export interface VisualRegressionResult {
  id?: number;
  run_id: number;
  test_name: string;
  baseline_screenshot_id?: number;
  comparison_file_path: string;
  diff_file_path?: string;
  similarity_percentage?: number;
  pixel_difference?: number;
  has_differences: boolean;
  diff_regions?: string; // JSON
  created_at?: string;
}

export interface BrowserCompatibilityResult {
  id?: number;
  run_id: number;
  browser_name: string;
  viewport_width?: number;
  viewport_height?: number;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  duration_ms?: number;
  screenshot_path?: string;
  error_message?: string;
  console_errors?: string; // JSON
  created_at?: string;
}

// ───────────────────────────────────────────────────────────
// Mobile Device Presets
// ───────────────────────────────────────────────────────────
export const MOBILE_DEVICES = {
  'iPhone 12': {
    name: 'iPhone 12',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  'iPhone SE': {
    name: 'iPhone SE',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  'Samsung Galaxy S21': {
    name: 'Samsung Galaxy S21',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  'iPad Pro': {
    name: 'iPad Pro',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  'iPad Mini': {
    name: 'iPad Mini',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
} as const;
