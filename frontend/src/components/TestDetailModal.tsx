import React, { useState } from 'react';
import { TestResult } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircleIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

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
        <div className="bg-noir-surface border border-noir-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-noir-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-noir-text-primary mb-2 font-mono">
                  {result.test_name}
                </h2>
                <div className="flex items-center gap-3">
                  <StatusBadge status={result.status} />
                  <span className="text-sm text-noir-text-secondary">
                    {result.test_type.replace(/_/g, ' ')}
                  </span>
                  {result.error_category && (
                    <span className="text-xs bg-noir-elevated text-noir-text-secondary px-2 py-1 rounded-md">
                      {result.error_category.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-noir-text-muted hover:text-noir-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* URL */}
            {result.url && (
              <div>
                <h3 className="font-semibold text-noir-text-primary mb-2">Target URL</h3>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-noir-text-secondary hover:text-noir-text-primary break-all text-sm font-mono"
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
                    <div key={artifact.id} className="border border-noir-border rounded-md overflow-hidden">
                      <img
                        src={artifact.url}
                        alt="Test screenshot"
                        className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setLightboxImage(artifact.url || null)}
                      />
                      <div className="bg-noir-secondary px-3 py-2 text-xs text-noir-text-secondary font-mono">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-noir-elevated border border-noir-border text-noir-text-primary rounded-md hover:bg-noir-border transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Trace ({((artifact.file_size || 0) / 1024 / 1024).toFixed(1)} MB)
                  </a>
                ))}
                <p className="text-xs text-noir-text-secondary mt-2">
                  Open trace file at <a href="https://trace.playwright.dev" target="_blank" rel="noopener noreferrer" className="text-noir-text-primary hover:underline font-mono">trace.playwright.dev</a>
                </p>
              </div>
            )}

            {/* Details */}
            {result.details && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Test Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    try {
                      const details = typeof result.details === 'string' 
                        ? JSON.parse(result.details) 
                        : result.details;
                      
                      // Format different test types
                      if (result.test_type === 'LINK_TEST' && details.results) {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <strong>Total Links Found:</strong> {details.totalLinksFound} | 
                              <strong> Tested:</strong> {details.testedLinks} | 
                              <strong> Working:</strong> <span className="text-green-600">{details.workingLinks}</span> | 
                              <strong> Broken:</strong> <span className="text-red-600">{details.brokenLinks}</span>
                            </p>
                            {details.brokenLinks > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-sm font-medium text-red-900">Broken Links:</p>
                                {details.results.filter((r: any) => !r.success).map((link: any, i: number) => (
                                  <div key={i} className="text-xs bg-red-50 p-2 rounded border border-red-200">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">
                                      {link.text || link.url}
                                    </a>
                                    <span className="text-red-600 ml-2">(Status: {link.status})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      if (result.test_type === 'BUTTON_TEST') {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <strong>Total Buttons:</strong> {details.totalButtonsFound} | 
                              <strong> Safe:</strong> <span className="text-green-600">{details.safeButtons}</span> | 
                              <strong> Destructive:</strong> <span className="text-yellow-600">{details.destructiveButtons}</span>
                            </p>
                            {details.destructive && details.destructive.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-yellow-900">Destructive Actions Detected:</p>
                                <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200 mt-1">
                                  {details.destructive.map((btn: any, i: number) => (
                                    <div key={i}>{btn.text || '(No text)'} - {btn.type}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">{details.note}</p>
                          </div>
                        );
                      }
                      
                      if (result.test_type === 'FORM_TEST') {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <strong>Forms Found:</strong> {details.formsFound} | 
                              <strong> Safe for Testing:</strong> {details.safeForTesting} | 
                              <strong> Skipped:</strong> {details.skippedUnsafe}
                            </p>
                            {details.forms && details.forms.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {details.forms.map((form: any, i: number) => (
                                  <div key={i} className="text-xs bg-blue-50 p-3 rounded border border-blue-200">
                                    <p className="font-medium text-blue-900">Form {form.formIndex}</p>
                                    <p className="text-blue-700">Action: {form.action || 'None'}</p>
                                    <p className="text-blue-700">Fields: {form.totalFields} ({form.requiredFields} required)</p>
                                    {form.fields && form.fields.length > 0 && (
                                      <div className="mt-1 space-y-1">
                                        {form.fields.slice(0, 5).map((field: any, j: number) => (
                                          <div key={j} className="text-blue-600">
                                            • {field.label || field.name} ({field.type})
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">{details.note}</p>
                          </div>
                        );
                      }
                      
                      if (result.test_type === 'ACCESSIBILITY') {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <strong>Total Violations:</strong> {details.totalViolations} | 
                              <strong> Critical:</strong> <span className="text-red-600">{details.critical}</span> | 
                              <strong> Serious:</strong> <span className="text-orange-600">{details.serious}</span> | 
                              <strong> Moderate:</strong> <span className="text-yellow-600">{details.moderate}</span>
                            </p>
                            {details.violations && details.violations.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {details.violations.map((violation: any, i: number) => (
                                  <div key={i} className={`text-xs p-3 rounded border ${
                                    violation.impact === 'critical' ? 'bg-red-50 border-red-200' :
                                    violation.impact === 'serious' ? 'bg-orange-50 border-orange-200' :
                                    'bg-yellow-50 border-yellow-200'
                                  }`}>
                                    <p className="font-medium">{violation.description}</p>
                                    <p className="mt-1">{violation.help}</p>
                                    <p className="mt-1 text-gray-600">
                                      Affects {violation.nodes} element(s) - 
                                      <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                        Learn more
                                      </a>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      if (result.test_type === 'CONSOLE_ERRORS') {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <strong>Errors:</strong> {details.totalErrors} | 
                              <strong> Warnings:</strong> {details.totalWarnings}
                            </p>
                            {details.pageErrors && details.pageErrors.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-red-900">Page Errors:</p>
                                <div className="space-y-1 mt-1">
                                  {details.pageErrors.map((error: string, i: number) => (
                                    <div key={i} className="text-xs bg-red-50 p-2 rounded border border-red-200">
                                      {error}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {details.consoleErrors && details.consoleErrors.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-red-900">Console Errors:</p>
                                <div className="space-y-1 mt-1">
                                  {details.consoleErrors.map((error: any, i: number) => (
                                    <div key={i} className="text-xs bg-red-50 p-2 rounded border border-red-200">
                                      {error.text || error}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      if (result.test_type === 'RESPONSIVE') {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                              <strong>Viewports Tested:</strong> {details.viewportsTested} | 
                              <strong> Passed:</strong> <span className="text-green-600">{details.passed}</span> | 
                              <strong> Failed:</strong> <span className="text-red-600">{details.failed}</span>
                            </p>
                            {details.viewports && details.viewports.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {details.viewports.map((vp: any, i: number) => (
                                  <div key={i} className={`text-xs p-3 rounded border ${
                                    vp.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                  }`}>
                                    <p className="font-medium">{vp.viewport} ({vp.width}×{vp.height})</p>
                                    <p className="mt-1 inline-flex items-center gap-1">
                                      Horizontal Scroll:
                                      {vp.hasHorizontalScroll ? (
                                        <><XCircleIcon aria-hidden="true" className="h-4 w-4 text-danger-500" /> Yes</>
                                      ) : (
                                        <><CheckCircleIcon aria-hidden="true" className="h-4 w-4 text-success-500" /> No</>
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      if (result.test_type === 'SECURITY') {
                        return (
                          <div className="space-y-3">
                            {details.envVariablesExposed && details.envVariablesExposed.length > 0 && (
                              <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                                <p className="flex items-center gap-1.5 font-semibold text-red-900 text-sm mb-2">
                                  <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4" />
                                  Environment Variables Exposed
                                </p>
                                {details.envVariablesExposed.map((envVar: string, i: number) => (
                                  <div key={i} className="text-xs bg-red-100 p-2 rounded mt-1 font-mono text-red-800">
                                    {envVar}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {details.exposedKeys && details.exposedKeys.length > 0 && (
                              <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                                <p className="flex items-center gap-1.5 font-semibold text-red-900 text-sm mb-2">
                                  <KeyIcon aria-hidden="true" className="h-4 w-4" />
                                  API Keys / Secrets Detected
                                </p>
                                {details.exposedKeys.map((key: any, i: number) => (
                                  <div key={i} className="text-xs bg-red-100 p-2 rounded mt-1">
                                    <p className="font-semibold text-red-800">{key.type}</p>
                                    <p className="font-mono text-red-700">{key.sample}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {details.owaspFindings && details.owaspFindings.length > 0 && (
                              <div className="bg-noir-secondary border border-noir-border rounded-md p-3">
                                <p className="flex items-center gap-1.5 font-semibold text-noir-text-primary text-sm mb-2">
                                  <ShieldCheckIcon aria-hidden="true" className="h-4 w-4" />
                                  OWASP Top 10 Findings
                                </p>
                                <div className="space-y-2">
                                  {details.owaspFindings.map((finding: any, i: number) => (
                                    <div key={i} className={`text-xs p-2 rounded border ${
                                      finding.severity === 'high' ? 'bg-red-100 border-red-300 text-red-800' :
                                      finding.severity === 'medium' ? 'bg-orange-100 border-orange-300 text-orange-800' :
                                      'bg-blue-100 border-blue-300 text-blue-800'
                                    }`}>
                                      <p className="font-semibold">{finding.category}</p>
                                      <p className="mt-1">{finding.issue}</p>
                                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                        finding.severity === 'high' ? 'bg-red-200' :
                                        finding.severity === 'medium' ? 'bg-orange-200' :
                                        'bg-blue-200'
                                      }`}>
                                        {finding.severity.toUpperCase()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {details.sensitiveConsoleMessages && details.sensitiveConsoleMessages.length > 0 && (
                              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                                <p className="flex items-center gap-1.5 font-semibold text-yellow-900 text-sm mb-2">
                                  <ExclamationTriangleIcon aria-hidden="true" className="h-4 w-4" />
                                  Sensitive Console Messages
                                </p>
                                {details.sensitiveConsoleMessages.map((msg: string, i: number) => (
                                  <div key={i} className="text-xs bg-yellow-100 p-2 rounded mt-1 font-mono text-yellow-800">
                                    {msg}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {details.storageExposure && details.storageExposure.length > 0 && (
                              <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
                                <p className="flex items-center gap-1.5 font-semibold text-orange-900 text-sm mb-2">
                                  <CircleStackIcon aria-hidden="true" className="h-4 w-4" />
                                  Sensitive Data in Storage
                                </p>
                                {details.storageExposure.map((key: string, i: number) => (
                                  <div key={i} className="text-xs bg-orange-100 p-2 rounded mt-1 font-mono text-orange-800">
                                    {key}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {details.securityHeaders && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="flex items-center gap-1.5 font-semibold text-blue-900 text-sm mb-2">
                                  <ShieldCheckIcon aria-hidden="true" className="h-4 w-4" />
                                  Security Headers
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Object.entries(details.securityHeaders).map(([header, value]: [string, any]) => (
                                    <div key={header} className={`p-2 rounded ${
                                      value === 'Missing' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                      <p className="font-medium">{header}</p>
                                      <p className="inline-flex items-center gap-1 font-mono">
                                        {value === 'Missing' ? (
                                          <><XCircleIcon aria-hidden="true" className="h-4 w-4" /> Missing</>
                                        ) : (
                                          <><CheckCircleIcon aria-hidden="true" className="h-4 w-4" /> Present</>
                                        )}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {details.recommendations && details.recommendations.length > 0 && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="flex items-center gap-1.5 font-semibold text-gray-900 text-sm mb-2">
                                  <LightBulbIcon aria-hidden="true" className="h-4 w-4" />
                                  Recommendations
                                </p>
                                <ul className="text-xs text-gray-700 space-y-1">
                                  {details.recommendations.map((rec: string, i: number) => (
                                    <li key={i}>• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {details.message && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="inline-flex items-center gap-1 text-sm text-green-800">
                                  <CheckCircleIcon aria-hidden="true" className="h-4 w-4" />
                                  {details.message}
                                </p>
                                {details.checked && (
                                  <ul className="text-xs text-green-700 mt-2 space-y-1">
                                    {details.checked.map((check: string, i: number) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <CheckCircleIcon aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span>{check}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      // Default: show raw JSON
                      return (
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto font-mono">
                          {JSON.stringify(details, null, 2)}
                        </pre>
                      );
                    } catch (e) {
                      return (
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto font-mono">
                          {result.details}
                        </pre>
                      );
                    }
                  })()}
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
                    {((result.duration_ms ?? 0) / 1000).toFixed(2)}s
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600">Executed At</dt>
                  <dd className="font-medium text-gray-900">
                    {result.created_at ? new Date(result.created_at).toLocaleString() : 'Not available'}
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
