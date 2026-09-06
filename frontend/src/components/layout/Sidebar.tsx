import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  HomeIcon,
  PlayIcon,
  FolderIcon,
  DocumentTextIcon,
  ClockIcon,
  ServerIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Test Runs', href: '/test-runs', icon: PlayIcon },
  { name: 'Test Suites', href: '/test-suites', icon: FolderIcon },
  { name: 'Test Cases', href: '/test-cases', icon: DocumentTextIcon },
  { name: 'Schedules', href: '/schedules', icon: ClockIcon },
  { name: 'Environments', href: '/environments', icon: ServerIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Artifacts', href: '/artifacts', icon: ArchiveBoxIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [localProfile, setLocalProfile] = useState<{ displayName?: string; email?: string }>({});

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('noir-local-settings');
      setLocalProfile(stored ? JSON.parse(stored) as { displayName?: string; email?: string } : {});
    } catch {
      setLocalProfile({});
    }
  }, [user]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || localProfile.displayName || 'Local developer';
  const email = user?.email || localProfile.email || 'Guest workspace';

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 z-50 h-screen w-60 bg-noir-secondary border-r border-noir-border flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-2 rounded hover:bg-noir-border text-noir-text-secondary"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-5 border-b border-noir-border">
          <Link to="/dashboard" className="flex items-center space-x-3" onClick={handleLinkClick}>
            <div className="w-8 h-8 bg-noir-text-primary rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-noir-bg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-noir-text-primary tracking-tight">NOIR</div>
              <div className="text-xs text-noir-text-muted uppercase tracking-wider">QA Automation</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    isActive
                      ? 'bg-noir-elevated text-noir-text-primary border-l-2 border-noir-text-primary'
                      : 'text-noir-text-secondary hover:bg-noir-bg hover:text-noir-text-primary'
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Workspace */}
        <div className="p-4 border-t border-noir-border">
          <div className="mb-3 border border-noir-border bg-noir-bg p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-noir-text-muted">Workspace</div>
            <div className="mt-2 text-sm font-semibold text-white">Local development</div>
            <div className="mt-1 text-xs text-noir-text-secondary">Unlimited runs · SQLite data · local artifacts</div>
          </div>

          {/* User Profile */}
          <Link
            to="/settings"
            onClick={handleLinkClick}
            className="flex items-center px-3 py-2 rounded hover:bg-noir-bg transition-colors"
          >
            <div className="w-8 h-8 bg-noir-elevated border border-noir-border rounded-full flex items-center justify-center text-noir-text-primary text-sm font-semibold">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {displayName}
              </div>
              <div className="text-xs text-noir-text-muted truncate">
                {email}
              </div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
