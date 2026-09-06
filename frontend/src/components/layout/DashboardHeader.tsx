import { BellIcon, PlusIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardHeaderProps {
  onNewTestRun?: () => void;
  onMenuClick?: () => void;
}

export function DashboardHeader({ onNewTestRun, onMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localDisplayName, setLocalDisplayName] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('noir-local-settings');
      const settings = stored ? JSON.parse(stored) as { displayName?: string } : null;
      setLocalDisplayName(settings?.displayName || '');
    } catch {
      setLocalDisplayName('');
    }
  }, [user]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || localDisplayName || 'Developer';

  return (
    <div className="bg-noir-secondary/95 border-b border-noir-border sticky top-0 z-30 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-noir-text-secondary hover:text-white hover:bg-noir-border rounded transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}
            
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-noir-text-primary mb-1 tracking-tight">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-xs lg:text-sm text-noir-text-secondary hidden sm:block">
                Here's what's happening with your tests today.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Notifications */}
            <button
              onClick={() => navigate('/settings?tab=notifications')}
              title="Open notification preferences"
              className="relative rounded p-2 text-noir-text-secondary transition-colors hover:bg-noir-border hover:text-white"
            >
              <BellIcon className="w-5 h-5" />
            </button>

            {/* New Test Run Button */}
            {onNewTestRun && (
              <button
                onClick={onNewTestRun}
                className="flex items-center px-3 lg:px-4 py-2 text-sm font-medium text-noir-bg bg-noir-text-primary hover:bg-zinc-200 rounded-md transition-colors"
              >
                <PlusIcon className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">New Test Run</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
