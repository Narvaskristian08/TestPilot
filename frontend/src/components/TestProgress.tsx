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
    if (testRun.status === 'RUNNING' || testRun.status === 'QUEUED') {
      const unsubscribe = socketService.subscribeToTest(testRun.id, (event) => {
        setMessage(event.message);
        
        // Fetch updated test run data
        if (event.status === 'COMPLETED' || event.status === 'FAILED') {
          fetch(`/api/tests/${testRun.id}`)
            .then(res => res.json())
            .then(data => {
              setTestRun(data.data.testRun);
              onUpdate?.(data.data.testRun);
            });
        }
      });

      return unsubscribe;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Test Execution</h3>
          <p className="text-sm text-gray-600">{getStatusMessage()}</p>
        </div>
        <StatusBadge status={testRun.status} size="lg" />
      </div>

      {(testRun.status === 'RUNNING' || testRun.status === 'COMPLETED') && (
        <>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  testRun.status === 'RUNNING' ? 'bg-blue-600 animate-pulse-slow' : 'bg-green-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Test Stats */}
          {testRun.total_tests > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{testRun.total_tests}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-success-50 rounded-lg">
                <div className="text-2xl font-bold text-success-600">{testRun.passed_tests}</div>
                <div className="text-xs text-success-700">Passed</div>
              </div>
              <div className="text-center p-3 bg-danger-50 rounded-lg">
                <div className="text-2xl font-bold text-danger-600">{testRun.failed_tests}</div>
                <div className="text-xs text-danger-700">Failed</div>
              </div>
              <div className="text-center p-3 bg-warning-50 rounded-lg">
                <div className="text-2xl font-bold text-warning-600">{testRun.warning_tests}</div>
                <div className="text-xs text-warning-700">Warnings</div>
              </div>
            </div>
          )}

          {/* Duration */}
          {testRun.duration_ms && (
            <div className="text-sm text-gray-600">
              Duration: {(testRun.duration_ms / 1000).toFixed(2)}s
            </div>
          )}
        </>
      )}
    </div>
  );
};
