import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { BetaNotice } from '../components/BetaNotice';
import { PhotoIcon, DocumentIcon, VideoCameraIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Artifact {
  id: number;
  name: string;
  type: 'screenshot' | 'trace' | 'video' | 'log';
  testRun: string;
  size: string;
  created: string;
}

const mockArtifacts: Artifact[] = [
  {
    id: 1,
    name: 'screenshot-form-validation.png',
    type: 'screenshot',
    testRun: 'Test Run #12',
    size: '245 KB',
    created: '2 hours ago',
  },
  {
    id: 2,
    name: 'trace-responsive-test.zip',
    type: 'trace',
    testRun: 'Test Run #11',
    size: '1.2 MB',
    created: '1 day ago',
  },
  {
    id: 3,
    name: 'screenshot-console-errors.png',
    type: 'screenshot',
    testRun: 'Test Run #15',
    size: '189 KB',
    created: '2 hours ago',
  },
  {
    id: 4,
    name: 'test-execution.log',
    type: 'log',
    testRun: 'Test Run #14',
    size: '42 KB',
    created: '3 hours ago',
  },
];

export function ArtifactsPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [artifacts] = useState<Artifact[]>(mockArtifacts);
  const [filter, setFilter] = useState<string>('all');

  const filteredArtifacts = artifacts.filter(
    a => filter === 'all' || a.type === filter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'screenshot':
        return <PhotoIcon className="w-6 h-6 text-noir-text-secondary" />;
      case 'trace':
        return <DocumentIcon className="w-6 h-6 text-noir-text-secondary" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6 text-noir-text-secondary" />;
      case 'log':
        return <DocumentIcon className="w-6 h-6 text-noir-text-secondary" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'screenshot':
        return 'bg-noir-elevated text-noir-text-secondary border-noir-border';
      case 'trace':
        return 'bg-noir-elevated text-noir-text-secondary border-noir-border';
      case 'video':
        return 'bg-noir-elevated text-noir-text-secondary border-noir-border';
      case 'log':
        return 'bg-noir-elevated text-noir-text-secondary border-noir-border';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const typeCount = (type: string) => 
    artifacts.filter(a => a.type === type).length;

  return (
    <div className="flex min-h-screen bg-noir-bg">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <DashboardHeader onMenuClick={() => setIsMobileOpen(true)} />
        
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Artifacts</h1>
              <p className="text-gray-400 mt-1">Screenshots, traces, videos, and logs</p>
            </div>
          </div>

          <BetaNotice surface="Artifact browsing" />

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-noir-text-primary text-noir-bg'
                  : 'bg-noir-surface border border-noir-border text-gray-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              All ({artifacts.length})
            </button>
            <button
              onClick={() => setFilter('screenshot')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'screenshot'
                  ? 'bg-noir-text-primary text-noir-bg'
                  : 'bg-noir-card border border-noir-border text-gray-400 hover:text-white hover:border-blue-500/50'
              }`}
            >
              Screenshots ({typeCount('screenshot')})
            </button>
            <button
              onClick={() => setFilter('trace')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'trace'
                  ? 'bg-noir-text-primary text-noir-bg'
                  : 'bg-noir-surface border border-noir-border text-gray-400 hover:text-white hover:border-zinc-500'
              }`}
            >
              Traces ({typeCount('trace')})
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'video'
                  ? 'bg-noir-text-primary text-noir-bg'
                  : 'bg-noir-card border border-noir-border text-gray-400 hover:text-white hover:border-red-500/50'
              }`}
            >
              Videos ({typeCount('video')})
            </button>
            <button
              onClick={() => setFilter('log')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'log'
                  ? 'bg-noir-text-primary text-noir-bg'
                  : 'bg-noir-card border border-noir-border text-gray-400 hover:text-white hover:border-green-500/50'
              }`}
            >
              Logs ({typeCount('log')})
            </button>
          </div>

          {/* Artifacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="bg-noir-surface border border-noir-border rounded-lg p-5 hover:border-zinc-500 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-noir-bg border border-noir-border rounded-lg flex items-center justify-center">
                    {getTypeIcon(artifact.type)}
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getTypeBadgeColor(artifact.type)}`}>
                    {artifact.type.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-2 truncate" title={artifact.name}>
                  {artifact.name}
                </h3>

                <div className="space-y-1 text-xs text-gray-400 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Test Run:</span>
                    <span className="text-noir-text-secondary font-mono">{artifact.testRun}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span>{artifact.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{artifact.created}</span>
                  </div>
                </div>

                <button disabled title="Available after beta" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-noir-bg border border-noir-border rounded-lg text-gray-300 transition-all text-sm disabled:cursor-not-allowed disabled:opacity-50">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredArtifacts.length === 0 && (
            <div className="bg-noir-card border-2 border-dashed border-noir-border rounded-lg p-12 text-center">
              <PhotoIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No artifacts found</h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'Run tests to generate artifacts'
                  : `No ${filter}s available`
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
