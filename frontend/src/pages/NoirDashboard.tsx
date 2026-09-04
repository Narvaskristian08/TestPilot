import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { TestRunsTable } from '../components/dashboard/TestRunsTable';
import { ResultsChart } from '../components/dashboard/ResultsChart';
import { RecentFailures } from '../components/dashboard/RecentFailures';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Integrations } from '../components/dashboard/Integrations';
import { NewTestRunModal } from '../components/modals/NewTestRunModal';
import { useTestRuns } from '../hooks/useTestRuns';
import {
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function NoirDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedUrl = searchParams.get('target') || '';
  const [showNewTestModal, setShowNewTestModal] = useState(Boolean(requestedUrl));
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { testRuns, stats, loading, error } = useTestRuns(50);
  const navigate = useNavigate();

  const closeNewTestModal = () => {
    setShowNewTestModal(false);
    if (requestedUrl) {
      setSearchParams({}, { replace: true });
    }
  };

  // Transform test runs for table
  const recentRuns = testRuns.slice(0, 5).map(run => ({
    id: run.id!,
    name: `Test Run #${run.id}`,
    suite: 'Automated QA',
    status: mapStatus(run.status, run.overall_status || undefined),
    environment: 'Production',
    startedAt: formatDate(run.created_at!),
  }));

  // Get failed test runs
  const failures = testRuns
    .filter(run => run.overall_status === 'FAILED' || run.status === 'FAILED')
    .slice(0, 3)
    .map(run => ({
      id: run.id!,
      testName: `Test Run #${run.id}`,
      suite: 'Automated QA',
      environment: 'Production',
      browser: run.browser === 'chromium' ? 'Chrome 126' : run.browser,
      timestamp: formatDate(run.created_at!),
      error: run.error_message || 'Test execution failed',
    }));

  // Calculate results data
  const resultsData = {
    total: stats?.totalRuns || 0,
    passed: stats?.passed || 0,
    failed: stats?.failed || 0,
    inProgress: stats?.inProgress || 0,
    skipped: 0,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-noir-bg items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-noir-border border-t-running-500 mx-auto mb-4"></div>
          <p className="text-noir-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-noir-bg items-center justify-center">
        <div className="text-center">
          <p className="text-danger-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-noir-bg bg-noir-text-primary hover:bg-zinc-200 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-noir-bg">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <DashboardHeader 
          onNewTestRun={() => setShowNewTestModal(true)}
          onMenuClick={() => setIsMobileOpen(true)}
        />

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatCard
                title="Total Test Runs"
                value={stats?.totalRuns || 0}
                subtitle={`↑ ${stats?.trend.totalChange || 0}% vs last 7 days`}
                trend="up"
                icon={<ChartBarIcon className="w-5 h-5 text-noir-text-secondary" />}
                iconBgColor="bg-noir-elevated"
              />
              <StatCard
                title="Passed"
                value={stats?.passed || 0}
                subtitle={`${stats?.passRate.toFixed(1) || 0}% success rate`}
                icon={<CheckCircleIcon className="w-5 h-5 text-success-500" />}
                iconBgColor="bg-success-600"
              />
              <StatCard
                title="Failed"
                value={stats?.failed || 0}
                subtitle={`↑ ${stats?.failRate.toFixed(1) || 0}% failure rate`}
                trend="up"
                icon={<XCircleIcon className="w-5 h-5 text-danger-500" />}
                iconBgColor="bg-danger-600"
              />
              <StatCard
                title="In Progress"
                value={stats?.inProgress || 0}
                subtitle={`${stats?.inProgress || 0} currently running`}
                icon={<ClockIcon className="w-5 h-5 text-running-500" />}
                iconBgColor="bg-noir-elevated"
              />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Test Runs Table (spans 2 columns) */}
              <div className="lg:col-span-2 space-y-6">
                <TestRunsTable
                  runs={recentRuns}
                  onViewAll={() => navigate('/test-runs')}
                />
                
                {failures.length > 0 && (
                  <RecentFailures
                    failures={failures}
                    onViewAll={() => navigate('/test-runs?status=failed')}
                  />
                )}
              </div>

              {/* Right Column - Charts and Actions */}
              <div className="space-y-6">
                <ResultsChart data={resultsData} />
                
                <QuickActions
                  onNewTestRun={() => setShowNewTestModal(true)}
                  onUploadSuite={() => navigate('/test-suites')}
                  onViewReports={() => navigate('/reports')}
                  onManageEnvironments={() => navigate('/environments')}
                />
                
                <Integrations />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-8 py-4 border-t border-noir-border">
            <p className="text-xs text-center text-noir-text-muted">
              © 2026 NOIR QA Automation. All rights reserved.
            </p>
          </div>
      </main>

      {/* New Test Run Modal */}
      <NewTestRunModal
        isOpen={showNewTestModal}
        initialUrl={requestedUrl}
        onClose={closeNewTestModal}
      />
    </div>
  );
}

// Helper functions
function mapStatus(status: string, overallStatus?: string): 'passed' | 'failed' | 'in-progress' | 'pending' {
  if (status === 'RUNNING' || status === 'QUEUED') return 'in-progress';
  if (status === 'COMPLETED') {
    if (overallStatus === 'PASSED') return 'passed';
    if (overallStatus === 'FAILED') return 'failed';
    return 'passed';
  }
  if (status === 'FAILED') return 'failed';
  return 'pending';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}
