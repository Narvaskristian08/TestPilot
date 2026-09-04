import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UrlInput } from '../components/UrlInput';
import { TestProgress } from '../components/TestProgress';
import { TestRun } from '../types';
import { apiClient } from '../services/api';
import { socketService } from '../services/socket';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTest, setCurrentTest] = useState<TestRun | null>(null);
  const [recentTests, setRecentTests] = useState<TestRun[]>([]);

  useEffect(() => {
    // Set auth token if user is logged in
    if (session) {
      apiClient.setAuthToken(session.access_token);
    }
    
    loadRecentTests();
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, [session]);

  const loadRecentTests = async () => {
    try {
      const tests = await apiClient.getTestHistory(10);
      setRecentTests(tests);
    } catch (err) {
      console.error('Failed to load recent tests:', err);
    }
  };

  const handleStartTest = async (url: string) => {
    try {
      setError('');
      setLoading(true);
      const testRun = await apiClient.createTestRun(url);
      setCurrentTest(testRun);

      // Navigate to test run page
      navigate(`/test/${testRun.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start test');
      setLoading(false);
    }
  };

  const handleTestUpdate = (updatedTest: TestRun) => {
    setCurrentTest(updatedTest);
    if (updatedTest.status === 'COMPLETED' || updatedTest.status === 'FAILED') {
      setLoading(false);
      loadRecentTests();
    }
  };

  return (
    <div className="min-h-screen bg-noir-bg text-noir-text-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Navigation */}
        <div className="flex justify-end mb-6">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="px-4 py-2 text-noir-text-secondary hover:text-noir-text-primary font-medium transition-colors"
              >
                {user.email}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-noir-text-secondary hover:text-noir-text-primary font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-noir-text-primary text-noir-bg rounded-md hover:bg-zinc-200 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-noir-elevated border border-noir-border rounded-md p-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-noir-text-primary mb-4">
            TestPilot
          </h1>
          <p className="text-xl text-noir-text-secondary max-w-2xl mx-auto">
            Automated QA testing for your website. Enter your URL and get instant quality insights.
          </p>
        </div>

        {/* Main Test Input Card */}
        <div className="bg-noir-surface rounded-lg p-8 mb-8 border border-noir-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-noir-elevated border border-noir-border rounded-md p-3">
              <svg className="w-6 h-6 text-noir-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          <h2 className="text-2xl font-bold text-noir-text-primary">Start New Test</h2>
          </div>
          
          <UrlInput onSubmit={handleStartTest} disabled={loading} />
          
          {error && (
            <div className="mt-4 p-4 bg-danger-500/10 border border-danger-500/20 rounded-md flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-danger-400">{error}</p>
            </div>
          )}
        </div>

        {/* Current Test Progress */}
        {currentTest && (
          <div className="bg-noir-surface rounded-lg p-8 mb-8 border border-noir-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-running-500/10 border border-running-500/20 rounded-md p-3">
                <svg className="w-6 h-6 text-running-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-noir-text-primary">Test in Progress</h2>
            </div>
            <TestProgress
              testRun={currentTest}
              onUpdate={handleTestUpdate}
            />
          </div>
        )}

        {/* Recent Tests */}
        {recentTests.length > 0 && !currentTest && (
          <div className="bg-noir-surface rounded-lg p-8 border border-noir-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-noir-elevated border border-noir-border rounded-md p-3">
                <svg className="w-6 h-6 text-noir-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-noir-text-primary">Recent Tests</h2>
            </div>
            <div className="space-y-3">
              {recentTests.map(test => (
                <div
                  key={test.id}
                  onClick={() => navigate(`/test/${test.id}`)}
                  className="p-5 bg-noir-secondary hover:bg-noir-elevated rounded-md cursor-pointer transition-colors duration-200 border border-noir-border hover:border-zinc-500 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={test.status} size="sm" />
                        <span className="text-sm text-gray-500">#{test.id}</span>
                      </div>
                      <p className="text-gray-900 font-medium truncate group-hover:text-blue-600 transition-colors">
                        {test.url}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {test.created_at ? new Date(test.created_at).toLocaleString() : 'Not available'}
                        </span>
                        {(test.total_tests ?? 0) > 0 && (
                          <span className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-green-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {test.passed_tests}
                            </span>
                            <span className="flex items-center gap-1 text-red-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              {test.failed_tests}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {test.warning_tests}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recentTests.length === 0 && !currentTest && (
          <div className="bg-noir-surface rounded-lg p-12 text-center border border-noir-border">
            <div className="bg-noir-elevated border border-noir-border rounded-md w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-noir-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Test
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a website URL above to start your first automated QA test. We'll check for broken links, accessibility issues, performance problems, and more.
            </p>
          </div>
        )}
      </div>

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-noir-surface rounded-lg border border-noir-border p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-running-500/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-running-500 rounded-full w-20 h-20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Starting Test Run
              </h3>
              <p className="text-gray-600 mb-6">
                Setting up automated tests for your website...
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-running-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-running-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-running-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
