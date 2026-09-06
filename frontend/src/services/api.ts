import {
  TestRun,
  TestResult,
  ApiResponse,
  ManagedArtifact,
  ManagedCase,
  ManagedEnvironment,
  ManagedReport,
  ManagedSchedule,
  ManagedSuite,
} from '../types';
import { config } from '../config';

const API_BASE = config.apiUrl + '/api';
const GUEST_ID_STORAGE_KEY = 'testpilot-guest-id';

function createGuestFingerprint(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class ApiClient {
  private authToken: string | null = null;
  private guestFingerprint: string;

  constructor() {
    this.guestFingerprint = this.loadGuestFingerprint();
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  getGuestFingerprint(): string {
    return this.guestFingerprint;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      headers['X-Guest-ID'] = this.guestFingerprint;

      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          ...headers,
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          error: data.error,
          data: data.data,
        };
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw error; // Re-throw structured error
    }
  }

  private loadGuestFingerprint(): string {
    if (typeof window === 'undefined') {
      return 'server-guest';
    }

    try {
      const existing = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
      if (existing) return existing;

      const fingerprint = createGuestFingerprint();
      window.localStorage.setItem(GUEST_ID_STORAGE_KEY, fingerprint);
      return fingerprint;
    } catch {
      return createGuestFingerprint();
    }
  }

  /**
   * Create a new test run
   */
  async createTestRun(url: string): Promise<TestRun> {
    const response = await this.request<TestRun>('/tests', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });

    return response.data!;
  }

  /**
   * Get test run by ID
   */
  async getTestRun(id: number): Promise<TestRun> {
    const response = await this.request<TestRun>(`/tests/${id}`);
    return response.data!;
  }

  /**
   * Get test results for a run
   */
  async getTestResults(id: number): Promise<{ testRun: TestRun; results: TestResult[] }> {
    const response = await this.request<{ testRun: TestRun; results: TestResult[] }>(
      `/tests/${id}/results`
    );
    return response.data!;
  }

  /**
   * Get test history
   */
  async getTestHistory(limit: number = 20): Promise<TestRun[]> {
    const response = await this.request<TestRun[]>(
      `/tests?limit=${limit}`
    );
    return response.data || [];
  }

  /**
   * Cancel a running test
   */
  async cancelTestRun(id: number): Promise<void> {
    await this.request(`/tests/${id}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Delete a test run
   */
  async deleteTestRun(id: number): Promise<void> {
    await this.request(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get screenshot URL
   */
  getScreenshotUrl(runId: number, filename: string): string {
    return `${API_BASE}/tests/${runId}/screenshot/${filename}`;
  }

  /**
   * Register user (called after Supabase signup)
   */
  async registerUser(data: {
    supabaseUserId: string;
    email: string;
    displayName: string | null;
  }): Promise<void> {
    await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<any> {
    const response = await this.request<any>('/auth/me');
    return response.data;
  }

  /**
   * Get usage stats
   */
  async getUsageStats(): Promise<{
    used: number;
    limit: number;
    remaining: number;
    hasExceeded: boolean;
    resetsAt?: string;
  }> {
    const response = await this.request<any>('/auth/usage');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: { display_name: string }): Promise<void> {
    await this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getSuites(): Promise<ManagedSuite[]> {
    const response = await this.request<ManagedSuite[]>('/management/suites');
    return response.data || [];
  }

  async createSuite(data: { name: string; description?: string }): Promise<ManagedSuite> {
    const response = await this.request<ManagedSuite>('/management/suites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateSuite(id: number, data: { name?: string; description?: string }): Promise<ManagedSuite> {
    const response = await this.request<ManagedSuite>(`/management/suites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteSuite(id: number): Promise<void> {
    await this.request(`/management/suites/${id}`, { method: 'DELETE' });
  }

  async getCases(suiteId?: number): Promise<ManagedCase[]> {
    const query = suiteId ? `?suiteId=${suiteId}` : '';
    const response = await this.request<ManagedCase[]>(`/management/cases${query}`);
    return response.data || [];
  }

  async createCase(data: {
    name: string;
    type: string;
    description?: string;
    suite_id?: number | null;
    status?: 'active' | 'inactive';
  }): Promise<ManagedCase> {
    const response = await this.request<ManagedCase>('/management/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateCase(id: number, data: Partial<ManagedCase>): Promise<ManagedCase> {
    const response = await this.request<ManagedCase>(`/management/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteCase(id: number): Promise<void> {
    await this.request(`/management/cases/${id}`, { method: 'DELETE' });
  }

  async getSchedules(): Promise<ManagedSchedule[]> {
    const response = await this.request<ManagedSchedule[]>('/management/schedules');
    return response.data || [];
  }

  async createSchedule(data: {
    name: string;
    suite_id?: number | null;
    cron_expression: string;
    timezone: string;
  }): Promise<ManagedSchedule> {
    const response = await this.request<ManagedSchedule>('/management/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateSchedule(id: number, data: Partial<ManagedSchedule>): Promise<ManagedSchedule> {
    const response = await this.request<ManagedSchedule>(`/management/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async toggleSchedule(id: number): Promise<ManagedSchedule> {
    const response = await this.request<ManagedSchedule>(`/management/schedules/${id}/toggle`, {
      method: 'POST',
    });
    return response.data!;
  }

  async deleteSchedule(id: number): Promise<void> {
    await this.request(`/management/schedules/${id}`, { method: 'DELETE' });
  }

  async getEnvironments(): Promise<ManagedEnvironment[]> {
    const response = await this.request<ManagedEnvironment[]>('/management/environments');
    return response.data || [];
  }

  async createEnvironment(data: {
    name: string;
    url: string;
    type: string;
    status?: string;
    description?: string;
  }): Promise<ManagedEnvironment> {
    const response = await this.request<ManagedEnvironment>('/management/environments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async updateEnvironment(id: number, data: Partial<ManagedEnvironment>): Promise<ManagedEnvironment> {
    const response = await this.request<ManagedEnvironment>(`/management/environments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteEnvironment(id: number): Promise<void> {
    await this.request(`/management/environments/${id}`, { method: 'DELETE' });
  }

  async getReports(): Promise<ManagedReport[]> {
    const response = await this.request<ManagedReport[]>('/management/reports');
    return response.data || [];
  }

  async createReport(data: { title: string; period_start?: string; period_end?: string }): Promise<ManagedReport> {
    const response = await this.request<ManagedReport>('/management/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async deleteReport(id: number): Promise<void> {
    await this.request(`/management/reports/${id}`, { method: 'DELETE' });
  }

  async getArtifacts(): Promise<ManagedArtifact[]> {
    const response = await this.request<ManagedArtifact[]>('/management/artifacts');
    return response.data || [];
  }
}

export const apiClient = new ApiClient();
