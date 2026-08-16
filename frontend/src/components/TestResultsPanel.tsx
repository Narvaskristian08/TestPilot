import React, { useState } from 'react';
import { TestResult } from '../types';
import { TestCard } from './TestCard';
import { TestDetailModal } from './TestDetailModal';

interface TestResultsPanelProps {
  results: TestResult[];
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({ results }) => {
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'warning'>('all');

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    if (filter === 'passed') return result.status === 'PASSED';
    if (filter === 'failed') return result.status === 'FAILED';
    if (filter === 'warning') return result.status === 'WARNING';
    return true;
  });

  const counts = {
    all: results.length,
    passed: results.filter(r => r.status === 'PASSED').length,
    failed: results.filter(r => r.status === 'FAILED').length,
    warning: results.filter(r => r.status === 'WARNING').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'passed', 'failed', 'warning'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid gap-3">
        {filteredResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {filter !== 'all' ? filter : ''} tests found
          </div>
        ) : (
          filteredResults.map(result => (
            <TestCard
              key={result.id}
              result={result}
              onClick={() => setSelectedResult(result)}
            />
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedResult && (
        <TestDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};
