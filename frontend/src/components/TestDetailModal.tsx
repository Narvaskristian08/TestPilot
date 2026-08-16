import React, { useState } from 'react';
import { TestResult } from '../types';
import { StatusBadge } from './StatusBadge';

interface TestDetailModalProps {
  result: TestResult;
  onClose: () => void;
}

export const TestDetailModal: React.FC<TestDetailModalProps> = ({ result, onClose }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const screenshots = result.artifacts?.filter(a => a.artifact_type === 'SCREENSHOT') || [];
  const traces = result.artifacts?.filter(a => a.artifact_type === 'TRACE') || [];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {result.test_name}
                </h2>
                <div className="flex items-center gap-3">
                  <StatusBadge status={result.status} />
                  <span className="text-sm text-gray-600">
                    {result.test_type.replace(/_/g, ' ')}
                  </span>
                  {result.error_category && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {result.error_category.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* URL */}
            {result.url && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Target URL</h3>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 break-all text-sm"
                >
                  {result.url}
                </a>
              </div>
            )}

            {/* Error Message */}
            {result.error_message && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Problem</h3>
                <p className="text-red-700">{result.error_message}</p>
              </div>
            )}

            {/* Expected vs Actual */}
            {(result.expected_behavior || result.actual_behavior) && (
              <div className="grid md:grid-cols-2 gap-4">
                {result.expected_behavior && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Expected Behavior</h3>
                    <p className="text-green-700 text-sm">{result.expected_behavior}</p>
                  </div>
                )}
                {result.actual_behavior && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-2">Actual Behavior</h3>
                    <p className="text-orange-700 text-sm">{result.actual_behavior}</p>
                  </div>
                )}
              </div>
            )}

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Evidence</h3>
                <div className="grid grid-cols-1 gap-4">
                  {screenshots.map((artifact) => (
                    <div key={artifact.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={artifact.url}
                        alt="Test screenshot"
                        className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxImage(artifact.url)}
                      />
                      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        Screenshot • {((artifact.file_size || 0) / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traces */}
            {traces.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Playwright Trace</h3>
                {traces.map((artifact) => (
                  <a
                    key={artifact.id}
                    href={artifact.url}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Trace ({((artifact.file_size || 0) / 1024 / 1024).toFixed(1)} MB)
                  </a>
                ))}
                <p className="text-xs text-gray-600 mt-2">
                  Open trace file at <a href="https://trace.playwright.dev" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">trace.playwright.dev</a>
                </p>
              </div>
            )}

            {/* Details */}
            {result.details && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technical Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto font-mono">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Test Information</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-600">Duration</dt>
                  <dd className="font-medium text-gray-900">
                    {(result.duration_ms / 1000).toFixed(2)}s
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600">Executed At</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(result.created_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox for full-screen screenshot */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage}
            alt="Full screen screenshot"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
