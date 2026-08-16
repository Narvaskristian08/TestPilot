import React, { useEffect, useState } from 'react';
import { TestRun } from '../types';
import { socketService } from '../services/socket';
import { StatusBadge } from './StatusBadge';

interface TestProgressProps {
  testRun: TestRun;
  onUpdate?: (testRun: TestRun) => void;
}

export const TestProgress: React.FC<TestProgressProps> = ({ testRun: initialTestRun, onUpdate }) => {
  const [testRun, setTestRun] = useState(initialTestRun);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setTestRun(initialTestRun);
  }, [initialTestRun]);

  useEffect(() => {
    if (testRun.status === 'RUNNING' || testRun.status === 'QUEUED') {
      // Subscribe to WebSocket updates
      const unsubscribe = socketService.subscribeToTest(testRun.id, (event) => {
        setMessage(event.message);
        
        // Fetch updated test run data on completion
        if (event.status === 'COMPLETED' || event.status === 'FAILED') {
          fetch(`/api/tests/${testRun.id}`)
            .then(res => res.json())
            .then(data => {
              const updated = data.data;
              setTestRun(updated);
              onUpdate?.(updated);
            })
            .catch(err => console.error('Failed to fetch test run:', err));
        }
      });

      // Also poll for updates every 2 seconds
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/tests/${testRun.id}`);
          const data = await res.json();
          const updated = data.data;
          setTestRun(updated);
          
          // Stop polling if test is complete
          if (updated.status !== 'RUNNING' && updated.status !== 'QUEUED') {
            clearInterval(pollInterval);
            onUpdate?.(updated);
          }
        } catch (err) {
          console.error('Failed to poll test run:', err);
        }
      }, 2000);

      return () => {
        unsubscribe();
        clearInterval(pollInterval);
      };
    }
  }, [testRun.id, testRun.status, onUpdate]);

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (testRun.status) {
      case 'QUEUED':
        return 'Test queued, waiting to start...';
      case 'RUNNING':
        return 'Running automated tests...';
      case 'COMPLETED':
        return 'All tests completed';
      case 'FAILED':
        return 'Test execution failed';
      case 'CANCELLED':
        return 'Test was cancelled';
      default:
        return '';
    }
  };

  const progress = testRun.total_tests > 0
    ? ((testRun.passed_tests + testRun.failed_tests + testRun.warning_tests) / testRun.total_tests) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${
            testRun.status === 'RUNNING' ? 'bg-blue-100 animate-pulse' :
            testRun.status === 'COMPLETED' ? 'bg-green-100' :
            testRun.status === 'FAILED' ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            {testRun.status === 'RUNNING' && (
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {testRun.status === 'COMPLETED' && (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {testRun.status === 'FAILED' && (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {testRun.status === 'QUEUED' && (
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Test Execution</h3>
            <p className="text-sm text-gray-600">{getStatusMessage()}</p>
          </div>
        </div>
        <StatusBadge status={testRun.status} size="lg" />
      </div>

      {(testRun.status === 'RUNNING' || testRun.status === 'COMPLETED') && (
        <>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Progress
              </span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 ${
                  testRun.status === 'RUNNING' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Test Stats */}
          {testRun.total_tests > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900">{testRun.total_tests}</div>
                <div className="text-xs text-gray-600 font-medium">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-green-600">{testRun.passed_tests}</div>
                <div className="text-xs text-green-700 font-medium">Passed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-red-600">{testRun.failed_tests}</div>
                <div className="text-xs text-red-700 font-medium">Failed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{testRun.warning_tests}</div>
                <div className="text-xs text-yellow-700 font-medium">Warnings</div>
              </div>
            </div>
          )}

          {/* Duration */}
          {testRun.duration_ms && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Duration: <span className="font-semibold text-gray-900">{(testRun.duration_ms / 1000).toFixed(2)}s</span></span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
