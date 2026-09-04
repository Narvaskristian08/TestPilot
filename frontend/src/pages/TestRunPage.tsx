import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestRun, TestResult } from '../types';
import { apiClient } from '../services/api';
import { socketService } from '../services/socket';
import { TestProgress } from '../components/TestProgress';
import { TestResultsPanel } from '../components/TestResultsPanel';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export const TestRunPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTestRun(parseInt(id));
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [id]);

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

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test run');
      setLoading(false);
    }
  };

  const handleTestUpdate = async (updatedTest: TestRun) => {
    setTestRun(updatedTest);
    
    // Reload results when test completes
    if ((updatedTest.status === 'COMPLETED' || updatedTest.status === 'FAILED') && id) {
      const { results: testResults } = await apiClient.getTestResults(parseInt(id));
      setResults(testResults);
    }
  };

  const handleCancelTest = async () => {
    if (id && window.confirm('Are you sure you want to cancel this test?')) {
      try {
        await apiClient.cancelTestRun(parseInt(id));
        if (testRun) {
          setTestRun({ ...testRun, status: 'CANCELLED' });
        }
      } catch (err) {
        alert('Failed to cancel test');
      }
    }
  };

  const handleDeleteTest = async () => {
    if (id && window.confirm('Are you sure you want to delete this test? This cannot be undone.')) {
      try {
        await apiClient.deleteTestRun(parseInt(id));
        navigate('/classic');
      } catch (err) {
        alert('Failed to delete test');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-running-500/20 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-running-500 rounded-full w-20 h-20 flex items-center justify-center">
              <ArrowPathIcon aria-hidden="true" className="h-10 w-10 animate-spin text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-noir-text-primary mb-2">Loading test run...</h3>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testRun) {
    return (
      <div className="min-h-screen bg-noir-bg flex items-center justify-center">
        <div className="bg-noir-surface border border-noir-border rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-noir-text-secondary mb-6">{error || 'Test run not found'}</p>
          <button
            onClick={() => navigate('/classic')}
            className="w-full px-4 py-2 bg-noir-text-primary text-noir-bg rounded-md hover:bg-zinc-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/classic')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-noir-surface border border-noir-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Test Run #{testRun.id}</h1>
                  <StatusBadge status={testRun.status} />
                </div>
                <p className="text-gray-600 break-all">{testRun.url}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Started: {testRun.created_at ? new Date(testRun.created_at).toLocaleString() : 'Not available'}
                </p>
              </div>

              <div className="flex gap-2">
                {(testRun.status === 'RUNNING' || testRun.status === 'QUEUED') && (
                  <button
                    onClick={handleCancelTest}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel
                  </button>
                )}
                {(testRun.status === 'COMPLETED' || testRun.status === 'FAILED' || testRun.status === 'CANCELLED') && (
                  <button
                    onClick={handleDeleteTest}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="bg-noir-surface border border-noir-border rounded-lg p-6">
            <TestProgress testRun={testRun} onUpdate={handleTestUpdate} />
          </div>
        </div>

        {/* Results Section */}
        {results && results.length > 0 && (
          <div className="bg-noir-surface border border-noir-border rounded-lg p-6">
            <TestResultsPanel results={results} />
          </div>
        )}

        {/* No Results Yet */}
        {(!results || results.length === 0) && testRun.status === 'RUNNING' && (
          <div className="bg-noir-surface border border-noir-border rounded-lg p-12 text-center">
            <ArrowPathIcon aria-hidden="true" className="mx-auto mb-4 h-8 w-8 animate-spin text-running-500" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tests in Progress
            </h3>
            <p className="text-gray-600">
              Results will appear here as tests complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
