
interface ResultsData {
  total: number;
  passed: number;
  failed: number;
  inProgress: number;
  skipped: number;
}

interface ResultsChartProps {
  data: ResultsData;
}

export function ResultsChart({ data }: ResultsChartProps) {
  const { total, passed, failed, inProgress, skipped } = data;

  // Calculate percentages
  const passedPercent = total > 0 ? (passed / total) * 100 : 0;
  const failedPercent = total > 0 ? (failed / total) * 100 : 0;
  const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0;
  const skippedPercent = total > 0 ? (skipped / total) * 100 : 0;

  // Calculate stroke dasharray for donut chart
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  const passedDash = (passedPercent / 100) * circumference;
  const failedDash = (failedPercent / 100) * circumference;
  const inProgressDash = (inProgressPercent / 100) * circumference;

  return (
    <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-noir-text-primary">
          Test Results Overview
        </h3>
        <span className="text-sm text-noir-text-muted">Loaded runs</span>
      </div>

      {/* Donut Chart */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#1f1f28"
              strokeWidth="20"
            />
            
            {/* Passed */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth="20"
              strokeDasharray={`${passedDash} ${circumference}`}
              strokeLinecap="round"
            />
            
            {/* Failed */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={`${failedDash} ${circumference}`}
              strokeDashoffset={-passedDash}
              strokeLinecap="round"
            />
            
            {/* In Progress */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#eab308"
              strokeWidth="20"
              strokeDasharray={`${inProgressDash} ${circumference}`}
              strokeDashoffset={-(passedDash + failedDash)}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-noir-text-primary">{total}</div>
            <div className="text-sm text-noir-text-muted">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-success-500 mr-2" />
            <span className="text-sm text-noir-text-secondary">Passed</span>
          </div>
          <span className="text-sm font-semibold text-noir-text-primary">
            {passed} ({passedPercent.toFixed(1)}%)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-danger-500 mr-2" />
            <span className="text-sm text-noir-text-secondary">Failed</span>
          </div>
          <span className="text-sm font-semibold text-noir-text-primary">
            {failed} ({failedPercent.toFixed(1)}%)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-warning-500 mr-2" />
            <span className="text-sm text-noir-text-secondary">In Progress</span>
          </div>
          <span className="text-sm font-semibold text-noir-text-primary">
            {inProgress} ({inProgressPercent.toFixed(1)}%)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-noir-text-muted mr-2" />
            <span className="text-sm text-noir-text-secondary">Skipped</span>
          </div>
          <span className="text-sm font-semibold text-noir-text-primary">
            {skipped} ({skippedPercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      <button className="mt-6 w-full text-center text-sm text-noir-text-secondary hover:text-noir-text-primary font-medium transition-colors">
        View full report →
      </button>
    </div>
  );
}
