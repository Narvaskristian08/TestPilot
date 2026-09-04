export function Integrations() {
  const integrations = [
    { name: 'Slack', icon: '💬', color: 'hover:border-zinc-500' },
    { name: 'Discord', icon: '🎮', color: 'hover:border-zinc-500' },
    { name: 'GitHub', icon: '🐙', color: 'hover:border-zinc-500' },
    { name: 'CI/CD', icon: '⚙️', color: 'hover:border-zinc-500' },
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
            <span className="text-2xl mb-2">{integration.icon}</span>
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
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
