import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { PlusIcon, ClockIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

interface Schedule {
  id: number;
  name: string;
  suite: string;
  cron: string;
  nextRun: string;
  enabled: boolean;
  timezone: string;
}

const mockSchedules: Schedule[] = [
  {
    id: 1,
    name: 'Daily Smoke Tests',
    suite: 'Smoke Tests',
    cron: '0 9 * * *',
    nextRun: 'Tomorrow at 9:00 AM',
    enabled: true,
    timezone: 'UTC',
  },
  {
    id: 2,
    name: 'Weekly Regression',
    suite: 'Regression Suite',
    cron: '0 0 * * 0',
    nextRun: 'Sunday at 12:00 AM',
    enabled: true,
    timezone: 'UTC',
  },
  {
    id: 3,
    name: 'Hourly Health Check',
    suite: 'Smoke Tests',
    cron: '0 * * * *',
    nextRun: 'In 45 minutes',
    enabled: false,
    timezone: 'UTC',
  },
];

export function SchedulesPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);

  const toggleSchedule = (id: number) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
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
              <h1 className="text-3xl font-bold text-white">Schedules</h1>
              <p className="text-gray-400 mt-1">Automate test execution with cron schedules</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-noir-text-primary hover:bg-zinc-200 text-noir-bg rounded-md transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              New Schedule
            </button>
          </div>

          {/* Schedules List */}
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-noir-surface border border-noir-border rounded-lg p-6 hover:border-zinc-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      schedule.enabled 
                        ? 'bg-noir-elevated border border-noir-border' 
                        : 'bg-gray-600/10 border border-gray-600/20'
                    }`}>
                      <ClockIcon className={`w-6 h-6 ${schedule.enabled ? 'text-noir-text-primary' : 'text-gray-400'}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{schedule.name}</h3>
                        <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${
                          schedule.enabled 
                            ? 'bg-green-400/10 text-green-400 border-green-400/20' 
                            : 'bg-gray-400/10 text-gray-400 border-gray-400/20'
                        }`}>
                          {schedule.enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-6 text-gray-400">
                          <div>
                            <span className="text-gray-500">Suite:</span>
                            <span className="ml-2 text-noir-text-secondary font-mono">{schedule.suite}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cron:</span>
                            <span className="ml-2 font-mono">{schedule.cron}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Timezone:</span>
                            <span className="ml-2">{schedule.timezone}</span>
                          </div>
                        </div>
                        {schedule.enabled && (
                          <div className="text-gray-400">
                            <span className="text-gray-500">Next run:</span>
                            <span className="ml-2 text-white">{schedule.nextRun}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSchedule(schedule.id)}
                      className={`p-2.5 rounded-lg border transition-all ${
                        schedule.enabled
                          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                          : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                      }`}
                      title={schedule.enabled ? 'Pause schedule' : 'Enable schedule'}
                    >
                      {schedule.enabled ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <PlayIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {schedules.length === 0 && (
            <div className="bg-noir-card border-2 border-dashed border-noir-border rounded-lg p-12 text-center">
              <ClockIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No schedules yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first automated test schedule
              </p>
              <button className="px-4 py-2 bg-noir-text-primary hover:bg-zinc-200 text-noir-bg rounded-md transition-colors">
                Create Schedule
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
