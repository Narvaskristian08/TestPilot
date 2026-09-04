/// <reference types="vite/client" />

// TestPilot Types

export interface TestRun {
  id?: number;
  url: string;
  browser: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  user_id?: number | null;
  guest_id?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  created_at?: string;
  
  // Extended fields
  total_tests?: number;
  passed_tests?: number;
  failed_tests?: number;
  warning_tests?: number;
  test_mode?: string;
  test_config?: string;
  duration_ms?: number;
  overall_status?: 'PASSED' | 'FAILED' | 'WARNING' | null;
}

export interface TestResult {
  id?: number;
  run_id: number;
  test_name: string;
  test_type: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED';
  error_message?: string | null;
  error_category?: string | null;
  expected_behavior?: string | null;
  actual_behavior?: string | null;
  url?: string | null;
  details?: string | null; // JSON string - needs parsing
  duration_ms?: number | null;
  created_at?: string;
  artifacts?: TestArtifact[]; // Populated by API joins
}

export interface TestArtifact {
  id?: number;
  result_id: number;
  run_id: number;
  artifact_type: 'SCREENSHOT' | 'TRACE' | 'LOG' | 'VIDEO';
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at?: string;
  url?: string; // API endpoint URL to download artifact
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: number;
  supabase_user_id: string;
  email: string;
  display_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  hasExceeded: boolean;
  resetsAt?: string;
}

// Socket event types
export interface TestStatusEvent {
  runId: number;
  status: string;
  message?: string;
  progress?: number;
  testName?: string;
  testType?: string;
}

export interface TestProgressEvent {
  runId: number;
  testName: string;
  status: 'started' | 'completed' | 'failed';
  result?: TestResult;
}
