import { useEffect, useState } from 'react';
import { XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface NewTestRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
}

export function NewTestRunModal({ isOpen, onClose, initialUrl = '' }: NewTestRunModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setError(null);
    }
  }, [initialUrl, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const testRun = await apiClient.createTestRun(url);
      
      // Close modal and navigate to test run page
      onClose();
      navigate(`/test/${testRun.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create test run');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setUrl('');
      setError(null);
      onClose();
    }
  };

  const exampleUrls = [
    'https://example.com',
    'https://staging.myapp.com',
    'http://localhost:3000',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-noir-surface border border-noir-border rounded-lg max-w-lg w-full mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-noir-border">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-noir-elevated border border-noir-border rounded-md flex items-center justify-center mr-3">
              <GlobeAltIcon className="w-6 h-6 text-noir-text-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-noir-text-primary">
                New Test Run
              </h3>
              <p className="text-sm text-noir-text-muted">
                Enter a URL to start automated testing
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-noir-text-muted hover:text-noir-text-primary hover:bg-noir-border rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="mb-6">
            <label
              htmlFor="test-url"
              className="block text-sm font-medium text-noir-text-primary mb-2"
            >
              Website URL
            </label>
            <input
              id="test-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary placeholder-noir-text-muted focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {error && (
              <p className="mt-2 text-sm text-danger-500">{error}</p>
            )}
          </div>

          <div className="mb-6">
            <p className="text-xs text-noir-text-muted mb-2">Examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleUrls.map((exampleUrl) => (
                <button
                  key={exampleUrl}
                  type="button"
                  onClick={() => setUrl(exampleUrl)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs font-medium text-noir-text-secondary bg-noir-bg hover:bg-noir-border border border-noir-border rounded-lg transition-colors disabled:opacity-50"
                >
                  {exampleUrl}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-noir-bg border border-noir-border rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-noir-text-primary mb-2">
              What will be tested:
            </h4>
            <ul className="space-y-1.5 text-sm text-noir-text-secondary">
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Page availability and load time
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Navigation links and buttons
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Form validation and submission
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Responsive design (mobile, tablet, desktop)
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Console errors and network failures
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Accessibility compliance (WCAG)
              </li>
              <li className="flex items-start">
                <span className="text-success-500 mr-2">✓</span>
                Security checks (OWASP)
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-noir-text-secondary hover:text-noir-text-primary hover:bg-noir-border rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="px-6 py-2 text-sm font-medium text-noir-bg bg-noir-text-primary hover:bg-zinc-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                'Start Test Run'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
