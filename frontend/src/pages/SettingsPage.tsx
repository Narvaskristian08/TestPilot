import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { 
  UserCircleIcon, 
  BellIcon, 
  KeyIcon, 
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export function SettingsPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  return (
    <div className="flex min-h-screen bg-noir-bg">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <DashboardHeader onMenuClick={() => setIsMobileOpen(true)} />
        
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-noir-card border border-noir-border rounded-lg p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-noir-elevated text-noir-text-primary border border-noir-border'
                        : 'text-gray-400 hover:bg-noir-bg hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-noir-card border border-noir-border rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Profile Settings</h2>
                    <p className="text-gray-400 text-sm">Manage your personal information</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Kristian Narvas"
                        className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue="knar.narvas@gmail.com"
                        className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        placeholder="Optional"
                        className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary placeholder-noir-text-muted focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                      />
                    </div>

                    <div className="pt-4">
                      <button className="px-6 py-2 bg-noir-text-primary hover:bg-zinc-200 text-noir-bg rounded-md transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-noir-card border border-noir-border rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                    <p className="text-gray-400 text-sm">Choose what notifications you receive</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { id: 'test-complete', label: 'Test Run Completed', description: 'Get notified when a test run finishes' },
                      { id: 'test-failed', label: 'Test Failures', description: 'Alert me when tests fail' },
                      { id: 'scheduled', label: 'Scheduled Tests', description: 'Notifications for scheduled test runs' },
                      { id: 'weekly-summary', label: 'Weekly Summary', description: 'Receive a weekly summary email' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-start justify-between py-3 border-b border-noir-border last:border-0">
                        <div className="flex-1">
                          <div className="text-white font-medium mb-1">{item.label}</div>
                          <div className="text-sm text-gray-400">{item.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-noir-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-noir-text-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-noir-text-primary after:border-noir-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-noir-text-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="bg-noir-card border border-noir-border rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">API Keys</h2>
                    <p className="text-gray-400 text-sm">Manage your API keys for programmatic access</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-noir-bg border border-noir-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Production API Key</span>
                        <span className="px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded-full">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-noir-card border border-noir-border rounded text-sm text-gray-400 font-mono">
                          noir_pk_••••••••••••••••••••••••4a3b
                        </code>
                        <button className="px-3 py-2 bg-noir-border hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors">
                          Copy
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Created 30 days ago • Last used 2 hours ago</div>
                    </div>

                    <button className="px-4 py-2 bg-noir-elevated border border-noir-border text-noir-text-primary hover:bg-noir-border rounded-md transition-colors">
                      Generate New API Key
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="bg-noir-card border border-noir-border rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Integrations</h2>
                    <p className="text-gray-400 text-sm">Connect third-party services</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Slack', status: 'connected', color: 'purple' },
                      { name: 'Discord', status: 'not-connected', color: 'blue' },
                      { name: 'GitHub', status: 'connected', color: 'gray' },
                      { name: 'Jira', status: 'not-connected', color: 'blue' },
                    ].map((integration) => (
                      <div key={integration.name} className="bg-noir-bg border border-noir-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-medium">{integration.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            integration.status === 'connected'
                              ? 'bg-green-400/10 text-green-400'
                              : 'bg-gray-400/10 text-gray-400'
                          }`}>
                            {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <button className={`w-full px-3 py-2 rounded text-sm transition-all ${
                          integration.status === 'connected'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-noir-elevated text-noir-text-primary hover:bg-noir-border'
                        }`}>
                          {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-noir-card border border-noir-border rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Security Settings</h2>
                    <p className="text-gray-400 text-sm">Manage your account security</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 bg-noir-secondary border border-noir-border rounded-md text-noir-text-primary focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40"
                      />
                    </div>

                    <div className="pt-4">
                      <button className="px-6 py-2 bg-noir-text-primary hover:bg-zinc-200 text-noir-bg rounded-md transition-colors">
                        Update Password
                      </button>
                    </div>

                    <div className="pt-6 border-t border-noir-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium mb-1">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-400">Add an extra layer of security</div>
                        </div>
                        <button className="px-4 py-2 bg-noir-elevated border border-noir-border text-noir-text-primary hover:bg-noir-border rounded-md transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
