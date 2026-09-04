import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      const data = await apiClient.getCurrentUser();
      setUserData(data);
      setDisplayName(data.display_name || '');
    } catch (err: any) {
      setError('Failed to load profile data');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.updateProfile({ display_name: displayName });
      setSuccess('Profile updated successfully');
      await loadUserData();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/dashboard');
  };

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-noir-bg flex items-center justify-center">
        <div className="text-noir-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-noir-surface border border-noir-border rounded-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-noir-text-primary">Profile</h1>
            <Link to="/dashboard" className="text-sm text-noir-text-secondary hover:text-noir-text-primary">
              ← Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-md">
              <p className="text-sm text-danger-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-success-500/10 border border-success-500/20 rounded-md">
              <p className="text-sm text-success-500">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Account Info */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-noir-text-primary mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-noir-text-secondary">Email</label>
                  <p className="text-noir-text-primary font-mono text-sm">{userData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-noir-text-secondary">Member Since</label>
                  <p className="text-noir-text-primary">
                    {new Date(userData.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Update Display Name */}
            <form onSubmit={handleUpdateProfile} className="border-b pb-6">
              <h2 className="text-lg font-semibold text-noir-text-primary mb-4">Display Name</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary placeholder:text-noir-text-muted focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                  placeholder="Your Name"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-noir-text-primary text-noir-bg rounded-md hover:bg-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>

            {/* Sign Out */}
            <div>
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 focus:outline-none focus:ring-1 focus:ring-danger-500/40 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
