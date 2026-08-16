export interface TestRun {
  id: number;
  project_id?: number;
  url: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  warning_tests: number;
  created_at: string;
}

export interface TestResult {
  id: number;
  run_id: number;
  test_name: string;
  test_type: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED';
  error_message?: string;
  error_category?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  url?: string;
  details: any;
  duration_ms: number;
  created_at: string;
  artifacts?: TestArtifact[]; // Will be populated when fetching detailed results
}

export interface TestArtifact {
  id: number;
  result_id: number;
  artifact_type: 'SCREENSHOT' | 'TRACE' | 'LOG';
  file_path: string;
  file_size?: number;
  created_at: string;
  url?: string; // Added by API when serving artifacts
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: any[];
}

export interface TestStatusEvent {
  runId: number;
  status: TestRun['status'];
  message: string;
  progress?: number;
}
