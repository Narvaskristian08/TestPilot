import React from 'react';
import { TestResult } from '../types';
import { StatusBadge } from './StatusBadge';

interface TestCardProps {
  result: TestResult;
  onClick?: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ result, onClick }) => {
  // Parse details JSON string if present
  const parsedDetails = result.details ? (() => {
    try {
      return typeof result.details === 'string' ? JSON.parse(result.details) : result.details;
    } catch {
      return null;
    }
  })() : null;
  
  const hasDetails = parsedDetails && Object.keys(parsedDetails).length > 0;
  const hasArtifacts = result.artifacts && result.artifacts.length > 0;
  const isExpandable = hasDetails || result.error_message || hasArtifacts;

  const getTestIcon = () => {
    switch (result.test_type) {
      case 'AVAILABILITY':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
      case 'LINK_TEST':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
      case 'BUTTON_TEST':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;
      case 'FORM_TEST':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'RESPONSIVE':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
      case 'CONSOLE_ERRORS':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'ACCESSIBILITY':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border transition-colors duration-200 ${
        isExpandable ? 'hover:border-zinc-500 cursor-pointer' : ''
      } ${
        result.status === 'FAILED'
          ? 'border-danger-500/30 bg-danger-500/5 hover:border-danger-500/60'
        : result.status === 'WARNING'
          ? 'border-warning-500/30 bg-warning-500/5 hover:border-warning-500/60'
          : 'border-noir-border bg-noir-surface hover:border-zinc-500'
      }`}
      onClick={isExpandable ? onClick : undefined}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        result.status === 'FAILED' ? 'bg-danger-500' :
        result.status === 'WARNING' ? 'bg-warning-500' :
        result.status === 'PASSED' ? 'bg-success-500' : 'bg-noir-text-muted'
      }`} />
      
      <div className="p-5 pl-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-md ${
                result.status === 'FAILED' ? 'bg-danger-500/10 text-danger-500' :
                result.status === 'WARNING' ? 'bg-warning-500/10 text-warning-500' :
                'bg-noir-elevated text-noir-text-secondary'
              }`}>
                {getTestIcon()}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-noir-text-primary text-base group-hover:text-noir-text-secondary transition-colors font-mono">{result.test_name}</h4>
                <p className="text-sm text-noir-text-secondary">
                  {result.test_type.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
              <StatusBadge status={result.status} size="sm" />
            </div>

            {result.error_category && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 text-xs bg-noir-elevated text-noir-text-secondary px-2.5 py-1 rounded-md font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {result.error_category.replace(/_/g, ' ')}
                </span>
              </div>
            )}

            {result.error_message && (
              <p className="text-sm text-danger-400 mb-3 line-clamp-2 bg-danger-500/5 px-3 py-2 rounded-md border border-danger-500/20 font-mono">
                {result.error_message}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-noir-text-secondary font-mono">
              {result.duration_ms && result.duration_ms > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {(result.duration_ms / 1000).toFixed(2)}s
                </span>
              )}
              {hasArtifacts && (
                <span className="flex items-center gap-1.5 text-noir-text-secondary font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {result.artifacts!.length} evidence file{result.artifacts!.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {isExpandable && (
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-noir-text-muted group-hover:text-noir-text-primary transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Quick preview of link details */}
        {hasDetails && parsedDetails.totalLinksFound !== undefined && (
          <div className="mt-4 pt-4 border-t border-noir-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-noir-text-secondary">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-medium">{parsedDetails.totalLinksFound}</span> links found
              </div>
              {parsedDetails.brokenLinks !== undefined && parsedDetails.brokenLinks > 0 && (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                  <span>{parsedDetails.brokenLinks}</span> broken
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
