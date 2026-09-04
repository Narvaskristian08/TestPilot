import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-noir-surface border border-noir-border rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-noir-text-primary mb-2">Welcome Back</h1>
          <p className="text-noir-text-secondary">Sign in to continue testing</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-md">
            <p className="text-sm text-danger-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-noir-text-secondary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary placeholder:text-noir-text-muted focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-noir-text-secondary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary placeholder:text-noir-text-muted focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-noir-text-primary text-noir-bg py-2 px-4 rounded-md hover:bg-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-noir-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-noir-text-primary hover:text-noir-text-secondary font-medium">
              Create one
            </Link>
          </p>
          <Link to="/dashboard" className="block mt-4 text-sm text-noir-text-muted hover:text-noir-text-primary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
