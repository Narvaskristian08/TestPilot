import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { BetaNotice } from '../components/BetaNotice';
import { ChartBarIcon, ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface Report {
  id: number;
  title: string;
  period: string;
  generated: string;
  tests: number;
  passRate: number;
}

const mockReports: Report[] = [
  {
    id: 1,
    title: 'Weekly Summary Report',
    period: 'Dec 16-22, 2024',
    generated: '2 hours ago',
    tests: 156,
    passRate: 94.2,
  },
  {
    id: 2,
    title: 'Monthly Performance Report',
    period: 'December 2024',
    generated: '1 day ago',
    tests: 642,
    passRate: 91.8,
  },
  {
    id: 3,
    title: 'Sprint Regression Report',
    period: 'Sprint 24',
    generated: '3 days ago',
    tests: 89,
    passRate: 96.6,
  },
];

export function ReportsPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [reports] = useState<Report[]>(mockReports);

  const getPassRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-400';
    if (rate >= 80) return 'text-yellow-400';
    return 'text-red-400';
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
              <h1 className="text-3xl font-bold text-white">Reports</h1>
              <p className="text-gray-400 mt-1">View and download test reports</p>
            </div>
            <button disabled title="Available after beta" className="flex items-center px-4 py-2 bg-noir-text-primary text-noir-bg rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Generate Report
            </button>
          </div>

          <BetaNotice surface="Reports" />

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-noir-card border border-noir-border rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-2">Total Reports</div>
              <div className="text-3xl font-bold text-white">{reports.length}</div>
            </div>
            <div className="bg-noir-card border border-noir-border rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-2">Total Tests Analyzed</div>
              <div className="text-3xl font-bold text-white">
                {reports.reduce((sum, r) => sum + r.tests, 0)}
              </div>
            </div>
            <div className="bg-noir-card border border-noir-border rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-2">Average Pass Rate</div>
              <div className="text-3xl font-bold text-green-400">
                {(reports.reduce((sum, r) => sum + r.passRate, 0) / reports.length).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-noir-surface border border-noir-border rounded-lg p-6 hover:border-zinc-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-noir-elevated border border-noir-border rounded-md flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-noir-text-secondary" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Period</div>
                          <div className="text-gray-300 flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {report.period}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Tests Analyzed</div>
                          <div className="text-white font-semibold">{report.tests}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Pass Rate</div>
                          <div className={`font-semibold ${getPassRateColor(report.passRate)}`}>
                            {report.passRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Generated</div>
                          <div className="text-gray-300">{report.generated}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button disabled title="Available after beta" className="flex items-center gap-2 px-3 py-2 bg-noir-bg border border-noir-border rounded-lg text-gray-300 transition-all disabled:cursor-not-allowed disabled:opacity-50">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {reports.length === 0 && (
            <div className="bg-noir-card border-2 border-dashed border-noir-border rounded-lg p-12 text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No reports yet</h3>
              <p className="text-gray-400 mb-6">
                Generate your first report to see analytics
              </p>
              <button disabled title="Available after beta" className="px-4 py-2 bg-noir-text-primary text-noir-bg rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                Generate Report
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
