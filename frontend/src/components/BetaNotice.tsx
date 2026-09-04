import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface BetaNoticeProps {
  surface: string;
}

export function BetaNotice({ surface }: BetaNoticeProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 border border-noir-border bg-noir-secondary px-4 py-3 text-sm"
    >
      <InformationCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-noir-text-secondary" />
      <div>
        <p className="font-medium text-noir-text-primary">{surface} is in beta preview</p>
        <p className="mt-1 text-noir-text-muted">
          This route remains available for navigation, but its actions are disabled until the underlying API is released.
        </p>
      </div>
    </div>
  );
}
