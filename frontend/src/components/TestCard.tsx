import React from 'react';
import { TestResult } from '../types';
import { StatusBadge } from './StatusBadge';

interface TestCardProps {
  result: TestResult;
  onClick?: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ result, onClick }) => {
  const hasDetails = result.details && Object.keys(result.details).length > 0;
  const hasArtifacts = result.artifacts && result.artifacts.length > 0;
  const isExpandable = hasDetails || result.error_message || hasArtifacts;

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isExpandable ? 'hover:shadow-md cursor-pointer hover:border-primary-300' : ''
      } ${
        result.status === 'FAILED'
          ? 'border-red-200 bg-red-50'
          : result.status === 'WARNING'
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-gray-200 bg-white'
      }`}
      onClick={isExpandable ? onClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="font-semibold text-gray-900">{result.test_name}</h4>
            <StatusBadge status={result.status} size="sm" />
            {result.error_category && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                {result.error_category.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {result.test_type.replace(/_/g, ' ').toLowerCase()}
          </p>

          {result.error_message && (
            <p className="text-sm text-red-600 mt-2 line-clamp-2">
              {result.error_message}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2">
            {result.duration_ms > 0 && (
              <p className="text-xs text-gray-500">
                {(result.duration_ms / 1000).toFixed(2)}s
              </p>
            )}
            {hasArtifacts && (
              <p className="text-xs text-primary-600 font-medium">
                📎 {result.artifacts!.length} artifact{result.artifacts!.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {isExpandable && (
          <div className="ml-4">
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
        )}
      </div>

      {/* Quick preview of details */}
      {hasDetails && result.details.totalLinksFound !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {result.details.totalLinksFound !== undefined && (
              <div className="text-gray-600">
                Links found: <span className="font-medium text-gray-900">{result.details.totalLinksFound}</span>
              </div>
            )}
            {result.details.brokenLinks !== undefined && (
              <div className="text-gray-600">
                Broken: <span className="font-medium text-red-600">{result.details.brokenLinks}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
