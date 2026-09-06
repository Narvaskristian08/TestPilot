import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';

interface TestRun {
  id: number;
  name: string;
  suite: string;
  status: 'passed' | 'failed' | 'in-progress' | 'pending';
  environment: string;
  startedAt: string;
}

interface TestRunsTableProps {
  runs: TestRun[];
  onViewAll?: () => void;
}

export function TestRunsTable({ runs, onViewAll }: TestRunsTableProps) {
  return (
    <div className="bg-noir-surface border border-noir-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-noir-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-noir-text-primary">
          Recent Test Runs
        </h3>
        <button
          onClick={onViewAll}
          className="text-sm text-noir-text-secondary hover:text-noir-text-primary font-medium transition-colors"
        >
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-noir-border">
              <th className="px-5 py-3 text-left text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                Run Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                Suite
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                Environment
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                Started At
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-noir-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-noir-border">
            {runs.map((run) => (
              <tr
                key={run.id}
                className="hover:bg-noir-bg transition-colors"
              >
                <td className="px-5 py-3 whitespace-nowrap">
                  <Link
                    to={`/test/${run.id}`}
                    className="text-sm font-medium font-mono text-noir-text-primary hover:text-noir-text-secondary transition-colors"
                  >
                    {run.name}
                  </Link>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <span className="text-sm text-noir-text-secondary">
                    {run.suite}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <StatusBadge status={run.status} size="sm" />
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center text-sm text-noir-text-secondary">
                    <span className="mr-2 h-2 w-2 rounded-full bg-noir-text-muted" />
                    {run.environment}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-sm text-noir-text-secondary font-mono">
                  {run.startedAt}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <Link to={`/test/${run.id}`} title="Open test run" className="rounded p-1 text-noir-text-muted transition-colors hover:text-noir-text-primary">
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
