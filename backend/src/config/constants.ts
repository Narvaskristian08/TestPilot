import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  DATABASE_PATH: process.env.DATABASE_PATH || path.join(__dirname, '../../storage/database.sqlite'),
  ARTIFACTS_PATH: process.env.ARTIFACTS_PATH || path.join(__dirname, '../../storage/artifacts'),
  
  MAX_CONCURRENT_TESTS: parseInt(process.env.MAX_CONCURRENT_TESTS || '10'),
  MAX_TEST_DURATION_MS: parseInt(process.env.MAX_TEST_DURATION_MS || '300000'), // 5 minutes
  MAX_PAGES_TO_CRAWL: parseInt(process.env.MAX_PAGES_TO_CRAWL || '50'),
  
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  ENABLE_WEBSOCKET: process.env.ENABLE_WEBSOCKET === 'true' || true,
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
} as const;

export const ARTIFACT_TYPES = {
  SCREENSHOT: 'SCREENSHOT',
  TRACE: 'TRACE',
  LOG: 'LOG',
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
