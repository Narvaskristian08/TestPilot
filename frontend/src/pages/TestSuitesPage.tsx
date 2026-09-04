import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { BetaNotice } from '../components/BetaNotice';
import { PlusIcon, FolderIcon, PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TestSuite {
  id: number;
  name: string;
  description: string;
  testCount: number;
  lastRun?: string;
  status: 'active' | 'inactive';
}

const mockSuites: TestSuite[] = [
  {
    id: 1,
    name: 'Smoke Tests',
    description: 'Quick validation of critical functionality',
    testCount: 8,
    lastRun: '2 hours ago',
    status: 'active',
  },
  {
    id: 2,
    name: 'Regression Suite',
    description: 'Comprehensive regression testing',
    testCount: 24,
    lastRun: '1 day ago',
    status: 'active',
  },
  {
    id: 3,
    name: 'E2E User Flows',
    description: 'End-to-end user journey testing',
    testCount: 12,
    lastRun: '3 days ago',
    status: 'active',
  },
];

export function TestSuitesPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [suites] = useState<TestSuite[]>(mockSuites);

  return (
    <div className="flex min-h-screen bg-noir-bg">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <DashboardHeader onMenuClick={() => setIsMobileOpen(true)} />
        
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Test Suites</h1>
              <p className="text-gray-400 mt-1">Organize tests into logical groups</p>
            </div>
            <button disabled title="Available after beta" className="flex items-center px-4 py-2 bg-noir-text-primary text-noir-bg rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              <PlusIcon className="w-5 h-5 mr-2" />
              New Suite
            </button>
          </div>

          <BetaNotice surface="Test suites" />

          {/* Suites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suites.map((suite) => (
              <div
                key={suite.id}
                className="bg-noir-surface border border-noir-border rounded-lg p-6 hover:border-zinc-500 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-noir-elevated border border-noir-border rounded-md flex items-center justify-center">
                    <FolderIcon className="w-6 h-6 text-noir-text-secondary" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button disabled title="Available after beta" className="p-2 rounded-lg text-gray-400 disabled:cursor-not-allowed disabled:opacity-50">
                      <PlayIcon className="w-4 h-4" />
                    </button>
                    <button disabled title="Available after beta" className="p-2 rounded-lg text-gray-400 disabled:cursor-not-allowed disabled:opacity-50">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button disabled title="Available after beta" className="p-2 rounded-lg text-red-400 disabled:cursor-not-allowed disabled:opacity-50">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{suite.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{suite.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-noir-border">
                  <div className="text-sm">
                    <span className="text-gray-400">{suite.testCount}</span>
                    <span className="text-gray-500 ml-1">tests</span>
                  </div>
                  {suite.lastRun && (
                    <div className="text-xs text-gray-500">
                      Last run {suite.lastRun}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <div className="bg-noir-surface border-2 border-dashed border-noir-border rounded-lg p-6 hover:border-zinc-500 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px] group">
              <div className="w-12 h-12 bg-noir-elevated border border-noir-border rounded-md flex items-center justify-center mb-4 group-hover:bg-noir-border transition-colors">
                <PlusIcon className="w-6 h-6 text-noir-text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Create New Suite</h3>
              <p className="text-sm text-gray-400 text-center">
                Group related tests together
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
