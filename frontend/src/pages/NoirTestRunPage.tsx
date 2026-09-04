import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TestRun, TestResult } from '../types';
import { apiClient } from '../services/api';
import { useTestProgress } from '../hooks/useTestProgress';
import {
  ArrowLeftIcon,
  PlayIcon,
  XMarkIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StatusBadge } from '../components/dashboard/StatusBadge';

export function NoirTestRunPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runId = id ? parseInt(id) : null;
  const { progress, status: wsStatus, isConnected } = useTestProgress(runId);

  useEffect(() => {
    if (runId) {
      loadTestRun(runId);
    }
  }, [runId]);

  useEffect(() => {
    // Reload when test completes via WebSocket
    if (wsStatus === 'COMPLETED' || wsStatus === 'FAILED') {
      if (runId) {
        loadTestRun(runId);
      }
    }
  }, [wsStatus, runId]);

  const loadTestRun = async (testId: number) => {
    try {
      setLoading(true);
      const run = await apiClient.getTestRun(testId);
      setTestRun(run);

      // Load results if test is completed
      if (run.status === 'COMPLETED' || run.status === 'FAILED') {
        const { results: testResults } = await apiClient.getTestResults(testId);
        setResults(testResults);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load test run');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!runId || !window.confirm('Cancel this test run?')) return;

    try {
      await apiClient.cancelTestRun(runId);
      setTestRun(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel test');
    }
  };

  const handleDelete = async () => {
    if (!runId || !window.confirm('Delete this test run? This cannot be undone.')) return;

    try {
      await apiClient.deleteTestRun(runId);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to delete test');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-noir-bg">
        <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-noir-border border-t-running-500 mx-auto mb-4"></div>
            <p className="text-noir-text-secondary">Loading test run...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testRun) {
    return (
      <div className="flex h-screen bg-noir-bg">
        <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center">
            <XCircleIcon className="w-12 h-12 text-danger-500 mx-auto mb-4" />
            <p className="text-danger-400 mb-4">{error || 'Test run not found'}</p>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium text-noir-bg bg-noir-text-primary hover:bg-zinc-200 rounded-md transition-colors inline-flex items-center"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRunning = testRun.status === 'RUNNING' || testRun.status === 'QUEUED';
  const isCompleted = testRun.status === 'COMPLETED';
  const isFailed = testRun.status === 'FAILED';

  return (
    <div className="flex h-screen bg-noir-bg overflow-hidden">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Header */}
        <div className="bg-noir-secondary border-b border-noir-border px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 p-2 text-noir-text-secondary hover:text-noir-text-primary hover:bg-noir-border rounded-md transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-noir-text-primary mb-1">
                  Test Run #{testRun.id}
                </h1>
                <p className="text-sm text-noir-text-secondary">
                  {testRun.url}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isConnected && isRunning && (
                <div className="flex items-center text-sm text-success-500">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
                  </span>
                  Live
                </div>
              )}
              
              {isRunning && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-noir-text-primary bg-noir-elevated hover:bg-noir-border rounded-md transition-colors flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              )}
              
              {(isCompleted || isFailed) && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-danger-500 hover:bg-danger-500/10 rounded-md transition-colors flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Status Card */}
            <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider mb-2">
                    Status
                  </p>
                  <StatusBadge
                    status={
                      testRun.status === 'COMPLETED' && testRun.overall_status === 'PASSED'
                        ? 'passed'
                        : testRun.status === 'FAILED' || testRun.overall_status === 'FAILED'
                        ? 'failed'
                        : testRun.status === 'RUNNING' || testRun.status === 'QUEUED'
                        ? 'in-progress'
                        : 'pending'
                    }
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider mb-2">
                    Browser
                  </p>
                  <p className="text-sm font-semibold text-noir-text-primary capitalize">
                    {testRun.browser}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider mb-2">
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-noir-text-primary">
                    {testRun.duration_ms
                      ? `${(testRun.duration_ms / 1000).toFixed(1)}s`
                      : isRunning
                      ? 'In progress...'
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider mb-2">
                    Started
                  </p>
                  <p className="text-sm font-semibold text-noir-text-primary">
                    {new Date(testRun.created_at!).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress (if running) */}
            {isRunning && progress.length > 0 && (
              <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-noir-text-primary mb-4">
                  Test Progress
                </h3>
                <div className="space-y-3">
                  {progress.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start animate-fade-in"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        event.status === 'completed' ? 'bg-success-500/10' :
                        event.status === 'failed' ? 'bg-danger-500/10' :
                        'bg-running-500/10'
                      }`}>
                        {event.status === 'completed' ? (
                          <CheckCircleIcon className="w-5 h-5 text-success-500" />
                        ) : event.status === 'failed' ? (
                          <XCircleIcon className="w-5 h-5 text-danger-500" />
                        ) : (
                          <PlayIcon className="w-5 h-5 text-running-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-noir-text-primary">
                          {event.testName} - {event.testType}
                        </p>
                        {event.message && (
                          <p className="text-xs text-noir-text-muted mt-1">
                            {event.message}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-noir-text-muted">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Summary */}
            {(isCompleted || isFailed) && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                      Total Tests
                    </p>
                    <ClockIcon className="w-5 h-5 text-noir-text-secondary" />
                  </div>
                  <p className="text-3xl font-bold text-noir-text-primary">
                    {testRun.total_tests || 0}
                  </p>
                </div>

                <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                      Passed
                    </p>
                    <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  </div>
                  <p className="text-3xl font-bold text-success-500">
                    {testRun.passed_tests || 0}
                  </p>
                </div>

                <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                      Failed
                    </p>
                    <XCircleIcon className="w-5 h-5 text-danger-500" />
                  </div>
                  <p className="text-3xl font-bold text-danger-500">
                    {testRun.failed_tests || 0}
                  </p>
                </div>

                <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                      Warnings
                    </p>
                    <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />
                  </div>
                  <p className="text-3xl font-bold text-warning-500">
                    {testRun.warning_tests || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Test Results */}
            {results.length > 0 && (
                <div className="bg-noir-surface border border-noir-border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-noir-border">
                  <h3 className="text-lg font-semibold text-noir-text-primary">
                    Test Results ({results.length})
                  </h3>
                </div>
                <div className="divide-y divide-noir-border">
                  {results.map((result) => (
                    <div key={result.id} className="px-6 py-4 hover:bg-noir-bg transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center flex-1">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            result.status === 'PASSED' ? 'bg-success-500' :
                            result.status === 'FAILED' ? 'bg-danger-500' :
                            'bg-warning-500'
                          }`} />
                          <div>
                            <h4 className="text-sm font-semibold text-noir-text-primary">
                              {result.test_name}
                            </h4>
                            <p className="text-xs text-noir-text-muted">
                              {result.test_type} • {result.duration_ms}ms
                            </p>
                          </div>
                        </div>
                        <StatusBadge
                          status={
                            result.status === 'PASSED' ? 'passed' :
                            result.status === 'FAILED' ? 'failed' :
                            'pending'
                          }
                          size="sm"
                        />
                      </div>
                      {result.error_message && (
                        <div className="mt-3 p-3 bg-danger-500/5 border border-danger-500/20 rounded-lg">
                          <p className="text-xs font-medium text-danger-400 font-mono">
                            {result.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
