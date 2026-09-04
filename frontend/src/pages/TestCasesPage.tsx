import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { BetaNotice } from '../components/BetaNotice';
import { PlusIcon, MagnifyingGlassIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TestCase {
  id: number;
  name: string;
  type: string;
  description: string;
  suite: string;
  lastRun?: string;
  status: 'passed' | 'failed' | 'pending';
}

const mockTestCases: TestCase[] = [
  { id: 1, name: 'Page Availability Check', type: 'Availability', description: 'Verify page loads successfully', suite: 'Smoke Tests', lastRun: '2 hours ago', status: 'passed' },
  { id: 2, name: 'Form Validation', type: 'Functional', description: 'Test form input validation', suite: 'Regression Suite', lastRun: '2 hours ago', status: 'passed' },
  { id: 3, name: 'Button Interactions', type: 'UI', description: 'Verify all buttons are clickable', suite: 'Smoke Tests', lastRun: '1 day ago', status: 'failed' },
  { id: 4, name: 'Responsive Design', type: 'Visual', description: 'Test responsive breakpoints', suite: 'E2E User Flows', lastRun: '3 days ago', status: 'passed' },
  { id: 5, name: 'Console Errors', type: 'Performance', description: 'Check for console errors', suite: 'Smoke Tests', lastRun: '2 hours ago', status: 'passed' },
  { id: 6, name: 'Accessibility Compliance', type: 'Accessibility', description: 'WCAG 2.1 AA compliance check', suite: 'Regression Suite', status: 'pending' },
];

export function TestCasesPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [testCases] = useState<TestCase[]>(mockTestCases);

  const filteredCases = testCases.filter(tc => 
    tc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tc.suite.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Availability': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Functional': 'bg-noir-elevated text-noir-text-secondary border-noir-border',
      'UI': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'Visual': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Performance': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'Accessibility': 'bg-green-500/10 text-green-400 border-green-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
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
              <h1 className="text-3xl font-bold text-white">Test Cases</h1>
              <p className="text-gray-400 mt-1">Manage individual test cases</p>
            </div>
            <button disabled title="Available after beta" className="flex items-center px-4 py-2 bg-noir-text-primary text-noir-bg rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              <PlusIcon className="w-5 h-5 mr-2" />
              New Test Case
            </button>
          </div>

          <BetaNotice surface="Test cases" />

          {/* Search */}
          <div className="bg-noir-card border border-noir-border rounded-lg p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search test cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary placeholder-noir-text-muted focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
              />
            </div>
          </div>

          {/* Test Cases List */}
          <div className="space-y-3">
            {filteredCases.map((testCase) => (
              <div
                key={testCase.id}
                className="bg-noir-surface border border-noir-border rounded-lg p-5 hover:border-zinc-500 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{testCase.name}</h3>
                      <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getTypeColor(testCase.type)}`}>
                        {testCase.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{testCase.description}</p>
                  </div>
                  <div className={`px-3 py-1.5 text-xs font-medium border rounded-lg ${getStatusColor(testCase.status)}`}>
                    {testCase.status === 'passed' && <CheckCircleIcon className="w-4 h-4 inline mr-1" />}
                    {testCase.status === 'pending' && <ClockIcon className="w-4 h-4 inline mr-1" />}
                    {testCase.status.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400 pt-3 border-t border-noir-border">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Suite:</span>
                    <span className="text-noir-text-secondary font-mono">{testCase.suite}</span>
                  </div>
                  {testCase.lastRun && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Last run:</span>
                      <span>{testCase.lastRun}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No test cases found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
