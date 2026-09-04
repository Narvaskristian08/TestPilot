import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001'),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // SQLite is the zero-config local development database. Hosted deployments
  // use Supabase when all backend Supabase credentials are present.
  DATABASE_PATH: process.env.DATABASE_PATH || path.join(__dirname, '../../storage/database.local.sqlite'),
  ARTIFACTS_PATH: process.env.ARTIFACTS_PATH || path.join(__dirname, '../../storage/artifacts'),
  SUPABASE_ARTIFACT_BUCKET: process.env.SUPABASE_ARTIFACT_BUCKET || 'test-artifacts',
  SUPABASE_ARTIFACT_SIGNED_URL_TTL_SECONDS: parseInt(process.env.SUPABASE_ARTIFACT_SIGNED_URL_TTL_SECONDS || '3600'),

  MAX_CONCURRENT_TESTS: parseInt(process.env.QA_MAX_CONCURRENT_TESTS || '1'),
  MAX_TEST_DURATION_MS: parseInt(process.env.MAX_TEST_DURATION_MS || '300000'), // 5 minutes
  MAX_PAGES_TO_CRAWL: parseInt(process.env.MAX_PAGES_TO_CRAWL || '50'),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  ENABLE_WEBSOCKET: process.env.ENABLE_WEBSOCKET !== 'false',
  // QA-run caps are opt-in. API rate limiting and target URL protections
  // remain enabled regardless of this setting.
  ENABLE_USAGE_LIMITS: process.env.ENABLE_USAGE_LIMITS === 'true',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'QA Auto <noreply@qa-auto.dev>',

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',

  // Optional usage limits (only enforced when ENABLE_USAGE_LIMITS=true)
  GUEST_QA_LIMIT: parseInt(process.env.GUEST_QA_LIMIT || '3'),
  DAILY_QA_LIMIT: parseInt(process.env.DAILY_QA_LIMIT || '20'),
};

export const TEST_STATUS = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const TEST_RESULT_STATUS = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  WARNING: 'WARNING',
  SKIPPED: 'SKIPPED',
} as const;

// Test modes (user-selectable)
export const TEST_MODES = {
  FUNCTIONAL: 'functional',
  E2E: 'e2e',
  API: 'api',
  REGRESSION: 'regression',
  PERFORMANCE_LOAD: 'performance_load',
  PERFORMANCE_STRESS: 'performance_stress',
  PERFORMANCE_SPIKE: 'performance_spike',
  VISUAL_REGRESSION: 'visual_regression',
  ACCESSIBILITY: 'accessibility',
  BROWSER_COMPATIBILITY: 'browser_compatibility',
  MOBILE: 'mobile',
  SECURITY: 'security',
} as const;

// Individual test types within a run
export const TEST_TYPES = {
  AVAILABILITY: 'AVAILABILITY',
  PAGE_LOAD: 'PAGE_LOAD',
  LINK_TEST: 'LINK_TEST',
  BUTTON_TEST: 'BUTTON_TEST',
  FORM_TEST: 'FORM_TEST',
  RESPONSIVE: 'RESPONSIVE',
  CONSOLE_ERRORS: 'CONSOLE_ERRORS',
  NETWORK_ERRORS: 'NETWORK_ERRORS',
  ACCESSIBILITY: 'ACCESSIBILITY',
  SECURITY: 'SECURITY',
} as const;

export const ARTIFACT_TYPES = {
  SCREENSHOT: 'SCREENSHOT',
  TRACE: 'TRACE',
  LOG: 'LOG',
} as const;

export const ERROR_CATEGORY = {
  PAGE_LOAD: 'PAGE_LOAD',
  BROKEN_LINK: 'BROKEN_LINK',
  FORM_VALIDATION: 'FORM_VALIDATION',
  BUTTON: 'BUTTON',
  RESPONSIVE: 'RESPONSIVE',
  CONSOLE_ERROR: 'CONSOLE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  ACCESSIBILITY: 'ACCESSIBILITY',
  SECURITY: 'SECURITY',
  TIMEOUT: 'TIMEOUT',
  NAVIGATION: 'NAVIGATION',
  UNKNOWN: 'UNKNOWN',
} as const;

// Private IP ranges for SSRF protection
export const PRIVATE_IP_RANGES = [
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '::1/128',
  'fc00::/7',
  'fe80::/10',
];

// Cloud metadata endpoints to block
export const BLOCKED_HOSTS = [
  'metadata.google.internal',
  '169.254.169.254', // AWS, Azure, GCP
  '100.100.100.200', // Alibaba Cloud
];

// Destructive action keywords
export const DESTRUCTIVE_KEYWORDS = [
  'delete',
  'remove',
  'logout',
  'log out',
  'sign out',
  'signout',
  'purchase',
  'buy',
  'pay',
  'payment',
  'checkout',
  'cancel',
  'unsubscribe',
  'deactivate',
];
