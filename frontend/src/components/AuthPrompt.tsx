import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ 
  isOpen, 
  onClose, 
  message = "Your 3 free QA runs have been used." 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-noir-surface border border-noir-border rounded-lg max-w-md w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-noir-text-muted hover:text-noir-text-primary"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-noir-elevated border border-noir-border rounded-md mx-auto mb-4">
            <svg className="w-6 h-6 text-noir-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-noir-text-primary mb-2">
              Free Limit Reached
            </h3>
            <p className="text-noir-text-secondary">
              {message}
            </p>
            <p className="text-noir-text-secondary mt-2">
              Create a free account to get <span className="font-semibold text-noir-text-primary">20 runs per day</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRegister}
              className="w-full bg-noir-text-primary text-noir-bg py-3 px-4 rounded-md hover:bg-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500/40 transition-colors font-medium"
            >
              Create Account
            </button>
            <button
              onClick={handleLogin}
              className="w-full bg-noir-secondary text-noir-text-primary py-3 px-4 rounded-md border border-noir-border hover:bg-noir-elevated focus:outline-none focus:ring-1 focus:ring-zinc-500/40 transition-colors font-medium"
            >
              Log In
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-noir-text-muted text-center mt-4">
            No credit card required
          </p>
        </div>
      </div>
    </div>
  );
};
