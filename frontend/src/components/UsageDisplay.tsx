import React from 'react';

interface UsageDisplayProps {
  used: number;
  limit: number;
  remaining: number;
  isGuest: boolean;
  resetsAt?: string;
  onCreateAccount?: () => void;
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({
  used,
  limit,
  remaining,
  isGuest,
  resetsAt,
  onCreateAccount,
}) => {
  if (!Number.isFinite(limit) || limit <= 0) {
    return (
      <div className="border border-noir-border bg-noir-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-noir-text-primary">Local usage</h3>
            <p className="mt-1 text-sm text-noir-text-muted">QA runs are unlimited in local mode.</p>
          </div>
          <span className="border border-noir-border bg-noir-elevated px-3 py-1 text-xs font-medium text-noir-text-secondary">Unlimited</span>
        </div>
        <p className="mt-4 font-mono text-2xl font-bold text-noir-text-primary">{used} runs completed</p>
      </div>
    );
  }

  const percentage = (used / limit) * 100;
  const isNearLimit = remaining <= 1;
  const isAtLimit = remaining === 0;

  return (
    <div className="bg-noir-surface rounded-lg border border-noir-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-noir-text-primary">
            {isGuest ? 'Guest Usage' : 'Daily QA Usage'}
          </h3>
          <p className="text-sm text-noir-text-muted mt-1">
            {isGuest ? 'Free trial runs' : 'Resets daily at midnight'}
          </p>
        </div>
        {isGuest && (
          <div className="bg-noir-elevated text-noir-text-secondary text-xs font-medium px-3 py-1 rounded-md border border-noir-border">
            Guest
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-noir-text-primary font-mono">
            {used} / {limit}
          </span>
          <span className={`text-sm font-medium ${isAtLimit ? 'text-danger-500' : isNearLimit ? 'text-warning-500' : 'text-noir-text-secondary'}`}>
            {remaining} {remaining === 1 ? 'run' : 'runs'} remaining
          </span>
        </div>
        <div className="w-full bg-noir-border rounded-full h-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isAtLimit
                ? 'bg-danger-500'
                : isNearLimit
                ? 'bg-warning-500'
                : 'bg-noir-text-secondary'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Reset Info or CTA */}
      {isAtLimit && isGuest ? (
        <div className="bg-noir-secondary border border-noir-border rounded-md p-4">
          <p className="text-sm text-noir-text-primary font-medium mb-3">
            You've used all {limit} free QA runs
          </p>
          {onCreateAccount && (
            <button
              onClick={onCreateAccount}
              className="w-full bg-noir-text-primary hover:bg-zinc-200 text-noir-bg font-medium py-2 px-4 rounded-md transition-colors"
            >
              Create Free Account
            </button>
          )}
        </div>
      ) : isAtLimit ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-900">
            Daily limit reached. Your usage will reset{' '}
            {resetsAt ? new Date(resetsAt).toLocaleDateString() : 'tomorrow'}.
          </p>
        </div>
      ) : resetsAt && !isGuest ? (
        <p className="text-sm text-noir-text-muted">
          Resets {new Date(resetsAt).toLocaleDateString()}
        </p>
      ) : null}
    </div>
  );
};
