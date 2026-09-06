import { FormEvent, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ManagementModalProps {
  open: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export function ManagementModal({
  open,
  title,
  description,
  submitLabel,
  loading = false,
  error,
  onClose,
  onSubmit,
  children,
}: ManagementModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4" onMouseDown={onClose}>
      <div className="w-full max-w-lg border border-noir-border bg-noir-surface shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-noir-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-noir-text-primary">{title}</h2>
            {description && <p className="mt-1 text-sm text-noir-text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-noir-text-muted hover:text-noir-text-primary" aria-label="Close dialog">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 px-5 py-5">{children}</div>
          {error && <p className="border-t border-noir-border px-5 py-3 text-sm text-danger-500">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-noir-border px-5 py-4">
            <button type="button" onClick={onClose} className="rounded-md border border-noir-border px-3 py-2 text-sm text-noir-text-secondary hover:text-noir-text-primary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-noir-text-primary px-3 py-2 text-sm font-medium text-noir-bg disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-noir-text-muted">{label}</span>
      {children}
    </label>
  );
}

export const fieldClassName = 'w-full rounded-md border border-noir-border bg-noir-bg px-3 py-2 text-sm text-noir-text-primary outline-none placeholder:text-noir-text-muted focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40';
