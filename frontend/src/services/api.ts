import { TestRun, TestResult, ApiResponse } from '../types';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  /**
   * Create a new test run
   */
  async createTestRun(url: string): Promise<TestRun> {
    const response = await this.request<{ testRun: TestRun }>('/tests', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });

    return response.data!.testRun;
  }

  /**
   * Get test run by ID
   */
  async getTestRun(id: number): Promise<TestRun> {
    const response = await this.request<{ testRun: TestRun }>(`/tests/${id}`);
    return response.data!.testRun;
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
    const response = await this.request<{ testRuns: TestRun[]; total: number }>(
      `/tests?limit=${limit}`
    );
    return response.data!.testRuns;
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
}

export const api = new ApiClient();
