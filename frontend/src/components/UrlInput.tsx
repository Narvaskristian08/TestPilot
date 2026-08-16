import React, { useState } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading?: boolean;
  error?: string;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, loading = false, error }) => {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

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
          <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your website URL
          </label>
          <div className="flex gap-3">
            <input
              id="website-url"
              type="text"
              value={url}
              onChange={handleChange}
              placeholder="https://example.com"
              disabled={loading}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                validationError || error
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className={`px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all ${
                loading || !url.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting...</span>
                </div>
              ) : (
                'Start Testing'
              )}
            </button>
          </div>
          {(validationError || error) && (
            <p className="mt-2 text-sm text-red-600">{validationError || error}</p>
          )}
        </div>

        <div className="text-sm text-gray-600">
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
