import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UrlInput } from '../components/UrlInput';
import { TestProgress } from '../components/TestProgress';
import { TestRun } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socket';

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
    setLoading(true);
    setError('');

    try {
      const testRun = await api.createTestRun(url);
      setCurrentTest(testRun);
      
      // Navigate to test run page after a brief delay
      setTimeout(() => {
        navigate(`/test/${testRun.id}`);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start test');
      setLoading(false);
    }
  };

  const handleTestUpdate = (updatedTest: TestRun) => {
    setCurrentTest(updatedTest);
    if (updatedTest.status === 'COMPLETED' || updatedTest.status === 'FAILED') {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎭 TestPilot
          </h1>
          <p className="text-xl text-gray-600">
            Automated QA testing for your website
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* URL Input Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <UrlInput
              onSubmit={handleStartTest}
              loading={loading}
              error={error}
            />
          </div>

          {/* Current Test Progress */}
          {currentTest && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <TestProgress
                testRun={currentTest}
                onUpdate={handleTestUpdate}
              />
            </div>
          )}

          {/* Recent Tests */}
          {recentTests.length > 0 && !currentTest && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Tests</h2>
              <div className="space-y-3">
                {recentTests.map(test => (
                  <div
                    key={test.id}
                    onClick={() => navigate(`/test/${test.id}`)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 truncate max-w-md">
                          {test.url}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            test.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : test.status === 'FAILED'
                              ? 'bg-red-100 text-red-700'
                              : test.status === 'RUNNING'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {test.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{new Date(test.created_at).toLocaleDateString()}</span>
                        {test.total_tests > 0 && (
                          <span>
                            {test.passed_tests} passed, {test.failed_tests} failed
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {!currentTest && recentTests.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                What We Test
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
                  <p className="text-sm text-gray-600">
                    Check if your site loads properly and responds correctly
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🔗</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Links</h3>
                  <p className="text-sm text-gray-600">
                    Detect broken links and navigation issues
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📱</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Responsive</h3>
                  <p className="text-sm text-gray-600">
                    Test mobile, tablet, and desktop viewports
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Forms</h3>
                  <p className="text-sm text-gray-600">
                    Validate form inputs and requirements
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">♿</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3>
                  <p className="text-sm text-gray-600">
                    Check for common accessibility issues
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🐛</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Errors</h3>
                  <p className="text-sm text-gray-600">
                    Capture console errors and failed requests
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>TestPilot • Automated QA for Modern Websites</p>
        </div>
      </div>
    </div>
  );
};
