import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { TestRun } from '../types';

interface DashboardStats {
  totalRuns: number;
  passed: number;
  failed: number;
  inProgress: number;
  passRate: number;
  failRate: number;
  trend: {
    totalChange: number | null;
    passedChange: number | null;
    failedChange: number | null;
  };
}

export function useTestRuns(limit: number = 20) {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestRuns = async () => {
    try {
      setLoading(true);
      const runs = await apiClient.getTestHistory(limit);
      setTestRuns(runs);
      
      // Calculate statistics
      const calculatedStats = calculateStats(runs);
      setStats(calculatedStats);
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch test runs:', err);
      setError(err.message || 'Failed to load test runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestRuns();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTestRuns, 30000);
    
    return () => clearInterval(interval);
  }, [limit]);

  return {
    testRuns,
    stats,
    loading,
    error,
    refetch: fetchTestRuns,
  };
}

function calculateStats(runs: TestRun[]): DashboardStats {
  const totalRuns = runs.length;
  
  // Count by status
  const passed = runs.filter(r => r.overall_status === 'PASSED').length;
  const failed = runs.filter(r => r.overall_status === 'FAILED').length;
  const inProgress = runs.filter(r => r.status === 'RUNNING' || r.status === 'QUEUED').length;
  
  // Calculate rates
  const passRate = totalRuns > 0 ? (passed / totalRuns) * 100 : 0;
  const failRate = totalRuns > 0 ? (failed / totalRuns) * 100 : 0;
  
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const currentPeriod = runs.filter((run) => now - new Date(run.created_at || 0).getTime() <= week);
  const previousPeriod = runs.filter((run) => {
    const age = now - new Date(run.created_at || 0).getTime();
    return age > week && age <= week * 2;
  });
  const percentageChange = (current: number, previous: number): number | null => {
    if (previous === 0) return current === 0 ? 0 : null;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  };

  const trend = {
    totalChange: percentageChange(currentPeriod.length, previousPeriod.length),
    passedChange: percentageChange(
      currentPeriod.filter(r => r.overall_status === 'PASSED').length,
      previousPeriod.filter(r => r.overall_status === 'PASSED').length,
    ),
    failedChange: percentageChange(
      currentPeriod.filter(r => r.overall_status === 'FAILED').length,
      previousPeriod.filter(r => r.overall_status === 'FAILED').length,
    ),
  };

  return {
    totalRuns,
    passed,
    failed,
    inProgress,
    passRate,
    failRate,
    trend,
  };
}
