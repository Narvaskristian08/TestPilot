import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

interface Failure {
  id: number;
  testName: string;
  suite: string;
  environment: string;
  browser: string;
  timestamp: string;
  error: string;
}

interface RecentFailuresProps {
  failures: Failure[];
  onViewAll?: () => void;
}

export function RecentFailures({ failures, onViewAll }: RecentFailuresProps) {
  return (
    <div className="bg-noir-surface border border-noir-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-noir-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-noir-text-primary">
          Recent Failures
        </h3>
        <button
          onClick={onViewAll}
          className="text-sm text-noir-text-secondary hover:text-noir-text-primary font-medium transition-colors"
        >
          View all
        </button>
      </div>

      <div className="divide-y divide-noir-border">
        {failures.map((failure) => (
          <div
            key={failure.id}
            className="px-5 py-4 hover:bg-noir-secondary transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <ExclamationCircleIcon className="w-5 h-5 text-danger-500" />
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-noir-text-primary mb-1">
                      {failure.testName}
                    </h4>
                    <p className="text-xs text-noir-text-muted">
                      {failure.suite} • {failure.environment} • {failure.browser}
                    </p>
                  </div>
                  <span className="text-xs text-noir-text-muted whitespace-nowrap ml-4">
                    {failure.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-danger-400 font-mono mb-3 bg-noir-bg rounded p-2 border border-danger-500/20">
                  {failure.error}
                </p>
                
                <Link
                  to={`/test/${failure.id}`}
                  className="inline-flex items-center text-xs font-medium text-noir-text-secondary hover:text-noir-text-primary transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
