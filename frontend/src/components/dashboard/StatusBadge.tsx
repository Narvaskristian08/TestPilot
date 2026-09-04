interface StatusBadgeProps {
  status: 'passed' | 'failed' | 'in-progress' | 'pending' | 'cancelled';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  const statusConfig = {
    passed: {
      bg: 'bg-success-500/10',
      text: 'text-success-500',
      border: 'border-success-500/20',
      label: 'Passed',
    },
    failed: {
      bg: 'bg-danger-500/10',
      text: 'text-danger-500',
      border: 'border-danger-500/20',
      label: 'Failed',
    },
    'in-progress': {
      bg: 'bg-warning-500/10',
      text: 'text-warning-500',
      border: 'border-warning-500/20',
      label: 'In Progress',
    },
    pending: {
      bg: 'bg-noir-text-muted/10',
      text: 'text-noir-text-muted',
      border: 'border-noir-text-muted/20',
      label: 'Pending',
    },
    cancelled: {
      bg: 'bg-noir-text-muted/10',
      text: 'text-noir-text-muted',
      border: 'border-noir-text-muted/20',
      label: 'Cancelled',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.bg.replace('/10', '')}`} />
      {config.label}
    </span>
  );
}
