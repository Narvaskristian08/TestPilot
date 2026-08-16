import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestRun, TestResult } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { TestProgress } from '../components/TestProgress';
import { TestResultsPanel } from '../components/TestResultsPanel';
import { StatusBadge } from '../components/StatusBadge';

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
      const run = await api.getTestRun(testId);
      setTestRun(run);

      // Load results if test is completed
      if (run.status === 'COMPLETED' || run.status === 'FAILED') {
        const { results: testResults } = await api.getTestResults(testId);
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
      const { results: testResults } = await api.getTestResults(parseInt(id));
      setResults(testResults);
    }
  };

  const handleCancelTest = async () => {
    if (id && window.confirm('Are you sure you want to cancel this test?')) {
      try {
        await api.cancelTestRun(parseInt(id));
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
        await api.deleteTestRun(parseInt(id));
        navigate('/');
      } catch (err) {
        alert('Failed to delete test');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading test run...</p>
        </div>
      </div>
    );
  }

  if (error || !testRun) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Test run not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Test Run #{testRun.id}</h1>
                  <StatusBadge status={testRun.status} />
                </div>
                <p className="text-gray-600 break-all">{testRun.url}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Started: {new Date(testRun.created_at).toLocaleString()}
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
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <TestProgress testRun={testRun} onUpdate={handleTestUpdate} />
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <TestResultsPanel results={results} />
          </div>
        )}

        {/* No Results Yet */}
        {results.length === 0 && testRun.status === 'RUNNING' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-4xl mb-4">⏳</div>
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
