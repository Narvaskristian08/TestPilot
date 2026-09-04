import React, { useState } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, loading = false, disabled = false, error }) => {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const isDisabled = loading || disabled;

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError('Please enter a URL');
      return false;
    }

    try {
      const urlObj = new URL(value);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setValidationError('URL must start with http:// or https://');
        return false;
      }
      setValidationError('');
      return true;
    } catch {
      setValidationError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateUrl(url)) {
      onSubmit(url);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div>
          <label htmlFor="website-url" className="block text-sm font-medium text-noir-text-secondary mb-2">
            Enter your website URL
          </label>
          <div className="flex gap-3">
            <input
              id="website-url"
              type="text"
              value={url}
              onChange={handleChange}
              placeholder="https://example.com"
              disabled={isDisabled}
              className={`flex-1 px-4 py-3 bg-noir-secondary text-noir-text-primary border rounded-md focus:ring-1 focus:ring-zinc-500/40 focus:border-zinc-500 outline-none transition-colors ${
                validationError || error
                  ? 'border-danger-500 bg-danger-500/5'
                  : 'border-noir-border'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <button
              type="submit"
              disabled={isDisabled || !url.trim()}
              className={`px-8 py-3 bg-noir-text-primary text-noir-bg font-semibold rounded-md hover:bg-zinc-200 focus:ring-1 focus:ring-zinc-500/40 transition-colors ${
                isDisabled || !url.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isDisabled ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-noir-bg/30 border-t-noir-bg rounded-full animate-spin" />
                  <span>Starting...</span>
                </div>
              ) : (
                'Start Testing'
              )}
            </button>
          </div>
          {(validationError || error) && (
            <p className="mt-2 text-sm text-danger-400">{validationError || error}</p>
          )}
        </div>

        <div className="text-sm text-noir-text-secondary">
          <p>TestPilot will automatically test:</p>
          <ul className="mt-2 space-y-1 ml-4 list-disc">
            <li>Website availability and page load</li>
            <li>Broken links and navigation</li>
            <li>Forms and buttons (safe actions only)</li>
            <li>Responsive design (mobile, tablet, desktop)</li>
            <li>Console errors and accessibility</li>
          </ul>
        </div>
      </div>
    </form>
  );
};
