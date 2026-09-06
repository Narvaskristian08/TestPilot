import { FormEvent, useEffect, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { Field, fieldClassName, ManagementModal } from '../components/ManagementModal';
import { apiClient } from '../services/api';
import { ManagedSuite } from '../types';
import { FolderIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) return String(error.message);
  return 'Something went wrong. Please try again.';
}

export function TestSuitesPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [suites, setSuites] = useState<ManagedSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedSuite | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadSuites = async () => {
    setLoading(true);
    try { setSuites(await apiClient.getSuites()); setPageError(''); }
    catch (error) { setPageError(errorMessage(error)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadSuites(); }, []);

  const openCreate = () => { setEditing(null); setName(''); setDescription(''); setModalError(''); setModalOpen(true); };
  const openEdit = (suite: ManagedSuite) => { setEditing(suite); setName(suite.name); setDescription(suite.description || ''); setModalError(''); setModalOpen(true); };
  const saveSuite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setModalError('');
    try { if (editing) await apiClient.updateSuite(editing.id, { name, description }); else await apiClient.createSuite({ name, description }); setModalOpen(false); await loadSuites(); }
    catch (error) { setModalError(errorMessage(error)); }
    finally { setSaving(false); }
  };
  const deleteSuite = async (suite: ManagedSuite) => {
    if (!window.confirm(`Delete “${suite.name}”? Its test cases will also be removed.`)) return;
    try { await apiClient.deleteSuite(suite.id); await loadSuites(); } catch (error) { setPageError(errorMessage(error)); }
  };

  return <div className="flex min-h-screen bg-noir-bg">
    <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    <main className="flex-1 lg:ml-64"><DashboardHeader onMenuClick={() => setIsMobileOpen(true)} /><div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-white">Test Suites</h1><p className="mt-1 text-gray-400">Organize test cases into logical groups.</p></div><button onClick={openCreate} className="flex items-center rounded-md bg-noir-text-primary px-4 py-2 text-sm font-medium text-noir-bg"><PlusIcon className="mr-2 h-5 w-5" />New Suite</button></div>
      {pageError && <div className="border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-400">{pageError}</div>}
      {loading ? <div className="py-16 text-center text-noir-text-muted">Loading suites…</div> : suites.length === 0 ? <div className="border border-dashed border-noir-border p-12 text-center"><FolderIcon className="mx-auto mb-4 h-10 w-10 text-noir-text-muted" /><h2 className="text-lg font-medium text-white">No suites yet</h2><p className="mt-2 text-sm text-noir-text-muted">Create a suite to start organizing your local test cases.</p><button onClick={openCreate} className="mt-5 rounded-md bg-noir-text-primary px-4 py-2 text-sm font-medium text-noir-bg">Create Suite</button></div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{suites.map((suite) => <div key={suite.id} className="border border-noir-border bg-noir-surface p-5 hover:border-zinc-500"><div className="mb-5 flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center border border-noir-border bg-noir-elevated"><FolderIcon className="h-5 w-5 text-noir-text-secondary" /></div><div className="flex gap-1"><button onClick={() => openEdit(suite)} className="p-2 text-noir-text-muted hover:text-noir-text-primary" aria-label={`Edit ${suite.name}`}><PencilIcon className="h-4 w-4" /></button><button onClick={() => void deleteSuite(suite)} className="p-2 text-noir-text-muted hover:text-danger-500" aria-label={`Delete ${suite.name}`}><TrashIcon className="h-4 w-4" /></button></div></div><h2 className="text-lg font-semibold text-white">{suite.name}</h2><p className="mt-2 min-h-10 text-sm text-noir-text-secondary">{suite.description || 'No description'}</p><div className="mt-5 border-t border-noir-border pt-3 text-xs text-noir-text-muted"><span className="font-mono text-noir-text-secondary">{suite.test_count || 0}</span> test cases</div></div>)}</div>}
    </div></main>
    <ManagementModal open={modalOpen} title={editing ? 'Edit suite' : 'Create suite'} submitLabel={editing ? 'Save changes' : 'Create suite'} loading={saving} error={modalError} onClose={() => setModalOpen(false)} onSubmit={saveSuite}><Field label="Name"><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} className={fieldClassName} placeholder="Smoke tests" /></Field><Field label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} className={`${fieldClassName} min-h-24`} placeholder="Critical checks for the local app" /></Field></ManagementModal>
  </div>;
}
