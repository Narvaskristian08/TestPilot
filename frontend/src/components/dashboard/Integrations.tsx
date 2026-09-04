import type { ComponentType, SVGProps } from 'react';
import {
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CommandLineIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

type IntegrationIcon = ComponentType<SVGProps<SVGSVGElement>>;

export function Integrations() {
  const integrations: { name: string; icon: IntegrationIcon; color: string }[] = [
    { name: 'Slack', icon: ChatBubbleLeftRightIcon, color: 'hover:border-zinc-500' },
    { name: 'Discord', icon: HashtagIcon, color: 'hover:border-zinc-500' },
    { name: 'GitHub', icon: CodeBracketIcon, color: 'hover:border-zinc-500' },
    { name: 'CI/CD', icon: CommandLineIcon, color: 'hover:border-zinc-500' },
  ];

  return (
    <div className="bg-noir-surface border border-noir-border rounded-lg p-5">
      <h3 className="text-lg font-semibold text-noir-text-primary mb-4">
        Integrations
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {integrations.map((integration) => (
          <button
            key={integration.name}
            className={`flex flex-col items-center justify-center p-3 bg-noir-secondary hover:bg-noir-elevated border border-noir-border ${integration.color} rounded-md transition-colors duration-200`}
            title={integration.name}
          >
            <integration.icon aria-hidden="true" className="mb-2 h-6 w-6 text-noir-text-secondary" />
            <span className="text-xs text-noir-text-muted">{integration.name}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-noir-border">
        <h4 className="text-sm font-semibold text-noir-text-primary mb-2">
          Need help?
        </h4>
        <a
          href="#"
          className="text-sm text-noir-text-secondary hover:text-noir-text-primary transition-colors inline-flex items-center"
        >
          Check out our documentation
          <ArrowTopRightOnSquareIcon aria-hidden="true" className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
