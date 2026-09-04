import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  iconBgColor?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, iconBgColor = 'bg-noir-elevated' }: StatCardProps) {
  return (
    <div className="bg-noir-surface border border-noir-border rounded-lg p-5 hover:border-zinc-500 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-noir-text-muted uppercase tracking-wider mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-noir-text-primary mb-2">
            {value}
          </h3>
          <div className="flex items-center text-xs">
            {trend === 'up' && (
              <ArrowUpIcon className="w-3 h-3 mr-1 text-success-500" />
            )}
            {trend === 'down' && (
              <ArrowDownIcon className="w-3 h-3 mr-1 text-danger-500" />
            )}
            <span className={trend === 'up' ? 'text-success-500' : trend === 'down' ? 'text-danger-500' : 'text-noir-text-secondary'}>
              {subtitle}
            </span>
          </div>
        </div>
        <div className={`${iconBgColor} border border-noir-border rounded-md p-2.5`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
