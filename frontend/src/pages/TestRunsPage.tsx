import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { useTestRuns } from '../hooks/useTestRuns';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function TestRunsPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { testRuns, loading, error, refetch } = useTestRuns(100);
  const navigate = useNavigate();

  const filteredRuns = testRuns.filter(run => {
    const matchesSearch = run.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         run.id?.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || 
                         run.status === statusFilter ||
                         run.overall_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (startedAt?: string | null, completedAt?: string | null) => {
    if (!startedAt || !completedAt) return 'N/A';
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const duration = Math.round((end - start) / 1000);
    if (duration < 60) return `${duration}s`;
    return `${Math.floor(duration / 60)}m ${duration % 60}s`;
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
              <h1 className="text-3xl font-bold text-white">Test Runs</h1>
              <p className="text-gray-400 mt-1">View and manage all test executions</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="bg-noir-card border border-noir-border rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by URL or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary placeholder-noir-text-muted focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                >
                  <option value="all">All Status</option>
                  <option value="RUNNING">Running</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="QUEUED">Queued</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Runs Table */}
          <div className="bg-noir-card border border-noir-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">
                <div className="animate-spin w-8 h-8 border-2 border-noir-border border-t-running-500 rounded-full mx-auto mb-4"></div>
                Loading test runs...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-400">
                Error loading test runs: {error}
              </div>
            ) : filteredRuns.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No test runs found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-noir-bg border-b border-noir-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Browser
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Tests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-noir-border">
                    {filteredRuns.map((run) => (
                      <tr
                        key={run.id}
                        onClick={() => navigate(`/test/${run.id}`)}
                        className="hover:bg-noir-bg cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                          #{run.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                          {run.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge 
                            status={mapStatus(run.status, run.overall_status || undefined)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {run.browser}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDuration(run.started_at, run.completed_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(run.created_at!)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {run.passed_tests !== undefined && (
                              <span className="text-green-400">{run.passed_tests} ✓</span>
                            )}
                            {run.failed_tests !== undefined && run.failed_tests > 0 && (
                              <span className="text-red-400">{run.failed_tests} ✗</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredRuns.length > 0 && (
            <div className="text-sm text-gray-400 text-center">
              Showing {filteredRuns.length} of {testRuns.length} test runs
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function mapStatus(status: string, overallStatus?: string): 'passed' | 'failed' | 'in-progress' | 'pending' | 'cancelled' {
  if (status === 'RUNNING' || status === 'QUEUED') return 'in-progress';
  if (status === 'CANCELLED') return 'cancelled';
  if (status === 'FAILED' || overallStatus === 'FAILED') return 'failed';
  if (status === 'COMPLETED' && overallStatus !== 'FAILED') return 'passed';
  return 'pending';
}
