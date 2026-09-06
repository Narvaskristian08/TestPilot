import {
  PlayIcon,
  FolderIcon,
  ChartBarIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

interface Action {
  name: string;
  icon: any;
  onClick: () => void;
}

interface QuickActionsProps {
  onNewTestRun: () => void;
  onManageSuites: () => void;
  onViewReports: () => void;
  onManageEnvironments: () => void;
}

export function QuickActions({
  onNewTestRun,
  onManageSuites,
  onViewReports,
  onManageEnvironments,
}: QuickActionsProps) {
  const actions: Action[] = [
    { name: 'New Test Run', icon: PlayIcon, onClick: onNewTestRun },
    { name: 'Manage Test Suites', icon: FolderIcon, onClick: onManageSuites },
    { name: 'View Reports', icon: ChartBarIcon, onClick: onViewReports },
    { name: 'Manage Environments', icon: ServerIcon, onClick: onManageEnvironments },
  ];

  return (
    <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
      <h3 className="text-lg font-semibold text-noir-text-primary mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.name}
            onClick={action.onClick}
            className="flex items-center px-3 py-2.5 text-sm font-medium text-noir-text-primary bg-noir-secondary hover:bg-noir-elevated border border-noir-border hover:border-zinc-500 rounded-md transition-colors duration-200"
          >
            <action.icon className="w-5 h-5 mr-3 text-noir-text-secondary" />
            {action.name}
          </button>
        ))}
      </div>
    </div>
  );
}
