import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UrlInput } from '../components/UrlInput';
import { TestProgress } from '../components/TestProgress';
import { TestRun } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTest, setCurrentTest] = useState<TestRun | null>(null);
  const [recentTests, setRecentTests] = useState<TestRun[]>([]);

  useEffect(() => {
    loadRecentTests();
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const loadRecentTests = async () => {
    try {
      const tests = await api.getTestHistory(10);
      setRecentTests(tests);
    } catch (err) {
      console.error('Failed to load recent tests:', err);
    }
  };

  const handleStartTest = async (url: string) => {
    try {
      setError('');
      setLoading(true);
      const testRun = await api.createTestRun(url);
      setCurrentTest(testRun);
      
      // Navigate to test run page
      navigate(`/test/${testRun.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start test');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            TestPilot
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automated QA testing for your website. Enter your URL and get instant quality insights.
          </p>
        </div>

        {/* Main Test Input Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 rounded-xl p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Start New Test</h2>
          </div>
          
          <UrlInput onSubmit={handleStartTest} disabled={loading} />
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Current Test Progress */}
        {currentTest && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-green-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Test in Progress</h2>
            </div>
            <TestProgress
              testRun={currentTest}
              onUpdate={handleTestUpdate}
            />
          </div>
        )}

        {/* Recent Tests */}
        {recentTests.length > 0 && !currentTest && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 rounded-xl p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Tests</h2>
            </div>
            <div className="space-y-3">
              {recentTests.map(test => (
                <div
                  key={test.id}
                  onClick={() => navigate(`/test/${test.id}`)}
                  className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-xl cursor-pointer transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-md group"
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
                          {new Date(test.created_at).toLocaleString()}
                        </span>
                        {test.total_tests > 0 && (
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
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-20 h-20 flex items-center justify-center">
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
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
