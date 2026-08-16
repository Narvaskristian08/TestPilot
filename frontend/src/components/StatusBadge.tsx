import React from 'react';
import { TestRun, TestResult } from '../types';

interface StatusBadgeProps {
  status: TestRun['status'] | TestResult['status'];
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const statusConfig = {
    QUEUED: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: '⏳',
      label: 'Queued',
    },
    RUNNING: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: '🔄',
      label: 'Running',
    },
    COMPLETED: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: '✅',
      label: 'Completed',
    },
    FAILED: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: '❌',
      label: 'Failed',
    },
    CANCELLED: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: '⛔',
      label: 'Cancelled',
    },
    PASSED: {
      bg: 'bg-success-100',
      text: 'text-success-700',
      icon: '✓',
      label: 'Passed',
    },
    WARNING: {
      bg: 'bg-warning-100',
      text: 'text-warning-700',
      icon: '⚠',
      label: 'Warning',
    },
    SKIPPED: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: '⊘',
      label: 'Skipped',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.QUEUED;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
};
