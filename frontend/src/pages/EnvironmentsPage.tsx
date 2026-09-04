import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { BetaNotice } from '../components/BetaNotice';
import { PlusIcon, ServerIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface Environment {
  id: number;
  name: string;
  url: string;
  type: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive';
  lastUsed?: string;
}

const mockEnvironments: Environment[] = [
  {
    id: 1,
    name: 'Production',
    url: 'https://example.com',
    type: 'production',
    status: 'active',
    lastUsed: '2 hours ago',
  },
  {
    id: 2,
    name: 'Staging',
    url: 'https://staging.example.com',
    type: 'staging',
    status: 'active',
    lastUsed: '1 day ago',
  },
  {
    id: 3,
    name: 'Development',
    url: 'http://localhost:3000',
    type: 'development',
    status: 'inactive',
    lastUsed: '3 days ago',
  },
];

export function EnvironmentsPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [environments] = useState<Environment[]>(mockEnvironments);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'production':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'staging':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'development':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-noir-bg">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <DashboardHeader onMenuClick={() => setIsMobileOpen(true)} />
        
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Environments</h1>
              <p className="text-gray-400 mt-1">Manage test environments and configurations</p>
            </div>
            <button disabled title="Available after beta" className="flex items-center px-4 py-2 bg-noir-text-primary text-noir-bg rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              <PlusIcon className="w-5 h-5 mr-2" />
              New Environment
            </button>
          </div>

          <BetaNotice surface="Environments" />

          {/* Environments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {environments.map((env) => (
              <div
                key={env.id}
                className="bg-noir-surface border border-noir-border rounded-lg p-6 hover:border-zinc-500 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                    env.status === 'active'
                      ? 'bg-noir-elevated border-noir-border'
                      : 'bg-gray-600/10 border-gray-600/20'
                  }`}>
                    <ServerIcon className={`w-6 h-6 ${
                      env.status === 'active' ? 'text-noir-text-primary' : 'text-gray-400'
                    }`} />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getTypeColor(env.type)}`}>
                    {env.type.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{env.name}</h3>
                
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                  <GlobeAltIcon className="w-4 h-4" />
                  <span className="truncate">{env.url}</span>
                </div>

                <div className="pt-4 border-t border-noir-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full ${
                      env.status === 'active'
                        ? 'bg-green-400/10 text-green-400'
                        : 'bg-gray-400/10 text-gray-400'
                    }`}>
                      {env.status === 'active' ? '● Active' : '● Inactive'}
                    </span>
                    {env.lastUsed && (
                      <span className="text-gray-500 text-xs">
                        Used {env.lastUsed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <div className="bg-noir-surface border-2 border-dashed border-noir-border rounded-lg p-6 hover:border-zinc-500 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[240px] group">
              <div className="w-12 h-12 bg-noir-elevated border border-noir-border rounded-md flex items-center justify-center mb-4 group-hover:bg-noir-border transition-colors">
                <PlusIcon className="w-6 h-6 text-noir-text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Add Environment</h3>
              <p className="text-sm text-gray-400 text-center">
                Configure a new test environment
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
